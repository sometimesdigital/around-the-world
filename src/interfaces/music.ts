export interface IPlaylist {
  id: string;
  name: string;
  url: string;
}

export interface ISong {
  artist: string;
  genre: string;
  language: string;
  title: string;
  uri: string;
}

export interface IGenre {
  id: number;
  name: string;
}

export interface ILanguage {
  code: string;
  name: string;
}
