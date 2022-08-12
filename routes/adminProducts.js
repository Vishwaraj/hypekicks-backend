import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
const router = express.Router();


router.get('/all-sneakers', async function(request, response) {

const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();

const latestFirstResult = result.reverse();

response.status(200).send(latestFirstResult);

})





export const adminProductsRouter = router;