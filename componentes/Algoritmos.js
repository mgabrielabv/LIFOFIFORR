
class Algoritmos {
    fifo(procesos) {
        const datos = procesos.map(p => ({ ...p }));
        const completados = new Array(datos.length).fill(false);
        let clk = 0;
        let procesados = 0;
        const resultados = datos.map(p => ({ ...p, tf: 0, T: 0, E: 0, I: 0 }));

        while (procesados < datos.length) {
            let idx = -1;
            for (let i = 0; i < datos.length; i++) {
                if (!completados[i] && datos[i].ti <= clk) {
                    idx = i;
                    break;
                }
            }

            if (idx === -1) {
                let siguiente = Infinity;
                for (let i = 0; i < datos.length; i++) {
                    if (!completados[i] && datos[i].ti > clk) {
                        siguiente = Math.min(siguiente, datos[i].ti);
                    }
                }
                clk = siguiente;
                continue;
            }

            const p = datos[idx];
            const tf = clk + p.t;
            const T = tf - p.ti;
            const E = T - p.t;
            const I = p.t / T;

            resultados[idx] = { ...p, tf: +tf.toFixed(2), T: +T.toFixed(2), E: +E.toFixed(2), I: +I.toFixed(4) };
            clk = tf;
            completados[idx] = true;
            procesados++;
        }

        const promedioT = resultados.reduce((s, r) => s + r.T, 0) / resultados.length;
        const promedioE = resultados.reduce((s, r) => s + r.E, 0) / resultados.length;
        const promedioI = resultados.reduce((s, r) => s + r.I, 0) / resultados.length;

        return {
            procesos: resultados,
            promedios: {
                T: +promedioT.toFixed(2),
                E: +promedioE.toFixed(2),
                I: +promedioI.toFixed(4)
            },
            tiempoTotal: +clk.toFixed(2)
        };
    }

    lifo(procesos) {
        const datos = procesos.map(p => ({ ...p }));
        const completados = new Array(datos.length).fill(false);
        let clk = 0;
        let procesados = 0;
        const resultados = datos.map(p => ({ ...p, tf: 0, T: 0, E: 0, I: 0 }));

        while (procesados < datos.length) {
            let idx = -1;
            for (let i = datos.length - 1; i >= 0; i--) {
                if (!completados[i] && datos[i].ti <= clk) {
                    idx = i;
                    break;
                }
            }

            if (idx === -1) {
                let siguiente = Infinity;
                for (let i = 0; i < datos.length; i++) {
                    if (!completados[i] && datos[i].ti > clk) {
                        siguiente = Math.min(siguiente, datos[i].ti);
                    }
                }
                clk = siguiente;
                continue;
            }

            const p = datos[idx];
            const tf = clk + p.t;
            const T = tf - p.ti;
            const E = T - p.t;
            const I = p.t / T;

            resultados[idx] = { ...p, tf: +tf.toFixed(2), T: +T.toFixed(2), E: +E.toFixed(2), I: +I.toFixed(4) };
            clk = tf;
            completados[idx] = true;
            procesados++;
        }

        const promedioT = resultados.reduce((s, r) => s + r.T, 0) / resultados.length;
        const promedioE = resultados.reduce((s, r) => s + r.E, 0) / resultados.length;
        const promedioI = resultados.reduce((s, r) => s + r.I, 0) / resultados.length;

        return {
            procesos: resultados,
            promedios: {
                T: +promedioT.toFixed(2),
                E: +promedioE.toFixed(2),
                I: +promedioI.toFixed(4)
            },
            tiempoTotal: +clk.toFixed(2)
        };
    }

    roundRobin(procesos, quantum) {
        const datos = procesos.map(p => ({ ...p }));
        const restantes = datos.map(p => p.t);
        const resultados = datos.map(p => ({ ...p, tf: 0, T: 0, E: 0, I: 0 }));
        let clk = 0;
        let terminados = 0;

        if (datos.length > 0) {
            clk = Math.min(...datos.map(p => p.ti));
        }

        while (terminados < datos.length) {
            let ejecutado = false;

            for (let i = 0; i < datos.length; i++) {
                if (datos[i].ti <= clk && restantes[i] > 0) {
                    const ejecutar = Math.min(quantum, restantes[i]);
                    restantes[i] -= ejecutar;
                    clk += ejecutar;
                    ejecutado = true;

                    if (restantes[i] === 0) {
                        const tf = clk;
                        const T = tf - datos[i].ti;
                        const E = T - datos[i].t;
                        const I = datos[i].t / T;
                        resultados[i] = { ...datos[i], tf: +tf.toFixed(2), T: +T.toFixed(2), E: +E.toFixed(2), I: +I.toFixed(4) };
                        terminados++;
                    }
                }
            }

            if (!ejecutado) {

                let siguiente = Infinity;
                for (let i = 0; i < datos.length; i++) {
                    if (restantes[i] > 0) {
                        siguiente = Math.min(siguiente, datos[i].ti);
                    }
                }
                clk = Math.max(clk, siguiente);
            }
        }

        const promedioT = resultados.reduce((s, r) => s + r.T, 0) / resultados.length;
        const promedioE = resultados.reduce((s, r) => s + r.E, 0) / resultados.length;
        const promedioI = resultados.reduce((s, r) => s + r.I, 0) / resultados.length;

        return {
            procesos: resultados,
            promedios: {
                T: +promedioT.toFixed(2),
                E: +promedioE.toFixed(2),
                I: +promedioI.toFixed(4)
            },
            tiempoTotal: +clk.toFixed(2)
        };
    }
}

export default Algoritmos;