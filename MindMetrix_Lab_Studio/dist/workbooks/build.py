"""Render configured PDFs as browser-readable pages. Requires PyMuPDF."""
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

import fitz

root = Path(__file__).resolve().parent
config_path = Path(sys.argv[1]).resolve()
config = json.loads(config_path.read_text(encoding="utf-8"))
manifest = {}
with tempfile.TemporaryDirectory(dir=root) as staging:
    output = Path(staging)
    for grade, books in config.items():
        if grade not in {"6", "7", "8"}:
            raise ValueError(f"Unsupported grade: {grade}")
        manifest[grade] = []
        for index, book in enumerate(books, 1):
            prefix = f"grade-{grade}-{index}"
            pages = []
            with fitz.open(config_path.parent / book["pdf"]) as pdf:
                for number, page in enumerate(pdf, 1):
                    image = f"{prefix}-{number:03}.jpg"
                    page.get_pixmap(matrix=fitz.Matrix(1.65, 1.65), alpha=False).save(output / image, jpg_quality=87)
                    pages.append("workbooks/pages/" + image)
            manifest[grade].append({"title": book["title"], "pages": pages})
    target = root / "pages"
    target.mkdir(exist_ok=True)
    for image in output.iterdir():
        shutil.move(image, target / image.name)
    current = {Path(image).name for books in manifest.values() for book in books for image in book["pages"]}
    for image in target.glob("grade-*.jpg"):
        if re.fullmatch(r"grade-[678]-\d+-\d+\.jpg", image.name) and image.name not in current:
            image.unlink()
    (root / "catalog.js").write_text("window.skillOSWorkbooks = " + json.dumps(manifest) + ";\n", encoding="utf-8")
