/* ==========================
   DATA (ejemplo – tú conectas el JSON real)
========================== */

const data = {
  2024: datos2024,
  2025: datos2025
};

/* ==========================
   SELECTORES
========================== */

const selAnio = document.getElementById("anio");
const selBase = document.getElementById("anioBase");
const selNivel = document.getElementById("nivel");
const selMes = document.getElementById("mes");

const contenedor = document.getElementById("contenedor");

/* ==========================
   INIT
========================== */

init();

function init() {
  cargarAnios();
  cargarNiveles();
  render();
}

/* ==========================
   CARGAS
========================== */

function cargarAnios() {
  const anios = Object.keys(data).sort((a, b) => b - a);

  selAnio.innerHTML = "";
  selBase.innerHTML = "";

  anios.forEach(a => {
    selAnio.innerHTML += `<option value="${a}">${a}</option>`;
    selBase.innerHTML += `<option value="${a}">${a}</option>`;
  });

  selAnio.value = anios[0];
  selBase.value = anios[1] || anios[0];
}

function cargarNiveles() {
  const anio = selAnio.value;
  selNivel.innerHTML = "";

  data[anio].niveles.forEach(n => {
    selNivel.innerHTML += `<option value="${n.codigo}">${n.nombre}</option>`;
  });
}

/* ==========================
   EVENTOS
========================== */

[selAnio, selBase, selNivel, selMes].forEach(el =>
  el.addEventListener("change", render)
);

/* ==========================
   RENDER
========================== */

function render() {
  const anio = selAnio.value;
  const base = selBase.value;
  const codigo = selNivel.value;
  const mes = selMes.value;

  const nivel = data[anio].niveles.find(n => n.codigo == codigo);
  const nivelBase = data[base]?.niveles.find(n => n.codigo == codigo);

  renderKPIs(nivel, anio, mes);
  renderTablaMensual(nivel);
  renderComparativa(nivel, nivelBase);
}

/* ==========================
   KPIs (AÑO EXPLÍCITO)
========================== */

function renderKPIs(nivel, anio, mes) {
  contenedor.innerHTML = "";

  nivel.indicadores.forEach(ind => {
    const valor = mes === "acumulado"
      ? ind.acumulado
      : ind.mensual[mes];

    contenedor.innerHTML += `
      <div class="col-md-3">
        <div class="card p-3">
          <small class="text-muted">${ind.glosa} · ${anio}</small>
          <h4 class="fw-bold mb-0">${valor ?? "-"}</h4>
        </div>
      </div>
    `;
  });
}

/* ==========================
   TABLA MENSUAL
========================== */

function renderTablaMensual(nivel) {
  const tbody = document.querySelector("#tabla-mensual tbody");
  tbody.innerHTML = "";

  nivel.indicadores.forEach(ind => {
    const m = ind.mensual;
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

/* ==========================
   COMPARACIÓN ANUAL
========================== */

function renderComparativa(nivel, base) {
  const tbody = document.querySelector("#tabla-comparativa tbody");
  tbody.innerHTML = "";

  nivel.indicadores.forEach(ind => {
    const baseInd = base?.indicadores.find(i => i.glosa === ind.glosa);

    const vActual = ind.acumulado;
    const vBase = baseInd?.acumulado;

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
