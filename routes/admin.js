import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const router = express.Router();
import { adminAuth } from '../middleware/adminAuth.js';



//generating admin hashed password -->
const genAdminHashPassword = async (password) => {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}


//checking admin exists -->
const checkAdminExists = async (adminName) => {
  const result = await client.db("hypekicks-db").collection("admins").findOne({adminName: adminName});
  return result;
}


//function to register admin -->
router.post('/sign-up', async function (request, response) {
   
 //getting admin name and password 
 const adminName = await request.body.adminName;
 const password = await request.body.password;


 //checking admin exists
 const checkAdmin = await checkAdminExists(adminName);
 
 if(checkAdmin) {
    response.status(400).send({message: 'Admin already exists!'})
 } else {

    const hashedPassword = await genAdminHashPassword(password);
    
    const result = await client.db("hypekicks-db").collection("admins").insertOne({
        adminName: request.body.adminName,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        phone: request.body.phone,
        password: hashedPassword
    })

    response.status(201).send(result);
 }

})



//funcion for admin login -->
router.post('/login', async function(request, response) {
  
  //getting admin name
  const admin = request.body;
    
  //checking admin exists
    const checkAdmin = await checkAdminExists(admin.adminName);

  //comparing passwords
    const comparePassword = await bcrypt.compare(admin.password, checkAdmin.password);

    if(comparePassword) {

       const token = jwt.sign({id: checkAdmin._id}, process.env.SECRET_KEY);

       response.status(200).send({message: 'Successful login', adminName: checkAdmin.adminName, adminToken: token})

    } else {
        response.status(400).send({message: 'Invalid Credentials'})
    }

})



//function to get all users -->
router.get('/users', adminAuth ,async function(request, response) {
  const result = await client.db("hypekicks-db").collection("users").find({}).toArray();
  
  response.status(200).send(result);
})


//function to delete a user -->
router.delete('/users', adminAuth ,async function(request, response) {
  const id = request.body.id;

  const result = await client.db("hypekicks-db").collection("users").deleteOne({_id: ObjectId(id)});

  console.log(result);
  response.send(result);


})


//function to get all orders -
router.get('/orders', adminAuth ,async function(request, response) {
  
  const result = await client.db("hypekicks-db").collection("orders").find({}).toArray();

  response.status(200).send(result);
  

})

export const adminRouter = router;