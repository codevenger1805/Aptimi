# APTIMI

Career Execution Platform for students. Turn a Career Goal into a Career Roadmap, weekly actions, Focus Mode, and internship outcomes. Data stays in this browser unless you export it. No account is required.

## Run locally

1. Install Node.js 20 or newer.
2. `npm install`
3. `npm run dev`
4. Open the printed local URL.

First run explains local storage, then Career Goal Setup, Skill Assessment, and a reviewable roadmap draft.

## Test and build

- `npm test` — domain formulas, reminder rules, import validation, navigation smoke test
- `npm run build` — production bundle

## Backup

Settings → Export JSON. Import previews before replacing. Invalid files do not overwrite data.

## Optional AI Career Assistant

Core features work without a key. To enable the assistant:

1. Open Settings.
2. Paste an API key for an OpenAI-compatible Chat Completions endpoint (for example Groq). Confirm the provider’s current free-tier terms and regional availability yourself; they change.
3. Keep the key in the tab session, or opt in to save it on this device (other scripts on this device could read it).
4. Review the context JSON before each request. Daily limit: 20 requests.

Never put a key in source control.

## Notifications

In-app reminders work while APTIMI is open. Browser notifications are optional and requested only after you enable them. Delivery is not guaranteed when the browser or device is closed.

## Sample data

Settings can load a **labeled** sample profile. First run never seeds fake accomplishments.

Product requirements live in `docs/APTIMI_SETUP.md` and must not be treated as application code.
