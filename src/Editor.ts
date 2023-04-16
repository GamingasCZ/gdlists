import chroma from "chroma-js";
import { ref } from "vue";
import type { LevelList, Level, LevelTag } from "./interfaces";

export const TAG_COUNT = 27;

export const levelList = ref<LevelList>({
  description: "",
  pageBGcolor: [0, 0, 0.2],
  diffGuesser: [false, true, true],
  titleImg: ["", 0, 33, 1, true],
  translucent: false,
  levels: [],
});

export function addLevel(values: Level | null) {
  let levelInfo: Level = {
    levelName: values?.levelName ?? "",
    creator: values?.creator ?? "",
    color:
      values?.color ??
      chroma(
        Math.floor(Math.random() * 360),
        1,
        Math.random() / 2,
        "hsv"
      ).hsv(),
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

export const modifyListBG = (newColors: number[]) => {
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
