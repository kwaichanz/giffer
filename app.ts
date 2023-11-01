global.ReadableStream = require('web-streams-polyfill').ReadableStream;
globalThis.DOMException || import('node-domexception')

import express from 'express'
import { NextFunction, Request, Response } from "express";
import { FileFilterCallback } from "multer";
import fs from 'fs'
import { FormData } from 'formdata-node'
import { fileFromPath } from "formdata-node/file-from-path"
import { Blob } from "buffer";
import { createWriteStream, readdir } from "fs";
import axios from "axios";
import multer from "multer";
import { createCanvas, Image } from "canvas";
import { promisify } from "util";
import path from 'path'
import cors from 'cors'
import GIFEncoder from 'gif-encoder-2'

type DestinationCallback = (error: Error | null, desitination: string) => void
type FileNamecallback = (error: Error | null, filename: string) => void

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
    credentials: true
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

const storageEngine = multer.diskStorage({
  destination: "./images",
  filename: (req: Request, file: Express.Multer.File, cb: FileNamecallback) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 30000000 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    checkFileType(file, cb);
  },
});

const checkFileType = function (file: Express.Multer.File, cb: FileFilterCallback) {
  const fileTypes = /jpeg|jpg|png|svg/;

  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const whitelist = ["image/png", "image/jpeg", "image/jpg"];
  const mimeType = whitelist.includes(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    console.log('error at file types')
    cb(null, false);
  }
};

const readdirAsync = promisify(readdir);
const imagesFolder = path.join(__dirname, "images");
const gifFolder = path.join(__dirname, "output")

app.post("/make-gif", upload.array("images", 10), async (req: Request, res: Response, next: NextFunction) => {

  // console.log('req files', req?.files)
  if (req.files) {
    // res.send("Multiple files uploaded successsfully");
    console.log("upload success!?");
  } else {
    res.status(400).send("Please upload a valid images");
    console.log("upload failed!?");
  }

  deletedUsedGif()

  const createGifResult = await createGif("neuquant")

  console.log('creating Gif result', createGifResult)

  console.log('finishinggggggg...')
  const data = await uploadGif()
  console.log('dataaaaaaaaaaaaaaaaaaaa', data?.data)

  const gifImageUrl = { data: data?.data?.data?.url } || ""
  console.log('gif image url :', gifImageUrl)

  res.end(JSON.stringify(gifImageUrl))
}
);

async function createGif(algorithm: "neuquant" | "octree") {
  return new Promise<void>(async (resolve1) => {
    // read image directory
    console.log('reading files')
    const files = await readdirAsync(imagesFolder);

    console.log('getting width and height')
    // find the width and height of the image
    const [width, height] = await new Promise((resolve2) => {
      const image = new Image();
      image.onload = () => resolve2([image.width, image.height]);
      image.src = path.join(imagesFolder, files[0]);
    });


    console.log('setting dest path')
    // base GIF filepath on which algorithm is being used
    const dstPath = path.join(
      __dirname,
      "output",
      `intermediate-${algorithm}.gif`
    );

    console.log('wiriting stream')
    // create a write stream for GIF data
    const writeStream = createWriteStream(dstPath);
    // when stream closes GIF is created so resolve promise
    writeStream.on("close", () => {
      console.log('write stream closed')
      resolve1()
    });

    const encoder = new GIFEncoder(1280, 720, algorithm);
    // pipe encoder's read stream to our write stream
    console.log('creating read stream pipe')
    encoder.createReadStream().pipe(writeStream);
    encoder.start();
    encoder.setDelay(500);
    encoder.setQuality(1)

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    console.log('drawing images')
    // draw an image for each file and add frame to encoder
    try {

      for (const file of files) {
        await new Promise<void>((resolve3) => {
          const image = new Image();
          image.onload = () => {
            ctx.drawImage(image, 0, 0);
            encoder.addFrame(ctx);
            resolve3();
          };
          image.src = path.join(imagesFolder, file);
        }).then(() => {
          console.log(' encoding..')
        });
      }
    } catch (err) {
      console.log('creating gif error', err)
    } finally {
      console.log('creating gif successfull!')
      encoder.finish()
      deleteUsedFiles()
      return
    }
  });
}

async function uploadGif() {
  try {

    console.log('path : ', path.join(__dirname, '/output/intermediate-neuquant.gif'))
    console.log('heyyyyyy')

    const data = fs.readFileSync('./output/intermediate-neuquant.gif')

    const file = new File([data], "my-image.gif", { lastModified: Number(new Date()) })
    console.log('fileeeeee', file)
    console.log('type of ', typeof (file))

    const form = new FormData();
    console.log('file fro mpath', await fileFromPath(path.join(__dirname, '/output/intermediate-neuquant.gif')))
    form.set("file", file)

    console.log('formmmmmmmmmmmmmmmmmmmmmmmmmmm', form)
    const res = await axios.post("https://ricematching.ricethailand.go.th/apis/test/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
    // console.log('res', res)
    return res

  } catch (err) {
    console.log('uploading gif error:', err)
  }
}

async function deleteUsedFiles() {
  console.log('deleting files')
  try {

    fs.readdir(imagesFolder, (err, files: string[]) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(imagesFolder, file), (err) => {
          if (err) throw err
        })
      }
    })
  } catch (err) {
    console.log('deleting files error:', err)
  }
}

async function deletedUsedGif() {
  console.log('deleting gif file')
  try {

    fs.readdir(gifFolder, (err, files: string[]) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(gifFolder, file), (err) => {
          if (err) throw err
        })
      }
    })
  } catch (err) {
    console.log('deleting used gif error:', err)
  }
}

function blobToFile(theBlob: Blob, fileName: string): File {
  const b: any = theBlob
  //A Blob() is almost a File() - it's just missing th two properties below
  b.lastModifiedDate = new Date();
  b.name = fileName;

  //Cast to a File() type
  return b as File
}

// Error handler middleware checks after any erorr passed
app.use((req, res, next) => {
  const error = new Error("Not Found") as CustomError
  error.status = 404;
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
