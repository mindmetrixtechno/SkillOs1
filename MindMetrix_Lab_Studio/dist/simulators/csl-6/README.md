# Class 6 original-workbook interactive lab

Source: uploaded MindMetrix_Class6_Workbook_v34.docx, Library ID libfile_a9a59586dc1c819182621a224edebc13. The source hash and edition are recorded in book-data.js. No external source, picture, fabricated harvest or food-service outcome is used.

- `index.html?form=life`: Terrace & Container Gardening, five activities, original pages 16–39.
- `index.html?form=services`: Farm to Table — School Health & Wellness Kiosk, five activities, pages 48–72, including the combined portfolio and final review.
- `activity=-1` opens the original toolkit; `activity=0` opens the first activity.

The experience preserves original illustrations/photos, 49 numbered practical steps, record tables, prompts and page facsimiles. Since this source uses page-break-before formatting, the extraction script uses those boundaries. Where a numbered step has only a small source icon, its activity's original overview photograph is shown with the correct illustration-page label. The step's own complete page remains available in the enlarged viewer.

Interactive tasks include footprint arithmetic, 5:3:2 mix proportions, learner-entered seed floating/sinking counts, teacher-guided moisture choices, tare/net weighing, harvest-value calculations, three kiosk work zones, anonymous A/B/neither/skipped practice tallies, the source recipe-card arithmetic, service records and batch cost/receipts. Worked recipe quantities are explicitly the book's example and require teacher approval. No treatment recipe, viability prediction, growth result, actual service permission or food-safety decision is generated.

Notes are browser-local under skillos.csl6.workbook.<form>.v1. Explicit Save merges source-based records into the canonical container-garden-6 or farm-table-6 project without removing existing project notes. There is no cross-device storage in this prototype. Optional English narration uses browser/device speech support.

Regenerate using `python private/scripts/extract-csl6-book.py --docx /path/to/source.docx --pdf /path/to/faithful-render.pdf`. It needs lxml, Pillow and PyMuPDF. The full original Word/PDF source is not served.

Run `node tests/csl6-model.test.cjs`, JavaScript syntax checks, directory navigation checks and browser interaction QA before deployment.
