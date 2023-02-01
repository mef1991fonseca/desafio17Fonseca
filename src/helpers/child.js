import { random } from "./operations.js";

process.on("message",(childMsg)=>{
    const {cant, obj} = childMsg
    const resultado = random(cant, obj);
    process.send(resultado);    
})