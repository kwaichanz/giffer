import { createWriteStream, readdir } from "fs";
import path from "path";
import { promisify } from "util";
import GIFEncoder from 'gif-encoder-2'
import { createCanvas, Image } from "canvas";
import fs from 'fs'
import { imagesFolder } from "../data/data-sources";

const readdirAsync = promisify(readdir);


export default async function createGif(algorithm: "neuquant" | "octree") {
    return new Promise<void>(async (resolve1) => {
        try {

            // read image directory
            console.log('reading files')
            const files = await readdirAsync(imagesFolder);

            console.log('getting width and height')
            // find the width and height of the image
            const [width, height]: [width: number, height: number] = await new Promise((resolve2) => {
                const image = new Image();
                image.onload = () => resolve2([image.width, image.height]);
                image.src = path.join(imagesFolder, files[0]);
            });


            console.log('setting dest path')
            // base GIF filepath on which algorithm is being used
            const dstPath = path.join(
                process.cwd(),
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

            // const encoder = new GIFEncoder(1280, 720, algorithm);
            const encoder = new GIFEncoder(width, height, algorithm);
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

        } catch (err) {
            console.log('error creating gif', err)
        }
    });
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