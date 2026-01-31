# UI Customization: Icon and Title

## Business Outcome
Personalize the web application by replacing default Next.js branding with project-specific identity. This improves brand recognition and user trust.

## Timeline (UTC+8, CST)
- 2026-01-31 10:25:30 CST: Updated `layout.tsx` metadata title to "人类想法".
- 2026-01-31 10:26:15 CST: Created a custom green checkmark SVG icon (`icon.svg`).
- 2026-01-31 10:27:00 CST: Disabled default `favicon.ico` in favor of the new SVG icon.

## What changed
- **Title**: Changed from "Create Next App" to "人类想法".
- **Favicon**: Replaced Next.js logo with a green checkmark circular icon.
  - File: `apps/web/src/app/icon.svg`
- **Metadata**: Added description "人类在该领域的一些思考和问题".

## Validation
- Local: Verified metadata in `layout.tsx`.
- Assets: Verified `icon.svg` content.
