import { Request, Response, NextFunction } from "express"
import createGif from "../utils/createGif";
import deletedUsedGif from "../utils/deleteUsedGif";
import uploadGif from "../utils/uploadGif";


export const makeGif = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

        const dataToReturn = { ...data?.data, data: data?.data?.data?.url }

        if (gifImageUrl) {
            res.status(200).end(JSON.stringify(dataToReturn))
        } else {
            res.end(JSON.stringify({ message: data?.data?.message }))
        }
    } catch (err) {
        return next(err)
    }

}