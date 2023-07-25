import { ref, watch } from "vue";

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
