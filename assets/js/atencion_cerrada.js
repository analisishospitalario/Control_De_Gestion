"use strict";

/* =========================================================
   Atención Cerrada – JS blindado
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const datosCerrada = [
    { servicio: "Medicina", camas: 60, ocupacion: 88, estancia: 6.2 },
    { servicio: "Cirugía", camas: 45, ocupacion: 82, estancia: 5.1 },
    { servicio: "Pediatría", camas: 30, ocupacion: 75, estancia: 4.3 },
    { servicio: "UCI Adulto", camas: 12, ocupacion: 95, estancia: 9.8 },
    { servicio: "UTI", camas: 10, ocupacion: 90, estancia: 8.4 }
  ];

  let sumaOcupacion = 0;
  let sumaEstancia = 0;
  let totalCamas = 0;

  datosCerrada.forEach(s => {
    sumaOcupacion += s.ocupacion;
    sumaEstancia += s.estancia;
    totalCamas += s.camas;
  });

  const indiceOcupacional = Number((sumaOcupacion / datosCerrada.length).toFixed(1));
  const promedioEstancia = Number((sumaEstancia / datosCerrada.length).toFixed(1));
  const rotacionCamas = Number((totalCamas / datosCerrada.length).toFixed(1));
  const tasaEgresos = 92.4;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("kpi-ocupacion", indiceOcupacional);
  setText("kpi-estancia", promedioEstancia);
  setText("kpi-rotacion", rotacionCamas);
  setText("kpi-egresos", tasaEgresos);

  const tabla = document.getElementById("tabla-servicios");
  if (tabla) {
    datosCerrada.forEach(s => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${s.servicio}</td>
        <td>${s.camas}</td>
        <td>${s.ocupacion}%</td>
        <td>${s.estancia}</td>
        <td>${(100 / s.estancia).toFixed(1)}</td>
      `;
      tabla.appendChild(fila);
    });
  }

  applySemaphore(
    document.getElementById("kpi-ocupacion"),
    indiceOcupacional,
    { ok: 85, warn: 90 }
  );

  applySemaphore(
    document.getElementById("kpi-estancia"),
    promedioEstancia,
    { ok: 5, warn: 7 }
  );

});
