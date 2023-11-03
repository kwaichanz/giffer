import { Request } from "express";
import multer from "multer";
import { FileFilterCallback } from "multer";
import path from "path";

type DestinationCallback = (error: Error | null, desitination: string) => void
type FileNamecallback = (error: Error | null, filename: string) => void

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
        console.log('multer file :', file)
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
        console.log('extName', extName)
        console.log('mimeType', mimeType)
        console.log('error at file types')
        cb(null, false);
    }
};

export {
    upload
}