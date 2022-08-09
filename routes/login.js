import express from 'express';
import {client} from '../index.js';
import { ObjectId } from 'mongodb';
const router = express.Router();
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';



const checkUserExists = async (username) => {
    const userName = username;
  
    const result = await client.db("hypekicks-db").collection("users").findOne({userName: userName})
    return result
  }

router.post('/', async function(request, response) {
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


export const loginRouter = router;