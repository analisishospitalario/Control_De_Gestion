let dataBase = null;
let dataComp = null;
let chart = null;

const anioBaseSel = document.getElementById("anioBase");
const anioCompSel = document.getElementById("anioComp");
const servicioSel = document.getElementById("servicioSelect");
const tabla = document.getElementById("tablaKPIs");
const rankingUL = document.getElementById("ranking");

anioBaseSel.addEventListener("change", cargarTodo);
anioCompSel.addEventListener("change", cargarTodo);
servicioSel.addEventListener("change", renderTodo);

async function cargarTodo() {
  dataBase = await fetch(`data/${anioBaseSel.value}.json`).then(r => r.json());
  dataComp = await fetch(`data/${anioCompSel.value}.json`).then(r => r.json());

  cargarServicios();
  renderTodo();
}

function cargarServicios() {
  servicioSel.innerHTML = "";
  dataBase.niveles.forEach((nivel, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${nivel.codigo} - ${nivel.nombre}`;
    servicioSel.appendChild(opt);
  });
}

function renderTodo() {
  renderDireccion();
  renderKPIs();
  renderAlertas();
  renderTabla();
  renderGrafico();
  renderTendenciaMensual();
  renderRanking();
}

/* TABLA */
function renderTabla() {
  tabla.innerHTML = "";

  const idx = servicioSel.value;
  const base = dataBase.niveles[idx];
  const comp = dataComp.niveles.find(n => n.codigo === base.codigo);

  base.indicadores.forEach(ind => {
    const indComp = comp.indicadores.find(i => i.glosa === ind.glosa);

    const vBase = ind.acumulado;
    const vComp = indComp?.acumulado ?? null;

    let variacion = "—";
    if (vBase != null && vComp != null && vBase !== 0) {
      variacion = (((vComp - vBase) / vBase) * 100).toFixed(1) + "%";
    }

    tabla.innerHTML += `
      <tr>
        <td>${ind.glosa}</td>
        <td>${vBase ?? "—"} (${dataBase.anio})</td>
        <td>${vComp ?? "—"} (${dataComp.anio})</td>
        <td>${variacion}</td>
      </tr>
    `;
  });
}

/* GRÁFICO */
function renderGrafico() {
  const idx = servicioSel.value;
  const base = dataBase.niveles[idx];
  const comp = dataComp.niveles.find(n => n.codigo === base.codigo);

  const labels = [];
  const baseVals = [];
  const compVals = [];

  base.indicadores.forEach(ind => {
    if (typeof ind.acumulado === "number") {
      labels.push(ind.glosa);
      baseVals.push(ind.acumulado);
      compVals.push(comp.indicadores.find(i => i.glosa === ind.glosa)?.acumulado ?? 0);
    }
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafico"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: dataBase.anio, data: baseVals },
        { label: dataComp.anio, data: compVals }
      ]
    }
  });
}

/* RANKING */
function renderRanking() {
  rankingUL.innerHTML = "";

  const ranking = dataBase.niveles
    .map(n => ({
      nombre: n.nombre,
      valor: n.indicadores.find(i => i.glosa === "Indice Ocupacional")?.acumulado ?? 0
    }))
    .sort((a, b) => b.valor - a.valor);

  ranking.forEach(r => {
    rankingUL.innerHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <span>${r.nombre}</span>
        <strong>${r.valor}%</strong>
      </li>
    `;
  });
}

cargarTodo();
