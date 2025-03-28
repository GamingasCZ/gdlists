<script setup lang="ts">
import { currentCutout, currentUID } from '@/Editor';
import ProfilePicture from '../global/ProfilePicture.vue';
import { Limit } from '@/assets/limits';

defineProps<{
    editable: boolean
    uid?: string
    cutout?: number
    text?: string
    dark?: boolean
}>()

const commentary = defineModel({default: ""})

</script>

<template>

<section class="flex flex-col mb-4">
    <div class="flex relative group">
        <ProfilePicture
            :uid="uid ?? currentUID" :cutout="cutout ?? currentCutout"
            class="w-11 h-max"
        />
        <img src="@/images/play.svg" :class="{'invert': !dark && !editable, '!opacity-60': !editable}" class="absolute top-0.5 left-10 w-7 opacity-5 pointer-events-none group-focus-within:opacity-10 -scale-x-100" alt="">
        <textarea v-if="editable" v-model="commentary" rows="3" :disabled="!editable" :maxlength="Limit.COMMENTARY_MAXLEN"
            class="p-2 py-1 ml-4 leading-relaxed bg-white bg-opacity-5 rounded-md outline-none resize-none group-focus-within:bg-opacity-10 grow"
            :placeholder="$t('editor.commPlaceholder')"
        ></textarea>
        <article v-else class="p-2 py-1 ml-4 leading-relaxed bg-opacity-60 rounded-md grow" :class="{'bg-black': !dark, 'bg-white': dark}">{{ text }}</article>
    </div>
    <div v-if="editable" class="ml-auto text-lg"
        :class="{
            'text-red-800': commentary.length == Limit.COMMENTARY_MAXLEN,
            'text-red-200': commentary.length >= 100 && commentary.length < 200,
            'text-red-400': commentary.length >= 200 && commentary.length < 250,
        }">
        <span style="text-shadow: 1px 1px 5px #000A;">{{ commentary.length }}/{{ Limit.COMMENTARY_MAXLEN }}</span>
    </div>

</section>

</template>