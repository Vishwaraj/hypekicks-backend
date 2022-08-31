import express, { request } from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import { adminAuth } from '../middleware/adminAuth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';




const router = express.Router();

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, '../uploads')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// })

const upload = multer({ dest: "uploads/" });

//function to get all sneakers -->
router.get('/all-sneakers', adminAuth ,async function(request, response) {

    //getting admin token
    const adminToken = request.header('admin-auth-token');
const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();

const latestFirstResult = result.reverse();

response.status(200).send(latestFirstResult);

})


//function to add sneaker -->
router.post('/add-sneakers', adminAuth ,upload.single('image') ,async function(request, response) {

    const image = fs.readFileSync(request.file.path);

    const encodedImage = await image.toString('base64');

    const finalImage = Buffer.from(encodedImage, 'base64');

    const finalSneaker = {...request.body, image: finalImage};
    finalSneaker.price = Number(finalSneaker.price);

    console.log(finalSneaker)

    const result = await client.db("hypekicks-db").collection("sneakers").insertOne(finalSneaker);

    response.status(201).send(result);

})


//function to delete a sneaker -->
router.delete('/all-sneakers', adminAuth ,async function(request, response) {
    
    const id = request.body.id;

    const result = await client.db("hypekicks-db").collection("sneakers").deleteOne({_id: ObjectId(id)})

    response.status(200).send(result);

})


//function to get sneaker for updating
router.get("/update-sneakers/:id", adminAuth ,async function(request, response) {
    const { id } = request.params;

    const result = await client.db("hypekicks-db").collection("sneakers").findOne({_id: ObjectId(id)});

    response.status(200).send(result);

})


//function to update the sneaker --> 
router.put("/update-sneakers/:id", adminAuth, upload.single('image') ,async function(request, response) {

    const image = fs.readFileSync(request.file.path)
    const encodedImage = await image.toString('base64');
    const finalImage = Buffer.from(encodedImage, 'base64');



//getting sneaker id from params
const { id } = request.params;

//converting to number 
request.body.price = Number(request.body.price);

//getting data from body
const data = {...request.body, image: finalImage};
console.log(data)


const result = await client.db("hypekicks-db").collection("sneakers").updateOne({_id: ObjectId(id)}, {$set: data})

response.status(200).send(result);

})



export const adminProductsRouter = router;