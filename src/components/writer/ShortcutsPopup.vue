<script setup lang="ts">
import { doOverride, keyShortcuts } from '@/writers/shortcuts';
import { Key } from '@/writers/Writer';
import Dropdown from '../ui/Dropdown.vue';
import { ref } from 'vue';
import { onMounted } from 'vue';


const parseKey = (key: [Key, string]) => {
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
const selectedProfile = ref(0)
const profilePopupOpen = () => {
    ppOpen.value = true
}

const button = ref<HTMLImageElement>()
onMounted(() => {
    button.value = document.querySelector("#shortcutPopupButton")
})


const profiles = ["Alt-ové", "Control-ové", "Vlastní"]
const changeProfile = (to: number) => {
    selectedProfile.value = to
}

defineExpose({profilePopupOpen})

</script>

<template>
    <Dropdown v-if="ppOpen" :button="button" @close="ppOpen = false">
        <template #header>
            <div class="flex flex-col gap-2 p-2">
                <button
                v-for="(p, ind) in profiles"
                @click="changeProfile(ind)"
                class="py-2 text-white bg-black bg-opacity-40 rounded-md border-2 border-gray-900 button"
                :class="{'!border-lof-400': selectedProfile == ind}"
                >{{ p }}</button>
            </div>
        </template>
    </Dropdown>

    <section class="grid bg-[url(@/images/fade.svg)] bg-repeat-x grid-cols-3 gap-3 max-h-[35rem] overflow-auto p-3">
        <div class="flex flex-col gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md" v-for="shortcut in keyShortcuts">
            <img :src="shortcut[3]" class="w-8" alt="">
            <span>{{ shortcut[2] }}</span>
            <div class="flex justify-center">
                
                <template v-for="(key, i) in parseKey(shortcut[0])">
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
