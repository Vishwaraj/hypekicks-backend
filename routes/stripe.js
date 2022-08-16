import express from 'express';
import {client} from '../index.js';
const router = express.Router();
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { auth } from '../middleware/auth.js';


//configuring dotenv
dotenv.config();


//getting the stripe key
const stripe = Stripe(process.env.STRIPE_KEY);


//setting the client url
const CLIENT_URL = 'https://joyful-shortbread-7b3c03.netlify.app';


//function to create payment gateway session -->
router.post('/', auth , async (request, response) => {

  const cartItems = await client.db("hypekicks-db").collection("cart").find({}).toArray();

  const line_items = cartItems.map((sneaker)=>{
    return (
        {
            price_data: {
                currency: 'inr',
                product_data: {
                    name: sneaker.name,
                    images: [sneaker.image],
                },
                unit_amount: sneaker.price * 100,
            },
            quantity: sneaker.quantity
          }
    );
  })


  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${CLIENT_URL}/cart/order-success`,
    cancel_url: `${CLIENT_URL}/cart/billing-details`,
  });

  response.send({stripeUrl : session.url})
});


export const stripeRouter = router;