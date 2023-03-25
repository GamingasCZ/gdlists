<script setup lang="ts">
import chroma from 'chroma-js'
const props = defineProps({
  rating: Number,
  views: Number,
  uploadDate: Number,
  name: String,
  creator: String
})

let randColor = chroma(
  Math.floor(
    16777215 *
      Math.sin(
        props.name
          ?.split('')
          .map((p: string) => p.charCodeAt(0))
          .reduce((x, y) => x + y)! % Math.PI
      )
  )
)
const getGradient = () =>
  `linear-gradient(90deg, ${randColor.darken(2)}, ${randColor.darken()}, ${randColor.brighten()})`
</script>

<template>
  <div
    class="flex w-5/6 max-w-6xl cursor-pointer items-center gap-3 rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white hover:bg-right"
    :style="{ background: getGradient(), borderColor: randColor.darken(2).hex() }"
  >
    <section v-if="rating" class="flex flex-col items-center text-xs">
      <img src="../../images/genericRate.svg" alt="" class="w-3.5" />{{ rating }}
    </section>

    <section class="flex flex-col items-center gap-1">
      <div v-if="views" class="flex gap-1 text-xs">
        <img src="../../images/view.svg" alt="" class="w-4" />{{ views }}
      </div>
      <div v-if="uploadDate" class="flex gap-1 text-xs">
        <img src="../../images/time.svg" alt="" class="w-4" />{{ uploadDate }}
      </div>
    </section>

    <section class="flex flex-col justify-center">
      <h1 class="text-lg font-bold">{{ name }}</h1>
      <p class="text-xs">- {{ creator }} -</p>
    </section>
  </div>
</template>
3
