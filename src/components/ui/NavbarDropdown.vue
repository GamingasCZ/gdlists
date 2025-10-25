<script setup lang="ts">

const props = defineProps<{
    isReview: boolean
}>()

const path = props.isReview ? 'review' : 'list'

</script>

<template>
    <section class="absolute top-8 w-[40rem] p-3 text-base font-normal bg-black">
        <div class="flex gap-4">
            <RouterLink :to="`/make/${path}`" class="flex flex-col items-center p-2 text-base text-white rounded-md border border-lof-400">
                <img src="@/images/editorMobHeader.svg" class="w-8" alt="">
                Vytvořit seznam
            </RouterLink>
            <div class="grow">
                <span class="font-bold">Koncepty:</span>
            </div>
        </div>
        <div>
            <RouterLink :to="`/make/${path}`" class="flex flex-col items-center p-2 text-base text-white rounded-md border border-lof-400">
                <img src="@/images/browse.svg" class="w-8" alt="">
                Procházet
            </RouterLink>
        </div>
    </section>
</template>