const formPab = document.getElementById("formPabellon");
const listaPab = document.getElementById("listaPabellon");

let pabellon = [];

formPab.addEventListener("submit", e => {
  e.preventDefault();

  pabellon.push({
    rut: rutPab.value,
    procedimiento: procedimiento.value
  });

  renderPabellon();
  formPab.reset();
});

function renderPabellon() {
  listaPab.innerHTML = "";

  pabellon.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.rut} | ${p.procedimiento}`;
    listaPab.appendChild(li);
  });
}
