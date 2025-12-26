"use strict";

/* =========================================================
   DATA – Urgencia mensual
   ========================================================= */

const urgenciaMensual = [
  { mes: "Enero", tipo: "Adulto", prestacion: "Medica", demanda: 3200, atendido: 2900, abandono: 300 },
  { mes: "Enero", tipo: "Pediatrica", prestacion: "Medica", demanda: 1800, atendido: 1650, abandono: 150 },
  { mes: "Enero", tipo: "Adulto", prestacion: "Gineco-Obstetra", demanda: 900, atendido: 870, abandono: 30 },
  { mes: "Enero", tipo: "Adulto", prestacion: "Matrona", demanda: 600, atendido: 580, abandono: 20 },

  { mes: "Febrero", tipo: "Adulto", prestacion: "Medica", demanda: 3000, atendido: 2700, abandono: 300 },
  { mes: "Febrero", tipo: "Pediatrica", prestacion: "Medica", demanda: 1600, atendido: 1450, abandono: 150 },
  { mes: "Febrero", tipo: "Adulto", prestacion: "Gineco-Obstetra", demanda: 850, atendido: 820, abandono: 30 },
  { mes: "Febrero", tipo: "Adulto", prestacion: "Matrona", demanda: 580, atendido: 560, abandono: 20 }
];

/* =========================================================
   GRÁFICO MENSUAL
   ========================================================= */

let chartUrgencia = null;

function renderGrafico(data) {

  const meses = [...new Set(data.map(d => d.mes))];

  const sumar = campo =>
    meses.map(m =>
      data.filter(d => d.mes === m)
          .reduce((acc, d) => acc + d[campo], 0)
    );

  const ctx = document.getElementById("grafico-urgencia");

  if (chartUrgencia) chartUrgencia.destroy();

  chartUrgencia = new Chart(ctx, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [
        { label: "Demanda", data: sumar("demanda") },
        { label: "Atendido", data: sumar("atendido") },
        { label: "Abandono", data: sumar("abandono") }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* =========================================================
   ACUMULADO ANUAL
   ========================================================= */

function calcularAcumulado(data) {
  const total = data.reduce(
    (acc, d) => {
      acc.demanda += d.demanda;
      acc.atendido += d.atendido;
      acc.abandono += d.abandono;
      return acc;
    },
    { demanda: 0, atendido: 0, abandono: 0 }
  );

  return {
    pctAtendido: total.demanda
      ? ((total.atendido / total.demanda) * 100).toFixed(1)
      : "0.0",
    pctAbandono: total.demanda
      ? ((total.abandono / total.demanda) * 100).toFixed(1)
      : "0.0"
  };
}

/* =========================================================
   FILTROS + KPIs
   ========================================================= */

function aplicarFiltros() {

  const tipo = document.getElementById("filtro-tipo").value;
  const prestacion = document.getElementById("filtro-prestacion").value;

  let data = urgenciaMensual;

  if (tipo !== "Todos") {
    data = data.filter(d => d.tipo === tipo);
  }

  if (prestacion !== "Todas") {
    data = data.filter(d => d.prestacion === prestacion);
  }

  renderGrafico(data);

  const acumulado = calcularAcumulado(data);

  document.getElementById("kpi-atendido-anual").textContent =
    acumulado.pctAtendido + "%";

  document.getElementById("kpi-abandono-anual").textContent =
    acumulado.pctAbandono + "%";
}

/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  aplicarFiltros();
  document.getElementById("filtro-tipo").addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-prestacion").addEventListener("change", aplicarFiltros);
});
