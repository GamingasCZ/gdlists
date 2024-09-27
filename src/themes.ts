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
        icon: "icon1"
    },
]

const base = import.meta.env.BASE_URL

let selectedBeforeSave = SETTINGS.value.selectedTheme
export const changeTheme = (to: number) => {
    let sameTheme = SETTINGS.value.selectedTheme == to
    selectedBeforeSave = to
    document.body.style.backgroundImage = `url(${base}/graphics/${THEMES[to].backgroundImage}.webp)` || ''
    setTimeout(() => {
        for (const [varName, color] of Object.entries(THEMES[to].colors)) {
            document.documentElement.style.setProperty(`--${varName}`, color);
        }
    }, 150);
    let navbar = document.querySelector("#navbar")
    if (navbar && !sameTheme) {
        navbar.classList.add("slidingNavbar")
        setTimeout(() => {
            navbar.classList.remove("slidingNavbar");
        }, 300);
    }
}

export const saveTheme = () => {
    SETTINGS.value.selectedTheme = selectedBeforeSave
}

export default THEMES