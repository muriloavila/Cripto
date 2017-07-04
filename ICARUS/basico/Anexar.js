//COMENTARIO
function contaAnexos(){
	var qtdAnexos = get("listaAnexos").getElementsByTagName("label");
	return qtdAnexos.length;
}
function listaAnexos(){
	var lista = "";
	var qtd = contaAnexos();
	for (var i = 0; i < qtd; i++){
		lista += get("listaAnexos").getElementsByTagName("label")[i].innerHTML;
		if (i+1 < qtd){
			lista += ";";
		}
	}
	return lista;
}
