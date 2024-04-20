import jwt from 'jsonwebtoken';
import { config } from '../config/index.js'; 

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
