# MindMetrix SkillOS

Open index.html or serve this folder with `python -m http.server 8000` and open http://localhost:8000. Curriculum → Grade 6, 7 or 8 → Workbook opens the reader. The Simulator tab launches the matching lab inside SkillOS.

## Configure workbooks

1. Keep original PDFs in a private folder outside the deployed website. Convert Word documents to PDF first.
2. Copy workbooks/catalog.example.json into that private folder as catalog.json. Set titles and PDF paths. Paths are relative to catalog.json. Each grade can have multiple entries.
3. Install PyMuPDF with `python -m pip install pymupdf`.
4. Run `python workbooks/build.py /path/to/private/catalog.json` from the SkillOS folder.
5. Deploy the updated workbooks/catalog.js and workbooks/pages together. Do not upload the originals or private configuration. Grade 6 initially uses a PDF converted from the supplied Word workbook.

## Access and copying

The main reader serves rendered page images, not original PDFs. It has no download or print controls, and its print stylesheet hides the app. Browsers can still save delivered images or capture screenshots. If access is restricted to enrolled users, protect the entire deployment, including page images and simulator assets, with authentication. The ZIP itself is a local distribution and is not an authentication system.
