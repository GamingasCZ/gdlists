import { ref } from "vue"
import { DEFAULT_LEVELLIST } from "./Editor"
import type { ReviewList, ReviewRating } from "./interfaces"

export const DEFAULT_RATINGS = ref<ReviewRating[]>([
    {
        name: "Gameplay",
        rating: 5,
        color: [0, 0.74, 0.52]
    },
    {
        name: "Dekorace",
        rating: 5,
        color: [90, 0.74, 0.52]
    },
    {
        name: "Obtížnost",
        rating: 5,
        color: [180, 0.74, 0.52]
    },
    {
        name: "Gameplay",
        rating: 5,
        color: [270, 0.74, 0.52]
    },
])

export const REVIEW_EXTRAS: ReviewList = {
    tagline: "",
    containers: [],
    ratings: [],
    defaultRatings: DEFAULT_RATINGS,
    settings: [],
    rateTheme: 0,
    private: false,
    transparentPage: 0,
    language: 0
}

export const reviewData = ref({...DEFAULT_LEVELLIST, ...REVIEW_EXTRAS})

export const selectedNestContainer= ref(0)
export const flexNames = {left: "start", center: "center", right: "end", justify: "left"}