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

export interface ListFetchResponse {
  name: string;
  creator: string;
  id: number;
  data: LevelList;
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
  ratings: [0|1, 0|1, number]
}

export interface ListUpdateFetch {
  creator: ""
  name: string
  data: LevelList
  id: number
  timestamp: string
  hidden: '0'|'1'
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

export interface SavedCollab {
  data: CollabData;
  collabName: string;
  collabHost: string;
  memberCount: number;
  collabID: number;
  timestamp: number;
  levelID: number | "-1";
  listID?: number;
}

/**
 * Collab object. While making a list, this object replaces the creator parameter in {Level}, when you make a new collab in the collab editor.
 *
 * @host Collab host
 * @roles Array of {CollabRoles}
 * @members Array of {CollabHumans}. These are all the members of the collab
 * @signature Used to distinguish new collabs from old collabs. Old collabs lack this parameter.
 * @hiddenRoles Array of role indicies that will be hidden 
 */
export interface CollabData {
  0: [CollabHumans]
  1: string[];
  2: CollabHumans[];
  3: number;
  4: number[];
}

/**
 * UNUSED! A role in a collab. All roles are stored within index 1 of {CollabData}.
 * 
 * @name Name of the role
 * @id Identifier
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
  listHidden: '0'|'1'
  listDate: number
}

export interface LevelList {
  description: string;
  diffGuesser: [boolean, boolean, boolean]; // DG enabled, diffGuess, rateGuess
  pageBGcolor: string | [number, number, number]; // hex | hsv array
  titleImg: ListBackground; // url, BG top offset [%], BG height, BG XAlign, gradient
  translucent: boolean;
  disComments: boolean;
  levels: Array<Level>;
}

export interface Level {
  levelName: string;
  creator: CollabData | string;
  levelID: string | null;
  video: string | null;
  difficulty: [number, number];
  color: [number, number, number];
  tags: LevelTag[];
  platf: boolean;
}

export interface ListBackground {
  0: string
  1: number
  2: number
  3: number
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