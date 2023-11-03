import axios from 'axios';
import { fileFromPath } from "formdata-node/file-from-path"
import fs, { readdir } from 'fs'
import path from "path"
import deleteUsedFiles from './deleteUsedFiles';
import { promisify } from 'util';
import { imagesFolder } from '../data/data-sources';
import { Image } from 'canvas';

const readdirAsync = promisify(readdir);


export default async function uploadGif(name?: string) {
    try {

        console.log('path : ', path.join(process.cwd(), '/output/intermediate-neuquant.gif'))

        // Getting gif file
        const data = fs.readFileSync('./output/intermediate-neuquant.gif')

        const file = new File([data], "my-image.gif", { lastModified: Number(new Date()) })
        console.info('fileeeeee', file)
        console.log('type of ', typeof (file))

        // Setting gif file to the form
        const form = new FormData();
        console.log('file from path', await fileFromPath(path.join(process.cwd(), '/output/intermediate-neuquant.gif')))
        form.set("file", file)

        // Getting the first image file
        const files = await readdirAsync(imagesFolder);
        const image = new Image();
        image.src = path.join(imagesFolder, files[0]);
        console.log('image', image)
        console.log('files', files)
        console.log('fileee', files[0])
        console.log('image path', path.join(imagesFolder, files[0]))
        console.log('file 0 from path', await fileFromPath(path.join(imagesFolder, files[0])))
        console.log('fasffsa', path.join(imagesFolder, files[0]))

        const firstImageData = fs.readFileSync(path.join('./images/', files[0]))
        const firstImageFile = new File([firstImageData], "my-picture", { lastModified: Number(new Date()) })
        console.log('frist image file', firstImageFile)

        // Setting the first image file to the form
        if (firstImageFile) {
            form.set("image", firstImageFile)
        }

        // Set the name of the user to the form
        console.info('formmmmmmmmm', form)
        if (name) {
            form.set('name', name)
        }

        // Upload the form to the server
        console.info('formmmmmmmm 2', form)
        // const res = await axios.post("https://ricematching.ricethailand.go.th/apis/test/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
        const res = await axios.post("https://www.gforcesolution.com/app/2023/chanel-cruise/api/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
        // console.log('res', res)
        return res

    } catch (err) {
        console.log('uploading gif error:', err)
    }
}