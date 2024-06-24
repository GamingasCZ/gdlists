<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { inject } from 'vue';
import { watch } from 'vue';
import Resizer from '../global/Resizer.vue';
import CollabViewerMember from '../editor/CollabViewerMember.vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: string
    editable: boolean
}>()


watch(props, () => {
    switch (props.buttonState) {
        case "pick":
            dialogs.userAdder = [true, props.index]
            break;
    }
    emit("clearButton")
})

const dialogs = inject("openedDialogs")

</script>

<template>
    <ContainerHelp @click="dialogs.userAdder = [true, index]" v-show="imageLoading != 0" v-if="editable" icon="showCollab">
        <span>{{ $t('reviews.pickUsers') }}</span>
    </ContainerHelp>

    <section>
        <CollabViewerMember v-for="user in settings.users" />
    </section>
</template>