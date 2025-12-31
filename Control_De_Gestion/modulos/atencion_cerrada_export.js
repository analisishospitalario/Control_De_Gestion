function exportarCSV() {
  const idx = servicioSel.value;
  const nivel = dataBase.niveles[idx];

  let csv = "Indicador,Valor\n";

  nivel.indicadores.forEach(i => {
    csv += `"${i.glosa}",${i.acumulado ?? ""}\n`;
  });

  descargarArchivo(csv, "atencion_cerrada.csv", "text/csv");
}

function exportarJSON() {
  const idx = servicioSel.value;
  const nivel = dataBase.niveles[idx];

  descargarArchivo(
    JSON.stringify(nivel, null, 2),
    "atencion_cerrada.json",
    "application/json"
  );
}

function descargarArchivo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();

  URL.revokeObjectURL(url);
}
