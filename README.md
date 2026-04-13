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
| `icon_color` | `#4AF626` (bright green) | Primary color of the icon and label |
| `icon_glow_color` | `#4AF626` | Color of the glow/pulse effect |
| `icon_bg_color` | `#1a1a2e` (dark blue) | Background circle behind the icon |
| `enable_pulse_animation` | `true` | Subtle pulsing glow to attract attention |
| `icon_scale` | `1.3` | Size multiplier (1.0 = normal) |
| `greeting_text` | `Ask AI` | Text label next to the icon |
| `show_greeting_label` | `true` | Whether to show the text label |

## Customization Tips

- For a **red/urgent** look: set `icon_color` to `#FF4444`, `icon_glow_color` to `#FF4444`
- For a **blue/calm** look: set `icon_color` to `#00B4FF`, `icon_bg_color` to `#0a1628`
- For a **gold/premium** look: set `icon_color` to `#FFD700`, `icon_bg_color` to `#1a1500`
- To **disable the label**, set `show_greeting_label` to `false`
- To **disable the pulse**, set `enable_pulse_animation` to `false`

## File Structure

```
discourse-ai-bot-icon/
├── about.json              # Component metadata
├── settings.yml            # Configurable settings
├── common/
│   └── common.scss         # Styles (colors, glow, pulse, layout)
├── javascripts/
│   └── discourse/
│       └── api-initializers/
│           └── ai-bot-centered-icon.js  # JS to reposition button to center
└── README.md
```

## Notes

- The component hides the original right-side AI bot button and places a styled clone in the center of the header.
- The exact CSS selector for the AI bot button may vary between Discourse versions. If the button doesn't move, inspect your header and adjust the selectors in `ai-bot-centered-icon.js`.
- On mobile (< 600px), the button falls back to a relative position to avoid breaking narrow layouts.
