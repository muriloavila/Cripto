var cert_objCertificado = {};
var codigo_func;
var Cert_EXEC = "../basico/Certificado.Exec.php";
var Cert_DIV_TABELA = "#Cert_dados";
var HIST_LIMITE_REGISTROS = 40;

$(document).ready(function(){
	$("#cert_exclui").on('click', function(){
		cert_excluiCertificado();
	});
});

function Cert_codifica(valor){
	var a = valor.split("");
	for (var i = 0; i < a.length; i++){
		a[i] = a[i].charCodeAt(0);
	}
	return a;
}

function Cert_decodifica(valor){
	var a = "";
	for (var i = 0; i < valor.length; i++){
		a += String.fromCharCode(valor[i]);
	}
	return a;
}

function Cert_abre(empresa){
	swal.loading('Buscando Dados...');
	var funcao = 'funcao=safety';
	if (empresa !== undefined){
		cert_objCertificado.empresa = empresa;
		funcao += "&empresa="+cert_objCertificado.empresa;
		$("#Cert_formUpload").attr("action", "Certificado.Exec.php?funcao=enviarCertificado&empresa="+cert_objCertificado.empresa);
	}else{
		$("#Cert_formUpload").attr("action", "Certificado.Exec.php?funcao=enviarCertificado");
	}
	$("#Cert_div_status").removeClass("hide");
	$("#Cert_inexistente").addClass("hide");
	$("#Cert_existente").addClass("hide");
	ajax(funcao, Cert_EXEC, function(retorno){
		try{
			retorno = json(retorno);
		}catch(e){}
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao ao pesquisar acessos',erro,'error');
			return;
		}
		if(!empty(retorno.error)){
			swal('Erro ao buscar acessos',retorno.mensagem,'error');
			Cert_fecha("box-inc-certificado","divfundo");
			return;
		}
		if (retorno.temCertificado){
			$("#Cert_existente").removeClass("hide");
			$("#Cert_inexistente").addClass("hide");
		}else{
			$("#Cert_inexistente").removeClass("hide");
			$("#Cert_existente").addClass("hide");
		}
		$("#Cert_div_status").addClass("hide");
		swal.close();
		cert_buscaChavePublica();
	});
}

function Cert_fecha(div,div2){
	$('#'+div).fadeOut(500);

	if(div2 !== undefined && div2 !== null){
		try{
			//$('#'+div2).fadeOut(500);
			setTimeout(function(){
				get(div2).style.visibility = 'hidden';
			},500);
		}catch(e){}
	}
}

function safetyC(){
	Cert_abre();
}

function cert_criptografar(valor){
	var encrypt= new JSEncrypt();
	encrypt.setPublicKey(cert_objCertificado.chavePublica);
	return encrypt.encrypt(valor);
}

function cert_buscaChavePublica(){
	swal.loading("Buscando chave pública de criptografia...");
	var funcao = "funcao=buscaChavePublica";
	ajax(funcao, Cert_EXEC, function(retorno){
		try{
			retorno = json(retorno);
		}catch(e){}
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao receber os dados do certificado',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar informações',retorno.mensagem,'error');
			return;
		}
		cert_objCertificado.chavePublica = retorno.chavePublica;
		swal.close();
	});
}

function cert_readCertificate(files){
	var cert_reader = new FileReader();
	cert_reader.readAsText(files[0]);
	swal.loading("Lendo certificado...");
	$(cert_reader).on("load", function(event){
		swal.close();
		swal.loading("Criptografando certificado...");
		var cert_Event = event.target;
		var cert_cript = cert_Event.result;
		cert_cript = Cert_codifica(cert_cript);
		for (var i = 0; i < cert_cript.length; i++){
			cert_cript[i] = cert_criptografar(cert_cript[i]);
		}
		cert_objCertificado.certificado = cert_cript;
		swal.close();
	});
}

function cert_gravaCertificado(){
	if (cert_objCertificado.chavePublica === undefined){
		swal('Ocorreu um erro ao ler a chave pública de criptografia, por favor atualize a página',erro,'error');
		return;
	}
	var password = cert_criptografar($("#Cert_password").val());
	password = Cert_codifica(password);
	$("#Cert_password").val("");
	$("#Cert_uploadCertificate").val("");
	cert_objCertificado.senha = password;
	var cert_parametros = {};
	cert_parametros.criptCertificado = cert_objCertificado.certificado;
	cert_parametros.senha = cert_objCertificado.senha;
	cert_parametros = JSON.stringify(cert_parametros);
	swal.loading("Enviando certificado...");
	var funcao = "funcao=enviarCertificado&certificado="+cert_parametros;
	ajax(funcao, Cert_EXEC, function(retorno){
		try{
			retorno = json(retorno);
		}catch(e){}
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao receber os dados do certificado',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao gravar informações',retorno.mensagem,'error');
			return;
		}
		cert_objCertificado.chavePublica = retorno.chavePublica;
		swal.close();
	});
}

function cert_excluiCertificado(){
	swal(
		{
			title: "Exclusão de Certificado",
			text: "Confirma a exclusão do certificado?",
			type: "info",
			showCancelButton: true,
			confirmButtonText: "Sim",
			cancelButtonText: "Não",
			closeOnConfirm: false,
			closeOnCancel: false,
			showLoaderOnConfirm: true,
		},
		function(isConfirm){
			if (isConfirm){
				$('.sweet-alert h2').html("Processando Solicitação");
				$('.sweet-alert p').html("");
				var empresa = "";
				var funcao = "funcao=excluiCertificado";
				if (cert_objCertificado.empresa !== undefined){
					funcao += "&empresa="+cert_objCertificado.empresa;
				}
				ajax(funcao, Cert_EXEC, function(retorno){
					try{
						retorno = json(retorno);
					}catch(e){}
					if(!retorno){
						var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
						swal('Erro ao receber os dados do certificado',erro,'error');
						return;
					}
					if(!empty(retorno.error)){
						swal('Erro ao Excluir Certificado',retorno.mensagem,'error');
						return;
					}
					swal(
						{
							title: "Exclusão - Status",
							text: retorno.message,
							type: "success",
							html: true
						},function(){
							location.reload();
						}
					);
				});
			}
		}
	);
}
