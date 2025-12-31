function renderDireccion() {
  const nivel = dataBase.niveles[0]; // establecimiento

  const ind = glosa =>
    nivel.indicadores.find(i => i.glosa === glosa)?.acumulado ?? null;

  const ul = document.getElementById("resumenDireccion");
  ul.innerHTML = "";

  ul.innerHTML += `<li>Índice ocupacional global: <strong>${ind("Indice Ocupacional")}%</strong></li>`;
  ul.innerHTML += `<li>Promedio días de estada: <strong>${ind("Promedio Días de Estada")}</strong></li>`;
  ul.innerHTML += `<li>Letalidad institucional: <strong>${ind("Letalidad")}%</strong></li>`;
  ul.innerHTML += `<li>Egresos totales: <strong>${ind("Numero de Egresos")}</strong></li>`;
}
