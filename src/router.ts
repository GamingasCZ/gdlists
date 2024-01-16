import { createRouter, createWebHistory } from "vue-router";
import { setLanguage } from "./locales";
import { SETTINGS } from "./siteSettings";
import { useI18n } from "vue-i18n";
import { nextTick, ref } from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/components/Homepage.vue"),
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("@/components/Editor.vue"),
    },
    {
      path: "/browse/:type",
      name: "browser",
      props: (route) => ({
        query: route.query.q ?? "",
        onlineType: route.query.type ?? "",
        browserType: route
      }),
      component: () => import("@/components/CommunityLists.vue"),
    },
    {
      path: "/saved",
      name: "savedBrowser",
      component: () => import("@/components/SavedLists.vue"),
    },
    {
      path: "/:id",
      name: "listViewer",
      props: (route) => ({ listID: route.params.id }),
      component: () => import("@/components/ListView.vue"),
    },
    {
      path: "/:id/edit",
      name: "editing",
      props: (route) => ({ listID: route.params.id, editing: true }),
      component: () => import("@/components/Editor.vue"),
    },
    {
      path: "/random",
      name: "random",
      props: (route) => ({ randomList: true }),
      component: () => import("@/components/ListView.vue"),
    },
  ],
});

router.afterEach(() => window.scrollTo(0,0))


export const loadingProgress = ref(0)
let loadStart: number
router.beforeEach(async () => {

  // Start loading bar
  loadingProgress.value = 0
  loadStart = setTimeout(() => {
    loadingProgress.value = 99
  }, 5)
  
  document.documentElement.style.setProperty("--siteBackground", "");

  if (
    getComputedStyle(document.documentElement).getPropertyValue(
      "--primaryColor"
    ) == document.documentElement.style.getPropertyValue("--primaryColor")
  ) {
    document.querySelector("nav")?.classList.add("slidingNavbar");

    setTimeout(() => {
      document.documentElement.style.setProperty("--primaryColor", "");
      document.documentElement.style.setProperty("--secondaryColor", "");
      document.documentElement.style.setProperty("--brightGreen", "");
    }, 150);

    setTimeout(() => {
      document.querySelector("nav")?.classList.remove("slidingNavbar");
    }, 300);
  }
});

// Finish loading bar
router.beforeResolve(() => {
  clearTimeout(loadStart)
  loadingProgress.value = 100
})

export default router