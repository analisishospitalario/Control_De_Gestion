document.addEventListener("DOMContentLoaded", () => {

  const anio = document.getElementById("anio");
  const nivelSel = document.getElementById("nivel");
  const mesSel = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  let dataActual = null;
  let dataPrevio = null;
  let chart = null;

  async function cargarJSON(a) {
    const res = await fetch(`../data/atencion_cerrada/${a}.json`);
    return res.ok ? res.json() : null;
  }

  function cargarNiveles(data) {
    nivelSel.innerHTML = "";
    data.niveles.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.codigo;
      opt.textContent = n.nombre;
      nivelSel.appendChild(opt);
    });
  }

  function renderKPIs() {
    contenedor.innerHTML = `<div class="row g-3"></div>`;
    const grid = contenedor.firstElementChild;

    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    if (!nivel) return;

    nivel.indicadores.forEach(ind => {
      const valor = mesSel.value === "acumulado"
        ? ind.acumulado
        : ind.mensual?.[mesSel.value] ?? "—";

      grid.innerHTML += `
        <div class="col-md-3">
          <div class="card h-100 shadow-sm text-center p-3">
            <small class="text-muted">${ind.glosa}</small>
            <h3 class="fw-bold my-2">${valor} ${ind.unidad ?? ""}</h3>
            <button class="btn btn-sm btn-outline-primary"
              onclick="mostrarGrafico('${ind.glosa}')">
              Ver gráfico
            </button>
          </div>
        </div>
      `;
    });

    renderTablaMensual(nivel);
    renderComparativa(nivel);
  }

  function renderTablaMensual(nivel) {
    const tbody = document.querySelector("#tabla-mensual tbody");
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    tbody.innerHTML = "";

    nivel.indicadores.forEach(ind => {
      let fila = `<tr><th>${ind.glosa}</th>`;
      meses.forEach(m => fila += `<td>${ind.mensual?.[m] ?? "—"}</td>`);
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  function renderComparativa(nivel) {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    const nivelPrev = dataPrevio?.niveles.find(n => n.codigo == nivel.codigo);
    if (!nivelPrev) return;

    nivel.indicadores.forEach(ind => {
      const prev = nivelPrev.indicadores.find(i => i.glosa === ind.glosa);
      if (!prev) return;

      const diff = (ind.acumulado ?? 0) - (prev.acumulado ?? 0);

      tbody.innerHTML += `
        <tr>
          <th>${ind.glosa}</th>
          <td>${prev.acumulado}</td>
          <td>${ind.acumulado}</td>
          <td>${diff.toFixed(2)}</td>
        </tr>
      `;
    });
  }

  window.mostrarGrafico = function (glosa) {
    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    const ind = nivel.indicadores.find(i => i.glosa === glosa);

    if (!ind?.mensual) return alert("Este indicador no tiene datos mensuales");

    const ctx = document.getElementById("grafico");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: Object.keys(ind.mensual),
        datasets: [{
          label: glosa,
          data: Object.values(ind.mensual),
          borderWidth: 2
        }]
      }
    });

    document.getElementById("modalTitulo").textContent = glosa;
    new bootstrap.Modal(document.getElementById("modalGrafico")).show();
  };

  async function iniciar() {
    dataActual = await cargarJSON(anio.value);
    dataPrevio = await cargarJSON(anio.value === "2025" ? "2024" : "2025");
    cargarNiveles(dataActual);
    renderKPIs();
  }

  anio.addEventListener("change", iniciar);
  nivelSel.addEventListener("change", renderKPIs);
  mesSel.addEventListener("change", renderKPIs);

  iniciar();
});
