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
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

app.set('views', 'views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(compression({ threshold: 0 }));
app.use(cors());
app.use(express.static(config.app.publicDir))
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
extendExpressMiddleware(app);
app.use(passportJwtLogin);
app.use('/api/', authMiddleware);
mongoose
    .connect(process.env.ATLAS_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connetion Successfull");
    })
    .catch((err) => {
        console.log(err.message);
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
app.use('/api/components_data', ComponentsDataController);
app.use('/api/fileuploader', FileUploaderController);
app.use('/api/s3uploader', S3UploaderController);
// app.use('/api/sendToken', SendTokenController);
app.use('/api/sendMessageRoute', SendMessageRouteController);
app.use('/api/usersMap', UsersMapController);
app.use('/api/upLoad', UpLoadController);
app.use('/api/transaction', TransactionController)
app.use('/api/postEtherscanData', GetAxiasController)
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
        origin: "http://localhost:3001",
        credentials: true,
    },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    console.log('建立连接');
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});