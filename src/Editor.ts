import chroma from "chroma-js";
import { ref } from "vue";
import type { LevelList, Level, LevelTag, CollabData } from "./interfaces";

export const TAG_COUNT = 27;
export const EMOJI_COUNT = 18;

export const DEFAULT_LEVELLIST: LevelList = {
  description: "",
  pageBGcolor: [0, 0, 0.2],
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
      Math.floor(Math.random() * 360), 1, Math.random() / 2
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

  document.documentElement.style.setProperty(
    "--siteBackground",
    chroma(
      chroma.hsl(
        newColors[0],
        0.36,
        newColors[1] < 1 ? newColors[1] : newColors[1] * 0.015625
      )
    ).hex()
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

export function checkList(listName: string): {valid: boolean, error?: string, listPos?: number, stamp?: number} {
  let error = (errorText: string, errorPos?: number) => { return {valid: false, error: errorText, listPos: errorPos ?? -1, stamp: Math.random()} }

  if (!isOnline.value) return error("Nejsi připojený k internetu!")

  if (listName.length <= 3) return error("Jméno seznamu je moc krátké!")

  if (levelList.value.levels.length == 0) return error("Snažíš se poslat prázdný seznam lmao :D.")
  
  let i = 0
  let listError: object | undefined
  levelList.value.levels.forEach(level => {
    if (level.levelName.length == 0) listError = error(`Level na ${i+1}. místě nemá jméno!`, i)
    if (typeof level.creator == 'string' ? !level.creator.length : !level.creator[0][0].length) listError = error(`Level na ${i+1}. místě nemá tvůrce!`, i)
    if (!level.levelID?.match(/^\d+$/) && level.levelID?.length) listError = error(`Level na ${i+1}. místě má neplatné ID levelu!`, i)
    i++
  })
  if (listError != undefined) return listError

  let listSize = JSON.stringify(levelList.value).length
  if (listSize > 25000) return error(`Tvůj seznam je moc velký. Bohužel musíš odstranit nějaké levely nebo collaby. Jsi o ${(listSize/25000).toFixed(2)}% nad limitem.`)

  return {valid: true}
}

export function creatorToCollab(currentName: string): CollabData {
  return [[currentName, 0, "Host"], [], []]
}

export const isOnline = ref(true)
window.addEventListener("offline", () => isOnline.value = false)
window.addEventListener("online", () => isOnline.value = true)