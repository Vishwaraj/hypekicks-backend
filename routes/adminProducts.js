import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import { adminAuth } from '../middleware/adminAuth.js';
const router = express.Router();



router.get('/all-sneakers', adminAuth ,async function(request, response) {

    const adminToken = request.header('admin-auth-token');
const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();

const latestFirstResult = result.reverse();

response.status(200).send(latestFirstResult);

})


router.post('/add-sneakers', adminAuth ,async function(request, response) {
    const sneaker = request.body;

    const result = await client.db("hypekicks-db").collection("sneakers").insertOne(sneaker);

    response.status(201).send(result);

})


router.delete('/all-sneakers', adminAuth ,async function(request, response) {
    
    const id = request.body.id;

    const result = await client.db("hypekicks-db").collection("sneakers").deleteOne({_id: ObjectId(id)})

    response.status(200).send(result);

})


//to get sneaker for updating
router.get("/update-sneakers/:id", adminAuth ,async function(request, response) {
    const { id } = request.params;

    const result = await client.db("hypekicks-db").collection("sneakers").findOne({_id: ObjectId(id)});

    response.status(200).send(result);

})


//to update the sneaker --> 
router.put("/update-sneakers/:id", adminAuth ,async function(request, response) {

const { id } = request.params;
const data = request.body;

const result = await client.db("hypekicks-db").collection("sneakers").updateOne({_id: ObjectId(id)}, {$set: data})

response.status(200).send(result);

})



export const adminProductsRouter = router;