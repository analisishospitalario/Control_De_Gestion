"use strict";

/* =========================================================
   Glosa IV – Control de Gestión
   Hospital San Luis de Buin
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("filtrosGlosa");
  const tablaBody = document.querySelector("#tablaGlosa tbody");
  const resumen = document.getElementById("resumenGlosa");

  // Validación defensiva
  if (!formulario || !tablaBody || !resumen) {
    console.warn("Glosa IV: elementos HTML no encontrados.");
    return;
  }

  const datosGlosa = [
    {
      anio: 2025,
      programa: "Urgencia",
      item: "Horas Médicas Extra",
      presupuesto: 120000000,
      ejecutado: 108000000
    },
    {
      anio: 2025,
      programa: "Ambulatorio",
      item: "Controles adicionales",
      presupuesto: 90000000,
      ejecutado: 94000000
    },
    {
      anio: 2025,
      programa: "Pabellón",
      item: "Intervenciones quirúrgicas",
      presupuesto: 150000000,
      ejecutado: 132000000
    },
    {
      anio: 2025,
      programa: "Atención Cerrada",
      item: "Camas críticas",
      presupuesto: 110000000,
      ejecutado: 98000000
    }
  ];

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const anioEl = document.getElementById("anio");
    const programaEl = document.getElementById("programa");

    if (!anioEl || !programaEl) return;

    const anio = parseInt(anioEl.value);
    const programa = programaEl.value;

    const filtrados = datosGlosa.filter(d => {
      if (programa === "todos") {
        return d.anio === anio;
      }
      return d.anio === anio &&
        d.programa.toLowerCase().includes(programa);
    });

    renderTabla(filtrados);
    renderResumen(filtrados);
  });

  function renderTabla(datos) {
    tablaBody.innerHTML = "";

    if (datos.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">
            No existen registros para los filtros seleccionados
          </td>
        </tr>
      `;
      return;
    }

    datos.forEach(d => {
      const porcentaje = ((d.ejecutado / d.presupuesto) * 100).toFixed(1);
      const desviacion = d.presupuesto - d.ejecutado;

      let estado = "Ejecución normal";
      let badge = "success";

      if (porcentaje < 95) {
        estado = "Subejecución";
        badge = "warning";
      } else if (porcentaje > 105) {
        estado = "Sobreejecución";
        badge = "danger";
      }

      tablaBody.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${d.programa}</td>
          <td>${d.item}</td>
          <td>$${d.presupuesto.toLocaleString("es-CL")}</td>
          <td>$${d.ejecutado.toLocaleString("es-CL")}</td>
          <td>${porcentaje}%</td>
          <td>$${desviacion.toLocaleString("es-CL")}</td>
          <td><span class="badge bg-${badge}">${estado}</span></td>
        </tr>
      `);
    });
  }

  function renderResumen(datos) {
    if (datos.length === 0) {
      resumen.textContent =
        "No hay información disponible para el período seleccionado.";
      return;
    }

    const totalPresupuesto = datos.reduce((a, d) => a + d.presupuesto, 0);
    const totalEjecutado = datos.reduce((a, d) => a + d.ejecutado, 0);
    const porcentajeGlobal =
      ((totalEjecutado / totalPresupuesto) * 100).toFixed(1);

    resumen.textContent = `
      Para el período analizado, la Glosa IV presenta un presupuesto total de
      $${totalPresupuesto.toLocaleString("es-CL")},
      con una ejecución acumulada de
      $${totalEjecutado.toLocaleString("es-CL")}
      (${porcentajeGlobal}% de ejecución global).
    `;
  }

  // Carga inicial
  renderTabla(datosGlosa);
  renderResumen(datosGlosa);

});
