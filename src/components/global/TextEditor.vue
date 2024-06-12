<script setup lang="ts">
import { levelList } from "@/Editor";
import { ref } from "vue";
import parseText from "./parseEditorFormatting";
import { i18n } from "@/locales";

const isPreviewing = ref<boolean>(false);

function addFormatting(type: number) {
  if (isPreviewing.value) return;

  let chars = ["**", "_", "~~"][type];
  let textbox = document.querySelector("#mainTextbox") as HTMLTextAreaElement;
  let selStart = textbox.selectionStart;
  switch (type) {
    case 0:
    case 1:
    case 2:
      if (selStart == textbox.selectionEnd) {
        // No text selected
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${chars} ${chars}` +
          textbox.value.slice(selStart);
        textbox.focus();
        textbox.selectionStart = selStart + chars.length;
        textbox.selectionEnd = selStart + chars.length + 1;
      } else {
        let selectedText = textbox.value.slice(selStart, textbox.selectionEnd);
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${chars}${selectedText}${chars}` +
          textbox.value.slice(textbox.selectionEnd);
        textbox.focus();
        textbox.selectionStart = textbox.selectionEnd + 2;
        textbox.selectionEnd = textbox.selectionEnd + 2;
      }

      break;
    case 4:
    case 5:
    case 7:
    case 8:
    case 9:
      let format = ["* ", "> ", null, "# ", "## ", "### "][type-4];
      let startLF = [undefined, "\n"].includes(textbox.value[selStart - 1])
        ? ""
        : "\n";
      textbox.value =
        textbox.value.slice(0, selStart) +
        `${startLF}${format}` +
        textbox.value.slice(selStart);
      textbox.focus();
      textbox.selectionStart = selStart + format?.length+1;
      textbox.selectionEnd = selStart + format?.length+1;
      break;
    case 11:
    case 12:
      let helpText = type == 12 ? 'alt' : 'text'
      let selectedText = textbox.value.slice(selStart, textbox.selectionEnd) || helpText
      let isImage = type == 12 ? '!' : ''
      if (textbox.value.slice(textbox.selectionStart, textbox.selectionStart + 4).startsWith("http")) {
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${isImage}[${helpText}](${selectedText})` +
          textbox.value.slice(textbox.selectionEnd);
          
          textbox.focus();
          textbox.selectionStart = selStart + isImage.length + 1;
          textbox.selectionEnd = selStart + helpText.length + isImage.length + 1;
        }
      else {  
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${isImage}[${selectedText || 'text'}](link)` +
          textbox.value.slice(textbox.selectionEnd);
          
          textbox.focus();
          textbox.selectionStart = selStart + selectedText.length + isImage.length + 3;
          textbox.selectionEnd = selStart + selectedText.length + isImage.length + 7;
      }
      break;

    default:
      break;
  }
  levelList.value.description = textbox.value
}

const autoLink = (e: Event) => {
  let text = e.clipboardData.getData('Text')
  if (text.startsWith("http")) {
    if (text.match(/^.*(.jpg|.png|.gif|.webp|.jpeg)/)) addFormatting(12)
    else addFormatting(11)
  }
}

const base = import.meta.env.BASE_URL
const formatting = [
  ["bold", i18n.global.t('reviews.bold')],
  ["cursive", i18n.global.t('reviews.italics')],
  ["strike", i18n.global.t('reviews.strike')],
  ["div"],
  ["list", i18n.global.t('editor.listItems')],
  ["quotes", i18n.global.t('editor.citations')],
  ["div"],
  ["heading1", i18n.global.t('reviews.title', [1])],
  ["heading2", i18n.global.t('reviews.title', [2])],
  ["heading3", i18n.global.t('reviews.title', [3])],
  ["div"],
  ["link", i18n.global.t('other.link')],
  ["showImage", i18n.global.t('other.picture')],
  ["div"],
]
</script>

<template>
    <main class="flex flex-grow-[1] flex-col gap-0 m-2 mt-0 h-[30rem]">
      <div class="box-border flex flex-wrap gap-1.5 items-center">
        <div v-for="(format, index) in formatting">
          <button
            @click="addFormatting(index)"
            :title="format[1]"
            class="p-1 bg-black bg-opacity-0 rounded-md hover:bg-opacity-40 button"
            :class="{ disabled: isPreviewing }"
            v-if="format[0] != 'div'"
          >
            <img class="w-5" :src="`${base}/formatting/${format[0]}.svg`" alt="aas" />
          </button>
          <del v-else class="my-auto w-1 h-full rounded-full border-2 border-black opacity-20"></del>
        </div>
        <button
          @click="isPreviewing = !isPreviewing"
          class="flex items-center p-1 px-2 bg-black bg-opacity-40 rounded-md button"
          :class="{ 'bg-opacity-[0.8]': isPreviewing }"
        >
          <img
            class="flex gap-1 w-5"
            src="@/images/view.svg"
            alt=""
          /><span class="pl-1 leading-none">{{ $t('other.preview') }}</span>
        </button>
      </div>
      <textarea
        @paste="autoLink"
        id="mainTextbox"
        v-show="!isPreviewing"
        v-model="levelList.description"
        class="h-max w-full flex-grow-[1] resize-none rounded-lg bg-black bg-opacity-40 px-2 py-1"
        :placeholder="$t('editor.listDescription') + $t('editor.mdHelp')"
      ></textarea>
      <div
        class="h-max flex-grow-[1] rounded-lg border-4 border-solid overflow-y-auto border-white border-opacity-10 regularParsing px-1"
        v-show="isPreviewing"
        v-html="parseText(levelList.description)"
      ></div>
    </main>
</template>
