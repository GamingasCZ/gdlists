import ReviewHelp from "@/components/writer/ReviewHelp.vue"
import SettingsDescription from "@/components/writer/SettingsDescription.vue"
import { checkList, DEFAULT_LEVELLIST } from "@/Editor"
import type { LevelList, ReviewList, Setting } from "@/interfaces"
import { i18n } from "@/locales"
import { checkReview, DEFAULT_REVIEWDATA } from "@/Reviews"
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

const FONTS: [string, number][] = [["Poppins", 0],
               ["Serif", 1],
               ["Sans-Serif", 2],
               ["Monospace", 3],
               ["Systémové", 4],
               ["Pusab", 5]]
type Post = 'list' | 'review'
type PostKeys = keyof (ReviewList & LevelList)
type ToolbarAction = 'add' | 'preview' | 'align' | 'add' | 'column' | 'format' | 'splitParagraph'

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
    action: [ToolbarAction, any],
    /**
     * Global shortcut that get's called no mater the toolbar
     */
    shortcut?: [Key, string],
    /**
     * Shortcuts that gets called only, if its button is in the current toolbar
     */
    shortcutFixed?: [Key, string],
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
         * @param {Object} postObject - The post
         * @return {Object} success - s
         */
        clientPostValidation: (postObject: ReviewList | LevelList) => {success: boolean, error: string}
    },
    settings: {[setting: string]: (Setting & {affects: PostKeys}) | string},
    toolbar: {
        [toolbarName: string]: {
            left?: ToolbarButton[]
            right?: ToolbarButton[]
        }
    }

}

export const LIST: Writer = {
    general: {
        postType: "list",
        postObject: DEFAULT_LEVELLIST,
        tabTitle: 'Editor seznamu',
        titlePlaceholder: i18n.global.t('editor.levelName'),
        allowTagline: true,
        placeholderTaglines: [
            'Tihle creatoři extrémně peakli!',
            'Tyhle Levely od Fanoušků budou spicy!',
            'Z mého map packu ti oči nevykrvácí!',
            ''
        ],
        allowLevels: true,
        maxLevels: 50,
        levelsSubtext: 'Jaké levely chceš přidat?',
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
            desc: 'Ze seznamu se stane hádací minihra.',
            control: "cbox",
            affects: "diffGuesser",
        },
        {
            name: i18n.global.t('editor.translucentCards'),
            desc: 'Karty levelů v seznamu budou průsvitné.',
            control: "cbox",
            affects: "translucent",
        },
    ]
}

export const REVIEW: Writer = {
    general: {
        postType: "review",
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
        levelsSubtext: 'Jaké levely budeš recenzovat?',
        allowWriter: true,
        writerHelp: ReviewHelp,
        clientPostValidation: checkReview,

    },
    settings: [
        i18n.global.t('other.general'),
        {
            name: i18n.global.t('reviews.description'),
            control: "component",
            controlOptions: SettingsDescription,
            affects: "description",
        },
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
        i18n.global.t('settingsMenu.visual'),
        {
            name: i18n.global.t('reviews.font'),
            control: "dropdown",
            controlOptions: FONTS,
            affects: "font",
        },
        {
            name: i18n.global.t('reviews.readerMode'),
            desc: i18n.global.t('reviews.readerModeHelp'),
            control: "cbox",
            affects: "readerMode",
        },
        {
            name: i18n.global.t('reviews.whitePage'),
            desc: i18n.global.t('reviews.whitePageHelp'),
            control: "cbox",
            affects: "whitePage",
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
                    action: ["column"]
                },
            ]
        },
        previewing: {
            left: [
                {
                    title: "Zpět",
                    icon: "bold",
                    shortcutFixed: [Key.Alt, 'J'],
                    action: ["preview", 0],
                    leftOffset: [9, 3.5],
                    splitAfter: true
                },
                {
                    title: "Recenze",
                    icon: "bold",
                    shortcutFixed: [Key.Alt, 'K'],
                    action: ["preview", 1],
                },
                {
                    title: "Levely",
                    icon: "bold",
                    shortcutFixed: [Key.Alt, 'L'],
                    action: ["preview", 2],
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
        storageKey: "reviewDrafts"
    }
}
