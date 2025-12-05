// Manejo de archivos CSV
class ManejadorArchivos {
    constructor() {
        this.actividades = [];
    }

    // Leer CSV desde una URL (por ejemplo, data.csv en la raíz)
    async cargarCSVDesdeURL(url) {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`No se pudo obtener ${url}: HTTP ${respuesta.status}`);
        }
        const texto = await respuesta.text();
        this.parsearCSV(texto);
        return this.actividades;
    }

    // Leer archivo CSV
    leerArchivoCSV(archivo) {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            
            lector.onload = (e) => {
                try {
                    const contenido = e.target.result;
                    this.parsearCSV(contenido);
                    resolve(this.actividades);
                } catch (error) {
                    reject(new Error(`Error al leer el archivo CSV: ${error.message}`));
                }
            };
            
            lector.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            lector.readAsText(archivo);
        });
    }

    // Parsear contenido CSV
    parsearCSV(contenido) {
        const lineas = contenido.split('\n');
        this.actividades = [];
        
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (linea === '' || linea.startsWith('#')) continue;
            
            const partes = linea.split(',');
            if (partes.length >= 3) {
                const actividad = partes[0].trim();
                const ti = parseFloat(partes[1].trim());
                const t = parseFloat(partes[2].trim());
                
                // Si es cabecera (ej. "label,x,y"), saltarla sin lanzar error
                if (isNaN(ti) || isNaN(t)) {
                    if (i === 0) continue;
                    throw new Error(`Línea ${i+1}: Los valores de tiempo deben ser números`);
                }
                
                this.actividades.push({ actividad, ti, t });
            }
        }
        
        if (this.actividades.length === 0) {
            throw new Error('No se encontraron datos válidos en el archivo CSV');
        }
        
        // Ordenar por tiempo inicial (ti)
        this.actividades.sort((a, b) => a.ti - b.ti);
        
        return this.actividades;
    }

    // Cargar datos de ejemplo
    cargarDatosEjemplo() {
        const ejemploCSV = `A,0,5
B,1,3
C,2,8
D,3,6
E,4,4
F,5,2`;
        
        this.parsearCSV(ejemploCSV);
        return this.actividades;
    }

    // Validar datos
    validarDatos(datos) {
        return datos && datos.length > 0;
    }

    // Obtener actividades
    obtenerActividades() {
        return this.actividades;
    }

    // Limpiar actividades
    limpiarActividades() {
        this.actividades = [];
    }
}

export default ManejadorArchivos;