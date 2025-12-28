document.addEventListener("DOMContentLoaded", () => {

  const anio = document.getElementById("anio");
  if (!anio) return;

  const nivelSel = document.getElementById("nivel");
  const mesSel = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  let dataActual = null;
  let dataComparar = null;

  // KPIs UNIFICADOS (SIEMPRE IGUALES)
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
    const res = await fetch(`../data/atencion_cerrada/${anio}.json`);
    if (!res.ok) return null;
    return await res.json();
  }

  function cargarNiveles(data) {
    nivelSel.innerHTML = "";
    data.niveles.forEach(n => {
      const o = document.createElement("option");
      o.value = n.codigo;
      o.textContent = n.nombre;
      nivelSel.appendChild(o);
    });
  }

  function renderKPIs() {
    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    if (!nivel) return;

    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.querySelector(".kpis");

    KPI_BASE.forEach(glosa => {
      const ind = nivel.indicadores.find(i => i.glosa === glosa);
      const valor = ind
        ? (mesSel.value === "acumulado" ? ind.acumulado : ind.mensual?.[mesSel.value])
        : null;

      const unidad = ind?.unidad ?? "";

      grid.innerHTML += `
        <div class="kpi-card">
          <h3>${glosa}</h3>
          <span>${valor ?? "—"} ${unidad}</span>
        </div>
      `;
    });

    renderTablaMensual();
    renderTablaComparativa();
  }

  function renderTablaMensual() {
    const tbody = document.querySelector("#tabla-mensual tbody");
    tbody.innerHTML = "";

    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

    KPI_BASE.forEach(glosa => {
      const ind = nivel.indicadores.find(i => i.glosa === glosa);
      let fila = `<tr><th>${glosa}</th>`;
      meses.forEach(m => fila += `<td>${ind?.mensual?.[m] ?? "—"}</td>`);
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  function renderTablaComparativa() {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    const nivelA = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    const nivelB = dataComparar.niveles.find(n => n.codigo == nivelSel.value);

    KPI_BASE.forEach(glosa => {
      const a = nivelA.indicadores.find(i => i.glosa === glosa);
      const b = nivelB.indicadores.find(i => i.glosa === glosa);
      if (!a || !b) return;

      tbody.innerHTML += `
        <tr>
          <th>${glosa}</th>
          <td>${b.acumulado}</td>
          <td>${a.acumulado}</td>
          <td>${(a.acumulado - b.acumulado).toFixed(2)}</td>
        </tr>
      `;
    });
  }

  async function iniciar() {
    dataActual = await cargarJSON(anio.value);
    dataComparar = await cargarJSON(anio.value === "2025" ? "2024" : "2025");
    if (!dataActual) return;
    cargarNiveles(dataActual);
    renderKPIs();
  }

  anio.addEventListener("change", iniciar);
  nivelSel.addEventListener("change", renderKPIs);
  mesSel.addEventListener("change", renderKPIs);

  iniciar();
});
