<script setup lang="ts">
import { diffScaleOffsets } from '@/Editor';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
    difficulty: number
    rating: number
}>()

const icon = ref<HTMLCanvasElement>()
let visibleCtx: CanvasRenderingContext2D;

const WIDTH = 72
const HEIGHT = 72

function placeImage(image:HTMLImageElement | null, scale: [number, number], offset: [number, number]) {
    if (image == null) return
    visibleCtx.drawImage(image, (WIDTH - image.width*scale[0]) / 2 + offset[0], (HEIGHT - image.height*scale[1]) / 2 + offset[1], image.width*scale[0], image.height*scale[1])
}

const rateNames = ["Unrated", "Star Rated", "Featured", "Epic", "Legendary", "Mythic"]
const diffNames = ["N/A", "Easy", "Normal", "Hard", "Harder", "Insane", "Easy Demon", "Medium Demon", "Hard Demon", "Insane Demon", "Extreme Demon", "Auto"]

function draw() {
    visibleCtx = icon.value?.getContext("2d")!
    if (visibleCtx == undefined) return
    visibleCtx.reset()

    const drawFace = () => new Promise((res, _) => {
        // Difficulty face
        let diff = new Image()
        diff.src = import.meta.env.BASE_URL + `/faces/${props.difficulty}.webp`
        diff.onload = () => {
            if (props.rating)
                if (props.difficulty > 6 && props.difficulty < 11)
                    placeImage(diff, [0.8 * diffScaleOffsets[props.difficulty - 6], 0.8 * diffScaleOffsets[props.difficulty - 6]], [0, 3]) // Rated - make room for rating
                else
                    placeImage(diff, [0.8, 0.8], [0, 3]) // Rated - make room for rating
            else
                placeImage(diff, [1, 1], [0,0]) // Unrated - bigger
            res(true)
        }

    })

    if (props.rating > 1) {
        let rating = new Image()
        rating.src = import.meta.env.BASE_URL + `/faces/${['star', 'featured', 'epic', 'legendary', 'mythic'][props.rating - 1]}.webp`
        rating.onload = () => {
            switch (props.rating) {
                case 2: // Featured glow
                    placeImage(rating, [1.6, 1.6], [0,3]); break;
                case 5: // Mythic
                    placeImage(rating, [1.5, 1.5], [-1,0]); break;
                default:
                    placeImage(rating, [1.6, 1.6], [0,0]); break;
                }
            drawFace()
        }
    }
    // Star rate
    else if (props.rating == 1) {
        drawFace().then(() => {
            let rating = new Image()
            rating.src = import.meta.env.BASE_URL + `/faces/star.webp`
            rating.onload = () => {
                placeImage(rating, [1.2, 1.2], [WIDTH/4,HEIGHT/4])
            }
        })
        
    }
    else drawFace()
}

onMounted(draw)
watch(props, draw)

</script>

<template>
    <canvas :title="`${rateNames[rating]} ${diffNames[difficulty]}`" :width="WIDTH" :height="HEIGHT" ref="icon"></canvas>
</template>