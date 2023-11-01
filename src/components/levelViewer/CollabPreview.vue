<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { CollabData } from "../../interfaces";
import PlayerIcon from "../global/PlayerIcon.vue";
import { socialMedia, socialMediaImages } from "../editor/socialSites";

const props = defineProps<{
  collab: CollabData;
}>();

const showGDIcons = ref<boolean>(false);
const preview = ref<HTMLDivElement>()
const scrollable = ref(false)
const showAll = ref(false)
onMounted(() => {
  scrollable.value = preview.value?.scrollHeight! > 112 // 28rem
})
window.addEventListener("resize", () => scrollable.value = preview.value?.scrollHeight! > 112)

const isOldCollab = typeof props.collab[3] == "undefined"
const collabHost = computed(() => {
  if (isOldCollab) return props.collab[0][0]
  else return props.collab[0][0].name
})
const collabRole = computed(() => {
  if (isOldCollab) return props.collab[0][2]  ?? "Host"
  else return props.collab[1][props.collab[0][0].role]
})
const collabIcon = () => {
  if (isOldCollab) return props.collab[0][1]
  else return props.collab[0][0].verified
}

const hostHasSocials = ref((props.collab?.[0]?.[0]?.socials ?? []).length)
const hostSocialsShown = ref(false)
const socialsDialog = ref<HTMLDivElement>()

const showHostSocials = (e: MouseEvent) => {
  if (!hostHasSocials.value) return
  hostSocialsShown.value = !hostSocialsShown.value
  document.body.addEventListener("click", closeHostSocials, {capture: true})
  window.addEventListener("scroll", closeHostSocials, {"once": true})
};
const closeHostSocials = (m: Event) => {
  if (socialsDialog.value == undefined) return
  hostSocialsShown.value = false
  socialsDialog.value.removeEventListener("click", closeHostSocials, {capture: true})
}

</script>

<template>
  <section>
    <h2 class="mb-3 text-xl font-black text-center align-middle">
      <span>{{ collabRole }}:</span>
      <PlayerIcon v-if="collabIcon()" :icon="collabIcon()[0]" :col1="collabIcon()[1].toString()" :col2="collabIcon()[2].toString()" :glow="collabIcon()[3]" class="inline mx-3 w-10 h-10" :quality="1"/>
      <span class="inline-flex relative justify-center">
        <span @click="showHostSocials" class="opener" :class="{'py-1 px-2 bg-black rounded-md cursor-pointer hover:bg-opacity-70 transition-colors bg-opacity-40': hostHasSocials}">{{ collabHost }}</span>
        <Transition name="fade">
          <section v-if="hostSocialsShown" ref="socialsDialog" class="grid absolute top-14 z-30 grid-cols-1 gap-1 p-1 w-max bg-black bg-opacity-90 rounded-md backdrop-blur-md">
            <img src="@/images/popupArr.svg" class="absolute -top-5 left-1/2 w-5 -translate-x-1/2" alt="">
            <h2 class="font-extrabold text-center">Odkazy</h2>
            <button v-for="social in collab[0][0].socials" class="flex gap-1 px-2 text-sm font-normal rounded-sm button" :style="{backgroundColor: socialMedia[social[0]].color}">
              <img :src="socialMediaImages[socialMedia[social[0]].icon]" class="w-4" alt="">
              <label >{{ social[1] }}</label>
            </button>
          </section>
        </Transition>
      </span>
    </h2>
    <div
      class="flex relative flex-wrap gap-3 gap-y-5 justify-center p-2 max-h-28 overflow-clip bg-black bg-opacity-40 rounded-lg transition-colors cursor-pointer hover:bg-opacity-60"
      @mouseover="showGDIcons = true"
      :class="{'!max-h-max': showAll, 'pb-8': showAll}"
      ref="preview"
    >
      <div v-for="person in collab[2]">
        <PlayerIcon
          :icon="person.verified[0]" :col1="person.verified[1]" :col2="person.verified[2]" :glow="person.verified[3]" :quality="1"
          class="inline-block mr-2 w-8 h-8 align-middle"
          v-if="person.verified != 0"
        />
        <span
          class="transition-colors duration-200"
          :style="{ color: showGDIcons ? person.color : 'white' }"
          >{{ person.name }}</span
        >
      </div>

      <!-- Show more -->
      <button class="absolute bottom-0 p-1 rounded-t-md bg-lof-200" v-if="scrollable" @click.stop="showAll = !showAll">
        <img src="@/images/descMore.svg" class="w-6" alt="" :class="{'rotate-180': showAll}">
      </button>
    </div>
  </section>
</template>
