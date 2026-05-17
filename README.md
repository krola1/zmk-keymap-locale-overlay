# zmk-keymap-locale-overlay

A userscript that visually translates key labels in the
[ZMK Keymap Editor](https://nickcoutsos.github.io/keymap-editor/) to better match your local keyboard layout.

> This project is **visual-only**: it does not modify exported keymaps or editor data.

## What it does

- Adds a floating **🌐 Locale Overlay** panel in the editor
- Lets you choose a locale/layout mapping (US, Norwegian, Swedish, Finnish, German)
- Replaces visible key labels based on selected layout
- Preserves original labels on hover
- Saves your selected layout and enabled/disabled state in browser storage

## Requirements

- A desktop browser (Chrome, Edge, Firefox, etc.)
- A userscript manager extension:
  - [Tampermonkey](https://www.tampermonkey.net/)
  - [Violentmonkey](https://violentmonkey.github.io/)

## Installation

### Option 1 (recommended): install from raw script URL

1. Install Tampermonkey or Violentmonkey in your browser.
2. Open this repository file:
   - `zmk-keymap-locale-overlay.user.js`
3. Click **Raw**.
4. Your userscript manager should open an install prompt.
5. Confirm installation.

### Option 2: manual copy/paste install

1. Install Tampermonkey or Violentmonkey.
2. Create a new userscript in the extension dashboard.
3. Copy all content from `zmk-keymap-locale-overlay.user.js`.
4. Paste it into the new userscript and save.

## How to use

1. Open: <https://nickcoutsos.github.io/keymap-editor/>
2. Wait for the panel in the bottom-right: **🌐 Locale Overlay**
3. Choose your locale from the dropdown.
4. Leave **Enabled** checked to apply translations.
5. Uncheck **Enabled** to temporarily disable translation.
6. Hover translated keys to briefly view original key text.

## Current layouts

- `us` (no translation)
- `nb` (Norwegian)
- `sv` (Swedish)
- `fi` (Finnish)
- `de` (German)

## Adding or editing a layout

1. Open `zmk-keymap-locale-overlay.user.js`.
2. Find the `LAYOUTS` object.
3. Add or edit a layout entry:
   - `label`: display name in dropdown
   - `map`: key/value pairs where:
     - key = ZMK code from editor title (for example `APOS`, `SEMI`, `LS(N2)`)
     - value = text you want displayed
4. Save and reinstall/update the userscript in your extension.
5. Reload the keymap editor page.

## Updating

When this repository changes:

1. Open your userscript manager.
2. Reinstall from **Raw** URL or replace script content manually.
3. Reload the ZMK Keymap Editor tab.

## Troubleshooting

### The panel does not appear

- Confirm the userscript is enabled in Tampermonkey/Violentmonkey.
- Confirm you are on:
  `https://nickcoutsos.github.io/keymap-editor/*`
- Refresh the page after installing.

### Key labels do not change

- Ensure **Enabled** is checked in the panel.
- Switch to a non-US layout in the dropdown.
- Some keys are intentionally not replaced (for example icon-based keys).

### Changes to layout mappings are not visible

- Save script changes in the userscript manager.
- Reload the editor page.
- If needed, disable/enable the script once in the extension dashboard.

## License

If you want to add a license, create a `LICENSE` file and update this section.
