import DataContainer from "./DataContainer.vue"
import ReviewImage from "./ReviewImage.vue"
import ReviewLevel from "./ReviewLevel.vue"
import ReviewVideo from "./ReviewVideo.vue"
import ReviewList from "./ReviewList.vue"

const containers: Containers = {
    default: {
        placeholder: "Odstavec",
        styling: "",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading1: {
        placeholder: "Nadpis 1",
        styling: "text-3xl leading-10",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading2: {
        placeholder: "Nadpis 2",
        styling: "text-2xl leading-8",
        nestable: true,
        canEditText: true,
        settings: []
    },
    heading3: {
        placeholder: "Nadpis 3",
        styling: "texl-xl leading-6",
        nestable: false,
        canEditText: true,
        settings: []
    },
    list: {
        placeholder: "Seznam",
        childStyling: "listChildren",
        nestable: true,
        canEditText: true,
        additionalComponents: [],
        settings: []
    },
    showImage: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewImage],
        settings: [
            {
                key: "url",
                title: "URL obrázku",
                type: 0,
                default: ""
            },
            {
                key: "alt",
                title: "Alternativní text",
                type: 0,
                default: ""
            },
            {
                key: "description",
                title: "Popis obrázku",
                type: 0,
                default: ""
            },
            {
                key: "link",
                title: "Odkaz",
                type: 0,
                default: ""
            },
        ]
    },
    addVideo: {
        nestable: true,
        canEditText: false,
        additionalComponents: [ReviewVideo],
        settings: [
            {
                key: "url",
                title: "YouTube odkaz",
                type: 0,
                default: ""
            },
            {
                key: "description",
                title: "Popis videa",
                type: 0,
                default: ""
            }
        ]
    },
    showLevel: {
        nestable: false,
        canEditText: false,
        additionalComponents: [ReviewLevel],
        settings: [
            {
                key: "pick",
                title: "Vybrat level",
                type: 1,
                default: 0
            },
            {
                key: "showCollab",
                title: "Zobrazit collab",
                type: 2,
                default: false
            },
            {
                key: "description",
                title: "Popis levelu",
                type: 0,
                default: ""
            }
        ]
    },
    showList: {
        nestable: false,
        canEditText: false,
        additionalComponents: [ReviewList],
        settings: [
            {
                key: "level",
                title: "",
                type: -1,
                default: false
            },
            {
                key: "pick",
                title: "Vybrat seznam",
                type: 1,
                default: 0
            },
            {
                key: "description",
                title: "Popis seznamu",
                type: 0,
                default: ""
            }
        ]
    },
    twoColumns: {
        styling: "grid grid-cols-2",
        nestable: false,
        canEditText: false,
        additionalComponents: [DataContainer],
        settings: []
    }
}

export default containers

export type Containers = {
    default: Container
    heading1: Container
    heading2: Container
    heading3: Container
    list: Container
    showImage: Container
    showLevel: Container
    showList: Container
    addVideo: Container
    twoColumns: Container
}

export type Container = {
    placeholder?: string,
    styling?: string,
    childStyling?: string,
    additionalComponents?: any[],
    nestable: boolean,
    canEditText: boolean,
    settings: ContainerSettings[],
}

export type ContainerSettings = {
    key: string
    title: string
    type: number
    default: any
}