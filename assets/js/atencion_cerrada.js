document.addEventListener("DOMContentLoaded", () => {

  const selectorAnio = document.getElementById("anio");
  if (!selectorAnio) return;

  const selectorNivel = document.getElementById("nivel");
  const selectorMes = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  let dataActual = null;
  let dataComparar = null;

  // KPI BASE (SIEMPRE IGUALES)
  const KPI_BASE = [
    "Dias Cama Disponibles",
    "Dias Cama Ocupados",
    "Indice Ocupacional",
    "Promedio Días de Estada",
    "Numero de Egresos",
    "Egresos Fallecidos",
    "Letalidad"
  ];

  async function cargarJSON(anio) {
    try {
      const res = await fetch(`../data/atencion_cerrada/${anio}.json`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function cargarNiveles(data) {
    selectorNivel.innerHTML = "";
    data.niveles.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.codigo;
      opt.textContent = n.nombre;
      selectorNivel.appendChild(opt);
    });
  }

  function renderKPIs() {
    if (!dataActual) return;

    const nivel = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    if (!nivel) return;

    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.querySelector(".kpis");

    KPI_BASE.forEach(glosa => {
      const ind = nivel.indicadores.find(i => i.glosa === glosa);
      const valor = ind
        ? (selectorMes.value === "acumulado" ? ind.acumulado : ind.mensual?.[selectorMes.value])
        : null;

      const unidad = ind?.unidad ?? "";

      grid.innerHTML += `
        <div class="kpi-card">
          <h3>${glosa}</h3>
          <span>${valor ?? "—"} ${unidad}</span>
          <button class="btn btn-sm btn-outline-primary mt-2"
            onclick="mostrarGrafico('${glosa}')">
            Ver gráfico
          </button>
        </div>
      `;
    });

    renderTablaMensual();
    renderTablaComparativa();
  }

  function renderTablaMensual() {
    const tbody = document.querySelector("#tabla-mensual tbody");
    tbody.innerHTML = "";

    const nivel = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    if (!nivel) return;

    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

    KPI_BASE.forEach(glosa => {
      const ind = nivel.indicadores.find(i => i.glosa === glosa);
      let fila = `<tr><th>${glosa}</th>`;
      meses.forEach(m => {
        fila += `<td>${ind?.mensual?.[m] ?? "—"}</td>`;
      });
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  function renderTablaComparativa() {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    if (!dataComparar) return;

    const nivelA = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    const nivelB = dataComparar.niveles.find(n => n.codigo == selectorNivel.value);

    KPI_BASE.forEach(glosa => {
      const act = nivelA?.indicadores.find(i => i.glosa === glosa);
      const prev = nivelB?.indicadores.find(i => i.glosa === glosa);
      if (!act || !prev) return;

      const diff = act.acumulado - prev.acumulado;

      tbody.innerHTML += `
        <tr>
          <th>${glosa}</th>
          <td>${prev.acumulado}</td>
          <td>${act.acumulado}</td>
          <td>${diff.toFixed(2)}</td>
        </tr>
      `;
    });
  }

  window.mostrarGrafico = function(glosa) {
    alert(`Gráfico de ${glosa}`);
  };

  async function iniciar() {
    dataActual = await cargarJSON(selectorAnio.value);
    dataComparar = await cargarJSON(selectorAnio.value === "2025" ? "2024" : "2025");
    if (!dataActual) return;
    cargarNiveles(dataActual);
    renderKPIs();
  }

  selectorAnio.addEventListener("change", iniciar);
  selectorNivel.addEventListener("change", renderKPIs);
  selectorMes.addEventListener("change", renderKPIs);

  iniciar();
});
