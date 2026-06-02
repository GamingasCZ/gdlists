<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, type Ref, ref, watch } from 'vue';
import { ControlType, type Containers, type ContainerSettings } from './containers';
import type { PostData } from '@/interfaces';
import { containerSettingsOpen, DEFAULT_RATINGS } from '@/Reviews';

const emit = defineEmits<{
    (e: "remove"): void
    (e: "move", by: number): void
    (e: "pressedButton", key: string): void
    (e: "hidSettings"): void
    (e: "resetPos"): void
}>()

const props = defineProps<{
    settingsArr: ContainerSettings[]
    type: string
    shown: false | 1 | 2 // 1 - button open, 2 - right-click open
    mousePos: [number, number]
    index: number
    nest?: [number, number]
}>()

const postData = inject<Ref<PostData>>("postData")!
const containers = inject<Containers>("settingsTitles")!
const shortcut = inject<Ref<number[]>>("containerSettingsShown", ref([0,-1]))
watch(shortcut, () => {
    // 3 = opened by shortcut
    if (shortcut.value[0] == 3 && shortcut.value[1] == props.index) {
        // nested container settings
        if (shortcut.value[2] != -1 && shortcut.value[2] == props.nest?.[0] && shortcut.value[3] == props.nest[1] ) {
            showSettings()
        }
        // non-nested
        else if (shortcut.value[2] == -1 && props.nest === undefined)
            showSettings()
    }
})

const containerSettings = ref<HTMLFormElement>()
const settingsShown = ref(false)

const showSettings = () => {
    nextTick(() => {
        containerSettingsOpen.value = true
        settingsShown.value = true
        document.body.addEventListener("mousedown", closeSettings, { capture: true })
        document.body.addEventListener("contextmenu", closeSettings, { capture: true })
        nextTick(() => {
            if (props.mousePos[0]) {
                window.addEventListener("resize", positionFloating)
                positionFloating()
            }
            nextTick(() => containerSettings.value?.[4]?.focus())
        })
    })
}

defineExpose({
    showSettings
})

const forceHide = () => {
    settingsShown.value = false
    document.body.removeEventListener("mousedown", closeSettings, { capture: true })
    document.body.removeEventListener("contextmenu", closeSettings, { capture: true })
    emit('hidSettings')
    setTimeout(() => containerSettingsOpen.value = false, 20) // not good
}

const closeSettings = (m: MouseEvent) => {
  if (m.x == 0) return // Clicking on settingsMenu menu content fricks up mouse pos

  let elPos = containerSettings.value?.getBoundingClientRect()
  let top = elPos?.y!
  let left = elPos?.x!
  let width = elPos?.width!
  let height = elPos?.height!
  if (m.x < left || m.x > left + width || m.y < top || m.y > top + height) {
    forceHide()
}
}

const float = ref([0, 0])
const positionFloating = () => {
    if (!containerSettings.value)
        return window.removeEventListener("resize", positionFloating)

    let bodyWidth = document.body.clientWidth
    let elPos = containerSettings.value?.getBoundingClientRect()!
    float.value = [Math.max(0, Math.min(props.mousePos[0], bodyWidth)-elPos.width/2), props.mousePos[1]]
}

onBeforeUnmount(() => {
    window.removeEventListener("resize", positionFloating)
    emit('hidSettings')
    emit('resetPos')
})

const isControl = (ind: number, which: ControlType) => containers[props.type].settings[ind].type[0] == which

</script>

<template>
    <Teleport :disabled="shown != 2" to="body">
        <form ref="containerSettings" @keydown.prevent.esc="forceHide()" @submit.prevent="forceHide()" v-if="settingsShown" :style="{left: shown == 2 ? `${float[0]}px` : '', top: shown == 2 ? `${float[1]}px` : '-4px'}" class="flex w-max absolute text-white font-[poppins] -right-1 z-20 rounded-md rounded-tr-none bg-greenGradient">
            <button type="submit" class="hidden"></button>

            <div class="flex flex-col gap-1 p-1 mr-1 bg-black bg-opacity-40 rounded-l-md">
                <button type="button" @click="emit('move', -1)" class="p-1 button aspect-square">
                    <img src="@/images/moveUp.svg" class="w-6" alt="">
                </button>
                <button type="button" @click="emit('move', 1)" class="p-1 button aspect-square">
                    <img src="@/images/moveDown.svg" class="w-6" alt="">
                </button>
                <button type="button" @click="emit('remove')" class="flex gap-1 items-center p-1 mt-auto bg-red-400 rounded-md">
                    <img src="@/images/del.svg" alt="" class="w-6">
                </button>
            </div>
            <div class="flex flex-col gap-2 p-2 text-base text-left min-w-56 min-h-36">
                <template v-for="(_, key, index) in settingsArr" :class="{'py-1': containers[type].settings[index].type[0] > -1}">

                    <!-- Text input -->
                    <div v-if="isControl(index, ControlType.Text)">
                        <label :for="key">{{ containers[type].settings[index].title }}</label><br>
                        <input :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value" class="px-2 py-0.5 bg-white bg-opacity-10 rounded-md" type="text">
                    </div>
                    
                    <!-- Button -->
                    <button type="button" v-if="isControl(index, ControlType.Button)" @click.stop="emit('pressedButton', key); forceHide()" class="px-4 py-1 mx-auto w-max text-lg bg-black bg-opacity-40 rounded-md focus-within:outline-current button">{{ containers[type].settings[index].title }}</button>
                    
                    <!-- Checkbox -->
                    <div v-if="isControl(index, ControlType.Checkbox)" class="flex justify-between">
                        <label :for="key">{{ containers[type].settings[index].title }}</label>
                        <input :name="key" :checked="settingsArr[key]" @change="settingsArr[key] = !settingsArr[key]" class="py-0.5 !mr-0 bg-white bg-opacity-10 rounded-md button" type="checkbox">
                    </div>
    
                    <!-- Number selector -->
                    <div v-if="isControl(index, ControlType.Spinbox)" class="flex justify-between">
                        <label :for="key">{{ containers[type].settings[index].title }}</label>
                        <input :name="key" :min="containers[type].settings[index].type[1]" :max="containers[type].settings[index].type[2]" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value" class="px-2 py-0.5 mr-2 w-16 bg-white bg-opacity-10 rounded-md" type="number">
                    </div>
    
                    <!-- Regular dropdown -->
                    <div v-if="isControl(index, ControlType.Picker)" class="flex justify-between items-center">
                        <label :for="key">{{ containers[type].settings[index].title }}</label>
                        <select class="px-2 py-1 bg-white bg-opacity-20 rounded-md border-2 border-white border-opacity-40" :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value">
                            <option v-for="(key, ind) in containers[type].settings[index].type.slice(1)" :value="ind">{{ key }}</option>
                        </select>
                    </div>
    
                    <!-- Level dropdown -->
                    <div v-if="isControl(index, ControlType.LevelPicker)" class="flex justify-between items-center">
                        <label :for="key">{{ containers[type].settings[index].title }}</label>
                        <select class="px-2 py-1 bg-white bg-opacity-20 rounded-md border-2 border-white border-opacity-40" :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value">
                            <option :value="-1">{{ $t('other.all') }}</option>
                            <option v-for="(level, index) in postData.levels" :value="index">{{ level.levelName || $t('other.unnamesd') }}</option>
                        </select>
                    </div>
    
                    <!-- Rating dropdown -->
                    <div v-if="isControl(index, ControlType.RatingPicker)" class="flex justify-between items-center">
                        <label :for="key">{{ containers[type].settings[index].title }}</label>
                        <select class="px-2 py-1 bg-white bg-opacity-20 rounded-md border-2 border-white border-opacity-40" :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value">
                            <option :value="-1">{{ $t('other.all') }}</option>
                            <option :value="-2">{{ $t('other.allMain') }}</option>
                            <option :value="-3">{{ $t('other.allCustom') }}</option>
                            <option v-for="(rating, index) in DEFAULT_RATINGS.concat(postData.ratings)" :value="index">{{ rating.name || $t('other.unnamed2') }}</option>
                        </select>
                    </div>

                    <!-- Image picker -->
                    <div v-if="isControl(index, ControlType.ImagePicker)" class="flex flex-col gap-1 justify-between items-center mb-2">
                        <label class="w-full text-left" :for="key">{{ containers[type].settings[index].title }}</label>
                        <div class="grid grid-cols-4 gap-1" :name="key" >

                            <button
                                v-for="(k, ind) in containers[type].settings[index].type.slice(1)"
                                @click="settingsArr[key] = ind"
                                :class="{'outline-2 outline outline-lof-400': settingsArr[key] == ind}"
                                class="p-2 bg-black bg-opacity-40 rounded-md"
                            >
                                <img :src="k" class="w-6" alt="">
                            </button>
                        </div>
                    </div>
        
                </template>
            </div>
        </form>
    </Teleport>
</template>