import express from 'express';
import compression from 'compression';
import cors from 'cors';
import ejs from 'ejs';
import config from './config.js';
import extendExpressMiddleware from './helpers/express_middleware.js';
import { passportJwtLogin, authMiddleware } from './helpers/auth_middleware.js';
import AuthController from './controllers/auth.js';
import AccountController from './controllers/account.js';
import HomeController from './controllers/home.js';
import ComponentsDataController from './controllers/components_data.js';
import FileUploaderController from './controllers/fileuploader.js';
import S3UploaderController from './controllers/s3uploader.js';
import AndroidController from './controllers/android.js';
import ChatMessagesController from './controllers/chatmessages.js';
import IphoneController from './controllers/iphone.js';
import PermissionsController from './controllers/permissions.js';
import RolesController from './controllers/roles.js';
// import TransactionController from './controllers/transaction.js';
import UserController from './controllers/user.js';
// import SendTokenController from './controllers/sendToken.js';
import SendMessageRouteController from './controllers/sendMessageRoute.js'
import UsersMapController from './controllers/usersMap.js'
import UpLoadController from './controllers/UpLoadController.js'
import TransactionController from './controllers/jiaoyi.js'
import GetAxiasController from './controllers/getAxias.js'
import ProductsController from './controllers/products.js'
import ChatController from './controllers/chat.js';
import { Server } from "socket.io";
import ws from './server/webSocket.js';
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

app.set('views', 'views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(compression({ threshold: 0 }));
app.use(cors());
app.use('/assets/uploads/products', express.static('assets/uploads/products'));
app.use(express.static(config.app.publicDir))
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
extendExpressMiddleware(app);
app.use(passportJwtLogin);
app.use('/api/', authMiddleware);

mongoose
    .connect(config.mongodb.url, config.mongodb.options)
    .then(() => {
        console.log("MongoDB 连接成功");
    })
    .catch((err) => {
        console.log("MongoDB 连接错误:", err);
    });

app.use('/api/auth', AuthController);
app.use('/api/account', AccountController);
app.use('/api/android', AndroidController);
app.use('/api/chatmessages', ChatMessagesController);
app.use('/api/iphone', IphoneController);
app.use('/api/permissions', PermissionsController);
app.use('/api/roles', RolesController);
// app.use('/api/transaction', TransactionController);
app.use('/api/user', UserController);
app.use('/api/products', ProductsController);
app.use('/api/components_data', ComponentsDataController);
app.use('/api/fileuploader', FileUploaderController);
app.use('/api/s3uploader', S3UploaderController);
// app.use('/api/sendToken', SendTokenController);
app.use('/api/sendMessageRoute', SendMessageRouteController);
app.use('/api/usersMap', UsersMapController);
app.use('/api/upLoad', UpLoadController);
app.use('/api/transaction', TransactionController)
app.use('/api/postEtherscanData', GetAxiasController)
app.use('/api/chat', ChatController);
app.get('*', function (req, res) {
    res.status(404).json("Page not found");
});

let port = 8060;
//start app
const server = app.listen(port, () => {
    console.log('Server is up and running on port: ' + port);
});

const io = new Server(server, {
    cors: {
        origin: config.app.front,
        credentials: true,
    },
    path: '/socket.io/', 
    transports: ['websocket', 'polling'], // 支持 WebSocket 和轮询
});

ws(io);