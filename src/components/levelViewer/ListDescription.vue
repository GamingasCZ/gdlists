<script setup lang="ts">
import type { LikeFetchResponse, PostData, TitleData } from "@/interfaces";
import axios, { type AxiosResponse } from "axios";
import { computed, onMounted, ref, watch } from "vue";
import parseText from "../global/parseEditorFormatting";
import { hasLocalStorage } from "@/siteSettings";
import { useI18n } from "vue-i18n";
import Tooltip from "../ui/Tooltip.vue";
import ProfilePicture from "../global/ProfilePicture.vue";
import chroma from "chroma-js";
import { prettyDate } from "@/Editor";
import PostTitle from "./PostTitle.vue";

const props = defineProps<{
  name: string;
  creator: string;
  uid: string;
  timestamp: string;
  views: number;
  data: PostData;
  id: string;
  commAmount: number;
  listPinned: boolean;
  creatorData: { username: string, discord_id: string, pfp_cutout: number} | false;
  review: boolean;
  openDialogs: [boolean, boolean]
  ratings: [number, number, number]
  hidden: string
  color: number[]
  titleData: TitleData
}>();

const emit = defineEmits<{
  (e: "doListAction", action: "sharePopup" | "jumpPopup" | "pinList" | "editList" | "comments" | "mobileExtras" | "rateNotLoggedIn" | "reviewLevels"): void;
  (e: "updateRatings", newRatings: [number, number, number]): void
}>();

const hoveringRating = ref(false)
const hoveringRatebox = ref(false)
onMounted(() => {
  // let description = document.getElementById("listDescription")!;
  // tallDescription.value = description.scrollHeight > description.clientHeight;
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

const listUploadDate = computed(() =>props.review ?
  ((Date.now() - new Date(props.timestamp!))/1000) :
  ((Date.now() - new Date(parseInt(props.timestamp!))*1000)/1000))

const descColor = computed(() => chroma.hsl(props.color?.[0] ?? 133, 0.27, 0.16, 0.8).css())

</script>

<template>
  
  <section class="mx-auto flex w-[70rem] max-w-[95vw] flex-col">
    <section class="hidden print:!visible">
      <h1 class="text-xl">{{ name }}</h1>
      <h2 class="text-xl">{{ creator }}</h2>
    </section>
    <section class="gap-2 descriptionControls">
      <PostTitle :title-data="data.titleData" :text="name" :tagline="data.tagline" :font="data.font" />


      <!-- <Transition name="fade">
        <Tooltip v-if="userUID == '' && hoveringRatebox" :text="$t('listViewer.likeNotLoggedIn')" :button="ratingButs" />
      </Transition> -->
      
      <section class="flex items-center mt-4">
        <ProfilePicture class="mx-2 w-12 pointer-events-none" :uid="pfp || -2" :cutout="creatorData?.pfp_cutout || 0" />
        <div class="flex flex-col">
          <span class="text-xl font-bold">{{ creator }}</span>
          <span class="flex gap-2 items-center text-sm">
            <span class="cursor-help">{{ prettyDate(listUploadDate) }}</span>
            • 
            <span class="inline-flex"><img src="@/images/view.svg" alt="" class="mr-2 w-4">{{ views }}</span>
          </span>
        </div>
      </section>
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
        <!-- <div class="md:ml-9">
          <button :class="{'border-b-4 border-lof-400': openDialogs[0]}" class="flex relative items-center p-2 rounded-md button bg-greenGradient" @click="emit('doListAction', 'comments')">
            <img src="@/images/comment.svg" class="inline w-6 md:mr-2" /><label class="max-md:hidden">{{
              $t('level.comments') }}</label>
            <label
              v-show="commAmount > 0"
              class="p-1 my-auto ml-3 text-lg font-bold leading-3 text-black rounded-sm bg-lof-400 max-md:absolute max-md:bottom-1 max-md:right-1">{{
                commAmount }}</label>
          </button>
        </div> -->

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
        <!-- Jump to popup -->
        <!-- <button :style="{backgroundColor: descColor}" :title="$t('listViewer.contents')" @click="emit('doListAction', 'jumpPopup')"
          class="p-2.5 rounded-md button aspect-square">
          <img class="w-5" src="@/images/jumpto.svg" alt="" />
        </button> -->

        <!-- Pin list -->
        <!-- <button :style="{backgroundColor: descColor}" :title="$t('level.pin')"
          class="p-2.5 rounded-md button aspect-square"
          @click="emit('doListAction', 'pinList')"
          v-if="localStorg">
          <img class="w-5" src="@/images/pin.svg" alt="" v-if="!listPinned" />
          <img class="w-5" src="@/images/unpin.svg" alt="" v-else />
        </button> -->

        <!-- Edit list -->
        <!-- <button :style="{backgroundColor: descColor}" :title="$t('level.edit')"
          class="p-2.5 rounded-md button aspect-square"
          id="postEditButton"
          @click="emit('doListAction', 'editList')" v-if="userUID == uid">
          <img class="w-5" src="@/images/edit.svg" alt="" />
        </button> -->
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
