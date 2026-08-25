<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import TabBar from '../ui/TabBar.vue';
import ColorizerPicker from './ColorizerPicker.vue';
import { i18n } from '@/locales.ts';
import ColorizerPreset from './ColorizerPreset.vue';
import chroma from 'chroma-js';
import { type PostData, type Stop } from '@/interfaces.ts';
import ColorPicker from '../global/ColorPicker.vue';
import { applyPalleteColor, colorizerPresets } from '@/Reviews.ts';
import { hasLocalStorage } from '@/siteSettings.ts';
import Dialog from '../global/Dialog.vue';
import { dialog } from '../ui/sizes.ts';

const MESSAGES = computed(() => [
    i18n.global.t('reviews.gradHelp1'),
    i18n.global.t('reviews.gradHelp2', ['<strong>'+currentPresetName.value+'</strong>']),
    i18n.global.t('reviews.gradHelp3', ['<strong>'+currentPresetName.value+'</strong>']),
    "Vlastní paletu lze použít až po uložení."
])

const emit = defineEmits<{
    (e: "close"): void
}>()

const savedPalletes = ref<{[id: string]: {name: string, gradient: Stop[]}}>({})
if (hasLocalStorage()) {
    let palletes = JSON.parse(localStorage.getItem("savedPalletes")!)
    if (palletes)
        savedPalletes.value = palletes
}

const buttons = [
    [],
    [i18n.global.t('other.preview'), i18n.global.t('other.activate'), ""],
    [i18n.global.t('other.deactivate')]
]

const postData = inject<Ref<PostData>>("postData")!

// the pallete when opening the dialog
var currentPalleteSelected = postData?.value.pallete

const currentPresetName = computed(() => {
    if (postData?.value.pallete < 0)
        return colorizerPresets[Math.abs(postData?.value.pallete)-1].name
    else if (postData?.value.pallete > 0)
        return savedPalletes.value[postData?.value.pallete].name
    return ""
})

const applyButtonState = computed(() => (tab.value == 0 && !customSaveID.value) ? 3 : notYetApplied.value ? 1 : (postData?.value.pallete ? 2 : 0) )
const tab = ref(postData?.value.pallete > 0 ? 1 : 2)

const colorPicker = ref<HTMLDivElement & {addStop: () => void, reverseGradient: () => void}>()

const grad = ref<Stop[]>(postData.value.pallete > 0 ? JSON.parse(JSON.stringify(savedPalletes.value[postData.value.pallete!].gradient)) : [])

const cloneStop = (ind: number) => {
    let newStop:Stop = JSON.parse(JSON.stringify(grad.value[ind]))
    newStop.position += newStop.position > 0.5 ? -0.1 : 0.1
    grad.value.splice(ind, 0, newStop)
}

const notYetApplied = ref(false)
var editing = ref(-1)
var editingHex = ref(-1)

const confirmHexEdit = (newValue: string, ind: number) => {
    grad.value[ind].color = chroma(newValue).hsv()
    editingHex.value = -1
}

const selectPreset = (id: number) => {
    notYetApplied.value = false
    postData.value.pallete = id
    if (currentPalleteSelected == id) return

    notYetApplied.value = true
}

const newGradient = async () => {
    let res = await checkIfCustomPalleteSaved()
    if (res == 1 && res !== true) return

    customSaveID.value = 0
    justSaved.value = false
    grad.value = [{color: chroma.random().hsv(), position: 0}, {color: chroma.random().hsv(), position: 1}]
}

const applyPallete = () => {
    currentPalleteSelected = postData?.value.pallete
    applyPalleteColor(postData?.value)
    notYetApplied.value = false
}

const footerButtonAction = (ind: number) => {
    if (applyButtonState.value == 1) {
        if (ind == 0)
            ind = 0
        if (ind == 1) {
            applyPallete()
        }
        if (ind == 2) {
            postData.value.pallete = currentPalleteSelected
            notYetApplied.value = false
        }
    }
    else if (applyButtonState.value == 2)
        if (ind == 0) 
            postData.value.pallete = false
}

const editPreset = async (gradient: Stop[]) => {
    let res = await checkIfCustomPalleteSaved()
    if (res == 1 && res !== true) return

    let newGrad: Stop[] = JSON.parse(JSON.stringify(gradient))
    grad.value = newGrad
    tab.value = 0
    justSaved.value = false
}

const editSaved = async (key: string) => {
    let res = await checkIfCustomPalleteSaved()
    if (res == 1 && res !== true) return

    let newGrad: Stop[] = JSON.parse(JSON.stringify(savedPalletes.value[key].gradient))
    grad.value = newGrad
    customSaveID.value = parseInt(key)
    saveName.value = savedPalletes.value[key].name
    selectPreset(customSaveID.value)
    tab.value = 0
    justSaved.value = true
}

const notSavedOpen = ref(0)
const checkIfCustomPalleteSaved = () => {
    if (grad.value.length > 0 && !justSaved.value) {
        notSavedOpen.value = 4
        return new Promise((res, _rej) => {
            watch(notSavedOpen, () => {
                let response = notSavedOpen.value
                notSavedOpen.value = 0
                if (response == 3) { // save
                    if (customSaveID.value)
                        saveCustom()
                    else {
                        response = 1
                        tab.value = 0
                        savingCustom.value = true
                    }
                }
                res(response)
            }, {once: true})
        })
    }
    else return true
}

const savingCustom = ref(false)
const saveName = ref("")
const justSaved = ref(true)
const customSaveID = ref(postData.value.pallete > 0 ? postData.value.pallete : 0)
const saveCustom = () => {
    if (!customSaveID.value) {
        customSaveID.value = Date.now()

        savedPalletes.value[customSaveID.value.toString()] = {
            gradient: grad.value,
            name: saveName.value
        }
        notYetApplied.value = true
        postData.value.pallete = customSaveID.value
    }
    else {
        savedPalletes.value[customSaveID.value.toString()].gradient = grad.value
    }

    saveName.value = ""
    savingCustom.value = false
    justSaved.value = true
    localStorage.setItem("savedPalletes", JSON.stringify(savedPalletes.value))
    if (!notYetApplied.value && postData.value.pallete == customSaveID.value)
        applyPalleteColor(postData.value)
}

onBeforeUnmount(() => {
    if (notYetApplied.value)
        postData.value.pallete = currentPalleteSelected
})

const impexpOpen = ref(0)
const exportText = computed(() => {
    if (impexpOpen.value > 1) {
        let colors = savedPalletes.value[impexpOpen.value].gradient.map(x => chroma.hsv(...x.color).hex())
        let pos = savedPalletes.value[impexpOpen.value].gradient.map(x => Math.round(x.position*100))
        let fin = []
        for (let i = 0; i < colors.length; i++)
            fin.push([colors[i], pos[i]].join(","))

        return fin.join(";")
    }
    return ""
})


const impTextArea = ref<HTMLTextAreaElement>()
const impTextAreaText = ref("")
const impTextAreaTitle = ref("")
const importError = ref("")

const importPallete = () => {
    const err = (text: string) => importError.value = text

    let sets = impTextAreaText.value.split(";")
    let finGrad: Stop[] = []
    if (sets.length == 0) return err("Neplatný vstup.")
    if (sets.length > 10) return err("Paleta může mít maximálně 10 zarážek.")

    sets.forEach(x => {
        let set = x.split(",", 2)
        let col = chroma.valid(set[0], "hex")
        if (!col) return err("Neplatná barva!")
        if (!set[1]) return err("Zarážka není platná!")
        let pos = parseInt(set[1])
        if (isNaN(pos) || pos < 0 || pos > 100) return err("Neplatná pozice zarážky.")
        finGrad.push({color: chroma.hex(set[0]).hsv(), position: pos/100})
    })

    savedPalletes.value[Date.now().toString()] = {gradient: finGrad, name: impTextAreaTitle.value}
    savePalletes()
    impexpOpen.value = 0
    tab.value = 1
}

const copyPallete = () => navigator.clipboard.writeText(exportText.value)

const savePalletes = () => localStorage.setItem("savedPalletes", JSON.stringify(savedPalletes.value))

const savedAction = (ind: number, key: string) => {
    switch (ind) {
        case 0:
            impexpOpen.value = parseInt(key)
            break;
        case 1:
            savedPalletes.value[Date.now().toString()] = JSON.parse(JSON.stringify(savedPalletes.value[key]))
            return savePalletes()

        case 2:
            if (postData.value.pallete?.toString() == key)
                postData.value.pallete = 0

            if (currentPalleteSelected?.toString() == key)
                currentPalleteSelected = 0

            if (customSaveID.value.toString() == key)
                customSaveID.value = 0
            notYetApplied.value = false

            delete savedPalletes.value[key]
            return savePalletes()
            
    }
}

const close = async () => {
    let res = await checkIfCustomPalleteSaved()
    if (res == 1 && res !== true) return

    emit('close')
}

const openImport = () => impexpOpen.value = 1
defineExpose({
    openImport,
    close
})

const customGradEmpty = computed(() => grad.value.length == 0)
const nameInput = ref<HTMLInputElement>()

</script>

<template>
    <div class="grid mt-1 grid-rows-[max-content,_30rem,_max-content]">
        <TabBar @switched-tab="tab = $event" :default-tab="tab" :tab-names="[$t('other.custom'), $t('navbar.saved'), $t('other.presets')]" />
        <section class="flex relative p-2 bg-black bg-opacity-40 h-30 max-h-30">

            <!-- Import/Export Popup -->
            <Dialog :open="impexpOpen" @close-popup="impexpOpen = 0" :width="dialog.medium" :title="impexpOpen == 1 ? $t('other.import') : $t('other.export')">
                <!-- import -->
                <template v-if="impexpOpen == 1">
                    <form @submit.prevent="importPallete" class="m-2">
                        <p v-html="$t('reviews.pImpHelp')"></p>
                        <p class="mt-3 ml-2 text-lg font-bold">{{ $t('reviews.example') }}:</p>
                        <blockquote v-if="!importError" class="p-2 font-mono bg-gradient-to-r to-transparent border-l-4 from-lof-300 border-lof-400">
                            #FF0000,0;#00FF00,50;#0000FF,100
                        </blockquote>
                        <blockquote v-else class="p-2 font-mono bg-gradient-to-r from-red-900 to-transparent border-l-4 border-red-500">
                            {{importError}}
                        </blockquote>
                        <input autocomplete="off" class="px-2 py-1 mt-3 w-full bg-black bg-opacity-40 rounded-md" v-model="impTextAreaTitle" type="text" :placeholder="$t('editor.palleteName')" minlength="2" maxlength="20" required >
                        <textarea v-model="impTextAreaText" required ref="impTextArea" @vue:mounted="$nextTick(() => impTextArea?.focus())" :placeholder="$t('reviews.pimpH2')+'...'" class="p-2 mt-3 w-full bg-black bg-opacity-40 rounded-md resize-none"></textarea>
                        <div class="flex justify-between mt-3 font-bold">
                            <button type="button" @click="impexpOpen = 0" class="text-lof-400">{{ $t('other.cancel') }}</button>
                            <button class="flex gap-2 px-2 py-1 text-black rounded-md bg-lof-400">
                                <img src="@/images/check.svg" class="w-4" alt="">
                                {{ $t('other.use') }}
                            </button>
                        </div>
                    </form>
                </template>
                <!-- export -->
                <template v-else>
                    <div class="m-2">
                        <p>Copy the pallete below.</p>
                        <input type="text" class="p-2 w-full text-center bg-black bg-opacity-40 rounded-md min-h-16" @mouseover="$event.target.select()" readonly :value="exportText"></input>
                        <button @click="copyPallete" class="flex gap-2 items-center p-2 mx-auto mt-2 bg-black bg-opacity-40 rounded-md button">
                            <img src="@/images/link.svg" class="w-5" alt="">
                            {{ $t('other.copy') }}
                        </button>
                    </div>
                </template>
            </Dialog>

            <!-- Not saved Popup -->
            <Dialog :open="notSavedOpen" @close-popup="notSavedOpen = 1" :width="dialog.medium" :title="$t('other.save')">
                <div>
                    <div class="flex p-2 gap-3 items-center">
                        <img src="@/images/symbolicSave.svg" class="w-16 opacity-20 m-3" alt="">
                        <div>
                            <span class="font-bold text-2xl">{{ $t('reviews.cPnS1') }}</span>
                            <p class="mt-1">{{ $t('reviews.cPnS2') }}</p>
                        </div>
                    </div>
                    <div class="flex mb-2 justify-evenly">
                        <button @click="notSavedOpen = 1" class="button p-2 text-xl flex gap-3 items-center bg-black bg-opacity-40 rounded-md">
                            <img src="@/images/close.svg" class="w-6" alt="">
                            {{ $t('other.cancel') }}
                        </button>
                        <button @click="notSavedOpen = 2" class="button p-2 text-xl flex gap-3 items-center bg-black bg-opacity-40 rounded-md">
                            <img src="@/images/trash.svg" class="w-6" alt="">
                            {{ $t('other.discard') }}
                        </button>
                        <button @click="notSavedOpen = 3" class="button p-2 text-xl flex gap-3 items-center bg-black bg-opacity-40 rounded-md">
                            <img src="@/images/symbolicSave.svg" class="w-6" alt="">
                            {{ $t('other.save') }}
                        </button>
                    </div>
                </div>

            </Dialog>

            <!-- Custom -->
            <template v-if="tab == 0">
                <ColorizerPicker
                    @open-color="editing = $event"
                    @made-changes="justSaved = false"
                    ref="colorPicker"
                    :gradient="grad"
                    :class="{'pointer-events-none opacity-50': customGradEmpty}"

                />
                <section class="flex absolute top-0 right-0 bottom-0 flex-col w-3/5 bg-greenGradient">
                    <div v-show="!customGradEmpty" class="flex items-center p-3">
                        <span class="text-xl grow">{{ $t('review.gradStops') }}</span>
                        <button @click="colorPicker?.randomize()" :title="$t('other.randomize')" class="flex gap-2 p-1 mr-2 bg-black bg-opacity-40 rounded-md button"><img src="@/images/dice.svg" class="w-6" alt=""></button>
                        <button @click="colorPicker?.reverseGradient()" :title="$t('other.flip')" class="flex gap-2 p-1 mr-2 bg-black bg-opacity-40 rounded-md button"><img src="@/images/flip.svg" class="w-6" alt=""></button>
                        <button :disabled="grad.length >= 10" @click="colorPicker?.addStop()" class="flex gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/plus.svg" class="w-5" alt="">{{ $t('other.add') }}</button>
                    </div>

                    <div class="overflow-auto bg-black bg-opacity-20 grow">
                        <div v-for="(stop, ind) in grad" class="p-2 odd:bg-black odd:bg-opacity-20">
                            <div class="flex">
                                <button @click="editing = editing == ind ? -1 : ind" class="w-7 rounded-full border-2 border-black ring-2 ring-white button aspect-square" :style="{background: chroma.hsv(...stop.color).hex()}"></button>
                                <span v-if="editingHex != ind" @click="editingHex = ind" class="ml-3 text-xl button">{{ chroma.hsv(...stop.color).hex() }}</span>
                                <input v-else @blur="confirmHexEdit($event.target.value, ind)" @mouseover="$event.target.select()" type="text" size="5" class="ml-2 w-max bg-transparent border-b-2 outline-none focus-within:bg-white/10" :value="chroma.hsv(...stop.color).hex()">
                                <span class="ml-2 opacity-40">{{ Math.round(stop.position*100) }}%</span>
                                <div class="flex gap-2 ml-auto">
                                    <button :disabled="grad.length >= 10" @click="cloneStop(ind)" class="p-1 h-7 bg-black bg-opacity-40 rounded-md disabled:opacity-20 aspect-square"><img src="@/images/copy.svg" alt=""></button>
                                    <button :disabled="grad.length <= 1" @click="grad.splice(ind, 1)" class="p-1 h-7 bg-black bg-opacity-40 rounded-md disabled:opacity-20 aspect-square"><img src="@/images/trash.svg" alt=""></button>
    
                                </div>
                            </div>
                            <ColorPicker
                                v-if="editing == ind"
                                @colors-modified="stop.color = $event"
                                full hsl
                                :hue="stop.color[0]"
                                :lightness="stop.color[2] * 100"
                                :saturation="stop.color[1] * 100"
                                class="mt-4"
                            />
                        </div>
                    </div>
                    <div v-show="!customGradEmpty" class="p-2">
                        <div v-if="!savingCustom" class="flex gap-2 justify-around">
                            <button @click="newGradient" class="flex gap-2 justify-center py-1 bg-white bg-opacity-0 rounded-md duration-75 transition-color hover:bg-opacity-10 grow"><img src="@/images/plus.svg" class="w-5">{{ $t('other.new') }}</button>
                            <button :disabled="justSaved" @click="customSaveID ? saveCustom() : savingCustom = true" class="flex gap-2 justify-center py-1 bg-white bg-opacity-0 rounded-md duration-75 disabled:opacity-20 transition-color hover:bg-opacity-10 grow"><img src="@/images/symbolicSave.svg" class="w-5">{{ justSaved ? $t('reviews.saved') : $t('other.save') }}</button>
                        </div>
                        <form class="flex gap-2" @submit.prevent="saveCustom" v-else>
                            <button type="button" @click="savingCustom = false">
                                <img src="@/images/back.svg" class="w-4 button" alt="">
                            </button>
                            <input ref="nameInput" @vue:mounted="$nextTick(() => nameInput.focus())" required minlength="2" maxlength="20" autocomplete="off" class="px-2 py-1 bg-black bg-opacity-40 rounded-md grow" :placeholder="$t('editor.palleteName')" v-model="saveName" type="text">
                            <button type="button" class="p-1 px-1.5 bg-black bg-opacity-40 rounded-md button" @click="saveCustom">
                                <img src="@/images/checkThick.svg" alt="" class="w-5">
                            </button>
                        </form>
                    </div>

                    <div v-if="customGradEmpty" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center text-center -translate-x-1/2 -translate-y-1/2">
                        <div class="relative opacity-20">
                            <button
                                class="p-1 pl-6 w-36 h-24 bg-white rounded-md -translate-y-3.5 cursor-move stopCutout"
                            >
                                <div class="absolute right-4 top-1/2 w-16 rounded-full -translate-y-1/2 aspect-square button" :style="{background: 'red'}"></div>
                            </button>
                            <img src="@/images/flip.svg" class=" absolute top-5 -right-7 z-10 w-7 scale-y-[2]" alt="">
                        </div>

                        <span class="">{{ $t('reviews.crPallHelp') }}</span>

                        <button @click="newGradient" class="flex gap-2 items-center p-2 text-lg bg-black bg-opacity-40 rounded-md button">
                            <img src="@/images/plus.svg" class="w-8" alt="">
                            {{ $t('reviews.createPallete') }}
                        </button>
                    </div>
                </section>
            </template>

            <!-- Saved -->
            <template v-else-if="tab == 1">
                <div v-if="!Object.keys(savedPalletes).length" class="flex flex-col gap-3 justify-center items-center w-full opacity-40">
                    <img src="@/images/color.svg" class="w-32" alt="">
                    <h2 class="text-2xl">{{ $t('reviews.palHelp1') }}</h2>
                    <span>{{ $t('reviews.palHelp2') }}</span>
                </div>

                <div v-else class="flex flex-wrap gap-6 justify-evenly items-start p-3 w-full h-full">
                    <ColorizerPreset
                        v-for="(saved, key) in savedPalletes"
                        :key="saved.gradient"
                        @click="selectPreset(parseInt(key))"
                        @dblclick="selectPreset(parseInt(key)); applyPallete();"
                        @edit="editSaved(key)"
                        @opt-picked="savedAction($event, key)"
                        :selected="key == postData?.pallete"
                        :name="saved.name"
                        :gradient="saved.gradient"
                        show-edit show-extra
                    />
                </div>
            </template>

            <!-- Presets -->
            <template v-else-if="tab == 2">
                <div class="flex flex-wrap gap-6 justify-evenly items-start p-3 w-full h-full">
                    <ColorizerPreset
                        v-for="(preset, ind) in colorizerPresets"
                        @click="selectPreset(-(ind+1))"
                        @dblclick="selectPreset(-(ind+1)); applyPallete();"
                        @edit="editPreset(preset.gradient)"
                        show-edit
                        :selected="Math.abs(postData?.pallete)-1 == ind"
                        :gradient="preset.gradient"
                        :name="preset.name"
                    />
                </div>
            </template>
    
        </section>
        <div class="flex h-10 gap-2 items-center px-2 m-2 bg-black bg-opacity-40 rounded-md">
            <img v-if="applyButtonState == 0 || applyButtonState == 3" src="@/images/info.svg" class="w-5" alt="">
            <img v-else src="@/images/color.svg" class="w-5" alt="">
            <span v-html="MESSAGES[applyButtonState]"></span>
            <div class="flex gap-2 justify-end grow">
                <button v-for="(button, ind) in buttons[applyButtonState]" :disabled="applyButtonState == 1 && ind == 0 && postData?.levels.length == 0" @click="footerButtonAction(ind)" class="flex gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20">
                    <img v-if="applyButtonState == 1 && ind == 0" src="@/images/view.svg" class="inline w-5" alt="">
                    <img v-if="applyButtonState == 1 && ind == 1" src="@/images/checkThick.svg" class="inline w-5" alt="">
                    <img v-if="(applyButtonState == 1 && ind == 2) || (applyButtonState == 2 && ind == 0)" src="@/images/close.svg" class="inline w-5" alt="">
                    {{ button }}
                </button>
            </div>
        </div>
    </div>
</template>