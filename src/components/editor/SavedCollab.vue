<script setup lang="ts">
import { makeColorFromString, parseElapsed, prettyDate } from '@/Editor';
import type { SavedCollab } from '@/interfaces'
import chroma, { type Color } from 'chroma-js';
import { computed, inject, reactive, ref } from 'vue'
import PlayerIcon from '../global/PlayerIcon.vue';


const props = defineProps<{
    collIndex?: number;
    save: SavedCollab;
    inUse: boolean;
    onSavesPage: boolean;
    small?: boolean
}>()

const emit = defineEmits<{
    (e: "doSave"): void,
    (e: "loadCollab", data: SavedCollab, index: number): void,
    (e: "removeCollab", object: SavedCollab): void
    (e: "openCollab", index: SavedCollab)
}>()

const saveColor = ref<Color>(makeColorFromString(props.save.collabName));

const editing = ref(false)
const openCollabTools = inject("openCollabTools")


const getGradient = () =>
  `linear-gradient(90deg, ${saveColor.value.darken(
    2
  )}, ${saveColor.value.darken()}, ${saveColor.value.brighten()})`;

const uploadDate = reactive(new Date(props.save.timestamp!));
const creatorsText = computed(() => {
    let host = props.save.collabHost || "Nepojmenovaný"
    if (props.save.memberCount > 0)
        host += ` a ${props.save.memberCount} dalších`
    return host
})

const creators = ref((() => {
    let c = props.save.data[2].slice(0, props.small ? 10 : 12)
    let verifiedCreators = c.map(x => {
        if (x.verified) return x.verified
        else return null
    })
    return verifiedCreators
})())

const host = ref((() => {
    let c = props.save.data[0]
    if (c[0]?.verified)
        return c[0]?.verified
    else
        return null
})())


const copying = ref(false)
const copyID = () => {
    navigator.clipboard.writeText(props.save.levelID)
    copying.value = true
    setTimeout(() => {
        copying.value = false
    }, 1000);
}
const postLink = computed(() => {
    if (!props.save.listID) return ''
    
    let isReview = props.save?.listID[2] ? '/review' : ''
    return `${isReview}/${props.save?.listID[0]}?goto=${props.save?.listID[1]}`
})
</script>

<template>
  <button
    class="flex flex-col focus-within:outline outline-4 outline-lof-400 min-w-64 w-full text-left max-w-96 cursor-pointer relative rounded-lg overflow-clip border-solid bg-[length:150vw] bg-center text-white group transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(saveColor),
      borderColor: saveColor.darken(2).hex(),
    }"
    @click="onSavesPage ? openCollabTools(save) : ''"
  >
    
    <div class="relative w-full h-36 bg-cover">
      <div class="flex flex-wrap gap-x-2 justify-center items-center px-4 w-full h-36" :style="{background: `linear-gradient(${saveColor.darken(4).hex()}, ${saveColor.darken(3).hex()})`}">
        <template v-for="icon in creators">
            <img v-if="icon == null" src="@/images/unknownCube.svg" class="w-12" alt="">
            <PlayerIcon v-else
                :icon="icon[0]" :col1="icon[1]" :col2="icon[2]" :glow="icon[3]" :quality="1"
                class="inline-block mr-2 w-12 h-12 align-middle"
            />
        </template>
      </div>
      <div :style="{background: `linear-gradient(0deg, ${saveColor.darken().hex()}, transparent)`}" class="absolute bottom-0 w-full h-8 transition-colors duration-200 group-hover:brightness-50"></div>
      <div class="flex absolute top-2 right-2 left-2 gap-2 justify-between text-base opacity-0 transition-opacity duration-75 group-hover:opacity-100">
        <button v-if="!copying && save.levelID && save.levelID != '-1' && onSavesPage" @click.stop="copyID" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm button h-max">
            <img src="../../images/levelIcon.svg" alt="" class="inline mr-2 w-4" />
            <span>{{ $t('level.levelID') }}: {{ save.levelID }}</span>
        </button>
        <div v-else-if="copying" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm button h-max">
            <img src="../../images/copy.svg" alt="" class="inline mr-2 w-4 animate-pulse" />
            <span class="animate-pulse">{{ $t('other.copied') }}</span>
        </div>

        <RouterLink v-if="save.listID && onSavesPage" :to="postLink" @click.stop.prevent="" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm button h-max">
            <img src="../../images/browseMobHeader.svg" alt="" class="inline mr-2 w-4" />
            <span>{{ save.listID?.[2] ? $t('reviews.review') : $t('other.list')  }}</span>
        </RouterLink>

        <div @click.stop.prevent="emit('loadCollab', save, collIndex)" v-if="!inUse && !onSavesPage" class="absolute left-0 top-24 px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm button h-max">
            <img src="../../images/edit.svg" alt="" class="inline mr-2 w-4" />
            <span>{{ $t('level.edit') }}</span>
        </div>

        <div @click.stop.prevent="emit('removeCollab', save!)" v-if="!inUse" class="absolute right-0 top-24 px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm button h-max">
            <img src="../../images/trash.svg" alt="" class="inline mr-2 w-4" />
            <span>{{ $t('other.delete') }}</span>
        </div>
    </div>
        <!-- <div v-if="levelCount" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm h-max">
            <span>{{ levelCount }} {{ $t('other.levels', [levelCount]) }}</span>
        </div>
      </div>
      
       <div class="grid absolute inset-2 grid-rows-2 gap-2 text-xl">
        <button @click.stop="" class="bg-black bg-opacity-90 rounded-md outline-white outline-2 focus-within:outline button"><img src="@/images/reviews.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickReview') }}</button>
        <button @click.stop="" class="bg-black bg-opacity-90 rounded-md outline-white outline-2 focus-within:outline button"><img src="@/images/searchOpaque.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickLevels') }}</button>
      </div> -->
    </div>

    <section class="flex overflow-hidden flex-col justify-between items-start m-1 h-full">
      <div class="flex items-center">
        <h2 class="text-xl font-bold leading-tight">{{ save.collabName }}</h2>
      </div>
      <div class="flex gap-2 items-center mt-1">
        <!-- <ProfilePicture class="w-11" :uid="creatorData?.discord_id ?? -2" :cutout="creatorData.pfp_cutout" /> -->
        <img v-if="host == null" src="@/images/unknownCube.svg" class="w-9" alt="">
        <PlayerIcon v-else
            :icon="host[0]" :col1="host[1]" :col2="host[2]" :glow="host[3]" :quality="1"
            class="inline-block w-9 h-9 align-middle"
        />
        <div>
          <h3 class="text-base leading-tight">{{ creatorsText }}</h3>
          <h4 class="text-xs opacity-70 cursor-help" :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`">{{ prettyDate(((new Date()).getTime() - uploadDate.getTime())/1000) }}</h4>
        </div>
      </div>
    </section>

    <div v-if="inUse" class="absolute right-1 bottom-1 opacity-50 invert-[0.1] mix-blend-color-dodge">
      <img src="@/images/checkThick.svg" class="w-12" alt="">
    </div>
  </button>
</template>