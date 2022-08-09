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

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;


//server setup code
app.listen(PORT, function(request, response)  {
  console.log('Server is running on', PORT);
})

//mongo db connection code
const MONGO_URL = "mongodb+srv://vishwaraj-admin:9637774387@cluster0.92hrg4g.mongodb.net";

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
