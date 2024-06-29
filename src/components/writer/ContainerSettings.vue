<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { ContainerSettings } from './containers';
import { DEFAULT_RATINGS, reviewData } from '@/Reviews';

const emit = defineEmits<{
    (e: "remove"): void
    (e: "move", by: number): void
    (e: "pressedButton", key: string): void
    (e: "hidSettings"): void
}>()

const containers = inject<Containers>("settingsTitles")

const props = defineProps<{
    settingsArr: ContainerSettings[]
    type: string
    shown: boolean
}>()

watch(props, () => {
    if (props.shown) showSettings()
})

const containerSettings = ref<HTMLDivElement>()
const settingsShown = ref(false)

const showSettings = () => {
	settingsShown.value = true
	document.body.addEventListener("click", closeSettings, { capture: true })
}

const closeSettings = (m: MouseEvent) => {
  if (m.x == 0) return // Clicking on settingsMenu menu content fricks up mouse pos

  let elPos = containerSettings.value?.getBoundingClientRect()
  let top = elPos?.y!
  let left = elPos?.x!
  let width = elPos?.width!
  let height = elPos?.height!
  if (m.x < left || m.x > left + width || m.y < top || m.y > top + height) {
    settingsShown.value = false
    document.body.removeEventListener("click", closeSettings, { capture: true })
    emit('hidSettings')
    }
}

</script>

<template>
    <div ref="containerSettings" v-if="settingsShown" class="flex absolute -top-1 font-[poppins] -right-1 z-10 flex-col p-2 text-base text-left rounded-md rounded-tr-none bg-greenGradient">
        <div v-for="(_, key, index) in settingsArr" class="flex flex-col" :class="{'py-1': containers[type].settings[index].type[0] > -1}">
            <div class="flex flex-col">
                <!-- Text input -->
                <div v-if="containers[type].settings[index].type[0] == 0">
                    <label :for="key">{{ containers[type].settings[index].title }}</label><br>
                    <input :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value" class="px-2 py-0.5 bg-white bg-opacity-10 rounded-md" type="text">
                </div>
                
                <!-- Button -->
                <button v-if="containers[type].settings[index].type[0] == 1" @click="emit('pressedButton', key)" class="p-2 mx-auto w-max text-lg bg-black bg-opacity-40 rounded-md focus-within:outline-current button">{{ containers[type].settings[index].title }}</button>
                
                <!-- Checkbox -->
                <div v-if="containers[type].settings[index].type[0] == 2" class="flex justify-between">
                    <label :for="key">{{ containers[type].settings[index].title }}</label>
                    <input :name="key" :checked="settingsArr[key]" @change="settingsArr[key] = !settingsArr[key]" class="px-2 py-0.5 bg-white bg-opacity-10 rounded-md button" type="checkbox">
                </div>

                <!-- Number selector -->
                <div v-if="containers[type].settings[index].type[0] == 3" class="flex justify-between">
                    <label :for="key">{{ containers[type].settings[index].title }}</label>
                    <input :name="key" :min="containers[type].settings[index].type[1]" :max="containers[type].settings[index].type[2]" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value" class="px-2 py-0.5 mr-2 w-16 bg-white bg-opacity-10 rounded-md" type="number">
                </div>

                <!-- Level dropdown -->
                <div v-if="containers[type].settings[index].type[0] == 4" class="flex justify-between items-center">
                    <label :for="key">{{ containers[type].settings[index].title }}</label>
                    <select class="px-2 py-1 bg-white bg-opacity-20 rounded-md border-2 border-white border-opacity-40" :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value">
                        <option :value="-1">{{ $t('other.all') }}</option>
                        <option v-for="(level, index) in reviewData.levels" :value="index">{{ level.levelName || $t('other.unnamesd') }}</option>
                    </select>
                </div>

                <!-- Rating dropdown -->
                <div v-if="containers[type].settings[index].type[0] == 5" class="flex justify-between items-center">
                    <label :for="key">{{ containers[type].settings[index].title }}</label>
                    <select class="px-2 py-1 bg-white bg-opacity-20 rounded-md border-2 border-white border-opacity-40" :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value">
                        <option :value="-1">{{ $t('other.all') }}</option>
                        <option v-for="(rating, index) in DEFAULT_RATINGS.concat(reviewData.ratings)" :value="index">{{ rating.name || $t('other.unnamed2') }}</option>
                    </select>
                </div>
            </div>

        </div>
        <div class="flex gap-1 justify-between mt-3">
            <button @click="emit('move', -1)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveUp.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="emit('move', 1)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveDown.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="emit('remove')" class="flex gap-1 items-center p-1 ml-6 text-xl font-bold text-black bg-red-400 rounded-md">
                <img src="@/images/del.svg" alt="" class="w-6">
                <span>{{ $t('editor.remove') }}</span>
            </button>
        </div>
    </div>
</template>