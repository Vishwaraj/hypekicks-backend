import express, { response } from 'express';
import {MongoClient, ObjectId} from 'mongodb';
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import {homeRouter} from './routes/home.js';
import {cartRouter} from './routes/cart.js';
import {profileRouter} from './routes/profilePage.js';
import {loginRouter} from './routes/login.js';
import { signInRouter } from './routes/signin.js';
import {stripeRouter} from './routes/stripe.js';
import { adminRouter } from './routes/admin.js';
import { adminProductsRouter } from './routes/adminProducts.js';


//setting up dotenv
dotenv.config();

//setting up the app
const app = express();
app.use(cors());


app.use(express.json());


  
//getting the port
const PORT = process.env.PORT;



// app.use(function(request, response, next) {
//   response.header("Access-Control-Allow-Origin", "*");
//   response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// })

 
//server setup code
app.listen(PORT, function(request, response)  {
  console.log('Server is running on', PORT);
})


//mongo db connection code
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('MongoDB is connected');
    return client;
}

export const client = await createConnection();



//adding the data code
app.post('/', async function(request, response) {
    const data = await request.body;

    const status = await client.db("hypekicks-db").collection("sneakers").insertMany(data)

    response.send(status);
    console.log(status);

});


app.get('/', async function(request, response) {
  response.status(200).send({message: 'Backend Connected'})
})


//-------------------------------APP ROUTES-------------------------------------------

// homeRouter setup -->
app.use("/home", homeRouter);


//CART ROUTE -->

app.use("/cart", cartRouter);


//PROFILE ROUTER -->

app.use("/profile-page", profileRouter);


//--------------------------------STRIPE INTEGRATION CODE---------------------------------------------

app.use("/create-checkout-session", stripeRouter);


//-----------------------------AUTHORIZATION & AUTHENTICATION CODE---------------------------- ---

app.use("/login", loginRouter);


app.use("/signup", signInRouter);


//-----------------------------------ADMIN ROUTER CODE-------------------------------------------------

app.use('/admin', adminRouter)

app.use('/admin/products', adminProductsRouter)

