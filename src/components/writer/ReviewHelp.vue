<script setup lang="ts">
import { prettyDate } from '@/Editor';
import type { ReviewDraft } from '@/interfaces';
import type { Writer } from '@/writers/Writer';
import { inject, ref } from 'vue';

const props = defineProps<{
	inverted: boolean
	noRatings: boolean
	hasLevels: boolean
	hasRatings: boolean
	writer: Writer
}>()
const emit = defineEmits(['startWriting'])
const openedDialogs = inject("openedDialogs")

const invert = ref(props.inverted ? 'invert(1)' : 'invert(0)')
const drafts: ReviewDraft[] | null = JSON.parse(localStorage.getItem(props.writer.drafts.storageKey)!)
const draftsValues = Object.values(drafts)
</script>

<template>
	<div class="grid text-base font-[poppins] py-4 w-full gap-y-5">

		<section v-if="drafts">
			<h2 class="ml-2 text-3xl font-black text-lof-400">Rozepsané</h2>
			<section class="flex overflow-x-auto gap-4 px-2 mt-2 w-full">
				<button
					v-for="draft in draftsValues.toReversed().slice(0, 3)"
					class="flex flex-col p-2 h-32 text-left rounded-md border aspect-video border-lof-400"
				>
					<h4 class="text-xl font-bold leading-tight">{{ draft.name }}</h4>
					<p class="text-sm text-white text-opacity-40">{{ prettyDate((Date.now() - draft.saveDate) / 1000) }}</p>
					<hr class="opacity-20">
					<p :style="{mask: 'linear-gradient(white, #FFFFFF20)'}">
						<p class="text-sm font-bold">{{ draft.previewTitle }}</p>
						<p class="text-xs">{{ draft.previewParagraph }}</p>
					</p>
				</button>

				<button v-if="draftsValues.length > 3" class="flex flex-col justify-center items-center rounded-md hover:bg-opacity-20 hover:bg-black grow" @click="openedDialogs.drafts = true">
					<img class="w-8" src="@/images/more.svg" alt="">
					<p>Další koncepty</p>
				</button>

			</section>
		</section>

	</div>
</template>

<style>

.invertable {
	filter: v-bind('invert');
}

</style>
