import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import {auth} from '../middleware/auth.js';
const router = express.Router();



router.post('/', auth , async function(request, response) {

    const user = request.body.user;
    const result = await client.db("hypekicks-db").collection("cart").find({user: user}).toArray();
    response.send(result);
})


//remove product from cart-
router.delete('/', async function(request, response) {
    const id = request.body.id;
    
    const result = await client.db("hypekicks-db").collection("cart").deleteOne({_id: ObjectId(id)})
    response.send(result);
    console.log(result);

})

router.post('/billing-details', auth ,async function(request, response) {
  
    const username = request.body.username;
    const result = await client.db("hypekicks-db").collection("users").findOne({userName: username})
    response.send(result.address);
})

// update address code - 
router.put('/billing-details', auth ,async function(request, response) {

    const address = request.body;
    const username = request.headers.username;
    const result = await client.db("hypekicks-db").collection("users").updateOne({userName: username}, {$set: {address: address}})
    response.send(result);
   
})


// Add sneakers to orders collection - 


//find whether user already exists - 
const findUserOrders = async (username) => {
    const result = await client.db("hypekicks-db").collection("orders").findOne({user: username})
    console.log(result);
    return result
}




router.post('/order-success', auth ,async function(request, response) {
    const username = await request.body.username;


    const products = await client.db("hypekicks-db").collection("cart").find({}).toArray();


    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const order = {
        user: username,
        sneakers: products,
        date: currentDate,
        time: currentTime
    }

        const result = await client.db("hypekicks-db").collection("orders").insertOne(order);
        console.log('another result', result)

        const emptyCart = await client.db("hypekicks-db").collection("cart").deleteMany({});
        response.send({result:result, emptyCart:emptyCart});


})


export const cartRouter = router;