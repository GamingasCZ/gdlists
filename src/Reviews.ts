import { ref } from "vue"
import { DEFAULT_LEVELLIST } from "./Editor"

export const REVIEW_EXTRAS = {
    tagline: "",
    containers: [],
    ratings: [],
    settings: []
}

export const reviewData = ref({...DEFAULT_LEVELLIST, ...REVIEW_EXTRAS})