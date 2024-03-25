<script setup lang="ts">
import { ref, onMounted } from "vue";
import { levelList, testIfImageExists } from "../../Editor";
import type { LevelList, ReviewList } from "@/interfaces";

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

const props = defineProps<{
  source: LevelList
}>()

const loadedImage = ref<string>("loading");
onMounted(async () => {
  await testIfImageExists(props.source.titleImg[0]).then(
    (exists: any) => (loadedImage.value = exists)
  );
});

const dragBoxTopOffset = ref<number>(0);
const draggingDragBox = ref<boolean>(false);

const setDragboxPos = (e: MouseEvent) => {
  if (!draggingDragBox.value) return;

  let image = document.querySelector("#dragboxImage") as HTMLImageElement;
  let dragbox = document.querySelector("#dragbox") as HTMLElement;
  dragBoxTopOffset.value = e.screenY - dragbox.clientHeight / 2 - image.y;

  dragBoxTopOffset.value = Math.max(
    0,
    Math.min(
      dragBoxTopOffset.value,
      image.clientHeight - dragbox.clientHeight - 4
    )
  ); // 4 = dragbox border width

  props.source.titleImg[1] =
    (dragBoxTopOffset.value / (image.clientHeight - dragbox.clientHeight - 4)) *
    100; // percentage
};
</script>

<template>
    <div
      :style="{
        backgroundImage: loadedImage ? `url('${loadedImage}')` : '',
        backgroundPositionY: source.titleImg[1] + '%',
        backgroundPositionX: ['left', 'center', 'right'][
          source.titleImg[3]
        ],
      }"
      class="absolute z-[-1] h-full w-full bg-cover bg-no-repeat opacity-40 blur-md"
    ></div>

    <div
      v-if="source.titleImg[0] == ''"
      class="flex gap-4 items-center p-3 m-2 bg-blue-600 bg-opacity-30 rounded-md"
    >
      <img src="@/images/info.svg" alt="" class="w-8" />
      <span v-html="$t('other.imageHelp')"
        ></span
      >
    </div>
    <div
      v-else-if="loadedImage == 'loading'"
      class="flex flex-col justify-center items-center py-6 m-2 rounded-md"
    >
      <img
        src="@/images/loading.webp"
        class="w-10 opacity-50 animate-spin"
        alt=""
      />
      <span class="opacity-50">{{ $t('other.loadingImage') }}</span>
    </div>
    <div
      v-else-if="!loadedImage"
      class="flex gap-4 items-center p-3 m-2 bg-red-600 bg-opacity-30 rounded-md"
    >
      <img src="@/images/close.svg" alt="" class="w-8" />
      <span v-html="$t('other.imageLoadFailed')"
        ></span
      >
    </div>

    <main v-else class="flex gap-6 m-2 max-sm:flex-col max-sm:items-center">
      <section class="relative w-max h-max">
        <img
          :src="source.titleImg[0]"
          alt=""
          class="w-52 pointer-events-none"
          id="dragboxImage"
        />
        <div
          @mousedown="draggingDragBox = true"
          @mouseout="draggingDragBox = false"
          @mouseup="draggingDragBox = false"
          @mousemove="setDragboxPos"
          :style="{
            top: dragBoxTopOffset + 'px',
            height: source.titleImg[2] + '%',
          }"
          id="dragbox"
          class="absolute top-0 w-full border-4 border-green-400 transition-transform duration-75 hover:scale-x-[1.02] active:scale-x-105 active:cursor-move"
        ></div>
      </section>
      <section class="flex flex-col gap-3">
        <div>
          <h3>{{ $t('other.coverage') }}</h3>
          <input
            type="range"
            name=""
            id=""
            class="bg-transparent slider"
            v-model="source.titleImg[2]"
            @input="
              dragBoxTopOffset = 0;
              source.titleImg[1] = 0;
            "
            min="10"
            max="95"
          />
        </div>
        <div>
          <h2>{{ $t('other.alignment') }}</h2>
          <div class="flex gap-2">
            <button
              @click="source.titleImg[3] = 0"
              class="p-1 bg-black bg-opacity-40 rounded-md button"
            >
              <img
                class="w-6"
                :class="{ disabled: source.titleImg[3] != 0 }"
                src="@/images/alignLeft.svg"
                alt=""
              />
            </button>
            <button
              @click="source.titleImg[3] = 1"
              class="p-1 bg-black bg-opacity-40 rounded-md button"
            >
              <img
                class="w-6"
                :class="{ disabled: source.titleImg[3] != 1 }"
                src="@/images/alignCenter.svg"
                alt=""
              />
            </button>
            <button
              @click="source.titleImg[3] = 2"
              class="p-1 bg-black bg-opacity-40 rounded-md button"
            >
              <img
                class="w-6"
                :class="{ disabled: source.titleImg[3] != 2 }"
                src="@/images/alignRight.svg"
                alt=""
              />
            </button>
          </div>
        </div>
        <div>
          <input
            class="button"
            type="checkbox"
            name=""
            id=""
            v-model="source.titleImg[4]"
          /><span>{{ $t('other.gradient') }}</span>
        </div>
      </section>
    </main>
</template>
