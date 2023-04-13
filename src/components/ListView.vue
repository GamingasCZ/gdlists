<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import type {
  ListFetchResponse,
  FavoritedLevel,
  ListPreview,
} from "@/interfaces";
import LevelCard from "./global/LevelCard.vue";
import SharePopup from "./global/SharePopup.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted, watch, onUnmounted } from "vue";
import { modifyListBG } from "@/Editor";
import chroma, { hsl } from "chroma-js";

const props = defineProps({
  listID: {type: String, required: true},
  randomList: Boolean
});

onUnmounted(() => {
  document.querySelector("#listBG")?.remove()
})

const PRIVATE_LIST: boolean = Boolean(props?.listID.match(/^\d+$/g))

const favoritedIDs = ref<string[] | null>();

let addIntoRecentlyViewed = false;
let recentlyViewed: ListPreview[];

if (localStorage != undefined) {
  favoritedIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!);
  recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")!) ?? [];

  addIntoRecentlyViewed =
    recentlyViewed.filter((list: ListPreview) => list.id == props.listID)
      .length == 0; // Has not been viewed yet
}

const LIST_DATA = ref<ListFetchResponse>();
const LIST_CREATOR = ref<string>("");
const LIST_COL = ref<number[]>([0, 0, 0]);

let listURL = `${!PRIVATE_LIST ? "pid" : "id"}=${props?.listID}`
if (props.randomList) listURL = "random"

axios
  .get(import.meta.env.VITE_API+"/php/getLists.php?"+listURL)
  .then((res: AxiosResponse) => {
    LIST_DATA.value = res.data[0];
    LIST_CREATOR.value = LIST_DATA.value?.creator! || res.data[1][0].username
    
    // Use new levelList structure (put levels into 'levels' array)
    if (!LIST_DATA.value?.data.levels) {
      LIST_DATA.value!.data.levels = [];
      Object.keys(LIST_DATA.value?.data!)
        .filter((x: string) => x.match(/\d+/g))
        .forEach((level: string) => {
          LIST_DATA.value?.data.levels.push(LIST_DATA.value.data[level]);
        });
    }

    if (addIntoRecentlyViewed) {
      let isListPrivate = Boolean(LIST_DATA.value?.hidden != "0");
      recentlyViewed.push({
        creator: LIST_CREATOR.value,
        id: (isListPrivate
          ? LIST_DATA.value?.hidden!
          : LIST_DATA.value?.id!
        ).toString(),
        name: LIST_DATA.value?.name!,
        uploadDate: Date.now(),
      });
      if (recentlyViewed.length == 10) recentlyViewed.splice(0, 1) // Gets sliced to 3 on homepage
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));

    }

    document.title = `${LIST_DATA.value?.name} | GD Seznamy` 

    // Set list colors
    let listColors: number[] | string = LIST_DATA.value?.data.pageBGcolor!;
    LIST_COL.value = typeof listColors == "string" ? chroma(listColors).hsl() : listColors;
    if (LIST_COL.value != undefined && !isNaN(LIST_COL.value[0]) ) modifyListBG(LIST_COL.value);

    // Set list background image
    let listBG = LIST_DATA.value?.data?.titleImg!;
    (document.querySelector("#listBG") as HTMLDivElement).style.backgroundImage = `url('${typeof listBG == "string" ? listBG : listBG[0] ?? ""}')`;
  });

const positionListBackground = () =>
  ["left", "center", "right"][LIST_DATA.value?.data?.titleImg[3]! ?? 1];

const scrollToPosition = (pos: number) => {
  // Scroll to card before to hopefully make it centered :)
}
const tryJumping = (ind: number) => {
  let isJumpingFromFaves = new URLSearchParams(window.location.search).get("goto")
  if (isJumpingFromFaves && parseInt(isJumpingFromFaves) == ind) {
    let jumpedToCard = document.querySelectorAll(".levelCard")

    if (parseInt(isJumpingFromFaves) > 1) {
      jumpedToCard[Math.max(0, parseInt(isJumpingFromFaves) - 2)].scrollIntoView()
    }
    jumpedToCard[Math.max(0, parseInt(isJumpingFromFaves))].style.animation = "flash 0.8s linear"
  }
}

const getURL = () => `${window.location.host}/${props.listID}`
const sharePopupOpen = ref<boolean>(false)

const listActions = (action: string) => {
  switch (action) {
    case 'sharePopup':
      sharePopupOpen.value = true; break;
  }
}

</script>

<template>
  <div
    id="listBG"
    class="fixed left-0 top-[5%] h-full w-full bg-cover -z-10"
    v-if="LIST_DATA?.data.titleImg != undefined && typeof LIST_DATA.data.titleImg != 'string'"
    :style="{
      backgroundPositionX: positionListBackground(),
      height: LIST_DATA?.data.titleImg[2] + '%',
      backgroundPositionY: LIST_DATA?.data.titleImg[1] + '%',
    }"
  >
    <div
      v-if="LIST_DATA?.data.titleImg[4]"
      :style="{
        backgroundImage: `linear-gradient(180deg, ${chroma(
          chroma.hsl(
            LIST_COL[0],
            0.36,
            LIST_COL[1] < 1 ? LIST_COL[1] : LIST_COL[1] * 0.015625
          )
        ).hex()}, transparent)`,
      }"
      class="absolute w-full h-full"
    ></div>
  </div>

  <SharePopup v-show="sharePopupOpen" @close-popup="sharePopupOpen = false" :share-text="getURL()" />

  <section class="text-white translate-y-20">
    <header>
      <div class=""></div>
      <ListDescription @do-list-action="listActions" v-bind="LIST_DATA" :creator="LIST_CREATOR" :id="listID" class="mb-8"/>
    </header>
    <main class="flex flex-col gap-4">
      <LevelCard
        v-for="(level, index) in LIST_DATA?.data.levels"
        v-bind="level"
        :favorited="favoritedIDs?.includes(level.levelID!)"
        :level-index="index"
        :list-i-d="listID!"
        :list-name="LIST_DATA?.name!"
        :translucent-card="LIST_DATA?.data.translucent!"
        class="levelCard"
        @vnode-mounted="tryJumping(index)"
      />
    </main>
  </section>
</template>
