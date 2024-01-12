<script setup lang="ts">
import chroma from 'chroma-js';
import { nextTick, onMounted, ref } from 'vue';
import offsets from "../../images/icons/offsets.json";
import colors from "../../images/icons/colors.json";
import { SETTINGS } from "@/siteSettings";

const props = defineProps<{
    icon: number
    col1: string
    col2: string
    glow: string
    quality: number
    iconDisabled?: boolean
}>()

let quality = SETTINGS.value.iconQuality < 0 ? 4 : props.quality*SETTINGS.value.iconQuality
const canvas = ref<HTMLCanvasElement>()
let visibleCtx: CanvasRenderingContext2D;
let suffixes = ["_glow","_2", "","_extra"]
let images: object = {}
const iconIndex = props.icon.toString().padStart(2,"0")
const offscreenCanvases: OffscreenCanvas = new OffscreenCanvas(128/quality,128/quality)

function placeImage(image:HTMLImageElement | null) {
    if (image == null) return
    let imageIndex = parseInt(image.dataset.index!)
    let ctx = offscreenCanvases.getContext('2d')
    if (ctx == undefined) return
    if (!props.glow && suffixes[imageIndex] == '_glow') {
        return offscreenCanvases.transferToImageBitmap()
    }
    
    let iconPath = `${iconIndex}${suffixes[imageIndex]}`
    let iconOffset = offsets[iconPath][0] == 0 ? [0,0] : offsets[iconPath][0]
    ctx.drawImage(
        image,
        
        // Place in the middle and apply offset
        (128/quality-offsets[iconPath][1][0]/quality)/2+iconOffset[0]/quality,
        (128/quality-offsets[iconPath][1][1]/quality)/2-iconOffset[1]/quality,
        
        // Apply scaling
        offsets[iconPath][1][0]/quality,
        offsets[iconPath][1][1]/quality,
    );

    const imageData = ctx.getImageData(0, 0, offscreenCanvases.width, offscreenCanvases.height);
    const data = imageData.data;

    if (imageIndex != 3 && SETTINGS.value.iconQuality > 0) { // Extras are always white
        let newCol;
        // Recoloring icon parts
        for (let j = 0; j < data.length; j += 4) {
            if (j % 4 == 0) // Optimization
                newCol = chroma.blend(chroma.rgb(data[j], data[j+1], data[j+2]), colors[[props.glow, props.col1, props.col2][imageIndex]], 'multiply').rgb()
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
    suffixes.forEach(async suffix => {
            if (offsets[`${iconIndex}${suffix}`]) {// Don't do shit if image doesn't exist
                let image = new Image()
                image.src = import.meta.env.BASE_URL + `/icons/player_${iconIndex}${suffix}_001.webp`

                image.dataset.index = (i).toString()
                i += 1
                
                image.addEventListener("load", () => {
                    images[suffix] = image
                    drawOnVisibleCanvas()
                })
            }
            else {
                images[suffix] = null
                drawOnVisibleCanvas()
            }
    })
})

let imagesLoaded = 0
function drawOnVisibleCanvas() {
    imagesLoaded += 1
    if (imagesLoaded == 4) {
        nextTick(() => suffixes.forEach(suffix => {
            if (images[suffix]) visibleCtx.drawImage(placeImage(images[suffix])!, 0, 0)
        }))
    }
}
</script>

<template>
    <canvas v-if="SETTINGS.iconQuality != -2 && !iconDisabled" :width="128/quality" :height="128/quality" ref="canvas"></canvas>
    <div class="min-w-[8px] min-h-[8px] rounded-md" :style="{backgroundColor: `rgb(${colors[col1].join(', ')})`}" v-else></div>
</template>