import chroma from 'chroma-js'
import { ref } from 'vue'
import type { LevelList, Level, LevelTag } from './interfaces'

export const levelList = ref<LevelList>({
  description: '',
  diffGuesser: [false, false, false],
  pageBGColor: '#0005a3',
  titleImg: ['', 0, 33, 1, true],
  translucent: false,
  levels: []
})

export function addLevel() {
  let levelInfo: Level = {
    levelName: '',
    creator: '',
    color: chroma.hsl(Math.floor(Math.random() * 360), 1, Math.random() / 2).hex(),
    levelID: '',
    video: '',
    difficulty: [0, 0],
    tags: []
  }

  levelList.value.levels.push(levelInfo)
}