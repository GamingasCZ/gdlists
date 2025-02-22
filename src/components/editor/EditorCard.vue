<script setup lang="ts">
import { shortenYTLink } from "@/Editor";
import axios, { type AxiosResponse } from "axios";
import chroma, { type Color } from "chroma-js";
import { computed, inject, onMounted, type Ref, ref } from "vue";
import type { Level, LevelSearchResponse, PostData, ytSearchDetails } from "../../interfaces";
import ColorPicker from "../global/ColorPicker.vue";
import DifficultyPicker from "./DifficultyPicker.vue";
import LevelTags from "./LevelTags.vue";
import { useI18n } from "vue-i18n";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import DifficultyIcon from "../global/DifficultyIcon.vue";
import LevelBackground from "./LevelBackground.vue";
import { i18n } from "@/locales";
import Dropdown from "../ui/Dropdown.vue";
import RatingPicker from "../writer/RatingPicker.vue";

const props = defineProps<{
  levelArray: PostData
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

var modDiff = [false, false]

// Difficulty Picker
const changeRate = async (newRating: number) => {
  modDiff[1] = true
  if (modDiff[0] && modDiff[1]) {
    modDiff = [false, false]
    diffPickerOpen.value = false
  }

  if (props.levelArray.levels[props.index!].difficulty[0] != 0) { // N/A cannot be rated
    props.levelArray.levels[props.index!].difficulty[1] = newRating;
  }
  rateImagePath.value = await getRateImage()
}
const changeFace = async (newFace: number) => {
  modDiff[0] = true
  if (modDiff[0] && modDiff[1]) {
    modDiff = [false, false]
    diffPickerOpen.value = false
  }

  if (newFace == 0) {
    props.levelArray.levels[props.index!].difficulty[1] = 0 // Unrate N/A levels
    rateImagePath.value = await getRateImage()
  }

  props.levelArray.levels[props.index!].difficulty[0] = newFace;
  diffFacePath.value = await getDiffFace()
}

const BASE_URL = import.meta.env.BASE_URL
const ratings = ["error", "star", "featured", "epic", "legendary", "mythic"]
const rateImagePath = ref("")
const getRateImage = () => {
  let rate = props.levelArray.levels[props.index!].difficulty?.[1] ?? 0;
  if (rate == 0) rateImagePath.value = ""; // Unrated level
  else {
    rateImagePath.value = `${BASE_URL}/faces/${ratings[rate - 1]}.webp`
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

const tagPlaceholder = ref(`'${i18n.global.t('editor.levelTags')}'`)
const start = ref("#951b99")
const editingRating = ref(false)

const difficultyButton = ref<HTMLButtonElement>()
const diffPickerOpen = ref(false)
const difficulties = [1,2,3,4,5,6,7,8,9,10,0,11]
</script>

<template>
  <section :style="{background: background}" class="rounded-md">

    <Dropdown v-if="diffPickerOpen" @close="diffPickerOpen = false" :button="difficultyButton">
      <template #header>
        <section class="flex gap-2 p-2 text-white">
          <div class="">
            <div class="flex flex-wrap gap-1 gap-y-3 w-60">
              <button @click="changeFace(diff)" v-for="diff in difficulties" :class="{'!border-lof-400 !bg-lof-300': levelArray.levels[index].difficulty[0] == diff}" class="p-0.5 bg-black bg-opacity-20 rounded-md border border-transparent grow button hover:bg-opacity-60">
                <img :src="`${BASE_URL}/faces/${diff}.webp`" class="mx-auto w-9" alt="">
              </button>
            </div>
            <p class="mt-2 text-2xl text-center text-white/40">{{ $t('reviews.difficulty') }}</p>
          </div>

          <hr class="mx-4 my-auto w-0.5 h-40 bg-white bg-opacity-10 rounded-md border-none opacity-50">
          
          <div class="">
            <div class="grid grid-cols-2 gap-1 mb-5">
              <button @click="changeRate(i)" v-for="(rate, i) in ratings" :class="{'!border-lof-400 !bg-lof-300': levelArray.levels[index].difficulty[1] == i}" class="p-0.5 bg-black bg-opacity-20 rounded-md border border-transparent grow button hover:bg-opacity-60">
                <img :src="`${BASE_URL}/faces/${rate}.webp`" class="mx-auto w-9" alt="">
              </button>
            </div>
            <p class="mt-2 text-2xl text-center text-white/40">{{ $t('editor.rating') }}</p>
          </div>
        </section>
      </template>
    </Dropdown>

    <div v-show="!editingRating" class="flex max-sm:flex-col">
      <div class="flex justify-between items-center px-0.5 py-2 bg-black bg-opacity-20 sm:flex-col">
  
        <!-- Move level -->
        <div class="flex items-center sm:gap-2 sm:flex-col">
          <button class="px-1.5 button"
              :title="$t('editor.moveUpTitle')" @click="emit('doMove', index!, index! - 1); openedPanel = 0;">
              <img class="w-6" src="../../images/moveUp.svg" alt="">
          </button>
          <input autocomplete="off" readonly
            class="w-10 mx-1 max-w-[20vw] cursor-move outline-none font-black text-xl rounded-md bg-black bg-opacity-40 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
            :value="index! + 1" @mousedown="mobileMoveLevel()" />
          <button class="px-1.5 button"
              :title="$t('editor.moveDownTitle')" @click="emit('doMove', index!, index! + 1); openedPanel = 0;">
              <img class="w-6" src="../../images/moveDown.svg" alt="">
          </button>
        </div>
  
        <div class="flex gap-4 items-center max-sm:pr-2 sm:flex-col">
  
          <button @click="openedPanel = openedPanel != 1 ? 1 : 0" :title="$t('editor.levelColorTitle')" class="opacity-60 button">
            <img class="w-6" src="../../images/color.svg" alt="" />
          </button>
          
          <button @click="levelArray.levels.splice(index, 1)" :title="$t('editor.removeTitle')" class="opacity-60 button">
            <img class="w-7" src="../../images/trash.svg" alt="" />
          </button>
        </div>
  
      </div>
  
      <div class="flex flex-col gap-2 mt-2 w-full overflow-clip">
  
        <div class="flex gap-2 max-sm:flex-col">
          <div class="grid grid-cols-2 max-sm:mr-2 sm:max-w-[50%] gap-2">
            <!-- Level name -->
            <form @submit.prevent="searchLevel(false)" class="flex col-span-2 gap-3 items-center ml-2 bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
              <button ref="difficultyButton" @click="diffPickerOpen = true" type="button" class="button">
                <DifficultyIcon class="w-12" :difficulty="selectedDiff?.[0] ?? 0" :rating="selectedDiff?.[1] ?? 0" />
              </button>
              <input v-model="levelArray.levels[index!].levelName" maxlength="20" type="text" class="w-full text-2xl font-bold bg-transparent border-none outline-none" :placeholder="$t('level.levelName')">
              <button :disabled="!levelArray.levels[index].levelName.length" type="submit" tabindex="-1" class="p-2 transition-opacity disabled:opacity-20">
                <img src="@/images/searchOpaque.svg" class="min-w-6" alt="">
              </button>
            </form>
    
            <!-- Creator -->
            <div class="flex gap-3 items-center ml-2 bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
              <button @click="openCollabTools()" type="button" tabindex="-1" class="p-2 button">
                <img src="@/images/collabMen.svg" alt="" class="min-w-8" />
              </button>
              <input :value="levelCreator" @change="modifyCreator" maxlength="20" type="text" class="w-36 text-lg bg-transparent border-none outline-none" :placeholder="$t('level.creator')">
            </div>
    
            <!-- Level ID -->
            <form @submit.prevent="searchLevel(false)" class="flex gap-3 items-center bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
              <input v-model="levelArray.levels[index!].levelID" maxlength="20" type="text" class="px-2 w-full text-lg bg-transparent border-none outline-none" :placeholder="$t('level.levelID')">
              <button :disabled="!levelArray.levels[index].levelID.length" type="submit" tabindex="-1" class="p-2 transition-opacity disabled:opacity-20">
                <img src="@/images/searchOpaque.svg" class="min-w-6" alt="">
              </button>
            </form>
          </div>
  
          <!-- Level rating -->
          <button
            @click="editingRating = true"
            class="h-full min-h-16 grow button bg-[url(@/images/reviews/noRating.webp)] relative scrollRating"
          >
            
          </button>
        </div>
  
        <!-- Level tags -->
        <div class="flex gap-3 items-center mx-2 max-w-full bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
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
    </div>

    <div v-show="editingRating">
      <header @click="editingRating = false" class="flex gap-2 items-center p-1 pl-5 bg-black bg-opacity-40 transition-colors duration-75 cursor-pointer group hover:bg-opacity-60">
        <img src="@/images/hideSidebar.svg" class="w-6 transition-transform duration-75 group-hover:-translate-x-2 group-active:translate-x-1" alt="">
        <DifficultyIcon class="ml-2 w-12" :difficulty="levelArray.levels[index].difficulty[0]" :rating="levelArray.levels[index].difficulty[1]" />
        <div>
          <p class="text-2xl font-bold leading-tight">{{ levelArray.levels[index].levelName }}</p>
          <p class="text-sm leading-none">{{ levelCreator }}</p>
        </div>
      </header>
      <section>
        <RatingPicker :value="levelArray.levels[index!]?.ratings?.[0]?.[0]" />
      </section>
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

@keyframes scroll {
    from {
        background-position: 0 0;
    }
    to {
        background-position: 64px -64px;
    }
}

@media (prefers-reduced-motion) {
    .scrollRating { animation: none; }
}

.scrollRating {
    @apply relative overflow-clip transition-colors;
    animation: scroll 5s infinite linear;
    mask: radial-gradient(black, transparent 80%);
}
.scrollRating:hover {
    @apply bg-[#6f1a4921] brightness-150;
}

</style>