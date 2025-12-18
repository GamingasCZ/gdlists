<script setup lang="ts">
import { defaultShortcuts, doOverride, isFirefox, keyShortcuts } from '@/writers/shortcuts';
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

    let final = [...keys]
    if (key[1] != null)
        final.push(key[1])
    return final
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
    if (isFirefox.value && to == 0) // firefox alt bug
        warnMsg(1)

    if (to == 2 && SETTINGS.value.fsZenMode) // single-key
        warnMsg(0)

    editingInd.value = -1
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
    if (!["Control", "Shift", "Alt"].includes(e.key))
        newCombo.value[1] = e.key[0].toUpperCase()+e.key.slice(1)
    else
        newCombo.value[1] = null
}
const endListen = () => {
    document.documentElement.removeEventListener("keydown", listen)
    emit('finishedEdit')
    newCombo.value = null
    editingInd.value = -1
}

const editingInd = ref(-1)
const editShortcut = (which: number, reset: boolean) => {
    // Reset shortcut
    if (reset) {
        let shortcuts = JSON.parse(localStorage.getItem("customShortcuts")!) ?? {}
        let key = keyShortcuts[which][1].join(".")
        delete shortcuts[key]
        localStorage.setItem("customShortcuts", JSON.stringify(shortcuts))
        keyShortcuts[which][0] = defaultShortcuts[0][key]
        keyShortcuts[which][4] = 0
        justChangedProfile.value = Date.now()

        emit('editing')
        nextTick(() => emit('finishedEdit'))
    }
    else {
        editingInd.value = which
        emit('editing')
        document.documentElement.addEventListener("keydown", listen)
    }
}
const newCombo = ref<[Key, number] | null>(null)

const saveNewCombo = (shortcut: any[]) => {
    if (newCombo == null) return

    // check if single-letter is allowed
    let action = shortcut[1].join(".")
    if (defaultShortcuts[0][action]?.[2] === false && (newCombo.value[0] == Key.None || newCombo.value[0] == Key.Shift))
        return summonNotification(i18n.global.t('other.badSh'), i18n.global.t('other.badShHelp'), "error")

    // check duplicates
    let dupl = false
    keyShortcuts.forEach(k => {
        if (k[0][0] == newCombo.value[0] && k[0][1] == newCombo.value[1])
            dupl = true
    })
    if (dupl)
        return summonNotification(i18n.global.t('other.kbInUse'), i18n.global.t('other.kbInUseHelp'), "error")

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

const doHash = (str: string, encode: false | string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i)-64
    }
    hash %= 32
    if (encode === false) {
        return String.fromCharCode(hash)
    }
    else {
        return String.fromCharCode(hash) == encode
    }
}

const doExport = () => {
    let csString = localStorage.getItem("customShortcuts") ?? ""
    var blob = new Blob([doHash(csString, false)+csString], {type: " application/json"});
    var downloadUrl = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "gdlists_shortcuts.json"
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
    summonNotification(i18n.global.t('other.shortcutsExported'), "", "check")
}

const doImport = () => {
    var a = document.createElement("input")

    const importFail = () => {
        summonNotification(i18n.global.t('other.error'), i18n.global.t('other.kbFail'), "error")
        a.remove()
    }

    a.type = "file"
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    a.oninput = (e: Event) => {
        let file = e.target?.files as FileList
        if (file.length > 0) {
            let shortcutFile = file.item(0)
            if (shortcutFile?.type != "application/json" || !hasLocalStorage())
                return importFail()
            shortcutFile.text().then(string => {
                let jsonOnly = string.slice(1)
                let parsedShortcuts = JSON.parse(jsonOnly)
                
                if (parsedShortcuts == null)
                    return importFail()
                let hash = string[0]
                let hashValid = doHash(jsonOnly, hash)
                if (!hashValid)
                    return importFail()
                
                localStorage.setItem("customShortcuts", jsonOnly)
                changeProfile(profiles.length-1)
                emit('editing')
                nextTick(() => emit('finishedEdit'))
                summonNotification(i18n.global.t('other.kbLoaded'), "", "check")
            })
        }
    }
    a.oncancel = e => {
        a.remove()
    }
}

const infoMessages = [
    i18n.global.t('reviews.kbWarn2'),
    i18n.global.t('reviews.kbWarn1')
]
var msgsShown = [false, false]
const infoMsgShown = ref(false)
const infoMsg = ref("")
const warnMsg = (which: number) => {
    if (msgsShown[which]) return

    msgsShown[which] = true
    infoMsg.value = infoMessages[which]
    infoMsgShown.value = true
    setTimeout(() => {
        infoMsgShown.value = false
    }, 2000);
}

defineExpose({profilePopupOpen})

</script>

<template>
    <Dropdown v-if="ppOpen" :button="button" @close="ppOpen = false" @picked-option="$event ? doImport() : doExport()" :options="['Export','Import']" :icons="[SaveIcon, LoadIcon]">
        <template #header>
            <div class="flex flex-col gap-2 p-2">
                <button
                v-for="(p, ind) in profiles"
                @click="changeProfile(ind)"
                class="py-2 text-white bg-black bg-opacity-40 rounded-md button"
                :class="{'border-2 border-lof-400': selectedProfile == ind}"
                >{{ p }}</button>
                <hr class="m-2 border opacity-20">
            </div>
        </template>
    </Dropdown>

    <section class="grid bg-[url(@/images/fade.svg)] mt-1 bg-repeat-x grid-cols-3 gap-3 max-h-[35rem] overflow-auto p-3">

        <Transition name="fade">
            <div v-if="infoMsgShown" class="flex absolute right-2 bottom-2 left-2 z-20 gap-2 items-center p-2 rounded-md shadow-drop bg-lof-300">
                <img src="@/images/info.svg" alt="">
                <p>{{ infoMsg }}</p>
            </div>
        </Transition>

        <div
            v-for="(shortcut, ind) in keyShortcuts"
            v-memo="[justChangedProfile, editingInd, newCombo]"
            :key="ind+selectedProfile"
            @click="editShortcut(ind, shortcut[4]!)"
            :class="{'hover:bg-opacity-80 button': editingInd != ind, 'disabled': (editingInd != -1 && editingInd != ind)}"
            class="flex relative flex-col gap-2 items-center p-2 overflow-clip bg-black bg-opacity-40 rounded-sm group"
        >
            <!-- edited mark -->
            <div v-if="shortcut[4]" class="absolute -top-1.5 -right-1.5 w-3 rotate-45 aspect-square bg-lof-400"></div>

            <div v-if="editingInd != ind">
                <img v-if="shortcut[4]" src="@/images/replay.svg" alt="" class="absolute top-2 right-2 w-4 opacity-0 transition-opacity duration-75 group-hover:opacity-100">
                <img v-else src="@/images/edit.svg" alt="" class="absolute top-2 right-2 w-4 opacity-0 transition-opacity duration-75 group-hover:opacity-100">
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