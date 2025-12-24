const formAmb = document.getElementById("formAmb");
const listaAmb = document.getElementById("listaAmb");

let ambulatorio = [];

formAmb.addEventListener("submit", e => {
  e.preventDefault();

  ambulatorio.push({
    rut: rutAmb.value,
    especialidad: especialidad.value
  });

  renderAmb();
  formAmb.reset();
});

function renderAmb() {
  listaAmb.innerHTML = "";

  ambulatorio.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `${a.rut} | ${a.especialidad}`;
    listaAmb.appendChild(li);
  });
}
