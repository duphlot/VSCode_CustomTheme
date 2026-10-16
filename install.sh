#!/usr/bin/env bash
# ==============================================================================
#  VS Code Custom Theme & Environment 1-Click Installer
#  Repository: https://github.com/duphlot/VSCode_CustomTheme
# ==============================================================================
set -e

# Colors for terminal output
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
RED='\033[1;31m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   🚀 VS CODE CUSTOM THEME & ENVIRONMENT 1-CLICK INSTALLER      ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Determine Operating System & VS Code User Config Directory
OS="$(uname -s)"
if [ "$OS" = "Darwin" ]; then
    VSCODE_USER_DIR="$HOME/Library/Application Support/Code/User"
elif [ "$OS" = "Linux" ]; then
    VSCODE_USER_DIR="$HOME/.config/Code/User"
else
    echo -e "${RED}[Error] Hệ điều hành $OS chưa được hỗ trợ tự động bằng bash script này.${NC}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$VSCODE_USER_DIR"
mkdir -p "$VSCODE_USER_DIR/snippets"
mkdir -p "$HOME/.vscode"

# 2. Check for VS Code CLI binary
if ! command -v code &> /dev/null; then
    if [ -f "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]; then
        export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"
        echo -e "${GREEN}[OK]${NC} Đã tìm thấy lệnh 'code' tại /Applications/Visual Studio Code.app"
    else
        echo -e "${YELLOW}[Lưu ý]${NC} Không tìm thấy lệnh 'code' trong biến môi trường PATH."
        echo "Bạn có thể tiếp tục copy file cấu hình, nhưng cần cài extensions thủ công."
        echo "Mẹo: Mở VS Code -> nhấn Cmd+Shift+P -> gõ 'Shell Command: Install code command in PATH'."
    fi
fi

# 3. Backup existing configuration on target machine
BACKUP_TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$VSCODE_USER_DIR/backup_$BACKUP_TIMESTAMP"

if [ -f "$VSCODE_USER_DIR/settings.json" ]; then
    echo -e "${BLUE}[Backup]${NC} Đang sao lưu cấu hình cũ vào: ${BACKUP_DIR}"
    mkdir -p "$BACKUP_DIR"
    [ -f "$VSCODE_USER_DIR/settings.json" ] && cp "$VSCODE_USER_DIR/settings.json" "$BACKUP_DIR/" 2>/dev/null || true
    [ -f "$VSCODE_USER_DIR/keybindings.json" ] && cp "$VSCODE_USER_DIR/keybindings.json" "$BACKUP_DIR/" 2>/dev/null || true
    [ -f "$VSCODE_USER_DIR/tasks.json" ] && cp "$VSCODE_USER_DIR/tasks.json" "$BACKUP_DIR/" 2>/dev/null || true
    [ -f "$HOME/.vscode/custom.css" ] && cp "$HOME/.vscode/custom.css" "$BACKUP_DIR/" 2>/dev/null || true
fi

# 4. Install Extensions
if command -v code &> /dev/null; then
    echo -e "${BLUE}[Extensions]${NC} Đang cài đặt các extension cần thiết..."
    EXT_FILE="$SCRIPT_DIR/extensions.txt"
    if [ -f "$EXT_FILE" ]; then
        while IFS= read -r ext || [ -n "$ext" ]; do
            # Trim whitespace
            ext=$(echo "$ext" | xargs)
            # Skip empty lines and comments
            [[ "$ext" =~ ^#.*$ ]] && continue
            [ -z "$ext" ] && continue
            echo -e "  -> Cài đặt: ${CYAN}$ext${NC}..."
            code --install-extension "$ext" --force || true
        done < "$EXT_FILE"
    fi
fi

# 5. Check & Suggest JetBrains Mono Font
if [ "$OS" = "Darwin" ]; then
    if ! ls /Library/Fonts/*JetBrainsMono* ~/Library/Fonts/*JetBrainsMono* &>/dev/null; then
        echo -e "${YELLOW}[Font]${NC} Chưa tìm thấy font JetBrains Mono trên máy của bạn."
        if command -v brew &> /dev/null; then
            echo -e "  -> Đang cài đặt font qua Homebrew..."
            brew install --cask font-jetbrains-mono 2>/dev/null || true
        else
            echo "  -> Bạn hãy tải font JetBrains Mono miễn phí tại: https://www.jetbrains.com/lp/mono/"
        fi
    fi
fi

# 6. Deploy sanitized Settings with dynamic {{HOME}} path substitution
echo -e "${BLUE}[Config]${NC} Đang cấu hình settings.json toàn cục..."
sed "s|{{HOME}}|$HOME|g" "$SCRIPT_DIR/config/settings.template.json" > "$VSCODE_USER_DIR/settings.json"

# 7. Deploy Keybindings, Tasks & Snippets
echo -e "${BLUE}[Config]${NC} Đang sao chép keybindings, tasks và snippets..."
cp "$SCRIPT_DIR/config/keybindings.json" "$VSCODE_USER_DIR/keybindings.json"
cp "$SCRIPT_DIR/config/tasks.json" "$VSCODE_USER_DIR/tasks.json"
cp "$SCRIPT_DIR/config/leetcode.code-snippets" "$VSCODE_USER_DIR/snippets/leetcode.code-snippets"

# 8. Deploy Custom CSS & LeetCode Environment to ~/.vscode/
echo -e "${BLUE}[Styles & Env]${NC} Đang sao chép custom.css và môi trường LeetCode vào ~/.vscode/..."
cp "$SCRIPT_DIR/config/custom.css" "$HOME/.vscode/custom.css"
cp "$SCRIPT_DIR/config/leetcode_env.h" "$HOME/.vscode/leetcode_env.h"
cp "$SCRIPT_DIR/config/leetcode_build.sh" "$HOME/.vscode/leetcode_build.sh"
chmod +x "$HOME/.vscode/leetcode_build.sh"

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  ✔ SETUP HOÀN TẤT THÀNH CÔNG!                                  ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "${CYAN}Bước kích hoạt cuối cùng:${NC}"
echo -e "1. Mở VS Code lên."
echo -e "2. Nhấn tổ hợp phím ${YELLOW}Cmd + Shift + P${NC} (hoặc Ctrl + Shift + P trên Linux)."
echo -e "3. Gõ: ${YELLOW}Enable Custom CSS and JS${NC} -> Chọn lệnh này."
echo -e "4. Khởi động lại VS Code khi được thông báo để kích hoạt giao diện trong suốt & hiệu ứng!"
echo -e "${CYAN}================================================================${NC}\n"
