class InterfazUsuario {
  obtenerElementosDOM() {
    return {
      inputQuantum: document.getElementById('quantum'),
      btnProcesarTodos: document.getElementById('btn-procesar-todos'),
      btnToggleDatos: document.getElementById('btn-toggle-datos'),
      btnRestaurar: document.getElementById('btn-restaurar'),
      inputId: document.getElementById('input-id'),
      inputTi: document.getElementById('input-ti'),
      inputT: document.getElementById('input-t'),
      btnAgregar: document.getElementById('btn-agregar'),
      btnActualizar: document.getElementById('btn-actualizar'),
      btnEliminar: document.getElementById('btn-eliminar'),
      cuerpoTablaDatos: document.getElementById('cuerpo-tabla-datos')
    };
  }

  mostrarDatos(actividades) {
    const tabla = document.getElementById('tabla-datos');
    const cuerpo = document.getElementById('cuerpo-tabla-datos');
    const mensaje = document.querySelector('#contenedor-tabla-datos .no-data');
    const contenedor = document.getElementById('contenedor-tabla-datos');
    if (!tabla || !cuerpo) return;

    cuerpo.innerHTML = '';
    if (!actividades || actividades.length === 0) {
      tabla.style.display = 'none';
      if (mensaje) mensaje.style.display = 'block';
      if (contenedor) contenedor.style.display = 'none';
      return;
    }

    actividades.forEach(act => {
      const tr = document.createElement('tr');
      tr.dataset.actividad = act.actividad;
      tr.dataset.ti = act.ti;
      tr.dataset.t = act.t;
      tr.innerHTML = `<td>${act.actividad}</td><td>${act.ti}</td><td>${act.t}</td>`;
      cuerpo.appendChild(tr);
    });
    if (mensaje) mensaje.style.display = 'none';
    tabla.style.display = 'table';
    if (contenedor && contenedor.dataset.visible !== 'true') {
      contenedor.style.display = 'none';
    }
  }

  toggleDatos() {
    const contenedor = document.getElementById('contenedor-tabla-datos');
    if (!contenedor) return;
    const visible = contenedor.dataset.visible === 'true';
    contenedor.dataset.visible = visible ? 'false' : 'true';
    contenedor.style.display = visible ? 'none' : 'block';
  }

  mostrarError(texto) {
    const el = document.getElementById('mensaje-error');
    if (el) {
      el.textContent = texto;
      el.style.display = 'block';
    }
  }

  ocultarError() {
    const el = document.getElementById('mensaje-error');
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  mostrarSpinner(tipo) {
    const id = this.#spinnerId(tipo);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  }

  ocultarSpinner(tipo) {
    const id = this.#spinnerId(tipo);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  ocultarResultados(algoritmo) {
    const cont = document.querySelector(`#resultados-${algoritmo} .results-table`);
    if (cont) cont.style.display = 'none';
  }

  mostrarResultados(algoritmo, resultado, tiempoEjecucion, timestampInicio, timestampFin) {
    const tabla = document.getElementById(`tabla-${algoritmo}`);
    const cuerpo = document.getElementById(`cuerpo-tabla-${algoritmo}`);
    const cont = document.querySelector(`#resultados-${algoritmo} .results-table`);
    const infoTiempo = document.getElementById(`tiempo-${algoritmo}`);
    if (!tabla || !cuerpo) return;

    cuerpo.innerHTML = '';
    resultado.procesos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.actividad}</td>
        <td>${p.ti}</td>
        <td>${p.t}</td>
        <td>${p.tf}</td>
        <td>${p.T}</td>
        <td>${p.E}</td>
        <td>${p.I}</td>`;
      cuerpo.appendChild(tr);
    });

    if (cont) cont.style.display = 'block';
    if (infoTiempo) {
      const inicioTexto = timestampInicio ? ` | Inicio: ${this.#formatearHora(timestampInicio)}` : '';
      const finTexto = timestampFin ? ` | Fin: ${this.#formatearHora(timestampFin)}` : '';
      infoTiempo.textContent = `Tiempo de ejecución (ms): ${tiempoEjecucion.toFixed(2)}${inicioTexto}${finTexto}`;
    }
  }

  #formatearHora(fechaIso) {
    try {
      const d = new Date(fechaIso);
      const base = d.toLocaleTimeString('es-ES', { hour12: false });
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      return `${base}.${ms}`;
    } catch (e) {
      return fechaIso;
    }
  }

  mostrarComparacion(comparacion) {
    const tabla = document.getElementById('tabla-comparacion');
    const cuerpo = document.getElementById('cuerpo-tabla-comparacion');
    const cont = document.querySelector('#resultados-comparacion .comparison-table');
    const mejor = document.getElementById('contenedor-mejor-metodo');
    if (!tabla || !cuerpo) return;

    cuerpo.innerHTML = '';
    comparacion.algoritmos.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.nombre}</td>
        <td>${a.tiempoTotal}</td>
        <td>${a.promedioT}</td>
        <td>${a.promedioE}</td>
        <td>${a.promedioI}</td>`;
      cuerpo.appendChild(tr);
    });

    if (cont) cont.style.display = 'block';
    if (mejor) mejor.textContent = comparacion.mejorMetodo;
  }

  #spinnerId(tipo) {
    if (tipo === 'carga') return 'spinner-fifo';
    return `spinner-${tipo}`;
  }
}

export default InterfazUsuario;
