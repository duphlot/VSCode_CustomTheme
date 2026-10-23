#!/usr/bin/env bash
set -e

CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
RED='\033[1;31m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   VS CODE CUSTOM THEME & ENVIRONMENT 1-CLICK INSTALLER         ${NC}"
echo -e "${CYAN}================================================================${NC}"

OS="$(uname -s)"
if [ "$OS" = "Darwin" ]; then
    VSCODE_USER_DIR="$HOME/Library/Application Support/Code/User"
elif [ "$OS" = "Linux" ]; then
    VSCODE_USER_DIR="$HOME/.config/Code/User"
else
    echo -e "${RED}[Error] Operating system $OS is not supported by this script.${NC}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$VSCODE_USER_DIR"
mkdir -p "$VSCODE_USER_DIR/snippets"
mkdir -p "$HOME/.vscode"

if ! command -v code &> /dev/null; then
    if [ -f "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]; then
        export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"
        echo -e "${GREEN}[OK]${NC} Found the 'code' command at /Applications/Visual Studio Code.app"
    else
        echo -e "${YELLOW}[Note]${NC} The 'code' command was not found in PATH."
        echo "You can continue copying the config files, but you will need to install the extensions manually."
        echo "Tip: open VS Code, press Cmd+Shift+P and run 'Shell Command: Install code command in PATH'."
    fi
fi

BACKUP_TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$VSCODE_USER_DIR/backup_$BACKUP_TIMESTAMP"

if [ -f "$VSCODE_USER_DIR/settings.json" ]; then
    echo -e "${BLUE}[Backup]${NC} Backing up the existing configuration to: ${BACKUP_DIR}"
    mkdir -p "$BACKUP_DIR"
    for file in "$VSCODE_USER_DIR/settings.json" "$VSCODE_USER_DIR/keybindings.json" \
                "$VSCODE_USER_DIR/tasks.json" "$HOME/.vscode/custom.css"; do
        [ -f "$file" ] && cp "$file" "$BACKUP_DIR/"
    done
fi

if command -v code &> /dev/null; then
    echo -e "${BLUE}[Extensions]${NC} Installing the required extensions..."
    EXT_FILE="$SCRIPT_DIR/extensions.txt"
    if [ -f "$EXT_FILE" ]; then
        while IFS= read -r ext || [ -n "$ext" ]; do
            ext=$(echo "$ext" | xargs)
            [[ "$ext" =~ ^#.*$ ]] && continue
            [ -z "$ext" ] && continue
            echo -e "  -> Installing: ${CYAN}$ext${NC}..."
            code --install-extension "$ext" --force || true
        done < "$EXT_FILE"
    fi
fi

if [ "$OS" = "Darwin" ]; then
    if ! ls /Library/Fonts/*JetBrainsMono* ~/Library/Fonts/*JetBrainsMono* &>/dev/null; then
        echo -e "${YELLOW}[Font]${NC} JetBrains Mono font was not found on this machine."
        if command -v brew &> /dev/null; then
            echo -e "  -> Installing the font with Homebrew..."
            brew install --cask font-jetbrains-mono 2>/dev/null || true
        else
            echo "  -> Download the free JetBrains Mono font from: https://www.jetbrains.com/lp/mono/"
        fi
    fi
fi

echo -e "${BLUE}[Config]${NC} Configuring the global settings.json..."
sed "s|{{HOME}}|$HOME|g" "$SCRIPT_DIR/config/settings.template.json" > "$VSCODE_USER_DIR/settings.json"

echo -e "${BLUE}[Config]${NC} Copying keybindings, tasks and snippets..."
cp "$SCRIPT_DIR/config/keybindings.json" "$VSCODE_USER_DIR/keybindings.json"
cp "$SCRIPT_DIR/config/tasks.json" "$VSCODE_USER_DIR/tasks.json"
cp "$SCRIPT_DIR/config/leetcode.code-snippets" "$VSCODE_USER_DIR/snippets/leetcode.code-snippets"

echo -e "${BLUE}[Styles & Env]${NC} Copying custom.css and the LeetCode environment to ~/.vscode/..."
sed "s|{{HOME}}|$HOME|g" "$SCRIPT_DIR/config/custom.css" > "$HOME/.vscode/custom.css"
if [ -f "$SCRIPT_DIR/config/local.css" ]; then
    sed "s|{{HOME}}|$HOME|g" "$SCRIPT_DIR/config/local.css" >> "$HOME/.vscode/custom.css"
fi
cp "$SCRIPT_DIR/config/background_blur.png" "$HOME/.vscode/background_blur.png" 2>/dev/null || true
cp "$SCRIPT_DIR/config/background.png" "$HOME/.vscode/background.png" 2>/dev/null || true
cp "$SCRIPT_DIR/config/leetcode_env.h" "$HOME/.vscode/leetcode_env.h"
cp "$SCRIPT_DIR/config/leetcode_build.sh" "$HOME/.vscode/leetcode_build.sh"
chmod +x "$HOME/.vscode/leetcode_build.sh"

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  SETUP COMPLETED SUCCESSFULLY!                                 ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "${CYAN}Final activation steps:${NC}"
echo -e "1. Open VS Code."
echo -e "2. Press ${YELLOW}Cmd + Shift + P${NC} (or Ctrl + Shift + P on Linux)."
echo -e "3. Type ${YELLOW}Enable Custom CSS and JS${NC} and run that command."
echo -e "4. Restart VS Code when prompted to activate the transparent look and effects!"
echo -e "${CYAN}================================================================${NC}\n"
