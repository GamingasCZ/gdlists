export interface ListPreview {
  name: string;
  creator: string;
  views?: number;
  uploadDate: number;
  rate_ratio?: number;
  id?: number | string;
  hidden?: string;
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

export interface FavoritedLevel {
  levelName: string;
  creator: string;
  levelID: string;
  levelColor: string;
  listID: string;
  listName: string;
  listPosition: number;
  timeAdded: number;
}

export interface CollabData {
  0: [string, number, string]; // 'Host' name, Host verified, Host title
  1: CollabRoles[];
  2: CollabHumans[];
}

interface CollabRoles {
  name: string;
  id: number;
}

interface CollabHumans {
  name: string;
  role: number;
  color: string;
  part: [string, string];
  socials: HumanSocialLink[];
  verified: number | number[];
}

interface HumanSocialLink {
  0: number; // Site ID
  1: string; // Site Link
}

export interface ListCreatorInfo {
  username: string;
  discord_id: string;
}

export interface LevelList {
  description: string;
  diffGuesser: [boolean, boolean, boolean]; // DG enabled, diffGuess, rateGuess
  pageBGcolor: string | [number, number, number]; // hex | hsv array
  titleImg: [string, number, number, number, boolean]; // url, BG top offset [%], BG height, BG XAlign, gradient
  translucent: boolean;
  levels: Array<Level>;
}

export interface Level {
  levelName: string;
  creator: string;
  levelID: string | null;
  video: string | null;
  difficulty: [number, number];
  color: [number, number, number];
  tags: LevelTag[];
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
