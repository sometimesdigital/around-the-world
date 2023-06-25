import React, { useState, useEffect } from 'react';
import Cookies, { set } from 'js-cookie'
import './App.css';
import { SpotifyAuth } from 'react-spotify-auth'
import countries from "./countries.js";
import genres from './genres.js';
import PlayWidget from 'react-spotify-widgets';
import $ from 'jquery'
import Div100vh from 'react-div-100vh'


let Header = () => (
  <header>
    <h1>Around the World</h1>
    <span>Get a playlist based on your music taste with songs from all around the world.</span>
  </header>
)

let Earth = () => (
  <img className="earth" src="earth.png" title="Animation of the Earth"></img>
);

let Footer = () => {
  const [showCredit, setShowCredit] = useState(false);
  return (
    <footer>

      <div>
        <a href="https://twitter.com/halfelfnomad" title="Find me on Twitter">
          <div data-icon="ei-sc-twitter" data-size="s"></div>
        </a>
        <a href="https://nonnullish.github.io" title="Blog">
          <div data-icon="ei-pencil" data-size="s"></div>
        </a>
        <a href="#" onClick={() => showCredit ? setShowCredit(false) : setShowCredit(true)} title="Credit">
          <div data-icon="ei-tag" data-size="s"></div>
        </a>
      </div>

      <div style={{ visibility: showCredit ? "visible" : "hidden" }}>
        Earth animation by&nbsp;
        <a href="https://commons.wikimedia.org/wiki/File:Rotating_earth_(huge).gif"
          title="via Wikimedia Commons">The MP</a>/
        <a href="https://creativecommons.org/licenses/by/3.0">CC BY</a>
      </div>
      <div>
        <a href="https://www.spotify.com/account/apps/">revoking account permissions</a>
      </div>
    </footer>
  )
}


function App() {
  const [token, setToken] = useState(Cookies.get('spotifyAuthToken'))
  const [userData, setUserData] = useState("");
  const [userGenres, setUserGenres] = useState([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [playlist, setPlaylist] = useState("");
  const [searchedCountryString, setSearchedCountryString] = useState("");
  const [searchedGenreString, setSearchedGenreString] = useState("");
  const [error, setError] = useState(false);
  let trackList = [];
  let playlistUris = [];


  useEffect(() => {
    setToken(Cookies.get('spotifyAuthToken'))
  }, [])

  let findMostCommon = (array) => {
    let mapped = new Map();
    for (let i in array) {
      if (mapped.has(array[i])) {
        mapped.set(array[i], mapped.get(array[i]) + 1);
      } else {
        mapped.set(array[i], 1)
      }
    }
    mapped[Symbol.iterator] = function* () {
      yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    }

    let result = [];
    for (let i = [...mapped].length - 1; i > 0; i--) {
      result.push([...mapped][i][0])
    }
    return result;
  }

  let pickRandom = (array, n) => {
    let result = [];
    for (let i = 0; i < n; i++) {
      result.push(array[~~(Math.random() * array.length)]);
    }
    if (result.length === 1) {
      return result[0];
    }
    return result;
  };

  let fetchUserData = () => {
    fetch("https://api.spotify.com/v1/me", {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    })
      .then(response => response.json())
      .then((result => {
        setUserData(result);
      }))
  }
  let genresCopy = [];

  let fetchGenres = () => {
    fetch("https://api.spotify.com/v1/me/top/artists", {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    })
      .then(response => response.json())
      .then((result => {
        if (result !== "") {
          for (let artist in result.items) {
            genresCopy = genresCopy.concat(result.items[artist].genres);
          }
          genresCopy = findMostCommon(genresCopy);
          let genresCommon = [];
          let genreList = genres.music_genre_list;
          for (let i = 0; i < genresCopy.length; i++) {
            for (let j = 0; j < genreList.length; j++) {
              if (genresCopy[i] === genreList[j].music_genre.music_genre_name.toLowerCase()) {
                genresCommon.push(genreList[j].music_genre.music_genre_name)
              }
            }
          }
          setUserGenres(genresCommon)
        }
      }))
  }

  let searchOnSpotify = async (track) => {
    let url = new URL("https://api.spotify.com/v1/search"),
      params = {
        q: track,
        type: "track"
      };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    })

      .then(response => response.json())
      .then((result) => {
        if (result.tracks.items.length > 0) {
          let chosenSong = result.tracks.items[0];
          if (!trackList.includes(chosenSong)) {
            trackList.push(chosenSong);
          }
        }
      })

  }

  let callMusixMatch = async () => {
    while (trackList.length < 8 && !error) {
      let randomCountryIndex = ~~(Math.random() * countries.length);
      let searchedCountry = Object.values(countries[randomCountryIndex])[0];
      setSearchedCountryString(Object.keys(countries[randomCountryIndex])[0])

      let genreIndex = 34; // default music index
      let randomGenre = pickRandom(userGenres, 1);
      let genreList = genres.music_genre_list;
      for (let i = 0; i < genreList.length; i++) {
        if (randomGenre === genreList[i].music_genre.music_genre_name) {
          genreIndex = genreList[i].music_genre.music_genre_id;
          setSearchedGenreString(genreList[i].music_genre.music_genre_name);
          break;
        }
      }

      let searchedSongs = [];

      $.ajax({
        type: "GET",
        data: {
          f_music_genre_id: genreIndex,
          f_lyrics_language: searchedCountry,
          s_track_rating: "desc",
          apikey: "a5fea953a062ff6de4d9527e1ef01c01",
          format: "jsonp"
        },
        url: "https://api.musixmatch.com/ws/1.1/track.search?",
        dataType: "jsonp",
        success: (data) => {
          if (data.message.body.track_list.length > 0) {
            let chosenSong = data.message.body.track_list[0].track;
            if (chosenSong && !searchedSongs.includes(chosenSong)) {
              searchedSongs.push(chosenSong.track_name);
              searchOnSpotify(chosenSong.track_name);
            }
          }
        },
        error: () => { setError(true) }
      })
      await new Promise((r) => setTimeout(r, 500));
    }
    playlistUris = trackList.map(track => track.uri);
    createPlaylist();
  }

  let createPlaylist = () => {
    let url = new URL("https://api.spotify.com/v1/users/" + userData.id + "/playlists");

    fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({
        name: "Around the World · for " + userData.display_name.split(" ")[0],
        public: true,
        collaborative: false,
        description: "",
      })
    })
      .then(response => response.json())
      .then((result => {
        fetch("https://api.spotify.com/v1/playlists/" + result.id + "/tracks", {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify({
            uris: playlistUris,
          })
        })
          .then(fetch("https://api.spotify.com/v1/me/playlists", {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
          })
            .then(response => response.json())
            .then(result => { setPlaylist(result.items[0]) })
          )
      }))
    setLoadingPlaylist(false)
  };

  let generatePlaylist = () => {
    setLoadingPlaylist(true);
    callMusixMatch();
  }

  let Info = () => {
    if (error) {
      return (<span>An error occurred: the maximum number of daily users has been exceeded.</span>)
    }
    else if (playlist) {
      let twitterLink = `https://twitter.com/intent/tweet?url=${playlist.external_urls.spotify}`
      return (
        <>
          <p>Your playlist has been saved to your account.</p>
          <p><a href={twitterLink}>Share it on Twitter</a></p>
        </>
      )
    }
    if (searchedGenreString !== "" && searchedCountryString !== "") {
      return (
        <span style={{ textAlign: "center" }}>
          Searching for {searchedGenreString} in {searchedCountryString}.<br />
          <span style={{ fontSize: "smaller" }}>(This may take up to a couple of minutes).</span>
        </span>
      )
    } else return ("Loading...")
  }

  if (token) {
    if (!userData) {
      fetchUserData();
      fetchGenres();
    }
    return (
      <Div100vh>
        <div className="container">
          <Header />
          <div className="mainView">
            {playlist && !error ?
              <PlayWidget
                width={480}
                height={480}
                uri={playlist.uri}
                viewCoverArt={true}
              /> : <Earth />}
          </div>
          <div className="info">
            {error || loadingPlaylist || playlist ?
              <Info /> :
              <button
                className="generatePlaylistButton"
                disabled={loadingPlaylist}
                title="Get Your Playlist"
                onClick={() => generatePlaylist()}>
                Get Your Playlist
            </button>}
          </div>
          <Footer />
        </div>
      </Div100vh>

    )
  } else return (
    <Div100vh>
      <div className="container">
        <Header />
        <div className="mainView">
          <Earth />
        </div>
        <div className="info">
          <SpotifyAuth
            redirectUri='https://nonnullish.github.io/around-the-world'
            clientID='63d690649f2c4b548c9509f8ebda8e7f'
            scopes={[
              'user-top-read',
              'playlist-modify-public']}
          />
        </div>
        <Footer />
      </div>
    </Div100vh>
  )

}

export default App;
