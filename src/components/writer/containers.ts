import ReviewImage from "./ReviewImage.vue"
import ReviewLevel from "./ReviewLevel.vue"
import ReviewVideo from "./ReviewVideo.vue"
import ReviewList from "./ReviewList.vue"
import ReviewDivisor from "./ReviewDivisor.vue"
import NestContainer from "./NestContainer.vue"
import ReviewRatings from "./ReviewRatings.vue"
import { i18n } from "@/locales"

const success = {success: true}

const error = (ind: number, msg = 0) => {
    const message = ["Chybí %s!", "Není vybrán %s!"]
    return {success: false, error: message[msg], index: ind}
}

const containers: Containers = {
    default: {
        placeholder: i18n.global.t('reviews.paragraph'),
        styling: "my-2",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading1: {
        placeholder: i18n.global.t('reviews.title', [1]),
        styling: "text-3xl leading-10",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading2: {
        placeholder: i18n.global.t('reviews.title', [2]),
        styling: "text-2xl leading-8",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading3: {
        placeholder: i18n.global.t('reviews.title', [3]),
        styling: "texl-xl leading-6",
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
        settings: [
            {
                key: "sizeX",
                title: "",
                type: [-1],
                default: -1,
            },
            {
                key: "sizeY",
                title: "",
                type: [-1],
                default: 32,
            },
            {
                key: "visible",
                title: i18n.global.t('other.visible'),
                type: [2],
                default: true,
            },
            {
                key: "fill",
                title: i18n.global.t('reviews.fillSpace'),
                type: [2],
                default: false,
            },
        ]
    },
    showImage: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewImage],
        settings: [
            {
                key: "url",
                title: i18n.global.t('reviews.imgUrl'),
                type: [-1],
                default: "",
            },
            {
                key: "width",
                title: "",
                type: [-1],
                default: 0
            },
            {
                key: "pick",
                title: i18n.global.t('reviews.pickImage'),
                type: [1],
                default: 0
            },
            {
                key: "alt",
                title: i18n.global.t('reviews.alttext'),
                type: [0],
                default: ""
            },
            {
                key: "description",
                title: i18n.global.t('reviews.imageDesc'),
                type: [0],
                default: ""
            },
            {
                key: "link",
                title: i18n.global.t('other.link'),
                type: [0],
                default: ""
            },
        ],
        errorCheck: (settings: object) => settings.url.length ? success : error(0)
    },
    addVideo: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewVideo],
        settings: [
            {
                key: "width",
                title: "",
                type: [-1],
                default: 320
            },
            {
                key: "url",
                title: i18n.global.t('reviews.ytLink'),
                type: [0],
                required: true,
                default: ""
            },
            {
                key: "description",
                title: i18n.global.t('reviews.videoDesc'),
                type: [0],
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
                type: [4],
                default: 0
            },
            {
                key: "show",
                title: i18n.global.t('reviews.rating'),
                type: [5],
                default: -1
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
                type: [-1],
                required: true,
                default: -1
            },
            {
                key: "pickLevel",
                title: i18n.global.t('reviews.pickLevel'),
                type: [1],
                default: 0
            },
            {
                key: "showCollab",
                title: i18n.global.t('reviews.dispCollab'),
                type: [2],
                default: true
            },
            {
                key: "description",
                title: i18n.global.t('reviews.levelDesc'),
                type: [0],
                default: ""
            }
        ],
        errorCheck: (settings: object) => settings.pickedIndex != -1 ? success : error(0, 1)
    },
    showList: {
        nestable: false,
        canEditText: false,
        additionalComponents: [ReviewList],
        settings: [
            {
                key: "level",
                title: i18n.global.t('other.post'),
                type: [-1],
                required: true,
                default: false
            },
            {
                key: "pick",
                title: i18n.global.t('reviews.pickList'),
                type: [1],
                default: 0
            },
            {
                key: "description",
                title: i18n.global.t('editor.listDescription'),
                type: [0],
                default: ""
            }
        ],
        errorCheck: (settings: object) => settings.level ? success : error(0, 1)
    },
    twoColumns: {
        styling: "",
        nestable: true,
        canEditText: false,
        dependentOnChildren: true,
        additionalComponents: [NestContainer, NestContainer],
        settings: [{
            key: "components",
            title: "",
            type: [-1],
            default: [[], []]
        }]
    }
}

export default containers

export type Containers = {
    default: Container
    heading1: Container
    heading2: Container
    heading3: Container
    divisor: Container
    list: Container
    showImage: Container
    showLevel: Container
    showList: Container
    addVideo: Container
    showRating: Container
    twoColumns: Container
}

export type Container = {
    placeholder?: string,
    styling?: string,
    childStyling?: string,
    dependentOnChildren?: boolean
    additionalComponents?: any[],
    componentProps?: Container,
    nestable: boolean,
    canEditText: boolean,
    settings: ContainerSettings[],
    errorCheck?: (x: object) => {success: boolean, mess?: string}
}

export type ContainerSettings = {
    key: string
    title: string
    type: number[]
    default: any
    required?: boolean
}