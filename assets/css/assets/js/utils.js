"use strict";

/* =========================================================
   Utilidades comunes – Control de Gestión
   Hospital San Luis de Buin
   ========================================================= */

/* =========================================================
   Semáforos de Control de Gestión
   ========================================================= */
function applySemaphore(el, value, thresholds) {
  if (!el || isNaN(value)) return;

  // Limpia estados previos
  el.classList.remove("kpi-ok", "kpi-warn", "kpi-bad");

  // Busca o crea etiqueta de estado
  let label = el.nextElementSibling;
  if (!label || !label.classList.contains("kpi-label")) {
    label = document.createElement("span");
    label.className = "kpi-label";
    el.after(label);
  }

  // Evaluación según umbrales
  if (value <= thresholds.ok) {
    el.classList.add("kpi-ok");
    label.textContent = "OK";
    label.className = "kpi-label ok";
  } else if (value <= thresholds.warn) {
    el.classList.add("kpi-warn");
    label.textContent = "Atención";
    label.className = "kpi-label warn";
  } else {
    el.classList.add("kpi-bad");
    label.textContent = "Crítico";
    label.className = "kpi-label bad";
  }
}

/* =========================================================
   Activación global de tooltips Bootstrap
   (se ejecuta en index y en todos los módulos)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  // Verificación defensiva: Bootstrap cargado
  if (typeof bootstrap === "undefined") {
    console.warn(
      "Bootstrap no está disponible. Los tooltips no se inicializaron."
    );
    return;
  }

  const tooltipElements = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );

  tooltipElements.forEach(element => {
    new bootstrap.Tooltip(element);
  });

});
