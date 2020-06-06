import express from 'express'
import { celebrate, Joi } from "celebrate";

import multer from 'multer'
import multerCfg from "./config/multer";

import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const routes = express.Router();
const upload = multer(multerCfg);

const pointsController = new PointsController
const itemsController = new ItemsController

/***
 * ROUTES: Points
 */
routes.get(  '/points'      , pointsController.index)
routes.get(  '/points/:id'  , pointsController.show)
routes.post( '/points'      , 
  upload.single('image') , 
  celebrate({
    body : Joi.object().keys({
      name      : Joi.string().required(),
      email     : Joi.string().required(),
      whatsapp  : Joi.number().required(),
      latitude  : Joi.number().required(),
      longitude : Joi.number().required(),
      city      : Joi.string().required(),
      uf        : Joi.string().required().max(2),
      items     : Joi.string().regex(/^\d+,\d+$/).required()
    })
  },{
    abortEarly: false,
  }),
  pointsController.create)

/***
 * ROUTES: Items
 */
routes.get(  '/items'      , itemsController.index)

export default routes;