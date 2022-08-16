import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import {auth} from '../middleware/auth.js';
const router = express.Router();



//function to get/send all products in cart
router.post('/', auth , async function(request, response) {

    const user = request.body.user;
    const result = await client.db("hypekicks-db").collection("cart").find({user: user}).toArray();
    response.send(result);
})


//function to remove product from cart-
router.delete('/', auth ,async function(request, response) {
    const id = request.body.id;
    
    const result = await client.db("hypekicks-db").collection("cart").deleteOne({_id: ObjectId(id)})
    response.send(result);
    console.log(result);

})


//function to update quantity of sneaker in cart
router.put('/', auth, async function(request, response) {

    const id = request.body.id;
    const quantity = request.body.quantity;

    const result = await client.db("hypekicks-db").collection("cart").updateOne({_id: ObjectId(id)}, {$set: {quantity: quantity}})

    response.status(200).send(result);

})



//function to get/send the address of user
router.post('/billing-details', auth ,async function(request, response) {
  
    const username = request.body.username;
    const result = await client.db("hypekicks-db").collection("users").findOne({userName: username})
    response.send(result.address);
})


//function to update address code - 
router.put('/billing-details', auth ,async function(request, response) {

    const address = request.body;
    const username = request.headers.username;
    const result = await client.db("hypekicks-db").collection("users").updateOne({userName: username}, {$set: {address: address}})
    response.send(result);
   
})





//find whether user already exists - 
const findUserOrders = async (username) => {
    const result = await client.db("hypekicks-db").collection("orders").findOne({user: username})
    console.log(result);
    return result
}



// function to Add sneakers to orders collection - 
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