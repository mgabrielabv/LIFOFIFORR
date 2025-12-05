// Procesamiento y análisis de datos
class ProcesadorDatos {
    
    // Comparar algoritmos
    compararAlgoritmos(resultados) {
        const algoritmos = [
            {
                nombre: 'FIFO',
                datos: resultados.fifo,
                tiempoEjecucion: this.estimarTiempoEjecucion('fifo', resultados.fifo)
            },
            {
                nombre: 'LIFO',
                datos: resultados.lifo,
                tiempoEjecucion: this.estimarTiempoEjecucion('lifo', resultados.lifo)
            },
            {
                nombre: 'Round Robin',
                datos: resultados.rr,
                tiempoEjecucion: this.estimarTiempoEjecucion('rr', resultados.rr)
            }
        ];
        
        // Determinar el mejor método (menor tiempo de espera promedio E)
        let mejorMetodo = 'FIFO';
        let menorE = resultados.fifo.promedios.E;
        
        if (resultados.lifo.promedios.E < menorE) {
            menorE = resultados.lifo.promedios.E;
            mejorMetodo = 'LIFO';
        }
        
        if (resultados.rr.promedios.E < menorE) {
            menorE = resultados.rr.promedios.E;
            mejorMetodo = 'Round Robin';
        }
        
        // Formatear datos para la comparación
        const comparacion = algoritmos.map(algo => ({
            nombre: algo.nombre,
            tiempoTotal: algo.datos.tiempoTotal,
            promedioT: algo.datos.promedios.T,
            promedioE: algo.datos.promedios.E,
            promedioI: algo.datos.promedios.I,
            tiempoEjecucion: algo.tiempoEjecucion
        }));
        
        return {
            algoritmos: comparacion,
            mejorMetodo: `Mejor método: ${mejorMetodo} (Menor tiempo de espera promedio: ${menorE})`
        };
    }

    // Estimar tiempo de ejecución (simulación)
    estimarTiempoEjecucion(algoritmo, datos) {
        // Estos son tiempos estimados para demostración
        // En una aplicación real, estos se medirían realmente
        const tiemposBase = {
            fifo: 2,
            lifo: 2,
            rr: 5
        };
        
        // Ajustar según la cantidad de procesos
        const factorCantidad = Math.sqrt(datos.procesos.length) / 2;
        
        return Math.round(tiemposBase[algoritmo] * factorCantidad);
    }

    // Calcular estadísticas
    calcularEstadisticas(datos) {
        if (!datos || datos.length === 0) {
            return null;
        }
        
        const tiemposT = datos.map(d => d.T);
        const tiemposE = datos.map(d => d.E);
        const indicesI = datos.map(d => d.I);
        
        return {
            cantidad: datos.length,
            promedioT: this.calcularPromedio(tiemposT),
            promedioE: this.calcularPromedio(tiemposE),
            promedioI: this.calcularPromedio(indicesI),
            desviacionT: this.calcularDesviacionEstandar(tiemposT),
            desviacionE: this.calcularDesviacionEstandar(tiemposE),
            desviacionI: this.calcularDesviacionEstandar(indicesI)
        };
    }

    // Calcular promedio
    calcularPromedio(numeros) {
        const suma = numeros.reduce((a, b) => a + b, 0);
        return parseFloat((suma / numeros.length).toFixed(2));
    }

    // Calcular desviación estándar
    calcularDesviacionEstandar(numeros) {
        const promedio = this.calcularPromedio(numeros);
        const diferenciasCuadradas = numeros.map(n => Math.pow(n - promedio, 2));
        const promedioDiferencias = this.calcularPromedio(diferenciasCuadradas);
        return parseFloat(Math.sqrt(promedioDiferencias).toFixed(2));
    }

    // Formatear número
    formatearNumero(numero, decimales = 2) {
        return parseFloat(numero.toFixed(decimales));
    }
}

export default ProcesadorDatos;