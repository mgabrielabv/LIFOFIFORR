import ManejadorArchivos from './componentes/ManejadorArchivos.js';
import Algoritmos from './componentes/Algoritmos.js';
import InterfazUsuario from './componentes/InterfazUsuario.js';
import ProcesadorDatos from './componentes/ProcesadorDatos.js';

// Inicializar componentes
const manejadorArchivos = new ManejadorArchivos();
const algoritmos = new Algoritmos();
const interfazUsuario = new InterfazUsuario();
const procesadorDatos = new ProcesadorDatos();

// Estado global
let actividades = [];
let quantum = 3;
let resultados = {
    fifo: null,
    lifo: null,
    rr: null
};

// Inicializar aplicación
async function inicializarAplicacion() {
    // Configurar eventos
    configurarEventos();
    // Cargar datos iniciales desde data.csv; si falla, usa ejemplo
    await cargarDatosIniciales();
}

// Configurar eventos
function configurarEventos() {
    const elementos = interfazUsuario.obtenerElementosDOM();

    if (elementos.inputQuantum) {
        elementos.inputQuantum.addEventListener('change', () => {
            quantum = parseInt(elementos.inputQuantum.value) || 3;
        });
    }
    if (elementos.btnProcesarTodos) elementos.btnProcesarTodos.addEventListener('click', procesarTodos);
    if (elementos.btnToggleDatos) elementos.btnToggleDatos.addEventListener('click', () => interfazUsuario.toggleDatos());
}

// Manejar selección de archivo
async function manejarSeleccionArchivo(e) {
    const archivo = e.target.files[0];
    if (archivo) {
        await cargarArchivoCSV(archivo);
    }
}

// Cargar archivo CSV
async function cargarArchivoCSV(archivo) {
    try {
        interfazUsuario.mostrarSpinner('carga');
        actividades = await manejadorArchivos.leerArchivoCSV(archivo);
        interfazUsuario.mostrarDatos(actividades);
        interfazUsuario.ocultarError();
    } catch (error) {
        interfazUsuario.mostrarError(error.message);
    } finally {
        interfazUsuario.ocultarSpinner('carga');
    }
}

// Cargar datos de ejemplo
function cargarDatosEjemplo() {
    try {
        actividades = manejadorArchivos.cargarDatosEjemplo();
        interfazUsuario.mostrarDatos(actividades);
        interfazUsuario.ocultarError();
    } catch (error) {
        console.error('Error al cargar datos de ejemplo:', error);
        interfazUsuario.mostrarError('No se pudo cargar datos de ejemplo.');
    }
}

// Cargar datos iniciales desde el CSV local
async function cargarDatosIniciales() {
    try {
        actividades = await manejadorArchivos.cargarCSVDesdeURL('data.csv');
        interfazUsuario.mostrarDatos(actividades);
        interfazUsuario.ocultarError();
        // Procesar automáticamente con los datos cargados
        await procesarTodos();
    } catch (error) {
        console.warn('No se pudo cargar data.csv, se usarán datos de ejemplo:', error.message);
        interfazUsuario.mostrarError('No se pudo leer data.csv. Abre la página desde http://localhost:8000/ para permitir la carga automática.');
        cargarDatosEjemplo();
        // Procesar también los datos de ejemplo para mostrar resultados
        await procesarTodos();
    }
}

// Procesar todos los algoritmos
async function procesarTodos() {
    if (!manejadorArchivos.validarDatos(actividades)) {
        interfazUsuario.mostrarError('No hay datos para procesar. Cargue un archivo CSV primero.');
        return;
    }
    
    await procesarAlgoritmo('fifo');
    await procesarAlgoritmo('lifo');
    await procesarAlgoritmo('rr');
}

// Procesar un algoritmo específico
async function procesarAlgoritmo(algoritmo) {
    if (!manejadorArchivos.validarDatos(actividades)) {
        interfazUsuario.mostrarError('No hay datos para procesar. Cargue un archivo CSV primero.');
        return;
    }
    
    try {
        interfazUsuario.mostrarSpinner(algoritmo);
        interfazUsuario.ocultarResultados(algoritmo);
        
        const inicio = performance.now();
        let resultado;
        
        switch(algoritmo) {
            case 'fifo':
                resultado = algoritmos.fifo([...actividades]);
                break;
            case 'lifo':
                resultado = algoritmos.lifo([...actividades]);
                break;
            case 'rr':
                resultado = algoritmos.roundRobin([...actividades], quantum);
                break;
        }
        
        const fin = performance.now();
        const tiempoEjecucion = fin - inicio;
        
        resultados[algoritmo] = resultado;
        
        // Mostrar resultados
        interfazUsuario.mostrarResultados(algoritmo, resultado, tiempoEjecucion);
        
        // Actualizar comparación si todos los algoritmos han sido ejecutados
        if (resultados.fifo && resultados.lifo && resultados.rr) {
            actualizarComparacion();
        }
    } catch (error) {
        interfazUsuario.mostrarError(`Error al procesar ${algoritmo}: ${error.message}`);
    } finally {
        interfazUsuario.ocultarSpinner(algoritmo);
    }
}

// Actualizar comparación
function actualizarComparacion() {
    const comparacion = procesadorDatos.compararAlgoritmos(resultados);
    interfazUsuario.mostrarComparacion(comparacion);
}

// Limpiar todo
function limpiarTodo() {
    actividades = [];
    resultados = {
        fifo: null,
        lifo: null,
        rr: null
    };
    
    manejadorArchivos.limpiarActividades();
    interfazUsuario.limpiarInterfaz();
    interfazUsuario.ocultarError();
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);