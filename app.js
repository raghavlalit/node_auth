import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./router/index.js";
import bodyParser from "body-parser";
import pathErrorHandler from "./middleware/path_handler.js";
import { config } from "./config/index.js";

const app = express();

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: '*' }));
app.use('/api', router);
app.use(pathErrorHandler);

app.listen(config.port, () => console.log(`Server running at port ${config.port}`));