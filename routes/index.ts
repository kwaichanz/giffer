import express from 'express'
import { defaultRoute } from './default.route'
import { imagesRoutes } from './images.route'

export const routes = express.Router()

routes.use(defaultRoute)
routes.use(imagesRoutes)