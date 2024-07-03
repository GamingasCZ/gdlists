import { ref, watch } from "vue";
import type { viewedPopup } from "./interfaces";

export const SETTINGS = ref({
  scrolling: 1,
  language: -1,
  homepageColumns: 1,
  autosave: 60,
  iconQuality: 4,
  dialogClickClose: true,
  levelViewMode: 0
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
  let popupsViewed: viewedPopup | null = JSON.parse(localStorage.getItem("popupsViewed")!)
  if (popupsViewed == null) {
    localStorage.setItem("popupsViewed", "{}")
    viewedPopups = {}
  } else {
    viewedPopups = popupsViewed
  }
}
