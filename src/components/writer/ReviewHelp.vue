<script setup lang="ts">
import type { PostData, ReviewDraft } from '@/interfaces';
import type { Writer } from '@/writers/Writer';
import { inject } from 'vue';
import DraftCard from './DraftCardSmall.vue';
import { computed } from 'vue';

const props = defineProps<{
	inverted: boolean
	writer: Writer
	drafts: {[draftKey: string]: ReviewDraft}
	post: PostData
}>()
const emit = defineEmits<{
	(e: "loadDraft", key: string): void
	(e: "previewDraft", key: string): void
	(e: "loadTemplate", index: number): void
	(e: "preset", index: number): void
}>()
const openedDialogs = inject("openedDialogs")

const invert = computed(() => props.inverted ? 'invert(1)' : 'invert(0)')
const draftsValues = Object.values(props.drafts).reverse().slice(0,4)
const draftsKeys = Object.keys(props.drafts).reverse().slice(0,4)

const base = import.meta.env.BASE_URL
</script>

<template>
	<div class="grid text-base thinScrollbar font-[poppins] py-4 w-full gap-y-5">

		<section v-if="drafts && draftsValues.length">
			<h2 class="ml-2 text-3xl font-black text-lof-400">{{ $t('reviews.drafts2') }}</h2>
			<div class="grid">
				<section class="flex overflow-auto gap-4 px-2 mt-2">
					<DraftCard
						v-for="(draft, ind) in draftsValues.slice(0,3)"
						@click="emit('loadDraft', draftsKeys[ind])"
						@preview-draft="emit('previewDraft', draftsKeys[ind])"
						:draft="draft"
					/>
	
					<button v-if="draftsValues.length > 3" class="flex flex-col justify-center items-center rounded-md min-w-32 hover:bg-opacity-20 hover:bg-black grow" @click="openedDialogs.drafts = true">
						<img class="w-8 invertable" src="@/images/more.svg" alt="">
						<p>{{ $t('reviews.otherDrafts') }}</p>
					</button>
	
				</section>
			</div>

			<div class="flex gap-4 items-center my-8">
				<hr class="h-0.5 bg-opacity-10 bg-gradient-to-l from-white to-transparent rounded-md border-none opacity-20 invertable grow">
				<span class="text-xl opacity-20">{{ $t('reviews.smthNew') }}...</span>
				<hr class="h-0.5 bg-opacity-10 bg-gradient-to-r from-white to-transparent rounded-md border-none opacity-20 invertable grow">
			</div>

		</section>
		
		<div v-if="!draftsValues.length" class="opacity-30">
			<img src="@/images/reviews.svg" class="mx-auto w-36" alt="">
			<h1 class="my-3 text-4xl font-bold text-center">{{ $t('reviews.reviewIntro') }}</h1>
			<div class="flex gap-4 items-center my-8">
				<hr class="h-0.5 bg-opacity-10 bg-gradient-to-l from-white to-transparent rounded-md border-none invertable grow">
				<span class="text-xl">{{ $t('reviews.howStart') }}</span>
				<hr class="h-0.5 bg-opacity-10 bg-gradient-to-r from-white to-transparent rounded-md border-none invertable grow">
			</div>
		</div>
		
			<section class="flex gap-3 px-2 w-full opacity-50 invertable sm:items-center max-sm:flex-col">
				<button @click="emit('preset', 0)" class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
					<div class="w-full opacity-20">
						<div class="relative w-24 h-5 bg-white rounded-sm">
							<img :src="`${base}/formatting/heading1.svg`" class="absolute top-1/2 left-1/2 w-5 mix-blend-exclusion -translate-x-1/2 -translate-y-1/2" alt="">
						</div>
						<div class="relative mt-2 w-full h-12 bg-white rounded-sm">
							<img :src="`${base}/formatting/default.svg`" class="absolute top-1/2 left-1/2 w-8 mix-blend-exclusion -translate-x-1/2 -translate-y-1/2" alt="">
						</div>
					</div>
					<p class="invertable">{{ $t('reviews.sugg1') }}</p>
				</button>
				<hr class="w-0.5 h-20 bg-white bg-opacity-20 border-none max-sm:hidden">
				<button :disabled="!post.levels.length" @click="emit('preset', 1)" class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg disabled:opacity-20 sm:flex-col grow hover:bg-black">
					<div class="w-full opacity-20">
						<div class="relative mx-auto w-36 h-12 bg-white rounded-sm">
							<img :src="`${base}/formatting/showLevel.svg`" class="absolute top-1/2 left-1/2 w-8 mix-blend-exclusion -translate-x-1/2 -translate-y-1/2" alt="">
						</div>
						<div class="relative mt-2 w-full h-5 bg-white rounded-sm">
							<img :src="`${base}/formatting/default.svg`" class="absolute top-1/2 left-1/2 w-4 mix-blend-exclusion -translate-x-1/2 -translate-y-1/2" alt="">
						</div>
					</div>
					<p class="invertable">{{ $t('reviews.sugg2') }}</p>
				</button>
				<hr class="w-0.5 h-20 bg-white bg-opacity-20 border-none max-sm:hidden">
				<button :disabled="!post.levels.length" @click="emit('preset', 2)" class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg disabled:opacity-20 sm:flex-col grow hover:bg-black">
					<div class="w-full opacity-20">
						<div class="relative mx-auto w-36 h-8 bg-white rounded-sm">
							<img :src="`${base}/formatting/showRating.svg`" class="absolute top-1/2 left-1/2 w-6 mix-blend-exclusion -translate-x-1/2 -translate-y-1/2" alt="">
						</div>
						<div class="relative mt-2 w-full h-9 bg-white rounded-sm">
							<img :src="`${base}/formatting/default.svg`" class="absolute top-1/2 left-1/2 w-5 mix-blend-exclusion -translate-x-1/2 -translate-y-1/2" alt="">
						</div>
					</div>
					<p class="invertable">{{ $t('reviews.sugg3') }}</p>
				</button>
			</section>


	</div>
</template>

<style>

.invertable {
	filter: v-bind('invert');
}

</style>
