# Project: Meta Graph API & Instagram Insights Enhancement

## Architecture
`analyze_instagram.js` is a standalone Node.js script. It does the following:
1. Fetches the Instagram account profile.
2. Fetches follower hourly activity insights (`online_followers`).
3. Fetches media list (latest 200 posts) from Meta Graph API.
4. Enhances media list with insights (reach, impressions, saved, reels-specific metrics).
5. Integrates caching, batching, offline fallback, and calculates/formats statistics.
6. Generates a redesigned, interactive HTML report (`reporte_instagram_dos_soles.html`).

Additional project files:
- `instagram_data.json`: Local cache storing profile, media posts (with insights), hourly activity statistics, etc.
- `auditoria_instagram_organico_dos_soles_slides.html`: HTML deck for slides presentation.
- `index.html`: Main navigation portal for the audit files.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Planning & Analysis | Decompose goals, structure tests, check requirements | none | DONE |
| 2 | Implementation | Update Graph API querying, batching, caching, offline fallback, and HTML report styling/interactivity in `analyze_instagram.js` | M1 | DONE |
| 3 | Slides Redesign & Expansion | Modify `auditoria_instagram_organico_dos_soles_slides.html` to expand deck from 8 to 11 slides (Slide 9: Enlaces y Conversión, Slide 10: Segmentación del Feed, Slide 11: Propuesta Mix de Oro). Update script indicators to `/ 11`. | M2 | PLANNED |
| 4 | Portal Verification | Verify `index.html` navigation links lead to `reporte_instagram_dos_soles.html` and `auditoria_instagram_organico_dos_soles_slides.html`. | M3 | PLANNED |
| 5 | Verification & Testing | Run `node analyze_instagram.js` in offline mode to verify fallback loads local data, compile without errors, check console. | M4 | PLANNED |

## Code Layout
- `analyze_instagram.js`: Main Node.js script for data fetching, analysis, and report generation.
- `discover_instagram.js`: Helper script (if present/relevant).
- `instagram_data.json`: Cached Instagram account and posts metrics data (input/output).
- `reporte_instagram_dos_soles.html`: Redesigned interactive HTML dashboard report (output).
- `auditoria_instagram_organico_dos_soles_slides.html`: Slide presentation HTML file.
- `index.html`: Navigation portal page.

## Interface Contracts
### Graph API to Local Cache Map
- Cache format: JSON object with `{ accountName, username, followersCount, profilePicture, posts: [...] }`.
- Post object in cache: must include `insights` block (with metrics matching type) and `media_product_type`.
