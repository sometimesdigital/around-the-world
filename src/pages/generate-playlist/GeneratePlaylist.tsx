import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@components/button";
import { IUser } from "@interfaces/users";
import { createPlaylist, getFavoriteGenres, getSongs, saveSongsQuery } from "@utils/data";

type IFetchingState =
  | {
      state: true;
      message: string;
    }
  | { state: false };

export const GeneratePlaylist = ({ user }: { user?: IUser }) => {
  const [isFetching, setIsFetching] = useState<IFetchingState>({ state: false });

  const navigate = useNavigate();

  const length = 8;

  if (!user) {
    return <Navigate to="./authorize" replace />;
  }

  const retrieveSongs = async (genres: string[]) => {
    for await (const request of getSongs(genres)) {
      setIsFetching({ state: true, message: `Searching for ${request.genre.name} in ${request.language.name}...` });

      if (request.songs.length === length) {
        return request.songs;
      }
    }
  };

  const save = async (playlistID: string, songs: string[]) => {
    for await (const request of saveSongsQuery(playlistID, songs)) {
      setIsFetching({ state: true, message: `Saved ${request.progress} songs out of ${request.total}.` });
    }
  };

  const create = async ({ id }: IUser) => {
    setIsFetching({ state: true, message: "Looking up favorite genres..." });

    const genres = await getFavoriteGenres();

    if (!genres.length) {
      setIsFetching({ state: false });
      return;
    }

    const songs = await retrieveSongs(genres);

    if (!songs) {
      setIsFetching({ state: false });
      return;
    }

    const { id: playlistID } = await createPlaylist(id);

    await save(
      playlistID,
      songs.map(({ uri }) => uri)
    );

    setIsFetching({ state: false });
    navigate("/done", { state: { playlistID, songs } });
  };

  return (
    <section className="section">
      {isFetching.state && <p>{isFetching.message}</p>}
      {!isFetching.state && (
        <>
          <p className="text-center">Discover music in every language and find songs you'll love.</p>
          <div className="generate-playlist">
            <Button onClick={() => create(user)}>Generate Your Playlist</Button>
          </div>
        </>
      )}
    </section>
  );
};
