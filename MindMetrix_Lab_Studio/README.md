# MindMetrix Lab Studio

Owner-private workbook configuration and existing Grade 6–8 labs.

## Source and hosting

`dist/` retains the original tracked app, artwork and simulators. `public/` contains the new configuration screens and content packages. The build overlays both sources into generated assets. `worker/` supplies private APIs. Vite builds a Cloudflare Worker in `dist/server` and assets in `dist/client`. `.openai/hosting.json` retains the existing Site ID and declares the private R2 `BUCKET`. Do not deploy as a public Site: admin APIs intentionally rely on the verified owner-only Sites access boundary. Add server-side role checks before expanding access to students, viewers or editors.

Run `npm ci`, `npm test`, `npm run build`. Use the Sites source/deploy workflow. The preview command is `npm run dev`; the preview R2 database is separate from hosted storage.

## Configuration

Open `/configuration.html`, or Configuration in the app. Configured Workbooks shows one latest-version row per project with Class, Lab type, Form, Workbook, Version, Status and Review/Update/Delete actions. New Workbook has its own tab. Robotics/AI/IT use a fixed form; only CSL shows Life Forms, Machines & Materials and Human Services. Duplicate class/lab/form uploads must update the existing project or delete it first. Updates preserve prior versions. Delete is recoverable, hides published editions and stops pending conversions; Deleted workbooks provides Restore, which refuses to overwrite an active replacement. Upload a DOCX, PDF or legacy DOC up to 18 MB. Originals, curriculum drafts, content hashes, queue checkpoints, translations and audio are stored server-side in private R2. DOCX text/images extract directly. PDF extraction uses Gemini in three-page batches and needs review; it does not reconstruct the original visual page layout. Legacy DOC requires the optional HTTPS document converter, or uploading a DOCX/PDF replacement. Originals are retained.

Six workbook-backed CSL projects can be imported as configurable drafts. Current legacy Robotics/CSL simulators remain available; importing does not silently replace their behaviour. New configurable projects use a shared workbook renderer, editable activity order, Meet the Lab materials, text and image blocks, evidence records and reviewed simulation components. Source page references from DOCX are logical page breaks and can differ from Word's rendered pagination.

Approve curriculum, select language checkboxes and start the sequential queue. One global R2 conditional lease prevents simultaneous conversion workers. Each successful translation batch and audio clip is checkpointed. Cancel/resume/retry do not discard checkpoints. Editing a draft cancels stale unfinished conversions; published editions keep their immutable content key until a new reviewed version is published. Publication atomically switches Curriculum/Workbook/Simulator/Skill Labs. Four explicit checks gate release. Previous editions can be restored.

## Gemini setup

Set `GEMINI_API_KEY` as a private runtime secret using Sites environment settings; never a public text file, browser field or source constant. Optional model and voice settings are listed in `.env.example`. No live calls succeed without this key. API availability, charges and quotas depend on the configured Google project. No automatic fallback model is used: a denied or unavailable model is surfaced to the administrator.

Calls use the official v1beta REST GenerateContent endpoint; this build does not require React or the SDK. Translation validates one result for every source ID. TTS checks returned bytes: genuine RIFF/WAV is retained; declared 16-bit PCM is wrapped in a WAV header. Unknown formats fail without publishing. Text caching includes exact source, language and model. Audio caching includes exact translated text, language, model, voice and format version. Audio plays saved files and has no device-voice dependency. Source pictures containing embedded text require reviewed replacement artwork; machine translation does not erase labels from original pictures.

## Background queue runner

`POST /api/runner/tick` performs one bounded checkpoint. Queue creation/resume starts one checkpoint using `waitUntil`; this alone is not a durable scheduler. A linked unattended Sites cloud task must call the endpoint repeatedly to continue after the page closes. Jobs remain persisted when a provider is blocked. The private runner is accessible only through Sites owner/service access; do not store service bearer tokens in source or schedule prompts. The cloud task obtains current private Site access on every run and processes up to 100 checkpoints. Its hourly recovery cadence is reflected in the configuration panel. A production queue service can replace this runner without changing the content or job schema.

## Limits

No claim of full-platform translation until each legacy surface is migrated and its language edition reviewed. The configured reader translates workbook text, titles, its controls and supported simulation feedback from a single approved package; the old hard-coded simulators and old app interface remain compatibility views. New physical mechanisms require new reviewed simulation code. Read-only UI hides print/download controls; browser-delivered material cannot be made impossible to save, screenshot or print. Student evidence is still browser-local, labelled accordingly. No voice doubt capture or AI-generated wiring diagrams were added in this configuration update.

## Verification

`npm test` checks DOCX extraction, references, conditional storage, language deduplication, sequential checkpoints, blocked-key behaviour, stale draft rejection, publish gates, WAV/PCM handling and imported source maps. Provider responses in tests are mocked; they do not establish live Gemini access, translation quality or speech quality. Live provider checks must follow secret setup.
