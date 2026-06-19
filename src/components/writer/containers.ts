import ReviewImage from "./ReviewImage.vue"
import ReviewLevel from "./ReviewLevel.vue"
import ReviewVideo from "./ReviewVideo.vue"
import ReviewList from "./ReviewList.vue"
import ReviewDivisor from "./ReviewDivisor.vue"
import NestContainer from "./NestContainer.vue"
import ReviewRatings from "./ReviewRatings.vue"
import ReviewUsers from "./ReviewUsers.vue"
import { i18n } from "@/locales"
import ReviewCarousel from "./ReviewCarousel.vue"

const success = {success: true}

const error = (ind: number, msg = 0) => {
    const message = [i18n.global.t('reviews.isMissing'), i18n.global.t('reviews.notSelected'), i18n.global.t('reviews.areEmpty'), i18n.global.t('reviews.isEmpty')]
    return {success: false, error: message[msg], index: ind}
}

// containerSettings inputs
export enum ControlType {
    Hidden,
    Text,
    Button,
    Checkbox,
    LevelPicker,
    RatingPicker,
    Picker,
    ImagePicker,
    Spinbox
}

const base = import.meta.env.BASE_URL
const divisorStyles = [...Array(8).keys()].map(x => `${base}/divThemes/${x}.svg`)

const containers: Containers = {
    default: {
        placeholder: i18n.global.t('reviews.paragraph'),
        styling: "min-h-12 my-1",
        nestable: true,
        canEditText: true,
        settings: [{
            key: "noMD",
            title: i18n.global.t('reviews.disMD'),
            type: [ControlType.Checkbox],
            default: false,
        },
        {
            key: "size",
            title: i18n.global.t('reviews.fontSize'),
            type: [ControlType.Picker, i18n.global.t('settingsMenu.qMed'), 8, 12, 14, 16, 18, 20, 22, 24, 32, 36, 48, 64],
            default: 0,
        },
        {
            key: "indent",
            title: i18n.global.t('reviews.indent'),
            type: [ControlType.Checkbox],
            default: false,
        },
    ]
    },
    heading1: {
        placeholder: i18n.global.t('reviews.title', [1]),
        styling: "text-5xl font-bold",
        innerStyling: "mt-4 leading-tight",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading2: {
        placeholder: i18n.global.t('reviews.title', [2]),
        styling: "text-4xl font-bold",
        innerStyling: "mt-2 leading-tight",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading3: {
        placeholder: i18n.global.t('reviews.title', [3]),
        styling: "text-3xl font-bold",
        innerStyling: "mt-1 leading-tight",
        nestable: true,
        canEditText: true,
        settings: []
    },
    divisor: {
        placeholder: "",
        childStyling: "",
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewDivisor],
        resizeableProperty: "sizeY",
        settings: [
            {
                key: "visible",
                title: i18n.global.t('other.visible'),
                type: [ControlType.Checkbox],
                default: true,
            },
            {
                key: "sizeY",
                title: "",
                type: [ControlType.Hidden],
                default: 32,
                valueRange: [16, 250]
            },
            {
                key: "style",
                title: i18n.global.t('other.style'),
                type: [ControlType.ImagePicker].concat(divisorStyles),
                default: 0,
            },
            {
                key: "color",
                title: i18n.global.t('other.color'),
                type: [ControlType.Picker, i18n.global.t('settingsMenu.qMed'), i18n.global.t('reviews.vibrant'), i18n.global.t('review.colorful'), i18n.global.t('other.gradient2')],
                default: 0,
            },
        ]
    },
    showImage: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewImage],
        resizeableProperty: "width",
        settings: [
            {
                key: "url",
                title: i18n.global.t('reviews.imgUrl'),
                type: [ControlType.Hidden],
                default: "",
            },
            {
                key: "width",
                title: "",
                type: [ControlType.Hidden],
                default: 0,
                valueRange: [64, 960]
            },
            {
                key: "pick",
                title: i18n.global.t('reviews.pick'),
                type: [ControlType.Button],
                default: 0
            },
            {
                key: "alt",
                title: i18n.global.t('reviews.alttext'),
                type: [ControlType.Text],
                default: ""
            },
            {
                key: "description",
                title: i18n.global.t('reviews.imageDesc'),
                type: [ControlType.Text],
                default: ""
            },
            {
                key: "link",
                title: i18n.global.t('other.link'),
                type: [ControlType.Text],
                default: ""
            },
            {
                key: "onlyDeco",
                title: i18n.global.t('reviews.decoOnly'),
                type: [ControlType.Checkbox],
                default: false
            },
        ],
        errorCheck: (settings: object) => settings.url.length ? success : error(0)
    },
    addVideo: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewVideo],
        resizeableProperty: "width",
        settings: [
            {
                key: "url",
                title: i18n.global.t('reviews.ytLink'),
                type: [ControlType.Text],
                required: true,
                default: ""
            },
            {
                key: "width",
                title: "",
                type: [ControlType.Hidden],
                default: 320,
                valueRange: [104, 720]
            },
            {
                key: "description",
                title: i18n.global.t('reviews.videoDesc'),
                type: [ControlType.Text],
                default: ""
            }
        ],
        errorCheck: (settings: object) => settings.url.length ? success : error(1)
    },
    showRating: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewRatings],
        settings: [
            {
                key: "level",
                title: i18n.global.t('other.level'),
                type: [ControlType.LevelPicker],
                default: 0
            },
            {
                key: "show",
                title: i18n.global.t('reviews.rating'),
                type: [ControlType.RatingPicker],
                default: -1
            },
            {
                key: "hideUnrated",
                title: i18n.global.t('reviews.hideUnrated'),
                type: [ControlType.Checkbox],
                default: false
            }
        ]

    },
    showLevel: {
        nestable: false,
        canEditText: false,
        additionalComponents: [ReviewLevel],
        settings: [
            {
                key: "pickedIndex",
                title: i18n.global.t('other.level'),
                type: [ControlType.Hidden],
                required: true,
                default: -1
            },
            {
                key: "pickLevel",
                title: i18n.global.t('reviews.pickLevel'),
                type: [ControlType.Button],
                default: 0
            },
            {
                key: "showCollab",
                title: i18n.global.t('reviews.dispCollab'),
                type: [ControlType.Checkbox],
                default: true
            },
            {
                key: "description",
                title: i18n.global.t('reviews.levelDesc'),
                type: [ControlType.Text],
                default: ""
            }
        ],
        errorCheck: (settings: object) => settings.pickedIndex != -1 ? success : error(0, 1)
    },
    showList: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewList],
        limit: 20,
        settings: [
            {
                key: "post",
                title: i18n.global.t('other.post'),
                type: [ControlType.Hidden],
                required: true,
                default: false
            },
            {
                key: "postType",
                title: i18n.global.t('other.post'),
                type: [ControlType.Hidden],
                default: 0
            },
            {
                key: "pick",
                title: i18n.global.t('reviews.pickList'),
                type: [ControlType.Button],
                default: 0
            }
        ],
        errorCheck: (settings: object) => settings.post ? success : error(0, 1)
    },
    twoColumns: {
        nestable: true,
        canEditText: false,
        dependentOnChildren: true,
        additionalComponents: [NestContainer, NestContainer],
        settings: [{
            key: "components",
            title: i18n.global.t('reviews.columns'),
            type: [ControlType.Hidden],
            default: [[], []]
        },
        {
            key: "gaps",
            title: "gaps",
            type: [-1],
            default: false
        }],
        errorCheck: (settings: object) => {
            let len = 0
            settings.components.forEach(e => len += e.length)
            return len ? success : error(0, 2)
        }
    },
    addCarousel: {
        nestable: false,
        canEditText: false,
        dependentOnChildren: false,
        additionalComponents: [ReviewCarousel],
        resizeableProperty: "height",
        settings: [
            {
                key: "components",
                title: i18n.global.t('reviews.carousel'),
                type: [ControlType.Hidden],
                required: true,
                default: []
            },
            {
                key: "height",
                title: '',
                type: [ControlType.Hidden],
                required: true,
                default: 192,
                valueRange: [48, 720]
            },
            {
                key: "pick",
                title: i18n.global.t('reviews.pickMedia'),
                type: [ControlType.Button],
                default: 0
            },
            {
                key: "overflow",
                title: i18n.global.t('reviews.overflow'),
                type: [ControlType.Checkbox],
                default: false
            },
            {
                key: "crop",
                title: i18n.global.t('reviews.cropWidth'),
                type: [ControlType.Checkbox],
                default: false
            },
        ],
        errorCheck: (settings: object) => settings.components.length ? success : error(0, 3)
    }
}

/*
    showCollab: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewUsers],
        settings: [
        {
            key: "users",
            title: i18n.global.t('other.users'),
            type: [ControlType.Hidden],
            required: true,
            default: []
        },
        {
            key: "pick",
            title: i18n.global.t('reviews.editMembers'),
            type: [ControlType.Button],
            default: 0
        },
        {
            key: "colums",
            title: i18n.global.t('reviews.displayColumns'),
            type: [ControlType.Checkbox],
            default: false
        }]
    }
        */

export default containers

export type ContainerNames = 'default' |
'heading1' |
'heading2' |
'heading3' |
'divisor' |
'list' |
'showImage' |
'showLevel' |
'showList' |
'addVideo' |
'showRating' |
'twoColumns' |
'showCollab' |
'addCarousel'

export type settings = cDefault & cHeading1 & cHeading2 & cHeading3 & cDivisor & cShowImage & caddVideo & cShowRating & cShowLevel & cShowList & cTwoColumns & cAddCarousel

export type Containers = {
    [container in ContainerNames]: Container
}

export type Container = {
    placeholder?: string,
    styling?: string,
    innerStyling?: string,
    dependentOnChildren?: boolean
    additionalComponents?: any[],
    componentProps?: Container,
    limit?: number,
    nestable: boolean,
    canEditText: boolean,
    settings: ContainerSettings[],
    resizeableProperty?: string
    errorCheck?: (x: object) => {success: boolean, mess?: string}
}

export type ContainerSettings = {
    key: string
    title: string
    type: number[]
    default: any
    required?: boolean
    valueRange?: [number, number]
}

export type cDefault = {noMD: boolean, size: number, indent: boolean}
export type cHeading1 = {}
export type cHeading2 = {}
export type cHeading3 = {}
export type cDivisor = {sizeY: number, visible: boolean, style: number, color: number}
export type cShowImage = {url: string, width: number, pick: number, alt: string, description: string, link: string}
export type caddVideo = {width: number, url: string, description: string}
export type cShowRating = {level: number, show: number, hideUnrated: boolean}
export type cShowLevel = {pickedIndex: number, pickLevel: number, showCollab: boolean, description: string}
export type cShowList = {post: boolean, postType: number, pick: number}
export type cTwoColumns = {components: (Containers | boolean)[], gaps: boolean}
export type cAddCarousel = {components: any[], height: number, pick: number, overflow: boolean, crop: boolean}

