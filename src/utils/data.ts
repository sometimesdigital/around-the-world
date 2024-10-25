import $ from "jquery";
import { currentToken } from "./auth";
import { api, group, sortByOccurrence } from "./utils";
import { toast } from "sonner";

import { languages } from "@data/languages";
import { genres } from "@data/genres";
import { ISong } from "@interfaces/music";

export const getUserData = async () => {
  const endpoint = "https://api.spotify.com/v1/me";
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };

  return await api({
    endpoint,
    headers,
    onError: () => toast.error("Error: Couldn't get user data"),
  });
};

export const getFavoriteGenres = async (): Promise<string[]> => {
  const endpoint = "https://api.spotify.com/v1/me/top/artists";
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };

  const data = await api({
    endpoint,
    headers,
    onError: () => toast.error("Error: Couldn't get the favorite artists"),
  });

  const userGenres = data.items.flatMap(({ genres }: { genres: string[] }) => genres);

  if (userGenres.length === 0) {
    toast.error("Error: It appears you haven't listened to enough music recently to determine any favorites.");
    return [];
  }

  const sortedGenres = [...new Set(sortByOccurrence(userGenres))];
  const filteredGenres = genres.filter(({ name }) => sortedGenres.includes(name));

  return filteredGenres.slice(0, 10).map(({ name }) => name);
};

const findOnSpotify = async (track: string) => {
  const params = new URLSearchParams({
    q: track,
    type: "track",
  });

  const query = params.toString();
  const endpoint = new URL(`https://api.spotify.com/v1/search?${query}`).toString();
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };

  const result = await api({
    endpoint,
    headers,
  });

  return result.tracks?.items?.at(0);
};

export async function* getSongs(userGenres: string[]) {
  const songs = <ISong[]>[];
  const filteredGenres = genres.filter(({ name }) => userGenres.includes(name));

  while (songs.length < 8) {
    const language = languages[Math.floor(Math.random() * languages.length)];
    const genre = filteredGenres[Math.floor(Math.random() * filteredGenres.length)] ?? genres[0];
    const url = "https://api.musixmatch.com/ws/1.1/track.search";
    const query = {
      f_music_genre_id: genre.id.toString(),
      f_lyrics_language: language.code,
      s_track_rating: "desc",
      apikey: "a5fea953a062ff6de4d9527e1ef01c01",
    };

    const data = await getJSONP({ url, query });

    if (data.message.body.track_list.length === 0) {
      yield { language, genre, songs };
      continue;
    }

    const title = data.message.body.track_list[0].track.track_name;

    if (songs.find((song) => song.title === title)) {
      yield { language, genre, songs };
      continue;
    }

    const song = await findOnSpotify(title);

    songs.push({
      title,
      genre: genre.name,
      artist: song.artists.map(({ name }: { name: string }) => name).join(", "),
      language: language.name,
      uri: song.uri,
    });

    yield { language, genre, songs };
  }
}

export const getPlaylistCover = async (playlistID: string) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${playlistID}?fields=images`;
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };

  const response = await api({
    endpoint,
    headers,
    onError: () => toast.error("Error: Couldn't get the playlist cover"),
  });

  return response.images.at(0).url;
};

export const createPlaylist = async (user: string) => {
  const endpoint = `https://api.spotify.com/v1/users/${user}/playlists`;
  const headers = {
    Authorization: `Bearer ${currentToken.access_token}`,
    "Content-Type": "application/json",
  };

  const body = {
    name: "Around the World",
    public: true,
    collaborative: false,
  };

  const data = await api({
    endpoint,
    method: "POST",
    headers,
    body: JSON.stringify(body),
    onError: () => toast.error("Error: Couldn't create a new playlist"),
  });

  return data;
};

export async function* saveSongsQuery(playlistID: string, songs: string[]) {
  const query = async (body: string) => {
    const endpoint = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
    const headers = {
      Authorization: `Bearer ${currentToken.access_token}`,
      "Content-Type": "application/json",
    };

    return await api({
      body,
      endpoint,
      headers,
      method: "POST",
      onError: () => toast.error("Error: Couldn't save the songs"),
    });
  };

  const limit = 100;
  const pages = group<string>(songs, limit);
  let progress = 0;

  for await (const uris of pages) {
    const body = JSON.stringify({ uris });
    await query(body);
    progress = progress + uris.length;

    yield { progress, total: songs.length };
  }
}

export const getJSONP = async ({ url, query, onError }: any) => {
  // using the jQuery AJAX method with the 'jsonp' datatype bypasses CORS restrictions:
  // the server responds with a JavaScript callback function that contains the data
  // which allows cross-origin data retrieval

  return await $.ajax({
    type: "GET",
    data: {
      ...query,
      format: "jsonp",
    },
    url,
    dataType: "jsonp",
    success: (data: any) => data,
    error: (error: any) => onError(error),
  });
};
