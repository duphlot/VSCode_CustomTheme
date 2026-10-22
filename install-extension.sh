#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VSCODE_DIR="$HOME/.vscode"
EXT_DIR="$VSCODE_DIR/extensions/ptdung.bg-effects-0.1.0"

mkdir -p "$VSCODE_DIR"
sed "s|{{HOME}}|$HOME|g" "$SCRIPT_DIR/config/custom.css" > "$VSCODE_DIR/custom.css"
cp "$SCRIPT_DIR/config/bg_controller.js" "$SCRIPT_DIR/config/webview.css" "$VSCODE_DIR/"

rm -rf "$EXT_DIR"
mkdir -p "$EXT_DIR"
rsync -a --exclude 'README.md' --exclude 'media/images' "$SCRIPT_DIR/background-effects/" "$EXT_DIR/"

echo "Installed custom.css, bg_controller.js and webview.css into $VSCODE_DIR"
echo "Installed the bg-effects extension into $EXT_DIR"
echo "Quit VS Code, reopen it, then run: Enable Custom CSS and JS"
