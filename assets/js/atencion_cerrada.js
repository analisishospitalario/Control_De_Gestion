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

// =======================
// CARGA DATOS
// =======================
async function cargarTodo() {
  const anioBase = anioBaseSel.value;
  const anioComp = anioCompSel.value;

  dataBase = await fetch(`data/${anioBase}.json`).then(r => r.json());
  dataComp = await fetch(`data/${anioComp}.json`).then(r => r.json());

  cargarServicios();
  renderTodo();
}

// =======================
// SERVICIOS
// =======================
function cargarServicios() {
  servicioSel.innerHTML = "";

  dataBase.niveles.forEach((nivel, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${nivel.codigo} - ${nivel.nombre}`;
    servicioSel.appendChild(opt);
  });
}

// =======================
// RENDER GENERAL
// =======================
function renderTodo() {
  renderTabla();
  renderGrafico();
  renderRanking();
}

// =======================
// TABLA KPI
// =======================
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
    if (vBase != null && vComp != null) {
      const diff = ((vComp - vBase) / vBase) * 100;
      variacion = `${diff.toFixed(1)}%`;
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

// =======================
// GRAFICO
// =======================
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

      const indC = comp.indicadores.find(i => i.glosa === ind.glosa);
      compVals.push(indC?.acumulado ?? 0);
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

// =======================
// RANKING
// =======================
function renderRanking() {
  rankingUL.innerHTML = "";

  const ranking = dataBase.niveles
    .map(n => {
      const ind = n.indicadores.find(i => i.glosa === "Indice Ocupacional");
      return { nombre: n.nombre, valor: ind?.acumulado ?? 0 };
    })
    .sort((a, b) => b.valor - a.valor);

  ranking.forEach(r => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between";
    li.innerHTML = `<span>${r.nombre}</span><strong>${r.valor}%</strong>`;
    rankingUL.appendChild(li);
  });
}

// =======================
cargarTodo();
