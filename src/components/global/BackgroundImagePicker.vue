<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { testIfImageExists } from "../../Editor";
import type { ListBackground } from "@/interfaces";

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

const props = defineProps<{
  source: ListBackground;
  forceAspectHeight?: number
  disableControls?: boolean
}>()

const imageSource = ref(props.source[0])
const loadedImage = ref<string | false>("loading");
const dragboxImage = ref<HTMLImageElement>()
let pre = import.meta.env.VITE_USERCONTENT
let imageHeight = 384
const dragboxHeight = ref(0)
onMounted(async () => {
  if (!imageSource.value.includes(import.meta.env.VITE_USERCONTENT)) {
    let uid = JSON.parse(localStorage.getItem("account_info")!)[1]
    imageSource.value = `${pre}/userContent/${uid}/${imageSource.value}.webp`
  }

  testIfImageExists(imageSource.value).then((exists: [string, HTMLImageElement]) => {
    loadedImage.value = exists[0]

    if (props.forceAspectHeight > 0) {
      props.source[2] = Math.min(100, Math.floor(props.forceAspectHeight / imageHeight * 100))
    }

  }
  ).catch(error => console.log(error));

});

const draggingDragBox = ref(false);
const overResizer = ref(false)

const getDragboxHeight = () => {
  let dragbox = document.querySelector("#dragbox") as HTMLDivElement
  dragboxHeight.value = dragbox?.offsetHeight
}

let prevDrag = -1
const setDragboxPos = (e: MouseEvent | TouchEvent) => {
  if (!draggingDragBox.value) return;

  let resizerRect = document.querySelector("#resizer")?.getBoundingClientRect();

  let yPos = e.y ?? e.touches[0].clientY

  if (prevDrag == -1) prevDrag = yPos
  let nowDrag = yPos - prevDrag
  prevDrag = yPos
  if (overResizer.value) {
    if (resizerRect.bottom - resizerRect.height / 2 <= dragboxImage.value.getBoundingClientRect().bottom || nowDrag < 0)
      props.source[2] = (Math.min(100, Math.max(10, props.source[2] + nowDrag / imageHeight * 100)))
    if (resizerRect.bottom - resizerRect.height / 2 > dragboxImage.value.getBoundingClientRect().bottom)
      props.source[1] = 0
  }

  // this took way too fucking long aaaaaaa
  props.source[1] = Math.min(Math.max(0, (
    props.source[1] // dragbox's top offset from the top of the image 
    + (nowDrag / imageHeight * 100) // drag delta in px, converted to percentages
    * (1 + props.source[1]/100))) // dragbox is translated while dragging; necessarry to keep speed
  , 100)
};

const endDrag = () => {
  prevDrag = -1
  overResizer.value = false
  draggingDragBox.value = false
}

document.body.addEventListener("touchend", endDrag)
document.body.addEventListener("touchmove", setDragboxPos)
document.body.addEventListener("mouseup", endDrag)
document.body.addEventListener("mousemove", setDragboxPos)

onUnmounted(() => {
  document.body.removeEventListener("touchend", endDrag)
  document.body.removeEventListener("touchmove", setDragboxPos)
  document.body.removeEventListener("mouseup", endDrag)
  document.body.removeEventListener("mousemove", setDragboxPos)
})

</script>

<template>
  <div :style="{
    backgroundImage: loadedImage ? `url('${loadedImage}')` : '',
    backgroundPositionY: source[1] + '%',
    backgroundPositionX: ['left', 'center', 'right'][
      source[3]
    ],
  }" class="absolute z-10 w-full h-full bg-no-repeat bg-cover opacity-40 blur-md"></div>
  <div v-if="imageSource == ''" class="flex gap-4 items-center p-3 m-2 bg-blue-600 bg-opacity-30 rounded-md">
    <img src="@/images/info.svg" alt="" class="w-8" />
    <span v-html="$t('other.imageHelp')"></span>
  </div>
  <div v-else-if="loadedImage == 'loading'" class="flex flex-col justify-center items-center py-6 m-2 rounded-md">
    <img src="@/images/loading.webp" class="w-10 opacity-50 animate-spin" alt="" />
    <span class="opacity-50">{{ $t('other.loadingImage') }}</span>
  </div>
  <div v-else-if="!loadedImage" class="flex gap-4 items-center p-3 m-2 bg-red-600 bg-opacity-30 rounded-md">
    <img src="@/images/close.svg" alt="" class="w-8" />
    <span v-html="$t('other.imageLoadFailed')"></span>
  </div>
  <main v-else class="z-20 flex-col gap-6 p-2 bg-[url(@/images/fade.webp)] bg-repeat-x bg-black bg-opacity-40">
    <section class="relative mx-auto w-max max-w-full h-max">
      <img :src="imageSource" alt=""
        :class="{ 'object-left': source[3] == 0, 'object-center': source[3] == 1, 'object-right': source[3] == 2 }"
        class="object-cover max-w-full h-96 bg-black bg-opacity-40 rounded-md pointer-events-none select-none shadow-drop"
        ref="dragboxImage" />
      <div
        @vue:mounted="getDragboxHeight()"
        @mousedown="draggingDragBox = true"
        @touchstart="draggingDragBox = true"
        :style="{
          top: `calc(${Math.min(100, source[1])}% )`,
          transform: `translateY(-${source[1]}%)`,
          height: source[2] + '%'
        }"
        id="dragbox"
        class="absolute top-0 w-full shadow-drop border-4 border-lof-400 hover:scale-x-[1.02] active:scale-x-105 active:cursor-move">
        <button id="resizer" v-if="!forceAspectHeight" @mouseover="overResizer = true"
          @mouseout="overResizer = draggingDragBox" @touchstart="overResizer = true"
          class="absolute -bottom-2 left-1/2 w-6 h-6 bg-white rounded-full border-4 -translate-x-1/2 translate-y-1.5 cursor-ns-resize border-lof-400"></button>
      </div>
    </section>
    <section v-if="!disableControls" class="grid grid-cols-2 gap-2 mt-2 select-none max-sm:grid-rows-2 max-sm:grid-cols-1">
      <div class="grid gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md grid-cols-optionIconDesc">
        <img src="@/images/align.svg" class="w-8" alt="">
        <div class="pt-2">
          <h3 class="text-xl leading-[0.5]">{{ $t('other.alignment') }}</h3>
          <span class="text-xs leading-tight text-white text-opacity-40">{{ $t('other.positioningHelp') }}</span>
        </div>
        <select v-model="source[3]" name="" id="">
          <option :value="0">{{ $t('other.left') }}</option>
          <option :value="1">{{ $t('other.center') }}</option>
          <option :value="2">{{ $t('other.right') }}</option>
        </select>
      </div>
      <div class="grid gap-2 items-center px-2 py-1 pr-0 bg-black bg-opacity-40 rounded-md grid-cols-optionIconDesc">
        <img src="@/images/grad.svg" class="w-8" alt="">
        <div class="pt-2">
          <h3 class="text-xl leading-[0.5]">{{ $t('other.gradient') }}</h3>
          <span class="text-xs leading-tight text-white text-opacity-40">{{ $t('other.dissolveHelp') }}</span>
        </div>
        <input class="button" type="checkbox" name="" id="" v-model="source[4]" />
      </div>
    </section>
  </main>
</template>
