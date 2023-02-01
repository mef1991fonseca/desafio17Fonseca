import express from "express";
//import { random } from "./helpers/operaciones.js";
import { fork } from "child_process";

const routerRandom = express.Router()

let visitas = 0;
routerRandom.get("/",(req,res)=>{
    visitas++;
    res.send(`Has visitado esta pagina ${visitas} veces`)
});


//ruta no bloqueante
routerRandom.get("/random-nobloq", (req,res)=>{
    const child = fork("src/helpers/child.js");
    const {cant} = req.query
    let obj = {}
    cant ? child.send({cant, obj})
         : child.send({cant: 100000000, obj})
    //recibimos mensajes del proceso hijo
    child.on("message",(childMsg)=>{
        if(childMsg === "listo"){
            //recibimos notificacion del proceso hijo, y le mandamos un mensaje para que comience a operar.
            child.send("Iniciar")
        } else {
            res.json({resultado:childMsg})
        }
    });
});

export {routerRandom}



