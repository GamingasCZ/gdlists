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
</script>

<template>
  <!-- Card content -->
  <section :style="{ background: background }" class="flex gap-1.5 overflow-clip rounded-md">

    <div class="flex flex-col items-center bg-black bg-opacity-40">
      <!-- Level position -->
      <div class="flex flex-col items-center grow">
        <img class="box-border p-1.5 w-10 button aspect-square" src="../../images/moveUp.svg" alt=""
          :title="$t('editor.moveUpTitle')" @click="emit('doMove', index!, index! - 1); openedPanel = 0;" />
        <input autocomplete="off" readonly
          class="w-12 mx-1 max-w-[20vw cursor-move outline-none font-black text-2xl rounded-md bg-black bg-opacity-40 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
          :value="index! + 1" @mousedown="mobileMoveLevel()" />
        <img class="box-border p-1.5 w-10 button aspect-square" src="../../images/moveDown.svg" alt=""
          :title="$t('editor.moveDownTitle')" @click="emit('doMove', index!, index! + 1); openedPanel = 0;" />
      </div>

      <!-- Other level controls -->
      <div class="flex flex-col">
        <button @click="openedPanel = openedPanel != 1 ? 1 : 0" :title="$t('editor.levelColorTitle')" class="button">
          <img class="w-6" src="../../images/color.svg" alt="" />
        </button>

        <button @click="levelArray.levels.splice(index, 1)" :title="$t('editor.removeTitle')" class="button">
          <img class="w-7" src="../../images/trash.svg" alt="" />
        </button>

      </div>
    </div>

    <div>
      <div class="flex justify-between p-2 pr-1">
        <!-- Mobile move button -->
        <button type="button" @click="mobileMoveLevel()" class="mr-1 sm:hidden" v-if="levelArray.levels.length > 1">
          <img class="p-1 w-10 bg-black bg-opacity-40 rounded-md transition-opacity duration-100 button"
            src="../../images/move.svg" alt="" />
        </button>
      </div>
      <div class="flex gap-2 items-center">
        <!-- Level name input -->
        <div class="flex gap-2 max-sm:w-full">
          <button class="bg-black bg-opacity-40 rounded-md button" :title="$t('editor.diffTitle')"
            @click="openedPanel = openedPanel != 2 ? 2 : 0">
            <DifficultyIcon class="w-10" :difficulty="selectedDiff[0]" :rating="selectedDiff[1]" />
          </button>
          <input autocomplete="off"
            class="h-10 sm:max-w-[20vw] rounded-md bg-black bg-opacity-40 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:w-full"
            type="text" name="levelName" maxlength="20" v-model="levelArray.levels[index!].levelName"
            :placeholder="$t('level.levelName')" />
        </div>

        <!-- Level search -->
        <div class="flex relative gap-2 items-center">
          <button :disabled="!searchAvailableCreator" type="button" class="absolute right-1 top-1/2 z-10 button"
            :title="$t('editor.searchTitle')" :style="{ opacity: searchAvailableCreator ? 1 : 0.5 }"
            @click="searchLevel(false)">
            <img src="../../images/loading.webp" alt="" class="p-0.5 w-full animate-spin" v-if="searching">
            <img class="w-6 transition-opacity duration-100" src="../../images/searchOpaque.svg" alt="" />
          </button>
        </div>

        <div class="box-border inline-flex gap-2">
          <!-- Level ID input -->
          <input autocomplete="off" @keyup.enter="searchLevel(true)"
            class="max-w-[20vw] py-2 box-border rounded-md bg-black bg-opacity-40 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:max-w-[30vw]"
            type="text" name="levelID" v-model="levelArray.levels[index!].levelID" :placeholder="$t('level.levelID')" />
        </div>
      </div>
      <div class="">
        <!-- Creator input -->
        <div class="flex gap-2 max-sm:flex-row-reverse max-sm:w-full">
          <button class="relative bg-black bg-opacity-40 rounded-md focus-within:!outline-current button"
            @click="openCollabTools()" :title="$t('editor.collabTitle')"
            :class="{ 'hue-rotate-180': typeof levelArray.levels[index!].creator == 'object', '!-hue-rotate-90': isOldCollab, 'hue-rotate-90': collabFlash }">
            <img class="absolute top-0 left-0 p-1 w-10 animate-ping aspect-square" src="../../images/collabMen.svg"
              alt="" v-if="collabFlash" />
            <img class="p-1 w-12 sm:w-10 aspect-square" src="../../images/collabMen.svg" alt="" />
          </button>
          <input autocomplete="off"
            class="px-2 bg-black bg-opacity-40 rounded-md placeholder:text-white placeholder:text-opacity-80 max-sm:w-full disabled:opacity-20"
            type="text" name="creator" maxlength="15" :disabled="isOldCollab" :value="levelCreator"
            @change="modifyCreator" :placeholder="$t('level.creator')" @keyup.enter="searchLevel(false)" />
        </div>
      </div>

    </div>

    <section class="relative bg-black bg-opacity-20" v-if="ytPanelOpen">
      <header class="flex justify-between items-center px-3 py-2 bg-black bg-opacity-20">
        <h3>{{ $t('editor.videoSearch') }}</h3>
        <button class="button" @click="ytPanelOpen = false"><img src="@/images/close.svg" class="w-4" alt=""></button>
      </header>

      <button v-show="vidScrollBox > 5 || vidScrollBox == -1" @click="scroll(-600)"
        class="absolute left-2 top-1/2 z-10 w-10 h-10 text-3xl font-bold text-black rounded-full border-2 border-black border-solid -translate-y-1/2 max-sm:hidden button bg-lof-400">&lt;</button>
      <main class="flex overflow-x-hidden relative gap-2 p-2 max-sm:flex-col scroll-smooth" id="youtubeScroll">
        <YoutubeVideoPreview v-for="vid in ytVideoData?.videoCount" :index="vid" :video-data="ytVideoData"
          @pick-video="levelArray.levels[index!].video = $event" />
      </main>
      <button v-show="vidScrollBox != -1" @click="scroll(600)"
        class="absolute right-2 top-1/2 z-10 w-10 h-10 text-3xl font-bold text-black rounded-full border-2 border-black border-solid -translate-y-1/2 max-sm:hidden button bg-lof-400">&gt;</button>

    </section>
    <!-- Extras panel -->
    <div class="p-2 bg-black bg-opacity-20" v-show="openedPanel">
      <!-- Youtube panel -->

      <ColorPicker v-if="openedPanel == 1" @colors-modified="changeCardColors" :hue="levelArray.levels[index!].color[0]"
        :saturation="levelArray.levels[index!].color[1]" :lightness="levelArray.levels[index!].color[2] * 64" />
      <DifficultyPicker v-if="openedPanel == 2" :level="index" @update="selectedDiff = $event"
        :level-array="levelArray" />
      <LevelTags :level-array="levelArray" :card-index="index" v-if="openedPanel == 3"
        @open-popup="emit('openTagPopup')" />
      <LevelBackground :level-array="levelArray" :card-index="index" v-if="openedPanel == 4" />
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
</style>