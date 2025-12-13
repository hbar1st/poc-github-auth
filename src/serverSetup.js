import { env } from "node:process";
import { default as express } from "express";

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

export { expressApp }
