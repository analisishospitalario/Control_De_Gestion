let dataGlobal = null;

const anioSelect = document.getElementById("anioSelect");
const servicioSelect = document.getElementById("servicioSelect");
const tabla = document.getElementById("tablaIndicadores");

anioSelect.addEventListener("change", cargarDatos);
servicioSelect.addEventListener("change", renderTabla);

// CARGA JSON SEGÚN AÑO
function cargarDatos() {
  const anio = anioSelect.value;

  fetch(`data/${anio}.json`)
    .then(res => res.json())
    .then(data => {
      dataGlobal = data;
      cargarServicios();
    })
    .catch(err => {
      console.error("Error cargando JSON:", err);
    });
}

// LLENA SELECT DE SERVICIOS
function cargarServicios() {
  servicioSelect.innerHTML = "";

  dataGlobal.niveles.forEach((nivel, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `${nivel.codigo} - ${nivel.nombre}`;
    servicioSelect.appendChild(opt);
  });

  renderTabla();
}

// RENDERIZA TABLA
function renderTabla() {
  tabla.innerHTML = "";

  if (!dataGlobal) return;

  const nivel = dataGlobal.niveles[servicioSelect.value];
  const anio = dataGlobal.anio;

  nivel.indicadores.forEach(ind => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${ind.glosa}</td>
      <td>${ind.acumulado ?? "—"}</td>
      <td>${anio}</td>
    `;

    tabla.appendChild(tr);
  });
}

// INICIAL
cargarDatos();
