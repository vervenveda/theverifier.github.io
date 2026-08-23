# The Verifier

**Truth · Facts · Accountability**

The Verifier is an independent, public-interest news and research platform created to help people examine information carefully, compare perspectives, explore original sources, and reach informed conclusions for themselves.

It is part of the broader Verve N Veda public resource ecosystem and serves as a clear, accessible doorway into current reporting, research, education, science, public records, historical archives, and media-literacy tools.

## Purpose

The Verifier exists to support thoughtful inquiry in a world where information can be incomplete, fast-moving, emotionally charged, disputed, or difficult to evaluate.

The platform encourages readers to:

- compare multiple independent sources;
- distinguish reporting from analysis, commentary, and advocacy;
- identify primary records and supporting evidence;
- recognize uncertainty, corrections, and unresolved claims;
- examine historical, geographic, and cultural context;
- practice responsible news and media literacy;
- remain independent in their judgment.

The goal is not to tell readers what to think. The goal is to make evidence, provenance, context, and comparison easier to reach.

## What the Platform Includes

The Verifier brings together a growing collection of public-facing applications and resource areas, including:

- live and interactive news discovery;
- global and regional source directories;
- the Daily Top-30 local edition;
- research and source-comparison tools;
- science and environmental reporting;
- education and youth-focused news resources;
- public-interest data exploration;
- historical and vintage news archives;
- current-events and media-literacy activities;
- clearly labeled editorial and opinion columns;
- connections to related public resource repositories.

New tools and sections may be added as the platform develops.

## The Daily Top 30

The Daily Top 30 is designed to create a source-diverse local edition from configured public feeds.

Its ranking is intentionally not based on outrage, sensational language, virality, or ideological agreement. The current public model favors:

- freshness;
- source diversity;
- regional rotation;
- basic record completeness;
- limits on concentration from any single publisher.

The appearance of a story in a feed or daily edition means that a configured source published it. It does **not** mean The Verifier has certified every claim in the story as true.

Readers are encouraged to open the original source, compare independent coverage, and inspect primary records where available.

## Canonical Source Registry

The Verifier maintains one public source registry at:

`data/sources.json`

The registry records source identity, region, language, topic, public homepage, and—when available—a configured public feed endpoint.

Source inclusion is not an endorsement, political rating, or declaration of reliability. It exists to support access, provenance, geographic breadth, and comparison.

Feed endpoints can change. Applications are expected to fail visibly and safely when a feed is unavailable rather than silently presenting stale material as current.

## Editorial Principles

The Verifier is guided by the following public standards.

### Source Transparency

Readers should be able to distinguish among primary records, official statements, independent reporting, analysis, commentary, opinion, advocacy, and unresolved claims.

### Accuracy and Context

Information should be presented with enough context to reduce misunderstanding. Material uncertainty, limitations, meaningful gaps, and disputed interpretations should not be hidden.

### Corrections and Accountability

Meaningful errors should be corrected transparently. Opinion, inference, prediction, allegation, and model output should not be presented as established fact.

### Reader Independence

Readers should be encouraged to inspect evidence, compare sources, question assumptions, and form conclusions independently.

### Human Dignity

The Verifier may criticize governments, institutions, ideologies, political movements, corporations, leaders, armed groups, public policies, or documented conduct as strongly as the evidence warrants.

It does not treat nationality, ethnicity, religion, race, sex, identity, or civilian populations as less than human. Editorial disagreement does not justify collective dehumanization.

### Responsible Access

The platform is intended to make research and public-interest information easier to approach without exploiting user attention or encouraging unnecessary data collection.

## Reporting, Verification, and Opinion Are Different Things

The Verifier deliberately keeps these functions distinct:

**Reporting discovery** surfaces material published by configured sources.

**Verification tools** help readers compare coverage, search primary records, review fact-checking resources, inspect dates, and examine provenance.

**Editorial columns** present the named author's argument or interpretation and should be clearly identified as opinion or editorial material.

A source appearing in the directory is not automatically verified. A headline appearing in a live feed is not automatically verified. An editorial assertion does not become a fact merely because it appears on The Verifier.

## Privacy and Local Sovereignty

The Verifier is designed with a local-first and privacy-conscious philosophy.

Where supported by an application, preferences, saved stories, source selections, and daily editions can remain on the visitor's own device.

The current local persistence architecture uses:

- IndexedDB for structured local editions and saved records;
- browser storage for lightweight preferences and compatibility fallback;
- Cache Storage and a Service Worker for selected same-origin application assets;
- JSON export/import for user-controlled portability.

The browser-based Local Cloud is a device-local data layer. It is not presented as a remote account service or as a conventional server running while the browser is closed.

Live-news applications necessarily contact public information sources or interoperability services when retrieving current feed data. These dependencies should be disclosed in the interface and reduced where practical.

## External-Data Safety

Remote feeds, imported backups, and external URLs are treated as untrusted data.

The shared public safety layer is located at:

`assets/verifier-safety.js`

Hardened applications are expected to:

- convert remote article markup to plain text before rendering;
- validate outbound URL protocols;
- avoid inserting untrusted feed fields directly through `innerHTML`;
- use safe external-link attributes;
- disclose cache or fallback mode rather than implying stale data is live.

Repository CI checks these requirements on the hardened news surfaces.

## Accessibility

The project aims to support:

- keyboard navigation;
- readable contrast;
- responsive layouts;
- clear headings and labels;
- reduced-motion preferences;
- understandable navigation;
- access across desktop and mobile devices.

Accessibility is an ongoing commitment. Older experimental applications may be modernized as they are brought under the current Verifier standards.

## Youth-Facing Material

Youth-facing interfaces require a higher standard than simple keyword exclusion.

Automated sensitive-content filters should be treated as screening aids rather than guarantees. Child-facing applications should prefer curated source sets, age-appropriate presentation, explicit fallback behavior, and transparent limits.

## Project Status

The Verifier is an evolving public resource. Some applications are current production candidates, while others remain experimental, legacy, or scheduled for consolidation.

A major project goal is to reduce duplication by moving applications toward shared source, safety, storage, and provenance layers.

## Public Website

Canonical public address:

**https://vervenveda.com/theverifier.github.io/**

GitHub Pages project address:

**https://vervenveda.github.io/theverifier.github.io/**

Both addresses may be used for access, but project metadata should prefer the canonical public address above.

## Repository Guidance

This repository contains public-facing materials for The Verifier.

Public documentation is intentionally limited to information appropriate for visitors, contributors, auditors, educators, and researchers. It does not publish credentials, private operational details, confidential planning, protected user information, or sensitive security procedures.

Responsible reports concerning accessibility, accuracy, broken links, source problems, or security should use the issue or contact process designated by the project owner.

## Automated Integrity Checks

The repository includes an integrity workflow that checks, among other things:

- canonical source-registry JSON validity;
- duplicate source IDs;
- HTTPS source and feed configuration;
- presence of shared safety/local-cloud assets;
- JavaScript syntax on hardened applications;
- regression against known unsafe remote-feed rendering patterns;
- Daily Top-30 source-concentration limits.

Automated checks support human review; they do not replace it.

## Responsible Use

The Verifier is an educational and informational resource. It does not replace qualified legal, medical, financial, academic, emergency, or other professional advice.

Users remain responsible for evaluating information, reviewing original sources, and applying appropriate judgment before making consequential decisions.

## Intellectual Property

Unless expressly identified otherwise, original Verifier interface design, editorial writing, explanatory text, project-specific code, branding, and original media remain subject to the rights of their respective creator or rights holder.

Third-party news articles, headlines, logos, images, data, feeds, trademarks, and linked resources remain the property of their respective publishers or rights holders and are used or linked for identification, research, interoperability, commentary, comparison, or educational purposes as applicable.

The presence of a link or source entry does not imply sponsorship, endorsement, partnership, or ownership.

## Public Development Principle

The Verifier is strongest when readers can understand what the interface is doing.

Where an automated process ranks, filters, caches, summarizes, or labels material, the public-facing product should describe that behavior plainly enough that a reader does not have to guess what the system means.

**Truth is not a badge. Verification is a process.**
