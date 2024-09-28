import { ref, watch } from "vue";
import type { viewedPopup } from "./interfaces";

export const SETTINGS = ref({
  scrolling: 1,
  language: -1,
  homepageColumns: 1,
  autosave: 60,
  iconQuality: 4,
  dialogClickClose: true,
  levelViewMode: 0,
  scrollNavbar: true,
  autoComments: true,
  disableColors: false,
  disableBGs: false,
  disableTL: false,
  seasonalThemes: true,
  selectedTheme: 0
});

watch(SETTINGS, () => {
  if (localStorage) {
    localStorage.setItem("settings", JSON.stringify(SETTINGS.value))
  }
}, {deep: true})

export const hasLocalStorage = () => {
  try {
    return localStorage != null
  }
  catch (e) {
    return false
  }
}

export var viewedPopups: viewedPopup;
if (hasLocalStorage()) {
  localStorage.getItem("settings") ??
    localStorage.setItem("settings", JSON.stringify(SETTINGS.value));

  let loadedSettings: any = JSON.parse(localStorage.getItem("settings")!);
  let loadedSettingsKeys: any = Object.keys(loadedSettings);
  let settingsKeys: any = Object.keys(SETTINGS.value);
  if (loadedSettingsKeys.length < settingsKeys.length) {
    settingsKeys.forEach((setting) => {
      if (!loadedSettingsKeys.includes(setting))
        loadedSettings[setting] = SETTINGS.value[setting];
    });
    localStorage.setItem("settings", JSON.stringify(loadedSettings));
  }

  SETTINGS.value = loadedSettings;

  let popupsViewed: viewedPopup | null = JSON.parse(localStorage.getItem("popupsViewed")!)
  if (popupsViewed == null) {
    localStorage.setItem("popupsViewed", "{}")
    viewedPopups = {}
  } else {
    viewedPopups = popupsViewed
  }
}
