import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import { config } from '../config/index.js';

const Auth = {

  Login: async (req, res, next) => {
    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne(email);
  
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
      console.log(err);
      next(err);
    }
    // Our register logic ends here
  },
  Register: async (req, res, next) => {
    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password, phone, status } = req.body;
  
      // Validate user input
      if (!(email && password && name && phone && status)) {
        return res.status(400).json({
          success: 0,
          message: "All input is required",
        });
      }
  
      // Validate if user exist in our database
      const oldUser = await User.findOne(email );
  
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
      const inserted_id = await User.create(insert_obj);
  
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
      console.log(err);
      next(err);
    }
  }
}

export default Auth;