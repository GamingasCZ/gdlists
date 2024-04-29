<script setup lang="ts">
import { inject } from 'vue';

const emit = defineEmits(['startWriting'])
const openedDialogs = inject("openedDialogs")

</script>

<template>
	<div>
		<div class="flex flex-col gap-4 items-center opacity-30">
			<img src="@/images/reviews.svg" class="w-36" alt="">
			<h2 class="text-2xl">Vítej v editoru recenzí!</h2>
		</div>
		
		<div class="flex justify-around w-full">
			<div class="flex flex-col items-center">
				<img src="@/images/reviews.svg" class="w-36 opacity-30" alt="">
				<h2 class="opacity-30">Přidej levely, které chceš ohodnotit!</h2>
				<button @click="openedDialogs.levels = true" class="flex gap-2 p-2 mt-3 bg-black bg-opacity-40 rounded-md button">
					<img src="@/images/browseMobHeader.svg" class="w-6" alt="">
					<span>Levely</span>
				</button>
			</div>
			<div class="flex flex-col items-center">
				<img src="@/images/reviews.svg" class="w-36 opacity-30" alt="">
				<h2 class="opacity-30">Ohodnoť jejich gameplay a dekoraci!</h2>
				<button @click="openedDialogs.reviews = true" class="flex gap-2 p-2 mt-3 bg-black bg-opacity-40 rounded-md button">
					<img src="@/images/rating.svg" class="w-6" alt="">
					<span>Hodnocení</span>
				</button>
			</div>
			<div class="flex flex-col items-center">
				<img src="@/images/reviews.svg" class="w-36 opacity-30" alt="">
				<h2 class="opacity-30">Rozepiš se o levelech dál!</h2>
				<button @click="emit('startWriting')" class="flex gap-2 items-center p-2 px-3 mt-3 text-xl font-bold text-black rounded-md button bg-lof-400">
					<img src="@/images/edit.svg" class="w-6 invert" alt="">
					<span>Začít psát!</span>
				</button>
			</div>
		</div>
	</div>
</template>
