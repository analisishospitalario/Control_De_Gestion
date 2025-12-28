document.addEventListener("DOMContentLoaded", () => {

  const anio = document.getElementById("anio");
  const nivel = document.getElementById("nivel");
  const mes = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  const btnVista = document.getElementById("btnExportarVista");
  const btnExcel = document.getElementById("btnExportarExcel");

  let dataActual = null;
  let dataComparar = null;

  const INDICADORES_BASE = [
    "Dias Cama Disponibles",
    "Dias Cama Ocupados",
    "Indice Ocupacional",
    "Promedio Días de Estada",
    "Numero de Egresos",
    "Egresos Fallecidos",
    "Letalidad"
  ];

  const MESES = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  // =========================
  // UTILIDADES
  // =========================
  function normalizarMes(valor) {
    return valor ? valor.toLowerCase() : null;
  }

  async function cargarJSON(anio) {
    const res = await fetch(`../data/atencion_cerrada/${anio}.json`);
    return res.ok ? res.json() : null;
  }

  function cargarNiveles(data) {
    nivel.innerHTML = "";
    data.niveles.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.codigo;
      opt.textContent = n.nombre;
      nivel.appendChild(opt);
    });
  }

  // =========================
  // RENDER KPIs
  // =========================
  function render() {
    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.firstElementChild;

    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);
    if (!niv) return;

    INDICADORES_BASE.forEach(nombre => {
      const ind = niv.indicadores.find(i => i.glosa === nombre);

      const valor =
        !ind ? "—" :
        mes.value === "acumulado"
          ? ind.acumulado
          : ind.mensual?.[normalizarMes(mes.value)] ?? "—";

      const existeDato =
        ind &&
        (mes.value === "acumulado" ||
         ind.mensual?.[normalizarMes(mes.value)] !== undefined);

      grid.innerHTML += `
        <div class="kpi-card">
          <h3>${nombre}</h3>
          <span>${valor} ${ind?.unidad ?? ""}</span>
          <button class="btn btn-sm btn-outline-primary mt-2"
            ${existeDato ? `onclick="mostrarGrafico('${nombre}')"` : "disabled"}>
            Ver gráfico
          </button>
        </div>
      `;
    });

    renderTablaMensual(niv);
    renderTablaComparativa(niv);
  }

  // =========================
  // TABLA MENSUAL
  // =========================
  function renderTablaMensual(niv) {
    const tbody = document.querySelector("#tabla-mensual tbody");
    tbody.innerHTML = "";

    INDICADORES_BASE.forEach(nombre => {
      const ind = niv.indicadores.find(i => i.glosa === nombre);
      let fila = `<tr><th>${nombre}</th>`;
      MESES.forEach(m => fila += `<td>${ind?.mensual?.[m] ?? "—"}</td>`);
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  // =========================
  // TABLA COMPARATIVA
  // =========================
  function renderTablaComparativa(niv) {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    const prev = dataComparar?.niveles.find(n => n.codigo == niv.codigo);
    if (!prev) return;

    INDICADORES_BASE.forEach(nombre => {
      const act = niv.indicadores.find(i => i.glosa === nombre);
      const ant = prev.indicadores.find(i => i.glosa === nombre);

      const vAnt = ant?.acumulado ?? "—";
      const vAct = act?.acumulado ?? "—";
      const diff =
        typeof vAnt === "number" && typeof vAct === "number"
          ? (vAct - vAnt).toFixed(2)
          : "—";

      tbody.innerHTML += `
        <tr>
          <th>${nombre}</th>
          <td>${vAnt}</td>
          <td>${vAct}</td>
          <td>${diff}</td>
        </tr>
      `;
    });
  }

  // =========================
  // GRÁFICOS (CLAVE)
  // =========================
  window.mostrarGrafico = function (nombre) {

    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);
    const ind = niv.indicadores.find(i => i.glosa === nombre);
    if (!ind) return;

    const ctx = document.getElementById("grafico");
    if (window.chart) window.chart.destroy();

    if (mes.value === "acumulado") {
      window.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: MESES.map(m => m.toUpperCase()),
          datasets: [{
            label: nombre,
            data: MESES.map(m => ind.mensual?.[m] ?? null),
            spanGaps: true,
            borderWidth: 2
          }]
        }
      });
    } else {
      const valor = ind.mensual?.[normalizarMes(mes.value)] ?? null;

      window.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [mes.value],
          datasets: [{
            label: nombre,
            data: [valor]
          }]
        }
      });
    }

    document.getElementById("modalTitulo").textContent =
      `${nombre} – ${mes.value}`;

    new bootstrap.Modal(document.getElementById("modalGrafico")).show();
  };

  // =========================
  // EXPORTAR
  // =========================
  btnVista.addEventListener("click", async () => {
    const canvas = await html2canvas(
      document.getElementById("vista-exportable"),
      { scale: 2, backgroundColor: "#ffffff" }
    );
    const link = document.createElement("a");
    link.download = `Atencion_Cerrada_${anio.value}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  btnExcel.addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);

    const hoja = [["Indicador", "Acumulado"]];
    INDICADORES_BASE.forEach(nombre => {
      const ind = niv.indicadores.find(i => i.glosa === nombre);
      hoja.push([nombre, ind?.acumulado ?? ""]);
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hoja), "KPIs");
    XLSX.writeFile(wb, `Atencion_Cerrada_${anio.value}.xlsx`);
  });

  // =========================
  // INICIO
  // =========================
  async function iniciar() {
    dataActual = await cargarJSON(anio.value);
    dataComparar = await cargarJSON(anio.value === "2025" ? "2024" : "2025");
    cargarNiveles(dataActual);
    render();
  }

  anio.addEventListener("change", iniciar);
  nivel.addEventListener("change", render);
  mes.addEventListener("change", render);

  iniciar();
});
