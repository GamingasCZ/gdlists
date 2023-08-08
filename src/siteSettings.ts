import { ref, watch } from "vue";
import type { viewedPopups, viewedPopups } from "./interfaces";

export const SETTINGS = ref({
  scrolling: 1,
  language: 0,
  homepageColumns: 1,
  autosave: 60
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

export var viewedPopups: viewedPopups;
if (hasLocalStorage()) {
  let popupsViewed: viewedPopups | null = JSON.parse(localStorage.getItem("popupsViewed")!)
  if (popupsViewed == null) {
    localStorage.setItem("popupsViewed", "{}")
    viewedPopups = {}
  } else {
    viewedPopups = popupsViewed
  }
}
