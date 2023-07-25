import chroma from "chroma-js";
import { ref } from "vue";
import type { LevelList, Level, CollabData, LevelBackup } from "./interfaces";
import { SETTINGS } from "./siteSettings";
import { i18n } from "./locales";

export const TAG_COUNT = 27;
export const EMOJI_COUNT = 18;

export const DEFAULT_LEVELLIST: LevelList = {
  description: "",
  pageBGcolor: [180, 0, 2],
  diffGuesser: [false, true, true],
  titleImg: ["", 0, 33, 1, true],
  translucent: false,
  levels: [],
}

export const levelList = ref<LevelList>(DEFAULT_LEVELLIST);

export function makeColor(col?: [number, number, number] | string): [number, number, number] {
  // Random color
  if (typeof col == 'object' && col.length) return col
  else if (typeof col == 'string') return chroma(col).hsl()
  else {
    let randomColor = chroma.hsv(
      Math.floor(Math.random() * 360), 1, Math.random() / 3
    ).hsv()
    return randomColor
  }
}

export function addLevel(values: Level | null) {
  let levelInfo: Level = {
    levelName: values?.levelName ?? "",
    creator: values?.creator ?? "",
    color: makeColor(values?.color),
    levelID: values?.levelID ?? "",
    video: values?.video ?? "",
    difficulty: values?.difficulty ?? [0, 0],
    tags: values?.tags ?? [],
  };

  levelList.value.levels.push(levelInfo);
}

export const deleteLevel = (index: number) => {
  levelList.value.levels.splice(index, 1);
};

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

export const modifyListBG = (newColors: number[] | string) => {
  // Old lists - hex colors
  if (typeof newColors == 'string') newColors = chroma(newColors).hsl()

  let listColor = chroma.hsl(
    newColors[0],
    0.36,
    newColors[2] < 1 ? newColors[2] : newColors[2] / 64
  )

  levelList.value.pageBGcolor = [newColors[0], 0.36, newColors[2]]

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

  (document.getElementById("siteTheme") as HTMLMetaElement).setAttribute(
    "theme-color",
    chroma(chroma.hsl(newColors[0], 0.906, 0.049)).hex()
  );
};

export function checkList(listName: string): { valid: boolean, error?: string, listPos?: number, stamp?: number } {
  let error = (errorText: string, errorPos?: number) => { return { valid: false, error: errorText, listPos: errorPos ?? -1, stamp: Math.random() } }

  if (!isOnline.value) return error(i18n.global.t('other.disconnected'))

  if (listName.length <= 3) return error(i18n.global.t('editor.nameShort'))

  if (levelList.value.levels.length == 0) return error(i18n.global.t('editor.emptyListSend'))

  let i = 0
  let listError: object | undefined
  levelList.value.levels.forEach(level => {
    if (level.levelName.length == 0) listError = error(i18n.global.t('editor.noNameAt', [i + 1]), i)
    if (typeof level.creator == 'string' ? !level.creator.length : !level.creator[0][0].length) listError = error(i18n.global.t('editor.noCreatorAt', [i + 1]), i)
    if (!level.levelID?.match(/^\d+$/) && level.levelID?.length) listError = error(i18n.global.t('editor.invalidID', [i + 1]), i)
    i++
  })
  if (listError != undefined) return <any>listError

  let listSize = JSON.stringify(levelList.value).length
  if (listSize > 25000) return error(i18n.global.t('editor.overLimit', [(listSize / 25000).toFixed(2)]))

  return { valid: true }
}

export function creatorToCollab(currentName: string): CollabData {
  return [[currentName, 0, "Host"], [], []]
}

export const isOnline = ref(true)
window.addEventListener("offline", () => isOnline.value = false)
window.addEventListener("online", () => isOnline.value = true)

export function saveBackup(listName: string, hidden: boolean) {
  if (localStorage && SETTINGS.value.autosave) {
    let backup: LevelBackup = { listName: listName, levelData: JSON.stringify(levelList.value), listHidden: hidden, listDate: Date.now() }

    localStorage.setItem("listBackup", JSON.stringify(backup))
  }
  return Math.random()
}

export const removeBackup = () => {
  localStorage.removeItem("listBackup")
}