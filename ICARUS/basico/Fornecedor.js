//########################################################
//VERSd DA TELA
//########################################################
var RELEASE  = '0.003';


var objTabelaFrn = {};
var LIMITE_REGISTROS = 80;

var DIV_TABELA_PRODFORNEC = "#produtofornec";
var DIV_TABELA_OBS = "#fornec_obs";
var DIV_TABELA = "#dadosfornec2";
var DIV_DETALHES = "#divDetalhesFornec";

var EXEC = '../basico/Fornecedor.Exec.php';

var objTabelaProdFornec = {};
var objTabelaObs = {};
var objTabela = {};
var objInfo = {};

/*///////////////////////////////////
	Objeto da consulta
*////////////////////////////////////
var objFornecedor = {};

	objFornecedor.divDaConsulta = '';
/* ATRIBUTOS */
	objFornecedor.fornecNum = '';
	objFornecedor.fornecAbrev = '';
	objFornecedor.contato = '';
	objFornecedor.telefone = '';
	objFornecedor.fax = '';
	objFornecedor.grupo = '';
	objFornecedor.ativo = '';
	objFornecedor.razao = '';
	objFornecedor.pessoa = '';
	objFornecedor.cnpj = '';
	objFornecedor.ie = '';
	objFornecedor.endereco = '';
	objFornecedor.enderNum = '';
	objFornecedor.bairro = '';
	objFornecedor.cep = '';
	objFornecedor.cidade = '';
	objFornecedor.uf = '';
	objFornecedor.pais = '';
	objFornecedor.email = '';
	objFornecedor.desconto = '';
	objFornecedor.prazos = '';
	objFornecedor.obs1 = '';
	objFornecedor.obs2 = '';
	objFornecedor.conta = '';
	objFornecedor.consumo = '';
	objFornecedor.calcICMS = '';
	objFornecedor.calcST = '';
	objFornecedor.comple = '';

/* fim do objFornecedor */


function liberaAcesso(){
	// swal.loading("Carregando Dados...");
	loading.show('Carregando Dados...');

	if (!TestaAcesso('BAS.FORNECEDOR')) { //usuario sem acesso fecha janela
		swal({
				title: "Atenção",
				text: "Você não possui acesso a essa tela, ela será fechada!<br>" +
					  "Nome do acesso necessáro: BAS.FORNECEDOR",
				type: "warning",
				html: true,
			},
			function() {
				var win = window.open("", "_self");
				win.close();
			}
		);
		return;
	}

	if (!TestaAcesso('BAS.FORNECEDOR', 3)) {
		$(".deleta").attr("disabled", 'disabled');
	}

	if (!TestaAcesso('BAS.FORNECEDOR', 2)) {
		$(".insere").attr("disabled", 'disabled');
		$(".grava").attr("disabled", 'disabled');
		$(".cancela").attr("disabled", 'disabled');
	}

	if (!TestaAcesso('BAS.CLIENTE', 2)) {
		$("#btnCliFor").attr("disabled", 'disabled');
	}

	getCombos_fo();
}


function getCombos_fo(){
	var funcao = 'funcao=loadCombo';
	ajax(funcao,EXEC,function(retorno){
		// retorno = json(retorno);
		// if(!retorno){
		// 	var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
		// 	swal('Erro ao montar combos',erro,'error');
		// 	return;
		// }
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar combos',retorno.mensagem,'error');
			return;
		}

		//GRUPOS
		$.each(retorno.fo_grupo, function (key, grupo){
		    $('#cbGrupo1').append($('<option>', {value: grupo, text : grupo }));
		});

		//UF
		$.each(retorno.fo_uf, function (key, uf){
		    $('#cbUF1').append($('<option>', {value: uf, text : uf }));
		});


		//conta
		$.each(retorno.conta, function (key, conta){
		    $('select[name=fo_grdesp]').append($('<option>', {value: conta.pl_codreduz, text : conta.pl_descricao }));
		});

		objInfo = retorno;

		$('.ui.dropdown').dropdown();
		//########################################################
		//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
		//########################################################
		$('#det_fornecedor .dropdown').dropdown({
			onChange: function(value, text, itemlista) {
				if($(itemlista).parent().siblings("select").attr("id") == "cbOrdemPf"){
					$('#search').val('');
				}
				$('#search').select();
			}
		});

		// swal.close();
		loading.close();
		bloqueia_detalhes(true);
		$('#search').select();
	});
}



/////AQUI
function monta_query_fornec(fcuston_monta){
	if($("#search").is( ":focus" )){
		$('#search').blur(); //para tirar o foco da pesquisa
	}

	LimpaTabela(DIV_TABELA);
	$(DIV_TABELA).html("<img src='../component/loading.gif' />");

	// LIMPA DETALHES
	$("#divDetalhesFornec input[type=text]").val("");

	//MONTA FUNCAO
	var funcao = "ordem=" + $("#cbOrdem_novo").val() +
	 									"&pesquisa=" + encode_uri($('#search').val()) +
			  							"&status=" + $("#cbStatus1").val() +
										"&grupo=" + $("#cbGrupo1").val() +
										"&uf=" + $("#cbUF1").val() +
										"&funcao=monta";


	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar fornecedores',erro,'error');
			return;
		}

		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de fornecedores',retorno.mensagem,'error');
			return;
		}

		$('#record_fo').val(retorno.total);
		objTabela = retorno;

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination_fornec(1);

		if(!empty(fcuston_monta)){
			fcuston_monta();
		}

		$('#search').select();
	});
}



//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas_fornec(paginaAtual,totalDePaginas){
	$('#pagination_fo').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4;
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1)  : totalDePaginas);

	if(paginaAtual >= (links + 2)){
		$('#pagination_fo').append("<span onclick='pagination_fornec(" + 1 + ");'>" + 1 + "</span>");
		$('#pagination_fo').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination_fo').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			$('#pagination_fo').append("<span onclick='pagination_fornec(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}

	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination_fo').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		$('#pagination_fo').append("<span onclick='pagination_fornec(" + totalDePaginas + ");' class='cor_padraoInvert_hover' >" + totalDePaginas + "</span>");
	}
}


//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination_fornec(paginaAtual,fCustom){
	var totalDePaginas = Math.ceil(objTabela.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objTabela.total)
		fim = objTabela.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);

	// LIMPA CAMPOS DOS ITENS E DE TRANSPORTADORA
	LimpaTabela(DIV_TABELA_OBS);
	$(DIV_TABELA_OBS).attr('Fornec','');
	LimpaTabela(DIV_TABELA_PRODFORNEC);
	$(DIV_TABELA_PRODFORNEC).attr('Fornec','');
	$(DIV_DETALHES).attr('posicao','');


	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas_fornec(paginaAtual,totalDePaginas);

	//RESETA A POSICAO
	$('#position_fo').val("null");

	//RESETA TOTAL
	$('#record_fo').val(objTabela.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabela.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += monta_linha(i);
			tabela += "</tr>";
			$(DIV_TABELA).append(tabela);
		}

		//VERIFICA SE A TABELA E OS INPUTS EXTRAS FICARÃO BLOQUEADOS
		if (!TestaAcesso('BAS.FORNECEDOR', 2)) {
			$(DIV_TABELA + " td").addClass("inativo");
			$(DIV_TABELA + " td input").prop("readonly",true);
		}
	} else {
		bloqueia_detalhes(true);
	}


	//SELECIONA A PRIMEIRA LINHA
	if(objTabela.total > 0 && empty(fCustom)){
		pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
		$(DIV_TABELA).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
	}
	else{
		$('#search').focus();
	}

	if(!empty(fCustom)){
		fCustom();
	}

	$(DIV_TABELA).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}


//########################################################
//MONTA LINHAS
//########################################################
function monta_linha(i){
	var aux = objTabela.registros[i];

	var table =	""+
				"<td class='w20 inativo center'><input value='' readonly/></td>"+
				"<td class='w60 inativo number'><input value='"+aux.fo_number+"' name='fo_number' readonly/></td>"+
				"<td class='w200'><input value='"+aux.fo_abrev+"' name='fo_abrev' class='uppercase' maxlength='20'/></td>"+
				"<td class='w120'><input value='"+aux.fo_contato+"' name='fo_contato' class='uppercase' maxlength='15'/></td>"+
				"<td class='w100'><input value='"+aux.fo_fone+"' name='fo_fone' maxlength='20'/></td>"+
				"<td class='w110'><input value='"+aux.fo_fax+"' name='fo_fax' maxlength='20'/></td>"+
				"<td class='w80 center'><input value='"+aux.fo_grupo+"' name='fo_grupo'/>"+
					"<select name='fo_grupo'></select></td>"+
				"<td class='w60 center'><input value='"+aux.fo_ativo+"' name='fo_ativo'/>"+
					"<select name='fo_ativo'></select></td>";

	return table;
}


//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position_fo').val(actpos);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');

	if($(DIV_DETALHES).attr('posicao') != actpos){
		$(DIV_DETALHES).attr('posicao', actpos);
		fillinput(actpos);
	}


	if($("#divObsFornec").attr('Fornecedor') != actpos && $('#divObsFornec').is( ":visible" )){
		$("#divObsFornec").attr('Fornecedor', actpos);
		monta_FornecObs();
		return;
	}

	if($("#divProdFornec").attr('Fornecedor') != actpos && $('#divProdFornec').is( ":visible" )){
		$("#divProdFornec").attr('Fornecedor', actpos);
		$("#divProdFornec input[name=fo_desc]").val($(DIV_DETALHES+" input[name=fo_desc]").val());
		monta_ProdutoFornec();
		return;
	}
}

//########################################################
//PREENCHE INPUTS DO FILDSET SELECIONADO
//########################################################
function fillinput(posicao){

	$(DIV_DETALHES + " input[type=text]").val("");
	$(DIV_DETALHES + " input[name=fo_consumo]").val('0');
	$(DIV_DETALHES + " input[name=fo_calc_icms]").val('F');
	$(DIV_DETALHES + " input[name=fo_calc_st]").val('F');
	if(empty(posicao)){
		return;
	}
	var aux = objTabela.registros[posicao];


	jQuery.each(aux, function(key,value){
		var campo = key;
		var linha = DIV_DETALHES + " input[name="+campo+"]";
		$(linha).val(value);

		if(campo == "fo_muncod" || campo == "fo_paiscod"){
			$(DIV_DETALHES +" input[name="+campo+"]").attr(campo, value);
		}

		if(campo == "fo_calc_icms" || campo == "fo_calc_st" || campo == "fo_consumo"){
			linha = DIV_DETALHES + " input[type='checkbox'][name="+campo+"]";
			var valida = (value === '1' || value === 'T' ? true : false);

			if(valida){
				$(linha).val(value).parent().checkbox('check');
			}else{
				$(linha).val(value).parent().checkbox('uncheck');
			}
		}

		if(campo == "fo_pessoa" || campo == "fo_grdesp"){
			linha = DIV_DETALHES + " select[name="+campo+"]";
			if(!empty(value)){
				$(linha).parent().dropdown("set selected",value);
			}
		}
	});

	bloqueia_detalhes(false);
}


//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao_fo(elemento){
	var actpos = $(elemento).closest("*[posicao]").attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabela.registros[actpos][campo];

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actpos,DIV_TABELA) !== ''){
		return;
	}

	setStatus(actpos,'a',DIV_TABELA);

	Bloqueia_Linhas(actpos,DIV_TABELA);
}


//########################################################
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere_fo(){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position_fo').val(),1);
		return;
	}

	//########################################################
	//FECHA A FILDSET DE PRODUTO_FORNEC
	//########################################################

	if($('#divProdFornec').is(':visible')){
		$('#divProdFornec').hide();
	}

	if($('#divObsFornec').is(':visible')){
		$('#divObsFornec').hide();
	}


	if(empty(objTabela)){
		objTabela = {};
		objTabela.registros = [];
		objTabela.total = 0;
	}

	var novaPosicao = {};
	//VALORES DA TABELA
	novaPosicao.fo_number = "";
	novaPosicao.fo_abrev = "";
	novaPosicao.fo_contato = "";
	novaPosicao.fo_fone = "";
	novaPosicao.fo_fax = "";
	novaPosicao.fo_grupo = "";
	novaPosicao.fo_ativo = "A";

	//VALORES DO FIELDSET
	novaPosicao.fo_razao = "";
	novaPosicao.fo_pessoa = "J";
	novaPosicao.fo_cgc = "";
	novaPosicao.fo_iest = "";
	novaPosicao.fo_ender = "";
	novaPosicao.fo_endnum = "";
	novaPosicao.fo_comple = "";
	novaPosicao.fo_bairro = "";
	novaPosicao.fo_cep = "";
	novaPosicao.fo_cidade = "";
	novaPosicao.fo_muncod = "";
	novaPosicao.fo_uf = "";
	novaPosicao.fo_pais = "BRASIL";
	novaPosicao.fo_paiscod = "1058";
	novaPosicao.email = "";
	novaPosicao.fo_desc = "0,00";
	novaPosicao.fo_descesp = "0,00";
	novaPosicao.fo_rateio = "100";
	novaPosicao.fo_mva = "0.00";
	novaPosicao.fo_prazo = "";
	novaPosicao.fo_entrega = "0";
	novaPosicao.fo_grdesp = "";
	novaPosicao.fo_curva = "";
	novaPosicao.fo_consumo = "0";
	novaPosicao.fo_calc_icms = "T";
	novaPosicao.fo_calc_st = "T";


	objTabela.registros.push(novaPosicao);
	objTabela.total += 1;

	var actpos = objTabela.total > 0 ? (objTabela.total - 1) : 0;

	pagination_fornec((Math.ceil(objTabela.total / LIMITE_REGISTROS)),function(){
		pintaLinha($(DIV_TABELA + " tr[posicao="+actpos+"]"));
		setStatus(actpos,'+',DIV_TABELA);
		Bloqueia_Linhas(actpos,DIV_TABELA);
		$('#record_fo').val(objTabela.total);
		selecionaLinha(DIV_TABELA,actpos,2);
	});
}

//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui_fo(){
	var actpos = $('#position_fo').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	if(getStatus(actpos,DIV_TABELA) !== ''){
		return;
	}

	var fo_number = objTabela.registros[actpos].fo_number;

	swal({
			title: "Deseja excluir o Fornecedor "+fo_number+" selecionado?",
			type: "warning",
			showCancelButton: true,
			confirmButtonText: "Sim",
			cancelButtonText: "Não",
			closeOnConfirm: false,
			closeOnCancel: true,
			showLoaderOnConfirm: true,
			confirmButtonColor: "#DD6B55"
		}, function(confirmouExclusao){
			if(!confirmouExclusao){
				return;
			}
			var funcao = "funcao=deleta&number=" + fo_number;

			ajax(funcao,EXEC,function(retorno){
				retorno = json(retorno);
				if(!retorno){
					var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
					swal('Erro de exclusão',erro,'error');
					return;
				}
				//ERRO
				if(!empty(retorno.error)){
					swal({
							title:'Erro ao excluir tabela Fornecedor',
							text: retorno.mensagem,
							type: 'error'
						},
						function(){
							selecionaLinha(DIV_TABELA,actpos,1);
						}
					);
					return;
				}

				objTabela.registros.splice(actpos,1);
				objTabela.total -= 1;
				swal.close();

				var paginaAtual = getPagina('#record_fo',"#pagination_fo", LIMITE_REGISTROS);

				pagination_fornec(paginaAtual,function(){
					$('#record_fo').val(objTabela.total);
					if(objTabela.total > 0){
						if(actpos > 0){
							--actpos;
						}
						selecionaLinha(DIV_TABELA,actpos,1);
					}
				});
			});
		}
	);
}

//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava_fo(cell,extra){
	var actpos = $('#position_fo').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}
	var status = getStatus(actpos,DIV_TABELA);

	if(empty(cell)){
		cell = 1;
	}

	//Nd HOUVE ALTERA?O
	if(status === ''){
		selecionaLinha(DIV_TABELA,actpos,cell);

		if(!empty(extra)){
			setTimeout(function () {
				$(DIV_DETALHES + " input[name="+extra+"]").select();
			}, 20); //A FUN?O SELECIONALINHA TEM UM setTimeout DE 10 ENTd COLOCO UM DE 20 PARA SOBRESCREVER
		}

		return;
	}

	var linha = DIV_TABELA + " tr[posicao="+actpos+"] input";

	funcao = "&funcao=grava&comando=" + (status == '+' ? 'insert' : 'update');
	//FO_ABREV, FO_CONTATO, FO_FONE, FO_FAX, FO_GRUPO, FO_ATIVO,
	funcao += "&fo_abrev="+encode_uri($(linha+"[name=fo_abrev]").val())+
				"&fo_contato="+$(linha+"[name=fo_contato]").val()+
				"&fo_fone="+$(linha+"[name=fo_fone]").val()+
				"&fo_fax="+$(linha+"[name=fo_fax]").val()+
				"&fo_grupo="+$(linha+"[name=fo_grupo]").val()+
				"&fo_number="+$(linha+"[name=fo_number]").val()+
				"&fo_ativo="+$(linha+"[name=fo_ativo]").val();

	//VERIFICA O CNPJ VALIDO BUSCANDO NA TABELA AUXILIAR SE PODE GRAVAR OU NAO
	var cnpj = $(DIV_DETALHES + " input[name=fo_cgc]").val();
	var fo_pessoa = $(DIV_DETALHES + " select[name=fo_pessoa] option:selected").val();

	if( (!validaCnpj(cnpj) && !valida_cpf(cnpj)) && objInfo.fo_cnpj == 'N' && fo_pessoa !== 'I'){
		swal('ERRO!','CNPJ/CPF Inválido','error');
		return;
	}
	funcao += "&fo_cgc="+cnpj;
	//VERIFICA O CNPJ VALIDO BUSCANDO NA TABELA AUXILIAR SE PODE GRAVAR OU NAO

	$(DIV_DETALHES+' :input').each(function(key,value){
		if(!$(value).hasClass("btn")){
			if(!$(value).hasClass("number")){
				funcao +="&"+$(value).attr('name')+"="+($(value).attr('name') == 'fo_razao' ? encode_uri($(value).val()) : $(value).val());
			} else{
				funcao +="&"+$(value).attr('name')+"="+$(value).val().replace(",", ".");
			}
		}
	});


	swal.loading('Gravando dados...');
	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			LimpaTabela(DIV_TABELA);
			$(DIV_TABELA).html(erro);
			swal('Erro ao gravar alteração do Fornecedor',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			// swal({
			// 		title: 'Erro ao gravar Fornecedor',
			// 		text: retorno.mensagem,
			// 		type: 'error'
		swal({
				title: 'Erro ao gravar',
				text: retorno.mensagem,
				type: 'error',
				// showCancelButton: cancelaButton,
				// confirmButtonText: textoConfirma,
				},



				function(){
					selecionaLinha(DIV_TABELA,actpos,cell);

					if(!empty(extra)){
						setTimeout(function () {
							$(DIV_DETALHES + " input[name="+extra+"]").select();
						}, 20); //A FUN?O SELECIONALINHA TEM UM setTimeout DE 10 ENTd COLOCO UM DE 20 PARA SOBRESCREVER
					}
				}
			);
			return;
		}

		//VOU ATUALIZAR O MEU OBJETO JSON
		//VALORES DA TABELA
		objTabela.registros[actpos].fo_number = retorno;
		objTabela.registros[actpos].fo_abrev = $(linha+"[name=fo_abrev]").val();
		objTabela.registros[actpos].fo_contato = $(linha+"[name=fo_contato]").val();
		objTabela.registros[actpos].fo_fone = $(linha+"[name=fo_fone]").val();
		objTabela.registros[actpos].fo_fax = $(linha+"[name=fo_fax]").val();
		objTabela.registros[actpos].fo_grupo = $(linha+"[name=fo_grupo]").val();
		objTabela.registros[actpos].fo_ativo = $(linha+"[name=fo_ativo]").val();


		$(DIV_DETALHES+' :input').each(function(key,value){
			var nome = $(value).attr('name');
			if(!$(value).hasClass("btn"))
				objTabela.registros[actpos][nome] = $(value).val();
		});

		$("#divProdFornec input[name=fo_desc]").val($(DIV_DETALHES+" input[name=fo_desc]").val());

		if(status === '+'){
 			setStatus(actpos,'a',DIV_TABELA);
		}

		$('#record_fo').val(objTabela.total);
		cancela_fo(cell,extra);

		//VERIFICA O CNPJ VALIDO BUSCANDO NA TABELA AUXILIAR SE PODE GRAVAR OU NAO
		if(objTabela.registros[actpos].fo_pessoa != "I" && !validaCnpj(cnpj) && !valida_cpf(cnpj)){
		   swal("Atenção!","O CNPJ/CPF deste fornecedor esta inválido, confira após a gravação", "warning" );
		   return;
   		}

		swal.close();
	});
}


//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela_fo(cell,extra){
	var actpos = $('#position_fo').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

	var ao_final = 	function(){
						selecionaLinha(DIV_TABELA,actpos,cell);

						if(!empty(extra)){
							setTimeout(function () {
								$(DIV_DETALHES + " input[name="+extra+"]").select();
							}, 20); //A FUN?O SELECIONALINHA TEM UM setTimeout DE 10 ENTd COLOCO UM DE 20 PARA SOBRESCREVER
						}
				  	};

	if(getStatus(actpos,DIV_TABELA) === 'a'){
		var td = monta_linha(actpos);

		$(DIV_TABELA + " tr[posicao="+actpos+"]").html(td);
		fillinput(actpos);
		Desbloqueia_Linhas(actpos,DIV_TABELA);

		ao_final();
	}
	else if(getStatus(actpos,DIV_TABELA) === '+'){
		objTabela.registros.splice(actpos,1);
		objTabela.total -= 1;

		var paginaAtual = getPagina('#record_fo','#pagination_fo',LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		pagination_fornec(paginaAtual,function(){
			$('#record_fo').val(objTabela.total);
			if(objTabela.total > 0){
				if(actpos > 0){
					--actpos;
				}
				ao_final();
			}
		});
	}
	else if(getStatus(actpos,DIV_TABELA) === ''){
		ao_final();
	}
}


//########################################################
//BLOQUEIA DIV DE DETALHES
//########################################################
function bloqueia_detalhes(bloqueia){
	if (!TestaAcesso('BAS.FORNECEDOR', 2)) {
		bloqueia = true;
	}

	var os_elementos = $(DIV_DETALHES + " input[type=text]:not(.inativo), " +
					  DIV_DETALHES + " input[type=date], " +
					  DIV_DETALHES + " input[type=checkbox],"+
					  "#btnCNPJ,#btnIE, #lbLucroPres, #lbCalcST, #lbConsFim, #btnEmail"
				  	);
	var os_selects = $(DIV_DETALHES + " .ui.dropdown:not(.inativo)");

	os_elementos.prop("disabled", bloqueia);
	os_selects.removeClass("disabled");

	if(bloqueia){
		os_selects.addClass("disabled");
	}
}




//########################################################
//GERA UM SWAL QUE ABRE A TELA PARA CRIAR UM RECIBO PARA O FORNECEDOR
//########################################################
function abre_recibo(){
	var actpos = $('#position_fo').val();
	if(empty(actpos)){
		swal('Aten?','É necessário selecionar uma linha','warning');
		return;
	}

	fo_number = objTabela.registros[actpos].fo_number;

	var HTMLrecibo = ""+
		"<div id='div_impostos' class='h200'>"+
			"<div class='float-left w200' style='margin: 10px 0 10px 20px;'>"+
				"<p class='text-align-left' style='margin: 0 0 8px 0;'>Finalidade</p>"+
				"<input type='text' id='re_final' class='w200 margin0 inline text-align-left' style='padding: 0px 12px;'>"+
			"</div>"+

			"<div class='float-left w200' style='margin: 10px 0 10px 20px;'>"+
				"<p class='text-align-left' style='margin: 0 0 8px 0;'>Tipo de Pagto.</p>"+
				"<input type='text' id='re_pagto' class='w200 margin0 inline text-align-left' style='padding: 0px 12px;'>"+
			"</div>"+

			"<div class='float-left w200' style='margin: 10px 0 10px 20px;'>"+
				"<p class='text-align-left' style='margin: 0 0 8px 0;'>Valor</p>"+
				"<input type='text' id='re_valor' onblur='notnull(event);' onkeypress='return somenteNumero(event);' class='w200 number margin0 inline text-align-left'"+
				" style='padding: 0px 12px;'>"+
			"</div>"+

			"<div class='float-left w200' style='margin: 10px 0 10px 20px;'>"+
				"<p class='text-align-left' style='margin: 0 0 8px 0;'>Data</p>"+
				"<input type='date' id='re_data' value="+$("#DATA_US").val()+" class='w200 margin0 inline text-align-left' style='padding: 0px 12px;'>"+
			"</div>"+

		"</div>";

	//EXIBE LAYOUT
	swal({
		title: "RECIBO",
		text: HTMLrecibo,
		html: true,
		showCancelButton: true,
		confirmButtonText: "Visualiza",
		closeOnConfirm: false,
		closeOnCancel: true,
		showLoaderOnConfirm: true,
	}, function(confirmou){
		//SE COMFIRMOU VERIFICA DADOS PREENCHIDOS
		if(!confirmou){
			selecionaLinha(DIV_TABELA,actpos,1);
			return;
		}

		var re_final = $("#re_final").val();
		var re_pagto = $("#re_pagto").val();
		var re_valor = $("#re_valor").val();
		var re_data = $("#re_data").val();

		if(empty(re_final)){
			swal.showInputError("Coloque uma finalidade para o Recibo");
			return false;
		}
		if(empty(re_pagto)){
			swal.showInputError("Coloque um Tipo de pagamento");
			return false;
		}
		if(empty(re_valor) || re_valor === 0  ){
			swal.showInputError("Coloque um valor para o Recibo");
			return false;
		}

		if(empty($.trim(re_data))){
			swal.showInputError("Coloque a data do Recibo");
			return false;
		}

		var reg = /^[0-9]{4}(-[0-9]{2}){2}$/g;

		if(!reg.test(re_data)){
			swal.showInputError("Data do Recibo digitada inv?da!");
			return false;
		}
		window.open(encodeURI("../basico/Imp.ReciboFornec.Layout.php?fornec="+fo_number+
								"&referente="+re_final+
								"&valor="+re_valor.replace(",", ".")+
								"&tipopag="+re_pagto+
								"&dataini="+re_data ));

		swal.close();
	});
}



//########################################################
//FAZ A BUSCA NO BANCO DE DADOS
//########################################################
function monta_FornecObs(){

	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),1);
		return;
	}

	var actpos = $('#position_fo').val();
	if(empty(actpos)){
		swal('Aten?','É necessário selecionar uma linha','warning');
		return;
	}

	LimpaTabela(DIV_TABELA_OBS);
   	$(DIV_TABELA_OBS).html("<img src='../component/loading.gif' />");
	// var fo_number1 = get("tabFornec").rows[actpos].getElementsByTagName('input')[1].value;
	// alert(fo_number + "\n"+ fo_number1);

	fo_number = objTabela.registros[actpos].fo_number;

	var funcao ="funcao=monta_obs&fo_number=" + fo_number;

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Observa?s',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar Observa?s',retorno.mensagem,'error');
			return;
		}

		$('#record_obs').val(retorno.total);
		objTabelaObs = retorno;

		pagination_obs(1);

	});

}


//########################################################
//MONTA A PAGINA?O DA TABELA PRODUTO FORNECEDOR
//######################################################
function pagination_obs(paginaAtual,fCustom){
	// LIMPA CAMPOS DOS ITENS E DE TRANSPORTADORA
	LimpaTabela(DIV_TABELA_OBS);
	$(DIV_TABELA_OBS).attr('Fornec','');

	$("#divObsFornec").attr('Fornec','');
	//RESETA A POSICAO
	$('#position_obs').val("null");

	//RESETA TOTAL
	$('#record_obs').val(objTabelaObs.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	// LimpaTabela(DIV_TABELA_PRODFORNEC);
	$(DIV_TABELA_OBS).html('');
	if(objTabelaObs.total > 0){
		for(var i = 0; i < objTabelaObs.total; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += monta_linha_obs(i);
			tabela += "</tr>";
			$(DIV_TABELA_OBS).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaObs.total > 0 && empty(fCustom)){
		pintaLinha_obs($(DIV_TABELA_OBS + ' tr:eq(0)'));
		$(DIV_TABELA_OBS).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
	}

	if(!empty(fCustom)){
		fCustom();
	}

	if(!$('#divProdFornec').is(':hidden')){
		monta_ProdutoFornec();
	}

	$(DIV_TABELA_OBS).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}



//########################################################
//MONTA LINHAS
//########################################################
function monta_linha_obs(i){
	var aux = objTabelaObs.registros[i];
	var table =	"" +
		"<td class='w20 inativo center'><input value='' name='' readonly/></td>"+
		"<td class='w30 inativo center'><input value='"+aux.of_number+"' name='of_number' class='uppercase' maxlength='3'/></td>"+
		"<td class='w680'><input value='"+aux.of_linha+"' name='of_linha' maxlength='110'/></td>"+
	"";
	return table;
}


//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha_obs(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position_obs').val(actpos);
	$(DIV_TABELA_OBS + ' .active').removeClass('active');
	$(elemento).addClass('active');

	if($("#divObsFornec").attr('Fornec') != $("#position_fo").val() && $('#divObsFornec').is( ":visible" )){
		$("#divObsFornec").attr('Fornec',$("#position_fo").val());
	}


}








//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao_obs(elemento){
	var actpos = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaObs.registros[actpos][campo];

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actpos,DIV_TABELA_OBS) !== ''){
		return;
	}

	setStatus(actpos,'a',DIV_TABELA_OBS);
	Bloqueia_Linhas(actpos,DIV_TABELA_OBS);
	selecionaLinha(DIV_TABELA_OBS,actpos,$(elemento).parent().index());//chegar_aqui
}

//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela_obs(cell){
	var actpos = $('#position_obs').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 1;
	}

	//EDICAO
	if(getStatus(actpos,DIV_TABELA_OBS) === 'a'){
		var tr = monta_linha_obs(actpos);

		$(DIV_TABELA_OBS + " tr[posicao="+actpos+"]").html(tr);

		Desbloqueia_Linhas(actpos,DIV_TABELA_OBS);

		$(DIV_TABELA_OBS + " tr[posicao="+actpos+"] input[name=of_number]").prop('readonly', false);
		selecionaLinha(DIV_TABELA_OBS,actpos,cell);

	}else if(getStatus(actpos,DIV_TABELA_OBS) === '+'){
		objTabelaObs.registros.splice(actpos,1);
		objTabelaObs.total -= 1;


		Desbloqueia_Linhas(actpos,DIV_TABELA_OBS);

		pagination_obs(1,function(){
			$('#record_pf').val(objTabelaObs.total);
			if(objTabelaObs.total > 0){
				if(actpos > 0){
					--actpos;
				}
				selecionaLinha(DIV_TABELA_OBS,actpos,cell);
			}
		});

	}else if(getStatus(actpos,DIV_TABELA_OBS) === ''){
		selecionaLinha(DIV_TABELA_OBS,actpos,cell);
	}
}


//########################################################
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere_obs(){
	if(!Verifica_Alteracao(DIV_TABELA_OBS)){
		selecionaLinha(DIV_TABELA_OBS,$('#position_obs').val(),2);
		return;
	}

	var actpos = $("#position_fo").val();
	if(actpos === 'null'){

		swal('Erro ao inserir','É necessário selecionar uma linha','error');
		return;
	}

	if(empty(objTabelaObs)){
		objTabelaObs = {};
		objTabelaObs.registros = [];
		objTabelaObs.total = 0;
	}

	var novaPosicao = {};

	novaPosicao.fo_number = objTabela.registros[actpos].fo_number;
	novaPosicao.of_number = '';
	novaPosicao.of_linha = '';

	objTabelaObs.registros.push(novaPosicao);
	objTabelaObs.total += 1;

	actpos = objTabelaObs.total > 0 ? (objTabelaObs.total - 1) : 0;

	pagination_obs(1,function(){
		pintaLinha_obs($(DIV_TABELA_OBS + " tr[posicao="+actpos+"]"));

		setStatus(actpos,'+',DIV_TABELA_OBS);

		selecionaLinha(DIV_TABELA_OBS,actpos,2);
		Bloqueia_Linhas(actpos,DIV_TABELA_OBS);

		$(DIV_TABELA_OBS + " tr[posicao="+actpos+"] input[name=of_number]").prop('readonly', true);

		$('#record_obs').val(objTabelaObs.total);
	});
}


//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui_obs(){
	if(!Verifica_Alteracao(DIV_TABELA_OBS)){
		selecionaLinha(DIV_TABELA_OBS,$('#position_obs').val(),2);
		return;
	}

	var actpos = $('#position_obs').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}



	var fo_number = objTabela.registros[$("#position_fo").val()].fo_number;
	var of_number = objTabelaObs.registros[actpos].of_number;

	swal({
		title: "Deseja excluir esta Observa??",
		type: "warning",
		showCancelButton: true,
		confirmButtonText: "Sim",
		cancelButtonText: "Não",
		closeOnConfirm: false,
		closeOnCancel: true,
		showLoaderOnConfirm: true,
		confirmButtonColor: "#DD6B55"
	},
	function(confirmouExclusao){
		if(!confirmouExclusao){
			selecionaLinha(DIV_TABELA_OBS,actpos,1);
			return;
		}

		var funcao = "funcao=exclui_obs&fo_number=" + fo_number+"&of_number="+of_number;

		ajax(funcao,EXEC,function(retorno){
			retorno = json(retorno);
			if(!retorno){
				var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				swal('Erro de exclusão',erro,'error');
				return;
			}
			//ERRO
			if(!empty(retorno.error)){
				swal({
						title:'Erro ao excluir registros',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA_OBS,actpos,1);
					}
				);
				return;
			}

			objTabelaObs.registros.splice(actpos,1);
			objTabelaObs.total -= 1;


			pagination_obs(1,function(){
				$('#record_obs').val(objTabelaObs.total);
					if(objTabelaObs.total > 0){
						if(actpos > 0){
							--actpos;
						}
						selecionaLinha(DIV_TABELA_OBS,actpos,2);
					}
			});
			swal.close();
		});
	});
}


//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava_obs(cell){
	var actpos = $('#position_obs').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}

	var status = getStatus(actpos,DIV_TABELA_OBS);

	if(empty(cell)){
		cell = 1;
	}

	//Nd HOUVE ALTERA?O
	if(status === ''){
		selecionaLinha(DIV_TABELA_OBS,actpos,cell);
		return;
	}


	//PEGA EM FORMA DE array() OS INPUTS QUE ESTAO DENTRO DA MINHA LINHA SELECIONADA
	var linha = DIV_TABELA_OBS + " tr[posicao="+actpos+"] input";

	//INICIA A VARIAVEL DE FUNCAO
	var funcao = "funcao=grava_obs&comando=" + (status == '+' ? 'insert' : 'update');

	funcao += 	"&of_number="+$(linha+"[name=of_number]").val();
	funcao += "&of_linha="+encode_uri($(linha+"[name=of_linha]").val());

	funcao += "&of_number_original="+objTabelaObs.registros[actpos].of_number +
				"&fo_number="+objTabelaObs.registros[actpos].fo_number;

	swal.loading('Gravando dados...');
	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			$(DIV_TABELA_OBS).html('');
			$(DIV_TABELA_OBS).html(erro);
			swal('Erro ao gravar altera?s na tabela de Observaçõess',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao gravar tela de Observação',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA_OBS,actpos,cell);
				}
			);
			return;
		}

		$(linha+"[name=of_number]").prop('readonly', false);
		if(status == '+'){
			objTabelaObs.registros[actpos].of_number = retorno.numero;
		}
		else {
			objTabelaObs.registros[actpos].of_number =$(linha+"[name=of_number]").val();
		}
		objTabelaObs.registros[actpos].of_linha = $(linha+"[name=of_linha]").val();

		if(status === '+'){
			setStatus(actpos,'a',DIV_TABELA_OBS);
		}

		$('#record_obs').val(objTabelaObs.total);
		cancela_obs(cell);
		swal.close();
	});

}


//########################################################
//FAZ A BUSCA NO BANCO DE DADOS
//########################################################
function monta_ProdutoFornec(){
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),1);
		return;
	}

	var actpos = $('#position_fo').val();
	if(empty(actpos)){
		swal('Aten?','É necessário selecionar uma linha','warning');
		return;
	}
	// var fonumber = get("tabFornec").rows[actpos].getElementsByTagName('input')[1].value;
	fo_number = objTabela.registros[actpos].fo_number;
	var pesquisa = $("#search_pf").val();
	var ordem = $("#cbOrdemPf").val();



	LimpaTabela(DIV_TABELA_PRODFORNEC);
   	$(DIV_TABELA_PRODFORNEC).html("<img src='../component/loading.gif' />");

	if(empty(actpos)){
		return;
	}

	var funcao = "funcao=produtofornec&fo_number=" + fo_number + "&texto=" + pesquisa + "&order=" + ordem;

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Produtos Associados ',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar Produtos Associados',retorno.mensagem,'error');
			return;
		}

		$('#record_pf').val(retorno.total);
		objTabelaProdFornec = retorno;

		pagination_pf(1);
	});
}


//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas_pf(paginaAtual,totalDePaginas){
	$('#pagination_pf').html("");
	$("input[name=pt_descr]").val('');
	if(totalDePaginas == 1){
		return;
	}

	var links = 4;
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1)  : totalDePaginas);

	if(paginaAtual >= (links + 2)){
		$('#pagination_pf').append("<span onclick='pagination_pf(" + 1 + ");'>" + 1 + "</span>");
		$('#pagination_pf').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination_pf').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			$('#pagination_pf').append("<span onclick='pagination_pf(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}

	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination_pf').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		$('#pagination_pf').append("<span onclick='pagination_pf(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
	}
}


//########################################################
//MONTA A PAGINA?O DA TABELA PRODUTO FORNECEDOR
//########################################################
function pagination_pf(paginaAtual,fCustom){
	var totalDePaginas = Math.ceil(objTabelaProdFornec.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objTabelaProdFornec.total)
		fim = objTabelaProdFornec.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);

	// LIMPA CAMPOS DOS ITENS E DE TRANSPORTADORA
	LimpaTabela(DIV_TABELA_PRODFORNEC);
	$(DIV_TABELA_PRODFORNEC).attr('Fornec','');
	$("#divProdFornec").attr('Fornec','');

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas_pf(paginaAtual,totalDePaginas);

	//RESETA A POSICAO
	$('#position_pf').val("null");

	//RESETA TOTAL
	$('#record_pf').val(objTabelaProdFornec.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	// LimpaTabela(DIV_TABELA_PRODFORNEC);
	$(DIV_TABELA_PRODFORNEC).html('');
	if(objTabelaProdFornec.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += monta_linha_pf(i);
			tabela += "</tr>";
			$(DIV_TABELA_PRODFORNEC).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaProdFornec.total > 0 && empty(fCustom)){
		pintaLinha_pf($(DIV_TABELA_PRODFORNEC + ' tr:eq(0)'));
		$(DIV_TABELA_PRODFORNEC).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
	}

	if(!empty(fCustom)){
		fCustom();
	}

	$(DIV_TABELA_PRODFORNEC).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}



//########################################################
//MONTA LINHAS
//########################################################
function monta_linha_pf(i){
	var aux = objTabelaProdFornec.registros[i];

	//MONTA A LINHA
	var table =	"" +
		"<td class='w20 inativo center'><input value='' readonly/></td>"+
		"<td class='w80'><input value='"+aux.pt_code+"' name='pt_code' maxlength='15' class='uppercase'/></td>"+
		"<td class='w100 bg laranja'><input value='"+aux.fp_code+"' name='fp_code' maxlength='15' class='uppercase'/></td>"+
		"<td class='w120'><input type='date' value='"+aux.fp_dtcotacao+"' name='fp_dtcotacao'/></td>"+
		"<td class='w70 number'><input value='"+aux.fp_valcotdolar+"' name='fp_valcotdolar' class='uppercase'/></td>"+
		"<td class='w80 number'><input value='"+aux.fp_valcotacao+"' name='fp_valcotacao' class='uppercase'/></td>"+
		"<td class='w80'><input value='"+aux.fp_condicao+"' name='fp_condicao' maxlength='15' class='uppercase'/></td>"+
		"<td class='w120 inativo'><input type='date' value='"+aux.fp_dtcompra+"' name='fp_dtcompra' readonly/></td>"+
		"<td class='w60 number inativo'><input value='"+aux.fp_valcompra+"' name='fp_valcompra' readonly/></td>";

	return table;
}



//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha_pf(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position_pf').val(actpos);
	$(DIV_TABELA_PRODFORNEC + ' .active').removeClass('active');
	$(elemento).addClass('active');

	if($("#divProdFornec").attr('Fornec') != actpos && $('#divProdFornec').is( ":visible" )){
		$("#divProdFornec").attr('Fornec',actpos);

		$("#divProdFornec input[name=pt_descr]").val(objTabelaProdFornec.registros[actpos].pt_descr);
	}

	if(getStatus(actpos,DIV_TABELA_PRODFORNEC) === "+" && empty($(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input[name=pt_code]").val()) ){

		if($(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input[name=pt_code]").is(":focus")){
			return;
		}

		selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,1);
	}

}


//########################################################
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere_pf(){
	if(!Verifica_Alteracao(DIV_TABELA_PRODFORNEC)){
		selecionaLinha(DIV_TABELA_PRODFORNEC,$('#position_pf').val(),2);
		return;
	}
	var actpos = $("#position_fo").val();
	if(actpos === 'null'){

		swal('Erro ao inserir','É necessário selecionar uma linha','error');
		return;
	}

	if($("#fo_desc").val() === ''){

		swal('Erro ao inserir','Campo Desconto deve ser Preenchido','error');
		return;
	}

	if(empty(objTabelaProdFornec)){
		objTabelaProdFornec = {};
		objTabelaProdFornec.registros = [];
		objTabelaProdFornec.total = 0;
	}


	var novaPosicao = {};

	novaPosicao.pt_code = '';
	novaPosicao.fo_number = objTabela.registros[actpos].fo_number;
	novaPosicao.fp_code = '';
	novaPosicao.fp_dtcotacao = $("#DATA_US").val();
	novaPosicao.fp_valcotacao = "0,00";
	novaPosicao.fp_dtcompra = "";
	novaPosicao.fp_valcompra = "0,00";
	novaPosicao.fp_condicao = '';
	novaPosicao.fp_valcotdolar = "0,00";
	novaPosicao.pt_descr = '';
	novaPosicao.fo_desc = "0,00";

	objTabelaProdFornec.registros.push(novaPosicao);
	objTabelaProdFornec.total += 1;

	actpos = objTabelaProdFornec.total > 0 ? (objTabelaProdFornec.total - 1) : 0;

	pagination_pf((Math.ceil(objTabelaProdFornec.total / LIMITE_REGISTROS)),function(){
		pintaLinha_pf($(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"]"));

		setStatus(actpos,'+',DIV_TABELA_PRODFORNEC);

		selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,1);
		Bloqueia_Linhas(actpos,DIV_TABELA_PRODFORNEC);

		$('#record_pf').val(objTabelaProdFornec.total);

		$(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] td:not(.inativo) input:not([name=pt_code])").prop('readonly',true);
	});

}

//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela_pf(cell){
	var actpos = $('#position_pf').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 1;
	}

	//EDICAO
	if(getStatus(actpos,DIV_TABELA_PRODFORNEC) === 'a'){
		var tr = monta_linha_pf(actpos);

		$(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"]").html(tr);

		Desbloqueia_Linhas(actpos,DIV_TABELA_PRODFORNEC);

		selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);

	}else if(getStatus(actpos,DIV_TABELA_PRODFORNEC) === '+'){
		objTabelaProdFornec.registros.splice(actpos,1);
		objTabelaProdFornec.total -= 1;

		var paginaAtual = getPagina('#record_pf','#pagination_pf',LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA_PRODFORNEC);

		pagination_pf(paginaAtual,function(){
			$('#record_pf').val(objTabelaProdFornec.total);
			if(objTabelaProdFornec.total > 0){
				if(actpos > 0){
					--actpos;
				}
				selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);
			}
		});

	}else if(getStatus(actpos,DIV_TABELA_PRODFORNEC) === ''){
		selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);
	}
}

//########################################################
//COLOCA E STATUS DE EDI?O A DIV
//########################################################
function edicao_pf(elemento){
	var actpos = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaProdFornec.registros[actpos][campo];

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actpos,DIV_TABELA_PRODFORNEC) !== ''){
		return;
	}


	if(campo == "fp_valcotdolar" || campo == "fp_valcotacao"){
		// alert($("#getData").html());
		$(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input[name=fp_dtcotacao]").val($("#DATA_US").val());
	}

	setStatus(actpos,'a',DIV_TABELA_PRODFORNEC);
	Bloqueia_Linhas(actpos,DIV_TABELA_PRODFORNEC);
	selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,$(elemento).parent().index());//chegar_aqui

}



//########################################################
//Nd PERMITE O CAMPO FICAR VAZIO E TRAS FORMATA?O DE NUMERO
//########################################################
function notnull(elemento){
	//PEGA O NAME DO INPUT
	var campo = $(elemento).attr('name');
	var casa = 2;

	if(campo == "fo_rateio" || campo == "fo_entrega"){
		casa = 0;
	}

	if($(elemento).val() === ''){
		$(elemento).val('0');
	}
	if($(elemento).val() !== '' && $(elemento).val() != $(elemento).attr("last_value")){
		$(elemento).val(toNumber($(elemento).val()));
		$(elemento).val(function(index,value){ return value.replace(",","."); });
		$(elemento).val(function(index,value){return number_format($(elemento).val(),casa,",",""); });
		$(elemento).attr('last_value', $(elemento).val());
	}
}


//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui_pf(){
	var actpos = $('#position_pf').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	var pt_code = objTabelaProdFornec.registros[actpos].pt_code;
	var fo_number = objTabelaProdFornec.registros[actpos].fo_number;
	var fp_code = objTabelaProdFornec.registros[actpos].fp_code;

	swal({
		title: "Deseja excluir o registro do produto "+pt_code+"?",
		type: "warning",
		showCancelButton: true,
		confirmButtonText: "Sim",
		cancelButtonText: "Não",
		closeOnConfirm: false,
		closeOnCancel: true,
		showLoaderOnConfirm: true,
		confirmButtonColor: "#DD6B55"
	},function(confirmouExclusao){
		if(!confirmouExclusao){
			return;
		}

		var funcao = "funcao=exclui_pf&pt_code="+pt_code+"&fo_number="+fo_number+"&fp_code="+fp_code;

		ajax(funcao, EXEC, function(retorno){
			retorno = json(retorno);
			if(!retorno){
				var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				swal('Erro de exclusão',erro,'error');
				return;
			}
			//ERRO
			if(!empty(retorno.error)){
				swal({
						title:'Erro ao excluir registros',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,0);
					}
				);
				return;
			}

			objTabelaProdFornec.registros.splice(actpos,1);
			objTabelaProdFornec.total -= 1;

			var paginaAtual = getPagina('#record_pf',"#pagination_pf",LIMITE_REGISTROS);

			pagination_pf(paginaAtual,function(){
				$('#record_pf').val(objTabelaProdFornec.total);
				swal({
					title:'OK',
					text: 'Rela? excluida com sucesso!',
					type: 'success'
				}, function(){
					if(objTabelaProdFornec.total > 0){
						if(actpos > 0){
							--actpos;
						}
						selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,0);
					}
				});
			});
		});
	});
}



//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava_pf(cell){
	var actpos = $('#position_pf').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','é necessário selecionar uma linha','error');
		return;
	}


	var status = getStatus(actpos,DIV_TABELA_PRODFORNEC);

	if(empty(cell)){
		cell = 1;
	}

	//Nd HOUVE ALTERA?O
	if(status === ''){
		selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);
		return;
	}

	//PEGA EM FORMA DE array() OS INPUTS QUE ESTAO DENTRO DA MINHA LINHA SELECIONADA
	var linha = DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input";

	if(empty($(linha+"[name=pt_code]").val())){
		swal('Erro ao gravar','É necessário selecionar o código do Produto','error');
		return;
	}

	var verifica_data = $(linha+"[name=fp_dtcotacao]").val() == objTabelaProdFornec.registros[actpos].fp_dtcotacao;

	if(empty($(linha+"[name=fp_dtcotacao]").val()) && !verifica_data){
		swal('Erro ao gravar','Digite uma data Valida','error');
		return;
	}
	//INICIA A VARIAVEL DE FUNCAO
	var funcao = "funcao=grava_pf&comando=" + (status == '+' ? 'insert' : 'update');

	funcao += 	"&pt_code="+$(linha+"[name=pt_code]").val() +
				"&fp_code="+$(linha+"[name=fp_code]").val() +
				"&fp_dtcotacao="+$(linha+"[name=fp_dtcotacao]").val()+
				"&fp_valcotacao="+$(linha+"[name=fp_valcotacao]").val().replace(",", ".") +
				"&fp_dtcompra="+$(linha+"[name=fp_dtcompra]").val() +
				"&fp_valcompra="+$(linha+"[name=fp_valcompra]").val().replace(",", ".") +
				"&fp_condicao="+$(linha+"[name=fp_condicao]").val() +
				"&fp_valcotdolar="+$(linha+"[name=fp_valcotdolar]").val().replace(",", ".");

	funcao += "&pt_code_original="+objTabelaProdFornec.registros[actpos].pt_code +
				"&fo_number="+objTabelaProdFornec.registros[actpos].fo_number +
				"&fp_code_original="+objTabelaProdFornec.registros[actpos].fp_code;

	swal.loading('Gravando dados...');
	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			$(DIV_TABELA_PRODFORNEC).html('');
			$(DIV_TABELA_PRODFORNEC).html(erro);
			swal('Erro ao gravar altera?s na tabela de Produto e Fornecedor',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao gravar tela de Produto x Fornecedor',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);
				}
			);
			return;
		}

		objTabelaProdFornec.registros[actpos].pt_code = $(linha+"[name=pt_code]").val();
		objTabelaProdFornec.registros[actpos].fo_number = objTabelaProdFornec.registros[actpos].fo_number;
		objTabelaProdFornec.registros[actpos].fp_code = $(linha+"[name=fp_code]").val();
		objTabelaProdFornec.registros[actpos].fp_dtcotacao = $(linha+"[name=fp_dtcotacao]").val();
		objTabelaProdFornec.registros[actpos].fp_valcotacao =$(linha+"[name=fp_valcotacao]").val().replace(".", ",");
		objTabelaProdFornec.registros[actpos].fp_dtcompra = $(linha+"[name=fp_dtcompra]").val();
		objTabelaProdFornec.registros[actpos].fp_valcompra = $(linha+"[name=fp_valcompra]").val().replace(".", ",");
		objTabelaProdFornec.registros[actpos].fp_condicao = $(linha+"[name=fp_condicao]").val();
		objTabelaProdFornec.registros[actpos].fp_valcotdolar = $(linha+"[name=fp_valcotdolar]").val().replace(".", ",");
		objTabelaProdFornec.registros[actpos].pt_descr = $("input[name=pt_descr]").val();

		if(status === '+'){
			setStatus(actpos,'a',DIV_TABELA_PRODFORNEC);
		}

		$('#record_pf').val(objTabelaProdFornec.total);
		cancela_pf(cell);
		swal.close();
	});

}



//########################################################
//ABRE OS LINKS DESEJADOS
//########################################################
function editar_detalhes(acao){


	var actpos = $("#position_fo").val();
	if(actpos === 'null'){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}

	var linha = DIV_DETALHES + "[posicao="+actpos+"] input";

	switch (acao) {
		case "cnpj":

			if($(DIV_DETALHES + " select[name=fo_pessoa]").val() == "I"){
				swal('OK!','CNPJ/CPF - OK','success');
				return;
			}

			var cnpj = $(linha+"[name=fo_cgc]").val();
			if(!validaCnpj(cnpj) && !valida_cpf(cnpj)){
				swal('ERRO!','CNPJ/CPF Inválido','error');
			} else {
				swal('OK!','CNPJ/CPF - OK','success');
			}
		return;

		case 'ie':
			var ie = $(linha+"[name=fo_iest]").val();
			var estado = $(linha+"[name=fo_uf]").val();

			if(empty(ie)){
				swal("ERRO!", "Inscrição Estadual Deve ser preenchida!", "error");
				return;
			}

			if(ie=="ISENTO"){
				swal("OK!", "Inscrição Estadual Válida!", "success");
				return;
			}
			if(empty(estado)){
				swal({
					title: "Estado Não Encontrado",
					type: "error",
					closeOnConfirm: false
				}, function(){
						swal.close();
						$(linha+"[name=fo_muncod]").focus();
						$(linha+"[name=fo_muncod]").select();
					});
				return;
			}

			if(CheckIE(ie, estado)){
				swal("OK!", "Inscrião Estadual Válida!", "success");
				return;
			} else {
				swal("ERRO!", "Inscrição Estadual não valida!", "error");
				return;
			}
 		return;

	}
}









//########################################################
//########################################################
			//FUNÇÕES DE CONSULTA
//########################################################
//########################################################




//########################################################
//REALIZA A BUSCA DE CPF PARA TRAZER A CIDADE ESTADO E PAIS
//########################################################
function buscaCepFornec(cep){
	var posicao = $(cep.parent().parent()).attr('posicao');
	var original = objTabela.registros[posicao].fo_cep;

	if($(cep).val() == original){
		return;
	}

	var linha = DIV_DETALHES + " input";
	var funcao = "funcao=buscaCep&cep="+$(cep).val();
	swal.loading("Buscando informações...");

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			swal('Erro',"Ocorreu um erro ao receber as informações. Tente novamente!",'error');
			return;
		}

		if(!empty(retorno.error)){
			$(DIV_DETALHES + " input[name=fo_cep]").focus();
			$(DIV_DETALHES + " input[name=fo_cep]").select();
			swal('Erro ao buscar cep',retorno.mensagem,'error');
			return;
		}

		var teste = $(linha + "[name=fo_ender]").val();

		$(linha + "[name=fo_ender]").val(retorno.fo_ender);
		$(linha + "[name=fo_bairro]").val(retorno.fo_bairro);
		$(linha + "[name=fo_cidade]").val(retorno.fo_cidade);
		$(linha + "[name=fo_uf]").val(retorno.fo_uf);
		$(linha + "[name=fo_muncod]").val(retorno.fo_muncod);
		$(linha + "[name=fo_pais]").val("Brasil");
		$(linha + "[name=fo_paiscod]").val("1058");
		swal.close();

		if(getStatus(posicao,DIV_TABELA) === ''){
			edicao_fo(cep);
		}
		$(DIV_DETALHES + " input[name=fo_ender]").focus();
		$(DIV_DETALHES + " input[name=fo_ender]").select();
	});
}


//########################################################
//ABRE O INCLUDE DE PAIS
//########################################################
function buscaPais(ref){
	var texto = $(DIV_DETALHES + " input[name=fo_paiscod]").val();
	var naopesquisa = false;
	if (texto.trim() === ''){
		naopesquisa = true;
	}

	if (texto == $(DIV_DETALHES + " input[name=fo_paiscod]").attr('fo_paiscod')){
        return;
    }

	swal.loading('Pesquisando País');
	fechaSwalCli();
    var ord = '1';
    cnsPais_abre(texto.trim(), 'box-inc-pais', ord, naopesquisa);
}

function fechaSwalCli(){
    if($('#box-inc-pais').hasClass('active') || $(DIV_DETALHES + " input[name=fo_paiscod]").attr('fo_paiscod') !== ''){
        swal.close();
    }else{
        setTimeout(function(){
            fechaSwalCli();
        },400);
    }
}

function cnsPais_retorno() {

     $(DIV_DETALHES + " input[name=fo_paiscod]").attr('en_paiscod', objpais.codigo);
	 var pais = objpais.pais;
	 $(DIV_DETALHES + " input[name=fo_paiscod]").val(objpais.codigo);
     $(DIV_DETALHES + " input[name=fo_pais]").val(pais.substring(0,12));
}


//########################################################


//########################################################
//ABRE O INCLUDE DE PAIS
//########################################################
function buscaMunicipio(ref){
	var texto = $(DIV_DETALHES + " input[name=fo_muncod]").val();
	var naopesquisa = false;
    if (texto.trim() === ''){
        naopesquisa = true;
    }

	if (texto == $(DIV_DETALHES + " input[name=fo_muncod]").attr('fo_muncod')){
        return;
    }

	swal.loading('Pesquisando Municipio');
    fechaSwalCli();
    var ord = '0';
    cnsMuni_abre(texto.trim(), 'box-inc-muni', ord, naopesquisa);
}

function fechaSwalCli(){
    if($('#box-inc-muni').hasClass('active') || $(DIV_DETALHES + " input[name=fo_muncod]").attr('fo_muncod') !== ''){
        swal.close();
    }else{
        setTimeout(function(){
            fechaSwalCli();
        },400);
    }
}

function cnsMuni_retorno() {

     $(DIV_DETALHES + " input[name=fo_muncod]").attr('fo_muncod', objmuni.codigo);

	 $(DIV_DETALHES + " input[name=fo_muncod]").val(objmuni.codigo);
	 $(DIV_DETALHES + " input[name=fo_cidade]").val(objmuni.municipio);
     $(DIV_DETALHES + " input[name=fo_uf]").val(objmuni.uf);
}
//########################################################



//########################################################
//ABRINDO CONSULTAS DE EMAIL
//########################################################
function buscaEmail(){
	var numero = $(DIV_TABELA + " .active input[name=fo_number]").val();
	var abreviacao = $(DIV_TABELA + " .active input[name=fo_abrev]").val();
	var tipo = "FO";

	cnsMail_abre('box-inc-mail', abreviacao, numero ,tipo);
}



//########################################################
//MOSTRA A SOMA DOS S?ITOS DO FORNECEDOR
//########################################################
function somaDebitosFornec(){
	var actpos = $('#position_fo').val();
	if(empty(actpos)){
		swal('Atenção','É necessário selecionar uma linha','warning');
		return;
	}

	var fo_number = objTabela.registros[actpos].fo_number;
	var funcao = "funcao=somaDebitosFornec&fo_number="+fo_number;

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao buscar a soma dos Debitos',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao somar os debitos do Fornecedor',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA,actpos,0);
				}
			);
			return;
		}

		swal({
			html: true,
			title: 'Soma dos Debitos',
			text: retorno,
			animation: "slide-from-top",
			type: 'info'
		});
	});
}





//--! ABRINDO CONSULTAS - PRODUTO --//
function buscaProduto(){
	var actpos = $("#position_pf").val();
	var pt_code = $(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input[name=pt_code]").val();

	if(empty(pt_code)){//VERIFICAR COM O P.A
		selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,3);
		return;
	}

	cnsPrd_abre(pt_code, 'box-inc-prod', 'cod', false);
}


function cnsPrd_retorno() {
	var actpos = $("#position_pf").val();

	$(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input[name=pt_code]").attr('tr_nome',objProduto.codigo);
	$(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] input[name=pt_code]").val(objProduto.codigo);

	$("#divProdFornec input[name=pt_descr]").val(objProduto.descricao);

	$(DIV_TABELA_PRODFORNEC + " tr[posicao="+actpos+"] td:not(.inativo) input").prop('readonly',false);

	selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,2);
}



//########################################################
//INSERE COMBO LINHA
//########################################################
function ComboLinha(elemento){
	var actpos = $("#position_fo").val();
	var linha = DIV_TABELA + " tr[posicao="+actpos+"] ";

	//VERIFICA SE A LINHA FOI ALTERADA E SE EU Nd ESTOU CLICANDO NA LINHA ATIVA
	//OU SE O INPUT ESTIVER COM READONLY
	if(  (!Verifica_Alteracao(DIV_TABELA) && !$(linha).hasClass('active'))){
		return;
	}
	var nome = $(elemento).attr('name') == "fo_grupo" ? "#cbGrupo" : "#cbAtivo";
	var ComboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name="+$(elemento).attr("name")+"]";
	var InputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name="+$(elemento).attr("name")+"]";



	if(empty($.trim($(ComboMor).html()))){
		if($(elemento).attr('name') == "fo_grupo"){
			$.each(objInfo.fo_grupo, function(key, grupo) {
				$(ComboMor).append($('<option>', {
					value: grupo,
					text: grupo
				}));
			});
		} else {
			var OptionsOriginais = $(nome).html();
			$(ComboMor).append(OptionsOriginais);
		}


	}

	//ESCONDE O COMBO
	if($(ComboMor).is(":visible")){

		$(InputMor).val($(ComboMor).val()).show();

		//ESCONDE COMBO
		$(ComboMor).hide();
	}
	//MOSTRA O COMBO
	else{
		//VALOR QUE ESTAVA NO INPUT É O VALOR QUE APARECER`NO COMBO
		$(ComboMor).val($(InputMor).val());

		//DEIXA COMBO FOCADO
		//MOSTRA COMBO
		$(ComboMor).show().focus();

		//ESCONDE INPUT
		$(InputMor).hide();
	}
}

function editar(acao){
	if(acao == 'g'){
		window.open(encodeURI("../utility/TabelaAuxiliar.Layout.php?status=FORGRUPO"));
		return;
	}

	if(acao == 'status'){
		window.open(encodeURI("../utility/TabelaAuxiliar.Layout.php?status=FORNEC"));
		return;
	}

	var actpos = $("#position_fo").val();
	if(actpos === 'null'){
		swal('Erro','É necessárioo selecionar uma linha','error');
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position_fo').val(),1);
		return;
	}

	var fornec = objTabela.registros[actpos].fo_number;
	switch (acao) {

		case 'a':
			var fo_abrev = objTabela.registros[actpos].fo_abrev;
			window.open("../utility/Agenda.Layout.php?nome="+fo_abrev+"&ord=1");
		return;


		case 'f':
			if(!Verifica_Alteracao(DIV_TABELA)){
				selecionaLinha(DIV_TABELA,$('#position_fo').val(),1);
				return;
			}

			swal({
				title: "Deseja Inlcuir o Fornecedor como Cliente?",
				type: "warning",
				showCancelButton: true,
				confirmButtonText: "Sim",
				cancelButtonText: "Não",
				closeOnConfirm: false,
				closeOnCancel: true,
				showLoaderOnConfirm: true,
				confirmButtonColor: "#DD6B55"
			}, function(confirmou){
				if(!confirmou){
					return;
				}

				var funcao = "funcao=insereCli&fo_number="+fornec;

				ajax(funcao, EXEC, function(retorno){
					retorno = json(retorno);
					if(!retorno){
						var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
						swal('Erro de cadastro',erro,'error');
						return;
					}

					if(!empty(retorno.error)){
						//ERRO
						swal({
								title:'Erro ao Cadastrar Fornecedor como Cliente',
								text: retorno.mensagem,
								type: 'error'
							},
							function(){
								selecionaLinha(DIV_TABELA,actpos,1);
							}
						);
						return;
					}

					swal("Cadastro Realizado com Sucesso", "Fornecedor Cadastrado como Cliente", "success");
				});

			});
		return;

	}
}

$(document).ready(function(){
	//########################################################
	//ABRE E FECHA A FILDSET DE PRODUTO_FORNEC
	//########################################################
	$("#legenda_pf").on('click', function(){
		if($("#position_fo").val() !== "null"){

			if($('#divProdFornec').is(':hidden')){
				$('#divProdFornec').show();
				$("#divProdFornec input[name=fo_desc]").val($(DIV_DETALHES+" input[name=fo_desc]").val());
				monta_ProdutoFornec();
			}
			else{
				$('#divProdFornec').hide();
			}
		} else {
			$("#search").focus();

		}
	});

	//########################################################
	//ABRE E FECHA A FILDSET DE PRODUTO_FORNEC
	//########################################################
	$("#legenda_obs").on('click', function(){
		if($("#position_fo").val() !== "null"){
			if($('#divObsFornec').is(':hidden')){
				$('#divObsFornec').show();
				$("#divObsFornec").attr('Fornec',$("#position_fo").val());
				monta_FornecObs();
			}
			else{
				$('#divObsFornec').hide();
			}
		} else {
			$("#search").focus();
		}

	});




	//########################################################
	//RETIRA O COMBOBOX DE GRUPO E ATIVO
	//########################################################
	$(DIV_TABELA).on("blur",'select[name=fo_grupo], select[name=fo_ativo]',function(){
		ComboLinha($(this));
	});

	//########################################################
	//PINTA A LINHA AO FOCAR
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());
		$(this).select();

		if($(this).attr("name") == "fo_grupo" || $(this).attr("name") == "fo_ativo" ){
			ComboLinha($(this));
		}
	});

	//########################################################
	//EDICAO AO UDAR UM DOS COMBOS
	//########################################################
	$(DIV_TABELA).on('change', 'input, select', function(){
		edicao_fo($(this));
	});

	//########################################################
	//PINTA A LINHA AO FOCAR
	//########################################################
	$(DIV_DETALHES).on("click", 'input[type=text]',function(){
		$(this).select();
	});




	$('#btnEmail').on("click", function(){
		if($("#position_fo").val() !== 'null'){
			buscaEmail(this);
		}
	});

	//########################################################
	//ABRE O INCLUDE DE PAIS
	//########################################################
	$(DIV_DETALHES).on("blur", 'input[name=fo_paiscod]', function(){
		if($("#position_fo").val() !== null){
			buscaPais(this);
		}
	});

	//########################################################
	//PINTA A LINHA AO FOCAR
	//########################################################
	$(DIV_TABELA_PRODFORNEC).on("focus", 'input',function(){
		pintaLinha_pf($(this).parent().parent());
		$(this).select();
	});


	//########################################################
	//PINTA A LINHA AO FOCAR
	//########################################################
	$(DIV_TABELA_OBS).on("focus", 'input',function(){
		pintaLinha_obs($(this).parent().parent());
		$(this).select();
	});

	//########################################################
	//KEYUP DOS INPUTS DA TABELA DIV_TABELA
	//########################################################
	$(DIV_TABELA).on("keyup", 'input',function(e){
		var actpos = $("#position_fo").val();
		var cell = $(this).parent().index();
		switch (e.which) {
			case 38: //PARA CIMA
				$(this).blur();
				if(actpos > 0 && Verifica_Alteracao(DIV_TABELA)){
					selecionaLinha(DIV_TABELA,--actpos,cell);
					return;
				}
				selecionaLinha(DIV_TABELA,actpos,cell);
			break;

			case 40://PARA BAIXO
				$(this).blur();
				if(Verifica_Alteracao(DIV_TABELA)){
					if (Number(actpos)+1 < $("#record_fo").val()){
						selecionaLinha(DIV_TABELA,++actpos,cell);
						return;
					}
					else{
						insere_fo();
						return;
					}
				}
				selecionaLinha(DIV_TABELA,actpos,cell);
			break;

			case 27://ESC
				$(this).blur();
				cancela_fo(cell);
			break;

			case 45://INSER
				if(Verifica_Alteracao(DIV_TABELA)){
					insere_fo();
				}
			break;

			case 13://ENTER
				$(this).blur();
				grava_fo(cell);
			break;
		}
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$(DIV_DETALHES).on("keyup", 'input[type=text]:not(.inativo), select',function(e){
		var extra = $(this).attr('name');
		switch (e.which) {
			case 27://ESC
				$(this).blur();
				cancela_fo(0,extra);
			break;

			case 13://ENTER
				$(this).blur();
				grava_fo(0,extra);
			break;

			case 45://INSER
				if(Verifica_Alteracao(DIV_TABELA)){
					insere_fo();
				}
			break;
		}
	});

	//########################################################
	//KEYUP DOS INPUTS DA TABELA DIV_TABELA_PRODFORNEC
	//########################################################
	$(DIV_TABELA_PRODFORNEC).on("keyup", 'input',function(e){
		var actpos = $("#position_pf").val();
		var cell = $(this).parent().index();
		var campo = $(this).attr('name');
		switch (e.which) {
			case 38: //PARA CIMA
				if(campo != "fp_dtcotacao"){
					$(this).blur();
					if(actpos > 0 && Verifica_Alteracao(DIV_TABELA_PRODFORNEC)){
						selecionaLinha(DIV_TABELA_PRODFORNEC,--actpos,cell);
						return;
					}
					selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);
				}
			break;

			case 40://PARA BAIXO
				if(campo != "fp_dtcotacao"){
					$(this).blur();
					if(Verifica_Alteracao(DIV_TABELA_PRODFORNEC)){
						if (Number(actpos)+1 < $("#record_pf").val()){
							selecionaLinha(DIV_TABELA_PRODFORNEC,++actpos,cell);
							return;
						}
						else{
							insere_pf();
							return;
						}
					}
					selecionaLinha(DIV_TABELA_PRODFORNEC,actpos,cell);
				}
			break;

			case 27://ESC
				$(this).blur();
				cancela_pf(cell);
			break;

			case 45://INSER
				if(Verifica_Alteracao(DIV_TABELA_PRODFORNEC)){
					insere_pf();
				}
			break;

			case 13://ENTER
				$(this).blur();
				//VERIFICAR COM O P.A
				if(!Verifica_Alteracao(DIV_TABELA_PRODFORNEC)){
					switch ($(this).attr("name")) {
						case "pt_code":
							buscaProduto();
						return;
					}
				}

				grava_pf(cell);
			break;

		}
	});

	//########################################################
	$(DIV_DETALHES).on('focus', 'input[name=fo_cgc]', function(){
		var fo_cgc = $(DIV_DETALHES + ' input[name=fo_cgc]');
		switch ($(DIV_DETALHES + " select[name=fo_pessoa]").val()) {
			case "F":
				fo_cgc.mask('999.999.999-99');
			break;
			case "J":
				fo_cgc.mask('99.999.999/9999-99');
			break;
			default:
				fo_cgc.unmask();
			break;
		}
	});

	//########################################################
	$(DIV_DETALHES).on('focus', 'input[name=fo_cep]', function(){
		var fo_cep = $(DIV_DETALHES + ' input[name=fo_cep]');
		fo_cep.mask('99999-999');
	});


	//########################################################
	//KEYUP DOS INPUTS DA TABELA DIV_TABELA_OBS
	//########################################################
	$(DIV_TABELA_OBS).on("keyup", 'input',function(e){
		var actpos = $("#position_obs").val();
		var cell = $(this).parent().index();
		switch (e.which) {
			case 38: //PARA CIMA
				$(this).blur();
				if(actpos > 0 && Verifica_Alteracao(DIV_TABELA_OBS)){
					selecionaLinha(DIV_TABELA_OBS,--actpos,cell);
					return;
				}
				selecionaLinha(DIV_TABELA_OBS,actpos,cell);
			break;

			case 40://PARA BAIXO
				$(this).blur();
				if(Verifica_Alteracao(DIV_TABELA_OBS)){
					if (Number(actpos)+1 < $("#record_obs").val()){
						selecionaLinha(DIV_TABELA_OBS,++actpos,cell);
						return;
					}
					else{
						insere_obs();
						return;
					}
				}
				selecionaLinha(DIV_TABELA_OBS,actpos,cell);
			break;

			case 27://ESC
				$(this).blur();
				cancela_obs(cell);
			break;

			case 45://INSER
				if(Verifica_Alteracao(DIV_TABELA_OBS)){
					insere_obs();
				}
			break;

			case 13://ENTER
				$(this).blur();
				grava_obs(cell);
			break;
		}
	});

	//########################################################
	//QUANDO TIVER A CLASSE NUMBER IR`VERIFICAR AS TECLAS DIGITADAS
	//########################################################
	$(DIV_TABELA_PRODFORNEC).on('keypress', 'td.number input', function(event){
		return somenteNumero(event,true,false, this);
	});

	//########################################################
	//QUANDO TIVER A CLASSE NUMBER IR`VERIFICAR AS TECLAS DIGITADAS
	//########################################################
	$(DIV_TABELA_OBS).on('keypress', 'td.number input', function(event){
		return somenteNumero(event,false,false, this);
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search_pf,#fo_desc').keypress(function(e){
		if(e.which == 13)
			monta_ProdutoFornec();
	});

	//########################################################
	//CADASTRA COMO FORNECEDOR
	//########################################################
	$('#btnForCli').on("click",function(e){
		editar('f');
	});

	//########################################################
	//EXIBE SWAL PARA O RECIBO
	//########################################################
	$('.boleto').on("click",function(e){
		abre_recibo();
	});

	//########################################################
	//ABRE TELA DE AGENDA
	//########################################################
	$('.agenda').on("click",function(e){
		editar('a');
	});

	//########################################################
	//ABRE TELA DE AGENDA
	//########################################################
	$('#btnStatus').on("click",function(e){
		editar('status');
	});

	//########################################################
	//ABRE TELA DE AGENDA
	//########################################################
	$('#btnGrupo').on("click",function(e){
		editar('g');
	});





	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#fo_desc').change(function(){
		notnull(this);
	});

	//########################################################
	//SELECIONA TEXTO AO DAR FOCO
	//########################################################
	$('#search_pf, #fo_desc').on("focus", function(){
		$(this).select();
	});

	//########################################################
	//REALIZA PESQUISA AO TROCAR O COMBO DE PESQUISA
	//########################################################
	$('#cbOrdemPf').change(function(e){
		$("#search_pf").val("");
		monta_ProdutoFornec();
	});


	//########################################################
	//EDICAO DOS DADOS DO PRODUTO X FORNECEDOR
	//########################################################
	$(DIV_TABELA_PRODFORNEC).on('change', 'input', function(){
		if($(this).parent().hasClass("number")){
			notnull(this);
		}

		edicao_pf($(this));

		if($(this).attr('name') == 'pt_code'){
			buscaProduto(this);
		}
	});









	//########################################################
	//EDICAO DOS DADOS DO PRODUTO X FORNECEDOR
	//########################################################
	$(DIV_DETALHES).on('change', 'input[type=text]:not(.inativo), select', function(){
		if($(this).attr('name') == 'fo_cep'){
			buscaCepFornec($(this));
		} else {
			if($(this).hasClass('number')){
				notnull(this);
			}
			edicao_fo($(this));
		}
	});

	//########################################################
	//ATUALIZA VALOR DO CHECKED AO SER CLICADO
	//FAZ A VERIFICA?O PARA SABER SE OS CHECKBOX ESTd MARCADOS OU Nd
	//########################################################
	$(DIV_DETALHES + " .ui.checkbox").checkbox({
		onChange: function() {
			var value = "",
				$checkbox = $(this).parent();
			switch ($(this).attr('name')) {
				case 'fo_consumo':
					value = $checkbox.checkbox('is checked') ? "1" : "0";
				break;
				default:
					value = $checkbox.checkbox('is checked') ? "T" : "F";
				break;
			}

			$(this).val(value);
			edicao_fo($(this));
    	}
    });


	//########################################################
	//ABRE O INCLUDE DE MUNICIPIO
	//########################################################
	$(DIV_DETALHES).on("blur", 'input[name=fo_muncod]', function(){
		if($("#position_fo").val() !== null){
			buscaMunicipio(this);
		}
	});

	//########################################################
	//EDICAO DOS DADOS DO PRODUTO X FORNECEDOR
	//########################################################
	$(DIV_TABELA_OBS).on('change', 'input', function(){
		edicao_obs($(this));
	});


	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search').keypress(function(e){
		if(e.which == 13)
			monta_query_fornec();
	});


	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
        if($(".ui.dimmer.consultas").dimmer('is active').every(elem => elem == false)){
            $('#search').focus();
        }
	});


	//########################################################
	//RESETA PARAMETROS AO TROCAR A ORDEM DO COMBO
	//########################################################
	$('#cbOrdem_novo').on("change",function(){
		$('#search').attr('onkeypress','');
		if($('#cbOrdem_novo option:selected').hasClass('number')){
			$('#search').attr('onkeypress','return somenteNumero(event,false,false,this); ');
		}
		$('#search').val('');
		$('#search').select();
	});



	//########################################################
	//DEIXA O USUARIO ARRASTAR A DIV
	//########################################################
	$( "#box-inc-prod").draggable({ cursor: "move", handle: ".box-consulta-titulo" });

	$("#popmun , #poppais").draggable({ cursor: "move" });

});
