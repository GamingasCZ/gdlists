<script setup lang="ts">
import type { ReviewDraft } from '@/interfaces';
import type { Writer } from '@/writers/Writer';
import { inject, ref } from 'vue';
import DraftCard from './DraftCardSmall.vue';

const props = defineProps<{
	inverted: boolean
	writer: Writer
	drafts: {[draftKey: string]: ReviewDraft}
}>()
const emit = defineEmits<{
	(e: "loadDraft", key: string): void
	(e: "previewDraft", key: string): void
	(e: "loadTemplate", index: number): void
}>()
const openedDialogs = inject("openedDialogs")

const invert = ref(props.inverted ? 'invert(1)' : 'invert(0)')
const draftsValues = Object.values(props.drafts).reverse().slice(0,4)
const draftsKeys = Object.keys(props.drafts).reverse().slice(0,4)
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
						<img class="w-8" src="@/images/more.svg" alt="">
						<p>{{ $t('reviews.otherDrafts') }}</p>
					</button>
	
				</section>
			</div>

			<div class="flex gap-4 items-center my-8">
				<hr class="h-0.5 bg-opacity-10 bg-gradient-to-l from-white to-transparent rounded-md border-none opacity-20 grow">
				<span class="text-xl opacity-20">{{ $t('reviews.smthNew') }}...</span>
				<hr class="h-0.5 bg-opacity-10 bg-gradient-to-r from-white to-transparent rounded-md border-none opacity-20 grow">
			</div>

		</section>
		
		<section>
			<div>
				<img src="@/images/info.svg" class="inline mr-2 w-5" alt="">
				<span>Dej své recenzi šmrnc!</span>
			</div>
		</section>
		<!-- 
			<section class="flex gap-3 px-2 mt-8 w-full sm:items-center max-sm:flex-col">
				<button class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
					<img src="@/images/searchOpaque.svg" class="w-10" alt="">
					<p>Pole pro psaní</p>
				</button>
				<hr class="w-0.5 h-20 bg-white bg-opacity-20 border-none max-sm:hidden">
				<button class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
					<img src="@/images/dice.svg" class="w-10" alt="">
					<p>Výstava levelu</p>
				</button>
				<hr class="w-0.5 h-20 bg-white bg-opacity-20 border-none max-sm:hidden">
				<button class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
					<img src="@/images/filePreview.svg" class="w-10" alt="">
					<p>Výstava hodnocení</p>
				</button>
			</section> -->


	</div>
</template>

<style>

.invertable {
	filter: v-bind('invert');
}

</style>
