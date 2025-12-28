document.addEventListener("DOMContentLoaded", () => {

  // 🔒 Blindaje: si no estamos en atencion_cerrada.html, salir
  const selectorAnio = document.getElementById("anio");
  if (!selectorAnio) return;

  const selectorNivel = document.getElementById("nivel");
  const selectorMes = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  let dataActual = null;
  let dataComparar = null;

  // 🎯 Metas institucionales
  const METAS = {
    "Índice Ocupacional": 85,
    "Promedio Días de Estada": 6
  };

  // =========================
  // Carga de JSON
  // =========================
  async function cargarJSON(anio) {
    try {
      const res = await fetch(`../data/atencion_cerrada/${anio}.json`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Error cargando JSON", e);
      return null;
    }
  }

  // =========================
  // Select niveles
  // =========================
  function cargarNiveles(data) {
    selectorNivel.innerHTML = "";
    if (!data || !data.niveles) return;

    data.niveles.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.codigo;
      opt.textContent = n.nombre;
      selectorNivel.appendChild(opt);
    });
  }

  // =========================
  // Evaluación KPI
  // =========================
  function evaluarKPI(glosa, valor) {
    const meta = METAS[glosa];
    if (meta == null || valor == null) return { clase: "" };

    if (valor >= meta) return { clase: "kpi-ok" };
    if (valor >= meta * 0.9) return { clase: "kpi-warn" };
    return { clase: "kpi-bad" };
  }

  // =========================
  // KPIs
  // =========================
  function renderKPIs() {
    if (!dataActual) return;

    const nivel = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    if (!nivel) {
      contenedor.innerHTML = `<p class="text-muted">No hay datos para este nivel.</p>`;
      return;
    }

    const mes = selectorMes.value;
    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.querySelector(".kpis");

    nivel.indicadores.forEach(ind => {
      const valor = mes === "acumulado"
        ? ind.acumulado
        : ind.mensual?.[mes];

      const sem = evaluarKPI(ind.glosa, valor);

      grid.innerHTML += `
        <div class="kpi-card">
          <h3>${ind.glosa}</h3>
          <span class="${sem.clase}">
            ${valor ?? "—"} ${ind.unidad ?? ""}
          </span>
          <button class="btn btn-sm btn-outline-primary mt-2"
            onclick="mostrarGrafico('${ind.glosa.replace(/'/g, "\\'")}')">
            Ver gráfico
          </button>
        </div>
      `;
    });

    renderTablaMensual();
    renderTablaComparativa();
  }

  // =========================
  // Tabla mensual
  // =========================
  function renderTablaMensual() {
    const tbody = document.querySelector("#tabla-mensual tbody");
    if (!tbody || !dataActual) return;

    const nivel = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    if (!nivel) return;

    const meses = [
      "enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];

    tbody.innerHTML = "";

    nivel.indicadores.forEach(ind => {
      let fila = `<tr><th>${ind.glosa}</th>`;
      meses.forEach(m => {
        fila += `<td>${ind.mensual?.[m] ?? "—"}</td>`;
      });
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  // =========================
  // Tabla comparativa
  // =========================
  function renderTablaComparativa() {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    if (!tbody || !dataActual || !dataComparar) return;

    const nivelA = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    const nivelB = dataComparar.niveles.find(n => n.codigo == selectorNivel.value);

    tbody.innerHTML = "";

    if (!nivelA || !nivelB) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-muted">
            No hay datos comparables para este nivel
          </td>
        </tr>`;
      return;
    }

    nivelA.indicadores.forEach(ind => {
      const prev = nivelB.indicadores.find(i => i.glosa === ind.glosa);
      if (!prev) return;

      const diff = ind.acumulado - prev.acumulado;

      tbody.innerHTML += `
        <tr>
          <th>${ind.glosa}</th>
          <td>${prev.acumulado}</td>
          <td>${ind.acumulado}</td>
          <td class="${diff >= 0 ? "kpi-ok" : "kpi-bad"}">
            ${diff.toFixed(2)}
          </td>
        </tr>`;
    });
  }

  // =========================
  // Gráfico
  // =========================
  const modalEl = document.getElementById("modalGrafico");
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

  const ctx = document.getElementById("grafico");
  const chart = ctx ? new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Valor mensual",
        data: [],
        borderWidth: 2
      }]
    }
  }) : null;

  window.mostrarGrafico = function (glosa) {
    if (!chart || !dataActual) return;

    const nivel = dataActual.niveles.find(n => n.codigo == selectorNivel.value);
    if (!nivel) return;

    const ind = nivel.indicadores.find(i => i.glosa === glosa);
    if (!ind || !ind.mensual) {
      alert("Este indicador no tiene datos mensuales");
      return;
    }

    chart.data.labels = Object.keys(ind.mensual);
    chart.data.datasets[0].data = Object.values(ind.mensual);
    chart.update();

    document.getElementById("modalTitulo").textContent = glosa;
    modal.show();
  };

  // =========================
  // Exportaciones
  // =========================
  window.exportarVista = function () {
    import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js")
      .then(() => html2canvas(document.querySelector("main")))
      .then(canvas => {
        const link = document.createElement("a");
        link.download = "Atencion_Cerrada.png";
        link.href = canvas.toDataURL();
        link.click();
      });
  };

  window.exportarExcel = function () {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.table_to_sheet(document.getElementById("tabla-mensual")),
      "Mensual"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.table_to_sheet(document.getElementById("tabla-comparativa")),
      "Comparativa"
    );
    XLSX.writeFile(wb, "Atencion_Cerrada.xlsx");
  };

  // =========================
  // Inicio
  // =========================
  async function iniciar() {
    dataActual = await cargarJSON(selectorAnio.value);
    dataComparar = await cargarJSON(
      selectorAnio.value === "2025" ? "2024" : "2025"
    );

    if (!dataActual) {
      contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar los datos.</p>`;
      return;
    }

    cargarNiveles(dataActual);
    renderKPIs();
  }

  selectorAnio.addEventListener("change", iniciar);
  selectorNivel.addEventListener("change", renderKPIs);
  selectorMes.addEventListener("change", renderKPIs);

  iniciar();
});
