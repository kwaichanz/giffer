import axios from 'axios';
import { fileFromPath } from "formdata-node/file-from-path"
import fs from 'fs'
import path from "path"

export default async function uploadGif() {
    try {

        console.log('path : ', path.join(process.cwd(), '/output/intermediate-neuquant.gif'))
        console.log('heyyyyyy')

        const data = fs.readFileSync('./output/intermediate-neuquant.gif')

        const file = new File([data], "my-image.gif", { lastModified: Number(new Date()) })
        console.log('fileeeeee', file)
        console.log('type of ', typeof (file))

        const form = new FormData();
        console.log('file fro mpath', await fileFromPath(path.join(process.cwd(), '/output/intermediate-neuquant.gif')))
        form.set("file", file)

        console.log('formmmmmmmmmmmmmmmmmmmmmmmmmmm', form)
        const res = await axios.post("https://ricematching.ricethailand.go.th/apis/test/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
        // console.log('res', res)
        return res

    } catch (err) {
        console.log('uploading gif error:', err)
    }
}