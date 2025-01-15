import ReviewHelp from "@/components/writer/ReviewHelp.vue"
import { i18n } from "@/locales"
import { checkReview, DEFAULT_REVIEWDATA } from "@/Reviews"

/**
 * Configuration object for a writer
 * @property {Object} general - 
 * @property {Object} settings - All options that will form the settings menu
 * @property {Object} toolbar - Defines all buttons inside the writer toolbar
 * @property {Object} drafts - 
 */
const REVIEW = {
    general: {
        /**
         * A key used while uploading a post for discerning kinds of posts
        */
        postType: "review",
        /**
        * A function that returns a new instance of 
        */
        postObject: DEFAULT_REVIEWDATA,
        /**
         * Placeholder text for the post name
         */
        titlePlaceholder: i18n.global.t('reviews.reviewName'),
        allowTagline: true,
        placeholderTaglines: [
            i18n.global.t('reviews.p1'),
            i18n.global.t('reviews.p2'),
            i18n.global.t('reviews.p3'),
            i18n.global.t('reviews.p4'),
            i18n.global.t('reviews.p5'),
            i18n.global.t('reviews.p6'),
        ],
        /**
         * 
         */
        allowLevels: true,
        allowWriter: true,
        /**
         * Vue component, displayed when the writer is empty
         */
        writerHelp: ReviewHelp,
        /**
         * A function that gets called before uploading, that checks if a post is valid
         * @param {Object} postObject - The post
         * @return {Object} success - s
         */
        clientPostValidation: checkReview,

    },
    settings: [
        i18n.global.t('other.general'),

    ],
    dialogs: [

    ],
    toolbar: {
        left: [
            {
                title: "",
                icon: "",
                splitAfter: true,
            }
        ],
        right: [

        ]
    },
    drafts: {
        storageKey: "reviewDrafts"
    }
}

export default REVIEW