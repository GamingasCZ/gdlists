import type { ContainerNames, settings } from "./components/writer/containers";

export interface ListPreview {
  name: string;
  creator: string;
  views?: number;
  uploadDate: number;
  rate_ratio?: number;
  id?: number | string;
  hidden?: string;
  isPinned?: boolean
}


/**
 * Return data after picking a post from the review post showcase container
 *
 * @param number 0 - Showace the post, 1 - Showcase level from the post
 * @param number ID of the list/review/level in question
 * @param number List/Review/Level
 */
export interface selectedList {option: 0|1, postID: number, postType: 0|1|2}

export interface ReviewDetailsResponse {
  reviewID: string
  level_count: string
  gameplay: string
  decoration: string
  difficulty: string
  overall: string
}

export interface ListFetchResponse {
  name: string;
  creator: string;
  id: number;
  data: PostData;
  views: number;
  rate_ratio: number;
  commAmount: number;
  uid: string;
  timestamp: string;
  diffGuesser: number;
  hidden: string;
}

export interface CommentFetchResponse {
  username: string
  comment: string
  comType: string
  bgcolor: string
  listID: string
  comID: string
  verified: string
  timestamp: string
  uid: string
}

export interface LikeFetchResponse {
  result: 'deleted' | 'added'
  ratings: [0 | 1, 0 | 1, number]
}

export interface ListUpdateFetch {
  creator: ""
  name: string
  data: LevelList
  id: number
  timestamp: string
  hidden: '0' | '1'
  uid: string
  rate_ratio: number
  views: number
  diffGuesser: number
}

export interface FavoritedLevel {
  levelName: string;
  creator: string;
  levelID: string;
  levelColor: string;
  levelDiff: [number, number]
  listID: string;
  listName: string;
  listPosition: number;
  timeAdded: number;
}

export interface ViewedPinArray {
  pinned: [(string|number)[], (string|number)[]];
  viewed: [(string|number)[], (string|number)[]];
}

/**
 * Saved collab. This object gets saved into localStorage while in the collab editor and clicking "Save", or when in the Collab Viewer inside a list and clicking save. It's visually shown in Saved, or in the saves section in Collab tools.
 *
 * @param object The entire collab object.
 * @param string Name of the level from {levelList}.
 * @param string Name of the collab host, taken from {CollabData[0].name}.
 * @param number Amount of members in a collab. It's the length of {CollabData[2]}.
 * @param number Identificator. A random number to allow multiple collabs with the same level to be saved.
 * @param timestamp Time when the collab was saved.
 * @param string Level ID of the level where the collab was saved. Used for auto-fetching local collabs when searching for a level.
 * @param array The URL of the list (only the list ID) and the position of the level inside the list.
 */
export interface SavedCollab {
  data: CollabData;
  collabName: string;
  collabHost: string;
  memberCount: number;
  collabID: number;
  timestamp: number;
  levelID: number | "-1";
  listID?: [string, number];
}

/**
 * Collab object. While making a list, this object replaces the creator parameter in {Level}, when you make a new collab in the collab editor.
 *
 * @param array Collab host
 * @param array Array of {CollabRoles}
 * @param array Array of {CollabHumans}. These are all the members of the collab
 * @param number Used to distinguish new collabs from old collabs. Old collabs lack this parameter.
 * @param array Array of role indicies that will be hidden 
 */
export interface CollabData {
  0: [CollabHumans]
  1: string[];
  2: CollabHumans[];
  3: number;
  4: boolean[];
}

/**
 * UNUSED! A role in a collab. All roles are stored within index 1 of {CollabData}.
 * 
 * @param string Name of the role
 * @param number Identifier
 */
export interface CollabRoles {
  name: string;
  id: number;
}


export interface CollabHumans {
  name: string;
  role: number;
  color: [number, number, number] | string;
  part: [number, number];
  socials: HumanSocialLink[];
  verified: 0 | number[];
}

export interface CollabViewerRow {
  roleName: string;
  human: CollabHumans;
  roleCount: number;
}

interface HumanSocialLink {
  0: number; // Site ID
  1: string; // Site Link
}

export interface ListCreatorInfo {
  username: string;
  discord_id: string;
}

export interface LevelBackup {
  listName: string
  levelData: LevelList
  listHidden: '0' | '1'
  listDate: number
  backupID?: number
}

export interface LevelList {
  description: string;
  diffGuesser: [boolean, boolean, boolean]; // DG enabled, diffGuess, rateGuess
  pageBGcolor: string | [number, number, number]; // hex | hsv array
  titleImg: ListBackground; // url, BG top offset [%], BG height, BG XAlign, gradient
  translucent: boolean;
  disComments: boolean;
  levels: Level[];
}

export interface LevelBackground {
  image: ListBackground
  theme: number
  opacity: number
  tile: boolean
  scrolling: 0 | 1 | 2
}

export type LevelScreenshot = [LevelImage, string, string]

export interface Level {
  levelName: string;
  creator: CollabData | string;
  levelID: string | null;
  video: string | null;
  difficulty: [number, number];
  color: [number, number, number];
  tags: LevelTag[];
  platf: boolean;
  ratings?: [number[], number[]]
  BGimage?: LevelBackground
  screenshots?: LevelScreenshot[]
  scShotSecName: string
  commentary: string
}

export enum LevelImage {
  IMAGE = 1,
  VIDEO = 2,
  THUMBNAIL = 4,
  OLD_VIDEO = 8,
}

export interface ListBackground {
  0: string
  1: number
  2: number
  3: 0 | 1 | 2
  4: boolean
}

export interface LevelTag {
  0: number; // tag id
  1: string | -1; // Tag name, -1 = default
  2: string; // Tag Link
}

export interface LevelSearchResponse {
  id: string;
  name: string;
  author: string;
  difficulty: number;
  cp: number;
  platf: boolean
  objCount: number
  downloads: number
  likes: number
  len: 0 | 1 | 2 | 3 | 4
  gameVer: number
  isCopy: boolean
  coins: 0 | 1 | 2 | 3
  twoPlayer: boolean
  selected?: boolean
  thumbnail?: string
}

export interface userDataFetchResponse {
  username: string;
  iconID: number;
  color1: number;
  color2: number;
  glow: boolean;
  socials: [number, string][]
  stars: number;
  demons: number;
  cp: number;
}

export interface viewedPopup {
  diffGuesserHelp?: boolean
  oldListsRedirectHelp?: boolean
  pickedStyling?: boolean
  twitterAd?: boolean
  zenModeHelp?: boolean
}

export interface ytSearchDetails {
  success: boolean;
  videoCount: number;
  titles: string[];
  creators: string[];
  thumbnails: string[];
  links: string[];
  publishTime: string[];
}

export interface ReviewList {
  reviewName: string
  thumbnail: ListBackground
  tagline: string
  containers: ReviewContainer[]
  ratings: ReviewRating[]
  defaultRatings: ReviewRating[]
  settings: ReviewSettings
  private: boolean
  transparentPage: 0 | 1 | 2
  language: number
  whitePage: boolean
  readerMode: boolean
  font: number
  fontTint: boolean
}

export interface ReviewDraft {
  name: string
  createDate: number
  saveDate: number
  wordCount: number
  reviewData: PostData
  previewTitle: string
  previewParagraph: string
  editing?: number
}

export enum DraftAction {
  Remove, Preview, Load, Save, Clone, Disjoin
}

export enum DataContainerAction {
  Move, Remove, MakeParagraph
}

export interface ReviewContainer {
  align: 'left' | 'center' | 'right' | 'justify'
  data: string
  extraComponents: number
  id: number
  settings: settings
  type: ContainerNames
}

export interface ReviewRating {
  name: number | string
  rating: number
  color: [number, number, number]
}

export interface ReviewSettings {
  style: 0 | 1 | 2
}

export interface ReviewContainer {
  type: string
  data: string
  align: TEXT_ALIGNMENTS
  settings: any[]
}
export type TEXT_ALIGNMENTS = "left" | "center" | "right" | "justify"

export interface ImageStorage {
  uid: string
  left: number
  storageMax: number
  filecount: number
  maxFilecount: number
  maxUploadSize: number
}

export interface ImageFolder {
  id: number
  name: string
  color: string
  base?: number
}


export interface LocalNotification {
  title: string
  text: string
  icon: 'save' | 'error' | 'check'
  stamp?: any
}

export enum WriterGallery {
  ReviewBackground = -1,
  LevelImage = -5,
  ReviewThumbnail = -2,
  CarouselItem = -3,
  CarouselModifyItem = -4,
  ImageContainer = 1,
  ImageContainerNested = -1
}

type controlType = "cbox" | "dropdown" | "radio" | "slot" | "inline-slot" | "component"
export interface Setting {
  name: string
  desc?: string
  control: controlType
  controlOptions?: [string, number][] | string[][] | number
  disabled?: boolean
}

export type PostData = ReviewList & LevelList

export type FormattingAction = 'add' | 'preview' | 'align' | 'column' | 'format' | 'splitParagraph' | 'columnCreate'
export type EditorAction = 'save' | 'containerDelete' | 'drafts' | 'containerOptions' | 'shortcutsMenu' | 'resizeSmaller' | 'resizeBigger' | 'moveUp' | 'moveDown' | 'addLevel'

export interface FormattingButton {
	title: string
	icon: string | string[]
	action: [FormattingAction, string | string[]]
	dropdownText?: string[]
	tooltip?: string
	splitAfter?: boolean
	bold?: boolean
}
