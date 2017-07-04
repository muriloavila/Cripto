//########################################################
//########################################################
   				//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################


//########################################################
//VERSÃO DA TELA
//########################################################
var RELEASE  = '0.001';



//########################################################
//OBJETOS
//########################################################
var objDados = {};


//########################################################
//LOCAL DO EXEC
//########################################################
var EXEC = '../basico/Imp.Recibo.Exec.php';






//########################################################
//########################################################
					//RECIBOS
//########################################################
//########################################################

//########################################################
//RECIBO CLIENTE
//########################################################
function montaRecCliente(){
	var funcao = "cliente="+$("#cliente").val()+
					"&referente="+$("#referente").val()+
					"&valor="+$("#valor").val()+
					"&tipopag="+$("#tipopag").val()+
					"&dataini="+$("#dataini").val()+
					"&funcao=montaRecCliente";

	ajax(funcao, EXEC, function(retorno){
		objDados = retorno;

		if(!empty(retorno.error)){
			swal('Erro ao buscar dados do relatório',retorno.mensagem,'error');
			return;
		}

		$(".empRazao").html(objDados.dados.em_razao);
		$("#empEnder").html(objDados.dados.em_ender + " - " + "Nº" + objDados.dados.em_endnum + " - " + objDados.dados.em_bairro + " - " + objDados.dados.em_cidade + " - " + objDados.dados.em_uf);

		$("#msgClie").html("Recebi(emos) de " + objDados.dados.cl_razao 
								+ " a importância de " + objDados.dados.valor + "(" + objDados.dados.valor_extenso + ") referente ao pagamento de " 
								+ objDados.dados.referente + ", efetuado em " + objDados.dados.tipopag + ".");

		$("#data").html(objDados.dados.data_extenso);


	});

}

function montaRecFornec(){
	var funcao = "fornec="+$("#fornec").val()+
					"&referente="+$("#referente").val()+
					"&valor="+$("#valor").val()+
					"&tipopag="+$("#tipopag").val()+
					"&dataini="+$("#dataini").val()+
					"&funcao=montaRecFornec";


	ajax(funcao, EXEC, function(retorno){
		objDados = retorno;

		if(!empty(retorno.error)){
			swal('Erro ao buscar dados do relatório',retorno.mensagem,'error');
			return;
		}

		$(".empRazao").html(objDados.dados.em_razao);
		$("#empEnder").html(objDados.dados.em_ender + " - " + "Nº" + objDados.dados.em_endnum + " - " + objDados.dados.em_bairro + " - " + objDados.dados.em_cidade + " - " + objDados.dados.em_uf);

		$("#msgFornec").html("Recebi(emos) de " + objDados.dados.em_razao 
								+ " a importância de " + objDados.dados.valor + "(" + objDados.dados.valor_extenso + ") referente ao pagamento de " 
								+ objDados.dados.referente + ", efetuado em " + objDados.dados.tipopag + ".");

		$("#data").html(objDados.dados.data_extenso);

		$("#foRazao").html(objDados.dados.fo_razao);
		$("#foCNPJ").html(objDados.dados.fo_cgc);
	});
}