class ProcesadorDatos {

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
        
        let mejorMetodo = 'FIFO';
        let mayorI = resultados.fifo.promedios.I;
        
        if (resultados.lifo.promedios.I > mayorI) {
            mayorI = resultados.lifo.promedios.I;
            mejorMetodo = 'LIFO';
        }
        
        if (resultados.rr.promedios.I > mayorI) {
            mayorI = resultados.rr.promedios.I;
            mejorMetodo = 'Round Robin';
        }
        
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
            mejorMetodo: `Mejor método: ${mejorMetodo} (Mayor I promedio: ${mayorI})`
        };
    }

    estimarTiempoEjecucion(algoritmo, datos) {
        const tiemposBase = {
            fifo: 2,
            lifo: 2,
            rr: 5
        };
        
        const factorCantidad = Math.sqrt(datos.procesos.length) / 2;
        
        return Math.round(tiemposBase[algoritmo] * factorCantidad);
    }

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

    calcularPromedio(numeros) {
        const suma = numeros.reduce((a, b) => a + b, 0);
        return parseFloat((suma / numeros.length).toFixed(2));
    }

    calcularDesviacionEstandar(numeros) {
        const promedio = this.calcularPromedio(numeros);
        const diferenciasCuadradas = numeros.map(n => Math.pow(n - promedio, 2));
        const promedioDiferencias = this.calcularPromedio(diferenciasCuadradas);
        return parseFloat(Math.sqrt(promedioDiferencias).toFixed(2));
    }

    formatearNumero(numero, decimales = 2) {
        return parseFloat(numero.toFixed(decimales));
    }
}

export default ProcesadorDatos;