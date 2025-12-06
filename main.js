import ManejadorArchivos from './componentes/ManejadorArchivos.js';
import Algoritmos from './componentes/Algoritmos.js';
import InterfazUsuario from './componentes/InterfazUsuario.js';
import ProcesadorDatos from './componentes/ProcesadorDatos.js';

const manejadorArchivos = new ManejadorArchivos();
const algoritmos = new Algoritmos();
const interfazUsuario = new InterfazUsuario();
const procesadorDatos = new ProcesadorDatos();

let actividades = [];
let actividadesBase = [];
let quantum = 4;
let resultados = {
    fifo: null,
    lifo: null,
    rr: null
};
let seleccionActual = null;

async function inicializarAplicacion() {
    configurarEventos();
    await cargarDatosIniciales();
}

function configurarEventos() {
    const elementos = interfazUsuario.obtenerElementosDOM();

    if (elementos.inputQuantum) {
        const onQuantumChange = async () => {
            const nuevo = parseInt(elementos.inputQuantum.value, 10);
            quantum = Number.isFinite(nuevo) && nuevo > 0 ? nuevo : 3;
            elementos.inputQuantum.value = quantum;
            if (manejadorArchivos.validarDatos(actividades)) {
                await procesarTodos();
            }
        };
        elementos.inputQuantum.addEventListener('change', onQuantumChange);
        elementos.inputQuantum.addEventListener('input', onQuantumChange);
    }
    if (elementos.btnProcesarTodos) elementos.btnProcesarTodos.addEventListener('click', procesarTodos);
    if (elementos.btnToggleDatos) elementos.btnToggleDatos.addEventListener('click', () => interfazUsuario.toggleDatos());
    if (elementos.btnRestaurar) elementos.btnRestaurar.addEventListener('click', restaurarDatosBase);
    if (elementos.btnLimpiar) elementos.btnLimpiar.addEventListener('click', limpiarTodo);

    if (elementos.btnAgregar) elementos.btnAgregar.addEventListener('click', agregarActividad);
    if (elementos.btnActualizar) elementos.btnActualizar.addEventListener('click', actualizarActividad);
    if (elementos.btnEliminar) elementos.btnEliminar.addEventListener('click', eliminarActividad);
    if (elementos.btnLimpiarForm) elementos.btnLimpiarForm.addEventListener('click', limpiarSeleccion);

    if (elementos.cuerpoTablaDatos) {
        elementos.cuerpoTablaDatos.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            if (!fila) return;
            const { actividad, ti, t } = fila.dataset;
            if (!actividad) return;
            seleccionActual = actividad;
            if (elementos.inputId) elementos.inputId.value = actividad;
            if (elementos.inputTi) elementos.inputTi.value = ti;
            if (elementos.inputT) elementos.inputT.value = t;
            marcarFilaSeleccionada(actividad);
        });
    }
}

function clonarActividades(lista) {
    return Array.isArray(lista) ? lista.map(a => ({ ...a })) : [];
}

function registrarBase(lista) {
    actividadesBase = clonarActividades(lista);
}

function marcarFilaSeleccionada(actividad) {
    const cuerpo = document.getElementById('cuerpo-tabla-datos');
    if (!cuerpo) return;
    [...cuerpo.querySelectorAll('tr')].forEach(tr => {
        if (tr.dataset.actividad === actividad) {
            tr.classList.add('selected');
        } else {
            tr.classList.remove('selected');
        }
    });
}

function limpiarSeleccion() {
    seleccionActual = null;
    const cuerpo = document.getElementById('cuerpo-tabla-datos');
    if (cuerpo) {
        [...cuerpo.querySelectorAll('tr')].forEach(tr => tr.classList.remove('selected'));
    }
    const elementos = interfazUsuario.obtenerElementosDOM();
    if (elementos.inputId) elementos.inputId.value = '';
    if (elementos.inputTi) elementos.inputTi.value = '';
    if (elementos.inputT) elementos.inputT.value = '';
}

function validarCamposFormulario() {
    const elementos = interfazUsuario.obtenerElementosDOM();
    const id = elementos.inputId?.value.trim();
    const ti = parseFloat(elementos.inputTi?.value);
    const t = parseFloat(elementos.inputT?.value);
    if (!id) {
        interfazUsuario.mostrarError('El id no puede estar vacío.');
        return null;
    }
    if (!Number.isFinite(ti) || ti < 0 || !Number.isFinite(t) || t <= 0) {
        interfazUsuario.mostrarError('ti debe ser >= 0 y t > 0.');
        return null;
    }
    interfazUsuario.ocultarError();
    return { actividad: id, ti, t };
}

async function agregarActividad() {
    const nuevo = validarCamposFormulario();
    if (!nuevo) return;
    actividades.push(nuevo);
    interfazUsuario.mostrarDatos(actividades);
    limpiarSeleccion();
    await procesarTodos();
}

async function actualizarActividad() {
    if (!seleccionActual) {
        interfazUsuario.mostrarError('Selecciona una fila para actualizar.');
        return;
    }
    const actualizado = validarCamposFormulario();
    if (!actualizado) return;
    const idx = actividades.findIndex(a => a.actividad === seleccionActual);
    if (idx === -1) {
        interfazUsuario.mostrarError('No se encontró la actividad seleccionada.');
        return;
    }
    actividades[idx] = actualizado;
    interfazUsuario.mostrarDatos(actividades);
    limpiarSeleccion();
    await procesarTodos();
}

async function eliminarActividad() {
    if (!seleccionActual) {
        interfazUsuario.mostrarError('Selecciona una fila para eliminar.');
        return;
    }
    actividades = actividades.filter(a => a.actividad !== seleccionActual);
    interfazUsuario.mostrarDatos(actividades);
    limpiarSeleccion();
    await procesarTodos();
}

async function manejarSeleccionArchivo(e) {
    const archivo = e.target.files?.[0];
    if (archivo) {
        await cargarArchivoCSV(archivo);
    }
}

async function cargarArchivoCSV(archivo) {
    try {
        interfazUsuario.mostrarSpinner('carga');
        actividades = await manejadorArchivos.leerArchivoCSV(archivo);
        registrarBase(actividades);
        interfazUsuario.mostrarDatos(actividades);
        interfazUsuario.ocultarError();
    } catch (error) {
        interfazUsuario.mostrarError(error.message);
    } finally {
        interfazUsuario.ocultarSpinner('carga');
    }
}

function cargarDatosEjemplo() {
    try {
        actividades = manejadorArchivos.cargarDatosEjemplo();
        registrarBase(actividades);
        interfazUsuario.mostrarDatos(actividades);
        interfazUsuario.ocultarError();
    } catch (error) {
        console.error('Error al cargar datos de ejemplo:', error);
        interfazUsuario.mostrarError('No se pudo cargar datos de ejemplo.');
    }
}

async function cargarDatosIniciales() {
    try {
        actividades = await manejadorArchivos.cargarCSVDesdeURL('data.csv');
        registrarBase(actividades);
        interfazUsuario.mostrarDatos(actividades);
        interfazUsuario.ocultarError();
        await procesarTodos();
    } catch (error) {
        console.warn('No se pudo cargar data.csv, se usar�n datos de ejemplo:', error.message);
        interfazUsuario.mostrarError('No se pudo leer data.csv. Abre la p�gina desde http://localhost:8000/ para permitir la carga autom�tica.');
        cargarDatosEjemplo();
        await procesarTodos();
    }
}

async function restaurarDatosBase() {
    if (!actividadesBase.length) {
        interfazUsuario.mostrarError('No hay datos base para restaurar. Carga un CSV primero.');
        return;
    }
    actividades = clonarActividades(actividadesBase);
    interfazUsuario.mostrarDatos(actividades);
    interfazUsuario.ocultarError();
    await procesarTodos();
}

async function procesarTodos() {
    if (!manejadorArchivos.validarDatos(actividades)) {
        interfazUsuario.mostrarError('No hay datos para procesar. Cargue un archivo CSV primero.');
        return;
    }
    resultados = { fifo: null, lifo: null, rr: null };
    await procesarAlgoritmo('fifo');
    await procesarAlgoritmo('lifo');
    await procesarAlgoritmo('rr');
}

async function procesarAlgoritmo(algoritmo) {
    if (!manejadorArchivos.validarDatos(actividades)) {
        interfazUsuario.mostrarError('No hay datos para procesar. Cargue un archivo CSV primero.');
        return;
    }

    try {
        interfazUsuario.mostrarSpinner(algoritmo);
        interfazUsuario.ocultarResultados(algoritmo);

        const inicioWall = new Date();
        const inicio = performance.now();
        let resultado;

        switch (algoritmo) {
            case 'fifo':
                resultado = algoritmos.fifo([...actividades]);
                break;
            case 'lifo':
                resultado = algoritmos.lifo([...actividades]);
                break;
            case 'rr':
                resultado = algoritmos.roundRobin([...actividades], quantum);
                break;
            default:
                throw new Error('Algoritmo no soportado');
        }

        const finWall = new Date();
        const fin = performance.now();
        const tiempoEjecucion = fin - inicio;
        const timestampInicio = inicioWall.toISOString();
        const timestampFin = finWall.toISOString();

        resultados[algoritmo] = resultado;
        interfazUsuario.mostrarResultados(algoritmo, resultado, tiempoEjecucion, timestampInicio, timestampFin);

        if (resultados.fifo && resultados.lifo && resultados.rr) {
            actualizarComparacion();
        }
    } catch (error) {
        interfazUsuario.mostrarError(`Error al procesar ${algoritmo}: ${error.message}`);
    } finally {
        interfazUsuario.ocultarSpinner(algoritmo);
    }
}

function actualizarComparacion() {
    const comparacion = procesadorDatos.compararAlgoritmos(resultados);
    interfazUsuario.mostrarComparacion(comparacion);
}

function limpiarTodo() {
    actividades = [];
    actividadesBase = [];
    resultados = { fifo: null, lifo: null, rr: null };

    manejadorArchivos.limpiarActividades();
    interfazUsuario.limpiarInterfaz();
    interfazUsuario.ocultarError();
}

document.addEventListener('DOMContentLoaded', inicializarAplicacion);
