import express from "express"
import { Contenedor } from "../managers/contenedorProductos.js"
import { ContenedorSQL } from "../managers/contenedorSql.js"
import { options } from "../config/dbConfig.js";
import { ProductMock } from "../mocks/productsMock.js"

//import { logger } from "../logger.js"


const productRouter = express.Router();

//const productosApi = new Contenedor("productos.txt");
const productosApi = new ContenedorSQL(options.mariaDB, "products");
const productApi = new ProductMock();

productRouter.get('/',async(req,res)=>{
    const productos = await productosApi.getAll();
    res.send(productos);
})

productRouter.get('/:id',async(req,res)=>{
    const productId = req.params.id;
    const product = await productosApi.getById(parseInt(productId));
    if(product){
        return res.send(product)
    } else{
        //logger.error("Producto inexistente")
        return res.send({error : 'producto no encontrado'})
        
    }
})

productRouter.post('/',async(req,res)=>{
    const newProduct = req.body;
    const result = await productosApi.save(newProduct);
    res.send(result);
    //logger.error("No se pudo guarda el producto")
})

productRouter.post("/generar-productos", (req,res)=>{
    const { cant } = req.query
    let results = productApi.populate(parseInt(cant))
    res.send(results)
    //logger.error("No se pudo generar el producto")

})

productRouter.put('/:id',async(req,res)=>{
    const cambioObj = req.body;
    const productId = req.params.id;
    const result = await productosApi.updateById(parseInt(productId),cambioObj);
    res.send(result);
    //logger.error("No se pudo actualizar el producto")
})

productRouter.delete('/:id',async(req,res)=>{
    const productId = req.params.id;
    const result = await productosApi.deleteById(parseInt(productId));
    res.send(result);
    //logger.error("No se pudo eliminar el producto")

})

export { productRouter }