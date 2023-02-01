import  ParsedArgs  from "minimist";

import * as dotenv from "dotenv"

dotenv.config()

const options = {default: {puerto:8080, modo: "fork"}}

//creamos la configuracion de nuestra aplicacion
export const config = {
    PORT: process.env.PORT,
    MONGO_AUTENTICATION: process.env.BDMONGO,
    MONGO_SESSION: process.env.SESSIONMONGO,
    FILE_DB: process.env.FILEDB,
    NODE_ENV: process.env.NODE_ENV || "dev"

};

