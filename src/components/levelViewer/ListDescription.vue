<script setup lang="ts">
import type { LevelList, LikeFetchResponse } from "@/interfaces";
import axios, { type AxiosResponse } from "axios";
import { computed, onMounted, ref, watch } from "vue";
import parseText from "../global/parseEditorFormatting";
import { hasLocalStorage } from "@/siteSettings";
import { useI18n } from "vue-i18n";
import Tooltip from "../ui/Tooltip.vue";
import ProfilePicture from "../global/ProfilePicture.vue";

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
  creatorData: { username: string, discord_id: string} | false;
  review: boolean;
  openDialogs: [boolean, boolean]
  ratings: [number, number, number]
  hidden: string
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
        <section role="none" class="relative bg-gray-900 bg-opacity-80 rounded-t-md">
          <ProfilePicture class="absolute bottom-1 mx-2 w-12 rounded-full border-2 border-white border-solid pointer-events-none" :uid="pfp" />
          <h1 id="objectName" class="absolute bottom-6 ml-16 text-xl">{{ name }}</h1>

          <!-- List information -->
          <div class="flex gap-2 items-center py-0.5 ml-16 text-base">

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
        <pre id="listDescription"
          class="descriptionFade regularParsing h-24 overflow-y-hidden break-words max-w-[95vw] whitespace-pre-wrap rounded-b-md bg-gray-800 bg-opacity-80 px-2 font-[poppins] leading-5 text-white transition-[height] duration-75 ease-in-out before:transition-opacity"
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
          <button :class="{'border-b-4 border-lof-400': openDialogs[0]}" class="relative p-2 rounded-md button bg-greenGradient" @click="emit('doListAction', 'comments')">
            <img src="@/images/comment.svg" class="inline w-6 md:mr-2" /><label class="max-md:hidden">{{
              $t('level.comments') }}</label>
            <label
              class="px-0.5 py-0.5 ml-1.5 text-xs leading-3 bg-red-500 rounded-sm max-md:absolute max-md:bottom-1 max-md:right-1">{{
                commAmount }}</label>
          </button>
        </div>

        <!-- Review level ratings button -->
        <div class="ml-2" v-if="review && !data.disabledRatings && data.levels.length > 0">
          <button :class="{'border-b-4 border-lof-400': openDialogs[1]}" class="relative p-2 rounded-md button bg-greenGradient" @click="emit('doListAction', 'reviewLevels')">
            <img src="@/images/rating.svg" class="inline w-6 md:mr-2" /><label class="max-md:hidden">{{ $t('editor.levels') }}</label>
            <label
              class="px-0.5 py-0.5 ml-1.5 text-xs leading-3 bg-red-500 rounded-sm max-md:absolute max-md:bottom-1 max-md:right-1">{{
                data.levels.length }}</label>
          </button>
        </div>
      </div>

      <div class="flex gap-2 max-md:hidden">
        <!-- Share popup -->
        <button @click="emit('doListAction', 'sharePopup')"
          class="button w-28 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-md:!p-2">
          <img class="inline w-4 max-md:w-6 md:mr-2" src="@/images/share.svg" alt="" /><label class="max-md:hidden">{{
            $t('other.share') }}</label>
        </button>

        <!-- Jump to popup -->
        <button @click="emit('doListAction', 'jumpPopup')"
          class="button w-28 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-md:!p-2">
          <img class="inline w-4 max-md:w-6 md:mr-2" src="@/images/jumpto.svg" alt="" /><label class="max-md:hidden">{{
            $t('listViewer.jumpTo') }}</label>
        </button>

        <!-- Pin list -->
        <button
          class="button w-28 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-md:!p-2"
          @click="emit('doListAction', 'pinList')"
          v-if="localStorg">
          <img class="inline w-4 max-md:w-6 md:mr-2" src="@/images/pin.svg" alt="" v-if="!listPinned" />
          <img class="inline w-4 max-md:w-6 md:mr-2" src="@/images/unpin.svg" alt="" v-else />
          <label class="max-md:hidden">{{ listPinned ? $t('level.unpin') : $t('level.pin') }}</label>
        </button>

        <!-- Edit list -->
        <button
          class="button w-28 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-md:!p-2"
          id="postEditButton"
          @click="emit('doListAction', 'editList')" v-if="userUID == uid">
          <img class="inline w-4 max-md:w-6 md:mr-2" src="@/images/edit.svg" alt="" /><label class="max-md:hidden">{{
            $t('level.edit') }}</label>
        </button>
      </div>

      <!-- Mobile show actions button -->
      <div class="md:hidden">
        <button @click="emit('doListAction', 'mobileExtras')"
          class="button rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-md:!p-2">
          <img class="inline w-4 max-md:w-6 md:mr-2" src="@/images/more.svg" alt="" /><label class="max-md:hidden">{{
            $t('other.share') }}</label>
        </button>
      </div>

      <!-- Please login uwu -->
    </section>
  </section>
</template>