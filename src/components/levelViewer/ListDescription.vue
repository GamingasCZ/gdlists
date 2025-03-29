<script setup lang="ts">
import type { LevelList, LikeFetchResponse } from "@/interfaces";
import axios, { type AxiosResponse } from "axios";
import { computed, onMounted, ref, watch } from "vue";
import parseText from "../global/parseEditorFormatting";
import { hasLocalStorage } from "@/siteSettings";
import { useI18n } from "vue-i18n";
import Tooltip from "../ui/Tooltip.vue";
import ProfilePicture from "../global/ProfilePicture.vue";
import chroma from "chroma-js";

const props = defineProps<{
  name: string;
  creator: string;
  uid: string;
  timestamp: string;
  views: number;
  data: LevelList;
  id: string;
  commAmount: number;
  listPinned: boolean;
  creatorData: { username: string, discord_id: string, pfp_cutout: number} | false;
  review: boolean;
  openDialogs: [boolean, boolean]
  ratings: [number, number, number]
  hidden: string
  color: number[]
}>();

const emit = defineEmits<{
  (e: "doListAction", action: "sharePopup" | "jumpPopup" | "pinList" | "editList" | "comments" | "mobileExtras" | "rateNotLoggedIn" | "reviewLevels"): void;
  (e: "updateRatings", newRatings: [number, number, number]): void
}>();

const hoveringRating = ref(false)
const hoveringRatebox = ref(false)
onMounted(() => {
  let description = document.getElementById("listDescription")!;
  tallDescription.value = description.scrollHeight > description.clientHeight;
});

const getCol = () =>
  document.documentElement.style.getPropertyValue("--primaryColor")

const toggleDescription = ref<boolean>(false);
const tallDescription = ref<boolean>(false);
watch(toggleDescription, () => {
  let description = document.getElementById("listDescription")!;
  if (toggleDescription.value)
    description.style.height = 20 + description.scrollHeight + "px";
  else description.style.height = "";
});

const localStorg = hasLocalStorage()

const userUID = ref<string>("")
if (hasLocalStorage()) {
  userUID.value = JSON.parse(localStorage.getItem("account_info")!)?.[1] ?? ""
}

const pfp = computed(() => {
  if (!props.creatorData)
    return `../../images/oldPFP.png`
  else
    return props.creatorData.discord_id
})


const ratingButs = ref()
let sendingRating = false
function sendRating(action: 1 | 0) {
  if (sendingRating) return

  // Not logged in
  if (userUID.value == "") {
    return emit("doListAction", "rateNotLoggedIn")
  }

  sendingRating = true
  let ratingParams = {action: action}
  if (props.review) ratingParams.review_id = props.id
  else {
    ratingParams.list_id = props.id
    ratingParams.hidden = props.hidden
  }
  
  // Make ratings visually instant
  let preRatings = props.ratings
  let fakeRatings = props.ratings.slice(0)
  let rating = fakeRatings[2] == -1 ? action : -1
  let add = fakeRatings[2] == -1 ? 1 : -1
  fakeRatings[!action | 0] += add; fakeRatings[2] = rating;
  emit('updateRatings', fakeRatings)


  axios.post(import.meta.env.VITE_API + "/rateAction.php", ratingParams).then(res => {
    const likeData: LikeFetchResponse = res.data
    sendingRating = false
    if (typeof res.data != "object") emit('updateRatings', preRatings)
    else emit('updateRatings', likeData.ratings)
  }).catch(() => {
    emit('updateRatings', preRatings)
  })
}

const noDescription = props.review ?
  useI18n().t('level.noDescription2') : useI18n().t('level.noDescription')

const listUploadDate = computed(() =>props.review ?
  new Date(props.timestamp!).toLocaleDateString() :
  new Date(parseInt(props.timestamp!) * 1000).toLocaleDateString())

const headerColor = computed(() => chroma.hsl(props.color?.[0] ?? 133, 0.39, 0.11, 0.8).css())
const descColor = computed(() => chroma.hsl(props.color?.[0] ?? 133, 0.27, 0.16, 0.8).css())

</script>

<template>
  
  <section class="mx-auto flex w-[80rem] max-w-[95vw] flex-col">
    <section class="hidden print:!visible">
      <h1 class="text-xl">{{ name }}</h1>
      <h2 class="text-xl">{{ creator }}</h2>
    </section>
    <section class="flex gap-2 descriptionControls">
      <!-- Likes and dislikes -->
      <div @mouseenter="hoveringRatebox = true" @mouseleave="hoveringRatebox = false" class="box-border flex flex-col items-center min-w-max max-md:hidden">

        <!-- Like button -->
        <button id="likeButton" class="button relative rounded-lg bg-[#21cc5b] p-1 !transition-colors disabled:grayscale disabled:opacity-20" :disabled="!localStorg"
        :style="{ boxShadow: ratings?.[2] == 1 ? 'rgba(32, 198, 143, 0.5) 0px 0px 29px' : '' }"
        :class="{ '!bg-[#051c0c]': ratings?.[2] == 0, '!bg-[#14805c]': ratings?.[2] == 1 }" @click="sendRating(1)">

          <Transition name="fade"><h6 v-if="hoveringRating" class="absolute -top-5 left-1/2 text-sm text-lime-400 -translate-x-1/2">{{ ratings[0] }}</h6></Transition>
          <img class="w-5" src="@/images/like.svg" alt="" :class="{ 'brightness-[6]': ratings?.[2] == 1 }" />
        </button>

        <!-- Rating text -->
        <span @mouseenter="hoveringRating = true" @mouseleave="hoveringRating = false" class="my-0.5 text-lg font-bold cursor-help">{{ ratings[0]-ratings[1] }}</span>

        <!-- Dislike button -->
        <button ref="ratingButs" id="dislikeButton" class="button relative rounded-lg bg-[#cc2121] p-1 !transition-colors disabled:grayscale disabled:opacity-20" :disabled="!localStorg"
          @click="sendRating(0)"
          :style="{ boxShadow: ratings?.[2] == 0 ? 'rgba(255, 12, 0, 0.79) 0px 0px 29px' : '' }"
          :class="{ '!bg-[#1c0505]': ratings?.[2] == 1, '!bg-[#730909]': ratings?.[2] == 0 }">

          <Transition name="fade"><h6 v-if="hoveringRating" class="absolute -bottom-5 left-1/2 text-sm text-red-500 -translate-x-1/2">{{ ratings[1] }}</h6></Transition>
          <img class="w-5" src="@/images/dislike.svg" alt="" :class="{ 'brightness-[6]': ratings?.[2] == 0 }" />
        </button>

      </div>
      <Transition name="fade">
        <Tooltip v-if="userUID == '' && hoveringRatebox" :text="$t('listViewer.likeNotLoggedIn')" :button="ratingButs" />
      </Transition>

      <!-- Description -->
      <main class="relative backdrop-blur-sm grow">
        <section role="none" :style="{backgroundColor: headerColor}" class="relative rounded-t-md">
          <ProfilePicture class="absolute bottom-1 mx-2 w-12 pointer-events-none shadow-drop" :uid="pfp || -2" :cutout="creatorData?.pfp_cutout || 0" />
          <h1 id="objectName" class="absolute bottom-6 pl-2 ml-14 text-xl">{{ name }}</h1>

          <!-- List information -->
          <div class="flex gap-2 items-center py-0.5 pl-2 ml-14 text-base">

            <!-- Creator -->
            <span class="font-bold">{{ creator }}</span>
            <hr class="w-1 h-4 bg-white bg-opacity-60 rounded-full border-none" />
            
            <!-- Views -->
            <img src="@/images/view.svg" alt="" class="w-4 md:hidden">
            <span>
              <span>{{ views }} </span><span class="max-md:hidden">{{ $t('level.views') }}</span>
            </span>
            <hr class="w-1 h-4 bg-white bg-opacity-60 rounded-full border-none" />
            
            <!-- Date -->
            <span>{{ listUploadDate }}</span>
          </div>
        </section>
        <pre id="listDescription" :style="{backgroundColor: descColor}"
          class="descriptionFade regularParsing h-24 overflow-y-hidden break-words max-w-[95vw] whitespace-pre-wrap rounded-b-md px-2 font-[poppins] leading-5 text-white transition-[height] duration-75 ease-in-out before:transition-opacity"
          :class="{
                'text-opacity-40': ['', undefined].includes(data?.description),
                'before:opacity-0': !tallDescription || toggleDescription,
              }" v-html="parseText(data.description ? data.description : noDescription)"></pre>
        <button v-if="tallDescription" class="absolute bottom-0 left-1/2 w-10 rounded-t-lg"
          :style="{ backgroundColor: getCol() }" @click="toggleDescription = !toggleDescription">
          <img src="@/images/descMore.svg" :class="{ '-scale-y-100': toggleDescription }" class="p-1 mx-auto w-6"
            alt="" />
        </button>
      </main>
    </section>

    <section class="flex justify-between items-start mt-2 descriptionControls">
      <div class="flex">
        <!-- Mobile likes and dislikes -->
        <div class="box-border flex gap-1.5 items-center md:hidden">
          <button class="button rounded-lg bg-[#21cc5b] p-2 !transition-colors disabled:grayscale disabled:opacity-20" :disabled="!localStorg || userUID == ''" @click="sendRating(1)"
            :style="{ boxShadow: ratings?.[2] == 1 ? 'rgba(32, 198, 143, 0.5) 0px 0px 29px' : '' }"
            :class="{ '!bg-[#051c0c]': ratings?.[2] == 0, '!bg-[#14805c]': ratings?.[2] == 1 }">
            <img class="w-6" src="@/images/like.svg" alt="" :class="{ 'brightness-[6]': ratings?.[2] == 1 }" />
          </button>
          <span class="text-lg font-bold text-center min-w-8">{{ ratings[0]-ratings[1] }}
          </span>
          <button class="button rounded-lg bg-[#cc2121] p-2 !transition-colors disabled:grayscale disabled:opacity-20" :disabled="!localStorg || userUID == ''" @click="sendRating(0)"
            :style="{ boxShadow: ratings?.[2] == 0 ? 'rgba(255, 12, 0, 0.79) 0px 0px 29px' : '' }"
            :class="{ '!bg-[#1c0505]': ratings?.[2] == 1, '!bg-[#730909]': ratings?.[2] == 0 }">
            <img class="w-6" src="@/images/dislike.svg" alt="" :class="{ 'brightness-[6]': ratings?.[2] == 0 }" />
          </button>
        </div>

        <hr class="mx-2 my-auto w-1 h-6 bg-white bg-opacity-40 rounded-full border-none md:hidden">

        <!-- Comments button -->
        <div class="md:ml-9">
          <button :class="{'border-b-4 border-lof-400': openDialogs[0]}" class="flex relative items-center p-2 rounded-md button bg-greenGradient" @click="emit('doListAction', 'comments')">
            <img src="@/images/comment.svg" class="inline w-6 md:mr-2" /><label class="max-md:hidden">{{
              $t('level.comments') }}</label>
            <label
              v-show="commAmount > 0"
              class="p-1 my-auto ml-3 text-lg font-bold leading-3 text-black rounded-sm bg-lof-400 max-md:absolute max-md:bottom-1 max-md:right-1">{{
                commAmount }}</label>
          </button>
        </div>

        <!-- Review level ratings button -->
        <div class="ml-2" v-if="review && data.levels.length > 0">
          <button :class="{'border-b-4 border-lof-400': openDialogs[1]}" class="flex relative items-center p-2 rounded-md button bg-greenGradient" @click="emit('doListAction', 'reviewLevels')">
            <img src="@/images/rating.svg" class="inline w-6 md:mr-2" /><label class="max-md:hidden">{{ $t('editor.levels') }}</label>
            <label
            class="p-1 my-auto ml-3 text-lg font-bold leading-3 text-black rounded-sm bg-lof-400 max-md:absolute max-md:bottom-1 max-md:right-1">{{
                data.levels.length }}</label>
          </button>
        </div>
      </div>

      <div class="flex gap-2 max-md:hidden">
        <!-- Share popup -->
        <button :style="{backgroundColor: descColor}" :title="$t('other.share')" @click="emit('doListAction', 'sharePopup')"
          class="p-2.5 rounded-md button aspect-square">
          <img class="w-5" src="@/images/share.svg" alt="" />
        </button>

        <!-- Jump to popup -->
        <button :style="{backgroundColor: descColor}" :title="$t('listViewer.contents')" @click="emit('doListAction', 'jumpPopup')"
          class="p-2.5 rounded-md button aspect-square">
          <img class="w-5" src="@/images/jumpto.svg" alt="" />
        </button>

        <!-- Pin list -->
        <button :style="{backgroundColor: descColor}" :title="$t('level.pin')"
          class="p-2.5 rounded-md button aspect-square"
          @click="emit('doListAction', 'pinList')"
          v-if="localStorg">
          <img class="w-5" src="@/images/pin.svg" alt="" v-if="!listPinned" />
          <img class="w-5" src="@/images/unpin.svg" alt="" v-else />
        </button>

        <!-- Edit list -->
        <button :style="{backgroundColor: descColor}" :title="$t('level.edit')"
          class="p-2.5 rounded-md button aspect-square"
          id="postEditButton"
          @click="emit('doListAction', 'editList')" v-if="userUID == uid">
          <img class="w-5" src="@/images/edit.svg" alt="" />
        </button>
      </div>

      <!-- Mobile show actions button -->
      <div class="md:hidden">
        <button :style="{backgroundColor: descColor}" @click="emit('doListAction', 'mobileExtras')"
          class="p-2.5 rounded-md button aspect-square">
          <img class="w-5" src="@/images/more.svg" alt="" /><label class="max-md:hidden">{{
            $t('other.share') }}</label>
        </button>
      </div>

      <!-- Please login uwu -->
    </section>
  </section>
</template>
