<script setup lang="ts">
import chroma from 'chroma-js';
import { onMounted, ref } from 'vue';
import offsets from "../../../public/icons/offsets.json";
import colors from "../../../public/icons/colors.json";

const props = defineProps<{
    icon: number
    col1: string
    col2: string
}>()

const quality = 2

const canvas = ref<HTMLCanvasElement>()
let visibleCtx: CanvasRenderingContext2D;
let suffixes = ["glow_001","2_001", "001","extra_001"]
let images: object = {}
const iconIndex = props.icon.toString().padStart(2,"0")
const offscreenCanvases: OffscreenCanvas = new OffscreenCanvas(128/quality,128/quality)

function placeImage(image:HTMLImageElement | null) {
    if (image == null) return
    let imageIndex = parseInt(image.dataset.index!)
    let ctx = offscreenCanvases.getContext('2d')
    if (ctx == undefined) return

    let iconPath = `player_${iconIndex}_${suffixes[imageIndex]}.png`
    ctx.drawImage(
        image,
        
        // Place in the middle and apply offset
        (128/quality-offsets[iconPath].spriteSize[0]/quality)/quality+offsets[iconPath].spriteOffset[0]/quality,
        (128/quality-offsets[iconPath].spriteSize[1]/quality)/quality-offsets[iconPath].spriteOffset[1]/quality,
        
        // Apply scaling
        offsets[iconPath].spriteSize[0]/quality,
        offsets[iconPath].spriteSize[1]/quality,
    );

    const imageData = ctx.getImageData(0, 0, offscreenCanvases.width, offscreenCanvases.height);
    const data = imageData.data;

    if (imageIndex != 3) { // Extras are always white
        let newCol;
        // Recoloring icon parts
        for (let j = 0; j < data.length; j += 4) {
            if (j % 4 == 0) // Optimization
                newCol = chroma.blend(chroma.rgb(data[j], data[j+1], data[j+2]), imageIndex == 2 ? colors[props.col1] : colors[props.col2], 'multiply').rgb()
            data[j] = newCol[0];
            data[j + 1] = newCol[1]
            data[j + 2] = newCol[2]
        }
    }

    ctx.putImageData(imageData, 0,0)

    return offscreenCanvases.transferToImageBitmap()
}

onMounted(() => {
    visibleCtx = canvas.value?.getContext("2d")!
    if (visibleCtx == undefined) return

    let i = 0
    suffixes.forEach(suffix => {
        let image = new Image()
        image.src = new URL(`/public/icons/player_${iconIndex}_${suffix}.webp`, import.meta.url).href;
        image.dataset.index = (i).toString()
        i += 1

        image.onload = () => {
            images[suffix] = image
            drawOnVisibleCanvas()
        }
        image.onerror = () => {
            images[suffix] = null
            drawOnVisibleCanvas()
        }
    })
})

let imagesLoaded = 0
function drawOnVisibleCanvas() {
    imagesLoaded += 1
    if (imagesLoaded == 4) {
        visibleCtx.drawImage(placeImage(images['2_001'])!, 0, 0)
        visibleCtx.drawImage(placeImage(images['glow_001'])!, 0, 0)
        visibleCtx.drawImage(placeImage(images['001'])!, 0, 0)
        visibleCtx.drawImage(placeImage(images['extra_001'])!, 0, 0)
    }
}
</script>

<template>
    <canvas :width="128/quality" :height="128/quality" ref="canvas"></canvas>
</template>