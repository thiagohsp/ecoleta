import express from 'express'
import knex from './database/connection'

import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const routes = express.Router();
const pointsController = new PointsController
const itemsController = new ItemsController

routes.get(  '/points'      , pointsController.index)
routes.post( '/points'      , pointsController.create)
routes.get(  '/points/:id'  , pointsController.show)

routes.get(  '/items'      , itemsController.index)

export default routes;