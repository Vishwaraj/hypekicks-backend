import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const router = express.Router();


const genAdminHashPassword = async (password) => {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}


const checkAdminExists = async (adminName) => {
  const result = await client.db("hypekicks-db").collection("admins").findOne({adminName: adminName});
  return result;
}

router.post('/sign-up', async function (request, response) {
   
 const adminName = await request.body.adminName;
 const password = await request.body.password;

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


router.post('/login', async function(request, response) {
    const admin = request.body;
    
    const checkAdmin = await checkAdminExists(admin.adminName);

    const comparePassword = await bcrypt.compare(admin.password, checkAdmin.password);

    if(comparePassword) {

       const token = jwt.sign({id: checkAdmin._id}, process.env.SECRET_KEY);

       response.status(200).send({message: 'Successful login', adminName: checkAdmin.adminName, adminToken: token})

    } else {
        response.status(400).send({message: 'Invalid Credentials'})
    }

})


router.get('/users', async function(request, response) {
  const result = await client.db("hypekicks-db").collection("users").find({}).toArray();
  
  response.status(200).send(result);
})


router.delete('/users', async function(request, response) {
  const id = request.body.id;

  const result = await client.db("hypekicks-db").collection("users").deleteOne({_id: ObjectId(id)});

  console.log(result);
  response.send(result);


})


//request to get all orders -

router.get('/orders', async function(request, response) {
  
  const result = await client.db("hypekicks-db").collection("orders").find({}).toArray();

  response.status(200).send(result);
  

})

export const adminRouter = router;