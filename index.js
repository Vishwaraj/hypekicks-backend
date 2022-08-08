import express, { response } from 'express';
import {MongoClient, ObjectId} from 'mongodb';
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';




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




//trial code
app.get('/', function(request, response) {
    response.send('Hello World!')
})

//adding the data code
app.post('/', async function(request, response) {
    const data = await request.body;

    const status = await client.db("hypekicks-db").collection("sneakers").insertMany(data)

    response.send(status);
    console.log(status);

});


//route to get all sneakers
app.get('/home', async function(request, response) {

    
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
    response.send(result);


});


//route to get new releases 

app.get('/home/new-releases', async function(request, response) {
   
  const result = await client.db("hypekicks-db").collection("sneakers").find({
    category: 'new-releases'
  }).toArray();
  response.send(result);

})


//route to get popular
app.get('/home/popular', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("sneakers").find({
        category: 'popular'
    }).toArray();
    response.send(result);
    
})

//route to get trending 

app.get('/home/trending', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("sneakers").find({
        category: 'trending'
    }).toArray();
    response.send(result);
})

app.get('/home/all', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
    response.send(result);
})


//route for single product
app.get('/home/single-product/:productID', async function(request, response) {
    
    const productID = request.params.productID;

   const result = await client.db("hypekicks-db").collection("sneakers").findOne({
    _id: ObjectId(productID)
   })
   const type = result.category;

   console.log(type);
   const relatedProducts = await client.db("hypekicks-db").collection("sneakers").find({category: type}).limit(4).toArray();

   

   response.send({result, relatedProducts});

}) 


//check product already in cart --
const checkProductCart = async (id) => {
    let result = await client.db("hypekicks-db").collection("cart").findOne({_id: ObjectId(id)})
    
    return result
}


//add to cart -
app.post('/home/single-product/:productID', async function(request, response)  {

   const product = request.body;
   request.body._id = ObjectId(request.body._id);
   const check = await checkProductCart(product._id)
   console.log(request.body)

   if(!check) {
      const result = await client.db("hypekicks-db").collection("cart").insertOne(product);
      response.send(result);
   } else {
      response.send({message: 'Product already in cart'})
   }

})


//CART ROUTE

app.get('/cart', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("cart").find({}).toArray();
    response.send(result);
})


//remove product from cart-
app.delete('/cart', async function(request, response) {
    const id = request.body.id;
    
    const result = await client.db("hypekicks-db").collection("cart").deleteOne({_id: ObjectId(id)})
    response.send(result);
    console.log(result);

})


//----------------------------------USER DASHBOARD CODE ------------------------------------------------

app.put('/profile-page/addresses', async function(request, response) {
    const address = request.body;
    const userName = request.headers.username;
    
    const findUser = await client.db("hypekicks-db").collection("users")
                .updateOne({userName: userName}, {$set: {address: address}})
                      
    console.log(findUser);
    response.send(findUser);
    


})



//------------------------------------BILLING PAGE CODE------------------------------------------------


//billing address code -
app.post('/cart/billing-details', async function(request, response) {
  
    const username = request.body.username;
    const result = await client.db("hypekicks-db").collection("users").findOne({userName: username})
    response.send(result.address);
})

// update address code - 
app.put('/cart/billing-details', async function(request, response) {

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




app.post('/cart/order-success', async function(request, response) {
    const username = await request.body.username;

    const checkUserExists = await findUserOrders(username);


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


//--------------------------------ORDERS PROFILE PAGE CODE----------------------------------------------


app.post('/profile-page/orders', async function(request, response) {
    
const user = request.body.user;

const result = await client.db("hypekicks-db").collection("orders").find({user: user}).toArray();

const orderedProducts = [];
result.map((order) => {
    order.sneakers.map((prod) => orderedProducts.push(prod));
})
console.log(orderedProducts);

response.send({result: result, products: orderedProducts});

})


//-------------------------------PROFILE ACCOUNT DETAILS CODE------------------------------------------


app.put('/profile-page/account-details', async function(request, response) {
    const user = request.body.user;
    const update = request.body.update;
    
    const result = await client.db("hypekicks-db").collection("users").updateOne({userName: user}, {
        $set: {firstName: update.firstName, lastName: update.lastName, email: update.email}
    })

    response.send(result);
})

app.post('/profile-page/account-details', async function(request, response) {
    const user = await request.body.user;

    const result = await client.db("hypekicks-db").collection("users").findOne({userName: user})
    console.log(result);
    response.send(result);
})

 


//--------------------------------STRIPE INTEGRATION CODE---------------------------------------------

const stripe = Stripe(process.env.STRIPE_KEY);

const CLIENT_URL = 'http://localhost:3000';

app.post('/create-checkout-session', async (request, response) => {

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




//-----------------------------AUTHORIZATION & AUTHENTICATION CODE---------------------------- ---

//auth code

const genHashPassword = async (password) => {
   const NO_OF_ROUNDS = 10
   const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
   const hashedPassword = await bcrypt.hash(password, salt);
   return hashedPassword
}


const checkUserExists = async (username) => {
  const userName = username;

  const result = await client.db("hypekicks-db").collection("users").findOne({userName: userName})
  return result
}



//for login
app.post('/login', async function(request, response) {
    const {username, password} = request.body;
    const user = request.body;

    const checkUser = await checkUserExists(username)

    if(!checkUser) {
        response.send({msg: 'Invalid Credentials'})
    } else {
        const storedPassword = checkUser.password;

        const isPasswordMatch = await bcrypt.compare(password, storedPassword);

        if(isPasswordMatch) {

            //creating token
            var token = jwt.sign({id : checkUser._id}, process.env.SECRET_KEY);

            response.send({message: 'Succesful login', user: request.body, token: token})
        } else {
            response.status(400).send({message: 'Invalid Credentials'})
        }

    }

})


//for signup
app.post('/signup', async function(request, response) {
    
    const user = await request.body;

    const checkUser = await checkUserExists(user.userName);

    const hashPassword = await genHashPassword(user.password);


    if(checkUser) {
        response.send({message:'User already exists! try a different name'})
    } else {
        const result = await client.db("hypekicks-db").collection("users").insertOne({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: hashPassword
        })
        response.send(result);
    }
    
  

})