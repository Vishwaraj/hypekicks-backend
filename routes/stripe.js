import express from 'express';
import {client} from '../index.js';
const router = express.Router();
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { auth } from '../middleware/auth.js';


dotenv.config();


const stripe = Stripe(process.env.STRIPE_KEY);

const CLIENT_URL = 'http://localhost:3000';

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