<script setup lang="ts">
import { draftsList, updateNavbarDrafts } from '@/Editor';
import Browse from '@/svgs/Browse.vue';
import Create from '@/svgs/Create.vue';
import { computed, onMounted } from 'vue';
import { draftsReviews } from '../../Editor';
import { forceUpdateLastRouteChage } from '@/router';

const props = defineProps<{
    isReview: boolean
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()

const path = props.isReview ? 'review' : 'list'
const path2 = props.isReview ? 'reviews' : 'lists'

const draftArr = props.isReview ? draftsReviews : draftsList

const hasDrafts = computed(() => draftArr.value.length)
onMounted(() => updateNavbarDrafts(props.isReview))

const editLink = (key: string, isEdit: number | undefined) => {
    forceUpdateLastRouteChage()
    if (isEdit)
        return `/edit/${path}/${isEdit}?draft=${key}`
    else
        return `/make/${path}/?draft=${key}`
}

</script>

<template>
    <section @click.stop="" class="absolute text-white backdrop-blur-sm top-9 bg-opacity-90 w-[30rem] rounded-md max-sm:left-0 max-sm:right-0 -left-4 p-3 text-base font-normal bg-black">
        <div class="flex flex-wrap gap-4 items-center">
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-base font-bold rounded-md border text-lof-400 border-lof-400">
                <Create class="h-7 fill-lof-400" />
                {{ $t('other.create') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path2}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 mr-3 text-base font-bold rounded-md border text-lof-400 border-lof-400">
                <Browse class="h-7 fill-lof-400" />
                {{ $t('navbar.lists') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path2}?type=user`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-sm text-white opacity-60 hover:opacity-100">
                <img src="@/images/view.svg" class="h-6" alt="">
                {{ $t('other.mine') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path2}?type=hidden`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-sm text-white opacity-60 hover:opacity-100">
                <img src="@/images/hidden.svg" class="h-6" alt="">
                {{ $t('other.private') }}
            </RouterLink>
            <RouterLink :to="`/random?${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-sm text-white opacity-60 hover:opacity-100">
                <img src="@/images/dice.svg" class="mb-1 h-5" alt="">
                {{ $t('navbar.random') }}
            </RouterLink>
        </div>
        <div v-if="hasDrafts" class="mt-2 text-left">
            <div class="mb-2 border-b-2 grow border-lof-400">
                <span class="font-bold">{{ $t('reviews.drafts') }}:</span>
            </div>
            <RouterLink @click.stop="emit('close')" :to="editLink(draft.key, draft.isEdit)" v-for="draft in draftArr" class="flex items-center p-1 mx-2 mr-0 rounded-md hover:bg-opacity-10 hover:bg-white">
                <img v-if="draft.isEdit" class="inline mr-1 w-3" src="@/images/edit.svg" alt="">
                {{ draft.name }}
                
                <img class="inline ml-auto h-2.5" src="@/images/arrow.svg" alt="">
            </RouterLink>
        </div>
    </section>
</template>