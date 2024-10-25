import { SCOPES } from "@interfaces/users";

export const config = {
  client_id: "63d690649f2c4b548c9509f8ebda8e7f",
  redirect_uri: "https://sometimes.digital/around-the-world",
  scope: [
    SCOPES.USER_TOP_READ,
    SCOPES.USER_READ_PRIVATE,
    SCOPES.USER_READ_EMAIL,
    SCOPES.PLAYLIST_MODIFY_PUBLIC,
    SCOPES.USER_LIBRARY_READ,
  ].join(" "),
};

export const endpoints = {
  auth: "https://accounts.spotify.com/authorize",
  token: "https://accounts.spotify.com/api/token",
};
