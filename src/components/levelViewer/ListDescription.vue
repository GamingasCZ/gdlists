<script setup lang="ts">
import type { LevelList, LikeFetchResponse } from "@/interfaces";
import axios, { type AxiosResponse } from "axios";
import { onMounted, ref, watch } from "vue";
import parseText from "../global/parseEditorFormatting";

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
  creatorData: {username: string, discord_id: string, avatar_hash: string} | false;
}>();

const emit = defineEmits<{
  (e: "doListAction", action: "sharePopup" | "jumpPopup" | "pinList" | "editList" | "comments" | "mobileExtras"): void;
}>();

const rating = ref<[number, number, -2 | -1 | 0 | 1]>();
const rate = ref<number>();
onMounted(() => {
  axios
    .get(import.meta.env.VITE_API + `/rateAction.php/?id=${props.id}`)
    .then((res: AxiosResponse) => {
      rating.value = res.data;
      rate.value = res.data[0] - res.data[1];
    });

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

const userUID = ref<string>("")
if (localStorage) {
  userUID.value = JSON.parse(localStorage.getItem("account_info")!)?.[1] ?? ""
}

const pfp = ref("")
if (!props.creatorData) {
  import(`../../images/oldPFP.png`).then(res => {pfp.value = res.default})
}
else pfp.value = `https://cdn.discordapp.com/avatars/${props.creatorData.discord_id}/${props.creatorData.avatar_hash}.png`

let sendingRating = false
function sendRating(action: 1 | 0) {
  if (sendingRating) return
  
  sendingRating = true
  axios.post(import.meta.env.VITE_API+"/rateAction.php", {id: props.id, action: action}).then(res => {
    const likeData: LikeFetchResponse = res.data
    rate.value = likeData.ratings[0] - likeData.ratings[1]
    rating.value[2] = likeData.ratings[2]!
    sendingRating = false
  })
}

</script>

<template>
  <section
    class="mx-auto flex w-[80rem] max-w-[95vw] flex-col backdrop-blur-sm"
  >
    <section class="flex gap-2">
      <!-- Likes and dislikes -->
      <div class="box-border flex flex-col items-center max-sm:hidden">
        <button class="button rounded-lg bg-[#21cc5b] p-1 !transition-colors" :style="{boxShadow: rating?.[2] == 1 ? 'rgba(32, 198, 143, 0.5) 0px 0px 29px' : ''}" :class="{'!bg-[#051c0c]': rating?.[2] == 0, '!bg-[#14805c]': rating?.[2] == 1}" @click="sendRating(1)">
          <img class="w-5" src="@/images/like.svg" alt="" :class="{'brightness-[6]': rating?.[2] == 1}" />
        </button>
        <span class="my-0.5 text-lg font-bold"
          >{{ rate }}
          <hr
            v-if="rate == undefined"
            class="w-4 h-3 bg-white bg-opacity-50 rounded-full border-none"
        /></span>
        <button class="button rounded-lg bg-[#cc2121] p-1 !transition-colors" @click="sendRating(0)" :style="{'background': rating?.[2] == 0 ? 'radial-gradient(rgb(72, 0, 24), rgb(179, 7, 7))' : '', boxShadow: rating?.[2] == 0 ? 'rgba(255, 12, 0, 0.79) 0px 0px 29px' : ''}" :class="{'!bg-[#1c0505]': rating?.[2] == 1, '!bg-[#730909]': rating?.[2] == 0}">
          <img class="w-5" src="@/images/dislike.svg" alt="" :class="{'brightness-[6]': rating?.[2] == 0}"/>
        </button>
      </div>

      <!-- Description -->
      <main class="relative grow">
        <header class="relative bg-gray-900 bg-opacity-80 rounded-t-md">
          <img
            :src="pfp"
            class="absolute bottom-1 mx-2 w-12 rounded-full border-2 border-white border-solid"
            alt=""
          />
          <h1 class="absolute bottom-6 ml-16 text-xl">{{ name }}</h1>
          <div class="flex gap-2 items-center py-0.5 ml-16 text-base">
            <span class="font-bold">{{ creator }}</span>
            <hr
              class="w-1 h-4 bg-white bg-opacity-60 rounded-full border-none"
            />
            <img src="@/images/view.svg" alt="" class="w-4 sm:hidden">
            <span>
              <span>{{ views }} </span><span class="max-sm:hidden">{{ $t('level.views') }}</span>
            </span>
            <hr
              class="w-1 h-4 bg-white bg-opacity-60 rounded-full border-none"
            />
            <span>{{
              new Date(parseInt(timestamp!) * 1000).toLocaleDateString()
            }}</span>
          </div>
        </header>
        <pre
          id="listDescription"
          class="descriptionFade h-24 overflow-y-hidden whitespace-pre-wrap rounded-b-md bg-gray-800 bg-opacity-80 px-2 font-[poppins] leading-5 text-white transition-[height] duration-75 ease-in-out before:transition-opacity"
          :class="{
            'text-opacity-40': ['', undefined].includes(data?.description),
            'before:opacity-0': !tallDescription || toggleDescription,
          }"
          v-html="parseText(data?.description || $t('level.noDescription'))"
        ></pre>
        <button
          v-if="tallDescription"
          class="absolute bottom-0 left-1/2 w-10 rounded-t-lg"
          :style="{ backgroundColor: getCol() }"
          @click="toggleDescription = !toggleDescription"
        >
          <img
            src="@/images/descMore.svg"
            :class="{ '-scale-y-100': toggleDescription }"
            class="p-1 mx-auto w-6"
            alt=""
          />
        </button>
      </main>
    </section>

    <section class="flex justify-between items-start mt-2">
      <div class="flex">
        <!-- Mobile likes and dislikes -->
        <div class="box-border flex gap-1.5 items-center sm:hidden">
          <button class="button rounded-lg bg-[#21cc5b] p-2 !transition-colors" @click="sendRating(1)" :style="{boxShadow: rating?.[2] == 1 ? 'rgba(32, 198, 143, 0.5) 0px 0px 29px' : ''}" :class="{'!bg-[#051c0c]': rating?.[2] == 0, '!bg-[#14805c]': rating?.[2] == 1}">
            <img class="w-6" src="@/images/like.svg" alt="" :class="{'brightness-[6]': rating?.[2] == 1}" />
          </button>
          <span class="text-center min-w-[2rem] text-lg font-bold"
            >{{ rate }}
            <hr
              v-if="rate == undefined"
              class="w-4 h-1 bg-white bg-opacity-50 rounded-full border-none"
          /></span>
          <button class="button rounded-lg bg-[#cc2121] p-2 !transition-colors" @click="sendRating(0)" :style="{'background': rating?.[2] == 0 ? 'radial-gradient(rgb(72, 0, 24), rgb(179, 7, 7))' : '', boxShadow: rating?.[2] == 0 ? 'rgba(255, 12, 0, 0.79) 0px 0px 29px' : ''}" :class="{'!bg-[#1c0505]': rating?.[2] == 1, '!bg-[#730909]': rating?.[2] == 0}">
            <img class="w-6" src="@/images/dislike.svg" alt="" :class="{'brightness-[6]': rating?.[2] == 0}"/>
          </button>
        </div>
  
        <hr class="mx-2 my-auto w-1 h-6 bg-white bg-opacity-40 rounded-full border-none sm:hidden">
  
        <!-- Comments button -->
        <div class="sm:ml-9">
          <button class="relative p-2 rounded-md button bg-greenGradient" @click="emit('doListAction', 'comments')">
            <img src="@/images/comment.svg" class="inline w-6 sm:mr-2" /><label
              class="max-sm:hidden"
              >{{ $t('level.comments') }}</label
            >
            <label
              class="px-0.5 py-0.5 ml-1.5 text-xs leading-3 bg-red-500 rounded-sm max-sm:absolute max-sm:bottom-1 max-sm:right-1"
              >{{ commAmount }}</label
            >
          </button>
        </div>
      </div>

      <div class="flex gap-2 max-sm:hidden">
        <!-- Share popup -->
        <button
          @click="emit('doListAction', 'sharePopup')"
          class="button w-24 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-sm:!p-2"
        >
          <img
            class="inline w-4 max-sm:w-6 sm:mr-2"
            src="@/images/share.svg"
            alt=""
          /><label class="max-sm:hidden">{{ $t('other.share') }}</label>
        </button>

        <!-- Jump to popup -->
        <button
          @click="emit('doListAction', 'jumpPopup')"
          class="button w-24 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-sm:!p-2"
        >
          <img
            class="inline w-4 max-sm:w-6 sm:mr-2"
            src="@/images/jumpto.svg"
            alt=""
          /><label class="max-sm:hidden">{{ $t('listViewer.jumpTo') }}</label>
        </button>

        <!-- Pin list -->
        <button
          class="button w-24 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-sm:!p-2"
          @click="emit('doListAction', 'pinList')"
        >
          <img
            class="inline w-4 max-sm:w-6 sm:mr-2"
            src="@/images/pin.svg"
            alt=""
            v-if="!listPinned"
          />
          <img
            class="inline w-4 max-sm:w-6 sm:mr-2"
            src="@/images/unpin.svg"
            alt=""
            v-else
          />
          <label class="max-sm:hidden">{{ listPinned ? $t('level.unpin') : $t('level.pin') }}</label>
        </button>

        <!-- Edit list -->
        <button
          class="button w-24 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-sm:!p-2"
          @click="emit('doListAction', 'editList')"
          v-if="userUID == uid"
        >
          <img
            class="inline w-4 max-sm:w-6 sm:mr-2"
            src="@/images/edit.svg"
            alt=""
          /><label class="max-sm:hidden">{{ $t('level.edit') }}</label>
        </button>
      </div>

      <!-- Mobile show actions button -->
      <div class="sm:hidden">
        <button
          @click="emit('doListAction', 'mobileExtras')"
          class="button rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)] p-1 py-0.5 align-middle text-left max-sm:!p-2"
        >
          <img
            class="inline w-4 max-sm:w-6 sm:mr-2"
            src="@/images/more.svg"
            alt=""
          /><label class="max-sm:hidden">{{ $t('other.share') }}</label>
        </button>
      </div>

      <!-- Please login uwu -->
    </section>
  </section>
</template>
