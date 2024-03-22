<script setup lang="ts">
import {onMounted, ref } from 'vue';
import type { Container } from './containers';
import ContainerSettings from './ContainerSettings.vue';
import { reviewData } from '@/Reviews';

const emit = defineEmits<{
	(e: "removeContainer"): void
	(e: "moveContainer", by: number): void
	(e: "textModified", newText: string)
	(e: "hasFocus", elem: HTMLDivElement): void
	(e: "settingsButton", key: string): void
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
const ID = Date.now()
onMounted(() => element.value?.focus())

const parseText = (e: Event) => {
	emit('textModified', e.target.innerHTML)
}

</script>

<template>
	<div class="relative reviewContainer group focus-within:outline hover:outline outline-[2px] transition-[outline_0.05s] min-h-8 outline-gray-600" :class="{'!outline-none': dependentOnChildren}">
		<span v-if="showPlaceholder" class="absolute left-1 text-white text-opacity-10 pointer-events-none">{{ placeholder ?? "" }}</span>
		<div
			ref="element"
			v-if="canEditText"
			@focus="emit('hasFocus', element!)"
			@keyup="parseText"
			@input="showPlaceholder = $el.innerText.length == 0"
			:contenteditable="true"
			class="break-words outline-none"
			:class="childStyling || []
		">
		</div>
		<slot></slot>

		<div class="absolute flex flex-col top-[-3px] right-[-31px] box-border">
			<button @click="doShowSettings = true" @auxclick="emit('removeContainer')" class="p-0.5 opacity-0 group-focus-within:!opacity-100 group-hover:opacity-100 bg-lof-400"><img src="@/images/gear.svg" class="w-6 invert"></button>
		</div>

		<ContainerSettings
			v-if="!dependentOnChildren"
			:type="type"
			:settings-arr="currentSettings"
			:shown="doShowSettings"
			@pressed-button="emit('settingsButton', $event)"
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