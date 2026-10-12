"""Check local static references in all Verifier HTML pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag in {"a", "iframe", "script", "link", "img", "source"}:
            for key in ("href", "src"):
                if key in data:
                    self.links.append(data[key])

def resolve(page, value):
    if not value or value.startswith(("#", "//", "data:", "mailto:", "tel:", "javascript:")):
        return None
    if any(marker in value for marker in ("{{", "<%", "{%")) or chr(36) + "{" in value:
        return None
    url = urlsplit(value)
    if url.scheme or url.netloc:
        return None
    path = unquote(url.path)
    if not path: return None
    parts = [] if path.startswith("/") else list(page.relative_to(ROOT).parts[:-1])
    for part in path.lstrip("/").split("/"):
        if part in ("", "."): continue
        if part == "..":
            if not parts: raise ValueError("path traverses repository root")
            parts.pop()
        else: parts.append(part)
    return ROOT.joinpath(*parts)

def main():
    bad, checked = [], 0
    pages = sorted(ROOT.rglob("*.html"))
    for page in pages:
        parser = Links()
        parser.feed(page.read_text(encoding="utf-8"))
        for value in parser.links:
            try:
                target = resolve(page, value)
                if target is None: continue
                checked += 1
                if not target.exists() and not (target / "index.html").exists():
                    bad.append(f"{page.relative_to(ROOT)} -> {value}")
            except ValueError as exc:
                bad.append(f"{page.relative_to(ROOT)} -> {value}: {exc}")
    print(f"Checked {checked} local references in {len(pages)} pages")
    for item in bad:
        print("BROKEN:", item)
    return int(bool(bad))

if __name__ == "__main__":
    sys.exit(main())
