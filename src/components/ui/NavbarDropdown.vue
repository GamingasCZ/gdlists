<script setup lang="ts">
import type { ReviewDraft } from '@/interfaces';
import Browse from '@/svgs/Browse.vue';
import Create from '@/svgs/Create.vue';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    isReview: boolean
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()

const path = props.isReview ? 'review' : 'list'
const path2 = props.isReview ? 'reviews' : 'lists'

interface navDraft {
    name: string
    isEdit: number | undefined
    key: string
}

const hasDrafts = ref(false)
const draftsList = ref<navDraft[]>([])
onMounted(() => {
    let drafts = JSON.parse(localStorage.getItem(path+"Drafts")!)
    if (drafts) {
        console.log("fetchiji")
        let draftKeys = Object.keys(drafts).sort((a,b) => (+b) - (+a))
        let maxLen = Math.min(draftKeys.length, 3)
        for (let i = 0; i < maxLen; i++) {
            let draft: ReviewDraft = drafts[draftKeys[i]]
            draftsList.value.push({name: draft.name, isEdit: draft.editing, key: draftKeys[i]})
        }
        hasDrafts.value = true
    }
    else hasDrafts.value = false
})

const editLink = (key: string, isEdit: number | undefined) => {
    if (isEdit)
        return `/edit/${path}/${isEdit}?draft=${key}`
    else
        return `/make/${path}/?draft=${key}`
}

</script>

<template>
    <section @click.stop="" class="absolute text-white top-9 bg-opacity-80 w-[30rem] rounded-md -left-4 p-3 text-base font-normal bg-black">
        <div class="flex gap-4 items-center">
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-base font-bold rounded-md border text-lof-400 border-lof-400">
                <Create class="h-7 fill-lof-400" />
                {{ $t('other.create') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path2}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 mr-3 text-base font-bold rounded-md border text-lof-400 border-lof-400">
                <Browse class="h-7 fill-lof-400" />
                {{ $t('navbar.lists') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path}?type=user`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-sm text-white opacity-60 hover:opacity-100">
                <img src="@/images/view.svg" class="h-6" alt="">
                {{ $t('other.mine') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path}?type=hidden`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-sm text-white opacity-60 hover:opacity-100">
                <img src="@/images/hidden.svg" class="h-6" alt="">
                {{ $t('other.private') }}
            </RouterLink>
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-sm text-white opacity-60 hover:opacity-100">
                <img src="@/images/dice.svg" class="mb-1 h-5" alt="">
                {{ $t('navbar.random') }}
            </RouterLink>
        </div>
        <div v-if="hasDrafts" class="mt-2 text-left">
            <div class="mb-2 border-b-2 grow border-lof-400">
                <span class="font-bold">{{ $t('reviews.drafts') }}:</span>
            </div>
            <RouterLink @click.stop="emit('close')" :to="editLink(draft.key, draft.isEdit)" v-for="draft in draftsList" class="flex items-center p-1 mx-2 mr-0 rounded-md hover:bg-opacity-10 hover:bg-white">
                <img v-if="draft.isEdit" class="inline mr-1 w-3" src="@/images/edit.svg" alt="">
                {{ draft.name }}
                
                <img class="inline ml-auto h-2.5" src="@/images/arrow.svg" alt="">
            </RouterLink>
        </div>
    </section>
</template>