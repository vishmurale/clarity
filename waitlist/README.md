# Clarity waitlist site

Static landing page for the Clarity Batch 01 waitlist. Hosted on Netlify; sign-ups go to the
"BATCH 01 Signup" Google Sheet through a small Google Apps Script web app.

## Folder layout

- `site/` is what Netlify publishes (`index.html`, `css/`, `js/`, `images/`).
- `site/js/config.js` holds the sign-up URL. This is the only file to edit when connecting the sheet.
- `apps-script/Code.gs` is the script that writes each sign-up into the sheet.
- `src/input.css` is the stylesheet source. `site/css/styles.css` is already built, so Netlify needs no build step.

## 1. Connect the Google Sheet (one time)

1. Open the sheet, then **Extensions > Apps Script**.
2. Delete what's in the editor, paste in the script below (the same code is in `apps-script/Code.gs`), and save.
3. Click **Deploy > New deployment**. For type, choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** and approve the Google permissions prompt. Google warns that the app is unverified, because it is your own script. Click **Advanced > Go to project**.
5. Copy the **Web app URL** (it ends in `/exec`) and paste it into `site/js/config.js`:
   `window.CLARITY_SIGNUP_URL = "https://script.google.com/macros/s/.../exec";`

Each sign-up adds a row with Name, Email Address, Flavor pick, Signed up at and Source page.
The script skips duplicate emails and bot submissions.

If you edit `Code.gs` later, use **Deploy > Manage deployments > Edit > New version**. That keeps the same URL.

### The script to paste

```javascript
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
```

## 2. Deploy on Netlify

- **From GitHub:** in Netlify choose **Add new site > Import an existing project**, pick `vishmurale/clarity`,
  and set **Base directory** to `waitlist`. `netlify.toml` already sets the publish folder to `site`, with no build command.
- **Without GitHub:** drag the `site` folder onto Netlify's **Deploys** page.

## Changing styles

The CSS is prebuilt. If you add new Tailwind classes to the HTML, rebuild it:

```
npm install
npm run build:css
```
