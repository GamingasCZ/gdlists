<script setup lang="ts">
import { defaultShortcuts, doOverride, keyShortcuts } from '@/writers/shortcuts';
import { Key } from '@/writers/Writer';
import Dropdown from '../ui/Dropdown.vue';
import { nextTick, ref } from 'vue';
import { onMounted } from 'vue';
import SaveIcon from '@/images/symbolicSave.svg?url'
import LoadIcon from '@/images/filePreview.svg?url'
import { hasLocalStorage, SETTINGS } from '@/siteSettings';
import { i18n } from '@/locales';
import { summonNotification } from '../imageUpload';

const emit = defineEmits<{
    (e: "editing"): void
    (e: "finishedEdit"): void
}>()

const parseKey = (key: [Key, string]) => {
    if (key == null) return null
    
    let keys: (string | -1)[] = []
    if (key[0] & Key.Ctrl)
        keys.push("Ctrl", -1)
    if (key[0] & Key.Alt)
        keys.push("Alt", -1)
    if (key[0] & Key.Shift)
        keys.push("Shift", -1)
    return [...keys, key[1]]
}

const ppOpen = ref(false)
const selectedProfile = ref(SETTINGS.value.shortcutProfile)
const profilePopupOpen = () => {
    ppOpen.value = true
}

const button = ref<HTMLImageElement>()
onMounted(() => {
    button.value = document.querySelector("#shortcutPopupButton")
})

const profiles = [i18n.global.t('other.ksAlt'), i18n.global.t('other.ksCtrl'), i18n.global.t('other.ksSingle'), i18n.global.t('other.custom')]
const justChangedProfile = ref(Date.now())
const changeProfile = (to: number) => {
    selectedProfile.value = to
    SETTINGS.value.shortcutProfile = to
    ppOpen.value = false
    emit('editing')
    nextTick(() => {
        emit('finishedEdit')
        nextTick(() => {
            justChangedProfile.value = Date.now()
        })
    })
}

const listen = (e: KeyboardEvent) => {
    e.preventDefault()
    newCombo.value = Array(2)
    newCombo.value[0] = +e.ctrlKey * Key.Ctrl | +e.shiftKey * Key.Shift | +e.altKey * Key.Alt
    newCombo.value[1] = e.key[0].toUpperCase()+e.key.slice(1)
}
const endListen = () => {
    document.documentElement.removeEventListener("keydown", listen)
    emit('finishedEdit')
    newCombo.value = null
    editingInd.value = -1
}

const editingInd = ref(-1)
const editShortcut = (which: number) => {
    editingInd.value = which
    emit('editing')
    document.documentElement.addEventListener("keydown", listen)
}
const newCombo = ref<[Key, number] | null>(null)

const saveNewCombo = (shortcut: any[]) => {
    // check if single-letter is allowed
    let action = shortcut[1].join(".")
    if (defaultShortcuts[0][action]?.[2] === false)
        return summonNotification(i18n.global.t('other.badSh'), i18n.global.t('other.badShHelp'), "error")

    // switch to custom
    if (selectedProfile.value != profiles.length-1) {
        changeProfile(profiles.length-1)
    }

    if (hasLocalStorage()) {
        let shortcuts = JSON.parse(localStorage.getItem("customShortcuts")!) ?? {}
        shortcuts[action] = newCombo.value
        localStorage.setItem("customShortcuts", JSON.stringify(shortcuts))
    }
    endListen()
}

const doExport = () => {
    var blob = new Blob([localStorage.getItem("customShortcuts") ?? ""], {type: " application/json"});
    var downloadUrl = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "gdlists_shortcuts.json"
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
    summonNotification(i18n.global.t('other.shortcutsExported'), "", "check")
}

defineExpose({profilePopupOpen})

</script>

<template>
    <Dropdown v-if="ppOpen" :button="button" @close="ppOpen = false" @picked-option="doExport()" :options="['Export','Import']" :icons="[SaveIcon, LoadIcon]">
        <template #header>
            <div class="flex flex-col gap-2 p-2">
                <button
                v-for="(p, ind) in profiles"
                @click="changeProfile(ind)"
                class="py-2 text-white bg-black bg-opacity-40 rounded-md border-2 border-gray-900 button"
                :class="{'!border-lof-400': selectedProfile == ind}"
                >{{ p }}</button>
                <hr class="m-2 border opacity-20">
            </div>
        </template>
    </Dropdown>

    <section class="grid bg-[url(@/images/fade.svg)] mt-1 bg-repeat-x grid-cols-3 gap-3 max-h-[35rem] overflow-auto p-3">
        <div
            v-for="(shortcut, ind) in keyShortcuts"
            v-memo="[justChangedProfile, editingInd, newCombo]"
            :key="ind+selectedProfile"
            @click="editShortcut(ind)"
            :class="{'hover:bg-opacity-80 button': editingInd != ind, 'disabled': (editingInd != -1 && editingInd != ind)}"
            class="flex relative flex-col gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md group"
        >
            <div v-if="editingInd != ind">
                <img src="@/images/edit.svg" alt="" class="absolute top-2 right-2 w-4 opacity-0 transition-opacity duration-75 group-hover:opacity-100">
                <img :src="shortcut[3]" class="w-8" alt="">
            </div>
            <div v-else class="flex px-4 w-full">
                <button @click.stop="endListen()" class="px-2 opacity-40 hover:opacity-100">
                    <img src="@/images/arrow.svg" class="w-3 rotate-180" alt="">
                </button>
                <button @click.stop="saveNewCombo(shortcut)" class="flex flex-col items-center ml-auto opacity-40 hover:opacity-100">
                    <img src="@/images/checkThick.svg" class="w-4" alt="">
                    {{ $t('other.save') }}
                </button>
            </div>

            <span>{{ shortcut[2] }}</span>

            <div v-if="editingInd != ind" class="flex justify-center pb-2">
                <template v-for="(key, i) in parseKey(shortcut[0])">
                    <div>
                        <span v-if="key == -1">+</span>
                        <kbd v-else class="!min-w-max p-1">
                            {{ doOverride(key) }}
                        </kbd>
                    </div>
                </template>
            </div>
            <div v-else class="flex justify-center">
                <span v-if="newCombo == null" class="text-xs">{{ $t('reviews.enterCombo') }}...</span>
                <template v-else v-for="(key, i) in parseKey(newCombo)">
                    <div>
                        <span v-if="key == -1">+</span>
                        <kbd v-else class="!min-w-max p-1">
                            {{ doOverride(key) }}
                        </kbd>
                    </div>
                </template>
            </div>
        
        </div>
    </section>
</template>
