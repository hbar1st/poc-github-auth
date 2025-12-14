// app.js

import "dotenv/config";
import { expressApp } from "./serverSetup.js";
import path from "path";
import { fileURLToPath } from "url";
import { join } from "path";

// app.js

const __filename = fileURLToPath(import.meta.url);
expressApp.set("views", join(path.dirname(__filename), "../views"));
expressApp.set("view engine", "ejs");

/*
import { App } from "oktokit";

const app = new App({
  appId: env.APP_ID,
  privateKey: PRIVATE_KEY,
})

const octokit = await app.getInstallationOctokit(process.env.INSTALLATION_ID)

*/

const port = process.env.PORT || 3000;

const server = expressApp.listen(port, () => {
  console.log(`listening on port ${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error("Server startup error:", err);
  }
  process.exit(1); // Exit the process if a critical error occurs
});

// user authorizes my app 
// my app generates a user access token to use
// the token expires after 8 hours 
// after expiry the app has to refresh the user access token
// if the user revokes access the app will receive the github_app_authorization webhook
// the app should then stop calling the API on behalf of the user
// app should keep access and refresh tokens secure


/**
 * best practices for the app 
 * choose lowest possible github permissions
 * limit access to repos
 * subscribe to webhook events instead of polling
 * consider conditional requests to stay within rate limit
 * 
 * if we hit a rate limit at login time, 
 * use the x-ratelimit-reset response header
 * or Retry-After response header to wait long enough before next call
 * if not available, wait for an exponentially increasing amount of time
 * between retries and throw an error after a specific number of retries
 * (3 ?)
 * 
 * store all keys, tokens, secrets securely
 * consider using a key vault like azure key vault
 * and making it sign-only
 * 
 * 
 */