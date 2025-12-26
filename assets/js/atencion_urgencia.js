"use strict";

/* =========================================================
   DATA – Urgencia mensual
   ========================================================= */

var urgenciaMensual = [
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
   GRÁFICO
   ========================================================= */

var chartUrgencia = null;

function renderGrafico(data) {

  if (typeof Chart === "undefined") {
    console.error("Chart.js no está cargado.");
    return;
  }

  var meses = [];
  for (var i = 0; i < data.length; i++) {
    if (meses.indexOf(data[i].mes) === -1) {
      meses.push(data[i].mes);
    }
  }

  function sumar(campo) {
    var resultado = [];
    for (var m = 0; m < meses.length; m++) {
      var total = 0;
      for (var j = 0; j < data.length; j++) {
        if (data[j].mes === meses[m]) {
          total += data[j][campo];
        }
      }
      resultado.push(total);
    }
    return resultado;
  }

  var ctx = document.getElementById("grafico-urgencia");
  if (!ctx) return;

  if (chartUrgencia) {
    chartUrgencia.destroy();
  }

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

  var total = { demanda: 0, atendido: 0, abandono: 0 };

  for (var i = 0; i < data.length; i++) {
    total.demanda += data[i].demanda;
    total.atendido += data[i].atendido;
    total.abandono += data[i].abandono;
  }

  return {
    atendido: total.demanda
      ? ((total.atendido / total.demanda) * 100).toFixed(1)
      : "0.0",
    abandono: total.demanda
      ? ((total.abandono / total.demanda) * 100).toFixed(1)
      : "0.0"
  };
}

/* =========================================================
   FILTROS + INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  var filtroTipo = document.getElementById("filtro-tipo");
  var filtroPrestacion = document.getElementById("filtro-prestacion");
  var kpiAtendido = document.getElementById("kpi-atendido-anual");
  var kpiAbandono = document.getElementById("kpi-abandono-anual");

  function aplicarFiltros() {

    var data = urgenciaMensual.slice();

    if (filtroTipo && filtroTipo.value !== "Todos") {
      data = data.filter(function (d) {
        return d.tipo === filtroTipo.value;
      });
    }

    if (filtroPrestacion && filtroPrestacion.value !== "Todas") {
      data = data.filter(function (d) {
        return d.prestacion === filtroPrestacion.value;
      });
    }

    renderGrafico(data);

    var acumulado = calcularAcumulado(data);

    if (kpiAtendido) kpiAtendido.textContent = acumulado.atendido + "%";
    if (kpiAbandono) kpiAbandono.textContent = acumulado.abandono + "%";
  }

  aplicarFiltros();

  if (filtroTipo) filtroTipo.addEventListener("change", aplicarFiltros);
  if (filtroPrestacion) filtroPrestacion.addEventListener("change", aplicarFiltros);
});
