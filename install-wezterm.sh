#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_TARGET="$HOME/.wezterm.lua"
BIN_DIR="$HOME/.local/bin"

if ! python3 -c "import PIL" 2>/dev/null; then
    echo "Pillow is required by the 'setting' command. Install it with: python3 -m pip install Pillow"
    exit 1
fi

if [ -f "$CONFIG_TARGET" ] && ! cmp -s "$SCRIPT_DIR/wezterm/wezterm.lua" "$CONFIG_TARGET"; then
    BACKUP="$CONFIG_TARGET.backup_$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_TARGET" "$BACKUP"
    echo "Backed up the existing WezTerm config to $BACKUP"
fi

cp "$SCRIPT_DIR/wezterm/wezterm.lua" "$CONFIG_TARGET"

mkdir -p "$BIN_DIR"
chmod +x "$SCRIPT_DIR/wezterm/setting"
ln -sf "$SCRIPT_DIR/wezterm/setting" "$BIN_DIR/setting"

echo "Installed $CONFIG_TARGET"
echo "Linked the 'setting' command into $BIN_DIR (make sure it is on your PATH)"
echo "Open WezTerm and run: setting"
