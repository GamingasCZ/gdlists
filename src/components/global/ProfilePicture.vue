<script setup lang="ts">
import { currentCutout, currentUID, lastPFPchange, profileCutouts } from '@/components/global/profiles';
import { ref, watch } from 'vue';

const props = defineProps<{
    uid: string | -2 | -3
    cutout: number | null
}>()

const PFP = ref("")
const currCutout = ref(props.cutout)
const UC = import.meta.env.VITE_USERCONTENT
const base = import.meta.env.BASE_URL
async function load() {
    if (props.uid == -2) {
        PFP.value = `${base}/pfps/oldPFP.webp`
        return
    }
    if (props.uid == -3) {
        PFP.value = `${base}/pfps/among.webp`
        return
    }

    let l = new Promise((res, err) => {
        let img = new Image()
        img.src = `${UC}/userContent/${props.uid}/pfp.webp?v=${lastPFPchange.value}`
        img.onload = () => res(img.src)
        img.onerror = () => err()
    })

    PFP.value = await l.then(res => res).catch(err => `${base}/pfps/defaultPFP.webp`)
}
load()

watch(lastPFPchange, load)
watch(currentCutout, () => {
    if (props.uid == currentUID.value)
        currCutout.value = currentCutout.value
})
</script>

<template>
    <img :src="PFP" class="profilePicture" :style="{clipPath: profileCutouts[currCutout ?? 0]}" alt="">
</template>