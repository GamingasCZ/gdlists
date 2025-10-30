import chroma from "chroma-js";
import { ref } from "vue";
import type { LevelList, Level, CollabData, PostData, ListFetchResponse, LevelBackground } from "./interfaces";
import { SETTINGS } from "./siteSettings";
import { i18n } from "./locales";
import { changeTheme } from "./themes";
// import { DEFAULT_RATINGS } from "./Reviews";

export const TAG_COUNT = 30;
export const EMOJI_COUNT = 18;

// For demon faces
export const diffScaleOffsets = [1.085, 1.11, 0.95, 1.15, 1.25]
export const diffTranslateOffsets = [0, 0, "0 -0.05rem", "0 -0.05rem", "0 -0.09rem"]

export const DEFAULT_LEVELLIST: () => LevelList = () => {return {
  reviewName: "",
  description: "",
  pageBGcolor: [140, 0.37, 3],
  diffGuesser: [false, false, false],
  titleImg: ["", 0, 100, 1, true],
  translucent: false,
  disComments: false,
  levels: [],
  tagline: "",
  thumbnail: ["", 0, 33, 1, true],
  titleData: {theme: 0, tagline: true, size: 1, colors: [0], followFont: true, outline: false, shadow: 0, align: 0}
}}

export const DEFAULT_LEVEL: () => Level = () => ({
    levelName: "",
    creator: "",
    color: makeColor(),
    difficulty: [0, 0],
    levelID: "",
    tags: [],
    video: "",
    ratings: [Array(4).fill(-1), []],
    BGimage: newCardBG(),
    screenshots: [],
    scShotSecName: "",
    commentary: ""
})

export const modernizeLevels = (levelArray: Level) => {
  // Add missing keys
  let levelKeys = Object.keys(levelArray)
  let newLevel = DEFAULT_LEVEL()
  Object.keys(newLevel).forEach(k => {
    if (!levelKeys.includes(k))
      levelArray[k] = newLevel[k]
  })
}

export const modernizeList = (serverResponse: ListFetchResponse) => {
  // List Name
  serverResponse.data.reviewName ??= serverResponse.name

  // Convert hex colors
  if (serverResponse.data.pageBGcolor == "#020202")
    serverResponse.data.pageBGcolor = DEFAULT_LEVELLIST().pageBGcolor
  else
    serverResponse.data.pageBGcolor = makeColor(serverResponse.data.pageBGcolor)

  // Add missing keys
  let listKeys = Object.keys(serverResponse.data)
  let newList = DEFAULT_LEVELLIST()
  Object.keys(newList).forEach(k => {
    if (!listKeys.includes(k))
      serverResponse.data[k] = newList[k]
  })

  // Convert thumbnail
  if (typeof serverResponse.data.titleImg == 'string')
    serverResponse.data.titleImg = newList.titleImg

  // Add scattered levels into level array
  let levelKeys = Object.keys(serverResponse.data).filter(x => !isNaN(parseInt(x)))
  if (levelKeys.length) {
    serverResponse.data.levels = []
    levelKeys.forEach(x => {
      let level = serverResponse.data[x]
      level.color = makeColor(level.color)
      serverResponse.data.levels.push(level)
      delete serverResponse.data[x]
      }
    )
  }

  // Modernize levels
  serverResponse.data.levels.forEach(l => modernizeLevels(l))

  return serverResponse.data
}

export const predefinedLevelList = ref<Level[]>([]);

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

export const newCardBG = ():LevelBackground => ({ image: DEFAULT_LEVELLIST().titleImg.slice(0), opacity: 1, theme: 0, tile: false, scrolling: 0 })

export function testIfImageExists(url: string) {
  return new Promise((loaded, error) => {
    let testImage = new Image();
    testImage.src = url;

    testImage.addEventListener("error", () => error(""));
    testImage.addEventListener("load", () => loaded([url, testImage]));
  });
}

export const modifyListBG = (newColors: number[] | string, reset = false) => {
  if (SETTINGS.value.disableColors) return JSON.parse(JSON.stringify(DEFAULT_LEVELLIST().pageBGcolor))
  if (JSON.stringify(newColors) == JSON.stringify(DEFAULT_LEVELLIST().pageBGcolor)) return modifyListBG(0, true)
  if (reset) {
    changeTheme(SETTINGS.value.selectedTheme)
    return JSON.parse(JSON.stringify(DEFAULT_LEVELLIST().pageBGcolor))
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
  else if (Math.floor(datePassed / 60) == 1) return i18n.global.t('date.mins', Math.floor(datePassed / 60))
  else if (Math.floor(datePassed / 60) <= 60) return i18n.global.t('date.mins', Math.floor(datePassed / 60))
  else if (Math.floor(datePassed / 3600) == 1) return i18n.global.t('date.hours', Math.floor(datePassed / 3600))
  else if (Math.floor(datePassed / 3600) <= 24) return i18n.global.t('date.hours', Math.floor(datePassed / 3600))
  else if (Math.floor(datePassed / 86400) == 1) return i18n.global.t('date.days', Math.floor(datePassed / 86400))
  else if (Math.floor(datePassed / 86400) <= 7) return i18n.global.t('date.days', Math.floor(datePassed / 86400))
  else if (Math.floor(datePassed / 604800) == 1) return i18n.global.t('date.weeks', Math.floor(datePassed / 604800))
  else if (Math.floor(datePassed / 604800) <= 4) return i18n.global.t('date.weeks', Math.floor(datePassed / 604800))
  else if (Math.floor(datePassed / 2419200) <= 4) return i18n.global.t('date.months', Math.floor(datePassed / 2419200))
  else return i18n.global.t('date.months', Math.floor(datePassed / 2419200))
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

export const makeColorFromString = (name: string) => {
  if (SETTINGS.value.disableColors) {
    return chroma(getComputedStyle(document.documentElement).getPropertyValue("--primaryColor"))
  }

  let ok = Math.floor(
    16777215 *
    Math.sin(
      name
        ?.split("")
        .map((p: string) => p.charCodeAt(0))
        .reduce((x, y) => x + y)! % Math.PI
    )
  )
  return chroma(isNaN(ok) ? "#0000" : ok);
}

export function fixHEX(hexColor: string) {
  // If the code ends with a number, hex code is sometimes broken (completely random lmao)

  if (hexColor.length == 7) return hexColor; // No need for fix

  let fixed = hexColor.slice(0, -1) + "0" + hexColor.slice(-1);
  if (fixed.length != 7) return "#000000";
  else return fixed;
}

export function checkList(postData: PostData): { success: boolean, error?: string, listPos?: number, stamp?: number } {
  let error = (errorText: string, errorPos?: number) => { return { success: false, error: errorText, listPos: errorPos ?? -1, stamp: Math.random(), warn: [0,0,0] } }

  if (!isOnline.value) return error(i18n.global.t('other.disconnected'))

  if (postData.reviewName.length <= 3) return error(i18n.global.t('editor.nameShort'))

  if (postData.levels.length == 0) return error(i18n.global.t('editor.emptyListSend'))

  let i = 0
  let listError: object | undefined
  let allLevelIDs: string[] = []
  postData.levels.forEach(level => {
    if (level.levelName.length == 0) listError = error(i18n.global.t('editor.noNameAt', [i + 1]), i)
    if (level.levelID) allLevelIDs.push(level.levelID)
    if (typeof level.creator == 'string' ? !level.creator.length : !level.creator?.[0]?.[0]?.name) {
      if (typeof level.creator?.[0]?.[0] == 'string') return // Old collabs
      listError = error(i18n.global.t('editor.noCreatorAt', [i + 1]), i)
    }
    if (!level.levelID?.toString().match(/^\d+$/) && level.levelID?.length) listError = error(i18n.global.t('editor.insuccessID', [i + 1]), i)
    i++
  })

  for (let i = 0; i < allLevelIDs.length; i++) {
    for (let j = i+1; j < allLevelIDs.length; j++) {
        if (allLevelIDs[i] == allLevelIDs[j]) {
            return error(i18n.global.t('editor.noDuplicates'))
        }
    }
}

  if (listError != undefined) return <any>listError

  let listSize = JSON.stringify(postData).length
  if (listSize > 25000) return error(i18n.global.t('editor.overLimit', [(listSize / 25000).toFixed(2)]))

  return { success: true, warn: [0,0,0] }
}

export function creatorToCollab(currentName: string): CollabData {
  return [
    [{ name: currentName, role: 0, color: [0, 1, 1], part: [0, 0], socials: [], verified: 0 }],
    [],
    [],
    Math.floor(Math.random() * 1000000),
    []
  ]
}

export const isOnline = ref(true)
window.addEventListener("offline", () => isOnline.value = false)
window.addEventListener("online", () => isOnline.value = true)

export const removeBackup = (isReview = false) => {
  localStorage.removeItem(`${isReview ? 'review' : 'list'}Backup`)
}

export const shortenYTLink = (link: string, disableParams = false) => {
  let params: RegExpMatch1Array
  let shortLink = false
  if (link.match(/(watch\?v=)/g))  // Link is a regular YT link
    params = link.match(/(?<=\?v=).+/g);
  else { // Link is most likely a shortened YT link
    params = link.match(/(?<=youtu.be\/).+/g);
    shortLink = true
  }

  if (!params) return false
  if (disableParams) {
    let removeParams = shortLink ? params[0].match(/(.*)\?/)?.[1] : params[0].match(/(.*)&/)?.[1]
    if (!removeParams) return params[0]
    else return removeParams
  }
  else return params[0]
}

export const lastPFPchange = ref(Date.now())
export const currentCutout = ref(0)
export const currentUID = ref("0")
export const currentUnread = ref(0)
export const notificationCache = ref([[],[]])

export const profileCutouts = [
  'circle()',
  '',
  'polygon(50% 5%, 68% 26%, 100% 40%, 80% 63%, 79% 95%, 50% 88%, 21% 95%, 20% 63%, 0 40%, 30% 26%)',
  'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  'polygon(49% 15%, 75% 25%, 90% 0%, 100% 70%, 80% 95%, 50% 100%, 19% 95%, 0% 70%, 10% 0%, 25% 25%)',
]

export const selectedLevels = ref<Level[]>([])

export const parascroll = ref(0)
let prevScroll = -1
export function manageParallax(e: WheelEvent) {
  if (prevScroll == -1) prevScroll = window.scrollY

  parascroll.value += Math.round((window.scrollY - prevScroll)/3)
  prevScroll = window.scrollY
}

export const getListPreview = (postData: PostData) => {
  let i = 0
  let levels = postData.levels.slice(0, 3).map(l => {
    let name = l.levelName || i18n.global.t('other.unnamesd')
    let creator = typeof l.creator == 'string' ? (l.creator || i18n.global.t('other.unnamesd')) : l.creator[0][0].name
    return `- #${++i}: ${name} - ${creator}`
  })
  return {title: '', preview: levels.join("\n"), counter: i}
}

export var lastTab: (number | string | null)[] = [null, null]
export const modLastTab = (x: [number, string]) => lastTab = x

export const lastUsedTags = ref<number[]>([])