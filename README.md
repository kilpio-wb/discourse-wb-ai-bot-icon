# AI Bot Centered Icon — Discourse Theme Component

Moves the AI Bot icon from the right-side header icons to the **center of the header**, restyled with a bright color, glow effect, pulse animation, and optional text label.

## Installation

### Option A: Upload as ZIP

1. Download/zip this folder
2. Go to **Admin → Customize → Themes**
3. Click **Install → Upload** and select the ZIP
4. Add the component to your active theme

### Option B: Git repository

1. Push this folder to a Git repo
2. Go to **Admin → Customize → Themes**
3. Click **Install → From a git repository** and paste the URL
4. Add the component to your active theme

## Configuration

After installing, click the component name under **Admin → Customize → Themes** to access settings:

| Setting | Default | Description |
|---|---|---|
| `icon_color` | `#666666` (medium gray) | Primary color of the icon and label |
| `icon_glow_color` | `#BBBBBB` (light gray) | Color of the glow/pulse effect |
| `icon_bg_color` | `#FFFFFF` (white) | Background circle behind the icon |
| `enable_pulse_animation` | `true` | Subtle pulsing glow to attract attention |
| `icon_scale` | `1.35` | Size multiplier (1.0 = normal) |
| `show_greeting_label` | `true` | Whether to show the text label |
| `enable_anon_button` | `true` | Show the centered "Ask AI" button to anonymous visitors too (see below) |
| `anon_center_min_width` | `768` | Anonymous only: below this header width (px) the centered button is replaced by the compact bot icon on the right. Raise it if the centered button overlaps the log in / sign up buttons; must be ≥ 580 |

The label text (e.g. "Ask AI") is localized — it follows the user's Discourse interface language. Supported locales: en, de, fr, es, pt, ru, it, nl, ja, ko, zh_CN, zh_TW, ar, pl, tr. To add a language, create a new file in `locales/`.

## Anonymous visitors

The discourse-ai bot button only exists in the DOM for logged-in users whose account has an AI bot enabled, so out of the box anonymous visitors see nothing to click.

With `enable_anon_button` on (the default), the component builds an identical-looking centered "Ask AI" button for anonymous visitors as well. Because the AI bot itself is not available without an account, clicking it does **not** start a bot conversation — instead it opens a small dialog with two choices:

- **Log in** — opens Discourse's native login modal.
- **Sign up** — opens Discourse's native create-account modal.

This keeps the call-to-action visible to everyone without spending any AI tokens on anonymous traffic. The button looks the same as the logged-in one (same glow, pulse, label). On smaller screens and on scrolled topic pages — where the centered button gives way to the docked topic title — a compact AI icon appears in the right-side header icon group instead, mirroring the logged-in fallback so anonymous visitors always have the button available. Because anonymous headers show wide "Log in" / "Sign up" buttons that the centered button can overlap, anonymous visitors switch to that compact icon below `anon_center_min_width` (default 768px) rather than the 580px used for logged-in users; raise the setting if the overlap persists on your header. The dialog text is localized in English and Russian; other interface languages fall back to English for the dialog copy while the button label stays localized.

Set `enable_anon_button` to `false` to show the button to logged-in users only (original behavior).

## Customization Tips

- For a **red/urgent** look: set `icon_color` to `#FF4444`, `icon_glow_color` to `#FF4444`
- For a **blue/calm** look: set `icon_color` to `#00B4FF`, `icon_bg_color` to `#0a1628`
- For a **gold/premium** look: set `icon_color` to `#FFD700`, `icon_bg_color` to `#1a1500`
- To **disable the label**, set `show_greeting_label` to `false`
- To **disable the pulse**, set `enable_pulse_animation` to `false`

## File Structure

```
discourse-wb-ai-bot-icon/
├── about.json              # Component metadata
├── settings.yml            # Configurable settings
├── common/
│   └── common.scss         # Styles (colors, glow, pulse, layout)
├── javascripts/
│   └── discourse/
│       └── api-initializers/
│           └── ai-bot-centered-icon.js  # JS to reposition button to center
├── locales/                # Translations for the greeting label
│   ├── en.yml
│   ├── de.yml, fr.yml, es.yml, ...
│   └── (15 languages)
└── README.md
```

## Notes

- The component hides the original right-side AI bot button and places a styled clone in the center of the header.
- The exact CSS selector for the AI bot button may vary between Discourse versions. If the button doesn't move, inspect your header and adjust the selectors in `ai-bot-centered-icon.js`.
- On screens narrower than 580px, the centered clone is hidden and the original AI bot button stays in the right-side header icon group — this avoids overlapping the logo or wrapping below the header on narrow layouts.
