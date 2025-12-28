document.addEventListener("DOMContentLoaded", () => {

  const anio = document.getElementById("anio");
  const nivel = document.getElementById("nivel");
  const mes = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  const btnVista = document.getElementById("btnExportarVista");
  const btnExcel = document.getElementById("btnExportarExcel");

  let dataActual = null;
  let dataComparar = null;

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

  function render() {
    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.firstElementChild;

    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);
    if (!niv) return;

    niv.indicadores.forEach(ind => {
      const valor = mes.value === "acumulado"
        ? ind.acumulado
        : ind.mensual?.[mes.value] ?? "—";

      grid.innerHTML += `
        <div class="kpi-card">
          <h3>${ind.glosa}</h3>
          <span>${valor} ${ind.unidad ?? ""}</span>
          <button class="btn btn-sm btn-outline-primary mt-2"
            onclick="mostrarGrafico('${ind.glosa}')">
            Ver gráfico
          </button>
        </div>
      `;
    });

    renderTablaMensual(niv);
    renderTablaComparativa(niv);
  }

  function renderTablaMensual(niv) {
    const tbody = document.querySelector("#tabla-mensual tbody");
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    tbody.innerHTML = "";

    niv.indicadores.forEach(ind => {
      let fila = `<tr><th>${ind.glosa}</th>`;
      meses.forEach(m => fila += `<td>${ind.mensual?.[m] ?? "—"}</td>`);
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  function renderTablaComparativa(niv) {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    const prev = dataComparar?.niveles.find(n => n.codigo == niv.codigo);
    if (!prev) return;

    niv.indicadores.forEach(ind => {
      const ant = prev.indicadores.find(i => i.glosa === ind.glosa);
      if (!ant) return;

      tbody.innerHTML += `
        <tr>
          <th>${ind.glosa}</th>
          <td>${ant.acumulado}</td>
          <td>${ind.acumulado}</td>
          <td>${(ind.acumulado - ant.acumulado).toFixed(2)}</td>
        </tr>
      `;
    });
  }

  // ================= EXPORTAR VISTA =================
  btnVista.addEventListener("click", async () => {
    const elemento = document.getElementById("vista-exportable");

    const canvas = await html2canvas(elemento, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    const link = document.createElement("a");
    link.download = `Atencion_Cerrada_${anio.value}_${nivel.options[nivel.selectedIndex].text}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // ================= EXPORTAR EXCEL =================
  btnExcel.addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const niv = dataActual.niveles.find(n => n.codigo == nivel.value);

    // Hoja KPIs
    const hojaKPIs = [["Indicador", "Acumulado"]];
    niv.indicadores.forEach(i => hojaKPIs.push([i.glosa, i.acumulado]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hojaKPIs), "KPIs");

    // Hoja Mensual
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const hojaMensual = [["Indicador", ...meses.map(m => m.toUpperCase())]];

    niv.indicadores.forEach(i => {
      hojaMensual.push([i.glosa, ...meses.map(m => i.mensual?.[m] ?? "")]);
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hojaMensual), "Detalle mensual");

    XLSX.writeFile(wb, `Atencion_Cerrada_${anio.value}.xlsx`);
  });

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
