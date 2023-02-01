import express from "express"
import session from "express-session"
import MongoStore from "connect-mongo"
import cookieParser from "cookie-parser"
import { options } from "./config/dbConfig.js"
import { productRouter } from "./routes/products.js"
import handlebars from "express-handlebars"
import { Server } from "socket.io"
import { normalize, schema } from "normalizr"
import { Contenedor } from "./managers/contenedorProductos.js"
import {ContenedorChat} from "./managers/contenedorChat.js"
import {ContenedorSQL} from "./managers/contenedorSql.js"
import path, { parse } from "path"
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { clientRouter } from "./routes/web/clientRoutes.js"
import { authRouter } from "./routes/web/authRoutes.js"
//service
// const productosApi = new Contenedor("productos.txt");
//const productosApi = new ContenedorSQL(options.mariaDB, "products");
//const chatApi = new ContenedorChat("chat.txt");
//const chatApi = new ContenedorSql(options.sqliteDB,"chat");
import { chatApi } from "./services/apiservices.js"
import { productosApi } from "./services/apiservices.js"
import mongoose from "mongoose"; //db usuarios
import { config } from "./config/config.js"
import { routerInfo }  from "./routes/info.js"
import { routerRandom } from "./routes/random.js"

import parseArgs from "minimist"
import cluster from "cluster"
import os from "os"

import { logger } from "./logger.js"
 
//captura de los argumentos
const option = {alias: {m:"mode", p:"port"}, default: {mode: "FORK"}}
const objArguments = parseArgs(process.argv.slice(2), option)
logger.info("objArguments",objArguments)
const MODO = objArguments.mode
const PORT = objArguments.port || 8080
logger.info("modo",MODO, "port", PORT)


//server
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname+'/public'))

//configuracion template engine handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname+'/views');
app.set('view engine', 'handlebars');

//conectamos a la base de datos
//const mongoUrldb = "mongodb+srv://mef1991:35480618@fonsecabackend.n7owdzj.mongodb.net/authDB?retryWrites=true&w=majority";
const mongoUrldb = config.MONGO_AUTENTICATION
mongoose.connect(mongoUrldb,{
    useNewUrlParser: true,
    useUnifiedTopology:true
},(error)=>{
    if(error) return logger.info(`Hubo un error conectandose a la base ${error}`);
    logger.info("conexion a la base de datos de manera exitosa")
});

//configuracion de sesion
app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: config.MONGO_SESSION
    }),
    secret: "claveSecreta",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 60000 //10min.
    }
}))

//normalizacion
//creamos los esquemas
//esquema del autor
const authorSchema = new schema.Entity("authors",{}, {idAttribute: "email"})

//esquema del msj
const messageSchema = new schema.Entity("messages",{author:authorSchema})

//esquema global p/ nuevo objeto
const chatSchema = new schema.Entity("chat",{
    messages:[messageSchema]
}, {idAttribute: "id"})

//aplicamos la normalizacion
//crear una funcion para normalizar la data
const normalizarData = (data)=>{
    const normalizeData = normalize({id:"chatHistory",messages:data}, chatSchema)
    return normalizeData
}

const normalizarMensajes = async() =>{
    const results = await chatApi.getAll()
    const messagesNormalized = normalizarData(results)
    //console.log(JSON.stringify(messagesNormalized,null,"\t"))
    return messagesNormalized
}
normalizarMensajes()

// routes
//view routes
//app.get('/', async(req,res)=>{
//     res.render('home')
// })

//app.get('/productos',async(req,res)=>{
//     res.render('products',{products: await productosApi.getAll()})
// })

//api routes
app.use('/api/products',productRouter)
app.use('/', routerInfo)//aqui
app.use('/api/random', routerRandom)//aqui
//view routes
app.use(clientRouter)
app.use(authRouter)

// app.get('/*', async(req,res)=>{
//     logger.warn('ruta inexistente')
// })

// Variables de entorno
const puerto = config.PORT;
// const PORT = process.argv[2] || 8080;
//let MODO = config.MODO

//express server

if(MODO === "CLUSTER" && cluster.isPrimary){
    logger.info("modo cluster")
    const numCPUS = os.cpus().length //n° de nucles del procesador
    for(let i=0; i<numCPUS;i++){
        cluster.fork() //creamos los subprocesos
    }
    cluster.on("exit",(worker)=>{
        logger.info(`El subproceso ${worker.process.pid} falló`)
        cluster.fork()
    })
}else{
    const server = app.listen(PORT,()=>{
        logger.info(`listening on port ${PORT} on process ${process.pid}`)
    })
    //websocket server
    const io = new Server(server);

    //configuracion websocket
    io.on("connection",async(socket)=>{
        //PRODUCTOS
        //envio de los productos al socket que se conecta.
        io.sockets.emit("products", await productosApi.getAll())

        //recibimos el producto nuevo del cliente y lo guardamos con filesystem
        socket.on("newProduct",async(data)=>{
            await productosApi.save(data);
            //despues de guardar un nuevo producto, enviamos el listado de productos actualizado a todos los sockets conectados
            io.sockets.emit("products", await productosApi.getAll())
        })

        //CHAT
        //Envio de todos los mensajes al socket que se conecta.
        io.sockets.emit("messages", await normalizarMensajes());

        //recibimos el mensaje del usuario y lo guardamos en el archivo chat.txt
        socket.on("newMessage",async(newMsg)=>{
            console.log(newMsg)
            await chatApi.save(newMsg);
            io.sockets.emit("messages", await normalizarMensajes());
        })
    }) 
}
