"use strict";

/* =========================================================
   Metas Sanitarias – Control de Gestión
   Hospital San Luis de Buin
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("filtrosMetas");
  const tablaBody = document.querySelector("#tablaMetas tbody");
  const resumen = document.getElementById("resumenMetas");

  // Validación defensiva
  if (!formulario || !tablaBody || !resumen) {
    console.warn("Metas Sanitarias: elementos HTML no encontrados.");
    return;
  }

  // Datos simulados
  const datosMetas = [
    {
      anio: 2025,
      meta: "Meta 1",
      indicador: "Cobertura EMPA",
      resultado: 78,
      esperado: 80
    },
    {
      anio: 2025,
      meta: "Meta 2",
      indicador: "Control DM2",
      resultado: 85,
      esperado: 82
    },
    {
      anio: 2025,
      meta: "Meta 3",
      indicador: "Vacunación Influenza",
      resultado: 91,
      esperado: 90
    }
  ];

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const anioEl = document.getElementById("anio");
    const metaEl = document.getElementById("meta");

    if (!anioEl || !metaEl) return;

    const anio = parseInt(anioEl.value);
    const metaSeleccionada = metaEl.value;

    const filtrados = datosMetas.filter(d => {
      if (metaSeleccionada === "todas") {
        return d.anio === anio;
      }
      return d.anio === anio && d.meta.endsWith(metaSeleccionada);
    });

    renderTabla(filtrados);
    renderResumen(filtrados);
  });

  function renderTabla(datos) {
    tablaBody.innerHTML = "";

    if (datos.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">
            Sin resultados para los filtros seleccionados
          </td>
        </tr>
      `;
      return;
    }

    datos.forEach(d => {
      const cumplimiento = ((d.resultado / d.esperado) * 100).toFixed(1);
      const cumple = d.resultado >= d.esperado;

      const badge = cumple
        ? `<span class="badge bg-success">Cumple</span>`
        : `<span class="badge bg-danger">No cumple</span>`;

      tablaBody.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${d.meta}</td>
          <td>${d.indicador}</td>
          <td>${d.resultado}%</td>
          <td>${d.esperado}%</td>
          <td>${cumplimiento}%</td>
          <td>${badge}</td>
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

    const cumplidas = datos.filter(d => d.resultado >= d.esperado).length;
    const porcentaje = Math.round((cumplidas / datos.length) * 100);

    resumen.textContent = `
      Para el período seleccionado se evaluaron ${datos.length} metas sanitarias,
      de las cuales ${cumplidas} cumplen el umbral esperado
      (${porcentaje}% de cumplimiento global).
    `;
  }

  // Carga inicial
  renderTabla(datosMetas);
  renderResumen(datosMetas);

});
