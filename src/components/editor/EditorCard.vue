<script setup lang="ts">
import { levelList } from '@/Editor'
import chroma, { type Color } from 'chroma-js'
import { ref } from 'vue';
import type { Level } from '../../interfaces'
import ColorPicker from "../global/ColorPicker.vue";

const props = defineProps<{
  index?: number
  opened?: boolean
  data?: Level
}>()

const emit = defineEmits<{
    (e: "updateOpenedCard", newPos: number): void
}>()

// Colors
const darkCol = () => chroma(levelList.value.levels[props.index!].color).darken().css()
const changeHue = (newHue: number) => levelList.value.levels[0].color = chroma.hsl(newHue, 0.5, chroma(props.data?.color!).hsl()[2]).hex()
const changeVal = (newValue: number) => levelList.value.levels[0].color = chroma.hsl(chroma(props.data?.color!).hsl()[0], 0.5, newValue*0.015625).hex()


const changeProp = (e: Event) => {
  let target: HTMLInputElement = e.currentTarget as HTMLInputElement
  levelList.value.levels[props.index as number][target.name] = target.value
}

const deleteLevel = () => {
    levelList.value.levels.splice(props.index!, 1)
}

const moveLevel = (from: number, to: number) => {
    if (to < 0 || to >= levelList.value.levels.length ) return

    let currentCard = levelList.value.levels[from]
    levelList.value.levels.splice(from, 1)
    levelList.value.levels.splice(to, 0, currentCard)
    emit("updateOpenedCard", to)
}

const openedPanel = ref<number>(0)
</script>

<template>
  <section>

    <!-- Closed card content -->
    <header
      :style="{ backgroundColor: data?.color }"
      class="rounded-md py-1 px-2 text-lg"
      v-show="!opened"
      @click="emit('updateOpenedCard', index!)"
      draggable="true"
    >
      #{{ index! + 1 }} - {{ data?.levelName || 'Bezejmenný' }}
    </header>

    <!-- Card content -->
    <main
      v-show="opened"
      :style="{ backgroundColor: data?.color, borderColor: darkCol()}"
      class="flex flex-col gap-1.5 rounded-md border-[0.35rem] border-solid p-2"
    >
      <div class="flex justify-between">
        <div class="box-border flex gap-2">

          <!-- Level position -->
          <img class="w-10 aspect-square" src="../../images/star.webp" alt="" />
          <input
            class="max-w-[20vw] rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
            type="text"
            name="levelID"
            @input="changeProp"
            :value="data?.levelID"
            placeholder="ID levelu"
          />
          <img
            class="button transition-opacity duration-100 w-10 aspect-square rounded-full bg-black bg-opacity-30 p-1"
            src="../../images/searchOpaque.svg"
            alt=""
            :style="{opacity: levelList.levels[index!].levelID ? 1 : 0.5}"
          />
        </div>
        <div class="flex">
          <img class="button w-10 aspect-square" src="../../images/showCommsU.svg" alt="" @click="moveLevel(index!, index!-1)"/>
          <input
            class="w-12 max-w-[20vw] rounded-full bg-black bg-opacity-30 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
            type="text"
            inputmode="numeric"
            @input="changeProp"
            :value="index!+1"
          />
          <img class="button w-10 aspect-square" src="../../images/showCommsD.svg" alt="" @click="moveLevel(index!, index!+1)"/>
        </div>
      </div>
      <hr class="h-1 border-none" :style="{backgroundColor: darkCol()}" />
      <div class="flex gap-2 items-center">

        <!-- Level name input -->
        <img class="w-10 aspect-square" src="../../images/island.webp" alt="" />
        <input
          class="max-w-[20vw] h-10 rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
          type="text"
          name="levelName"
          :value="data?.levelName"
          @input="changeProp"
          placeholder="Jméno levelu"
        />

        <!-- Level search -->
        <hr class="h-1 transition-opacity duration-100 bg-white w-8" :style="{opacity: levelList.levels[index!].levelName ? 1 : 0.5}" />
        <img
            class="button transition-opacity duration-100 w-10 aspect-square rounded-full bg-black bg-opacity-30 p-1"
            src="../../images/searchOpaque.svg"
            alt=""
            :style="{opacity: (levelList.levels[index!].levelName || levelList.levels[index!].creator) ? 1 : 0.5}"
          />
        <hr class="h-1 transition-opacity duration-100 bg-white w-8" :style="{opacity: levelList.levels[index!].creator ? 1 : 0.5}" />
        
        <!-- Creator input -->
        <input
          class="max-w-[20vw] h-10 rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
          type="text"
          name="creator"
          :value="data?.creator"
          @input="changeProp"
          placeholder="Tvůrce"
        />
        <img class="button w-10 aspect-square rounded-full bg-black bg-opacity-30 p-1" src="../../images/bytost.webp" alt="" />
      </div>
      <div class="flex justify-between items-center">

        <!-- Video input -->
        <div class="flex gap-2">
          <img class="w-10 aspect-square" src="../../images/youtube.webp" alt="" />
          <input
            class="max-w-[20vw] rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
            type="text"
            name="video"
            @input="changeProp"
            :value="data?.video"
            placeholder="Video"
          />
        </div>

        <!-- Extras buttons -->
        <div class="flex items-start gap-2">
          <img class="button w-10" @click="deleteLevel" src="../../images/delete.webp" alt="" />
          <img class="button w-10" @click="openedPanel = openedPanel == 0 ? 1 : 0" src="../../images/colorSelect.webp" alt="" />
          <img class="button w-10" @click="openedPanel = openedPanel == 0 ? 2 : 0" src="../../images/faces/diffContainer.webp" alt="" />
          <img class="button w-10" @click="openedPanel = openedPanel == 0 ? 3 : 0" src="../../images/tags.webp" alt="" />
        </div>
      </div>

      <!-- Extras panel -->
      <div class="bg-black bg-opacity-30 rounded-md p-2" v-show="openedPanel">
        <ColorPicker v-if="openedPanel == 1" @hue-change="changeHue" @val-change="changeVal"/>
      </div>
    </main>
  </section>
</template>
