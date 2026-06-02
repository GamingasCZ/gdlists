import { ref, watch } from "vue";
import type { ListFetchResponse, viewedPopup } from "./interfaces";

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
  disableAllBGs: 0,
  disableTL: false,
  seasonalThemes: true,
  selectedTheme: 0,
  selectedThemeAlways: 0,
  compactToolbar: false,
  draftNoRemove: false,
  draftNoEdit: false,
  colorization: true,
  flipControls: true,
  saveThumbs: true,
  disableBGs: false,
  notifBehaviour: 0,
  navDClick: 0,
  checkNotifs: true,
  shortcutProfile: -1, // will properly select itself based on browser
  fsZenMode: false,
});

export const hasLocalStorage = () => {
  try {
    return localStorage != null
  }
  catch (e) {
    return false
  }
}

const hasLS = hasLocalStorage()

watch(SETTINGS, () => {
  if (hasLS) {
    localStorage.setItem("settings", JSON.stringify(SETTINGS.value))
  }
}, {deep: true})

export var viewedPopups: viewedPopup;
if (hasLS) {
  localStorage.getItem("settings") ??
    localStorage.setItem("settings", JSON.stringify(SETTINGS.value));

  let loadedSettings: string[] = JSON.parse(localStorage.getItem("settings")!);
  let loadedSettingsKeys: string[] = Object.keys(loadedSettings);
  let settingsKeys: string[] = Object.keys(SETTINGS.value);
  if (!settingsKeys.every(val => loadedSettingsKeys.includes(val))) {
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

export const loggedIn = ref<boolean | null>(null);

export const homepageCache: {[section: string]: null | ListFetchResponse} = {
  pinned: null,
  uploads: null,
  recent: null
}

export const randomIsReview = ref(false)