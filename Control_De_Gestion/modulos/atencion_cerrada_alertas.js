function renderAlertas() {
  const idx = servicioSel.value;
  const nivel = dataBase.niveles[idx];

  const ind = glosa =>
    nivel.indicadores.find(i => i.glosa === glosa)?.acumulado ?? null;

  const alertas = [];

  const ocup = ind("Indice Ocupacional");
  if (ocup >= 90) alertas.push("Índice ocupacional crítico (>90%)");
  else if (ocup >= 80) alertas.push("Índice ocupacional alto (≥80%)");

  const estada = ind("Promedio Días de Estada");
  if (estada >= 7) alertas.push("Promedio de estada elevado");

  const letal = ind("Letalidad");
  if (letal >= 5) alertas.push("Letalidad elevada");

  const cont = document.getElementById("alertasGestion");
  cont.innerHTML = "";

  if (alertas.length === 0) {
    cont.innerHTML = `
      <div class="alert alert-success">
        Sin alertas críticas para este servicio
      </div>`;
    return;
  }

  alertas.forEach(a => {
    cont.innerHTML += `
      <div class="alert alert-warning mb-2">
        ⚠ ${a}
      </div>`;
  });
}
