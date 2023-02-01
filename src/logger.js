import log4js from "log4js";
import { config } from "./config/config.js";

log4js.configure({
    appenders: {
        //salidas de datos
        consola: {type: "console"},
        archivoErrores: {type: "file", filename: "./src/logs/errores.log" },
        archivoWarning: {type: "file", filename: "./src/logs/warn.log" },
        //salidas con niveles definidos
        loggerConsola: {type: "logLevelFilter", appender: 'consola', level: 'info'},
        loggerErrores: {type: "logLevelFilter", appender: 'archivoErrores', level: 'error'},
        loggerWarning: {type: "logLevelFilter", appender: 'archivoWarning', level: 'warn'},
      },
      categories: {
        default: {appenders: ['loggerConsola'], level: 'all'},
        produccion: {appenders: ['loggerErrores', 'loggerWarning'], level: 'all'},
      }
     
})

let logger = null;

if(config.NODE_ENV === "prod"){
    logger = log4js.getLogger("produccion")
}else{
    logger = log4js.getLogger()
};

export {logger}

