import { env } from "node:process";
import { default as express } from "express";
import { setTimeout } from "node:timers/promises";
import { exit } from "process";
import cors from "cors";
import "dotenv/config";

const expressApp = express();

if (env.NODE_ENV === "production") {
  console.log("This is a production environment");

  expressApp.set("trust proxy", 1); // trust first proxy only because of deployment to Render?
}

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());

expressApp.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true, // allow cookies,
    allowedHeaders: ["Content-Type", "Authorization"], // may not need to specify Authorization
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // may not need this
  })
);

expressApp.use(express.urlencoded({ extended: true }));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

function parseResponse(response) {
  console.log("in parseResponse");
  if (response.ok) {
    return response.json(); // parse JSON body
  } else {
    console.error(response);
    return response.text().then((body) => {
      console.error(body);
      return {}; // return empty object on error
    });
  }
}

async function exchangeCode(code) {
  console.log("in exchangeCode");
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code,
  });

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: params,
  });

  return parseResponse(response);
}

expressApp.get("/", (req, res) => {
  res.render("index", {
    message: "Proof Of Concept app for github login",
    CLIENT_ID,
  });
});

expressApp.get("/github", async (req, res) => {
  console.log("in the github callback route");
  const code = req.query.code;

  //res.render("login", { message: `Successfully authorized! Got code ${code}.` });

  try {
    const result = await exchangeCode(code);
    console.log("Access token response:", result);
    if (result["access_token"]) {
      // store the access_token AND the refresh_token!
      const token = result["access_token"];
      //res.render("login", { message: `Successfully authorized! Got code ${code} and exchanged it for a user access token ending in ${token.slice(-10)}.` })

      const userInfo = await getUserInfo(token);

      console.log(userInfo);
      const handle = userInfo.login; //hbar1st for myself for eg
      const avatar_url = userInfo.avatar_url;

      res.render("login", {
        message: `Successfully authorized! Welcome, (${handle}).`,
        avatar: avatar_url,
      });
    } else {

      res.render("login", {
        message: `Authorized, but unable to exchange code ${code} for token.`,
      });
    }
  } catch (error) {
    console.error("Error exchanging code:", error);
  }
});

async function getUserInfo(token) {
  console.log("in getUserInfo");
  const response = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "poc github login", // GitHub requires a User-Agent header
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    console.error("Response:", response.status, response.statusText);
    const body = await response.text();
    console.error("Body:", body);
    return {}; // return empty object on error
  }
}

export { expressApp };
