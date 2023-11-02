import fs from 'fs'
import { gifFolder } from '../data/data-sources';
import path from 'path';

export default async function deletedUsedGif() {
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