import b64toBlob from "b64-to-blob";
import { NextFunction, Request, Response } from "express";
import { FileFilterCallback } from "multer";

const GIFEncoder = require("gif-encoder-2");
const { createCanvas, Image } = require("canvas");
const { createWriteStream, readdir } = require("fs");
const { promisify } = require("util");
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const axios = require("axios");
const fs = require('fs')
const FormData = require('form-data')

const port = process.env.PORT || 4000;

type DestinationCallback = (error: Error | null, desitination: string) => void
type FileNamecallback = (error: Error | null, filename: string) => void

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

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

    // const mimeType = fileTypes.test(file.mimeType);
    const whitelist = ["image/png", "image/jpeg", "image/jpg"];
    const mimeType = whitelist.includes(file.mimetype);
    // const mimeType = whitelist.forEach((item) => {
    //   console.log("i m ", item.mimetype);
    //   console.log("f m", file.mimetype);
    //   item == file.mimetype;
    // });

    // console.log("fileee", file);
    // console.log("extName", extName);
    // console.log("mimetype", mimetype);
    if (extName && mimeType) {
        return cb(null, true);
    } else {
        console.log('error at file types')
        cb(null, false);
    }
};

const readdirAsync = promisify(readdir);
const imagesFolder = path.join(__dirname, "images");

app.post("/make-gif", upload.array("images", 3), async (req: Request, res: Response, next: NextFunction) => {
    const body = req;
    // console.log("body", body);
    // console.log("req.files", req.files);

    if (req.files) {
        res.send("Multiple files uploaded successsfully");
        console.log("upload success!?");
    } else {
        res.status(400).send("Please upload a valid images");
        console.log("upload failed!?");
    }

    // createGif("neuquant");

    // deleteUsedFiles()
    try {

        //Upload and make gif
        const createResult = createGif("neuquant").then(a => {
            console.log('aaaaa', a)
            uploadGif().then(e => {
                console.log('e')
            })
        })

        // Upload said gif
        // const uploadGifResult = uploadGif();

        console.log('create result', createResult)
        // console.log('make gif result', uploadGifResult)
    } catch (err) {
        console.log('errrrrrr', err)
    } finally {
        console.log('deleting files')
        fs.readdir(imagesFolder, (err: Error, files: File[]) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(imagesFolder, file), (err: Error) => {
                    if (err) throw err
                })
            }
        })
    }

});

async function createGif(algorithm: "neuquant" | "octree") {
    return new Promise(async (resolve1) => {
        // read image directory
        const files = await readdirAsync(imagesFolder);

        // find the width and height of the image
        const [width, height] = await new Promise((resolve2) => {
            const image = new Image();
            image.onload = () => resolve2([image.width, image.height]);
            image.src = path.join(imagesFolder, files[0]);
        });


        // base GIF filepath on which algorithm is being used
        const dstPath = path.join(
            __dirname,
            "output",
            `intermediate-${algorithm}.gif`
        );
        // create a write stream for GIF data
        const writeStream = createWriteStream(dstPath);
        // when stream closes GIF is created so resolve promise
        writeStream.on("close", () => {

            resolve1(Promise<void>)
        });

        const encoder = new GIFEncoder(width, height, algorithm);
        // pipe encoder's read stream to our write stream
        encoder.createReadStream().pipe(writeStream);
        encoder.start();
        encoder.setDelay(200);

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // draw an image for each file and add frame to encoder
        for (const file of files) {
            await new Promise((resolve3) => {
                const image = new Image();
                image.onload = () => {
                    ctx.drawImage(image, 0, 0);
                    encoder.addFrame(ctx);
                    resolve3(Promise<void>);
                };
                image.src = path.join(imagesFolder, file);
            });
        }
    });

}

async function uploadGif() {
    console.log('path : ', path.join(__dirname, '/output/intermediate-neuquant.gif'))
    try {

        // const imgData = fs.readFileSync('./output/intermediate-neuquant.gif')

        // console.log('imgData', imgData)

        ///////////////////

        // const binaryData = await fs.readFileSync("./output/intermediate-neuquant.gif")
        // console.log('binary data', binaryData)
        // const base64string = new Buffer(binaryData).toString('base64')
        // console.log('base64 string', base64string)

        // const blob = uploadBase64Image(base64string)

        // console.log('blobby', blob)

        ///////////////////
        const imageFilePath = './output/intermediate-neuquant.gif'
        if (fs.existsSync(imageFilePath)) {

            const f = fs.createReadStream(imageFilePath)

            f.on('data', function (chunk: any) {
                console.log('chunkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', chunk)
            })
            // Create a Formdata object
            const formdata = new FormData();
            formdata.append('file', fs.createReadStream(imageFilePath))
            console.log('formdataaaaatatat', formdata)
            const res = await axios.post("https://ricematching.ricethailand.go.th/apis/test/upload", formdata, { header: { "Content-Type": "multipart/form-data" } })
            console.log('ressssss', res)

        } else {
            console.log('elseeee')
        }

        /////////////////

        // const form = new FormData();
        // form.append('file', content, {
        //   contentType: 'image/gif',
        //   filename: 'intermediate-neuquant.gif'
        // })
        // const res = await axios.post("https://ricematching.ricethailand.go.th/apis/test/upload", form, { header: { "Content-Type": "multipart/form-data" } })

        // console.log('res', res)
    } catch (err) {
        console.log('error', err)
    }
}


function uploadBase64Image(image64: any) {
    // Split the base64 string in data and contentType
    var block = image64.split(";");
    // Get the content type of the image
    var contentType = block[0].split(":")[1]; // In this case "image/gif"
    // get the real base64 content of the file
    var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."

    // Convert it to a blob to upload
    var blob = b64toBlob(realData, contentType);

    // Create a FormData and append the file with image as aprarameter name
    var formData = new FormData()

    formData.append("file", blob)

    return formData
}

// createGif("neuquant");
// createGif("octree");

app.listen(port, () => {
    console.log("server is running on port", port);
});
