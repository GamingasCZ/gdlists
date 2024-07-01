<script setup lang="ts">
import { inject, ref } from 'vue';

const props = defineProps<{
	inverted: boolean
	noRatings: boolean
	hasLevels: boolean
	hasRatings: boolean
}>()
const emit = defineEmits(['startWriting'])
const openedDialogs = inject("openedDialogs")

const invert = ref(props.inverted ? 'invert(1)' : 'invert(0)')
</script>

<template>
	<div class="grid sm:grid-cols-2 font-[poppins] py-10 gap-y-5">
		<div class="flex flex-col gap-4 items-center opacity-30 translate-y-4 invertable">
			<img src="@/images/reviews.svg" class="w-36" alt="" :class="{'invert': inverted}">
			<h2 class="text-2xl">{{ $t('reviews.help1') }}</h2>
		</div>
		
		<div class="flex flex-col gap-2 justify-center mt-4 w-full">
			<div class="flex gap-2 justify-between items-center p-2 bg-black bg-opacity-20 rounded-md max-sm:py-3">
				<div class="flex gap-2 items-center" :class="{'line-through decoration-2': !hasLevels}">
					<div class="rounded-full bg-lof-400" :class="{'disabled': hasLevels}"><img :class="{'invisible': hasLevels}" src="@/images/check.svg" class="p-1 w-6" alt=""></div>
					<h2 v-if="!noRatings" class="text-xl opacity-30 invertable">{{ $t('reviews.help2') }}</h2>
					<h2 v-else class="text-xl opacity-30 invertable">{{ $t('reviews.help5') }}</h2>
				</div>
				<button @click="openedDialogs.levels = true" class="flex gap-2 p-2 min-w-max bg-black bg-opacity-40 rounded-md max-sm:hidden button">
					<img src="@/images/browseMobHeader.svg" class="w-6" alt="">
					<span class="text-white">{{ $t('editor.levels') }}</span>
				</button>
				<img src="@/images/arrow.svg" class="ml-auto w-4 opacity-40 sm:hidden" alt="">
			</div>
			<div v-if="!noRatings" class="flex gap-2 justify-between items-center p-2 bg-black bg-opacity-10 rounded-md max-sm:py-3">
				<div class="flex gap-2 items-center" :class="{'line-through decoration-2': !hasRatings}">
					<div class="rounded-full bg-lof-400" :class="{'disabled': hasRatings}"><img :class="{'invisible': hasRatings}" src="@/images/check.svg" class="p-1 w-6" alt=""></div>
					<h2 class="text-xl opacity-30 invertable">{{ $t('reviews.help3') }}</h2>
				</div>

				<button @click="openedDialogs.ratings = true" class="flex gap-2 p-2 min-w-max bg-black bg-opacity-40 rounded-md max-sm:hidden button">
					<img src="@/images/rating.svg" class="w-6" alt="">
					<span class="text-white">{{ $t('reviews.rating') }}</span>
				</button>
				<img src="@/images/arrow.svg" class="ml-auto w-4 opacity-40 sm:hidden" alt="">
			</div>
			<div class="flex gap-2 justify-between items-center p-2 bg-black bg-opacity-20 rounded-md max-sm:py-3">
				<h2 class="text-xl opacity-30 invertable">{{ $t('reviews.help4') }}</h2>
				<button @click="emit('startWriting')" class="flex gap-2 items-center p-2 px-3 min-w-max text-xl font-bold text-black rounded-md max-sm:hidden button bg-lof-400">
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
