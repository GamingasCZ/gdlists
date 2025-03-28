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
}>()

const base = import.meta.env.BASE_URL

const tagSettingsOpen = ref(false)
const editingLink = ref(false)

const contentDiv = ref<HTMLDivElement>()

const getName = () => [-1, ''].includes(props.tag[1]) ? i18n.global.t(`editor.tags[${props.tag[0]}]`) : props.tag[1]

const moveCaretToEnd = () => {
  let sel = window.getSelection()!
  if (sel.type != 'Caret') return
  
  let range = document.createRange()
  range.setStart(sel.focusNode, sel.focusNode?.childNodes.length)
  sel.removeAllRanges()
  sel.addRange(range)
}

const openSettings = () => {
  if (props.settable && !tagSettingsOpen.value) {
    tagSettingsOpen.value = true
    nextTick(() => {
      contentDiv.value?.focus()
      contentDiv.value.textContent = getName()
      moveCaretToEnd()
    })
  }
}

const modTagName = (to: string, close = true) => {
  if (tagInputEmpty.value) return

  if (!editingLink.value)
    props.tag[1] = to
  else {
    try {
      let isUrl = new URL(to)
      props.tag[2] = to
    }
    catch (_) {}
  }

  if (close) {
    tagSettingsOpen.value = false
    editingLink.value = false
  }
}

const editLink = () => {
  modTagName(contentDiv.value?.textContent, false)
  
  editingLink.value = !editingLink.value
  contentDiv.value.textContent = editingLink.value ? props.tag[2] : getName()
  contentDiv.value?.focus()
  moveCaretToEnd()
  
  tagInputEmpty.value = contentDiv.value.textContent.length == 0
}

const tagInputEmpty = ref(false)
const placeholderText = computed(() => `'${tagInputEmpty.value ? (editingLink.value ? i18n.global.t('other.link') : i18n.global.t('other.title')) : ''}'`)

const handleInput = (e: InputEvent) => {
  nextTick(() => {
    let len = e.target.textContent.length
    let maxlen = editingLink.value ? Limit.MAX_TAG_LINKLEN : Limit.MAX_TAG_TEXTLEN

    if (len > maxlen) {
      e.target.textContent = e.target.textContent.slice(0, maxlen)
      moveCaretToEnd()
    }
    tagInputEmpty.value = len == 0
  })
}

</script>

<template>
  <div ref="tagDiv" @click="settable ? openSettings() : emit('clicked', $event)" @auxclick="emit('auxclicked', $event)" class="flex gap-1 items-center pr-2 text-xs bg-black bg-opacity-40 rounded-full border-2 border-black border-opacity-50 group min-w-4 sm:text-sm"
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

    <div v-if="tagSettingsOpen" class="flex">
      <div contenteditable="true" ref="contentDiv" @input="handleInput" @keydown.enter.prevent="$nextTick(() => modTagName(contentDiv?.textContent))" class="mr-2 outline-none tagTextInput tagEditName min-w-8 focus-within:border-b-2">
        
      </div>

      <button @click.stop="editLink" class="mx-1 button" :class="{'invert-[0.4] sepia': editingLink}"><img src="@/images/link.svg" class="w-4" alt=""></button>
      <button :disabled="tagInputEmpty" @click.stop="modTagName(contentDiv?.textContent)" class="mx-1 disabled:opacity-20 button"><img src="@/images/checkThick.svg" class="w-4" alt=""></button>
    </div>
    <div v-else>
      <a
        class="text-blue-300 underline"
        v-if="tag[2]"
        >{{ [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
      >
      <span v-else>{{
        [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1]
      }}</span>
    </div>

    <button v-if="plus" class="pl-2 ml-auto">
      <img src="@/images/plus.svg" class="w-3" alt="">
    </button>
  </div>
</template>

<style>

.tagEditName::before {
  content: v-bind(placeholderText);
  @apply text-white absolute w-max text-opacity-40;
}

</style>