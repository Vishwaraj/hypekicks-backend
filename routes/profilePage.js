import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import { auth } from '../middleware/auth.js';
const router = express.Router();



//function to update/add the address -->
router.put('/addresses', auth ,async function(request, response) {
    const address = request.body;
    const userName = request.headers.username;
    
    const findUser = await client.db("hypekicks-db").collection("users")
                .updateOne({userName: userName}, {$set: {address: address}})
                      
    console.log(findUser);
    response.send(findUser);
    
})



//function to get/send the ordered products -->
router.post('/orders', auth ,async function(request, response) {
    
const user = request.body.user;

const result = await client.db("hypekicks-db").collection("orders").find({user: user}).toArray();

const orderedProducts = [];
result.map((order) => {
    order.sneakers.map((prod) => orderedProducts.push(prod));
})
console.log(orderedProducts);

response.send({result: result, products: orderedProducts});

})


//function to update account details -->
router.put('/account-details', auth ,async function(request, response) {
    const user = request.body.user;
    const update = request.body.update;
    
    const result = await client.db("hypekicks-db").collection("users").updateOne({userName: user}, {
        $set: {firstName: update.firstName, lastName: update.lastName, email: update.email}
    })

    response.send(result);
})


//function to send initial data of user account details
router.post('/account-details', auth ,async function(request, response) {
    const user = await request.body.user;


    const result = await client.db("hypekicks-db").collection("users").findOne({userName: user})

    response.send(result);
})



export const profileRouter = router;