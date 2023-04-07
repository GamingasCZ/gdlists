<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import type {
  ListFetchResponse,
  FavoritedLevel,
  ListPreview,
} from "@/interfaces";
import LevelCard from "./global/LevelCard.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted } from "vue";
import { modifyListBG } from "@/Editor";
import chroma, { hsl } from "chroma-js";

const props = defineProps({
  listID: {type: String, required: true},
  randomList: Boolean
});

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
const LIST_COL = ref<number[]>([0, 0, 0]);

let listURL = `${!PRIVATE_LIST ? "pid" : "id"}=${props?.listID}`
if (props.randomList) listURL = "random"

axios
  .get("http://localhost:8000/php/getLists.php?"+listURL)
  .then((res: AxiosResponse) => {
    LIST_DATA.value = res.data[0];
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
        creator: LIST_DATA.value?.creator!,
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

    let listColors: number[] | string = LIST_DATA.value?.data.pageBGcolor!; // TODO: old lists have hex values
    LIST_COL.value = typeof listColors == "string" ? chroma(listColors).hsl() : listColors;
    if (LIST_COL != undefined) modifyListBG(LIST_COL.value);

    let listBG = LIST_DATA.value?.data?.titleImg!;
    document.querySelector("#listBG").style.backgroundImage = `url('${typeof listBG == "string" ? listBG : listBG[0] ?? ""}')`;
  });

const positionListBackground = () =>
  ["left", "center", "right"][LIST_DATA.value?.data?.titleImg[3]! ?? 1];

onMounted(() => {});
</script>

<template>
  <div
    id="listBG"
    class="fixed left-0 top-[5%] h-full w-full bg-cover -z-10"
    :style="{
      backgroundPositionX: positionListBackground(),
      height: LIST_DATA?.data.titleImg[2] + '%',
      backgroundPositionY: LIST_DATA?.data.titleImg[1] + '%',
    }"
  >
    <div
      v-if="LIST_DATA?.data.titleImg[4]"
      :style="{
        backgroundImage: `linear-gradient(0deg, ${chroma(
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
  <section class="text-white translate-y-10">
    <header>
      <div class=""></div>
      <h1>{{ LIST_DATA?.name }}</h1>
      <ListDescription />
    </header>
    <main class="flex flex-col gap-3">
      <LevelCard
        v-for="(level, index) in LIST_DATA?.data.levels"
        v-bind="level"
        :favorited="favoritedIDs?.includes(level.levelID!)"
        :level-index="index"
        :list-i-d="listID!"
        :list-name="LIST_DATA?.name!"
      />
    </main>
  </section>
</template>
