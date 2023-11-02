import { NextFunction, Request, Response, Router } from "express";
import { upload } from '../utils/uploadImage'
import { makeGif } from "../controllers/images.controller"

export const imagesRoutes = Router()

imagesRoutes.get("/images", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello from images route")
})

imagesRoutes.get("/make-gif", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello from make gif route")
})
imagesRoutes.post("/make-gif", upload.array("images", 10), makeGif)
