<script setup lang="ts">
import { inject, ref } from 'vue';

const props = defineProps<{inverted: boolean}>()
const emit = defineEmits(['startWriting'])
const openedDialogs = inject("openedDialogs")

const invert = ref(props.inverted ? 'invert(1)' : 'invert(0)')

</script>

<template>
	<div class="font-[poppins]">
		<div class="flex flex-col gap-4 items-center opacity-30 invertable">
			<img src="@/images/reviews.svg" class="w-36" alt="">
			<h2 class="text-2xl">{{ $t('reviews.help1') }}</h2>
		</div>
		
		<div class="flex gap-2 justify-around mt-4 w-full max-sm:flex-col">
			<div class="flex gap-2 items-center p-1 rounded-md max-sm:bg-opacity-10 sm:flex-col max-sm:bg-white">
				<img src="@/images/reviews.svg" class="w-36 opacity-30 max-sm:w-14 invertable" alt="">
				<h2 class="opacity-30 invertable">{{ $t('reviews.help2') }}</h2>
				<button @click="openedDialogs.levels = true" class="flex gap-2 p-2 mt-3 min-w-max bg-black bg-opacity-40 rounded-md max-sm:hidden button">
					<img src="@/images/browseMobHeader.svg" class="w-6" alt="">
					<span>{{ $t('editor.levels') }}</span>
				</button>
				<img src="@/images/arrow.svg" class="ml-auto w-4 opacity-40 sm:hidden" alt="">
			</div>
			<div class="flex gap-2 items-center p-1 rounded-md max-sm:bg-opacity-10 sm:flex-col max-sm:bg-white">
				<img src="@/images/reviews.svg" class="w-36 opacity-30 max-sm:w-14 invertable" alt="">
				<h2 class="opacity-30 invertable">{{ $t('reviews.help3') }}</h2>
				<button @click="openedDialogs.ratings = true" class="flex gap-2 p-2 mt-3 min-w-max bg-black bg-opacity-40 rounded-md max-sm:hidden button">
					<img src="@/images/rating.svg" class="w-6" alt="">
					<span>{{ $t('reviews.rating') }}</span>
				</button>
				<img src="@/images/arrow.svg" class="ml-auto w-4 opacity-40 sm:hidden" alt="">
			</div>
			<div class="flex gap-2 items-center p-1 rounded-md max-sm:bg-opacity-10 sm:flex-col max-sm:bg-white">
				<img src="@/images/reviews.svg" class="w-36 opacity-30 max-sm:w-14 invertable" alt="">
				<h2 class="opacity-30 invertable">{{ $t('reviews.help4') }}</h2>
				<button @click="emit('startWriting')" class="flex gap-2 items-center p-2 px-3 mt-3 min-w-max text-xl font-bold text-black rounded-md max-sm:hidden button bg-lof-400">
					<img src="@/images/edit.svg" class="w-6 invert" alt="">
					<span>{{ $t('reviews.start') }}</span>
				</button>
				<img src="@/images/arrow.svg" class="ml-auto w-4 opacity-40 sm:hidden" alt="">
			</div>
		</div>
	</div>
</template>

<style>

.invertable {
	filter: v-bind('invert');
}

</style>
