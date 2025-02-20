import GuesserSetting from "@/components/editor/GuesserSetting.vue"
import ColumnSettingsButton from "@/components/writer/ColumnSettingsButton.vue"
import ReviewHelp from "@/components/writer/ReviewHelp.vue"
import SettingsDescription from "@/components/writer/SettingsDescription.vue"
import { checkList, DEFAULT_LEVELLIST, getListPreview } from "@/Editor"
import type { LevelList, PostData, ReviewList, Setting } from "@/interfaces"
import { i18n } from "@/locales"
import { checkReview, DEFAULT_REVIEWDATA, getReviewPreview } from "@/Reviews"
import type { Component } from "vue"

export enum Key {
    None = 0,
    Ctrl = 1,
    Shift = 2,
    Alt = 4
}

const LANGUAGES = [[i18n.global.t('settingsMenu.czech'), "cs"],
                   [i18n.global.t('settingsMenu.english'), "en"],
                   [i18n.global.t('other.german'), "de"],
                   [i18n.global.t('other.spanish'), "es"],
                   [i18n.global.t('other.korean'), "ko"],
                   [i18n.global.t('other.russian'), "ru"],
                   [i18n.global.t('other.other'), "ot"]]

export const FONTS: [string, number][] = [["Poppins", 0],
               ["Serif", 1],
               ["Sans-Serif", 2],
               ["Monospace", 3],
               ["Systémové", 4],
               ["Pusab", 5]]
type Post = 'list' | 'review'
type PostKeys = keyof (ReviewList & LevelList)
export type ToolbarAction = 'add' | 'preview' | 'align' | 'add' | 'column' | 'format' | 'splitParagraph'

export interface ToolbarButton {
    /**
     * Text under the icno
    */
    title?: string,
    /**
     * Text that appears on button hover
     */
    tooltip?: string,
    /**
     * The button's icon or an array of possible icons, based on the dropdown parameter
     */
    icon: string | string[],
    /**
     * Causes a dropdown to appear on button press. The parameter is a string array with options
     */
    dropdownText?: string[],
    /**
     * The action the button will cause on press
     */
    action?: [ToolbarAction, any],
    /**
     * Global shortcut that get's called no mater the toolbar
     */
    shortcut?: [Key, string] | [Key, string][],
    /**
     * Shortcuts that gets called only, if its button is in the current toolbar
     */
    shortcutFixed?: [Key, string] | [Key, string][],
    /**
     * Creates a vertical splitter after the button
     */
    splitAfter?: boolean,
    /**
     * Makes the title font bold
     */
    bold?: boolean
    /**
     * Array of 2 numbers that add a left margin to the button
     * Index 0 - Left margin in regular toolbar
     * Index 1 - Left margin in COMPACT toolbar
     */
    leftOffset?: [number, number]
    /**
     * Vue component used as icon
     */
    component?: Component
}

/**
 * Configuration object for a writer
 * @property {Object} general - 
 * @property {Object} settings - All options that will form the settings menu
 * @property {Object} toolbar - Defines all buttons inside the writer toolbar
 * @property {Object} drafts - 
 */
export interface Writer {
    general: {
        /**
         * A key used while uploading a post for discerning kinds of posts
        */
        postType: Post
        /**
         * The route the user is redirected to, after uploading/updating a post.
         * A dollar sign is used as a placeholder for the post ID.
         */        
        redirectBase: string
        /**
        * A function that returns a new instance of a post
        */
        postObject: () => ReviewList | LevelList
        /**
         * Title for the webbrowser tab
         */
        tabTitle: string
        /**
         * Placeholder text for the post name
         */
        titlePlaceholder: string
        /**
         * Shows/hides the option to add a tagline
         */
        allowTagline: boolean
        /**
         * Placeholder text that appears when adding a tagline
         */
        placeholderTaglines: string[]
        /**
         * Shows/hides the level section
         */
        allowLevels: boolean
        /**
         * Limit of the amount of levels that can be added
         */
        maxLevels: number
        /**
         * Decides if a level can be given a rating
         */
        levelRating: boolean
        /**
         * Text which appears as help, in the Levels section
         */
        levelsSubtext: string
        /**
         * Shows/hides the main writer
         */
        allowWriter: boolean
        /**
         * Vue component, displayed when the writer is empty
         */
        writerHelp: Component
        /**
         * A function that gets called before uploading, that checks if a post is valid
         * @param {Object} postObject The post
         * @returns {Object} success - s
         */
        clientPostValidation: (postObject: PostData) => {success: boolean, error: string}
    },
    settings: {[setting: string]: (Setting & {affects: PostKeys}) | string},
    toolbar: {
        [toolbarName: string]: {
            left?: ToolbarButton[]
            right?: ToolbarButton[]
        }
    }
    drafts: {
        /**
         * Local storage key, under which the drafts are stored
         */
        storageKey: string
        /**
         * Function for parsing the post that returns a draft preview.
         * @param postObject The post
         * @returns {Object} Title, description and extras of the post draft
         */
        parsePreview: (postObject: PostData) => {title: string, preview: string, counter: number}
        /**
         * Translation key for the preview counter
         */
        counterLangKey: string
        /**
         * Function that checks if a draft can be saved
         * @param postObject The post
         */
        draftabilityConstraint: (postObject: PostData) => boolean
    }

}

export const LIST: Writer = {
    general: {
        postType: "list",
        redirectBase: "/$",
        postObject: DEFAULT_LEVELLIST,
        tabTitle: i18n.global.t('editor.title'),
        titlePlaceholder: i18n.global.t('editor.levelName'),
        allowTagline: true,
        placeholderTaglines: [
            i18n.global.t('editor.tagl1'),
            i18n.global.t('editor.tagl2'),
            i18n.global.t('editor.tagl3'),
            i18n.global.t('editor.tagl4'),
            i18n.global.t('editor.tagl5'),
            i18n.global.t('editor.tagl6')
        ],
        allowLevels: true,
        maxLevels: 50,
        levelRating: false,
        levelsSubtext: i18n.global.t('editor.levToAdd'),
        allowWriter: false,
        clientPostValidation: checkList
    },
    settings: [
        i18n.global.t('other.general'),
        {
            name: i18n.global.t('editor.listDescription'),
            control: "component",
            controlOptions: SettingsDescription,
            affects: "description",
        },
        {
            name: i18n.global.t('editor.privateList'),
            control: "cbox",
            affects: "private",
        },
        {
            name: i18n.global.t('other.disableComments'),
            control: "cbox",
            affects: "disComments",
        },
        i18n.global.t('other.list'),
        {
            name: i18n.global.t('help.listGuessing'),
            desc: i18n.global.t('editor.diffGuessHelp'),
            control: "component",
            controlOptions: GuesserSetting,
            affects: "diffGuesser",
        },
        {
            name: i18n.global.t('editor.translucentCards'),
            desc: i18n.global.t('editor.translHelp'),
            control: "cbox",
            affects: "translucent",
        },
    ],
    drafts: {
        storageKey: "listDrafts",
        draftabilityConstraint(postObject: PostData) {
            return postObject.levels.length > 0
        },
        parsePreview: getListPreview,
        counterLangKey: 'other.levels'
    }
}

export const REVIEW: Writer = {
    general: {
        postType: "review",
        redirectBase: "/review/$",
        postObject: DEFAULT_REVIEWDATA,
        titlePlaceholder: i18n.global.t('reviews.reviewName'),
        tabTitle: i18n.global.t('reviews.reviewEditor'),
        allowTagline: true,
        placeholderTaglines: [
            i18n.global.t('reviews.p1'),
            i18n.global.t('reviews.p2'),
            i18n.global.t('reviews.p3'),
            i18n.global.t('reviews.p4'),
            i18n.global.t('reviews.p5'),
            i18n.global.t('reviews.p6'),
        ],
        allowLevels: true,
        maxLevels: 10,
        levelRating: false,
        levelsSubtext: i18n.global.t('reviews.levtoRev'),
        allowWriter: true,
        writerHelp: ReviewHelp,
        clientPostValidation: checkReview,

    },
    settings: [
        {
            name: i18n.global.t('reviews.private'),
            control: "cbox",
            affects: "private",
        },
        {
            name: i18n.global.t('other.disableComments'),
            control: "cbox",
            affects: "disComments",
        },
        {
            name: i18n.global.t('reviews.language'),
            control: "dropdown",
            controlOptions: LANGUAGES,
            affects: "language",
        },
    ],
    dialogs: [

    ],
    toolbar: {
        main: {
            left: [
                {
                    title: i18n.global.t('reviews.addParagraph'),
                    icon: "default",
                    action: ["add", "default"],
                    shortcut: [Key.Alt, 'F'],
                    splitAfter: true,
                    bold: true
                },
                {
                    title: i18n.global.t('other.preview'),
                    icon: "view",
                    action: ["preview", 1],
                    shortcutFixed: [Key.Alt, 'J'],
                    splitAfter: true,
                },
                {
                    title: "Nadpisy",
                    icon: ["heading1", "heading2", "heading3"],
                    dropdownText: ["Nadpis 1", "Nadpis 2", "Nadpis 3"],
                    action: ["add", ["heading1", "heading2", "heading3"]],
                    shortcut: [[Key.Ctrl, '1'], [Key.Ctrl, '2'], [Key.Ctrl, '3']],
                    splitAfter: true,
                },
                {
                    title: "Zarovnání",
                    icon: ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
                    dropdownText: ["Vlevo", "Doprostřed", "Vpravo", "Do bloku"],
                    shortcut: [[Key.Ctrl, 'L'], [Key.Ctrl, 'E'], [Key.Ctrl, 'R'], [Key.Ctrl, 'J']],
                    action: ["align", ["left", "center", "right", "justify"]],
                    splitAfter: true,
                },
                {
                    tooltip: i18n.global.t('reviews.addImage'),
                    icon: "showImage",
                    shortcut: [Key.Alt, 'I'],
                    action: ["add", 'showImage']
                },
                {
                    tooltip: i18n.global.t('reviews.addVideo'),
                    shortcut: [Key.Alt, 'V'],
                    icon: "addVideo",
                    action: ["add", 'addVideo']
                },
                {
                    tooltip: i18n.global.t('reviews.makeCarousel'),
                    shortcut: [Key.Alt, 'C'],
                    icon: "addCarousel",
                    action: ["add", 'addCarousel']
                },
                {
                    tooltip: i18n.global.t('reviews.addDivisor'),
                    shortcut: [Key.Alt, 'S'],
                    icon: "divisor",
                    action: ["add", 'divisor']
                },
                {
                    tooltip: i18n.global.t('reviews.showLevel'),
                    shortcut: [Key.Alt, 'L'],
                    icon: "showLevel",
                    action: ["add", 'showLevel']
                },
                {
                    tooltip: i18n.global.t('reviews.dispRatings'),
                    icon: "showRating",
                    shortcut: [Key.Alt, 'R'],
                    action: ["add", 'showRating']
                },
                {
                    tooltip: i18n.global.t('reviews.listLink'),
                    shortcut: [Key.Alt, 'P'],
                    icon: "showList",
                    action: ["add", 'showList']
                },
            ],
            right: [
                {
                    title: "Přidat sloupec",
                    icon: "twoColumns",
                    component: ColumnSettingsButton
                },
            ]
        },
        formatting: {
            left: [
                {
                    title: i18n.global.t('reviews.bold'),
                    icon: "bold",
                    shortcut: [Key.Ctrl, 'B'],
                    action: ["format", 0],
                },
                {
                    title: i18n.global.t('reviews.italics'),
                    icon: "cursive",
                    shortcut: [Key.Ctrl, 'I'],
                    action: ["format", 1],
                },
                {
                    title: i18n.global.t('reviews.strike'),
                    icon: "strike",
                    shortcut: [Key.Ctrl, 'T'],
                    action: ["format", 2],
                },
                {
                    title: i18n.global.t('other.points'),
                    icon: "list",
                    shortcut: [Key.Ctrl, 'L'],
                    action: ["format", 3],
                },
                {
                    title: i18n.global.t('other.blockquote'),
                    icon: "quotes",
                    shortcut: [Key.Ctrl | Key.Alt, 'B'],
                    action: ["format", 4],
                },
                {
                    title: i18n.global.t('other.checklist'),
                    icon: "check",
                    shortcut: [Key.Ctrl | Key.Shift, 'L'],
                    action: ["format", 5],
                },
                {
                    title: i18n.global.t('other.link'),
                    icon: "link",
                    shortcut: [Key.Ctrl, 'L'],
                    action: ["format", 6],
                },
            ],
            right: [
                {
                    title: i18n.global.t('reviews.splitPg'),
                    icon: "divisor",
                    shortcut: [Key.Ctrl | Key.Alt, 'S'],
                    action: ["splitParagraph"],
                },
            ]
        }
    },
    drafts: {
        storageKey: "reviewDrafts",
        draftabilityConstraint(postObject: PostData) {
            return postObject.containers.length > 0
        },
        parsePreview: getReviewPreview,
        counterLangKey: 'other.words'
    }
}
