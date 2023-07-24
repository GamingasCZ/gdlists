<script setup lang="ts">
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

if (datePassed < 5) time.value = useI18n().t('date.fewSecsAgo')
else if (datePassed <= 60) time.value = useI18n().t('date.secs', datePassed)
else if (Math.floor(datePassed/60) == 1) time.value = useI18n().t('date.mins', [Math.floor(datePassed/60)])
else if (Math.floor(datePassed/60) <= 60) time.value = useI18n().t('date.mins', [Math.floor(datePassed/60)])
else if (Math.floor(datePassed/3600) == 1) time.value = useI18n().t('date.hours', [Math.floor(datePassed/3600)])
else if (Math.floor(datePassed/3600) <= 24) time.value = useI18n().t('date.hours', [Math.floor(datePassed/3600)])
else if (Math.floor(datePassed/86400) == 1) time.value = useI18n().t('date.days', [Math.floor(datePassed/86400)])
else if (Math.floor(datePassed/86400) <= 7) time.value = useI18n().t('date.days', [Math.floor(datePassed/86400)])
else if (Math.floor(datePassed/604800) == 1) time.value = useI18n().t('date.weeks', [Math.floor(datePassed/604800)])
else if (Math.floor(datePassed/604800) <= 4) time.value = useI18n().t('date.weeks', [Math.floor(datePassed/604800)])
else if (Math.floor(datePassed/2419200) <= 4) time.value = useI18n().t('date.months', [Math.floor(datePassed/2419200)])
else time.value = useI18n().t('date.months', [Math.floor(datePassed/2419200)])

const parsedComment = ref<string>("")
parsedComment.value = props.comment.replace(/&(\d{2})/g, '<img class="inline w-5 pointer-events-none" src="' + new URL(`../../images/emoji/$1.webp`, import.meta.url).href + '" alt="">')

</script>

<template>
    <section class="mb-2">
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