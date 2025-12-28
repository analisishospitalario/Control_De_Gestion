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
    "Indice de Rotación",
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
  const normalizarMes = v => v ? v.toLowerCase() : null;

  async function cargarJSON(anio) {
    try {
      const res = await fetch(`../data/atencion_cerrada/${anio}.json`);
      if (!res.ok) return null;
      return await res.json();
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
  // RENDER PRINCIPAL
  // =========================
  function render() {
    if (!dataActual?.niveles) {
      contenedor.innerHTML = "<p>No hay datos disponibles</p>";
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

      const existeDato =
        ind &&
        (mes.value === "acumulado" ||
         ind.mensual?.[normalizarMes(mes.value)] !== undefined);

      const card = document.createElement("div");
      card.className = "kpi-card";

      const h3 = document.createElement("h3");
      h3.textContent = nombre;

      const span = document.createElement("span");
      span.textContent = `${valor} ${ind?.unidad ?? ""}`;

      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-primary mt-2";
      btn.textContent = "Ver gráfico";
      btn.disabled = !existeDato;
      btn.addEventListener("click", () => mostrarGrafico(nombre));

      card.append(h3, span, btn);
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

      const th = document.createElement("th");
      th.textContent = nombre;
      tr.appendChild(th);

      MESES.forEach(m => {
        const td = document.createElement("td");
        td.textContent = ind?.mensual?.[m] ?? "—";
        tr.appendChild(td);
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

      const vAnt = ant?.acumulado ?? "—";
      const vAct = act?.acumulado ?? "—";

      let diff = "—";
      if (typeof vAnt === "number" && typeof vAct === "number") {
        diff = (vAct - vAnt).toFixed(2);
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <th>${nombre}</th>
        <td>${vAnt}</td>
        <td>${vAct}</td>
        <td>${diff}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // =========================
  // GRÁFICOS
  // =========================
  function mostrarGrafico(nombre) {
    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);
    const ind = niv?.indicadores.find(i => i.glosa === nombre);
    if (!ind) return;

    if (chartInstance) chartInstance.destroy();

    if (mes.value === "acumulado") {
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
    } else {
      const valor = ind.mensual?.[normalizarMes(mes.value)] ?? null;

      chartInstance = new Chart(ctxGrafico, {
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
    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);

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
    const anioNum = parseInt(anio.value, 10);

    dataActual = await cargarJSON(anioNum);
    dataComparar = await cargarJSON(anioNum - 1);

    if (!dataActual) {
      contenedor.innerHTML = "<p>No hay datos para este año</p>";
      return;
    }

    cargarNiveles(dataActual);
    render();
  }

  anio.addEventListener("change", iniciar);
  nivel.addEventListener("change", render);
  mes.addEventListener("change", render);

  iniciar();
});
