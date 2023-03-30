export interface ListPreview {
  name: string
  creator: string
  views: number
  uploadDate: number
  rating: number
}

export interface LevelList {
  description: string
  diffGuesser: [boolean, boolean, boolean] // DG enabled, diffGuess, rateGuess
  pageBGColor: [number, number, number]
  titleImg: [string, number, number, number, boolean]
  translucent: boolean
  levels: Array<Level>
}

export interface Level {
  levelName: string
  creator: string
  levelID: string | null
  video: string | null
  difficulty: [number, number]
  color: [number, number, number]
  tags: LevelTag[]
}

export interface LevelTag {
  tagID: number
  tagName: string | null
  tagLink: string
}

export interface LevelSearchResponse {
  id: string
  name: string
  author: string
  difficulty: number
  cp: number
}