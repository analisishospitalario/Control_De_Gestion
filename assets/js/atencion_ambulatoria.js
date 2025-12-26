"use strict";

/* =========================================================
   Atención Ambulatoria – JS blindado
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const datosAmbulatoria = [
    { especialidad: "Medicina Interna", agendadas: 520, realizadas: 460 },
    { especialidad: "Pediatría", agendadas: 410, realizadas: 380 },
    { especialidad: "Traumatología", agendadas: 360, realizadas: 290 },
    { especialidad: "Ginecología", agendadas: 300, realizadas: 265 },
    { especialidad: "Psiquiatría", agendadas: 220, realizadas: 190 }
  ];

  let totalAgendadas = 0;
  let totalRealizadas = 0;

  datosAmbulatoria.forEach(d => {
    totalAgendadas += d.agendadas;
    totalRealizadas += d.realizadas;
  });

  const totalInasistencias = totalAgendadas - totalRealizadas;
  const porcentajeInasistencia = Number(
    ((totalInasistencias / totalAgendadas) * 100).toFixed(1)
  );
  const productividad = Number(
    ((totalRealizadas / totalAgendadas) * 100).toFixed(1)
  );
  const esperaPromedio = 38;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("kpi-consultas", totalRealizadas);
  setText("kpi-inasistencia", porcentajeInasistencia);
  setText("kpi-espera", esperaPromedio);
  setText("kpi-productividad", productividad);

  const tabla = document.getElementById("tabla-especialidades");
  if (tabla) {
    datosAmbulatoria.forEach(d => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${d.especialidad}</td>
        <td>${d.agendadas}</td>
        <td>${d.realizadas}</td>
        <td>${d.agendadas - d.realizadas}</td>
        <td>${((d.realizadas / d.agendadas) * 100).toFixed(1)}%</td>
      `;
      tabla.appendChild(fila);
    });
  }

  applySemaphore(
    document.getElementById("kpi-inasistencia"),
    porcentajeInasistencia,
    { ok: 10, warn: 20 }
  );

  applySemaphore(
    document.getElementById("kpi-productividad"),
    100 - productividad,
    { ok: 10, warn: 20 }
  );

});
