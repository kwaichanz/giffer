import { Request, Response, NextFunction } from "express"
import createGif from "../utils/createGif";
import deletedUsedGif from "../utils/deleteUsedGif";
import uploadGif from "../utils/uploadGif";
import deleteUsedFiles from "../utils/deleteUsedFiles";


export const makeGif = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log('req files', req?.files)
        if (req.files) {
            console.log('req body', req.body)
            // res.send("Multiple files uploaded successsfully");
            console.log("upload success!?");
            console.log('req.files', req.files)

        } else {
            res.status(400).send("Please upload a valid images");
            console.log("upload failed!?");
        }


        const createGifResult = await createGif("neuquant")

        console.log('creating Gif result', createGifResult)

        console.log('finishinggggggg...')
        const data = await uploadGif(req?.body?.name)
        console.log('dataaaaaaaaaaaaaaaaaaaa', data?.data)

        // const gifImageUrl = { data: data?.data?.imgUrl } || ""
        // console.log('gif image url :', gifImageUrl)

        // const dataToReturn = { ...data?.data, data: data?.data?.data?.url }
        const dataToReturn = data?.data
        console.log('data to return :', dataToReturn)

        if (dataToReturn) {
            res.status(200).end(JSON.stringify(dataToReturn))
        } else {
            res.end(JSON.stringify({ message: data?.data?.message }))
        }
    } catch (err) {
        return next(err)
    } finally {
        deleteUsedFiles()
        deletedUsedGif()
    }

}