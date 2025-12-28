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
  // CONSTANTES
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

  const normalizarMes = v => v?.toLowerCase() ?? null;

  // =========================
  // CARGA JSON (con cache)
  // =========================
  async function cargarJSON(year) {
    if (cacheJSON[year]) return cacheJSON[year];

    try {
      const res = await fetch(`../data/atencion_cerrada/${year}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      cacheJSON[year] = data;
      return data;
    } catch (e) {
      console.error("Error cargando JSON:", e);
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
  // RENDER PRINCIPAL (FIX DEFINITIVO)
  // =========================
  function render() {

    // 👉 CASO 1: No hay niveles (ej. 2025 vacío)
    if (!dataActual?.niveles || dataActual.niveles.length === 0) {
      contenedor.innerHTML = `
        <div class="alert alert-secondary">
          <strong>Año ${anio.value}:</strong>
          No existen datos cargados para este año.
        </div>
      `;
      document.querySelector("#tabla-mensual tbody").innerHTML = "";
      document.querySelector("#tabla-comparativa tbody").innerHTML = "";
      return;
    }

    // 👉 FIX CLAVE: si no hay nivel seleccionado, usar el primero
    if (!nivel.value) {
      nivel.value = dataActual.niveles[0].codigo;
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
      btn.addEventListener("click", () => mostrarGrafico(nombre));

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
  });

  // =========================
  // INICIO
  // =========================
  async function iniciar() {
    const year = parseInt(anio.value, 10);

    dataActual = await cargarJSON(year);
    dataComparar = await cargarJSON(year - 1);

    if (!dataActual) {
      contenedor.innerHTML = `
        <div class="alert alert-danger">
          No se encontró el archivo de datos del año ${anio.value}.
        </div>
      `;
      nivel.innerHTML = "";
      return;
    }

    nivel.innerHTML = "";
    cargarNiveles(dataActual);
    render();
  }

  anio.addEventListener("change", iniciar);
  nivel.addEventListener("change", render);
  mes.addEventListener("change", render);

  iniciar();
});
