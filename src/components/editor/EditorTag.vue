<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { computed, ref } from "vue";
import Dropdown from "../ui/Dropdown.vue";
import { nextTick } from "vue";
import { i18n } from "@/locales";
import { Limit } from "@/assets/limits";

const props = defineProps<{
  tag: LevelTag;
  isExample?: boolean
  selectable?: boolean
  settable?: boolean
  plus?: boolean
  gear?: boolean
}>();

const emit = defineEmits<{
  (e: "clicked", event: MouseEvent)
  (e: "auxclicked", event: MouseEvent)
  (e: "dragging")
}>()

const base = import.meta.env.BASE_URL

const tagSettingsOpen = ref(false)
const editingLink = ref(false)

const tagDiv = ref<HTMLButtonElement>()
const nameInput = ref<HTMLInputElement>()
const openSettings = () => {
  settingsOpen.value = true
  nextTick(() => nameInput.value?.focus())
}

const closeSettings = (andFocus = true) => {
  checkUrl()
  settingsOpen.value = false
  if (andFocus)
    tagDiv.value?.focus()
}

const modTagName = (newName: string) =>
    props.tag[1] = newName == '' ? -1 : newName

const checkUrl = () => {
    try {
      new URL(props.tag[2])
    }
    catch (_) {
      props.tag[2] = ""
    }
}

const tagInputEmpty = ref(false)
const settingsOpen = ref(false)

</script>

<template>
  <button ref="tagDiv" @click="settable ? openSettings() : emit('clicked', $event)" @auxclick="emit('auxclicked', $event)" @dragstart="settable && emit('dragging')" :draggable="settable ? 'true' : 'false'" class="flex gap-1 items-center pr-2 text-xs bg-black bg-opacity-40 rounded-full border-2 border-black border-opacity-50 focus-within:outline-white group min-w-4 sm:text-sm"
    :class="{'opacity-60 hover:opacity-100': isExample, 'button': selectable && !tagSettingsOpen}"
  >
    <div class="inline relative align-middle">
      <img
        :src="`${base}/tags/${tag[0]}.svg`"
        class="w-6"
        alt=""
      />
      <img
        v-if="gear"
        src="@/images/gear.svg"
        class="absolute top-1/2 left-1/2 p-1 w-6 bg-black bg-opacity-80 rounded-full opacity-0 transition-opacity -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100"
        alt=""
      />
    </div>

    <div>
      <a
        class="text-blue-300 underline"
        v-if="tag[2]"
        >{{ [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
      >
      <span v-else>{{
        [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1]
      }}</span>
    </div>

    <span v-if="plus" class="pl-2 ml-auto">
      <img src="@/images/plus.svg" class="w-3" alt="">
    </span>

    <Dropdown v-if="settingsOpen && settable" :button="tagDiv" @close="closeSettings(false)">
      <template #header>
        <form @submit.prevent="closeSettings" @keyup.esc="closeSettings" class="flex flex-col p-1 text-white">
          <button type="button" class="flex gap-2 justify-center items-center p-1 text-red-400 bg-black bg-opacity-40 rounded-md button" @click="emit('auxclicked', $event); settingsOpen = false">
            <img src="@/images/del2.svg" class="mb-1 w-5" alt="">
            {{ $t('editor.remove') }}
          </button>
          <label class="mt-2 text-xl" for="tagEditText">Text</label>
          <input @input="modTagName($event.target.value)" :value="tag[1] == -1 ? '' : tag[1]" autocomplete="off" :placeholder="$t(`editor.tags[${tag[0]}]`)" @click.stop="$event.target.focus()" ref="nameInput" :maxlength="Limit.MAX_TAG_TEXTLEN" class="p-1 bg-white bg-opacity-10 rounded-md" type="text" id="tagEditText">
          <label class="mt-4 text-xl" for="tagEditLink">{{ $t('other.link') }}</label>
          <input v-model="tag[2]" @click.stop="$event.target.focus()" :maxlength="Limit.MAX_TAG_LINKLEN" autocomplete="off" class="p-1 bg-white bg-opacity-10 rounded-md" type="url" name="" id="tagEditLink">
          <button class="hidden"></button>
        </form>
      </template>
    </Dropdown>
  </button>
</template>