function exportarExcelMensual() {
  const idx = servicioSel.value;
  const nivel = dataBase.niveles[idx];

  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  let csv = "Indicador," + meses.join(",") + "\n";

  nivel.indicadores.forEach(ind => {
    let fila = `"${ind.glosa}"`;
    meses.forEach(m => {
      fila += "," + (ind.mensual?.[m] ?? "");
    });
    csv += fila + "\n";
  });

  descargarArchivo(csv, "atencion_cerrada_mensual.csv", "text/csv");
}
