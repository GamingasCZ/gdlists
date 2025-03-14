<script setup lang="ts">
import Option from '../ui/Option.vue';
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import RadioPicker from '../ui/RadioPicker.vue';
import SectionDivider from '../ui/SectionDivider.vue';
import HoldButton from '../ui/HoldButton.vue';
import { ref } from 'vue';
import cookier from "cookier"

const removeCookies = () => {
    if (!hasLocalStorage()) return
    let cookies = document.cookie.match(/(\w+)=/g).map(x => x.slice(0, x.length-1))
    cookies.forEach(x => cookier(x).remove())
    window.location.reload()
}

const removeStorage = () => {
    if (!hasLocalStorage()) return
    for (let i = 0; i < localStorage.length; i++)
        localStorage.removeItem(localStorage.key(i))
    window.location.reload()
}

const storageSize = ref(0)
if (hasLocalStorage()) {
    for (let i = 0; i < localStorage.length; i++)
        storageSize.value += localStorage.getItem(localStorage.key(i)).length
    
    storageSize.value = (storageSize.value/1000).toFixed(2)+"kB"
}

</script>

<template>
    <div class="flex bg-repeat-x bg-[url(@/images/fade.svg)] overflow-y-auto flex-col gap-2 p-2">
        <SectionDivider :text="$t('settingsMenu.behave')" />
        <Option
        :name="$t('settingsMenu.viewMode')"
            control="slot"
            :desc="$t('settingsMenu.levelHelp')"
            >
            <RadioPicker v-model="SETTINGS.levelViewMode" id="level" :opt-names="[$t('settingsMenu.classic'), $t('settingsMenu.compact'), $t('settingsMenu.table')]" :opt-icons="['/viewModes/classic.svg', '/viewModes/compact.svg', '/viewModes/spreadsheet.svg']" />
        </Option>
        <Option
            v-model="SETTINGS.dialogClickClose"
            :name="$t('settingsMenu.clickClose')"
            :desc="$t('settingsMenu.dialogHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.scrollNavbar"
            :name="$t('settingsMenu.navbar')"
            :desc="$t('settingsMenu.navbarHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.autoComments"
            :name="$t('settingsMenu.loadCom')"
            :desc="$t('settingsMenu.loadCHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.seasonalThemes"
            :name="$t('settingsMenu.seasThemes')"
            :desc="$t('settingsMenu.seasThemesHelp')"
            control="cbox"
        >
        </Option>
        <SectionDivider :text="$t('editor.editor')" />
        <Option
            v-model="SETTINGS.compactToolbar"
            :name="$t('settingsMenu.compToolbar')"
            :desc="$t('settingsMenu.compactHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.draftNoRemove"
            :name="$t('settingsMenu.draftNoRemove')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.colorization"
            :name="$t('settingsMenu.colorize')"
            :desc="$t('settingsMenu.colorizeHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.autosave"
            :name="$t('settingsMenu.autosave')"
            :desc="$t('settingsMenu.autosaveHelp')"
            control="dropdown"
            :control-options="[[$t('settingsMenu.asOff'), 0], [$t('settingsMenu.everySec', [30]), 30], [$t('settingsMenu.everySec', [60]), 60], [$t('settingsMenu.everyMin', [3]), 180]]"
            >
        </Option>
        <Option
            v-model="SETTINGS.saveThumbs"
            :name="$t('settingsMenu.saveThumbs')"
            :desc="$t('settingsMenu.saveThumbsHelp')"
            control="cbox"
        >
        </Option>
        <SectionDivider :text="$t('settingsMenu.access')" />
        <Option
            v-model="SETTINGS.flipControls"
            :name="$t('settingsMenu.flipControls')"
            :desc="$t('settingsMenu.flipControlsHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.disableColors"
            :name="$t('settingsMenu.disColors')"
            :desc="$t('settingsMenu.disColorHelp')"
            control="cbox"
        >
        </Option>
        <Option
            :name="$t('settingsMenu.disBGs')"
            :desc="$t('settingsMenu.disBGhelp')"
            control="slot"
        >
            <RadioPicker v-model="SETTINGS.disableAllBGs" id="noBG" :opt-names="[$t('other.none2'), $t('other.page'), $t('other.levels2'), $t('other.all2')]" />
        </Option>
        <SectionDivider :text="$t('settingsMenu.perf')" />
        <Option
            v-model="SETTINGS.iconQuality"
            :name="$t('settingsMenu.iconQuality')"
            :desc="$t('settingsMenu.iconHelp')"
            control="dropdown"
            :control-options="[[$t('settingsMenu.noGenerate'), -2], [$t('settingsMenu.noColor'), -1], [$t('settingsMenu.qLow'), 6], [$t('settingsMenu.qMed'), 4], [$t('settingsMenu.qHigh'), 2]]"
            >
        </Option>
        <Option
            v-model="SETTINGS.disableTL"
            :name="$t('settingsMenu.disTL')"
            :desc="$t('settingsMenu.disTLhelp')"
            control="cbox"
            >
        </Option>
        <SectionDivider :text="$t('settingsMenu.savedData')" />
        <Option
            :name="$t('settingsMenu.delCookies')"
            :desc="$t('settingsMenu.delCookHelp')"
            control="inline-slot"
        >
            <HoldButton @pushed="removeCookies" :text="$t('editor.remove')" />
        </Option>
        <Option
            :name="$t('settingsMenu.delData')"
            :desc="$t('settingsMenu.delDataHelp')"
            control="inline-slot"
        >
            <div class="flex flex-col items-center w-max">
                <HoldButton @pushed="removeStorage" :text="$t('editor.remove')" />
                <p class="mt-1 text-xs leading-none opacity-40">{{ storageSize }}</p>
            </div>
        </Option>
</div>
</template>