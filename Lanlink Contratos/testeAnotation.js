var objects = [{
    Nome: String,
    documento: {
        id : Float32Array,
        doc: String
    }
}]
var contrato = 'Contrato 1'

for(var i = 0;i<10;i++){
    if(i==0){
    objects[i] = {Nome: 'Contrato 1', documento: [{id: i, doc: 'documento '+(i+1)}]}
    } else {
        if(contrato == 'Contrato 1'){
        index = objects.findIndex(x=> x.Nome == contrato)
        objects[index].documento[i] = {documento: [{id: i, doc: 'documento '+(i+1)}]}
        }
    }
}

for(var i = 0; i<10;i++){
    console.log(objects[0].documento[i])
}

console.log(objects)
