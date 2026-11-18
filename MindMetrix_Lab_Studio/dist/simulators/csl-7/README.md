# Class 7 original-workbook interactive lab

Only source content: MindMetrix `Class7_First_Aid_Help_Point_Map.docx`, Library version 10. `book-data.js` records its SHA-256 and exact source identity. There are no external images, generated illustrations, external AI, invented schools, or generated biology results.

## Two forms

- `index.html?form=life`: Soil & Seed Lab, five activities, workbook pages 15–46.
- `index.html?form=services`: First-Aid & Emergency Preparedness, seven activities, pages 61–104.
- `activity=-1` opens Meet the Lab; `activity=0` opens the first activity.

The original artwork is extracted from the Word media, including its original crop rectangles. Complete page facsimiles preserve the book's artwork and wording. All numbered practical steps retain the original sequence and wording; combined headings in Activity 7 remain combined. Toolkit entries and record-table prompts come from the source. The original full source file is not served.

## Interaction scope

Clickable source toolkit; numbered picture-step navigation; source-input sorting; measured cup rehearsal; moisture care choices; actual 10-second pour and five-minute timer; learner-entered drainage readings; ten-position root observations; six-pot labels and rotation; means using learner readings and NE/NM/D codes; original fictional scenario choices; fact-versus-guess; caller/listener records; guide revision, rehearsal and handover records. The only prefilled outcome example is explicitly loaded and labelled as the workbook's example.

Animations illustrate actions, not physical results. This is not a calibrated biology engine or a replacement for supervised practical work. It cannot verify staff approval or real participation. The only supplied place example is the workbook's River School call-card example. Real school details remain learner/staff-entered.

## Storage

Workbook fields and reflections are browser-local under `skillos.csl7.workbook.<form>.v1`. Explicit Save merges the source-based activity record into the existing canonical project record. Existing project notes are preserved. Earlier prototype data is not automatically reused as an observation in the new workbook lab. Optional English speech uses the device's browser speech support.

## Regeneration and checks

Run `python private/scripts/extract-csl7-book.py --docx /path/to/source.docx --pdf /path/to/source-render.pdf` from the source root. The PDF must be a faithful rendering of that DOCX. Dependencies: lxml, Pillow and PyMuPDF. No source content is downloaded by that script.

Run `node tests/csl7-model.test.cjs`; check JavaScript syntax. Browser QA should verify toolkit crops, numbered steps, workbook-page enlargement, learner records and core actions. Source images are not photos of students using the live app; they are the unchanged workbook artwork.
