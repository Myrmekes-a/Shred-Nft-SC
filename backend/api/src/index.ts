import express from "express";
import { Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { NowRequest, NowResponse } from "@vercel/node";
import dotenv from "dotenv";
dotenv.config();

import { rebirthTxSign } from "./scripts";

const app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);

app.get("/", async (req: Request, res: Response) => {
  res.status(404).send("Sign SAGC Update Authority BE is running");
});

app.post("/", async (req: Request, res: Response) => {
  const { tx } = req.body;
  if (!tx) {
    return res.status(400).json({ err: "Invalid tx request" });
  }

  try {
    const result = await rebirthTxSign(req.body.tx);

    return res.status(200).json(result);
  } catch (e: any) {
    console.error(e.message);

    return res.status(500).json(e);
  }
});

let port = process.env.PORT ?? 80;
server.listen(port, async () => {
  console.log("--@ Start: Listening on http://localhost:", port);
});

//module.exports = app
