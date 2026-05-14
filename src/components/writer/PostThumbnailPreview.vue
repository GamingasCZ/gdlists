<script setup lang="ts">
import type { PostData } from '@/interfaces';
import ReviewPreview from '../global/ReviewPreview.vue';
import { currentCutout } from '@/Editor';
import { parseLocalReviewRatings } from '@/Reviews';

defineProps<{
    data: PostData
    isList: boolean
}>()

const username = JSON.parse(localStorage.getItem("account_info")!)
</script>

<template>
    <div class="flex bg-[url(@/images/fade.svg)] bg-repeat-x justify-center py-8 w-full bg-black bg-opacity-40">
        <ReviewPreview
            :name="data.reviewName || $t('other.unnamesd')"
            :tagline="data.tagline"
            views="1"
            :uid="username[1]"
            :user-array="[{username: username[0], discord_id: username[1], pfp_cutout: currentCutout}]"
            :thumbnail="data.thumbnail[0]"
            :thumb-props="JSON.stringify(data.thumbnail.slice(1))"
            :timestamp="Date.now()/1000"
            :diff-guesser="data.diffGuesser[0]"
            :review-details="parseLocalReviewRatings(data)"
            disable-link
            :hidden="0"
            :is-list="isList"
            :index="0"
            id="69"
        ></ReviewPreview>
    </div>
</template>