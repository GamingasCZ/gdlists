import { createRouter, createWebHistory } from "vue-router";
import { ref } from "vue";
import THEMES from "./themes";
import { SETTINGS } from "./siteSettings";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/components/Homepage.vue"),
    },
    {
      path: "/make/list",
      name: "editor",
      component: () => import("@/components/Writer.vue"),
      props: {type: 0}
    },
    {
      path: "/make/review",
      name: "writer",
      component: () => import("@/components/Writer.vue"),
      props: {type: 1}
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
      props: (route) => ({ isReview: false, listID: route.params.id }),
      component: () => import("@/components/ListView.vue"),
    },
    {
      path: "/review/:review",
      name: "reviewViewer",
      props: (route) => ({ isReview: true, listID: route.params.review }),
      component: () => import("@/components/ListView.vue"),
    },
    {
      path: "/edit/list/:id",
      name: "editing",
      props: (route) => ({ type: 0, postID: route.params.id, editing: true }),
      component: () => import("@/components/Writer.vue")
    },
    {
      path: "/edit/review/:id",
      name: "editingReview",
      props: (route) => ({ type: 1, postID: route.params.id, editing: true }),
      component: () => import("@/components/Writer.vue")
    },
    {
      path: "/random",
      name: "random",
      props: () => {
        let review = Math.random() > 0.5 | 0
        return { randomList: true, isReview: review}
      },
      component: () => import("@/components/ListView.vue"),
    },
  ],
});

export const timeLastRouteChange = ref(Date.now())
router.afterEach(() => {
  window.scrollTo(0,0)
  timeLastRouteChange.value = Date.now()
})


export const loadingProgress = ref(0)
let loadStart: number
router.beforeEach(async (to, from) => {

  // Start loading bar
  loadingProgress.value = 0
  loadStart = setTimeout(() => {
    loadingProgress.value = 99
  }, 5)
  
  
  if (
    THEMES[SETTINGS.value.selectedTheme || 0].colors.primaryColor != document.documentElement.style.getPropertyValue("--primaryColor")
  ) {
    if (["editor", "writer", "editing", "editingReview"].includes(from.name) && ["listViewer", "reviewViewer"].includes(to.name)) return
    
      document.documentElement.style.setProperty("--siteBackground", THEMES[SETTINGS.value.selectedTheme || 0].colors.siteBackground);
      document.querySelector("nav")?.classList.add("slidingNavbar");
  
      setTimeout(() => {
        document.documentElement.style.setProperty("--primaryColor", THEMES[SETTINGS.value.selectedTheme || 0].colors.primaryColor);
        document.documentElement.style.setProperty("--secondaryColor", THEMES[SETTINGS.value.selectedTheme || 0].colors.secondaryColor);
        document.documentElement.style.setProperty("--brightGreen", THEMES[SETTINGS.value.selectedTheme || 0].colors.brightGreen);
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
