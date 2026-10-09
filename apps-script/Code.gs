/**
 * Clarity Batch 01 sign-ups -> Google Sheet.
 * Paste into the sheet's Extensions > Apps Script editor, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). Copy the /exec URL into site/js/config.js.
 */
const SHEET_NAME = 'Sheet1';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true }); // honeypot filled in: likely a bot

  const name = clean_(p.name, 120);
  const email = String(p.email || '').trim().toLowerCase().slice(0, 200);
  if (!name || !EMAIL_RE.test(email)) return json_({ ok: false, error: 'invalid' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const last = sheet.getLastRow();
    if (last > 1) {
      const emails = sheet.getRange(2, 2, last - 1, 1).getValues().map(r => String(r[0]).trim().toLowerCase());
      if (emails.indexOf(email) !== -1) return json_({ ok: true, duplicate: true });
    }
    sheet.appendRow([name, email, clean_(p.flavor, 40), new Date(), clean_(p.page, 300)]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Plain-text cell values only: stop anything that starts like a formula from running.
function clean_(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
