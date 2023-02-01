import express from 'express'
import os from "os"
import compression from "compression"

const routerInfo = express.Router()

let argumentosEntrada = process.argv
let pathEjecucion = process.execPath
let sistemaOperativo = process.platform
let processId = process.pid
let nodeVersion = process.version
let carpetaProyecto = process.cwd()
let usoMemoria = process.memoryUsage()
export let numProcesadores = os.cpus().length
//const PORT = config.PORT

routerInfo.get("/info", (req,res)=>{
    res.json({
        //message: `Respuesta desde el puerto ${PORT} en el proceso ${process.pid}`,
        response: 
            argumentosEntrada, //- Argumentos de entrada 
            pathEjecucion, //- Path de ejecución
            processId, //- Process id
            sistemaOperativo, //- Nombre de la plataforma (sistema operativo)
            nodeVersion, //- Versión de node.js
            carpetaProyecto, //- Carpeta del proyecto
            usoMemoria,//- Memoria total reservada (rss)
            numProcesadores
   })
   console.log(numProcesadores)
})

routerInfo.get("/infozip",compression(), (req,res)=>{
    res.json({
        //message: `Respuesta desde el puerto ${PORT} en el proceso ${process.pid}`,
        response: 
            argumentosEntrada, //- Argumentos de entrada 
            pathEjecucion, //- Path de ejecución
            processId, //- Process id
            sistemaOperativo, //- Nombre de la plataforma (sistema operativo)
            nodeVersion, //- Versión de node.js
            carpetaProyecto, //- Carpeta del proyecto
            usoMemoria,//- Memoria total reservada (rss)
            numProcesadores
   })
   console.log(numProcesadores)
})

export {routerInfo}