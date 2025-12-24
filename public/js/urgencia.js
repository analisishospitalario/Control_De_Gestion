const formUrg = document.getElementById("formUrgencia");
const listaUrg = document.getElementById("listaUrgencia");

let urgencias = [];

formUrg.addEventListener("submit", e => {
  e.preventDefault();

  urgencias.push({
    rut: rutUrg.value,
    categoria: categoriaUrg.value,
    hora: new Date().toLocaleTimeString()
  });

  renderUrgencia();
  formUrg.reset();
});

function renderUrgencia() {
  listaUrg.innerHTML = "";

  urgencias.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.rut} | ${u.categoria} | ${u.hora}`;
    listaUrg.appendChild(li);
  });
}
