import express from 'express';
import {client} from '../index.js'
import { ObjectId } from 'mongodb';
const router = express.Router();
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';



//function to generate hashed password -->
const genHashPassword = async (password) => {
    const NO_OF_ROUNDS = 10
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
 }
 
 
//function to check user exists -->
 const checkUserExists = async (username) => {
   const userName = username;
 
   const result = await client.db("hypekicks-db").collection("users").findOne({userName: userName})
   return result
 }
 
 
 //function for signup
 router.post('/', async function(request, response) {
     
     //getting user from body
     const user = await request.body;
 
     //checking user
     const checkUser = await checkUserExists(user.userName);
 
     //generating hashed password
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


 export const signInRouter = router;