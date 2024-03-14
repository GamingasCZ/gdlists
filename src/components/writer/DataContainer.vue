<script setup lang="ts">
import {onMounted, ref } from 'vue';
import type { Container } from './containers';
import ContainerSettings from './ContainerSettings.vue';

const emit = defineEmits<{
	(e: "removeContainer"): void
	(e: "moveContainer", by: number): void
	(e: "hasFocus", elem: HTMLDivElement): void
	(e: "lostFocus"): void
}>()

interface Extras {
	currentSettings: any[]
	type: string
}

const props = defineProps<Container & Extras>()

const doShowSettings = ref(false)
const showPlaceholder = ref(true)
const element = ref<HTMLDivElement>()
onMounted(() => element.value?.focus())

</script>

<template>
	<div class="relative group focus-within:outline hover:outline transition-[outline_0.05s] min-h-8 outline-lof-400">
		<span v-if="showPlaceholder" class="absolute left-1 text-white text-opacity-10 pointer-events-none">{{ placeholder ?? "" }}</span>
		<div ref="element" @focus="emit('hasFocus', element!)" @input="showPlaceholder = $el.innerText.length == 0" :contenteditable="canEditText" class="break-words outline-none" :class="childStyling || []">
		</div>
		<slot></slot>

		<div class="absolute flex flex-col top-[-3px] right-[-31px] box-border">
			<button @click="doShowSettings = true" @auxclick="emit('removeContainer')" class="p-0.5 opacity-0 group-focus-within:!opacity-100 group-hover:opacity-100 bg-lof-400"><img src="@/images/gear.svg" class="w-6 invert"></button>
		</div>

		<ContainerSettings
			:type="type"
			:settings-arr="currentSettings"
			:shown="doShowSettings"
			@hid-settings="doShowSettings = false"
			@remove="emit('removeContainer')"
			@move="emit('moveContainer', $event)"
		/>
	</div>
</template>

<style>

.listChildren > * {
	display: list-item;
	list-style-position: inside;
}

</style>