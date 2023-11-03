import fs from 'fs'
import { imagesFolder } from '../data/data-sources';
import path from 'path';

export default async function deleteUsedFiles() {
    console.log('deleting images files')
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