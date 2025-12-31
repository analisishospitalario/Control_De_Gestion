/* =====================================================
   ESTADO GLOBAL
===================================================== */

const DATA = {}; // { 2024: json, 2025: json }

/* =====================================================
   SELECTORES
===================================================== */

const selAnio     = document.getElementById("anio");
const selAnioBase = document.getElementById("anioBase");
const selNivel    = document.getElementById("nivel");
const selMes      = document.getElementById("mes");

const contenedorKPIs = document.getElementById("contenedor");

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await Promise.all([
    cargarJSON(2024),
    cargarJSON(2025)
  ]);

  inicializarSelectores();
  render();
}

/* =====================================================
   CARGA JSON
===================================================== */

async function cargarJSON(anio) {
  const response = await fetch(`../data/${anio}.json`);
  const json = await response.json();
  DATA[anio] = json;
}

/* =====================================================
   SELECTORES
===================================================== */

function inicializarSelectores() {
  const anios = Object.keys(DATA).sort((a, b) => b - a);

  selAnio.innerHTML = "";
  selAnioBase.innerHTML = "";

  anios.forEach(a => {
    selAnio.innerHTML += `<option value="${a}">${a}</option>`;
    selAnioBase.innerHTML += `<option value="${a}">${a}</option>`;
  });

  selAnio.value = anios[0];
  selAnioBase.value = anios[1] || anios[0];

  cargarNiveles();
}

/* =====================================================
   SERVICIOS / NIVELES
===================================================== */

function cargarNiveles() {
  const anio = selAnio.value;
  selNivel.innerHTML = "";

  DATA[anio].niveles.forEach(n => {
    selNivel.innerHTML += `
      <option value="${n.codigo}">
        ${n.nombre}
      </option>
    `;
  });
}

/* =====================================================
   EVENTOS
===================================================== */

[selAnio, selAnioBase, selNivel, selMes].forEach(el =>
  el.addEventListener("change", () => {
    cargarNiveles();
    render();
  })
);

/* =====================================================
   RENDER GENERAL
===================================================== */

function render() {
  const anioActual = selAnio.value;
  const anioBase   = selAnioBase.value;
  const codigo     = selNivel.value;
  const mes        = selMes.value;

  const nivelActual = DATA[anioActual].niveles.find(n => n.codigo == codigo);
  const nivelBase   = DATA[anioBase]?.niveles.find(n => n.codigo == codigo);

  if (!nivelActual) return;

  renderKPIs(nivelActual, anioActual, mes);
  renderTablaMensual(nivelActual);
  renderComparativa(nivelActual, nivelBase);
}

/* =====================================================
   KPIs
===================================================== */

function renderKPIs(nivel, anio, mes) {
  contenedorKPIs.innerHTML = "";

  nivel.indicadores.forEach(ind => {
    const valor = mes === "acumulado"
      ? ind.acumulado
      : ind.mensual?.[mes];

    contenedorKPIs.innerHTML += `
      <div class="col-md-3">
        <div class="card p-3">
          <small class="text-muted">${ind.glosa} · ${anio}</small>
          <h4 class="fw-bold mb-0">${valor ?? "-"}</h4>
        </div>
      </div>
    `;
  });
}

/* =====================================================
   TABLA MENSUAL
===================================================== */

function renderTablaMensual(nivel) {
  const tbody = document.querySelector("#tabla-mensual tbody");
  tbody.innerHTML = "";

  nivel.indicadores.forEach(ind => {
    const m = ind.mensual || {};

    tbody.innerHTML += `
      <tr>
        <td>${ind.glosa}</td>
        <td>${m.enero ?? "-"}</td>
        <td>${m.febrero ?? "-"}</td>
        <td>${m.marzo ?? "-"}</td>
        <td>${m.abril ?? "-"}</td>
        <td>${m.mayo ?? "-"}</td>
        <td>${m.junio ?? "-"}</td>
        <td>${m.julio ?? "-"}</td>
        <td>${m.agosto ?? "-"}</td>
        <td>${m.septiembre ?? "-"}</td>
        <td>${m.octubre ?? "-"}</td>
        <td>${m.noviembre ?? "-"}</td>
        <td>${m.diciembre ?? "-"}</td>
      </tr>
    `;
  });
}

/* =====================================================
   COMPARACIÓN ANUAL
===================================================== */

function renderComparativa(actual, base) {
  const tbody = document.querySelector("#tabla-comparativa tbody");
  tbody.innerHTML = "";

  actual.indicadores.forEach(ind => {
    const indBase = base?.indicadores.find(i => i.glosa === ind.glosa);

    const vActual = ind.acumulado;
    const vBase   = indBase?.acumulado;

    let diff = "-";
    if (typeof vActual === "number" && typeof vBase === "number") {
      diff = (vActual - vBase).toFixed(2);
    }

    tbody.innerHTML += `
      <tr>
        <td>${ind.glosa}</td>
        <td>${vBase ?? "-"}</td>
        <td>${vActual ?? "-"}</td>
        <td>${diff}</td>
      </tr>
    `;
  });
}
