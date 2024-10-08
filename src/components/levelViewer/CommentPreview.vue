<script setup lang="ts">
import { prettyDate } from '@/Editor'
import { SETTINGS } from '@/siteSettings';
import chroma from 'chroma-js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProfilePicture from '../global/ProfilePicture.vue';

interface CommentFetchResponse {
  username: string
  comment: string
  comType: string
  bgcolor: string
  listID: string
  comID: string
  verified: string
  timestamp: string
  uid: string
  userArray: CommentUser[]
}

interface CommentUser {
  username: string
  discord_id: string
  pfp_cutout: number
  id: string
}

const props = defineProps<CommentFetchResponse>()

const pfp = ref("")
const username = ref("")
const cutout = ref(0)

// Endgame list special comment
if (props.uid == '-2') {
  pfp.value = -3
  username.value = props.username
}
// Old users
else if (props.username != "") {
  pfp.value = -2
  username.value = props.username
}

props.userArray.forEach(user => {
  if (user.discord_id == props.uid) {
    pfp.value = user.discord_id
    username.value = user.username
    cutout.value = user.pfp_cutout
  }
});

const time = ref<string>("")
const datePassed = Math.floor(Date.now()/1000 - parseInt(props.timestamp))
const dateString = ref<string>(`${new Date(parseInt(props.timestamp)*1000).toLocaleDateString()} ${new Date(parseInt(props.timestamp)*1000).toLocaleTimeString()}`)

time.value = prettyDate(datePassed)

const parsedComment = ref<string>(props.comment)
let emojis = props.comment.match(/&(\d{2})/g) // Match any emojis and spaces
let isEmojisOnly = (emojis ?? []).join("") == props.comment

if (emojis != null) {
  emojis.forEach(async emoji => {
    let emojiLink = `${import.meta.env.BASE_URL}/emoji/${emoji.slice(1)}.webp`
    parsedComment.value = parsedComment.value.replaceAll(emoji, `<img class="inline ${isEmojisOnly ? 'w-8' : 'w-5'} pointer-events-none" src="${emojiLink}" alt="">`)
  });
} else parsedComment.value = props.comment
parsedComment.value = parsedComment.value.replace(/\n/g, "<br>")

const color = computed(() => {
  if (SETTINGS.value.disableColors)
    return chroma.hex(getComputedStyle(document.documentElement).getPropertyValue("--primaryColor"))
  else
    return props.bgcolor
})

</script>

<template>
    <section class="relative mb-2 w-full break-words">
      <div v-if="uid == '-2'" class="bg-[url(@/images/flames.webp)] absolute z-10 opacity-40 mix-blend-hard-light bottom-0 left-0 w-full h-full bg-repeat-x bg-contain"></div>
      <header class="flex gap-2 items-center">
        <ProfilePicture class="w-11 pointer-events-none" :uid="pfp" :cutout="cutout" />
        <div class="inline">
          <h3 class="text-lg font-bold leading-4">{{ username }}</h3>
          <h5 class="text-xs opacity-50 cursor-help" :title="dateString">{{ time }}</h5>
        </div>
      </header>
      <article class="overflow-y-auto p-1 mt-1 max-h-32 rounded-md border-4 border-solid" :style="{borderColor: color , boxShadow: `0px 0px 10px ${color}`, backgroundColor: chroma(color).darken(4).hex() }" v-html="parsedComment"></article>
    </section>
</template>
