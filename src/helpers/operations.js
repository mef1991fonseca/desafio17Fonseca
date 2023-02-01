export const random = (cant,obj) =>{
    for (let i=0; i < cant; i++){
        let numero = parseInt(Math.random()*(1000 - 1)+ 1)*cant
        console.log(numero)
        if(obj[numero]){
            obj[numero]++;
            continue
        }
        obj[numero] = 1
    }
    return obj
}