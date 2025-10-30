<script setup lang="ts">
import Browse from '@/svgs/Browse.vue';
import Create from '@/svgs/Create.vue';


const props = defineProps<{
    isReview: boolean
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()

const path = props.isReview ? 'review' : 'list'
const path2 = props.isReview ? 'reviews' : 'lists'

</script>

<template>
    <section class="absolute text-white top-8 w-[30rem] -left-4 p-3 text-base font-normal bg-black">
        <div class="flex gap-4 items-center">
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-base font-bold rounded-md border text-lof-400 border-lof-400">
                <Create class="h-7 fill-lof-400" />
                {{ $t('other.create') }}
            </RouterLink>
            <RouterLink :to="`/browse/${path2}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 mr-3 text-base font-bold rounded-md border text-lof-400 border-lof-400">
                <Browse class="h-7 fill-lof-400" />
                {{ $t('navbar.lists') }}
            </RouterLink>
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-base text-white opacity-60 hover:opacity-100">
                <img src="@/images/view.svg" class="mb-1 h-7" alt="">
                {{ $t('other.mine') }}
            </RouterLink>
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-base text-white opacity-60 hover:opacity-100">
                <img src="@/images/hidden.svg" class="mb-1 h-7" alt="">
                {{ $t('other.private') }}
            </RouterLink>
            <RouterLink :to="`/make/${path}`" @click.stop="emit('close')" class="flex flex-col items-center px-2 pt-2 text-base text-white opacity-60 hover:opacity-100">
                <img src="@/images/dice.svg" class="mb-2 h-6" alt="">
                Náhodný
            </RouterLink>
        </div>
        <div class="mt-2">
            <div class="text-left grow">
                <span class="font-bold">{{ $t('reviews.drafts') }}:</span>
            </div>
        </div>
    </section>
</template>