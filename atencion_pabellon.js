"use strict";

/* =========================================================
   Atención de Pabellón – JS blindado
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const datosPabellon = [
    { especialidad: "Cirugía General", programadas: 120, realizadas: 102 },
    { especialidad: "Traumatología", programadas: 95, realizadas: 80 },
    { especialidad: "Ginecología", programadas: 70, realizadas: 63 },
    { especialidad: "Urología", programadas: 55, realizadas: 48 },
    { especialidad: "Oftalmología", programadas: 60, realizadas: 54 }
  ];

  let totalProgramadas = 0;
  let totalRealizadas = 0;

  datosPabellon.forEach(p => {
    totalProgramadas += p.programadas;
    totalRealizadas += p.realizadas;
  });

  const porcentajeSuspensiones = Number(
    (((totalProgramadas - totalRealizadas) / totalProgramadas) * 100).toFixed(1)
  );
  const cumplimientoProgramacion = Number(
    ((totalRealizadas / totalProgramadas) * 100).toFixed(1)
  );
  const usoPabellon = 78.6;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("kpi-uso", usoPabellon);
  setText("kpi-realizadas", totalRealizadas);
  setText("kpi-suspensiones", porcentajeSuspensiones);
  setText("kpi-cumplimiento", cumplimientoProgramacion);

  const tabla = document.getElementById("tabla-pabellon");
  if (tabla) {
    datosPabellon.forEach(p => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.especialidad}</td>
        <td>${p.programadas}</td>
        <td>${p.realizadas}</td>
        <td>${p.programadas - p.realizadas}</td>
        <td>${((p.realizadas / p.programadas) * 100).toFixed(1)}%</td>
      `;
      tabla.appendChild(fila);
    });
  }

  applySemaphore(
    document.getElementById("kpi-suspensiones"),
    porcentajeSuspensiones,
    { ok: 10, warn: 20 }
  );

  applySemaphore(
    document.getElementById("kpi-uso"),
    100 - usoPabellon,
    { ok: 10, warn: 20 }
  );

});
