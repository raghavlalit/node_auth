import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../model/user.js';
import { config } from '../config/index.js';
import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";

const Auth = {

  Login: async (req, res, next) => {
    // Our login logic starts here
    try {
      // Validate user input
      await apiInputValidator(req.body, schema_rules.login);
      // Get user input
      const { email, password } = req.body;
  
      // Validate if user exist in our database
      const user = await UserModel.findOne(email);
  
      if (user && (await bcrypt.compare(password, user.vPassword))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          config.token_key,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      return res.status(err.statusCode).send(err);
    }
  },

  Register: async (req, res, next) => {
    // Our register logic starts here
    try {
      // Validate user input
      await apiInputValidator(req.body, schema_rules.register);

      // Get user input
      const { name, email, password, phone, status } = req.body;
  
      // Validate if user exist in our database
      const oldUser = await UserModel.findOne(email );
  
      if (oldUser) {
        return res.status(409).json({
          success: 0,
          message: "User Already Exist. Please Login",
        });
      }
  
      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const insert_obj = {
        vName: name,
        vEmail: email.toLowerCase(), // sanitize: convert email to lowercase
        vPassword: encryptedPassword,
        vPhoneNo: phone,
        eStatus: status,
      };
      const inserted_id = await UserModel.create(insert_obj);
  
      // Create token
      const token = jwt.sign(
        { 
          user_id: inserted_id, 
          email: email 
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      let return_obj = {};
      if(token){
        return_obj = {
          success: 1,
          message: "user created successfully",
          data: {
            token: token
          }
        }
      }else{
        return_obj = {
          success: 0,
          message: "Token not created",
        }
      }
  
      // return new user
      return res.status(201).json(return_obj);
    } catch (err) {
      return res.status(200).json(err);
    }
  }
}

const schema_rules = {
  login: {
    email: joi.string().required(),
    password: joi.string().min(5).required(),
  },
  register: {
    email: joi.string().required(),
    password: joi.string().min(5).required(),
    name: joi.string().required(),
    phone: joi.string().required(),
    status: joi.string().required(),
  }
};

export default Auth;