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
    reviewName: "",
    tagline: "",
    containers: [],
    ratings: [],
    defaultRatings: DEFAULT_RATINGS,
    settings: [],
    rateTheme: 0,
    private: false,
    transparentPage: 0,
    language: 0,
    whitePage: false
}

export const DEFAULT_REVIEWDATA = () => ({...DEFAULT_LEVELLIST, ...REVIEW_EXTRAS})
export const reviewData = ref(DEFAULT_REVIEWDATA())


export function checkReview() {
    const err = (err: string) => ({success: false, error: err})
    if (reviewData.value.reviewName.length < 3) return err('Jméno recenze je moc krátké!')
    if (reviewData.value.reviewName.length > 30) return err('Jméno recenze je moc dlouhé!')

    if (!reviewData.value.containers.length) return err('')
}

export const selectedNestContainer= ref(0)
export const flexNames = {left: "start", center: "center", right: "end", justify: "left"}