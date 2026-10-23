#!/usr/bin/env bash
set -e

SOURCE_FILE="$1"
OUTPUT_BIN="$2"

if [ -z "$SOURCE_FILE" ]; then
    echo "Usage: $0 <source_file.cpp> [output_binary]"
    exit 1
fi

if [ -z "$OUTPUT_BIN" ]; then
    OUTPUT_BIN="/tmp/leetcode_build/$(basename "${SOURCE_FILE%.*}")"
fi

OUTPUT_DIR="$(dirname "$OUTPUT_BIN")"
mkdir -p "$OUTPUT_DIR"

ENV_HEADER="${HOME}/.vscode/leetcode_env.h"

IS_LEETCODE=0
if [[ "$SOURCE_FILE" =~ /LeetCode/ ]] || [[ "$SOURCE_FILE" =~ /CompetitiveProgramming/ ]]; then
    IS_LEETCODE=1
elif grep -qE "(@lc app=leetcode|@lc code=start|class Solution)" "$SOURCE_FILE" 2>/dev/null; then
    IS_LEETCODE=1
fi

if [ $IS_LEETCODE -eq 1 ]; then
    if grep -qE '^[[:space:]]*(int|void)[[:space:]]+main[[:space:]]*\(' "$SOURCE_FILE"; then
        echo -e "\033[1;34m[LeetCode Build]\033[0m Building $(basename "$SOURCE_FILE") (with custom main)..."
        clang++ -std=c++17 -O0 -g \
            -DLOCAL \
            -include "$ENV_HEADER" \
            "$SOURCE_FILE" \
            -o "$OUTPUT_BIN"
    else
        echo -e "\033[1;33m[LeetCode Build]\033[0m File has no main(). Linking with the fallback runner..."
        STUB_FILE="/tmp/leetcode_default_main.cpp"
        cat << 'STUB_EOF' > "$STUB_FILE"
#include <iostream>
int main() {
    std::cout << "\n\033[1;32m[LeetCode Build] Build succeeded!\033[0m\n";
    std::cout << "\033[1;36mHow to run & debug:\033[0m\n";
    std::cout << "This file has no \033[1;33mmain()\033[0m yet, so test cases and breakpoints cannot be attached.\n";
    std::cout << "To run test cases locally, go to the end of the file and type the snippet: \033[1;32mlcmain\033[0m + \033[1;37m[Tab]\033[0m\n";
    std::cout << "\033[2m--------------------------------------------------\n";
    std::cout << "#ifdef LOCAL\n";
    std::cout << "int main() {\n";
    std::cout << "    Solution sol;\n";
    std::cout << "    return 0;\n";
    std::cout << "}\n";
    std::cout << "#endif\n";
    std::cout << "--------------------------------------------------\033[0m\n\n";
    return 0;
}
STUB_EOF

        clang++ -std=c++17 -O0 -g \
            -DLOCAL \
            -include "$ENV_HEADER" \
            "$SOURCE_FILE" \
            "$STUB_FILE" \
            -o "$OUTPUT_BIN"
    fi
else
    echo -e "\033[1;34m[C++ Build]\033[0m Compiling standard C++ file $(basename "$SOURCE_FILE")..."
    clang++ -std=c++17 -g "$SOURCE_FILE" -o "$OUTPUT_BIN"
fi

echo -e "\033[1;32m[Build]\033[0m Ready! Binary: $OUTPUT_BIN"
