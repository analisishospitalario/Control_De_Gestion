document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // ELEMENTOS DOM
  // =========================
  const anio = document.getElementById("anio");
  const nivel = document.getElementById("nivel");
  const mes = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  const btnVista = document.getElementById("btnExportarVista");
  const btnExcel = document.getElementById("btnExportarExcel");
  const ctxGrafico = document.getElementById("grafico");

  // =========================
  // ESTADO
  // =========================
  let dataActual = null;
  let dataComparar = null;
  let chartInstance = null;
  const cacheJSON = {};

  // =========================
  // CONSTANTES (ÍNDICE ROTACIÓN ELIMINADO)
  // =========================
  const INDICADORES_BASE = [
    "Dias Cama Disponibles",
    "Dias Cama Ocupados",
    "Dias de Estada",
    "Promedio Cama Disponibles",
    "Numero de Egresos",
    "Egresos Fallecidos",
    "Indice Ocupacional",
    "Promedio Días de Estada",
    "Letalidad",
    "Traslados"
  ];

  const MESES = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  // =========================
  // UTILIDADES
  // =========================
  const normalizarMes = v => v?.toLowerCase() ?? null;

  async function cargarJSON(anio) {
    if (cacheJSON[anio]) return cacheJSON[anio];

    try {
      const res = await fetch(`../data/atencion_cerrada/${anio}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      cacheJSON[anio] = data;
      return data;
    } catch {
      return null;
    }
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
  // RENDER PRINCIPAL
  // =========================
  function render() {
    if (!dataActual?.niveles?.length) {
      contenedor.innerHTML =
        "<p class='text-muted'>No hay datos cargados para el año seleccionado.</p>";
      document.querySelector("#tabla-mensual tbody").innerHTML = "";
      document.querySelector("#tabla-comparativa tbody").innerHTML = "";
      return;
    }

    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.firstElementChild;

    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);
    if (!niv) return;

    const fragment = document.createDocumentFragment();

    INDICADORES_BASE.forEach(nombre => {
      const ind = niv.indicadores.find(i => i.glosa === nombre);

      const valor =
        !ind ? "—" :
        mes.value === "acumulado"
          ? ind.acumulado
          : ind.mensual?.[normalizarMes(mes.value)] ?? "—";

      const card = document.createElement("div");
      card.className = "kpi-card";
      card.innerHTML = `
        <h3>${nombre}</h3>
        <span>${valor} ${ind?.unidad ?? ""}</span>
      `;

      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-primary mt-2";
      btn.textContent = "Ver gráfico";
      btn.disabled = !ind;
      btn.onclick = () => mostrarGrafico(nombre);

      card.appendChild(btn);
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

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
      const tr = document.createElement("tr");
      tr.innerHTML = `<th>${nombre}</th>`;

      MESES.forEach(m => {
        tr.innerHTML += `<td>${ind?.mensual?.[m] ?? "—"}</td>`;
      });

      tbody.appendChild(tr);
    });
  }

  // =========================
  // TABLA COMPARATIVA
  // =========================
  function renderTablaComparativa(niv) {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    const prev = dataComparar?.niveles?.find(n => n.codigo == niv.codigo);
    if (!prev) return;

    INDICADORES_BASE.forEach(nombre => {
      const act = niv.indicadores.find(i => i.glosa === nombre);
      const ant = prev.indicadores.find(i => i.glosa === nombre);

      const vAnt = ant?.acumulado;
      const vAct = act?.acumulado;
      const diff =
        typeof vAnt === "number" && typeof vAct === "number"
          ? (vAct - vAnt).toFixed(2)
          : "—";

      tbody.innerHTML += `
        <tr>
          <th>${nombre}</th>
          <td>${vAnt ?? "—"}</td>
          <td>${vAct ?? "—"}</td>
          <td>${diff}</td>
        </tr>
      `;
    });
  }

  // =========================
  // GRÁFICO
  // =========================
  function mostrarGrafico(nombre) {
    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);
    const ind = niv?.indicadores.find(i => i.glosa === nombre);
    if (!ind) return;

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctxGrafico, {
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

    document.getElementById("modalTitulo").textContent =
      `${nombre} – Evolución anual`;

    new bootstrap.Modal(
      document.getElementById("modalGrafico")
    ).show();
  }

  // =========================
  // EXPORTAR
  // =========================
  btnVista.onclick = async () => {
    const canvas = await html2canvas(
      document.getElementById("vista-exportable"),
      { scale: 2 }
    );
    const link = document.createElement("a");
    link.download = `Atencion_Cerrada_${anio.value}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  btnExcel.onclick = () => {
    const wb = XLSX.utils.book_new();
    const niv = dataActual?.niveles?.find(n => n.codigo == nivel.value);
    if (!niv) return;

    const hoja = [["Indicador", "Acumulado"]];
    INDICADORES_BASE.forEach(nombre => {
      const ind = niv.indicadores.find(i => i.glosa === nombre);
      hoja.push([nombre, ind?.acumulado ?? ""]);
    });

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(hoja),
      "KPIs"
    );
    XLSX.writeFile(wb, `Atencion_Cerrada_${anio.value}.xlsx`);
  };

  // =========================
  // INICIO
  // =========================
  async function iniciar() {
    const year = parseInt(anio.value, 10);

    dataActual = await cargarJSON(year);
    dataComparar = await cargarJSON(year - 1);

    if (!dataActual) {
      contenedor.innerHTML =
        "<p class='text-muted'>Archivo de datos no encontrado.</p>";
      return;
    }

    cargarNiveles(dataActual);
    render();
  }

  anio.onchange = iniciar;
  nivel.onchange = render;
  mes.onchange = render;

  iniciar();
});
