<script setup lang="ts">
import { currentUID, lastUsedTags, newCardBG, shortenYTLink, TAG_COUNT } from "@/Editor";
import axios, { type AxiosResponse } from "axios";
import chroma, { type Color } from "chroma-js";
import { computed, inject, onMounted, type Ref, ref } from "vue";
import { LevelImage, type LevelScreenshot, WriterGallery, type Level, type LevelSearchResponse, type PostData } from "../../interfaces";
import ColorPicker from "../global/ColorPicker.vue";
import LevelTags from "./LevelTags.vue";
import { useI18n } from "vue-i18n";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import DifficultyIcon from "../global/DifficultyIcon.vue";
import { i18n } from "@/locales";
import Dropdown from "../ui/Dropdown.vue";
import { getDominantColor, getDominantLine } from "@/Reviews";
import { breakCache } from "../global/imageCache";
import EditorCardRatingView from "./EditorCardRatingView.vue";
import EditorTag from "./EditorTag.vue";
import EditorCardTagDropdown from "./EditorCardTagDropdown.vue";
import { TagName } from "@/assets/tags";

const props = defineProps<{
  levelArray: PostData
  index: number;
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
const searching = defineModel({default: false})
function searchLevel(searchingByID: boolean, userSearchPage: number = 0) {
  if (searchingByID && !searchAvailableID.value) return
  if (!searchingByID && !searchAvailableCreator.value) return
  if (searching.value) return

  let levelID = props.levelArray.levels[props.index!].levelID;
  let levelName = props.levelArray.levels[props.index!].levelName;
  let searchingFromUser = levelName && levelCreator.value

  let thumb = `thumb=${SETTINGS.value?.saveThumbs ? 1 : 0}`
  let request: string = "";
  if (searchingByID) request = `${thumb}&id=${levelID}`; // Searching by ID
  else if (!levelName && levelCreator.value) request = `${thumb}&levelMaker=${levelCreator.value}`
  else {
    if (searchingFromUser) {
      // Find level by specific creator
      request = `${thumb}&userSearch=${levelCreator.value}&name=${levelName}&page=${userSearchPage}`;
    } else request = `${thumb}&levelName=${levelName}`; // Find level
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
      
      if (level.platf)
        props.levelArray.levels[props.index!].tags.push([TagName.PLATFORMER, -1, '']);
      if (level.objCount >= 40000)
        props.levelArray.levels[props.index!].tags.push([TagName.HIGH_OBJECTS, -1, '']);
      if (level.isCopy)
        props.levelArray.levels[props.index!].tags.push([TagName.COPY, -1, '']);
      if (level.coins)
        props.levelArray.levels[props.index!].tags.push([TagName.COINS, -1, '']);
      if (level.twoPlayer)
        props.levelArray.levels[props.index!].tags.push([TagName.TWO_PLAYER, -1, '']);
      if (level.gameVer == 19)
        props.levelArray.levels[props.index!].tags.push([TagName.ONE_P_NINE, -1, '']);
      if (level.len == 4) // XL
        props.levelArray.levels[props.index!].tags.push([TagName.LONG, -1, '']);
      if (level.downloads > 250 && level.likes / level.downloads < 0.01) // XL
        props.levelArray.levels[props.index!].tags.push([TagName.CONTROVERSIAL, -1, '']);


      props.levelArray.levels[props.index!].BGimage.image[0] = level.thumbnail;
      
      colorizeViaThumb()

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

const colorizeViaThumb = () => {
  let thumbURL = props.levelArray.levels[props.index!]?.BGimage?.image?.[0]
  if (!thumbURL) return
  if (!SETTINGS.value.colorization) return

  let thumbImg = new Image()
  thumbImg.src = `${userContent}/userContent/${currentUID.value}/${thumbURL}.webp`
  thumbImg.onload = () => {
    let thumbCol = getDominantColor(thumbImg).hsl()
    let thumbDom = getDominantLine(thumbImg)

    props.levelArray.levels[props.index].BGimage.image[1] = thumbDom
    changeCardColors([thumbCol[0], 0, thumbCol[2]*64])
    breakCache()
  }
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

const base = import.meta.env.BASE_URL

const pickImages = () => {
  openDialogs.imagePicker = [true, WriterGallery.LevelImage, props.index]
}
const pickingColor = ref(false)
const changeCardColors = (newColors: [number, number, number]) =>
(props.levelArray.levels[props.index!].color = [
  newColors[0],
  0.5,
  parseFloat((newColors[2] / 64).toFixed(2)),
]);

const addingVideo = ref(false)
const videoInput = ref<HTMLInputElement>()
const userContent = import.meta.env.VITE_USERCONTENT

const levelMedia = computed(() => {
  let allMedia: LevelScreenshot[] = []
  let video = props.levelArray.levels[props.index]?.video
  let bgImage = props.levelArray.levels[props.index]?.BGimage?.image?.[0]
  let screenshots = props.levelArray.levels[props.index]?.screenshots
  if (video)
    allMedia.push([LevelImage.VIDEO,video,""])
  if (bgImage && bgImage[0])
    allMedia.push([LevelImage.THUMBNAIL,bgImage,""])

  if (screenshots)
  allMedia = allMedia.concat(screenshots)

  return allMedia
})

const imageSettingsOpen = ref(-1)
const gearElement = ref<HTMLButtonElement>()

const setAsThumb = (srcshotIndex: number) => {
  let arr = props.levelArray.levels[props.index]
  if (!arr?.BGimage)
  arr.BGimage = newCardBG()

  let previousThumb
  if (arr.BGimage.image[0]) {
    srcshotIndex--
    previousThumb = arr.BGimage.image[0]
  }

  arr.BGimage.image[0] = arr.screenshots[srcshotIndex][1]
  arr.screenshots?.splice(srcshotIndex, 1)

  if (previousThumb) {
    arr.screenshots?.push([
      LevelImage.IMAGE,
      previousThumb,
      ""
    ])
  }

  colorizeViaThumb()
}

const unsetThumb = () => {
  let arr = props.levelArray.levels[props.index]
  arr.screenshots.push([
    LevelImage.IMAGE,
    arr.BGimage.image[0],
    ""  
  ])
  arr.BGimage.image[0] = ""
  imageSettingsOpen.value = -1
}

const removeScreenshot = (type: LevelImage, ind: number) => {
  let arr = props.levelArray.levels[props.index]
  if (type == LevelImage.THUMBNAIL) {
    arr.BGimage.image[0] = ""
  }
  else {
    arr.screenshots?.splice(ind-1, 1)
  }
}

const tagbox = ref<HTMLInputElement>()
const nameInput = ref<HTMLInputElement>()
onMounted(() => {
  nameInput.value.focus()
})

const tagSearch = ref("")
const tagDropdownShown = ref(false)
const tagNames = (() => {
  let tags: [number, string][] = []
  for (let i = 0; i < TAG_COUNT; i++)
    tags.push([i, i18n.global.t(`editor.tags[${i}]`)])
  return tags
})()
const filteredTags = computed(() => {
  return tagNames.filter(x => x[1].toLowerCase().includes(tagSearch.value.toLowerCase()))
})

const addTag = (ind: number) => {
  if (props.levelArray.levels[props.index].tags.length >= 15) return

  if (!lastUsedTags.value.includes(ind))
        lastUsedTags.value.splice(0,0, ind)

  if (lastUsedTags.value.length > 5)
      lastUsedTags.value.pop()
  
  props.levelArray.levels[props.index].tags.push([ind, -1, ''])
  tagSearch.value = ''
}

const editLastTag = (e: KeyboardEvent) => {
  if (tagSearch.value.length) return
  let lastTag = props.levelArray.levels[props.index].tags.pop()
  if (!lastTag) return

  if (lastTag[1] == -1)
    tagSearch.value = i18n.global.t(`editor.tags[${lastTag[0]}]`)
  else
    tagSearch.value = lastTag[1]
}

const removeTag = (ind: number) => {
  props.levelArray.levels[props.index].tags.splice(ind, 1)
}

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

    <div v-show="!editingRating" class="flex overflow-visible max-sm:flex-col">
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
  
          <button @click="pickingColor = !pickingColor" :title="$t('editor.levelColorTitle')" :class="{'!opacity-100': pickingColor}" class="opacity-40 mix-blend-plus-lighter invert-[0.2] button">
            <img class="w-6" src="../../images/color.svg" alt="" />
          </button>
          
          <button @click="levelArray.levels.splice(index, 1)" :title="$t('editor.removeTitle')" class="opacity-40 mix-blend-plus-lighter button invert-[0.2]">
            <img class="w-7" src="../../images/trash.svg" alt="" />
          </button>
        </div>
  
      </div>
  
      <div class="grid gap-2 mt-2">
  
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="grid grid-cols-2 gap-2 max-sm:mr-2">
            <!-- Level name -->
            <form @submit.prevent="searchLevel(false)" class="flex col-span-2 gap-3 items-center ml-2 bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
              <button ref="difficultyButton" @click="diffPickerOpen = true" type="button" class="button">
                <DifficultyIcon class="w-12" :difficulty="selectedDiff?.[0] ?? 0" :rating="selectedDiff?.[1] ?? 0" />
              </button>
              <input ref="nameInput" v-model="levelArray.levels[index!].levelName" maxlength="20" type="text" class="w-full text-2xl font-bold bg-transparent border-none outline-none" :placeholder="$t('level.levelName')">
              <button :disabled="!levelArray.levels?.[index]?.levelName || searching" type="submit" tabindex="-1" class="p-2 transition-opacity disabled:opacity-20">
                <img v-if="searching" src="@/images/loading.webp" class="w-6 animate-spin min-w-6" alt="">
                <img v-else src="@/images/searchOpaque.svg" class="min-w-6" alt="">
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
            <form @submit.prevent="searchLevel(true)" class="flex gap-3 items-center bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
              <input v-model="levelArray.levels[index!].levelID" maxlength="20" type="text" class="px-2 w-full text-lg bg-transparent border-none outline-none" :placeholder="$t('level.levelID')">
              <button :disabled="!levelArray.levels?.[index]?.levelID || searching" type="submit" tabindex="-1" class="p-2 transition-opacity disabled:opacity-20">
                <img v-if="searching" src="@/images/loading.webp" class="w-6 animate-spin min-w-6" alt="">
                <img v-else src="@/images/searchOpaque.svg" class="min-w-6" alt="">
              </button>
            </form>
          </div>
  
          <!-- Level rating -->
          <button
            @click="editingRating = true"
            class="relative mr-2 h-full overflow-clip min-h-16"
          >
            <div class="absolute inset-0 scrollRating" :style="{backgroundImage: `url(${base}/rateBGs/noRating.webp)`}"></div>
            
          </button>
        </div>
  
        <!-- Level tags -->
        <div ref="tagbox" class="flex relative gap-3 items-center py-1 mx-2 max-w-full bg-black bg-opacity-20 rounded-md focus-within:bg-opacity-60">
          <div class="px-1 pr-0">
            <img src="@/images/levelID.svg" alt="" class="w-10 min-w-10" />
          </div>
          <div class="flex flex-wrap gap-1 grow">
            <EditorTag
              v-for="(tag, ind) in levelArray.levels[index].tags"
              @auxclick="removeTag(ind)"
              :tag="tag"
              selectable
              gear
              settable
            />
            <div class="flex gap-1" v-show="!levelArray.levels[index].tags.length">
              <EditorTag @click="addTag(TagName.PLATFORMER)" :tag="[TagName.PLATFORMER, -1, '']" isExample selectable plus />
              <EditorTag @click="addTag(TagName.COINS)" :tag="[TagName.COINS, -1, '']" isExample selectable plus />
            </div>

            <input 
              v-model="tagSearch"
              @focus="tagDropdownShown = true"
              @blur="tagDropdownShown = false"
              @keyup.enter="filteredTags?.[0]?.[0] !== undefined && addTag(filteredTags[0][0])"
              @keydown.backspace="editLastTag"
              class="relative bg-transparent outline-none min-w-12 grow"
            >
          </div>

          <Teleport to="body">
            <EditorCardTagDropdown
              v-if="tagDropdownShown"
              @add="addTag"
              :filtered-tags="filteredTags"
              :tagbox="tagbox"
            />
          </Teleport>
        </div>
  
        <!-- Screenshot carousel & Color Picker -->
        <div class="flex overflow-auto gap-2 p-2 bg-black bg-opacity-20">
          <div v-show="!pickingColor" v-for="(image, ind) in levelMedia" class="relative duration-200 aspect-video group">

            <!-- Background preview -->
            <img class="object-cover object-center w-full h-28 rounded-md transition-all group-hover:brightness-50 shadow-drop" :src="`${userContent}/userContent/${currentUID}/${image[1]}.webp`" alt="">
            
            <!-- Thumbail indicator -->
            <img v-if="image[0] == LevelImage.THUMBNAIL" src="@/images/image.svg" class="absolute invert-[0.2] sepia hue-rotate-30 bottom-2 left-1 w-5 shadow-drop" alt="">
            
            <!-- Settings overlay -->
            <div class="absolute inset-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button ref="gearElement" @click="imageSettingsOpen = ind" class="absolute top-1 right-1">
                <img src="@/images/gear.svg" class="w-5" alt="">
              </button>
              <button v-if="image[0] == LevelImage.IMAGE" @click="setAsThumb(ind)" class="flex absolute bottom-0 left-0 p-1 text-sm rounded-md hover:bg-black hover:bg-opacity-80">
                <img src="@/images/plus.svg" class="mr-2 w-5" alt="">
                {{ $t('reviews.setThumb') }}
              </button>
              <button @click="removeScreenshot(image[0], ind)" class="absolute right-1 bottom-1">
                <img src="@/images/trash.svg" class="w-5" alt="">
              </button>
            </div>
          </div>
          
          <div v-show="!pickingColor" class="p-3 rounded-md border-2 border-white border-dashed opacity-10 transition-opacity mix-blend-plus-lighter hover:opacity-40">

            <!-- Add buttons -->
            <div v-if="!addingVideo" class="flex flex-col gap-1 min-w-max text-left">
              <button @click="pickImages" class="flex gap-2 items-center p-2 rounded-md hover:bg-opacity-20 hover:bg-white">
                <img :src="`${base}/formatting/showImage.svg`" class="w-6" alt="">
                {{ $t('reviews.addImage') }}
              </button>
              <hr class="m-0 opacity-50">
              <button @click="addingVideo = true" class="flex gap-2 items-center p-2 rounded-md hover:bg-opacity-20 hover:bg-white">
                <img :src="`${base}/formatting/addVideo.svg`" class="w-6" alt="">
                {{ $t('reviews.addVideo') }}
              </button>
            </div>
            
            <!-- Video link input -->
            <div v-else class="p-1 pt-0">
              <div class="flex items-center mb-3">
                <button @click="addingVideo = false" class="p-2 mr-2 rounded-md hover:bg-white hover:bg-opacity-20">
                  <img src="@/images/back.svg" class="w-6" alt="">
                </button>
                <img :src="`${base}/formatting/addVideo.svg`" class="mr-1 w-6 pointer-events-none" alt="">
                <span>{{ $t('reviews.addVideo') }}</span>
              </div>
              <input @vue:mounted="videoInput.focus()" ref="videoInput" type="text" class="px-2 py-1 w-64 bg-black bg-opacity-80 rounded-md" placeholder="Vlož odkaz na YouTube video">
            </div>

          </div>

          <ColorPicker v-if="pickingColor" @colors-modified="changeCardColors" :hue="levelArray.levels[index!].color[0]"
          :saturation="levelArray.levels[index!].color[1]" :lightness="levelArray.levels[index!].color[2] * 64" />
        </div>
        
      </div>
    </div>

    <EditorCardRatingView
      v-show="editingRating"
      @close="editingRating = false"
      :post-data="levelArray"
      :level-index="index"
      :level-creator="levelCreator"
    />

  </section>

  <!-- Thumbnail / Media options -->
  <Dropdown v-if="imageSettingsOpen >= 0" @close="imageSettingsOpen = -1" :button="gearElement[imageSettingsOpen]">
    <template #header>
      <section v-if="levelMedia[imageSettingsOpen][0] == LevelImage.THUMBNAIL" class="flex flex-col gap-1 p-2 text-white">
				<button @click="openDialogs.BGpicker = [true, 1, index]; imageSettingsOpen = -1" class="p-2 text-xl bg-black bg-opacity-40 rounded-md button">
					<img src="@/images/move.svg" alt="" class="inline mr-2 w-5">
					<span>{{ $t('reviews.setPos') }}</span>
				</button>
        <span class="mt-2 text-2xl text-opacity-40">{{ $t('editor.thumbStyle') }}</span>
        <div class="flex gap-2">
          <button v-for="i in 4" :class="{'outline': levelArray.levels[index].BGimage?.theme == i-1}" @click="levelArray.levels[index].BGimage.theme = i-1" class="p-2 bg-black bg-opacity-40 rounded-md outline-2 outline-lof-400">
						<img :src="`${base}/cardThemeIcons/theme${i}.svg`" class="w-max" alt="">
				  </button>
        </div>
        <span class="mt-2 text-2xl text-opacity-40">{{ $t('other.opacity') }}</span>
				<input type="range" class="slider" min="0.1" max="1" step="0.05" v-model="levelArray.levels[index].BGimage.opacity">

        <div class="flex justify-between items-center mt-2 text-lg">
          <span>{{ $t('other.scrolling') }}</span>
          <select @mousedown.prevent="" class="text-base" v-model="levelArray.levels[index].BGimage.scrolling">
            <option :value="0">{{ $t('other.off') }}</option>
            <option :value="1">{{ $t('other.byitself') }}</option>
            <option :value="2">{{ $t('other.parallax') }}</option>
          </select>
        </div>
        <div class="flex justify-between items-center mt-2 text-lg">
          <span>{{ $t('other.tiling') }}</span>
          <input type="checkbox" v-model="levelArray.levels[index].BGimage.tile" class="!m-0 button">
        </div>

        <button @click="unsetThumb()" class="flex gap-2 justify-center items-center text-lg text-center text-red-400 rounded-md hover:bg-black hover:bg-opacity-40">
          <img class="w-5" src="@/images/del2.svg" alt="">
          {{ $t('reviews.unsetThumb') }}
        </button>
      </section>

      <section v-else class="p-2 text-white">
        <p class="text-lg">{{ $t('other.desc') }}</p>
        <input type="text" v-model="levelMedia[imageSettingsOpen][2]" class="px-2 py-1 mt-1 bg-white bg-opacity-10 rounded-md">
      </section>
    </template>
  </Dropdown>
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

@keyframes scroll2 {
    from {
        background-position: 0 0;
    }
    to {
        background-position: 7rem -7rem;
    }
}

@media (prefers-reduced-motion) {
    .scrollRating { animation: none; }
}

.scrollRating {
    @apply transition-transform;
    animation: scroll2 5s infinite linear;
    background-size: 7rem;
    mix-blend-mode: plus-lighter;
    mask-image: radial-gradient(black, transparent 80%)
  }

.scrollRating:hover {
  @apply bg-[#6f1a4921] brightness-150 scale-110;
}

</style>
