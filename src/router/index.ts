import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../components/Homepage.vue"),
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("../components/Editor.vue"),
    },
    {
      path: "/browse",
      name: "browser",
      props: (route) => ({
        browserName: "Komunitní seznamy",
        query: route.query.q ?? "",
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
      path: "/random",
      name: "random",
      props: (route) => ({ randomList: true }),
      component: () => import("@/components/ListView.vue"),
    },
  ],
});

router.beforeEach(() => {
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
    }, 150);

    setTimeout(() => {
      document.querySelector("nav")?.classList.remove("slidingNavbar");
    }, 300);
  }
});

export default router;
