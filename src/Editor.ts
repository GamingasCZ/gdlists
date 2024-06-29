import chroma from "chroma-js";
import { ref } from "vue";
import type { LevelList, Level, CollabData, LevelBackup, ReviewList } from "./interfaces";
import { SETTINGS } from "./siteSettings";
import { i18n } from "./locales";
import router from "./router";

export const TAG_COUNT = 27;
export const EMOJI_COUNT = 18;

// For demon faces
export const diffScaleOffsets = [1.085, 1.11, 0.95, 1.15, 1.25]
export const diffTranslateOffsets = [0,0, "0 -0.05rem", "0 -0.05rem", "0 -0.09rem"]

export const DEFAULT_LEVELLIST: LevelList = {
  description: "",
  pageBGcolor: [140, 0.37, 3],
  diffGuesser: [false, true, true],
  titleImg: ["", 0, 33, 1, true],
  translucent: false,
  disComments: false,
  levels: [],
}

export const levelList = ref<LevelList>(DEFAULT_LEVELLIST);

export function makeColor(col?: [number, number, number] | string, hex = false): [number, number, number] | string {
  // Random color
  if (typeof col == 'object' && col.length) return col
  else if (typeof col == 'string') return chroma(col).hsl()
  else {
    let randomColor = chroma.hsv(
      Math.floor(Math.random() * 360), 1, Math.random() / 3
    )
    return hex ? randomColor.hex() : randomColor.hsl().slice(0, 3)
  }
}

export const getBGcolor = () => document.documentElement.style.getPropertyValue('--siteBackground')

export function addLevel(values: Level | null) {
  let levelInfo: Level = {
    levelName: values?.levelName ?? "",
    creator: values?.creator ?? "",
    color: makeColor(values?.color),
    levelID: values?.levelID ?? "",
    video: values?.video ?? "",
    difficulty: values?.difficulty ?? [0, 0],
    tags: values?.tags ?? [],
    platf: values?.platf ?? false,
  };

  levelList.value.levels.push(levelInfo);
}

export const moveLevel = (from: number, to: number) => {
  if (to < 0 || to >= levelList.value.levels.length) return from;

  let currentCard = levelList.value.levels[from];
  levelList.value.levels.splice(from, 1);
  levelList.value.levels.splice(to, 0, currentCard);
  return to;
};

export function testIfImageExists(url: string) {
  return new Promise((loaded) => {
    let testImage = new Image();
    testImage.src = url;

    testImage.addEventListener("error", () => loaded(""));
    testImage.addEventListener("load", () => loaded(url));
  });
}

export const modifyListBG = (newColors: number[] | string, reset = false, review = false) => {
  if (JSON.stringify(newColors) == JSON.stringify(DEFAULT_LEVELLIST.pageBGcolor)) return
  if (reset) {
    document.documentElement.style.setProperty("--siteBackground","")
    document.documentElement.style.setProperty("--primaryColor","")
    document.documentElement.style.setProperty("--secondaryColor","")
    document.documentElement.style.setProperty("--brightGreen","")
    return JSON.parse(JSON.stringify(DEFAULT_LEVELLIST.pageBGcolor))
  }
  
  // Default colors
  // if (newColors[1] == 0.37) return

  // Old lists - hex colors
  if (typeof newColors == 'string') newColors = chroma(newColors).hsl()

  let listColor = chroma.hsl(
    newColors[0],
    0.36,
    newColors[2] < 1 ? newColors[2] : newColors[2] / 64
  )

  document.documentElement.style.setProperty(
    "--siteBackground",
    listColor.hex()
  );
  document.documentElement.style.setProperty(
    "--primaryColor",
    chroma(chroma.hsl(newColors[0], 0.36, 0.167)).hex()
  );
  document.documentElement.style.setProperty(
    "--secondaryColor",
    chroma(chroma.hsl(newColors[0], 0.906, 0.049)).hex()
  );
  document.documentElement.style.setProperty(
    "--brightGreen",
    chroma(chroma.hsl(newColors[0], 0.535, 0.637)).hex()
  );

  (document.getElementById("siteTheme") as HTMLMetaElement).setAttribute(
    "theme-color",
    chroma(chroma.hsl(newColors[0], 0.906, 0.049)).hex()
  );

  return [newColors[0], 0.36, newColors[2]] as [number, number, number]
};

export const prettyDate = (datePassed: number) => {
  if (datePassed < 0) return i18n.global.t('date.future')
  else if (datePassed < 5) return i18n.global.t('date.fewSecsAgo')
  else if (datePassed <= 60) return i18n.global.t('date.secs', Math.floor(datePassed))
  else if (Math.floor(datePassed/60) == 1) return i18n.global.t('date.mins', Math.floor(datePassed/60))
  else if (Math.floor(datePassed/60) <= 60) return i18n.global.t('date.mins', Math.floor(datePassed/60))
  else if (Math.floor(datePassed/3600) == 1) return i18n.global.t('date.hours', Math.floor(datePassed/3600))
  else if (Math.floor(datePassed/3600) <= 24) return i18n.global.t('date.hours', Math.floor(datePassed/3600))
  else if (Math.floor(datePassed/86400) == 1) return i18n.global.t('date.days', Math.floor(datePassed/86400))
  else if (Math.floor(datePassed/86400) <= 7) return i18n.global.t('date.days', Math.floor(datePassed/86400))
  else if (Math.floor(datePassed/604800) == 1) return i18n.global.t('date.weeks', Math.floor(datePassed/604800))
  else if (Math.floor(datePassed/604800) <= 4) return i18n.global.t('date.weeks', Math.floor(datePassed/604800))
  else if (Math.floor(datePassed/2419200) <= 4) return i18n.global.t('date.months', Math.floor(datePassed/2419200))
  else return i18n.global.t('date.months', Math.floor(datePassed/2419200))
}

export function parseElapsed(secs: number) {
  if (secs < 60) return Math.round(secs) + "s"; //s - seconds
  else if (secs < 3600) return Math.round(secs / 60) + "m"; //m - minutes
  else if (secs < 86400) return Math.round(secs / 3600) + "h"; //h - hours
  else if (secs < 604800) return Math.round(secs / 86400) + "d"; //d - days
  else if (secs < 1892160000)
    return Math.round(secs / 604800) + "w"; //w - weeks
  else return Math.round(secs / 1892160000) + "y"; //y - years
}

export function resetList() {
  if (router.currentRoute.value.name == "editor") router.push({path: "/editor", force: true})
}

export const makeColorFromString = (name: string) => {
  let ok = Math.floor(
    16777215 *
      Math.sin(
        name
          ?.split("")
          .map((p: string) => p.charCodeAt(0))
          .reduce((x, y) => x + y)! % Math.PI
      )
  )
  return chroma(ok);
}

export function fixHEX(hexColor: string) {
  // If the code ends with a number, hex code is sometimes broken (completely random lmao)

  if (hexColor.length == 7) return hexColor; // No need for fix

  let fixed = hexColor.slice(0, -1) + "0" + hexColor.slice(-1);
  if (fixed.length != 7) return "#000000";
  else return fixed;
}

export function checkList(listName: string): { valid: boolean, error?: string, listPos?: number, stamp?: number } {
  let error = (errorText: string, errorPos?: number) => { return { valid: false, error: errorText, listPos: errorPos ?? -1, stamp: Math.random() } }

  if (!isOnline.value) return error(i18n.global.t('other.disconnected'))

  if (listName.length <= 3) return error(i18n.global.t('editor.nameShort'))

  if (levelList.value.levels.length == 0) return error(i18n.global.t('editor.emptyListSend'))

  let i = 0
  let listError: object | undefined
  levelList.value.levels.forEach(level => {
    if (level.levelName.length == 0) listError = error(i18n.global.t('editor.noNameAt', [i + 1]), i)
    if (typeof level.creator == 'string' ? !level.creator.length : !level.creator[0][0].name) {
      if (typeof level.creator[0][0] == 'string') return // Old collabs
      listError = error(i18n.global.t('editor.noCreatorAt', [i + 1]), i)
    }
    if (!level.levelID?.match(/^\d+$/) && level.levelID?.length) listError = error(i18n.global.t('editor.invalidID', [i + 1]), i)
    i++
  })
  if (listError != undefined) return <any>listError

  let listSize = JSON.stringify(levelList.value).length
  if (listSize > 25000) return error(i18n.global.t('editor.overLimit', [(listSize / 25000).toFixed(2)]))

  return { valid: true }
}

export function creatorToCollab(currentName: string): CollabData {
  return [
    [{name: currentName, role: 0, color: [0,1,1], part: [0,0], socials: [], verified: 0}],
    [],
    [],
    Math.floor(Math.random() * 1000000),
    []
  ]
}

export const isOnline = ref(true)
window.addEventListener("offline", () => isOnline.value = false)
window.addEventListener("online", () => isOnline.value = true)

export function saveBackup(listName: string, hidden: boolean, review: boolean | ReviewList = false) {
  if (localStorage && SETTINGS.value.autosave) {
    let backup: LevelBackup = { listName: listName, levelData: JSON.stringify(review !== false ? review : levelList.value), listHidden: hidden, listDate: Date.now() }

    localStorage.setItem(`${review ? 'review' : 'list'}Backup`, JSON.stringify(backup))
  }
  return Math.random()
}

export const removeBackup = (isReview = false) => {
  localStorage.removeItem(`${isReview ? 'review' : 'list'}Backup`)
}

export const shortenYTLink = (link: string) => {
  // Link is a regular YT link
  if (link.match(/(watch\?v=)/g)) {
    return <any>link.match(/(?<=\?v=).+/g);
  }
  // Link is most likely a shortened YT link
  else {
    return <any>link.match(/(?<=youtu.be\/).+/g);
  }
}