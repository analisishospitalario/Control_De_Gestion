const formCer = document.getElementById("formCerrada");
const listaCer = document.getElementById("listaCerrada");

let cerrada = [];

formCer.addEventListener("submit", e => {
  e.preventDefault();

  cerrada.push({
    rut: rutCer.value,
    servicio: servicio.value
  });

  renderCerrada();
  formCer.reset();
});

function renderCerrada() {
  listaCer.innerHTML = "";

  cerrada.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.rut} | ${c.servicio}`;
    listaCer.appendChild(li);
  });
}
