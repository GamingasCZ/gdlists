<script setup lang="ts">
import { createPopper, type Instance } from '@popperjs/core';
import { onMounted, onUnmounted, ref } from 'vue';
import EditorTag from './EditorTag.vue';
import { lastUsedTags } from '@/Editor';


const props = defineProps<{
    filteredTags: [number, string][]
    tagbox: HTMLDivElement
}>()

const emit = defineEmits<{
    (e: "add", ind: number): void
}>()

const dropdown = ref<HTMLDivElement>()

var popper: Instance
onMounted(() => {
    popper = createPopper(props.tagbox, dropdown.value, {
        placement: 'bottom',
        modifiers: [{name: 'flip', enabled: false}]
    })
})

const updateDropdown = () => {if (popper) popper.forceUpdate()}

const addTag = (ind: number) => {
    emit('add', ind)
    
}

onUnmounted(() => popper.destroy())

defineExpose({
    updateDropdown
})

</script>

<template>
    <div ref="dropdown" @mousedown.prevent="" class="flex z-10 gap-2 p-2 w-full text-white max-w-[52.8rem] bg-black bg-opacity-70">
        <div class="flex flex-col gap-1 mr-3 min-w-36">
            <h3 class="text-xl text-white text-opacity-20">{{ $t('editor.lastUsed') }}</h3>
            <EditorTag
                v-for="tag in lastUsedTags"
                @click="addTag(tag[0])"
                :tag="[tag, -1, '']" selectable plus />
        </div>
        <div class="flex flex-wrap gap-2 items-start place-content-start h-max min-h-28">
            <EditorTag
                v-for="tag in filteredTags"
                @click="addTag(tag[0])"
                :tag="[tag[0], -1, '']" selectable plus />
        </div>
    </div>
</template>