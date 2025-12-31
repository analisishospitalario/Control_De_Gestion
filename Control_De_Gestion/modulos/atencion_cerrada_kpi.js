function renderKPIs() {
  const idx = servicioSel.value;
  const nivel = dataBase.niveles[idx];

  const ind = glosa =>
    nivel.indicadores.find(i => i.glosa === glosa)?.acumulado ?? null;

  const ocup = ind("Indice Ocupacional");
  const estada = ind("Promedio Días de Estada");
  const letal = ind("Letalidad");
  const tras = ind("Traslados");

  document.getElementById("kpiOcupacion").textContent =
    ocup != null ? ocup.toFixed(1) + "%" : "—";

  document.getElementById("kpiEstada").textContent =
    estada != null ? estada.toFixed(2) : "—";

  document.getElementById("kpiLetalidad").textContent =
    letal != null ? letal.toFixed(2) + "%" : "—";

  document.getElementById("kpiTraslados").textContent =
    tras ?? "—";

  const label = document.getElementById("kpiOcupacionLabel");
  label.className = "kpi-label";

  if (ocup >= 90) {
    label.textContent = "SOBRE OCUPACIÓN";
    label.classList.add("bad");
  } else if (ocup >= 80) {
    label.textContent = "OCUPACIÓN ALTA";
    label.classList.add("warn");
  } else {
    label.textContent = "OCUPACIÓN CONTROLADA";
    label.classList.add("ok");
  }
}
