import { ref } from "vue"
import { DEFAULT_LEVELLIST } from "./Editor"
import type { ReviewList, ReviewRating } from "./interfaces"

export const REVIEW_EXTRAS: ReviewList = {
    tagline: "",
    containers: [],
    ratings: [],
    settings: [],
    rateTheme: 0,
    private: false,
    transparentPage: false,
    disabledRatings: false,
}

export const reviewData = ref({...DEFAULT_LEVELLIST, ...REVIEW_EXTRAS})

export const DEFAULT_RATINGS = ref<ReviewRating[]>([
    {
        name: "Gameplay",
        rating: 0,
        color: [0, 0, 0]

    },
    {
        name: "Dekorace",
        rating: 0,
        color: [0, 0, 0]
    },
    {
        name: "Obtížnost",
        rating: 0,
        color: [0, 0, 0]
    },
    {
        name: "Gameplay",
        rating: 0,
        color: [0, 0, 0]
    },
])