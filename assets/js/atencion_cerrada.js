document.addEventListener("DOMContentLoaded", () => {

  const anio = document.getElementById("anio");
  const nivelSel = document.getElementById("nivel");
  const mesSel = document.getElementById("mes");
  const contenedor = document.getElementById("contenedor");

  let dataActual = null;
  let dataPrevio = null;
  let chart = null;

  async function cargarJSON(a) {
    const res = await fetch(`../data/atencion_cerrada/${a}.json`);
    return res.ok ? res.json() : null;
  }

  function cargarNiveles(data) {
    nivelSel.innerHTML = "";
    data.niveles.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.codigo;
      opt.textContent = n.nombre;
      nivelSel.appendChild(opt);
    });
  }

  function renderKPIs() {
    contenedor.innerHTML = `<div class="kpis"></div>`;
    const grid = contenedor.firstElementChild;

    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    if (!nivel) return;

    nivel.indicadores.forEach(ind => {
      const valor = mesSel.value === "acumulado"
        ? ind.acumulado
        : ind.mensual?.[mesSel.value] ?? "—";

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

    renderTablaMensual(nivel);
    renderComparativa(nivel);
  }

  function renderTablaMensual(nivel) {
    const tbody = document.querySelector("#tabla-mensual tbody");
    const meses = [
      "enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];
    tbody.innerHTML = "";

    nivel.indicadores.forEach(ind => {
      let fila = `<tr><th>${ind.glosa}</th>`;
      meses.forEach(m => fila += `<td>${ind.mensual?.[m] ?? "—"}</td>`);
      fila += "</tr>";
      tbody.innerHTML += fila;
    });
  }

  function renderComparativa(nivel) {
    const tbody = document.querySelector("#tabla-comparativa tbody");
    tbody.innerHTML = "";

    const nivelPrev = dataPrevio?.niveles.find(n => n.codigo == nivel.codigo);
    if (!nivelPrev) return;

    nivel.indicadores.forEach(ind => {
      const prev = nivelPrev.indicadores.find(i => i.glosa === ind.glosa);
      if (!prev) return;

      tbody.innerHTML += `
        <tr>
          <th>${ind.glosa}</th>
          <td>${prev.acumulado}</td>
          <td>${ind.acumulado}</td>
          <td>${(ind.acumulado - prev.acumulado).toFixed(2)}</td>
        </tr>
      `;
    });
  }

  window.mostrarGrafico = function (glosa) {
    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);
    const ind = nivel.indicadores.find(i => i.glosa === glosa);
    if (!ind?.mensual) return;

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("grafico"), {
      type: "line",
      data: {
        labels: Object.keys(ind.mensual),
        datasets: [{
          label: glosa,
          data: Object.values(ind.mensual),
          borderWidth: 2
        }]
      }
    });

    document.getElementById("modalTitulo").textContent = glosa;
    new bootstrap.Modal(document.getElementById("modalGrafico")).show();
  };

  window.exportarVista = function () {
    html2canvas(document.querySelector("main")).then(canvas => {
      const link = document.createElement("a");
      link.download = `Atencion_Cerrada_${anio.value}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  window.exportarExcel = function () {
    const wb = XLSX.utils.book_new();
    const nivel = dataActual.niveles.find(n => n.codigo == nivelSel.value);

    const kpis = [["Indicador", "Acumulado"]];
    nivel.indicadores.forEach(i => kpis.push([i.glosa, i.acumulado]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpis), "KPIs");

    XLSX.writeFile(wb, `Atencion_Cerrada_${anio.value}.xlsx`);
  };

  async function iniciar() {
    dataActual = await cargarJSON(anio.value);
    dataPrevio = await cargarJSON(anio.value === "2025" ? "2024" : "2025");
    cargarNiveles(dataActual);
    renderKPIs();
  }

  anio.addEventListener("change", iniciar);
  nivelSel.addEventListener("change", renderKPIs);
  mesSel.addEventListener("change", renderKPIs);

  iniciar();
});
