import crypto from "crypto";

// Generate a random string of 32 bytes and convert it to a hex string (64 characters long)
console.log(crypto.randomBytes(32).toString("hex"));
