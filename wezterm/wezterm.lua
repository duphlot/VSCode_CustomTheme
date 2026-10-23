local wezterm = require("wezterm")
local act = wezterm.action

local HOME = os.getenv("HOME")
local CONFIG_DIR = HOME .. "/.config/wezterm"
local STATE_FILE = CONFIG_DIR .. "/state.json"
local BACKGROUND_IMAGE = CONFIG_DIR .. "/background_final.jpg"

local DEFAULTS = {
  base = 100,
  window_blur = 0,
  font_size = 19,
  padding_top = 60,
  padding_side = 16,
  window_width = 70,
  window_height = 75,
  initial_cols = 120,
  initial_rows = 35,
  default_cwd = HOME,
}

local json_parse = (wezterm.serde and wezterm.serde.json_parse) or wezterm.json_parse

local function load_state()
  local state = {}
  for key, value in pairs(DEFAULTS) do
    state[key] = value
  end

  local file = io.open(STATE_FILE, "r")
  if not file then
    return state
  end
  local ok, parsed = pcall(json_parse, file:read("*a"))
  file:close()
  if ok then
    for key, value in pairs(parsed) do
      state[key] = value
    end
  end
  return state
end

local function split_into_grid(_, pane)
  local right = pane:split({ direction = "Right", size = 0.5 })
  pane:split({ direction = "Bottom", size = 0.5 })
  right:split({ direction = "Bottom", size = 0.5 })
end

local state = load_state()
wezterm.add_to_config_reload_watch_list(STATE_FILE)

local config = wezterm.config_builder()

config.default_cwd = state.default_cwd
config.front_end = "WebGpu"
config.animation_fps = 1
config.max_fps = 30

config.colors = {
  foreground = "#E6EDF3",
  background = "#011423",
  cursor_bg = "#47FF9C",
  cursor_border = "#47FF9C",
  cursor_fg = "#011423",
  selection_bg = "#033259",
  selection_fg = "#CBE0F0",
  ansi = { "#214969", "#E52E2E", "#44FFB1", "#FFE073", "#0FC5ED", "#a277ff", "#24EAF7", "#24EAF7" },
  brights = { "#214969", "#E52E2E", "#44FFB1", "#FFE073", "#A277FF", "#a277ff", "#24EAF7", "#24EAF7" },
}

config.font = wezterm.font_with_fallback({
  { family = "MesloLGS Nerd Font Mono", weight = "Regular" },
  "JetBrains Mono",
})
config.font_size = state.font_size

config.enable_tab_bar = false
config.window_decorations = "INTEGRATED_BUTTONS|RESIZE"
config.window_padding = {
  left = state.padding_side,
  right = state.padding_side,
  top = state.padding_top,
  bottom = state.padding_side,
}
config.initial_cols = state.initial_cols
config.initial_rows = state.initial_rows

config.macos_window_background_blur = state.window_blur
config.background = {
  {
    source = { File = BACKGROUND_IMAGE },
    width = "Cover",
    height = "Cover",
    opacity = state.base / 100,
  },
}

wezterm.on("window-config-reloaded", function(window)
  local size_key = state.window_width .. "x" .. state.window_height
  local applied = wezterm.GLOBAL.window_size_applied or {}
  local window_id = tostring(window:window_id())
  local first_seen = applied[window_id] == nil

  if applied[window_id] == size_key then
    return
  end
  applied[window_id] = size_key
  wezterm.GLOBAL.window_size_applied = applied
  if first_seen then
    return
  end

  local screen = wezterm.gui.screens().active
  local width = screen.width * state.window_width / 100
  local height = screen.height * state.window_height / 100
  window:set_inner_size(width, height)
  pcall(function()
    window:set_position(screen.x + (screen.width - width) / 2, screen.y + (screen.height - height) / 2)
  end)
end)

config.keys = {
  { key = "RightArrow", mods = "CMD", action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }) },
  { key = "DownArrow", mods = "CMD", action = act.SplitVertical({ domain = "CurrentPaneDomain" }) },
  { key = "w", mods = "OPT", action = act.CloseCurrentPane({ confirm = false }) },
  { key = "phys:4", mods = "OPT|SHIFT", action = wezterm.action_callback(split_into_grid) },

  { key = "LeftArrow", mods = "CMD|SHIFT", action = act.ActivatePaneDirection("Left") },
  { key = "RightArrow", mods = "CMD|SHIFT", action = act.ActivatePaneDirection("Right") },
  { key = "UpArrow", mods = "CMD|SHIFT", action = act.ActivatePaneDirection("Up") },
  { key = "DownArrow", mods = "CMD|SHIFT", action = act.ActivatePaneDirection("Down") },
}

return config
