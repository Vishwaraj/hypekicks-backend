import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
const router = express.Router();


router.put('/addresses', async function(request, response) {
    const address = request.body;
    const userName = request.headers.username;
    
    const findUser = await client.db("hypekicks-db").collection("users")
                .updateOne({userName: userName}, {$set: {address: address}})
                      
    console.log(findUser);
    response.send(findUser);
    


})




router.post('/orders', async function(request, response) {
    
const user = request.body.user;

const result = await client.db("hypekicks-db").collection("orders").find({user: user}).toArray();

const orderedProducts = [];
result.map((order) => {
    order.sneakers.map((prod) => orderedProducts.push(prod));
})
console.log(orderedProducts);

response.send({result: result, products: orderedProducts});

})


router.put('/account-details', async function(request, response) {
    const user = request.body.user;
    const update = request.body.update;
    
    const result = await client.db("hypekicks-db").collection("users").updateOne({userName: user}, {
        $set: {firstName: update.firstName, lastName: update.lastName, email: update.email}
    })

    response.send(result);
})

router.post('/account-details', async function(request, response) {
    const user = await request.body.user;

    const result = await client.db("hypekicks-db").collection("users").findOne({userName: user})

    response.send(result);
})



export const profileRouter = router;