const SHEET_NAME = "Registros";

function doPost(e) {
  try {
    const sheet = getSheet();
    const data = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Fecha","Nombres","Apellidos","Cédula","Correo","Contacto","Rol","Municipio","Institución"]);
    }
    sheet.appendRow([
      data.fechaRegistro || new Date().toLocaleString('es-CO'),
      data.nombres || "", data.apellidos || "",
      data.cedula || "", data.correo || "",
      data.contacto || "", data.rol || "",
      data.municipio || "", data.institucion || ""
    ]);
    return buildResponse({ status: "ok" }, null);
  } catch(err) {
    return buildResponse({ status: "error", message: err.toString() }, null);
  }
}

function doGet(e) {
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    const callback = e.parameter.callback || null;
    if (rows.length <= 1) return buildResponse([], callback);
    const headers = rows[0];
    const records = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : ""; });
      return obj;
    });
    return buildResponse(records, callback);
  } catch(err) {
    return buildResponse({ status: "error", message: err.toString() }, null);
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function buildResponse(data, callback) {
  const json = JSON.stringify(data);
  const body = callback ? callback + '(' + json + ')' : json;
  const mime = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
  return ContentService.createTextOutput(body).setMimeType(mime);
}
