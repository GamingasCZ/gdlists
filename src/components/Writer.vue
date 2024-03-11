<script setup lang="ts">
import { reactive, ref } from "vue";
import DialogVue from "./global/Dialog.vue";
import Header from "./writer/WriterHeader.vue";
import WriterSettings from "./writer/WriterSettings.vue";
import DataContainer from "./writer/DataContainer.vue"
import FormattingBar from "./writer/FormattingBar.vue"
import CONTAINERS, { type ContainerSettings, type Containers } from "./writer/containers";


const reviewData = reactive<any[]>([])
const openDialogs = reactive({
    "settings": false
})
const selectedContainer = ref<[number, HTMLDivElement | null]>([-1, null])

const addContainer = (key: string) => {
    let settingObject = {}
    for (let i = 0; i < CONTAINERS[key].settings.length; i++)
        settingObject[CONTAINERS[key].settings[i].key] = CONTAINERS[key].settings[i].default

    reviewData.push({
        type: key,
        data: "",
        align: "left",
        settings: settingObject
    })
}

const setAlignment = (index: number, alignment: string) => {
    if (index < 0) return
    reviewData[index].align = alignment
    selectedContainer.value[1]?.focus()
}

</script>

<template>
    <main class="p-2">
        <DialogVue :open="openDialogs.settings" @close-popup="openDialogs.settings = false">
            <WriterSettings @close-popup="openDialogs.settings = false" />
        </DialogVue>

        <Header @open-dialog="openDialogs[$event] = true" />

        <section class="max-w-[90rem] mx-auto leadin">
            <!-- Hero -->
            <div class="pb-16 pl-10 bg-opacity-10 bg-gradient-to-t to-transparent rounded-b-md from-slate-400">
                <input type="text" :placeholder="'Jméno recenze'" class="text-5xl font-black text-white bg-transparent focus-within:border-b-2 border-b-lof-400 focus-within:outline-none">
                <button class="flex gap-2 items-center mt-3 font-bold text-white">
                    <img src="@/images/plus.svg" class="w-6" alt="">
                    <span>Přidat tagline</span>{{ selectedContainer[0] }}
                </button>
            </div>

            <!-- Formatting -->
            <FormattingBar @add-container="addContainer" @set-alignment="setAlignment(selectedContainer[0], $event)" />

            <!-- Editor -->
            <section class="p-2 text-white rounded-md shadow-md bg-lof-200 shadow-black">
                <DataContainer @has-focus="selectedContainer = [index, $event]" v-for="(container, index) in reviewData" :current-settings="container.settings" v-bind="CONTAINERS[container.type]" :class="[CONTAINERS[container.type].styling ?? '']" :style="{textAlign: container.align}" @remove-container="reviewData.splice(index, 1)">
                    <component v-for="(elements) in CONTAINERS[container.type].additionalComponents" :is="elements" />
                </DataContainer>
                <button @click="addContainer('default')" class="flex gap-2 justify-center p-2 mx-auto mt-4 w-96 max-w-[90%] rounded-md border-2 border-white border-opacity-20 border-dashed">
                    <img class="w-6" src="@/images/plus.svg" alt="">
                    <span>Přidat odstavec</span>
                </button>
            </section>
        </section>

    </main>
</template>