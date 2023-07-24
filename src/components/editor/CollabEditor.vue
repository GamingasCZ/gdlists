<script setup lang="ts">
import { levelList, creatorToCollab } from '@/Editor';
import chroma from 'chroma-js';
import { ref, watch } from 'vue';

const props = defineProps({
    index: {type: Number, required: true}
})

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

const colorLeft = ref<string>(chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.906, 0.167).hex())
const colorRight = ref<string>(chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.231, 0.102).hex())

const modifyCreator = (e: Event) => {
  let newCreator = (e.target as HTMLInputElement).value
  if (typeof levelList.value.levels[props.index!].creator == 'string')
    levelList.value.levels[props.index!].creator = newCreator
  else
    levelList.value.levels[props.index!].creator[0][0] = newCreator
}

watch(props, () => {
    colorLeft.value = chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.906, 0.167).hex()
    colorRight.value = chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.231, 0.102).hex()
})

function addRole(preset: string = "") {
  let creator = levelList.value.levels[props.index].creator
  if (typeof creator == 'string') levelList.value.levels[props.index].creator = creatorToCollab(creator)

  levelList.value.levels[props.index].creator?.[1].push({name: preset, id: Date.now()})
}

</script>

<template>
  <dialog
    open
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
  >
    <section
      @click.stop=""
      :style="{background: `linear-gradient(9deg, ${colorRight}, ${colorLeft})`}"
      class="absolute top-1/2 left-1/2 w-[60rem] max-h-[95svh] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg py-2 text-white shadow-lg shadow-black"
    >
      <div class="relative mx-2">
        <h1 class="text-xl font-bold text-center">Editor collabu</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="absolute top-0 right-0 w-6 button"
          @click="emit('closePopup')"
        />
      </div>

      <header class="flex gap-2 items-center mx-2 mt-2">
        <img src="@/images/bytost.webp" class="w-10" alt="">
        <input value="Host" type="text" class="px-3 -mr-1 w-24 h-10 text-right bg-black bg-opacity-40 rounded-full" placeholder="Role hosta">: 
        <input type="text" @change="modifyCreator" :value="typeof levelList.levels[index!].creator == 'object' ? levelList.levels[index!].creator[0][0] : levelList.levels[index!].creator" class="px-3 h-10 bg-black bg-opacity-40 rounded-full max-sm:w-32" placeholder="Jméno hosta">
        <button class="box-border p-1 bg-black bg-opacity-40 rounded-full button">
            <img src="@/images/searchOpaque.svg" class="w-8" alt="">
        </button>
      </header>

      <main>
        <header class="flex justify-between items-center bg-[url(@/images/headerBG.webp)] bg-center p-2 mt-3">
            <h2 class="text-2xl font-black button max-sm:hidden">Role</h2>

            <div class="flex gap-2 max-sm:hidden">
                <button @click="addRole('Dekorace')" class="px-3 py-1 font-bold bg-black bg-opacity-40 rounded-full button">Dekorace</button>
                <button @click="addRole('Layout')" class="px-3 py-1 font-bold bg-black bg-opacity-40 rounded-full button">Layout</button>
                <button @click="addRole('Tester')" class="px-3 py-1 font-bold bg-black bg-opacity-40 rounded-full button">Tester</button>
            </div>
            <select class="px-2 py-1 text-xl bg-black bg-opacity-40 rounded-md sm:hidden">
                <option disabled selected value="">Šablony</option>
                <option @click="addRole('Dekorace')">Dekorace</option>
                <option @click="addRole('Layout')">Layout</option>
                <option @click="addRole('Tester')">Tester</option>
            </select>

            <div class="flex items-center">
                <button class="box-border p-1 mr-2 bg-black bg-opacity-40 rounded-full button">
                    <img src="@/images/paste.svg" class="w-8 h-8" alt="">
                </button>
                <button class="box-border p-1 bg-black bg-opacity-40 rounded-full button" @click="addRole()">
                    <img src="@/images/addLevel.svg" class="w-8 h-8" alt="">
                </button>
            </div>
        </header>

        <section class="bg-[url(@/images/fade.webp)] bg-repeat-x px-2 py-4 h-36 grid md:grid-cols-3 sm:grid-cols-2 gap-3">
            <h3 v-if="!levelList.levels[index].creator?.[1]" class="opacity-60">Kliknutím na <img src="@/images/addLevel.svg" alt="" class="box-border inline p-1 mx-2 w-8 bg-black bg-opacity-40 rounded-full"> přidáš roli.</h3>
            <div v-else v-for="(role, pos) in levelList.levels[index].creator?.[1]" class="flex px-1 py-1 text-white bg-red-600 rounded-md items-middle h-max">
              <input type="text" placeholder="Jméno role" class="px-1 mr-2 bg-transparent rounded-md border-opacity-40 border-solid outline-none focus:bg-opacity-40 border-b-black focus:bg-black grow">
              <div class="flex gap-2">
                <button class="box-border p-1 w-7 bg-black bg-opacity-40 rounded-full button"><img src="@/images/copy.svg" alt=""></button>
                <button class="box-border p-1 w-7 bg-black bg-opacity-40 rounded-full button" @click="levelList.levels[index].creator?.[1].splice(pos, 1)"><img src="@/images/trash.svg" alt=""></button>
              </div>
            </div>
        </section>

        <header class="flex justify-between items-center bg-[url(@/images/headerBG.webp)] bg-center p-2">
            <h2 class="text-2xl font-black button max-sm:hidden">Členové</h2>
            <div class="sm:hidden"></div>
            <div class="flex items-center">
                <button class="box-border p-1 mr-2 bg-black bg-opacity-40 rounded-full button">
                    <img src="@/images/paste.svg" class="w-8 h-8" alt="">
                </button>
                <button class="box-border p-1 bg-black bg-opacity-40 rounded-full button">
                    <img src="@/images/addLevel.svg" class="w-8 h-8" alt="">
                </button>
            </div>
        </header>

        <section class="bg-[url(@/images/fade.webp)] bg-repeat-x px-2 py-4 h-60">
            <h3 class="opacity-60">K přidání člena přidej roli!</h3>
        </section>

      </main>
    </section>
  </dialog>
</template>