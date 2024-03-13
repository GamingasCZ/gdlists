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


const showPlaceholder = ref(true)
const element = ref<HTMLDivElement>()
const settingsShown = ref(false)
onMounted(() => element.value?.focus())

const showSettings = () => {
	settingsShown.value = true
	document.body.addEventListener("click", closeSettings, { capture: true })
}

const closeSettings = (m: MouseEvent) => {
  if (m.x == 0) return // Clicking on settingsMenu menu content fricks up mouse pos
  let sett = document.querySelector("#containerSettings")!

  let left = sett.offsetLeft!
  let top = sett.offsetTop!
  let width = sett.offsetWidth!
  let height = sett.offsetHeight!
  console.log(sett)
  if (m.x < left || m.x > left + width || m.y < top || m.y > top + height) {
    settingsShown.value = false
    document.body.removeEventListener("click", closeSettings, { capture: true })
  }
}

</script>

<template>
	<div class="relative group focus-within:outline hover:outline transition-[outline_0.05s] min-h-8 outline-lof-400">
		<span v-if="showPlaceholder" class="absolute left-1 text-white text-opacity-10 pointer-events-none">{{ placeholder ?? "" }}</span>
		<div ref="element" @focus="emit('hasFocus', element!)" @input="showPlaceholder = $el.innerText.length == 0" :contenteditable="canEditText" class="break-words outline-none" :class="childStyling || []">
		</div>
		<slot @open-settings="showSettings"></slot>

		<div class="absolute flex flex-col top-[-3px] right-[-31px] box-border">
			<button @click="showSettings" @auxclick="emit('removeContainer')" class="p-0.5 opacity-0 group-focus-within:!opacity-100 group-hover:opacity-100 bg-lof-400"><img src="@/images/gear.svg" class="w-6 invert"></button>
		</div>

		<ContainerSettings
			v-if="settingsShown"
			id="containerSettings"
			:type="type"
			:settings-arr="currentSettings"
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