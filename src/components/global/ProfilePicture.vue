<script setup lang="ts">
import { ref } from 'vue';



const props = defineProps<{
    uid: string | -2 | -3
}>()


const PFP = ref("")
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
        img.src = `${UC}/userContent/${props.uid}/pfp.webp`
        img.onload = () => res(img.src)
        img.onerror = () => err()
    })

    PFP.value = await l.then(res => res).catch(err => `${base}/pfps/defaultPFP.webp`)
}
load()
</script>

<template>
    <img :src="PFP" class="profilePicture" alt="">
</template>