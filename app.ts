// global.ReadableStream = require('web-streams-polyfill').ReadableStream;
import { ReadableStream } from "web-streams-polyfill/ponyfill";
const readable = new ReadableStream();

global.DOMException || import('node-domexception')

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { routes } from "./routes";

interface CustomError extends Error {
  status?: number
}

const { PORT, NODE_ENV } = process.env

const isDev = NODE_ENV === "development"

const app = express();

// app.use(cors());
if (isDev) {
  app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: false
  }))
} else {
  // Update this for production
  app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: true
  }))
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", routes)

// Error handler middleware checks after any erorr passed
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error("Not Found") as CustomError
  error.status = 404;
  error.message = `accessed to a not found route : ${req.url}`
  next(error)
})

app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error("\x1b[47m", error)
  if (res.headersSent) {
    return next(error)
  }

  return res.status(error.status || 500).json({
    error: {
      status: error.status || 500,
      message: error.status ? error.message : "Internal Server Error"
    }
  })
})

app.listen(PORT || 4000, () => {
  console.info("Running on port :", PORT || 4000);
}).on('error', (error: Error) => {
  console.error('Error setup server', error)
})
