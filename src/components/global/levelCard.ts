import { fixHEX } from "@/Editor";
import type { Level } from "@/interfaces";
import { SETTINGS } from "@/siteSettings";
import chroma, { hex, type Color } from "chroma-js";

export const doFavoriteLevel = (props: Level, favorited: boolean, col: Color) => {
    let faves: FavoritedLevel[] = JSON.parse(localStorage.getItem("favorites")!);
    let favesIDs: string[] = JSON.parse(localStorage.getItem("favoriteIDs")!);
  
    let levelIndex = favesIDs.indexOf(props.levelID!);
    if (levelIndex > -1) {
      favesIDs.splice(levelIndex, 1);
      faves.splice(levelIndex, 1);
    } else {
      favesIDs.push(props.levelID!);
  
  
      let isCollab = typeof props.creator == "object";
      let levelCreator
      if (isCollab) levelCreator = props.creator?.[3] ? props.creator[0][0].name : props.creator[0][0]
      else levelCreator = props.creator
  
      // TODO: add proper list name (list name may not always be sex)
      faves.push({
        levelName: props.levelName,
        creator: levelCreator,
        levelColor: col.hex(),
        levelID: props.levelID!,
        levelDiff: props.difficulty,
        levelRating: props.rating,
        listID: props.listID,
        listName: props.listName,
        listPosition: props.levelIndex,
        timeAdded: Date.now(),
      });
    }
  
    localStorage.setItem("favorites", JSON.stringify(faves));
    localStorage.setItem("favoriteIDs", JSON.stringify(favesIDs));
    return !favorited;
  };

export const fixBrokenColors = (color: string | number[]) => {
    // Old lists may have broken colors!! (damn you, old Gamingas :D)
    if (SETTINGS.value.disableColors)
      return chroma(getComputedStyle(document.documentElement).getPropertyValue("--primaryColor"))

    try {
        return typeof color == 'string' ? chroma(fixHEX(color)) : chroma.hsl(...color);
      } catch (e) {
        return chroma(document.documentElement.style.getPropertyValue("--primaryColor") ||
               getComputedStyle(document.documentElement).getPropertyValue("--primaryColor"));
      }
}

export async function getDifficulty(difficulty: [number, number]) {
    let links = [0, 0]
    if (difficulty) {
      links[0] = await import(`../../images/faces/${difficulty[0]}.webp`).then(res => res.default)
      if (difficulty[1]) { // Must be rated
        links[1] = await import(`../../images/faces/${["","star","featured","epic","legendary","mythic"][difficulty[1]]}.webp`).then(res => res.default)
      }
    }
    return links
  }