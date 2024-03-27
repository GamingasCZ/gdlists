<script setup lang="ts">
import {onMounted, ref } from 'vue';
import type { Container } from './containers';
import ContainerSettings from './ContainerSettings.vue';

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
	focused: boolean
}

const props = defineProps<Container & Extras>()

const doShowSettings = ref(false)
const showPlaceholder = ref(true)
const element = ref<HTMLDivElement>()
onMounted(() => element.value?.focus())

const parseText = (e: Event) => {
	emit('textModified', e.target.innerHTML)
}

const focus = ref([false, false])

</script>

<template>
	<div @mouseover="focus[0] = true" @mouseout="focus[0] = false" @click="emit('hasFocus', element!); focus[1] = true" class="relative reviewContainer outline-[2px] transition-[outline_0.05s] min-h-8 outline-lof-400" :class="{'!outline-none': dependentOnChildren, 'outline': (focus[0] || focus[1]) && focused}">
		<span v-if="showPlaceholder" class="absolute left-1 text-white text-opacity-10 pointer-events-none">{{ placeholder ?? "" }}</span>
		<div
			ref="element"
			v-if="canEditText"
			@keyup="parseText"
			@input="showPlaceholder = $el.innerText.length == 0"
			:contenteditable="true"
			class="break-words outline-none"
			:class="childStyling || []
		">
		</div>
		<slot></slot>

		<div v-if="!dependentOnChildren" class="absolute z-20 flex flex-col top-[-2px] right-[-30px] box-border">
			<button @click="doShowSettings = true" @auxclick="emit('removeContainer')" :class="{'!opacity-100': (focus[0] || focus[1]) && focused}" class="p-0.5 opacity-0 bg-lof-400"><img src="@/images/gear.svg" class="w-6 invert"></button>
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