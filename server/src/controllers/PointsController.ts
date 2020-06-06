import knex from '../database/connection'
import {Request, Response} from 'express'

class PointsController {

  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;
    console.log(req.hostname);

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))
  
    const points = await knex('points')
      .join('point_items','points.id','=','point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    const serializedPoints = points.map(point => {
      return {
        ...points,
        image_url: `http://192.168.0.142:3333/uploads/${point.image}`
      }
    })

    return res.json(serializedPoints)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const point = await knex('points').where('id', id).first();
    if (!point) {
      return res.status(400).json({
        message: 'Point not found.'
      })
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)

    const serializedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://localhost:3333/uploads/${item.image}`
      }
    })
      
    return res.json({
      point, items: serializedItems 
    })
  }  
  async create(req: Request, res: Response) {

    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body;

    const trx = await knex.transaction();
  
    const insertedIds = await trx('points').insert({
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }).returning('id')

    console.log(insertedIds);

    const point_id = insertedIds[0];
    
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
      return {
        item_id,
        point_id
      }
    })

    await trx('point_items').insert(pointItems);

    await trx.commit();

    return res.status(200).json({
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      id: point_id
    })
  }
}

export default PointsController