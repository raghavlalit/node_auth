import jwt from 'jsonwebtoken';
import { config } from '../config/index.js'; 
import UserModel from '../model/user.js';

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers.token;

  if (!token) {
    return res.status(403).send({
      success: 0,
      message: "A token is required for authentication",
    });
  }
  try {
    const decoded = jwt.verify(token, config.token_key);

    const email = decoded.email;
    const user_details = await UserModel.userBasicDetails(email);
    if(user_details){
      let not_allowed_keys = ['name', 'token_id', 'email', 'status', 'username'];
      for (const key in user_details) {
        if (!not_allowed_keys.includes(key)) req.body[key] = user_details[key];
      }
    }

    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      success: 0,
      message: "Invalid Token",
    });
  }
  return next();
};

export default verifyToken;
