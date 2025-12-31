let chartMensual = null;

const indicadorSel = document.getElementById("indicadorMensual");
indicadorSel.addEventListener("change", renderTendenciaMensual);

function renderTendenciaMensual() {
  if (!dataBase) return;

  const idx = servicioSel.value;
  const nivel = dataBase.niveles[idx];
  const indicador = indicadorSel.value;

  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  const indServicio = nivel.indicadores.find(i => i.glosa === indicador);
  const serieServicio = meses.map(m => indServicio?.mensual?.[m] ?? null);

  const serieHospital = meses.map(m => {
    let suma = 0, cuenta = 0;
    dataBase.niveles.forEach(n => {
      const ind = n.indicadores.find(i => i.glosa === indicador);
      const val = ind?.mensual?.[m];
      if (typeof val === "number") {
        suma += val;
        cuenta++;
      }
    });
    return cuenta ? +(suma / cuenta).toFixed(2) : null;
  });

  if (chartMensual) chartMensual.destroy();

  chartMensual = new Chart(document.getElementById("graficoMensual"), {
    type: "line",
    data: {
      labels: meses.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
      datasets: [
        { label: nivel.nombre, data: serieServicio, tension: 0.3 },
        { label: "Promedio Hospital", data: serieHospital, borderDash: [6,4], tension: 0.3 }
      ]
    }
  });
}
