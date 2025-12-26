"use strict";

/* =========================================================
   Atención de Urgencia – JS blindado
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const datosUrgencia = [
    { categoria: "C1", atenciones: 45, espera: 5, hospitalizados: 38 },
    { categoria: "C2", atenciones: 120, espera: 15, hospitalizados: 65 },
    { categoria: "C3", atenciones: 280, espera: 40, hospitalizados: 72 },
    { categoria: "C4", atenciones: 360, espera: 75, hospitalizados: 30 },
    { categoria: "C5", atenciones: 210, espera: 110, hospitalizados: 8 }
  ];

  let totalAtenciones = 0;
  let totalHospitalizados = 0;
  let sumaTriage = 0;
  let sumaMedico = 0;

  datosUrgencia.forEach(c => {
    totalAtenciones += c.atenciones;
    totalHospitalizados += c.hospitalizados;
    sumaTriage += c.espera;
    sumaMedico += c.espera + 25;
  });

  const promTriage = Math.round(sumaTriage / datosUrgencia.length);
  const promMedico = Math.round(sumaMedico / datosUrgencia.length);
  const tasaHosp = Number(
    ((totalHospitalizados / totalAtenciones) * 100).toFixed(1)
  );

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("kpi-atenciones", totalAtenciones);
  setText("kpi-triage", promTriage);
  setText("kpi-medico", promMedico);
  setText("kpi-hospitalizacion", tasaHosp);

  const tabla = document.getElementById("tabla-urgencia");
  if (tabla) {
    datosUrgencia.forEach(c => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${c.categoria}</td>
        <td>${c.atenciones}</td>
        <td>${c.espera}</td>
        <td>${c.hospitalizados}</td>
      `;
      tabla.appendChild(fila);
    });
  }

  applySemaphore(
    document.getElementById("kpi-triage"),
    promTriage,
    { ok: 15, warn: 30 }
  );

  applySemaphore(
    document.getElementById("kpi-medico"),
    promMedico,
    { ok: 30, warn: 60 }
  );

});
