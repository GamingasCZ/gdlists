<script setup lang="ts">
import Option from '../ui/Option.vue';
import { SETTINGS } from "@/siteSettings";
import RadioPicker from '../ui/RadioPicker.vue';
import SectionDivider from '../ui/SectionDivider.vue';

</script>

<template>
    <div class="flex bg-repeat-x bg-[url(@/images/fade.webp)] overflow-y-auto flex-col gap-2 p-2">
        <SectionDivider :text="$t('settingsMenu.visual')" />
        <Option
        :name="$t('settingsMenu.viewMode')"
            control="slot"
            :desc="$t('settingsMenu.levelHelp')"
            >
            <RadioPicker v-model="SETTINGS.levelViewMode" id="level" :opt-names="[$t('settingsMenu.classic'), $t('settingsMenu.compact'), $t('settingsMenu.table')]" :opt-icons="['/viewModes/classic.svg', '/viewModes/compact.svg', '/viewModes/spreadsheet.svg']" />
        </Option>
        <Option
            v-model="SETTINGS.homepageColumns"
            :name="$t('settingsMenu.homepage')"
            control="dropdown"
            :control-options="[[$t('settingsMenu.columns', 1), 1],[$t('settingsMenu.columns', 2), 2],[$t('settingsMenu.columns', 3), 3]]"
        >
        </Option>
        <SectionDivider :text="$t('settingsMenu.behave')" />
        <Option
            v-model="SETTINGS.autosave"
            :name="$t('settingsMenu.autosave')"
            :desc="$t('settingsMenu.autosaveHelp')"
            control="dropdown"
            :control-options="[[$t('settingsMenu.asOff'), 0], [$t('settingsMenu.everySec', [30]), 30], [$t('settingsMenu.everySec', [60]), 60], [$t('settingsMenu.everyMin', [3]), 180]]"
            >
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
        <SectionDivider :text="$t('settingsMenu.access')" />
        <Option
            v-model="SETTINGS.disableColors"
            :name="$t('settingsMenu.disColors')"
            :desc="$t('settingsMenu.disColorHelp')"
            control="cbox"
        >
        </Option>
        <Option
            v-model="SETTINGS.disableBGs"
            :name="$t('settingsMenu.disBGs')"
            :desc="$t('settingsMenu.disBGhelp')"
            control="cbox"
        >
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
</div>
</template>