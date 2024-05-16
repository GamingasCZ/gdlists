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
	(e: "addParagraph", inNest: boolean): void
}>()

interface Extras {
	currentSettings: any[]
	type: string
	focused: boolean
	editable?: boolean
	text?: string
}

const props = defineProps<Container & Extras>()

const textOnce = props.text
const doShowSettings = ref(false)
const showPlaceholder = ref(true)
const element = ref<HTMLDivElement>()
onMounted(() => element.value?.focus())

const parseText = (e: Event) => {
	if (props.type.startsWith("heading") && e.key == "Enter") {
		e.preventDefault()
		emit('addParagraph', false)
	}
	else
		emit('textModified', e.target.innerText)
}

const doFocusText = () => {
	element.value?.focus()
	let sel = window.getSelection()
	sel?.collapse(element.value?.lastChild, element.value?.innerText.length)
}

defineExpose({
	doFocusText
})

const focus = ref(false)

</script>

<template>
	<div @click.stop="emit('hasFocus', element!); focus = true" class="relative reviewContainer outline-[2px] min-h-8 outline-lof-400" :class="{'!outline-none': dependentOnChildren, 'outline': focus && focused}">
	<span v-if="showPlaceholder && editable" v-show="!text.length" class="absolute left-1 text-white text-opacity-10 pointer-events-none">{{ placeholder ?? "" }}</span>
		<p
			ref="element"
			v-if="canEditText"
			@focus="emit('hasFocus', element!); focus = true"
			@keyup="parseText"
			@input="showPlaceholder = $el.innerText.length == 0"
			:contenteditable="editable"
			class="break-words outline-none"
			:class="childStyling || []
		">{{ textOnce }}
		</p>
		<slot></slot>

		<div v-if="!dependentOnChildren && editable" class="absolute z-10 flex flex-col top-[-2px] right-[-30px] box-border">
			<button @click="doShowSettings = true" tabindex="-1" @auxclick="emit('removeContainer')" :class="{'!opacity-100': focus && focused}" class="p-0.5 opacity-0 bg-lof-400"><img src="@/images/gear.svg" class="w-6 invert"></button>
		</div>

		<ContainerSettings
			v-if="!dependentOnChildren && editable"
			class="containerSettings"
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