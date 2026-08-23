#!/usr/bin/env python3
"""Build same-origin public news JSON for The Verifier.

Reads data/sources.json, fetches configured RSS/Atom feeds directly from the
GitHub Actions runner, sanitizes/normalizes story metadata, and writes:
  data/generated/latest.json
  data/generated/daily/YYYY-MM-DD.json

No credentials are required. Feed inclusion is discovery metadata, not factual
verification or endorsement.
"""
from __future__ import annotations

import email.utils
import html
import json
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data" / "sources.json"
OUT_DIR = ROOT / "data" / "generated"
DAILY_DIR = OUT_DIR / "daily"
MAX_ITEMS_PER_FEED = 20
MAX_TOTAL_STORIES = 400
TIMEOUT = 18
USER_AGENT = "TheVerifierFeedBuilder/1.0 (+https://vervenveda.com/theverifier.github.io/)"

TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


def clean_text(value: object, limit: int = 5000) -> str:
    text = html.unescape(str(value or ""))
    text = TAG_RE.sub(" ", text)
    text = SPACE_RE.sub(" ", text).strip()
    return text[:limit]


def safe_https_url(value: object) -> str:
    raw = str(value or "").strip()
    try:
        parsed = urllib.parse.urlsplit(raw)
    except ValueError:
        return ""
    if parsed.scheme.lower() != "https" or not parsed.netloc:
        return ""
    if parsed.username or parsed.password:
        return ""
    return urllib.parse.urlunsplit(parsed)


def parse_date(value: str) -> tuple[str, int]:
    raw = clean_text(value, 200)
    if not raw:
        return "", 0
    dt = None
    try:
        dt = email.utils.parsedate_to_datetime(raw)
    except Exception:
        pass
    if dt is None:
        normalized = raw.replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(normalized)
        except Exception:
            return raw, 0
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    dt = dt.astimezone(timezone.utc)
    return dt.isoformat().replace("+00:00", "Z"), int(dt.timestamp() * 1000)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_text(node: ET.Element, names: set[str]) -> str:
    for child in list(node):
        if local_name(child.tag) in names:
            return "".join(child.itertext()).strip()
    return ""


def find_link(node: ET.Element) -> str:
    for child in list(node):
        if local_name(child.tag) == "link":
            href = child.attrib.get("href", "").strip()
            rel = child.attrib.get("rel", "alternate").lower()
            if href and rel in {"alternate", ""}:
                return href
            text = (child.text or "").strip()
            if text:
                return text
    return ""


def find_image(node: ET.Element, description: str) -> str:
    for child in list(node):
        name = local_name(child.tag)
        if name in {"enclosure", "content", "thumbnail"}:
            candidate = child.attrib.get("url", "") or child.attrib.get("href", "")
            mime = child.attrib.get("type", "").lower()
            if candidate and (not mime or mime.startswith("image/") or name == "thumbnail"):
                url = safe_https_url(candidate)
                if url:
                    return url
    match = re.search(r"<img[^>]+src=[\"']([^\"']+)", description or "", flags=re.I)
    return safe_https_url(match.group(1)) if match else ""


def normalize_item(node: ET.Element, source: dict) -> dict | None:
    title = clean_text(child_text(node, {"title"}), 500)
    link = safe_https_url(find_link(node))
    description_raw = child_text(node, {"description", "summary", "content", "encoded"})
    description = clean_text(description_raw, 1200)
    pub_raw = child_text(node, {"pubdate", "published", "updated", "date"})
    pub_date, pub_ms = parse_date(pub_raw)
    image = find_image(node, description_raw)
    if not title or not link:
        return None
    source_id = clean_text(source.get("id"), 100)
    source_name = clean_text(source.get("name"), 200)
    return {
        "id": f"{source_id}:{link}"[:900],
        "title": title,
        "description": description,
        "link": link,
        "image": image,
        "pubDate": pub_date,
        "pubMs": pub_ms,
        "sourceId": source_id,
        "source": source_name,
        "region": clean_text(source.get("region"), 120),
        "country": clean_text(source.get("country"), 120),
        "languages": list(source.get("languages") or [])[:8],
        "topics": list(source.get("topics") or [])[:12],
        "sourceType": clean_text(source.get("sourceType"), 120),
        "sourceHomepage": safe_https_url(source.get("homepage")),
        "verificationStatus": "discovered",
    }


def fetch_feed(source: dict) -> tuple[list[dict], dict]:
    feed = safe_https_url(source.get("feed"))
    started = time.time()
    status = {
        "id": source.get("id"),
        "name": source.get("name"),
        "feed": feed,
        "ok": False,
        "count": 0,
        "error": "",
        "checkedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    if not feed:
        status["error"] = "No configured feed"
        return [], status
    request = urllib.request.Request(
        feed,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.4",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            raw = response.read(4_000_000)
        root = ET.fromstring(raw)
        nodes = [n for n in root.iter() if local_name(n.tag) in {"item", "entry"}]
        stories = []
        for node in nodes[:MAX_ITEMS_PER_FEED]:
            item = normalize_item(node, source)
            if item:
                stories.append(item)
        status["ok"] = True
        status["count"] = len(stories)
        status["elapsedMs"] = round((time.time() - started) * 1000)
        return stories, status
    except (urllib.error.URLError, urllib.error.HTTPError, socket.timeout, ET.ParseError, ValueError) as exc:
        status["error"] = clean_text(exc, 240)
        status["elapsedMs"] = round((time.time() - started) * 1000)
        return [], status


def dedupe(stories: list[dict]) -> list[dict]:
    seen_links: set[str] = set()
    seen_titles: set[str] = set()
    result = []
    for story in stories:
        link_key = story["link"].split("#", 1)[0].split("?", 1)[0].lower()
        title_key = SPACE_RE.sub(" ", story["title"].lower()).strip()
        if link_key in seen_links or title_key in seen_titles:
            continue
        seen_links.add(link_key)
        seen_titles.add(title_key)
        result.append(story)
    return result


def build() -> int:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    sources = [s for s in data.get("sources", []) if s.get("enabled") is not False]
    feed_sources = [s for s in sources if safe_https_url(s.get("feed"))]
    all_stories: list[dict] = []
    health: list[dict] = []

    for index, source in enumerate(feed_sources, start=1):
        stories, status = fetch_feed(source)
        all_stories.extend(stories)
        health.append(status)
        print(f"[{index:02d}/{len(feed_sources):02d}] {source.get('name')}: {status['count']} item(s) {'OK' if status['ok'] else status['error']}")

    stories = dedupe(all_stories)
    stories.sort(key=lambda item: (int(item.get("pubMs") or 0), item.get("source", "")), reverse=True)
    stories = stories[:MAX_TOTAL_STORIES]

    generated = datetime.now(timezone.utc)
    payload = {
        "schemaVersion": 1,
        "generatedAt": generated.isoformat().replace("+00:00", "Z"),
        "sourceRegistryVersion": data.get("schemaVersion", 1),
        "sourceRegistryUpdated": data.get("updated", ""),
        "method": "direct server-side RSS/Atom retrieval from configured canonical feeds; same-origin JSON publication",
        "disclosure": "Stories are discovered from publisher feeds. Inclusion is not endorsement or factual verification.",
        "feedSourcesConfigured": len(feed_sources),
        "feedSourcesSuccessful": sum(1 for h in health if h.get("ok")),
        "storyCount": len(stories),
        "stories": stories,
        "sourceHealth": health,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    (OUT_DIR / "latest.json").write_text(rendered, encoding="utf-8")
    daily_path = DAILY_DIR / f"{generated.date().isoformat()}.json"
    daily_path.write_text(rendered, encoding="utf-8")
    print(f"Wrote {len(stories)} unique stories to {OUT_DIR / 'latest.json'}")
    return 0 if stories else 2


if __name__ == "__main__":
    sys.exit(build())
