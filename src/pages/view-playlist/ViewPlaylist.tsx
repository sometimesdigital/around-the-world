import { ShareIcon, LinkIcon } from "@components/icons";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlaylistCover } from "@utils/data";
import { ISong } from "@interfaces/music";

import "./view-playlist.css";

export const ViewPlaylist = () => {
  const location = useLocation();

  if (!location.state) {
    return <Navigate to="/"></Navigate>;
  }

  const { playlistID, songs }: { playlistID: string; songs: ISong[] } = location.state;
  const [cover, setCover] = useState("");
  const [opacity, setOpacity] = useState(0);
  const genres = [...new Set(songs.map(({ genre }) => genre))];
  const languages = [...new Set(songs.map(({ language }) => language))];
  const url = `https://open.spotify.com/playlist/${playlistID}`;

  useEffect(() => {
    const retrieveCover = async () => {
      const image = await getPlaylistCover(playlistID);
      setCover(image);
    };

    retrieveCover();
  }, []);

  return (
    <section className="view-playlist" style={{ opacity }}>
      <div className="cover">
        <a href={url}>
          <img
            alt="Cover of the Around the World playlist"
            onLoad={() => setOpacity(1)}
            src={cover}
            title="Around the World"
          />
        </a>
      </div>
      <article>
        <p>{genres.join(" ⯌ ")}</p>
        <p>
          <i>
            in {languages.slice(0, -1).join(", ")}
            {languages.length > 2 ? "," : ""} and {languages.at(-1)}
          </i>
        </p>
        <p>
          <a title="View" className="plain" href={url}>
            <LinkIcon />
          </a>{" "}
          <button
            title="Share"
            className="plain"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigator.share({ url });
            }}
          >
            <ShareIcon />
          </button>
        </p>
      </article>
    </section>
  );
};
