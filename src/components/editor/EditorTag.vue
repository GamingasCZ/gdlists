<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { computed, ref } from "vue";
import Dropdown from "../ui/Dropdown.vue";
import { nextTick } from "vue";
import { i18n } from "@/locales";

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

const openSettings = () => {
  if (props.settable) {
    tagSettingsOpen.value = true
    nextTick(() => contentDiv.value?.focus())
  }
}

const modTagName = (to: string) => {
  if (tagInputEmpty.value) return

  if (editingLink.value)
    props.tag[1] = to
  else
    props.tag[2] = to

  tagSettingsOpen.value = false
}

const editLink = () => {
  editingLink.value = !editingLink.value
  contentDiv.value.textContent = editingLink.value ? (props.tag[1] == -1 ? i18n.global.t(`editor.tags[${props.tag[0]}]`) : props.tag[1]) : props.tag[2]
}

const tagInputEmpty = ref(false)
const placeholderText = computed(() => `'${tagInputEmpty.value ? (editingLink.value ? i18n.global.t('other.link') : 'Název') : ''}')`)

</script>

<template>
  <div ref="tagDiv" @click="settable ? openSettings() : emit('clicked', $event)" @auxclick="emit('auxclicked', $event)" class="flex gap-1 items-center pr-2 text-xs bg-black bg-opacity-40 rounded-full border-2 border-black border-opacity-50 group min-w-4 sm:text-sm"
    :class="{'opacity-60 hover:opacity-100': isExample, 'button': selectable && !tagSettingsOpen}"
  >
    <div class="inline relative align-middle">
      <img
        :src="`${base}/tags/${tag[0]}.svg`"
        class="w-3 sm:w-6"
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
      <div contenteditable="true" ref="contentDiv" @keyup="tagInputEmpty = $event.target.textContent.length == 0" @keydown.enter.prevent="$nextTick(() => modTagName($event.target.textContent))" class="mr-2 outline-none tagEditName min-w-8 focus-within:border-b-2">
        <span class="text-white text-opacity-40">{{ }}</span>
        {{ [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}
      </div>

      <button @click="editLink" class="mx-1 button"><img src="@/images/link.svg" class="w-4" alt=""></button>
      <button :disabled="tagInputEmpty" @class="modTagName(contentDiv?.textContent)" class="mx-1 disabled:opacity-20 button"><img src="@/images/checkThick.svg" class="w-4" alt=""></button>
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

  <!-- <Dropdown v-if="tagSettingsOpen" @close="tagSettingsOpen = false" :button="tagDiv">
    <template #header>
      <section class="flex flex-col p-2 text-white">
        <label for="tagName" class="text-xl">Název tagu</label>
        <input type="text" name="tagName" class="px-2 py-1 bg-black bg-opacity-40 rounded-md">
        
        <label for="tagName" class="mt-3 text-xl">Odkaz</label>
        <input type="text" name="tagName" class="px-2 py-1 bg-black bg-opacity-40 rounded-md">
      </section>
    </template>
  </Dropdown> -->
</template>

<style>

.tagEditName::before {
  content: v-bind(placeholderText);
  @apply text-white text-opacity-40;
}

</style>