<script setup lang="ts">
import { shortenYTLink } from "@/Editor";
import axios, { type AxiosResponse } from "axios";
import chroma, { type Color } from "chroma-js";
import { computed, inject, onMounted, type Ref, ref } from "vue";
import type { Level, LevelSearchResponse, ytSearchDetails } from "../../interfaces";
import ColorPicker from "../global/ColorPicker.vue";
import DifficultyPicker from "./DifficultyPicker.vue";
import LevelTags from "./LevelTags.vue";
import YoutubeVideoPreview from "./YoutubeVideoPreview.vue";
import { useI18n } from "vue-i18n";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import DifficultyIcon from "../global/DifficultyIcon.vue";
import LevelBackground from "./LevelBackground.vue";
import { i18n } from "@/locales";

const props = defineProps<{
  levelArray: Level[]
  index?: number;
  opened?: boolean;
  data?: Level;
  updatingPositions: number;
}>();

const emit = defineEmits<{
  (e: "updateOpenedCard", newPos: number): void;
  (e: "moveControls", pos: number, newInd: number): void;
  (e: "openTagPopup"): void;
  (e: "openCollabTools", levelIndex: number): void;
  (e: "doMove", levelIndex: number, toIndex: number): void;
  (e: "throwError", errorText: string): void;
}>();

// Difficulty Picker
const changeRate = async (newRating: number) => {
  if (props.levelArray.levels[props.index!].difficulty[0] != 0) { // N/A cannot be rated
    props.levelArray.levels[props.index!].difficulty[1] = newRating;
  }
  rateImagePath.value = await getRateImage()
}
const changeFace = async (newFace: number) => {
  if (newFace == 0) {
    props.levelArray.levels[props.index!].difficulty[1] = 0 // Unrate N/A levels
    rateImagePath.value = await getRateImage()
  }

  props.levelArray.levels[props.index!].difficulty[0] = newFace;
  diffFacePath.value = await getDiffFace()
}

const BASE_URL = import.meta.env.BASE_URL
const rateImagePath = ref("")
const getRateImage = () => {
  let rate = props.levelArray.levels[props.index!].difficulty?.[1] ?? 0;
  if (rate == 0) rateImagePath.value = ""; // Unrated level
  else {
    rateImagePath.value = `${BASE_URL}/faces/${["star", "featured", "epic", "legendary", "mythic"][rate - 1]}.webp`
  }
};
getRateImage()


const diffFacePath = ref(`${BASE_URL}/faces/${props.levelArray.levels[props.index!].difficulty?.[0] ?? 0}.webp`)

const levelCreator = ref(typeof props.levelArray.levels[props.index!].creator == 'object' ? props.levelArray.levels[props.index!].creator[0][0].name : props.levelArray.levels[props.index!].creator)
const modifyCreator = (e: Event | string) => {
  let newCreator = typeof e == 'string' ? e : (e.currentTarget as HTMLInputElement).value
  if (typeof props.levelArray.levels[props.index!].creator == 'string')
    props.levelArray.levels[props.index!].creator = newCreator
  else {
    if (isOldCollab.value) return
    props.levelArray.levels[props.index!].creator[0][0].name = newCreator
  }
  levelCreator.value = newCreator
}

const selectedDiff = ref(props.levelArray.levels[props.index!].difficulty)

const modifyVideo = (e: Event) => {
  let videoInput = (e.target as HTMLInputElement)

  videoInput.value = shortenYTLink(videoInput.value)
  props.levelArray.levels[props.index!].video = videoInput.value
}

const ytPanelOpen = ref(false)
const ytVideoData = ref<ytSearchDetails>({ videoCount: 0 })
async function videoSearch() {
  let data: ytSearchDetails = {
    success: false,
    videoCount: 0,
    titles: [],
    creators: [],
    thumbnails: [],
    links: [],
    publishTime: []
  }

  await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
    params: { part: "snippet", "maxResults": 10, q: `Geometry Dash ${props.levelArray.levels[props.index!].levelName}`, key: import.meta.env.VITE_YTAPIKEY }
  }).then(res => {
    data.success = true
    data.videoCount = res.data.pageInfo.resultsPerPage
    res.data.items.forEach(video => {
      data.titles.push(video.snippet.title)
      data.creators.push(video.snippet.channelTitle)
      data.links.push(video.id.videoId)
      data.thumbnails.push(video.snippet.thumbnails.default.url)
      data.publishTime.push(video.snippet.publishTime)
    })
    ytPanelOpen.value = true
  })

  return data
}

const vidScrollBox = ref(0)
const scroll = (by: number) => {
  let ele = document.querySelector("#youtubeScroll") as HTMLDivElement
  vidScrollBox.value = ele.scrollLeft + by
  ele.scrollLeft += by
  vidScrollBox.value = vidScrollBox.value >= (ele.scrollWidth - by) ? -1 : vidScrollBox.value
}

const openedPanel = ref<number>(0);

const mobileMoveLevel = () => {
  emit("moveControls", props.index!, props.index!);
};

const collabFlash = ref(false)
const searching = ref(false)
function searchLevel(searchingByID: boolean, userSearchPage: number = 0) {
  if (searchingByID && !searchAvailableID.value) return
  if (!searchingByID && !searchAvailableCreator.value) return
  if (searching.value) return

  let levelID = props.levelArray.levels[props.index!].levelID;
  let levelName = props.levelArray.levels[props.index!].levelName;
  let searchingFromUser = levelName && levelCreator.value

  let request: string = "";
  if (searchingByID) request = `id=${levelID}`; // Searching by ID
  else if (!levelName && levelCreator.value) request = `levelMaker=${levelCreator.value}`
  else {
    if (searchingFromUser) {
      // Find level by specific creator
      request = `userSearch=${levelCreator.value}&name=${levelName}&page=${userSearchPage}`;
    } else request = `levelName=${levelName}`; // Find level
  }
  searching.value = true
  axios
    .get(import.meta.env.VITE_API + "/rubLevelData.php?" + request)
    .then(async (response: AxiosResponse) => {
      let level: LevelSearchResponse = response.data;

      // Couldn't find level
      if (typeof response.data != "object") {
        searching.value = false; return;
      }

      // Try next page
      if (searchingFromUser && userSearchPage < 5) {
        searchLevel(searchingByID, userSearchPage + 1)
      }

      props.levelArray.levels[props.index!].levelID = level.id;
      props.levelArray.levels[props.index!].levelName = level.name;
      props.levelArray.levels[props.index!].platf = level.platf;
      isPlatformer.value = level.platf

      modifyCreator(level.author)

      if (hasLocalStorage()) {
        let saveIDs = JSON.parse(localStorage.getItem("savedCollabIDs")!) ?? [];
        collabFlash.value = saveIDs.indexOf(parseInt(props.levelArray.levels[props.index].levelID)) > -1
        setTimeout(() => {
          collabFlash.value = false
        }, 5000);
      }

      if (level.difficulty == -1) level.difficulty = 11 // Auto levels
      props.levelArray.levels[props.index!].difficulty = [
        level.difficulty,
        level.cp,
      ];
      selectedDiff.value = props.levelArray.levels[props.index!].difficulty

      ytVideoData.value = await videoSearch()
      searching.value = false;
      (document.querySelector("#addLevelButton") as HTMLButtonElement).focus()
    }).catch(() => searching.value = false);
}


const isOldCollab = computed(() => typeof props.levelArray.levels[props.index!].creator == 'object' && !props.levelArray.levels[props.index!].creator[3])
const mess = [
  useI18n().t('collabTools.noEditOldCollab'),
  useI18n().t('editor.collabNoPhones')
]

const openDialogs = inject<Ref<object>>("openedDialogs")
const openCollabTools = () => {
  if (isOldCollab.value)
    emit('throwError', mess[0])
  else if (/iPhone|Android/i.test(navigator.userAgent))
    emit('throwError', mess[1])
  else
    openDialogs.collabs = [true, props.index]
}

const creatorFilledIn = computed(() => {
  if (typeof props.levelArray.levels[props.index!].creator == "string")
    return props.levelArray.levels[props.index!].creator
  else {
    return props.levelArray.levels[props.index!].creator[0]?.[0]?.name
  }
})

const searchAvailableCreator = computed(() => (props.levelArray.levels[props.index!].levelName != '' || props.levelArray.levels[props.index!].creator != '') && !searching.value)
const searchAvailableID = computed(() => props.levelArray.levels[props.index!].levelID && !searching.value)

const isPlatformer = ref(props.levelArray.levels[props.index!].platf)
const switchPlatformer = () => {
  isPlatformer.value = !isPlatformer.value
  props.levelArray.levels[props.index!].platf = isPlatformer.value
}

const background = computed(() => {
  if (SETTINGS.value.disableColors)
    return getComputedStyle(document.documentElement).getPropertyValue("--primaryColor")

  return chroma.hsl(...props.levelArray.levels[props.index!].color!).hex()
})

const tagPlaceholder = ref('Tagy levelu')
</script>


<template>
  <section :style="{background: background}" class="flex rounded-md max-sm:flex-col">
    <div class="flex flex-col justify-between items-center px-0.5 bg-black bg-opacity-20">

      <!-- Move level -->
      <div class="flex flex-col items-center">
        <button class="p-1.5 button"
            :title="$t('editor.moveUpTitle')" @click="emit('doMove', index!, index! - 1); openedPanel = 0;">
            <img class="w-6" src="../../images/moveUp.svg" alt="">
        </button>
        <input autocomplete="off" readonly
          class="w-10 mx-1 max-w-[20vw] cursor-move outline-none font-black text-xl rounded-md bg-black bg-opacity-40 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
          :value="index! + 1" @mousedown="mobileMoveLevel()" />
        <button class="p-1.5 button"
            :title="$t('editor.moveDownTitle')" @click="emit('doMove', index!, index! + 1); openedPanel = 0;">
            <img class="w-6" src="../../images/moveDown.svg" alt="">
        </button>
      </div>

      <div class="flex flex-col gap-2 items-center pb-2">

        <button @click="openedPanel = openedPanel != 1 ? 1 : 0" :title="$t('editor.levelColorTitle')" class="button">
          <img class="w-5" src="../../images/color.svg" alt="" />
        </button>
        
        <button @click="levelArray.levels.splice(index, 1)" :title="$t('editor.removeTitle')" class="button">
          <img class="w-6" src="../../images/trash.svg" alt="" />
        </button>
      </div>

    </div>

    <div class="flex flex-col gap-2 pr-2 mt-2 w-full">

      <div class="flex justify-between">
        <!-- Level name -->
        <form @submit.prevent="searchLevel(false)" class="flex gap-3 items-center ml-2 bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
          <button type="button" class="button">
            <DifficultyIcon class="w-12" :difficulty="selectedDiff[0]" :rating="selectedDiff[1]" />
          </button>
          <input v-model="levelArray.levels[index!].levelName" maxlength="20" type="text" class="text-2xl font-bold bg-transparent border-none outline-none" :placeholder="$t('level.levelName')">
          <button type="submit" tabindex="-1" class="p-2">
            <img src="@/images/searchOpaque.svg" class="w-6" alt="">
          </button>
        </form>

      </div>

      <div class="flex">

      <!-- Creator -->
      <div class="flex gap-3 items-center ml-2 bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
        <button type="button" tabindex="-1" class="p-2 button">
          <img src="@/images/collabMen.svg" alt="" class="min-w-8" />
        </button>
        <input :value="levelCreator" @change="modifyCreator" maxlength="20" type="text" class="w-36 text-lg bg-transparent border-none outline-none" :placeholder="$t('level.creator')">
      </div>

              <!-- Level ID -->
              <form @submit.prevent="searchLevel(false)" class="flex gap-3 items-center ml-2 bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
          <input v-model="levelArray.levels[index!].levelID" maxlength="20" type="text" class="px-2 w-32 text-lg bg-transparent border-none outline-none" :placeholder="$t('level.levelID')">
          <button type="submit" tabindex="-1" class="p-2">
            <img src="@/images/searchOpaque.svg" class="w-6" alt="">
          </button>
        </form>

    </div>

      <!-- Level tags -->
      <div class="flex gap-3 items-center ml-2 max-w-full bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
        <button type="button" class="p-2 button">
          <img src="@/images/levelID.svg" alt="" class="w-8" />
        </button>
        <div id="tagbox" class="relative w-full" contenteditable="true">
        </div>
      </div>

      
      <div class="flex overflow-scroll gap-2 p-2 w-full bg-black bg-opacity-20">
        <button class="flex flex-col gap-3 items-center p-3 px-6 text-white text-opacity-20 rounded-md border-2 border-white border-opacity-20 border-dashed button">
          <img src="@/images/image.svg" class="w-8 opacity-20" alt="">
          Přidat náhled
        </button>
        <button class="flex flex-col gap-3 items-center p-3 px-6 text-white text-opacity-20 rounded-md border-2 border-white border-opacity-20 border-dashed button">
          <img src="@/images/image.svg" class="w-8 opacity-20" alt="">
          Přidat média
        </button>
      </div>
    </div>


  </section>
</template>

<style scoped>
@keyframes appear {
  0% {
    transform: translate(0.5rem) scaleY(0.95);
  }

  100% {
    transform: translate(0) scaleY(1);
  }
}

@media (prefers-reduced-motion: no-preference) {
  section {
    animation: appear 0.1s cubic-bezier(0.215, 0.610, 0.355, 1);
    transform-origin: top;
  }
}

#tagbox::after {
  content: v-bind(tagPlaceholder);
  @apply w-max absolute opacity-40
}
</style>