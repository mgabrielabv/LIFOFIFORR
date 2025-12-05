// Implementación de algoritmos de planificación
class Algoritmos {
    
    // Algoritmo FIFO (First In, First Out)
    fifo(procesos) {
        // Ordenar por tiempo de llegada (ti)
        procesos.sort((a, b) => a.ti - b.ti);
        
        let tiempoActual = 0;
        const resultados = [];
        
        for (let i = 0; i < procesos.length; i++) {
            const proceso = procesos[i];
            
            // Si el proceso llega después del tiempo actual
            if (tiempoActual < proceso.ti) {
                tiempoActual = proceso.ti;
            }
            
            // Calcular tiempos
            const tf = tiempoActual + proceso.t;
            const T = tf - proceso.ti;
            const E = T - proceso.t;
            const I = proceso.t / T;
            
            resultados.push({
                ...proceso,
                tf: parseFloat(tf.toFixed(2)),
                T: parseFloat(T.toFixed(2)),
                E: parseFloat(E.toFixed(2)),
                I: parseFloat(I.toFixed(2))
            });
            
            tiempoActual = tf;
        }
        
        // Calcular promedios
        const promedioT = resultados.reduce((sum, p) => sum + p.T, 0) / resultados.length;
        const promedioE = resultados.reduce((sum, p) => sum + p.E, 0) / resultados.length;
        const promedioI = resultados.reduce((sum, p) => sum + p.I, 0) / resultados.length;
        const tiempoTotal = tiempoActual;
        
        return {
            procesos: resultados,
            promedios: {
                T: parseFloat(promedioT.toFixed(2)),
                E: parseFloat(promedioE.toFixed(2)),
                I: parseFloat(promedioI.toFixed(2))
            },
            tiempoTotal: parseFloat(tiempoTotal.toFixed(2))
        };
    }

    // Algoritmo LIFO (Last In, First Out)
    lifo(procesos) {
        // Para LIFO en planificación de CPU, procesamos en orden inverso de llegada
        // Pero primero ordenamos por tiempo de llegada para el cálculo
        const procesosOrdenados = [...procesos].sort((a, b) => a.ti - b.ti);
        const procesosInvertidos = [...procesosOrdenados].reverse();
        
        let tiempoActual = 0;
        const resultados = [];
        
        for (let i = 0; i < procesosInvertidos.length; i++) {
            const proceso = procesosInvertidos[i];
            
            // Si el proceso llega después del tiempo actual
            if (tiempoActual < proceso.ti) {
                tiempoActual = proceso.ti;
            }
            
            // Calcular tiempos
            const tf = tiempoActual + proceso.t;
            const T = tf - proceso.ti;
            const E = T - proceso.t;
            const I = proceso.t / T;
            
            resultados.push({
                ...proceso,
                tf: parseFloat(tf.toFixed(2)),
                T: parseFloat(T.toFixed(2)),
                E: parseFloat(E.toFixed(2)),
                I: parseFloat(I.toFixed(2))
            });
            
            tiempoActual = tf;
        }
        
        // Ordenar resultados por actividad para mostrar
        resultados.sort((a, b) => a.actividad.localeCompare(b.actividad));
        
        // Calcular promedios
        const promedioT = resultados.reduce((sum, p) => sum + p.T, 0) / resultados.length;
        const promedioE = resultados.reduce((sum, p) => sum + p.E, 0) / resultados.length;
        const promedioI = resultados.reduce((sum, p) => sum + p.I, 0) / resultados.length;
        const tiempoTotal = tiempoActual;
        
        return {
            procesos: resultados,
            promedios: {
                T: parseFloat(promedioT.toFixed(2)),
                E: parseFloat(promedioE.toFixed(2)),
                I: parseFloat(promedioI.toFixed(2))
            },
            tiempoTotal: parseFloat(tiempoTotal.toFixed(2))
        };
    }

    // Algoritmo Round Robin
    roundRobin(procesos, quantum) {
        // Ordenar por tiempo de llegada (ti)
        procesos.sort((a, b) => a.ti - b.ti);
        
        let tiempoActual = 0;
        const resultados = [];
        const cola = [];
        const tiempoRestante = {};
        const tiemposLlegada = {};
        
        // Inicializar estructuras
        procesos.forEach(p => {
            tiempoRestante[p.actividad] = p.t;
            tiemposLlegada[p.actividad] = p.ti;
            resultados.push({
                ...p,
                tf: 0,
                T: 0,
                E: 0,
                I: 0
            });
        });
        
        let indice = 0;
        let completados = 0;
        
        // Agregar procesos que hayan llegado al tiempo actual
        while (completados < procesos.length) {
            // Agregar procesos que hayan llegado
            while (indice < procesos.length && procesos[indice].ti <= tiempoActual) {
                cola.push(procesos[indice].actividad);
                indice++;
            }
            
            // Si la cola está vacía, avanzar el tiempo al siguiente proceso
            if (cola.length === 0) {
                if (indice < procesos.length) {
                    tiempoActual = procesos[indice].ti;
                    continue;
                } else {
                    break;
                }
            }
            
            // Tomar el primer proceso de la cola
            const actividadActual = cola.shift();
            const proceso = procesos.find(p => p.actividad === actividadActual);
            
            // Ejecutar proceso por quantum o hasta que termine
            const tiempoEjecucion = Math.min(quantum, tiempoRestante[actividadActual]);
            tiempoRestante[actividadActual] -= tiempoEjecucion;
            tiempoActual += tiempoEjecucion;
            
            // Agregar procesos que hayan llegado durante la ejecución
            while (indice < procesos.length && procesos[indice].ti <= tiempoActual) {
                cola.push(procesos[indice].actividad);
                indice++;
            }
            
            // Si el proceso no ha terminado, volver a agregarlo a la cola
            if (tiempoRestante[actividadActual] > 0) {
                cola.push(actividadActual);
            } else {
                // Proceso completado
                completados++;
                
                // Calcular métricas
                const tf = tiempoActual;
                const ti = tiemposLlegada[actividadActual];
                const t = proceso.t;
                const T = tf - ti;
                const E = T - t;
                const I = t / T;
                
                // Actualizar resultados
                const indiceResultado = resultados.findIndex(r => r.actividad === actividadActual);
                if (indiceResultado !== -1) {
                    resultados[indiceResultado].tf = parseFloat(tf.toFixed(2));
                    resultados[indiceResultado].T = parseFloat(T.toFixed(2));
                    resultados[indiceResultado].E = parseFloat(E.toFixed(2));
                    resultados[indiceResultado].I = parseFloat(I.toFixed(2));
                }
            }
        }
        
        // Calcular promedios
        const promedioT = resultados.reduce((sum, p) => sum + p.T, 0) / resultados.length;
        const promedioE = resultados.reduce((sum, p) => sum + p.E, 0) / resultados.length;
        const promedioI = resultados.reduce((sum, p) => sum + p.I, 0) / resultados.length;
        const tiempoTotal = tiempoActual;
        
        return {
            procesos: resultados,
            promedios: {
                T: parseFloat(promedioT.toFixed(2)),
                E: parseFloat(promedioE.toFixed(2)),
                I: parseFloat(promedioI.toFixed(2))
            },
            tiempoTotal: parseFloat(tiempoTotal.toFixed(2))
        };
    }
}

export default Algoritmos;