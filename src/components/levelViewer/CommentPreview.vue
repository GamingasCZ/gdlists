<script setup lang="ts">
import { prettyDate } from '@/Editor'
import chroma from 'chroma-js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
  avatar_hash: string
  id: string
}

const props = defineProps<CommentFetchResponse>()

const pfp = ref<string>("")
const username = ref<string>("")

// Old users
if (props.username != "") {
  import("@/images/oldPFP.png").then(res => pfp.value = res.default)
  username.value = props.username
}

props.userArray.forEach(user => {
  if (user.id == props.uid) {
    let img = new Image()
    img.src = `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar_hash}.png`
    img.addEventListener("load", () => pfp.value = img.src)
    img.addEventListener("error", () => import("@/images/defaultPFP.webp").then(res => pfp.value = res.default))

    username.value = user.username
  }
});

const time = ref<string>("")
const datePassed = Math.floor(Date.now()/1000 - parseInt(props.timestamp))
const dateString = ref<string>(`${new Date(parseInt(props.timestamp)*1000).toLocaleDateString()} ${new Date(parseInt(props.timestamp)*1000).toLocaleTimeString()}`)

time.value = prettyDate(datePassed)

const parsedComment = ref<string>(props.comment)
let emojis = props.comment.match(/&(\d{2})/g)
if (emojis != null) {
  emojis.forEach(async emoji => {
    let fetch = await import(`../../images/emoji/${emoji.slice(1)}.webp`).then(res => res.default)
    parsedComment.value = parsedComment.value.replaceAll(emoji, `<img class="inline w-5 pointer-events-none" src="${fetch}" alt="">`)
  });
} else parsedComment.value = props.comment
parsedComment.value = parsedComment.value.replace(/\n/g, "<br>")

</script>

<template>
    <section class="mb-2 w-full break-words">
      <header class="flex gap-2 items-center">
        <img :src="pfp" class="w-11 rounded-full pointer-events-none" alt="">
        <div class="inline">
          <h3 class="text-lg font-bold leading-4">{{ username }}</h3>
          <h5 class="text-xs opacity-50 cursor-help" :title="dateString">{{ time }}</h5>
        </div>
      </header>
      <article class="overflow-y-auto p-1 mt-1 max-h-32 rounded-md border-4 border-solid" :style="{borderColor: bgcolor , boxShadow: `0px 0px 10px ${bgcolor}`, backgroundColor: chroma(bgcolor).darken(4).hex() }" v-html="parsedComment"></article>
    </section>
</template>