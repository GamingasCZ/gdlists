<script setup lang="ts">
import Option from '../ui/Option.vue';
import { SETTINGS } from "@/siteSettings";
import RadioPicker from '../ui/RadioPicker.vue';

</script>

<template>
    <div class="flex overflow-y-auto flex-col p-2">
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
        <Option
            v-model="SETTINGS.autosave"
            :name="$t('settingsMenu.autosave')"
            :desc="$t('settingsMenu.autosaveHelp')"
            control="dropdown"
            :control-options="[[$t('settingsMenu.asOff'), 0], [$t('settingsMenu.everySec', [30]), 30], [$t('settingsMenu.everySec', [60]), 60], [$t('settingsMenu.everyMin', [3]), 180]]"
            >
        </Option>
        <Option
            v-model="SETTINGS.iconQuality"
            :name="$t('settingsMenu.iconQuality')"
            :desc="$t('settingsMenu.iconHelp')"
            control="dropdown"
            :control-options="[[$t('settingsMenu.noGenerate'), -2], [$t('settingsMenu.noColor'), -1], [$t('settingsMenu.qLow'), 6], [$t('settingsMenu.qMed'), 4], [$t('settingsMenu.qHigh'), 2]]"
        >
        </Option>
        <Option
            v-model="SETTINGS.dialogClickClose"
            :name="$t('settingsMenu.clickClose')"
            :desc="$t('settingsMenu.dialogHelp')"
            control="cbox"
        >
        </Option>
    </div>
</template>