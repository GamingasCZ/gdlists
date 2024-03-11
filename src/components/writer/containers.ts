import DataContainer from "./DataContainer.vue"
import ReviewImage from "./ReviewImage.vue"

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
        childStyling: "listChildren",
        nestable: true,
        canEditText: false,
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