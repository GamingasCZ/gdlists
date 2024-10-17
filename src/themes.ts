import { ref } from "vue";
import { SETTINGS } from "./siteSettings";

const THEMES = [
    {
        name: "Classic",
        graphic: "introGrad2",
        colors: {
            siteBackground: "#08110b",
            primaryColor: "#045124",
            secondaryColor: "#142019",
            brightGreen: "#71d471"
        },
        backgroundImage: "",
        icon: "icon0"
    },
    {
        name: "Halloween",
        graphic: "graf3",
        colors: {
            siteBackground: "#150c1a",
            primaryColor: "#8e4b04",
            secondaryColor: "#400827",
            brightGreen: "#ffd841"
        },
        backgroundImage: "webs2",
        icon: "icon1",
        begins: { day: 1, month: 10 },
        ends: { day: 31, month: 10 },
    },
]

const base = import.meta.env.BASE_URL

export const selectedBeforeSave = ref(SETTINGS.value.selectedTheme)
export const changeTheme = (to: number) => {
    let sameTheme = selectedBeforeSave.value == to
    selectedBeforeSave.value = to
    document.body.style.backgroundImage = `url(${base}/graphics/${THEMES[to].backgroundImage}.webp)` || ''
    for (const [varName, color] of Object.entries(THEMES[to].colors)) {
        document.documentElement.style.setProperty(`--${varName}`, color);
    }
    let navbar = document.querySelector("#navbar")
    if (navbar && !sameTheme) {
        navbar.classList.add("slidingNavbar")
        setTimeout(() => {
            navbar.classList.remove("slidingNavbar");
        }, 300);
    }
}

export const saveTheme = (seasonal = 0) => {
    if (seasonal == 0) SETTINGS.value.selectedThemeAlways = selectedBeforeSave.value
    SETTINGS.value.selectedTheme = selectedBeforeSave.value
}

export const checkSeasonalTheme = () => {
    if (!SETTINGS.value.seasonalThemes) return -1

    let date = new Date()

    let i = -1
    for (const theme of THEMES) {
        i += 1
        if (!theme?.begins) continue
        let beginDate = new Date(); beginDate.setMonth(theme.begins.month - 1); beginDate.setDate(theme.begins.day); // months start at 0
        let endDate = new Date(); endDate.setMonth(theme.ends.month - 1); endDate.setDate(theme.ends.day); // months start at 0
        if (date >= beginDate && date <= endDate) {
            return i
        }
        else {
            SETTINGS.value.selectedTheme = SETTINGS.value.selectedThemeAlways
        }
    }
    return -1
}

export default THEMES