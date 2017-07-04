//########################################################
//########################################################
			//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################


//########################################################
//VERSÃO DA TELA
//########################################################
var RELEASE  = '0.004';


//########################################################
//LIMITE DE REGISTROS
//########################################################
var LIMITE_REGISTROS = 80;


//########################################################
//OBJETOS
//########################################################
var objTabelaCli = {};
var objTabelaObs = {};
var objTabelaEnd = {};
var objRepresentante = {};
var objTabelaRobo = {};
var objinfo = {};
var objEmailsQueDeramErrado = [];


//########################################################
//LOCAL DO EXEC
//########################################################
var EXEC = "../basico/Cliente.Exec.php";


//########################################################
//TABELAS USADAS
//########################################################
var DIV_TABELA = "#dadoscli";
var DIV_TABELA_OBS = "#obscli";
var DIV_TABELA_DETALHES = "#divDetalhes";
var DIV_TABELA_ENDERECO = "#consultaEnde";
var DIV_TABELA_ROBO = "#RoboCli";
var objFEmail = {};



//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################






























//########################################################
//########################################################
				//FUNÇÕES DE CLIENTE
//########################################################
//########################################################



function liberaAcesso(){
	if(!validaVersao(9.93,true)){
		$("#etiqueta_cliente").attr("disabled", 'disabled');
	}

	if (!TestaAcesso('BAS.CLIENTE')) { //usuario sem acesso fecha janela
		swal({
				title: "Atenção",
				text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
					  "Nome do acesso necessário: BAS.CLIENTE",
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

	if (!TestaAcesso('BAS.CLIENTE', 3)) {
		$(".deleta").attr("disabled", 'disabled');
	}
	if (!TestaAcesso('BAS.CLIENTE', 2)) {
		$(".insere").attr("disabled", 'disabled');
		$(".grava").attr("disabled", 'disabled');
		$(".cancela").attr("disabled", 'disabled');
	}
	if(!TestaAcesso('BAS.CLI.ROBOT')){
		$("#pagto").attr("disabled", 'disabled');
	}

	if(!TestaAcesso('BAS.CLI.ABC')){
		$("#btnCurva").attr("disabled", 'disabled');
	}

	if(!TestaAcesso('BAS.CLI.HISTO')){
		$("#cifra").attr("disabled", 'disabled');
	}

	if(!TestaAcesso('BAS.CLI.CALCLIM')){
		$("#btnCredito").attr("disabled", 'disabled');
	}

	if(!TestaAcesso('BAS.CLI.ZERALIM')){
		$("#btnZCredito").attr("disabled", 'disabled');
	}

	if(!TestaAcesso('BAS.CLI.FATOR')){
		$("#btnFator").attr("disabled", "disabled");
	}

	if(!TestaAcesso('BAS.CLI.LIMITE')){
		$(DIV_TABELA_DETALHES+" input[name=cl_limite]").addClass('inativo').attr("readonly", true);
	}

	if(!TestaAcesso('BAS.CLI.MARGEM')){
		$(DIV_TABELA_DETALHES+" select[name=cl_margem]").addClass('inativo').attr('disabled', 'disabled');
	}

	if(validaVersao(10.04,true)){
		if(!TestaAcesso('BAS.CLI.ALTDESC')){
			$(DIV_TABELA_DETALHES+" input[name=cl_desconto]").addClass('inativo').attr("disabled", 'disabled');
			$(DIV_TABELA_DETALHES+" input[name=cl_desc2]").addClass('inativo').attr("disabled", 'disabled');
			$(DIV_TABELA_DETALHES+" input[name=cl_fator]").addClass('inativo').attr("disabled", 'disabled');
		}
	}

	getCombos();
}

//########################################################
//MONTA OS COMBOS DA PAGINA
//########################################################
function getCombos(){
	var funcao = 'funcao=loadCombo';
	ajax(funcao,EXEC,function(retorno){

		if(!empty(retorno.error)){
			loading.close();
			swal('Erro ao buscar combos',retorno.mensagem,'error');
			return;
		}
		if(retorno.liberaRobo != 'C'){
			$(".robo_fideliz").attr("disabled", 'disabled');
			$(".robo_fideliz").attr("readonly", true);
			$(".robo_fideliz").addClass("inativo");
		}
		//GRUPOS
		$.each(retorno.cl_grupo, function (key, grupo){
		    $('#cbGrupo').append($('<option>', {value: grupo, text : grupo }));
		});


		//UF
		$.each(retorno.cl_uf, function (key, uf){
		    $('#cbUF').append($('<option>', {value: uf, text : uf }));
		});

		//REPRESENTANTE
		$.each(retorno.representante, function (key, representante){
		    $('#cbRep').append($('<option>', {value: representante.vd_number, text : representante.vd_nome }));
			$('#vd_number').append($('<option>', {value: representante.vd_number, text : representante.vd_nome }));
		});

		//cl_pagto
		$.each(retorno.pagamento, function (key, pagto){
			$("#cl_pagto option[value='#']").remove();
		    $('#cl_pagto').append($('<option>', {value: pagto.cl_statnum ,text : pagto.cl_statvenc }));
		});

		//cl_grupofin
		$.each(retorno.grupofin, function (key, grupo){
		    $('#cbGfin').append($('<option>', {value: grupo.af_codigo ,text : grupo.af_descr }));
		});

		//########################################################
		//MUDA MARGEM PADRÃO NO COMBO
		//########################################################
		$(DIV_TABELA_DETALHES + " select[name=cl_margem]").val(retorno.margem_padrao);

		var senhaPadrao = "12345";
		if(validaVersao(9.95,true)){
			senhaPadrao = retorno.auxCliente_senha;
		}
		else{
			retorno.auxCliente_senha = senhaPadrao;
		}
		$("#btnSenha").attr("data-content", $("#btnSenha").attr("data-content") + senhaPadrao );

		//objinfo.liberaRobo objinfo.cl_grupo,
		//objinfo.cl_uf objinfo.representante objinfo.pagamento,
		//objinfo.grupofin objinfo.fo_cnpj, objinfo.margem_padrao
		//objinfo.auxCliente_senha
		objinfo = retorno;

		$('.ui.dropdown').dropdown();
		//########################################################
		//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
		//########################################################
		$('#det_cliente .dropdown').dropdown({
			onChange: function(value,text,itemlista) {
				if($(itemlista).parent().siblings("select").attr("id") == "cbOrdem"){
					$('#search').val('');
				}
				$('#search').select();
			}
		});

		loading.close();
		bloqueia_detalhes(true);
		$('#search').select();
	});
}

//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function monta_query(){

	LimpaTabela(DIV_TABELA);
	$(DIV_TABELA).html("<img src='../component/loading.gif' />");

	//MONTA A FUNCAO
	var funcao = "funcao=monta&ordem=" + $("#cbOrdem").val() +
				 "&busca=" + encode_uri($("#search").val()) +
				 "&cbStatus=" + $("#cbStatus").val() +
				 "&cbGrupo=" + $("#cbGrupo").val() +
				 "&cbUF=" + $("#cbUF").val() +
				 "&rep=" + $("#cbRep").val() +
				 "&dias=" + $("#compra").val() +
				 "&cbGfin=" + $("#cbGfin").val()+
				 "&cbMargem="+ $("#cbMargem").val()+
				 "&ckcompra=" + ($('#ckFiltroCompra').is(':checked') ? 'true' : 'false');

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Clientes',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de clientes',retorno.mensagem,'error');
			return;
		}

		$('#record').val(retorno.total);
		objTabelaCli = retorno;

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
	});
}


//########################################################
//MONTA OS INDICES DE PAGINA EM BAIXO DA TABELA
//########################################################
function montaPaginas(paginaAtual){
	//MONTA AS PAGINAS
	var total = Math.ceil(objTabelaCli.total / LIMITE_REGISTROS);

	$('#pagination').html("");
	if(total == 1){
	   return;
	}

	var links = 4;
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < total ? ((paginaAtual + links)+1)  : total);

	if(paginaAtual >= (links + 2)){
	   $('#pagination').append("<span onclick='pagination(" + 1 + ");' class='cor_padraoInvert_hover'>" + 1 + "</span>");
	   $('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
	   if(i == paginaAtual){
		   $('#pagination').append("<span class='active cor_padrao'>" + i + "</span>");
	   }else{
		   $('#pagination').append("<span onclick='pagination(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
	   }
	}

	if(paginaAtual <= (total - (links + 2))){
	   $('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	   $('#pagination').append("<span onclick='pagination(" + total + ");' class='cor_padraoInvert_hover'>" + total + "</span>");
	}

}


//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(pagina, fCustom){
  var totalDePaginas = Math.ceil(objTabelaCli.total / LIMITE_REGISTROS);

  if(pagina > totalDePaginas){
		pagina = totalDePaginas;
	}

	var fim = pagina * LIMITE_REGISTROS;
	if(fim > objTabelaCli.total)
		fim = objTabelaCli.total;
	var inicio = ((pagina - 1) * LIMITE_REGISTROS);
	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL


	// LIMPA CAMPOS DOS ITENS E DE TRANSPORTADORA
	LimpaTabela(DIV_TABELA_OBS);
	$("#divObs").attr('Cliente','');
	$("#divEnd").attr('Cliente','');
	$(DIV_TABELA_DETALHES + " input[type=text]").val('');
	$(DIV_TABELA_DETALHES).attr('Cliente','');
	$(DIV_TABELA_ENDERECO + " input[type=text]").val('');
	$(DIV_TABELA_ENDERECO).attr('Cliente','');


	montaPaginas(pagina,totalDePaginas);

	//RESETA A POSICAO
	$('#position').val("null");

	//RESETA TOTAL
	$('#record').val(objTabelaCli.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabelaCli.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">" + monta_linha(i) + "</tr>";
			$(DIV_TABELA).append(tabela);
		}

		//VERIFICA SE A TABELA E OS INPUTS EXTRAS FICARÃO BLOQUEADOS
		if (!TestaAcesso('BAS.CLIENTE', 2)) {
			$(DIV_TABELA + " td").addClass("inativo");
			$(DIV_TABELA + " td input").prop("readonly",true);
		}
	}
	else{
		bloqueia_detalhes(true);
	}


	//SELECIONA A PRIMEIRA LINHA
	$('#search').focus();
	if(objTabelaCli.total > 0 && empty(fCustom)){
		pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
		$(DIV_TABELA).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
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
	var aux = objTabelaCli.registros[i];

	//VERIFICA SE EXISTIRA A MARGEM
	var cl_grupofin_inativo = ""; var cl_grupofin_readonly = "";
	if(!TestaAcesso('BAS.CLI.GFIN')){
		cl_grupofin_inativo = "inativo"; cl_grupofin_readonly = "readonly";
	}

	//MONTA A LINHA
	var table =	"" +
		"<td class='w20 inativo center'><input value='' readonly  tabindex='-1'/></td>"+
		"<td class='w70 number inativo'><input value='"+aux.cl_number+"' name='cl_number' readonly /></td>"+
		"<td class='w160'><input value='"+aux.cl_abrev+"' name='cl_abrev' class='uppercase' maxlength='20'/></td>"+
		"<td class='w100'><input value='"+aux.cl_contato+"' name='cl_contato' class='uppercase' maxlength='12' /></td>"+
		"<td class='w100'><input value='"+aux.cl_fone+"' name='cl_fone' class='uppercase' maxlength='20'/></td>"+
		"<td class='w100'><input value='"+aux.cl_fax+"' name='cl_fax' class='uppercase' maxlength='20'/></td>"+
		"<td class='w80 center' modelo='"+aux.cl_grupo+"' >"+
			"<input value='"+aux.cl_grupo+"' name='cl_grupo' class='uppercase'/>"+
			"<select name='cl_grupo'></select>"+
		"</td>"+
		"<td class='w80 center "+cl_grupofin_inativo+"'>"+
			"<input value='"+aux.cl_grupofin+"' name='cl_grupofin' class='uppercase' "+cl_grupofin_readonly+"/>"+
			"<select name='cl_grupofin' "+cl_grupofin_readonly+"></select>"+
		"</td>"+
		"<td class='w60 center'>"+
			"<input value='"+aux.cl_ativo+"' name='cl_ativo' class='uppercase'/>"+
			"<select name='cl_ativo'></select>"+
		"</td>";

	return table;
}


//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position').val(actpos);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');



	//EVITA COM QUE MONTE ITENS + DE 1 VEZ
	if($("#divDetalhes").attr('Cliente') != actpos && $('#divDetalhes').is( ":visible" )){
		$("#divDetalhes").attr('Cliente',actpos).attr('posicao',actpos);
		$("#divDetalhes input[name=tr_nome]").attr('tr_number', objTabelaCli.registros[actpos].tr_number);
		$("#divDetalhes input[name=vd_nome]").attr('vd_number', objTabelaCli.registros[actpos].vd_number);
		$(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_nome', objTabelaCli.registros[actpos].vd_nome);
		$(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_nome',  objTabelaCli.registros[actpos].tr_nome);
		monta_detalhes(actpos);
		return;
	}

	//EVITA COM QUE MONTE ITENS + DE 1 VEZ
	if($("#divObs").attr('Cliente') != actpos && $('#divObs').is( ":visible")){
		$("#divObs").attr('Cliente',actpos);
		monta_obs(actpos);
		return;
	}

	//EVITA COM QUE MONTE ITENS + DE 1 VEZ
	if($("#divEnd").attr('Cliente') != actpos && $('#divEnd').is( ":visible" )){
		$("#divEnd").attr('Cliente',actpos);
		monta_end(actpos);
		return;
	}
	// return;

}


//########################################################
//MONTA OS INPUTS DA DIV DETALHES
//########################################################
function monta_detalhes(actpos){

	$(DIV_TABELA_DETALHES + " input[type=text]").val("");
	$(DIV_TABELA_DETALHES + " input[name=cl_consumo]").val('0');
	$(DIV_TABELA_DETALHES + " input[name=cl_calc_icms]").val('F');
	$(DIV_TABELA_DETALHES + " input[name=cl_ipinoicms]").val('F');
	if(empty(actpos)){
		return;
	}

	jQuery.each(objTabelaCli.registros[actpos], function(key,value){
		var campo = key;
		$(DIV_TABELA_DETALHES + " input[name="+campo+"]").val(value);

		var linha = "";
		if(campo == "cl_ipinoicms" || campo == "cl_calc_icms" || campo == "cl_consumo"){
			linha = DIV_TABELA_DETALHES + " input[type='checkbox'][name="+campo+"]";
			var valida = (value === '1' || value === 'T' ? true : false);

			if(valida){
				$(linha).val(value).parent().checkbox('check');
			}else{
				$(linha).val(value).parent().checkbox('uncheck');
			}
		}

		if(campo == "cl_pagto" || campo == "cl_margem" || campo == "cl_pessoa" || campo == "cl_frete"){
			linha = DIV_TABELA_DETALHES + " select[name="+campo+"]";
			if(!empty(value)){
				$(linha).parent().dropdown("set selected",value);
			}
		}
	});

	bloqueia_detalhes(false);

	//EVITA COM QUE MONTE ITENS + DE 1 VEZ
	if($("#divObs").attr('Cliente') != actpos && $('#divObs').is( ":visible" )){
		$("#divObs").attr('Cliente',actpos);
		monta_obs(actpos);
		return;
	}

	//EVITA COM QUE MONTE ITENS + DE 1 VEZ
	var actdiv = $("#divEnd").attr('Cliente');
	if($("#divEnd").attr('Cliente') != actpos && $('#divEnd').is( ":visible" )){
		$("#divEnd").attr('Cliente',actpos);
		monta_end(actpos);
		return;
	}

}


//########################################################
//BLOQUEIA DIV DE DETALHES
//########################################################
function bloqueia_detalhes(bloqueia) {
	if (!TestaAcesso('BAS.CLIENTE', 2)) {
		bloqueia = true;
		$("#pagto,#btnCurva").prop("disabled", bloqueia);
	}

	var os_elementos = $(DIV_TABELA_DETALHES + " input[type=text]:not(.inativo), " +
					  DIV_TABELA_DETALHES + " input[type=date], " +
					  DIV_TABELA_DETALHES + " input[type=checkbox], " +
					  "#btnCNPJ, #btnIE, #btnEmai,  #representante, "+
					  "#btnFideliz, #transportadora, .credito, #btnNatops, "+
					  DIV_TABELA_DETALHES+" .ui.dropdown:not(.inativo) input"
				  	);
	var os_selects = $(DIV_TABELA_DETALHES + " .ui.dropdown:not(.inativo)");

	os_elementos.prop("disabled", bloqueia);
	os_selects.removeClass("disabled");

	if(bloqueia){
		os_selects.addClass("disabled");
	}
}


//########################################################
//BLOQUEIA AS LINHAS E ADICIONA O 'a' NO CMAPO A CADA MUDANÇA NOS TR OU NOS CAMPOS
//########################################################
function edicao(elemento){
	var actpos = $(elemento).closest("*[posicao]").attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaCli.registros[actpos][campo];

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actpos,DIV_TABELA) !== ''){
		return;
	}

	setStatus(actpos,'a',DIV_TABELA);

	Bloqueia_Linhas(actpos,DIV_TABELA);
}


//########################################################
//INSERE UMA NOVA LINHA COM NOVOS CAMPOS PARA O CADASTRO DE UM NOVO CLIENTE
//########################################################
function insere(){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),1);
		return;
	}

	if(empty(objTabelaCli)){
		objTabelaCli = {};
		objTabelaCli.registros = [];
		objTabelaCli.total = 0;
	}


	var novaPosicao = {};
	novaPosicao.cl_number = "";
	novaPosicao.cl_abrev = "";
	novaPosicao.cl_razao = "";
	novaPosicao.cl_fone = "";
	novaPosicao.cl_cgc = "";
	novaPosicao.cl_iest = "";
	novaPosicao.cl_grupo = "C";
	novaPosicao.cl_fax = "";
	novaPosicao.cl_contato = "";
	novaPosicao.cl_pessoa = "J";
	novaPosicao.tr_number = "";
	novaPosicao.vd_number = "";
	novaPosicao.cl_ativo = "A";
	novaPosicao.cl_limite = "0";
	novaPosicao.cl_desconto = "0,0000";
	novaPosicao.cl_data = getDataHoje();
	novaPosicao.cl_margem = objinfo.margem_padrao;
	novaPosicao.cl_pagto = "A";
	novaPosicao.cl_restricao = "";
	novaPosicao.cl_cacex = "";
	novaPosicao.cl_aniversario = "";
	novaPosicao.cl_fideliz = "";
	novaPosicao.cl_fator = "1,0000";
	novaPosicao.cl_ipinoicms = "F";
	novaPosicao.cl_mva = "0,00";
	novaPosicao.cl_prazo = "";
	novaPosicao.cl_senha = "";
	novaPosicao.cl_usuario = "";
	novaPosicao.cl_curva = "";
	novaPosicao.cl_frete = '0';
	//SERIAL FAZIS/CONTY/KISLY = YBY2HND8F
	novaPosicao.cl_grupofin = ($("#serial").val() == 'YBY2HND8F') ? "ORCAM" : "C";
	novaPosicao.cl_consumo = "0";
	novaPosicao.cl_calc_icms = "F";
	novaPosicao.cl_desc2 = "0,0000";


	objTabelaCli.registros.push(novaPosicao);
	objTabelaCli.total += 1;

	var actpos = objTabelaCli.total > 0 ? (objTabelaCli.total - 1) : 0;

	pagination((Math.ceil(objTabelaCli.total / LIMITE_REGISTROS)),function(){
		pintaLinha($(DIV_TABELA + " tr[posicao="+actpos+"]"));
		setStatus(actpos,'+',DIV_TABELA);
		Bloqueia_Linhas(actpos,DIV_TABELA);
		$('#record').val(objTabelaCli.total);
		selecionaLinha(DIV_TABELA,actpos,2);
	});
}


//########################################################
//DELETA O CLIENTE SELECIONADO, SOMENTE SE NÃO TIVER NENHUM ENDEREÇO NEM OBSERVAÇÃO
//########################################################
function exclui(reftab){

	var actpos = $('#position').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	if(getStatus(actpos,DIV_TABELA) !== ''){
		cancela(1);
		return;
	}

	var cl_number = objTabelaCli.registros[actpos].cl_number;

	swal({
			title: "Deseja excluir o Cliente selecionado?",
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

			var funcao = "funcao=deleta&cl_number=" + cl_number;

			ajax(funcao, EXEC, function(retorno){
				retorno = json(retorno);
				if(!retorno){
					var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
					swal('Erro de exclusão',erro,'error');
					return;
				}
				if(!empty(retorno.error)){
					//ERRO
					swal({
							title:'Erro ao excluir Cliente',
							text: retorno.mensagem,
							type: 'error'
						},
						function(){
							selecionaLinha(DIV_TABELA,actpos,1);
						}
					);
					return;
				}

				objTabelaCli.registros.splice(actpos,1);
				objTabelaCli.total -= 1;
				swal.close();

				var paginaAtual = getPagina('#record',"#pagination", LIMITE_REGISTROS);

				// pagination((Math.ceil(objTabelaCli.total / LIMITE_REGISTROS)),function()
				pagination(paginaAtual, function(){
					$('#record').val(objTabelaCli.total);
					if(objTabelaCli.total > 0){
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
//GRAVA NO BANCO DE DADOS UM NOVO CLIENTE OU ALTERAÇÕES FEITAS EM UM EXISTENTE
//########################################################
function grava(cell, extra, fCustom){
	var actpos = $('#position').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}

	if(empty($(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_number'))){
		swal({
			title: "Atenção",
			text: "Não foi informado uma Transportadora",
			type: "warning"
		}, function(){
			$(DIV_TABELA_DETALHES + " input[name=tr_nome]").focus().select();
		});

		return;
	}

	if(empty($(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_number'))){
		swal({
				title: "Atenção",
				text: "Não foi informado um representante",
				type: "warning"
		} , function(){
			$(DIV_TABELA_DETALHES + " input[name=vd_nome]").focus().select();
		});

		return;
	}

	if(empty($(DIV_TABELA_DETALHES + " input[name=cl_razao]").val())){
		swal({
				title: "Atenção",
				text: "Campo Razão Social do Cliente esta em Branco",
				type: "warning"
			}, function(){
				$(DIV_TABELA_DETALHES + " input[name=cl_razao]").focus().select();
			}
		);

		return;
	}

	if(empty($(DIV_TABELA + " tr[posicao="+actpos+"] input[name=cl_abrev]").val())){
		swal({
				title: "Atenção",
				text: "Campo Abrevação do Cliente esta em Branco",
				type: "warning"
			}, function(){
				$(DIV_TABELA + " tr[posicao="+actpos+"] input[name=cl_abrev]").focus().select();
			}
		);

		return;
	}

	var fator =  $(DIV_TABELA_DETALHES + " input[name=cl_fator]").val();


	if(tonumber(fator).replace(",",".") <= 0){
		swal({
				title: "Erro",
				text: "O Fator deve ser definido com valor > 0",
				type: "warning"
			}, function(){
				$(DIV_TABELA_DETALHES + " input[name=cl_fator]").focus().select();
			}
		);
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

	if(Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,actpos,cell);

		if(!empty(extra)){
			setTimeout(function () {
				$(DIV_TABELA_DETALHES + " input[name="+extra+"]").select();
			}, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
		}

		return;
	}




	tr_nome = $(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_nome');
	vd_nome = $(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_nome');

	//PEGA EM FORMA DE array() OS INPUTS QUE ESTAO DENTRO DA MINHA LINHA SELECIONADA
	var linha = DIV_TABELA + " tr[posicao="+actpos+"] input";

	//INICIA A VARIAVEL DE FUNCAO
	var comando = getStatus(actpos,DIV_TABELA) == '+' ? 'insert' : 'update';

	var funcao = "funcao=grava&comando=" + comando;

	//CONCATENAR A FUNCAO OS VALORES DA TABELA PRINCIPAL
	funcao += "&cl_number="+objTabelaCli.registros[actpos].cl_number+
				//ELE FOI TRANSFORMADO EM BASE64 ANTES DE SER ENVIADO PARA O PHP
				"&cl_abrev="+ encode_uri($(linha +"[name=cl_abrev]").val())+
				"&cl_fone="+$(linha +"[name=cl_fone]").val()+
				"&cl_grupo="+$(linha +"[name=cl_grupo]").val()+
				"&cl_fax="+$(linha +"[name=cl_fax]").val()+
				"&cl_contato="+$(linha +"[name=cl_contato]").val()+
				"&cl_ativo="+$(linha +"[name=cl_ativo]").val()+
				"&cl_grupofin="+$(linha +"[name=cl_grupofin]").val();


	//CONCATENAR A FUNCAO OS VALORES DA TABELA DETALHES INPUTS
	//ELE FOI TRANSFORMADO EM BASE64 ANTES DE SER ENVIADO PARA O PHP
	funcao += "&cl_razao="+encode_uri($(DIV_TABELA_DETALHES + " input[name=cl_razao]").val())+
				"&cl_iest="+$(DIV_TABELA_DETALHES + " input[name=cl_iest]").val()+
				"&cl_cacex="+$(DIV_TABELA_DETALHES + " input[name=cl_cacex]").val()+
				"&cl_limite="+$(DIV_TABELA_DETALHES + " input[name=cl_limite]").val()+
				"&cl_desconto="+$(DIV_TABELA_DETALHES + " input[name=cl_desconto]").val()+
				"&cl_data="+$(DIV_TABELA_DETALHES + " input[name=cl_data]").val()+
				"&cl_restricao="+$(DIV_TABELA_DETALHES + " input[name=cl_restricao]").val()+
				"&cl_aniversario="+$(DIV_TABELA_DETALHES + " input[name=cl_aniversario]").val()+
				"&cl_fideliz="+$(DIV_TABELA_DETALHES + " input[name=cl_fideliz]").val()+
				"&cl_fator="+$(DIV_TABELA_DETALHES + " input[name=cl_fator]").val()+
				"&cl_mva="+$(DIV_TABELA_DETALHES + " input[name=cl_mva]").val()+
				"&cl_prazo="+$(DIV_TABELA_DETALHES + " input[name=cl_prazo]").val()+
				"&cl_usuario="+$(DIV_TABELA_DETALHES + " input[name=cl_usuario]").val()+
				"&cl_curva="+$(DIV_TABELA_DETALHES + " input[name=cl_curva]").val()+
				"&cl_desc2="+$(DIV_TABELA_DETALHES + " input[name=cl_desc2]").val();

		//CONCATENAR O CAMPO DE NATOPS SE PASSAR NA VERSÃO 10.05
		//REALIZAR A VERIFICAÇÃO DE CARACTERES PARA SABER SE ESTÃO NO FORMATO CORRETO
		//CONTINGENCIA
		if(validaVersao("10.05",true)){
				var cfop = $(DIV_TABELA_DETALHES + " input[name=cl_natureza]").val();

				var expressao = new RegExp(/^[0-9]{1}\.[0-9]{3}$/); //EXPRESSÃO 9.999
				var compara = expressao.test(cfop); //REALIZA O TESTE

				if(compara === false && !empty(cfop)){ // VERIFICA SE O VALOR NO CAMPO NÃO SE ADEQUAR AOS VALORES PADRÕES DE CFOP
					swal({
						title: "Erro ao Cadastrar Cliente",
						text: "A CFOP não Possuí o padrão correto",
						type: "warning"
					}, function(){
						$(DIV_TABELA_DETALHES + " input[name=cl_natureza]").focus().select(); //FOCA NO CAMPO
					});
				}
			funcao += "&cl_natureza="+$(DIV_TABELA_DETALHES + " input[name=cl_natureza]").val();//CONCATENA NA FUNCAO
		}

	//CONCATENAR A FUNCAO OS VALORES DA TABELA DETALHES attr
	funcao += "&tr_number="+$(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_number')+
				"&vd_number="+$(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_number');

	//CONCATENAR A FUNCAO OS VALORES DA TABELA DETALHES select
	var cl_pessoa = $(DIV_TABELA_DETALHES + " select[name=cl_pessoa] option:selected").val();
	funcao += "&cl_pessoa="+cl_pessoa+
				"&cl_margem="+$(DIV_TABELA_DETALHES + " select[name=cl_margem] option:selected").val()+
				"&cl_pagto="+$(DIV_TABELA_DETALHES + " select[name=cl_pagto] option:selected").val()+
				"&cl_frete="+$(DIV_TABELA_DETALHES + " select[name=cl_frete] option:selected").val();


	//CONCATENAR A FUNCAO OS VALORES DA TABELA DETALHES checkbox
	funcao += "&cl_ipinoicms="+$(DIV_TABELA_DETALHES + " input[name=cl_ipinoicms]").val()+
				"&cl_consumo="+$(DIV_TABELA_DETALHES + " input[name=cl_consumo]").val()+
				"&cl_calc_icms="+$(DIV_TABELA_DETALHES + " input[name=cl_calc_icms]").val();

	//VERIFICA O CNPJ VALIDO BUSCANDO NA TABELA AUXILIAR SE PODE GRAVAR OU NAO
	var cnpj = $(DIV_TABELA_DETALHES + " input[name=cl_cgc]").val();

	if( (!validaCnpj(cnpj) && !valida_cpf(cnpj)) && objinfo.fo_cnpj == 'N' && cl_pessoa !== 'I'){
		swal('ERRO!','CNPJ/CPF Inválido','error');
		return;
	}
	funcao += "&cl_cgc="+cnpj;
	//VERIFICA O CNPJ VALIDO BUSCANDO NA TABELA AUXILIAR SE PODE GRAVAR OU NAO

	swal.loading("Gravando dados do cliente");
	ajax(funcao, EXEC, function(retorno){

		if(!empty(retorno.error)){
			var cancelaButton = false;
			var textoConfirma = 'OK';
			if(retorno.natureza){
				cancelaButton = true;
				textoConfirma = 'Cadastrar';
			}

			swal({
				title: 'Erro ao gravar',
				text: retorno.mensagem,
				type: 'error',
				showCancelButton: cancelaButton,
				confirmButtonText: textoConfirma,
			}, function(){
					selecionaLinha(DIV_TABELA, actpos, cell);

					if(retorno.natureza){
						window.open(encodeURI("../utility/TabelaAuxiliar.Layout.php?status=NATOPS","_blank"));
					}

					if(!empty(extra)){
						setTimeout(function () {
							$(DIV_TABELA_DETALHES + " input[name="+extra+"]").select();
						}, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
					}
				}
			);
			return;
		}

		objTabelaCli.registros[actpos] = retorno.registros[0];
		monta_detalhes(actpos);

		if(comando == 'insert'){
			setStatus(actpos,'a',DIV_TABELA);
		}

		$("#divObs").attr('Cliente',actpos);
		cancela(cell,extra);

		//VERIFICA O CNPJ VALIDO BUSCANDO NA TABELA AUXILIAR SE PODE GRAVAR OU NAO
		if(objTabelaCli.registros[actpos].cl_pessoa != "I" && !validaCnpj(cnpj) && !valida_cpf(cnpj)){
		   swal("Atenção!","O CNPJ/CPF deste cliente esta inválido, confira após a gravação", "warning" );
		   return;
   		}

		swal.close();
		if(!empty(fCustom)){
			fCustom();
		}
	});
}


//########################################################
//RETORNA OS VALORES ORIGINAIS PARA OS CAMPOS DA TABELA E DA DIV 'DETALHES'
//########################################################
function cancela(cell,extra){
	var actpos = $("#position").val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

	//ESSA FUNÇÃO É FEITA DEPOIS DE FAZER TODAS AS VERIFICAÇÕES DO CANCELA
	var ao_final = 	function(){
						selecionaLinha(DIV_TABELA,actpos,cell);

						if(!empty(extra)){
							setTimeout(function () {
								$(DIV_TABELA_DETALHES + " input[name="+extra+"]").select();
							}, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
						}
				  	};

	if(getStatus(actpos,DIV_TABELA) === 'a'){
		var tr = monta_linha(actpos);

		$(DIV_TABELA + " tr[posicao="+actpos+"]").html(tr);
		monta_detalhes(actpos);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		ao_final();

	}else if(getStatus(actpos,DIV_TABELA) === '+'){
		objTabelaCli.registros.splice(actpos,1);
		objTabelaCli.total -= 1;

		var paginaAtual = getPagina('#record','#pagination',LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		pagination(paginaAtual,function(){
			$('#record').val(objTabelaCli.total);
			if(objTabelaCli.total > 0){
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
//MUDA OS INPUTS DA TABELA PARA COMBO
//########################################################
function ComboLinha(campo){
	var actpos = $('#position').val();
	if(empty(actpos)){
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA) && !$(DIV_TABELA + " tr[posicao="+actpos+"]").hasClass('active')){
		return;
	}

	var Ovalor = $(campo).attr("name");
	var comboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name='"+Ovalor+"']";
	var inputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name='"+Ovalor+"']";

	var OptionsOriginais;
	switch (Ovalor) {
		case "cl_grupo":
			OptionsOriginais = $("#cbGrupo").html();
		break;
		case "cl_ativo":
			OptionsOriginais = $("#cbStatus").html();
		break;
		case "cl_grupofin":
			OptionsOriginais = $("#cbGfin").html();
		break;
	}

	if(empty($.trim($(comboMor).html()))){
		$(comboMor).append($(OptionsOriginais));
		$(comboMor+" option[value='%']").remove();

		if(Ovalor == "cl_ativo" ){
			$(comboMor+" option[value='ABP']").remove();
		}
	}

	$(comboMor + " option[value='"+$(inputMor).val()+"']").attr('selected', 'selected');

	//ESCONDE INPUT
	$(inputMor).hide();

	//MOSTRA COMBO
	$(comboMor).show();

	//DEIXA COMBO FOCADO
	$(comboMor).focus();
}


//########################################################
//MUDA OS COMBOS DA TABELA PARA INPUTS
//########################################################
function TiraComboLinha(campo){
	var actpos = $("#position").val();
	if(empty(actpos)){
		return;
	}

	var Ovalor = $(campo).attr("name");

	//COMBO DESEJADO
	var comboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name='"+Ovalor+"']";

	//INPUT SELECIONADO
	var inputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name='"+Ovalor+"']";

	$(inputMor).val($(comboMor).val());


	//MOSTRA INPUT
	$(inputMor).show();

	//ESCONDE COMBO
	$(comboMor).hide();

	edicao($(inputMor));
}


//########################################################
//ABRINDO CONSULTAS DE EMAIL
//########################################################
function buscaEmail(ref){
	//DIV_TABELA
	var actpos = $("#position").val();
	if(empty(actpos)){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}

	var status = getStatus(actpos, DIV_TABELA);

	if(!empty(status) && status !== '+'){
		swal('Atenção','Salve as alterações antes de Cadastrar E-mail','warning');
		return;
	}
    
    var numero = $(DIV_TABELA + " .active input[name=cl_number]").val(),
        abreviacao = $(DIV_TABELA + " .active input[name=cl_abrev]").val(),
        tipo = "CL";

	if(status == '+'){
		grava(2,null, function(){
			cnsMail_abre('box-inc-mail', abreviacao, numero ,tipo);
		});
	}else {        
        cnsMail_abre('box-inc-mail', abreviacao, numero ,tipo, null, null, DIV_TABELA_DETALHES+' input[name=email]');
	}
}


//########################################################
//ABRE OS LINKS DESEJADOS
//########################################################
function editar(acao){
	if(acao == 'g'){
		window.open(encodeURI("../utility/TabelaAuxiliar.Layout.php?status=CLIGRUFI"));
		return;
	}

	if(acao == 'status'){
		window.open(encodeURI("../utility/TabelaAuxiliar.Layout.php?status=CLIENTE"));
		return;
	}

	if(acao == 'grupo'){
		window.open(encodeURI("../utility/TabelaAuxiliar.Layout.php?status=CLIGRUPO"));
		return;
	}


	var actpos = $("#position").val();
	if(actpos === 'null'){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),2);
		return;
	}

	var cliente = objTabelaCli.registros[actpos].cl_number;
	switch(acao){
		case 'p':
			window.open(encodeURI("../basico/Rel.Pendencia.Layout.php?&numcli=" + cliente ));
		return;

		case 'a':
			var cl_abrev = objTabelaCli.registros[actpos].cl_abrev;
			window.open(encodeURI("../utility/Agenda.Layout.php?nome="+cl_abrev+"&ord=0" ));
		return;

		case 'relProd':
			window.open(encodeURI("../basico/Rel.ProdutosNComprados.Layout.php?&numcli=" + cliente ));
		break;

		case 'h':
			var obs = "";
			swal({
				title: "Digite uma Observação para o Relatório?",
				type: "input",
				showCancelButton: true,
				confirmButtonText: "Sim",
				closeOnConfirm: false,
				closeOnCancel: true,
				showLoaderOnConfirm: true,
			}, function(inputValue){
				if (inputValue !== false){
					obs = inputValue;
					window.open(encodeURI("../basico/Rel.Hist.Cliente.Layout.php?clnumber="+cliente+"&obs="+obs ));
				}
				swal.close();
			}
		);
		return;

		case 'r':
			var HTMLimpostos = "<div id='divRecibo'>"+
									"<div class='float-left' style='margin: 10px 0 10px 20px;'>"+
									"<p class='text-align-left' style='margin: 0 0 8px 0;'>Tipo de Pagto:</p>"+
									"<input type='text' class='inline w200' style='margin:0 0 10px 0;' id='tipopag' maxlength='30'> "+
									"</div>"+

									"<div class='float-left' style='margin: 10px 0 10px 20px;'>"+
									"<p class='text-align-left' style='margin: 0 0 8px 0;'>Finalidade</p>"+
									"<input type='text' id='referente' class='w200 margin0 inline' style='padding: 0px 12px;'>"+
									"</div>"+
								"</div>"+

								"<div id=divRecibo2>"+
									"<div class='float-right w200' style='margin: 10px 0 10px 20px;'>"+
									"<p class='text-align-left' style='margin: 0 0 8px 0;'>Valor</p>"+
									"<input type='number' min='0' step='1' value='0.00' id='valor'"+
										"class='w200 margin0 inline' style='padding: 0px 12px;'>"+
									"</div>"+

									"<div class='float-right w200' style='margin: 10px 0 10px 20px;'>"+
									"<p class='text-align-left' style='margin: 0 0 8px 0;'>Data</p>"+
									"<input type='date' id='dataini' value="+getDataHoje()+" class='inline' style='margin: 0 0 10px 0;padding: 0px 12px;'>"+
									"</div>"+
								"</div>"+

								"</div>";
			swal({
				title: "RECIBO",
				text: HTMLimpostos,
				html: true,
				showCancelButton: true,
				confirmButtonText: "Visualiza",
				closeOnConfirm: false,
				closeOnCancel: true,
				showLoaderOnConfirm: true,
			}, function(confirmou){
				//SE COMFIRMOU VERIFICA DADOS PREENCHIDOS
				if(!confirmou){
					return;
				}
					var referente = $('#referente').val();
					if(empty(referente)){
						swal.showInputError("Preencha a Finalidade do Recibo");
						return false;
					}

					var tipopag = $('#tipopag').val();
					if(empty(tipopag)){
						swal.showInputError("Preencha o Tipo de Pagamento do Recibo");
						return false;
					}

					var valor = $("#valor").val();
					if(empty(valor) || valor === 0 ){
						swal.showInputError("Digite um valor");
						return false;
					}

					var dataini = $('#dataini').val();
					var reg = /^[0-9]{4}(-[0-9]{2}){2}$/g;

					if (empty($.trim(dataini))){
						swal.showInputError("Você precisa digitar uma data antes!");
						return false;
					}

					if(!reg.test(dataini)){
						swal.showInputError("Data de pagamento digitada inválida!");
						return false;
					}
					window.open(encodeURI("../basico/Imp.ReciboCliente.Layout.php?cliente="+cliente+
								"&referente="+referente+"&valor="+valor+"&tipopag="+tipopag+"&dataini="+dataini));
					swal.close();

			});
		return;

		case 'f':
			if(!Verifica_Alteracao(DIV_TABELA)){
				selecionaLinha(DIV_TABELA,$('#position').val(),1);
				return;
			}

			swal({
				title: "Deseja Inlcuir o Cliente como Fornecedor?",
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

				var funcao = "funcao=insereFornec&cl_number="+cliente;

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
								title:'Erro ao Cadastrar Cliente como Fornecedor',
								text: retorno.mensagem,
								type: 'error'
							},
							function(){
								selecionaLinha(DIV_TABELA,actpos,1);
							}
						);
						return;
					}

					swal("Cadastro Realizado com Sucesso", "Cliente Cadastrado como Fornecedor", "success");
				});
			});
		return;

		case 's':
			if(!Verifica_Alteracao(DIV_TABELA)){
				selecionaLinha(DIV_TABELA,$('#position').val(),1);
				return;
			}
			swal.loading("Buscando Dados...");

			var funcao = "funcao=somaDebitos&cl_number="+cliente;

			ajax(funcao, EXEC, function(retorno){
				swal({
					title: 'Soma Débitos',
					text: retorno,
					type: "warning",
					html: true
				});
			});
		return;

		case "trocasenha":
			swal({
					title: "Deseja Troca a Senha do Cliente para padrão "+objinfo.auxCliente_senha+"?",
					type: "warning",
					showCancelButton: true,
					confirmButtonText: "Sim",
					cancelButtonText: "Não",
					closeOnConfirm: false,
					closeOnCancel: true,
					showLoaderOnConfirm: true,
					confirmButtonColor: "#DD6B55"
				},
				function(confirmou){
					if(!confirmou){
					 return;
					}

					funcao = "funcao=trocaSenha&cl_number="+cliente;

					ajax(funcao, EXEC, function(retorno){
						retorno = json(retorno);

						if(!retorno){
							var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
							swal('Erro na Alteração da Senha',erro,'error');
							return;
						}

						if(!empty(retorno.error)){
							//ERRO
							swal({
									title:'Erro ao Trocar a Senha',
									text: retorno.mensagem,
									type: 'error'
								},
								function(){
									selecionaLinha(DIV_TABELA,actpos,1);
								}
							);
							return;
						}

						swal("Senha Cadastrada com Sucesso", "Nova senha para o Cliente: "+objinfo.auxCliente_senha, "success");
					});
				}
			);

		return;
	}
}


//########################################################
//ABRE OS LINKS DESEJADOS DA DIV DE DETALHES
//########################################################
function editar_detalhes(acao){
	switch(acao){
		case 'fidelizacao':
			swal("Em desenvolvimento");
		return;
		case "curva":
			if(!Verifica_Alteracao(DIV_TABELA)){
				selecionaLinha(DIV_TABELA,$('#position').val(),2);
				return;
			}

			swal({
				title: "Confirma a geração da curva para todos os Clientes?",
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

				var funcao = "funcao=curvaCliente";

				ajax(funcao, EXEC, function(retorno){

					if(!empty(retorno.error)){
						swal("Erro ao gravar impostos",retorno.mensagem,"error");
						return;
					}

					//EXBIBE NA TELA O SUCESSO AO GRAVAR
					swal({
							title:"OK",
							text: "Curvas gravadas com sucesso!",
							type: "success"
						},
						function(){
							// monta_query();
						}
					);
				});
			});
		return;
	}

	var actpos = $("#position").val();
	if(actpos === 'null'){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}
	var linha = DIV_TABELA_DETALHES + "[posicao="+actpos+"] input";

	switch (acao) {
		case "cnpj":
			var cnpj = $(linha+"[name=cl_cgc]").val(),
				cl_pessoa = $(DIV_TABELA_DETALHES + " select[name=cl_pessoa] option:selected").val();
			if( (!validaCnpj(cnpj) && !valida_cpf(cnpj)) && cl_pessoa !== 'I'){
				swal('ERRO!','CNPJ/CPF Inválido','error');
			} else {
				swal('OK!','CNPJ/CPF - OK','success');
			}
		return;

		case 'ie':
			var ie = $(linha + "[name=cl_iest]").val();
			ie = $.trim(ie);
			var estado;

			var cliente = objTabelaCli.registros[actpos].cl_number;
			funcao = "funcao=montaEnd&cl_number="+cliente;
			ajax(funcao, EXEC, function(retorno){
				retorno = json(retorno);

				if(!retorno){
				 var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				 swal('Erro na Busca da UF',erro,'error');
				 return;
				}

				if(!empty(retorno.error)){
				 //ERRO
				 swal({
				   title:'Erro ao Trocar a Senha',
				   text: retorno.mensagem,
				   type: 'error'
				  },
				  function(){
				   selecionaLinha(DIV_TABELA,actpos,1);
				  }
				 );
				 return;
				}
					if(empty(retorno.registros)){
						swal("ERRO", "Nenhum endereço Encontrado!", "error");
						return;
					}
					estado = retorno.registros[0].en_uf;
					if(CheckIE(ie, estado)){
						swal("OK!", "Inscrição Estadual Válida!", "success");
						return;
					} else {
						swal("ERRO!", "Inscrição Estadual Não valida!", "error");
						return;
					}
			});
			//CASO TENHA TUDO PREENCHE A VARIAVEL ESTADO E FAZ O TESTE
		return;
	}
}


//########################################################
//ENVIA OS EMAILS VIA ROBO DE COBRANÇA
//########################################################
function roboCob(){
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),1);
		return;
	}

	var Novadata = "";
	var recebeCopia = "";

	swal({
		title: "Data final de pesquisa",
		text: "Gera e-mail para clientes em atraso até a data:",
		type: "input",
		showCancelButton: true,
		closeOnConfirm: false,
		animation: "slide-from-top",
		inputPlaceholder: "dd/mm/aaaa"
	}, function(inputValue){
		if (inputValue === null){
			$('.sweet-alert input').attr('type', 'text');
			$('.sweet-alert input').removeClass('w250');
			$('.sweet-alert.show-input input').val("");
   		 	$('.sweet-alert.show-input input').css({'margin':'', 'padding':'0 12px'});
			swal.close();
			return;
		}

		var Novadata = inputValue;
		var reg = /^[0-9]{4}(-[0-9]{2}){2}$/g;

		if (empty($.trim(Novadata))){
			swal.showInputError("Você precisa digitar uma nova data antes!");
			return false;
		}

		if(!reg.test(Novadata)){
			swal.showInputError("Data digitada inválida!");
			return false;
		}

		swal({
			 title: "Cópia de e-mail",
			 text: "Deseja receber uma cópia de todos os e-mails de cobrança que forem enviados?",
			 type: "info",
			 showCancelButton: true,
			 confirmButtonText: "Sim",
			 cancelButtonText: "Não",
			 closeOnConfirm: false,
			 closeOnCancel: false,
			 showLoaderOnConfirm: true,
			 showLoaderOnCancel: true,
		 }, function(isConfirm){
			 swal.loading("Processando Solicitação");
			 trataEmailCob(Novadata, isConfirm);
		 });
		 $('.sweet-alert input').attr('type', 'text');
		 $('.sweet-alert input').removeClass('w250');
		 $('.sweet-alert.show-input input').val("");
		 $('.sweet-alert.show-input input').css({'margin':'', 'padding':'0 12px'});
	});

	$('.sweet-alert input').attr('type', 'date');
	$('.sweet-alert input').addClass('w250');
	$('.sweet-alert.show-input input').css({'margin':'20px auto 18px auto', 'padding':'0 0 0 12px'});
	$('.sweet-alert.show-input input').val(getDataHoje());
}


//########################################################
//TRATA OS CLIENTES PARA ENVIAR OS EMAILS VIA ROBO DE COBRANÇA
//########################################################
function trataEmailCob(inputvalue, copiaEmail, inicio){

	if(inicio === undefined){inicio = 0;}
	var filtro = {};
	var strFiltros;
	filtro.ordem = $("#cbOrdem").val();
	filtro.termo = $("#search").val();
	filtro.grupo = $("#cbGrupo").val();
	filtro.uf = $("#cbUF").val();
	filtro.representante = $("#cbRep").val();
	filtro.margem = $("#cbMargem").val();
	filtro.gfin = $("#cbGfin").val();
	filtro.cbstatus = $("#cbStatus").val();

	var strCli = "";
	try{
		strFiltros = JSON.stringify(filtro);
	}catch(e){}
	createRequest();
	var strCopiaEmail = (copiaEmail ? "true" : "false");
	var funcao = "funcao=robocobranca&copiaemail="+strCopiaEmail+"&datavalida=" + inputvalue + "&filtro="+strFiltros+"&inicio="+inicio;
	//get('divamp').style.visibility = "visible";
	request.onreadystatechange = function(){
		if(request.readyState == 4){
			if(request.status == 200){
				//get("divamp").style.visibility = "hidden";
				var resposta = request.responseText;
				var objResposta;
				try{
					objResposta = JSON.parse(resposta);
					$('.sweet-alert p').html("Enviado(s) " + objResposta.actCli + " e-mail(s) de " + objResposta.totCli + " ("+objResposta.porcentagemCli+"%)");
					if (objResposta.status){
						if (objResposta.finalPos){
							if(!empty(objEmailsQueDeramErrado)){
								var email_message = objEmailsQueDeramErrado.join('\n');
								swal("Atenção", 'Emails de Cobrança enviados com sucesso\nPara os Clientes a seguir não foi possível o envio do email:\n'+email_message, "warning");
								objEmailsQueDeramErrado = [];
								return;	
							}
							swal("Sucesso", objResposta.message, "success");
						}else{
							if(!empty(objResposta.emails_errados)){
								objEmailsQueDeramErrado.push(objResposta.emails_errados);
							}

							trataEmailCob(inputvalue, copiaEmail, resposta.inicio);
						}
					}else{
						var errorType = "error";
						if (objResposta.errorType !== undefined){
							errorType = objResposta.errorType;
						}
						swal("Erro", objResposta.message, errorType);
					}
				}catch(e){
					swal("Erro", resposta, "error");
				}
			}
		}
	};
	request.open("POST", "Cliente.Exec.php", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send(funcao);
}


//########################################################
//ABRE OS LINKS DESEJADOS PARA A PROCEDURE CliDivs
//########################################################
function editaFator(acao){
	var actpos = $("#position").val();
	if(actpos === 'null'){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),1);
		return;
	}
	var cliente = objTabelaCli.registros[actpos].cl_number;
	var fator = "";


	var Criterios = "Status = "+$("#cbStatus option:selected").html()+
					"\nGrupo = "+($("#cbGrupo").val() == '%' ? 'Todos' : $("#cbGrupo").val())+
					"\nGrupo Financeiro = "+($("#cbGfin").val() == '%' ? 'Todos' : $("#cbGfin").val())+
					"\nUF = "+($("#cbUF").val() == '%' ? 'Todos' : $("#cbUF").val())+
					"\nMargem = "+($("#cbMargem").val() == '%' ? 'Todos' : $("#cbMargem").val())+
					"\nRepresentante = "+$("#cbRep option:selected").html()+
					"\nOrdem = "+ $("#cbOrdem option:selected").html()+
					"\nTexto Buscado = "+$("#search").val().toUpperCase();

	var funcao = "funcao=CliDivs"+
					"&status="+($("#cbStatus option:selected").val() == '%' ? 'Todos' : $("#cbStatus").val())+
					"&grupo="+($("#cbGrupo").val() == '%' ? 'Todos' : $("#cbGrupo").val()) +
					"&grupofin="+($("#cbGfin").val() == '%' ? 'Todos' : $("#cbGfin").val()) +
					"&uf="+($("#cbUF").val() == '%' ? 'Todos' : $("#cbUF").val())+
					"&dias="+$("#compra").val()+
					"&margem="+($("#cbMargem").val() == '%' ? 'Todos' : $("#cbMargem").val())+
					"&representante="+($("#cbRep").val() == '%' ? 'Todos' : $("#cbRep").val())+
					"&index="+$("#cbOrdem").val()+
					"&nome="+$("#search").val();


	var exec = function(){

		ajax(funcao, EXEC, function(retorno){
			retorno = json(retorno);
			if(!retorno){
				var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				swal('Erro ao Alterar Fator e Credito',erro,'error');
				return;
			}
			//ERRO
			if(!empty(retorno.error)){
				swal('Erro ao Alterar Fator e Credito',retorno.mensagem,'error');
				return;
			}
			objTabelaCli = retorno;
			pagination(1);
			swal.close();

		});
	};

	var Novadata = "";
	switch (acao) {
		case 'f':
			swal({
				title:'Digite o valor do Fator para os Clientes nestes Criterios',
				text: Criterios,
				type: "input",
				inputPlaceholder: "0,00",
				showCancelButton: true,
				closeOnConfirm: false,
				showLoaderOnConfirm: true,
			}, function(inputValue){
				if(inputValue === false){
					return false;
				}

				fator = inputValue;
				//VERIFICA SE O COMBO ESTÁ CHECKED E A POSIÇÃO NÃO É NULL
				if($('#ckFiltroCompra').is(':checked') && !empty($("#compra").val())){
					var data = new Date(getDataHoje());
					data.setDate(data.getDate() - $("#compra").val());
                    Novadata = data.customFormat( "#YYYY#-#MM#-#DD#" );                    
//					Novadata = converteData(data.toLocaleDateString(), 'DATA_US');
				}

				funcao += "&comando=f&fator="+fator+"&dtFinal="+Novadata;
				exec();
				$('.sweet-alert input').attr('type', 'text');
				$('.sweet-alert input').removeClass('w200');
				$('.sweet-alert input').removeClass('center');
				$('.sweet-alert.show-input input').css({'margin':'', 'padding':'0 12px'});
			});
			 $('.sweet-alert input').attr('type', 'number');
			 $('.sweet-alert.show-input input').val("");
			 $('.sweet-alert input').addClass('w200');
			 $('.sweet-alert.show-input input').css({'margin':'10px auto 18px auto', 'padding':'0 0 0 12px'});



		return;

		case 'l':
			swal({
				title: "Recalcula Limite do Credito",
				text: "Confirma o Recalculo do Limite de Credito para os Clientes?",
				type: "info",
				showCancelButton: true,
				confirmButtonText: "Sim",
				cancelButtonText: "Não",
				closeOnConfirm: false,
				closeOnCancel: false,
				showLoaderOnConfirm: true,
			}, function(isConfirm){
				if(!isConfirm){
					swal.close();
					return;
				}

				swal.loading("Carregando...");

				funcao += "&comando=l&dtFinal="+Novadata+"&fator=0";
				$('.sweet-alert input').attr('type', 'text');
			   	$('.sweet-alert input').removeClass('w250');
			   	$('.sweet-alert.show-input input').css({'margin':'', 'padding':'0 12px'});
			   	$('.sweet-alert.show-input input').val("");
				exec();
			});
		break;

		case 'z':
			swal({
				title: "Zerar Limite do Credito",
				text: "Deseja Zerar o Limite de Credito dos Clientes filtrados?",
				type: "info",
				showCancelButton: true,
				confirmButtonText: "Sim",
				cancelButtonText: "Não",
				closeOnConfirm: false,
				closeOnCancel: false,
				showLoaderOnConfirm: true,
			}, function(isConfirm){
				if(!isConfirm){
					swal.close();
					return;
				}
				//VERIFICA SE O COMBO ESTÁ CHECKED E A POSIÇÃO NÃO É NULL
				if($('#ckFiltroCompra').is(':checked') && !empty($("#compra").val())){
					var data = new Date(getDataHoje());
					data.setDate(data.getDate() - $("#compra").val());
                    
                    Novadata = data.customFormat( "#YYYY#-#MM#-#DD#" );                    
//					Novadata = converteData(data.toLocaleDateString(), 'DATA_US');
				}

				funcao += "&comando=z&dtFinal="+Novadata+"&fator=0";
				exec();
			});
		break;

	}


}


//########################################################
//NÃO PERMITE O CAMPO FICAR VAZIO E TRAS FORMATAÇÃO DE NUMERO
//########################################################
function notnull(elemento) {
	//PEGA O NAME DO INPUT
	var campo = $(elemento).attr('name');
	var casa = 2;
	var muda_valor = '0';

	switch (campo) {
		case 'cl_desconto':
		case 'cl_desc2':
		case 'cl_fator':
			casa = 4;
			muda_valor = '1';
		break;

		case  'cl_limite':
			casa = 0;
		break;
	}

	if ($(elemento).val() === '') {
		$(elemento).val(muda_valor);
	}
	if ($(elemento).val() !== '' && $(elemento).val() != $(elemento).attr("last_value")) {
		$(elemento).val(tonumber($(elemento).val()));
		$(elemento).val(function(index, value) {
			return value.replace(",", ".");
		});
		$(elemento).val(function(index, value) {
			return number_format($(elemento).val(), casa, ",", ".");
		});
		$(elemento).attr('last_value', $(elemento).val());
	}
}


//########################################################
//ABRINDO CONSULTAS - TRANSPORTADORA
//########################################################
function buscaTransportadora(botao){
	var texto = $(DIV_TABELA_DETALHES + " input[name=tr_nome]").val();

	var naopesquisa = false;
    if (empty(texto)){
        naopesquisa = true;
    }

    if (texto == $(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_nome')){
		if(!empty(botao)){
			switch (botao) {
				case 'enter':
					grava(0,'tr_nome');
				break;
				case 'esc':
					cancela(0,'tr_nome');
				break;
			}
		}

        return;
    }

    swal.loading('Pesquisando Transportadora');

    fechaSwalCli();

    cnsTrans_abre(texto.trim(), 'box-inc-trans', 'nome', naopesquisa);
}


//########################################################
//FECHANDO CONSULTAS - TRANSPORTADORA
//########################################################
function fechaSwalCli(){
    if($('#box-inc-trans').hasClass('active') || $(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_nome') !== ''){
        swal.close();
    }else{
        setTimeout(function(){
            fechaSwalCli();
        },400);
    }
}


//########################################################
//RETORNO CONSULTAS - TRANSPORTADORA
//########################################################
function cnsTrans_retorno() {

     $(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_nome', objTransportadora.tr_abrev);
     $(DIV_TABELA_DETALHES + " input[name=tr_nome]").attr('tr_number', objTransportadora.tr_number);

	 $(DIV_TABELA_DETALHES + " input[name=tr_nome]").val(objTransportadora.tr_abrev);
     $(DIV_TABELA_DETALHES + " input[name=tr_fone]").val(objTransportadora.tr_fone);

	 setTimeout(function(){
 		$(DIV_TABELA_DETALHES + " input[name=tr_nome]").select();
 	},20);
}



//########################################################
//########################################################
				//FIM FUNÇÕES DE CLIENTE
//########################################################
//########################################################


function indicaCFOP(){
	if(!validaVersao("10.05",true)){
			return;
	}

	var actpos = $('#position').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	if(getStatus(actpos,DIV_TABELA) == '+'){
		swal({
			title: "Atenção",
			text: "É necessário Concluir o cadastro do Cliente antes de realizar a busca pela CFOP Indicada",
			type: "warning"
		}, function(){
				$(DIV_TABELA + " tr[posicao="+actpos+"] input[name=cl_abrev]").focus();
		});
		return;
	}

	var cl_number = objTabelaCli.registros[actpos].cl_number;

	var funcao = "funcao=carregaCFOP&cl_number="+cl_number;
	loading.show();

	ajax(funcao, EXEC, function(retorno){
		loading.close();// FECHA O LOADING NOVO

		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro buscar Naturezas',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			if(!empty(retorno.endereco)){
				swal('Erro!', 'É necessário o cliente possuir um endereço cadastrado', 'error');
				return;
			}

			swal('Erro ao buscar tabela de Naturezas de Operação',retorno.mensagem,'error');
			return;
		}

		objNatureza = retorno;

		//MOSTRAR SWAL NA TELA E PERMITIR A ESCOLHA DA CFOP INDICADA
		swal({
				html:true,
				title:"CFOP Indicada",
				text: retorno.af_string + " - " + retorno.af_descr,
				type: "warning",
				confirmButtonText: "Atribuir CFOP ao Cliente",
				showCancelButton: true,
				closeOnConfirm: false,
				showLoaderOnConfirm: true,
		}, function(isConfirm){
			if(!isConfirm){
				$(DIV_TABELA_DETALHES + " input[name=cl_natureza]").focus().select();
				return;
			}

			$(DIV_TABELA_DETALHES + " input[name=cl_natureza]").val(retorno.af_string);
			if(getStatus(actpos,DIV_TABELA) === ''){
				setStatus(actpos, 'a', DIV_TABELA);
				grava();
			}

			swal.close();
			$(DIV_TABELA_DETALHES + " input[name=cl_natureza]").focus().select();
		});
	});
}
















//########################################################
//########################################################
			//FUNÇÕES DE TABELA REPRESENTANTE
//########################################################
//########################################################



//########################################################
//ABRE O SWEET ALERT COM A TABELA PARA A ESCOLHA DO REPRESENTANTE
//########################################################
function mostraRepresentante(abrir,botao){
	var actpos = $("#position").val();
	if(empty(actpos)){
		return;
	}

	if(empty(abrir) && abrir !== false){
		abrir = true;
	}

	var texto = $(DIV_TABELA_DETALHES + " input[name=vd_nome]").val();

	var funcao = "funcao=representante&texto="+texto;

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao trazer informações da Tabela Auxiliar',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			if(!empty(retorno.error)){
				swal({
						title:'Erro ao trazer Exames',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA_DETALHES,actpos,0);
					}
				);
				return;
			}
		}

		objRepresentante = retorno;
		if(objRepresentante.total === 0){
            swal({
                    title:'Erro ao trazer Representantes',
                    text: 'Representante Inativo ou Não Existente',
                    type: 'error'
                },
                function(){
                    selecionaLinha(DIV_TABELA_DETALHES,actpos,0);
                }
            );
            return;
        }

		if(objRepresentante.total == 1 && abrir){
            $(DIV_TABELA_DETALHES + " input[name=vd_nome]").val(objRepresentante.registros[0].vd_nome);
            $(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_number',objRepresentante.registros[0].vd_number);

			if(!empty(botao)){
				switch (botao) {
					case 'enter':
						grava(0,'vd_nome');
					break;
					case 'esc':
						cancela(0,'vd_nome');
					break;
				}
			}
            return;
        }

		var tabRepres = "<div id='divRepresentante'>"+
                            "<table class='table bg-cinza cl-preto'>"+
                            "<tbody class='title'>"+
                                "<tr>"+
                                    "<td class = 'w80'>Nº</td>"+
                                    "<td class = 'w350'>Nome</td>"+
                                "</tr>"+
                            "</tbody>"+
                            "</table>"+
                            "<table class='table cl-preto'>"+
							"<tbody id='escolha_reprensentante' class='h160'>"+
							"</tbody>"+
    						"</table>"+
    						"<div class='footer'>"+
    							"<div class='pagination float-left' id='pagination_vd'></div>"+
    							"<span class='registros'>"+
    								"<label>Posição:</label>"+
    								"<input id='position_vd' value='null' class='bolder'/>"+
    							"</span>"+
    							"<span class='registros'>"+
    								"<label>Registros:</label>"+
    								"<input value= 'null' id='record_vd'class='bolder'/>"+
    							"</span>"+
    						"</div>"+
    					"</div>";

		swal({
				title: "Reprensentantes",
				text: tabRepres,
				html: true,
				showCancelButton: true,
	            confirmButtonText: "Selecionar",
	            cancelButtonText: "Cancelar",
	            closeOnConfirm: true,
	            closeOnCancel: true,
			},
			function(confirmou){
				if(confirmou){
					selecionaLinha(DIV_TABELA_DETALHES, actpos, 0);
	            	seleciona_vd_nome($("#position_vd").val());
				}
			}
		);

		pagination_vd(1);

		//########################################################
		//PRECISA VALIDAR O PINTA LINHA SEMPRE QUE ABRE O SWEET ALERT
		$("#escolha_reprensentante").on("focus", 'tr',function(){
			pintaLinha_vd($(this));
		});

		$("#escolha_reprensentante").dblclick('tr',function(){
			seleciona_vd_nome($("#position_vd").val());
			swal.close();
		});
	});

}


//########################################################
//COLOCA OS VALORES DE NOME E NUMERO DO REPRESENTANTE ESCOLHIDO NO INPUT NA TABELA DETALHES
//########################################################
function seleciona_vd_nome(actpos){
    var codigo = $("#escolha_reprensentante tr[posicao="+$("#position_vd").val()+"] input[name='vd_number']").val();
    var nome = $("#escolha_reprensentante tr[posicao="+$("#position_vd").val()+"] input[name='vd_nome']").val();

    $(DIV_TABELA_DETALHES + " input[name=vd_nome]").val(nome);
	$(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_number', codigo);
	$(DIV_TABELA_DETALHES + " input[name=vd_nome]").attr('vd_nome', nome);
	setTimeout(function(){
		$(DIV_TABELA_DETALHES + " input[name=vd_nome]").select();
	},20);
}


//########################################################
//MONTA AS PAGINAS DA TABELA NO SWAL
//########################################################
function montaPaginas_vd(paginaAtual,totalDePaginas){
	$('#pagination_vd').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

	if(paginaAtual >= (links + 2)){
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination_vd').append("<span onclick='pagination_vd(" + 1 + ");' class='cor_padraoInvert_hover'>" + 1 + "</span>");
		$('#pagination_vd').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination_vd').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
			$('#pagination_vd').append("<span onclick='pagination_vd(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}
	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination_vd').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination_vd').append("<span onclick='pagination_vd(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
	}
}


//########################################################
//PREENCHE A TABELA DO SWAL DE ACORDO COM O NUMERO DE REGISTROS POR PÁGINA
//########################################################
function pagination_vd(paginaAtual, fCustom){
    var totalDePaginas = Math.ceil(objRepresentante.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

    var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objRepresentante.total)
		fim = objRepresentante.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);

    montaPaginas_vd(paginaAtual, totalDePaginas);

    $('#position_vd').val("null");

	//RESETA TOTAL
	$('#record_vd').val(objRepresentante.total);

    //EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela("#escolha_reprensentante");
	if(objRepresentante.total > 0){
		var tabela = "";
		for(var i = inicio; i < fim; i++){
			tabela = "<tr posicao=" + i + ">";
			tabela += vd_linha(i);
			tabela += "</tr>";
			$("#escolha_reprensentante").append(tabela);
		}
    }

    //SELECIONA A PRIMEIRA LINHA
    if(objRepresentante.total > 0 && empty(fCustom)){
        pintaLinha_vd($("#escolha_reprensentante" + ' tr:eq(0)'));
        $("#escolha_reprensentante").animate({ scrollTop: "=0" }, "fast");
    }

    if(!empty(fCustom)){
        fCustom();
    }
    //
    $("#escolha_reprensentante").mCustomScrollbar({
        scrollInertia: 0.8,
        autoHideScrollbar: true,
        theme:"dark-3"
    });

} // fim pagination_vd


//########################################################
//CRIA A LINHA COM OS VALORES E RETORNA A TABELA FEITA
//########################################################
function vd_linha(i){
    var aux = objRepresentante.registros[i];

    var table = "<td class = 'w80 inativo number'><input name='vd_number' value='"+aux.vd_number+"' readonly/></td>"+
                "<td class = 'w350 inativo'><input name='vd_nome' value='"+aux.vd_nome+"' readonly/></td>";

    return table;
} // fim ex_linha


//########################################################
//PINTA AS LINHAS DA TABELA DE ESCOLHA DE EXAMES NO SWAL
//########################################################
function pintaLinha_vd(elemento){
    var actpos = $(elemento).attr('posicao');
	$('#position_vd').val(actpos);
	$("#escolha_reprensentante" + ' .active').removeClass('active');
	$(elemento).addClass('active');
}



//########################################################
//########################################################
			//FIM FUNÇÕES DE TABELA REPRESENTANTE
//########################################################
//########################################################



//########################################################
//########################################################
			//FUNÇÕES DO CAMPO NATOPS
//########################################################
//########################################################

//########################################################
//########################################################
			//FIM DAS FUNÇÕES DO CAMPO NATOPS
//########################################################
//########################################################







//########################################################
//########################################################
			//FUNÇÕES DA OBSERVAÇÃO
//########################################################
//########################################################



//########################################################
//MONTA A TABELA DE OBSERVAÇÕES
//########################################################
function monta_obs(actpos){
	LimpaTabela(DIV_TABELA_OBS);
	if(getStatus(actpos, DIV_TABELA) == '+' || empty(objTabelaCli.registros[actpos].cl_number)){
		return;
	}
	$(DIV_TABELA_OBS).html("<img src='../component/loading.gif' />");

	if(empty(actpos)){
		return;
	}

	var cl_number = objTabelaCli.registros[actpos].cl_number;

	var funcao = "cl_number="+cl_number+"&funcao=montaObs";

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Observações',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de Observações',retorno.mensagem,'error');
			return;
		}

		$('#record_obs').val(retorno.total);
		objTabelaObs = retorno;

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination_obs(1);
	});

}


//########################################################
//CRIA A PAGINÇÃO DA TABELA DE OBSERVAÇÕES
//########################################################
function pagination_obs(pagina, fCustom){
	LimpaTabela(DIV_TABELA_OBS);
	if(objTabelaObs.total > 0){
		var tabela = "";
		for(var i = 0; i < objTabelaObs.total; i++){
			tabela += "<tr posicao=" + i + ">";
			tabela += monta_linha_obs(i);
			tabela += "</tr>";
		}
		$(DIV_TABELA_OBS).append(tabela);

		if (!TestaAcesso('BAS.CLIENTE', 2)) {
			$(DIV_TABELA_OBS + " td").addClass("inativo");
			$(DIV_TABELA_OBS + " td input").prop("readonly",true);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaObs.total > 0 && empty(fCustom)){
		pintaLinha_Obs($(DIV_TABELA_OBS + ' tr:eq(0)'));
		//VOLTA O SCROLL PRA CIMA
		$(DIV_TABELA_OBS).animate({ scrollTop: "=0" }, "fast");
	}

	if($(DIV_TABELA_ENDERECO).is( ":visible" ) && !empty($("#position").val())){
		// LIMPA CAMPOS DE TRANSPORTADORA
		monta_end($("#position").val());
	}

	if(!empty(fCustom)){
		fCustom();
	}

	$(DIV_TABELA_OBS).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}


//########################################################
//MONTA AS LINHAS DA TABELA DE OBSERVAÇÕES
//########################################################
function monta_linha_obs(i){
	var aux = objTabelaObs.registros[i];
	var table = ""+
				"<td class='w20 inativo center'><input value='' readonly/></td>"+
				"<td class='w40 inativo center'><input value='"+aux.co_number+"' name='co_number' readonly/></td>"+
				"<td class='w690'><input value='"+aux.co_linha+"' name='co_linha'/></td>";
	return table;
}


//########################################################
//PINTA AS LINHAS DA TABELA DE OBSERVAÇÃO
//########################################################
function pintaLinha_Obs(elemento){
	var cliente = $("#position").val();
	var actpos = $(elemento).attr('posicao');
	$('#position_obs').val(actpos);
	$(DIV_TABELA_OBS + ' .active').removeClass('active');
	$(elemento).addClass('active');

	//EVITA COM QUE MONTE ITENS + DE 1 VEZ
	if($("#divEnd").attr('Cliente') != cliente && $('#divEnd').is( ":visible" )){
		$("#divEnd").attr('Cliente',actpos);
		monta_end($("#position").val());
		return;
	}
}


//########################################################
//INSERE UMA NOVA LINHA NA TABELA DE OBSERVAÇÕES
//########################################################
function insere_obs(){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA_OBS)){
		selecionaLinha(DIV_TABELA_OBS,$('#position_obs').val(),1);
		return;
	}

	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA_OBS)){
		selecionaLinha(DIV_TABELA_OBS,$('#position_obs').val(),1);
		return;
	}


	if(empty(objTabelaObs)){
		objTabelaObs = {};
		objTabelaObs.registros = [];
		objTabelaObs.total = 0;
	}


	var novaPosicao = {};
	novaPosicao.co_number = "";
	novaPosicao.co_linha = "";

	objTabelaObs.registros.push(novaPosicao);
	objTabelaObs.total += 1;

	var actpos = (objTabelaObs.total > 0 ?(objTabelaObs.total - 1):0);
	pagination_obs((Math.ceil(objTabelaObs.total)), function(){
		pintaLinha_Obs($(DIV_TABELA_OBS + " tr[posicao="+actpos+"]"));

		setStatus(actpos, '+', DIV_TABELA_OBS);
		Bloqueia_Linhas(actpos, DIV_TABELA_OBS);
		selecionaLinha(DIV_TABELA_OBS, actpos, 2);
		$("#record_obs").val(objTabelaObs.total);
	});
}


//########################################################
//MUDA O STATUS DA LINHA EDITADA DA TABELA OBSERVAÇÕES
//########################################################
function edicao_obs(elemento){
	var posicao = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaObs.registros[posicao][campo];

	//NÃO HOUVE ALTERAÇÃO
	if($(elemento).val() == original || getStatus(posicao,DIV_TABELA_OBS) !== ''){
		return;
	}

	setStatus(posicao, 'a', DIV_TABELA_OBS);
	Bloqueia_Linhas(posicao, DIV_TABELA_OBS);
}


//########################################################
//GRAVA OS DADOS EDITADOS DA TABELA OBSERVAÇÕES
//########################################################
function grava_obs(cell, fCustom){
	var actpos = $("#position_obs").val();
	if(actpos === 'null'){
		swal('Erro ao Gravar', 'É necessario selecionar uma linha', 'error');
		return;
	}
    var status = getStatus(actpos, DIV_TABELA_OBS);
    if(empty(cell)){
		cell = 1;
	}

	if(status === ''){
		selecionaLinha(DIV_TABELA_OBS, actpos, cell);
		return;
	}

	var linha = DIV_TABELA_OBS + " tr[posicao="+actpos+"] input";
	var cliente = $("#divObs").attr('cliente');
	var cl_number = objTabelaCli.registros[cliente].cl_number;

	var funcao = "funcao=grava_obs&comando="+(status=='+' ? 'insert' : 'update')+
				"&cl_number="+cl_number+
				"&co_number="+$(linha+"[name=co_number]").val()+
				"&co_linha="+encode_uri($(linha+"[name=co_linha]").val());

	swal.loading();
	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);

        if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";

			LimpaTabela(DIV_TABELA_OBS);
			$(DIV_TABELA_OBS).html(erro);
			swal('Erro ao gravar alterações da tabela',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
				title: 'Erro ao gravar',
				text: retorno.mensagem,
				type: 'error'
			}, function(){
					selecionaLinha(DIV_TABELA_OBS, actpos, cell);
				}
			);
			return;
		}

		objTabelaObs.registros[actpos].co_linha = $(linha+"[name=co_linha]").val();
		objTabelaObs.registros[actpos].co_number =retorno.co_number;

		if(status === '+'){
            setStatus(actpos, 'a', DIV_TABELA_OBS);
        }

        $("#record_obs").html(objTabelaObs.total);
		cancela_obs(cell);

		swal.close();
		if(!empty(fCustom)){
			fCustom();
		}
	});
}


//########################################################
//EXCLUI LINHA SELECIONADA NA TABELA OBSERVAÇÕES
//########################################################
function exclui_obs(){
	var actpos = $("#position_obs").val();
	var cliente = $("#divObs").attr('cliente');
    if(actpos == 'null'){
        swal('Erro de exclusão', 'É necessario selecionar uma linha', 'error');
		return;
    }

    if(getStatus(actpos, DIV_TABELA_OBS) !== ''){
		cancela_obs(2);
		return;
	}

	var cl_number = objTabelaCli.registros[cliente].cl_number;
	var co_number = objTabelaObs.registros[actpos].co_number;

	swal({
		title: "Deseja excluir da tabela a Observação: "+co_number+"?",
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

		var funcao = "funcao=deleta_obs&cl_number="+cl_number+"&co_number="+co_number;
		ajax(funcao, EXEC, function(retorno){
			retorno = json(retorno);
            if(!retorno){
                var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
                swal('Erro de exclusão',erro,'error');
                return;
            }

			if(!empty(retorno.error)){
                swal({
                        title:'Erro ao excluir',
                        text: retorno.mensagem,
                        type: 'error'
                    },
                    function(){
                        selecionaLinha(DIV_TABELA_EXAMES,actpos,2);
                    }
                );
                return;
            }

			objTabelaObs.registros.splice(actpos, 1);
            objTabelaObs.total -= 1;
            swal.close();

			pagination_obs(1, function(){
                $('#record_obs').html(objTabelaObs.total);
                if(objTabelaObs.total > 0){
                    if(actpos > 0){
                        --actpos;
                    }
                }
                selecionaLinha(DIV_TABELA_OBS, actpos, 2);
            });
		});
	});

}


//########################################################
//CANCELA AS MUDANÇAS FEITAS NA TABELA DE OBSERVAÇÕES
//########################################################
function cancela_obs(cell){
	var actpos = $("#position_obs").val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 1;
	}

	if(getStatus(actpos,DIV_TABELA_OBS) === 'a'){
		var tr = monta_linha_obs(actpos);

		$(DIV_TABELA_OBS + " tr[posicao="+actpos+"]").html(tr);

		Desbloqueia_Linhas(actpos,DIV_TABELA_OBS);

		selecionaLinha(DIV_TABELA_OBS,actpos,cell);

	}else if(getStatus(actpos,DIV_TABELA_OBS) === '+'){
		objTabelaObs.registros.splice(actpos,1);
		objTabelaObs.total -= 1;

		Desbloqueia_Linhas(actpos,DIV_TABELA_OBS);

		pagination_obs(1,function(){
			$('#record_obs').val(objTabelaObs.total);
			if(objTabelaObs.total > 0){
				if(actpos > 0){
					--actpos;
				}
				// monta_detalhes(actpos);
				selecionaLinha(DIV_TABELA_OBS,actpos,cell);
			}
		});
	}
	else if(getStatus(actpos,DIV_TABELA_OBS) === ''){
		selecionaLinha(DIV_TABELA_OBS,actpos,cell);
	}

}



//########################################################
//########################################################
			//FIM FUNÇÕES DAS OBSERVAÇÕES
//########################################################
//########################################################


























//########################################################
//########################################################
			//FUNÇÕES DOS ENDERECOS
//########################################################
//########################################################



//########################################################
//MONTA OS INPUTS NA DIV DE ENDEREÇOS
//########################################################
function monta_end(actpos){
	$(DIV_TABELA_ENDERECO).html('');
	$(DIV_TABELA_ENDERECO).html("<img src='../component/loading.gif' />");

	if(empty(actpos)){
		return;
	}

	var cl_number = objTabelaCli.registros[actpos].cl_number;
	var funcao = "cl_number="+cl_number+"&funcao=montaEnd";

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Endereços',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar Endereços',retorno.mensagem,'error');
			return;
		}

		objTabelaEnd = retorno;


		pagination_end(1);
	});
}


//########################################################
//CRIA A PAGINAÇÃO DOS ENDEREÇOS, PARA PREENCHER A CADA NOVA INTERAÇÃO COM ELA
//########################################################
function pagination_end(pagina, fCustom){
	$(DIV_TABELA_ENDERECO).html('');
	if(objTabelaEnd.total > 0){
		for(var i = 0; i < objTabelaEnd.total; i++){
			var endereco = "";
			endereco += "<div posicao=" + i + " class='float-left'>";
			endereco += monta_div_end(i);
			endereco += "</div><hr>";
			$(DIV_TABELA_ENDERECO).append(endereco);

		}

		if (!TestaAcesso('BAS.CLIENTE', 2)) {
			$(DIV_TABELA_ENDERECO + " input").addClass("inativo").prop("disabled",true);
			$(DIV_TABELA_ENDERECO + " select").addClass("inativo").prop("disabled",true);
		}
	}
	else{
		$(DIV_TABELA_ENDERECO).html('Endereço não cadastrado');
	}

	if(!empty(fCustom)){
		fCustom();
	}
}


//########################################################
//MONTA OS FILDSETS PARA CADA ENDEREÇO
//########################################################
function monta_div_end(i){
	var aux = objTabelaEnd.registros[i];
	var selecionadoB = (aux.en_tipo == 'B' ? " selected" : "");
	var selecionadoC = (aux.en_tipo == 'C' ? " selected" : "");
	var selecionadoE = (aux.en_tipo == 'E' ? " selected" : "");
	var end =  "<div  class='linha-div'>"+
			 "<label>No. End</label>"+
			 "<input type='text' class='w40 inativo' value='"+aux.en_number+"' name='en_number' readonly/>"+

			 "<label>Tipo</label>"+
			 "<select name='en_tipo'>"+
				 "<option"+selecionadoB+" value='B'>B - Cobrança</option>"+
				 "<option"+selecionadoC+" value='C'>C - Comercial</option>"+
				 "<option"+selecionadoE+" value='E'>E - Entrega</option>"+
			 "</select>"+

			 "<label>CEP</label>"+
			 "<input type='text' class='w80 uppercase' value='"+aux.en_cep+"' name='en_cep'/>"+

			 "<label>Endereco</label>"+
			 "<input type='text' class='w250 uppercase' value='"+aux.en_ender+"' name='en_ender'/>"+

			 "<label>No.</label>"+
			 "<input type='text' class='w70' value='"+aux.en_endnum+"' name='en_endnum'/>"+
		 "</div>"+
		 "<div class='linha-div'>"+

			 "<label>Compl.</label>"+
			 "<input type='text' class='w90 uppercase' value='"+aux.en_comple+"' name='en_comple'/>"+

			 "<label>Bairro</label>"+
			 "<input type='text' class='w110 uppercase' value='"+aux.en_bairro+"' name='en_bairro'/>"+

			 "<label>Cod. Munic.</label>"+
			 "<input type='text' class='w60' value='"+aux.en_muncod+"' name='en_muncod'/>"+

			 "<label>Cidade</label>"+
			 "<input type='text' class='w160 inativo uppercase' value='"+aux.en_cidade+"' readonly name='en_cidade'/>"+

			 "<label>UF</label>"+
			 "<input type='text' class='w60 inativo uppercase' value='"+aux.en_uf+"' readonly name='en_uf'/>"+
		 "</div>"+
		 "<div class='linha-div'>"+
			 "<label>Cod. País</label>"+
			 "<input type='text' class='w60' value='"+aux.en_paiscod+"' name='en_paiscod'/>"+

			 "<label>País</label>"+
			 "<input type='text' class='w120 inativo uppercase' value='"+aux.en_pais+"' readonly name='en_pais'/>"+

			 "<label>Fone</label>"+
			 "<input type='text' class='w120' value='"+aux.en_fone+"' name='en_fone'/>"+
		 "</div>";

		 return end;
}


//########################################################
//PINTA AS DIVS DE CADA ENDEREÇO
function pintaLinha_end(elemento){
	var actpos = $(elemento).attr('posicao');
	$(DIV_TABELA_ENDERECO + " div.active").removeClass('active');
	$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").addClass('active');
}


//########################################################
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere_end(){
	var cliente = $("#divEnd").attr("cliente");

		if($(DIV_TABELA_ENDERECO + " div.edicao").attr('posicao') >=0){
			$(DIV_TABELA_ENDERECO + " div.edicao input[name=en_number]").focus();
			$(DIV_TABELA_ENDERECO + " div.edicao input[name=en_number]").select();
			return;
		} else {
			if(empty(objTabelaEnd)){
				objTabelaEnd = {};
				objTabelaEnd.registros = {};
				objTabelaEnd.total = {};
			}

			var novaPosicao = {};
			novaPosicao.en_number = "";
			novaPosicao.en_ender = "";
			novaPosicao.en_bairro = "";
			novaPosicao.en_cidade = "";
			novaPosicao.en_uf = "";
			novaPosicao.en_cep = "";
			novaPosicao.en_pais = "";
			novaPosicao.en_fone = objTabelaCli.registros[cliente].cl_fone;
			novaPosicao.en_tipo = "C";
			novaPosicao.en_muncod = "";
			novaPosicao.en_paiscod = "";
			novaPosicao.en_endnum = "";
			novaPosicao.en_comple = "";

			objTabelaEnd.registros.push(novaPosicao);
			objTabelaEnd.total += 1;

			var actpos = (objTabelaEnd.total > 0 ?(objTabelaEnd.total - 1):0);
			pagination_end(1, function(){
				$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").focus();
				$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").select();

				$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr('status', '+');
				Bloqueia_Inputs(actpos, DIV_TABELA_ENDERECO);
			});
		}
}


//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao_end(elemento){
	var posicao = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaEnd.registros[posicao][campo];

	//NÃO HOUVE ALTERAÇÃO
	if($(elemento).val() == original || $(DIV_TABELA_ENDERECO).children().hasClass("edicao")){
		return;
	}


	$(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"]").removeClass('active');
	$(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"]").addClass('edicao');
	$(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"]").attr('status', 'a');

	Bloqueia_Inputs(posicao, DIV_TABELA_ENDERECO);

}


//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava_end(cell){
	var actpos = $(DIV_TABELA_ENDERECO + " div.edicao").attr('posicao');
	if(empty(actpos)){
		swal('Erro ao Gravar', 'É necessario selecionar uma linha', 'error');
		return;
	}

	var status = $(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr("status");
	if(empty(cell)){
		cell = 1;
	}

	if(status === ''){
		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").focus();
		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").select();
		return;
	}

	var linha = DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input";
	var cl_number = objTabelaCli.registros[$("#position").val()].cl_number;

	var funcao = "funcao=grava_end&comando="+(status=='+' ? "insert" : "update");
	funcao += "&cl_number="+cl_number;
	funcao += "&en_cep="+$(linha + "[name=en_cep]").val()+
				"&en_number="+$(linha + "[name=en_number]").val()+
				"&en_ender="+$(linha + "[name=en_ender]").val()+
				"&en_endnum="+$(linha + "[name=en_endnum]").val()+
				"&en_comple="+$(linha + "[name=en_comple]").val()+
				"&en_bairro="+$(linha + "[name=en_bairro]").val()+
				"&en_muncod="+$(linha + "[name=en_muncod]").val()+
				"&en_cidade="+$(linha + "[name=en_cidade]").val()+
				"&en_uf="+$(linha + "[name=en_uf]").val()+
				"&en_paiscod="+$(linha + "[name=en_paiscod]").val()+
				"&en_pais="+$(linha + "[name=en_pais]").val()+
				"&en_fone="+$(linha + "[name=en_fone]").val();

	funcao += "&en_tipo="+ $(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] select option:selected").val();

	swal.loading("Gravando Dados...");
	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);

        if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";

			$(DIV_TABELA_ENDERECO).html("");
			$(DIV_TABELA_ENDERECO).html(erro);
			swal('Erro ao gravar alterações da tabela',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
				title: 'Erro ao gravar',
				text: retorno.mensagem,
				type: 'error'
			}, function(){
				$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").focus();
				$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").select();
				}
			);
			return;
		}
			objTabelaEnd.registros[actpos].en_number = retorno.en_number;
			objTabelaEnd.registros[actpos].en_cep = $(linha + "[name=en_cep]").val();
			objTabelaEnd.registros[actpos].en_ender = $(linha + "[name=en_ender]").val();
			objTabelaEnd.registros[actpos].en_endnum = $(linha + "[name=en_endnum]").val();
			objTabelaEnd.registros[actpos].en_comple = $(linha + "[name=en_comple]").val();
			objTabelaEnd.registros[actpos].en_bairro = $(linha + "[name=en_bairro]").val();
			objTabelaEnd.registros[actpos].en_muncod = $(linha + "[name=en_muncod]").val();
			objTabelaEnd.registros[actpos].en_cidade = $(linha + "[name=en_cidade]").val();
			objTabelaEnd.registros[actpos].en_uf = $(linha + "[name=en_uf]").val();
			objTabelaEnd.registros[actpos].en_paiscod = $(linha + "[name=en_paiscod]").val();
			objTabelaEnd.registros[actpos].en_pais = $(linha + "[name=en_pais]").val();
			objTabelaEnd.registros[actpos].en_fone = $(linha + "[name=en_fone]").val();
			objTabelaEnd.registros[actpos].en_tipo = $(DIV_TABELA_ENDERECO + " select[name=en_tipo] option:selected").val();

		if(status === '+'){
            $(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr('status', 'a');
        }

		cancela_end(cell);
		swal.close();
	});

}


//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui_end(reftab){
	var actpos = $(DIV_TABELA_ENDERECO + " div.active").attr('posicao');
	if(actpos == 'null'){
        swal('Erro de exclusão', 'É necessario selecionar um Endereço', 'error');
		return;
    }

	if($(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").hasClass("edicao")){
		cancela_end(1);
		return;
	}

	var cliente = $("#position").val();
	var en_number = objTabelaEnd.registros[actpos].en_number;
	var cl_number = objTabelaCli.registros[cliente].cl_number;

	swal({
		title: "Deseja excluir o Endereço: "+en_number+"?",
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

		var funcao = "funcao=deleta_end&cl_number="+cl_number+"&en_number="+en_number;

		ajax(funcao, EXEC, function(retorno){
			retorno = json(retorno);
            if(!retorno){
                var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
                swal('Erro de exclusão',erro,'error');
                return;
            }

			if(!empty(retorno.error)){
	            swal({
	                    title:'Erro ao excluir',
	                    text: retorno.mensagem,
	                    type: 'error'
	                },
	                function(){
						selecionaLinha(DIV_TABELA, cliente, 1);
	                }
	            );
	            return;
	        }

			objTabelaEnd.registros.splice(actpos, 1);
			objTabelaEnd.total -= 1;
			swal.close();

			pagination_end(1, function(){
				if(objTabelaEnd.total > 0){
	                if(actpos > 0){
	                    --actpos;
	                }
	            }
				pintaLinha_end($(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]"));
			});
		});
	});
}


//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela_end(cell){
	var actpos = $(DIV_TABELA_ENDERECO + " div.edicao").attr('posicao');
	if(empty(actpos)){
		return;
	}

	if($(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr("status") == 'a'){
		var div = monta_div_end(actpos);

		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").html(div);

		Desbloqueia_Inputs(actpos, DIV_TABELA_ENDERECO);
		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").addClass('active');
		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr("status", "");

		//ainda da pra colocar alguma coisa
	} else if($(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr("status") == '+'){
		objTabelaEnd.registros.splice(actpos,1);
		objTabelaEnd.total -= 1;

		Desbloqueia_Inputs(actpos, DIV_TABELA_ENDERECO);

		pagination_end(1, function(){
			if(objTabelaEnd.total > 0){
				if(actpos > 0){
					--actpos;
				}
				// monta_detalhes(actpos);
			}
		});
	} else if($(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"]").attr("status") === ''){
		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").focus();
		$(DIV_TABELA_ENDERECO + " div[posicao="+actpos+"] input[name=en_number]").select();
	}
}


//########################################################
//BLOQUEIA OS INPUTS DA DIV DE ENDERECOS
//########################################################
function Bloqueia_Inputs(actpos, div){
	$(div +" div input").attr("disabled", true);
	$(div +" div select").attr("disabled", true);
	$(div + " div[posicao="+actpos+"] input").attr("disabled", false);
	$(div + " div[posicao="+actpos+"] select").attr("disabled", false);
	$(div + " div[posicao="+actpos+"]").addClass("edicao");
}


//########################################################
//DESBLOQUEIA OS INPUTS DA DIV DE ENDERECOS
//########################################################
function Desbloqueia_Inputs(actpos, div){
	$(div + " div input").attr("disabled", false);
	$(div + " div select").attr("disabled", false);
	$(div + " div input.inativo").attr("readonly", true);
	$(div + " div[posicao="+actpos+"]").removeClass('edicao');
}


//########################################################
//REALIZA A BUSCA DE CPF PARA TRAZER A CIDADE ESTADO E PAIS
//########################################################
function buscaCep(cep){
	var posicao = $(cep.parent().parent()).attr('posicao');
	var original = objTabelaEnd.registros[posicao].en_cep;

	if($(cep).val() == original){
		return;
	}

	var linha = DIV_TABELA_ENDERECO + " div[posicao="+posicao+"] input";
	var funcao = "funcao=buscaCep&cep="+$(cep).val();
	swal.loading("Buscando informações...");

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			swal('Erro',"Ocorreu um erro ao receber as informações. Tente novamente!",'error');
			return;
		}

		if(!empty(retorno.error)){
			$(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"] input[name=en_cep]").focus();
			$(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"] input[name=en_cep]").select();
			swal('Erro ao buscar cep',retorno.mensagem,'error');
			return;
		}

		$(linha + "[name=en_ender]").val(retorno.en_ender);
		$(linha + "[name=en_bairro]").val(retorno.en_bairro);
		$(linha + "[name=en_cidade]").val(retorno.en_cidade);
		$(linha + "[name=en_uf]").val(retorno.en_uf);
		$(linha + "[name=en_muncod]").val(retorno.en_muncod);
		$(linha + "[name=en_pais]").val("Brasil");
		$(linha + "[name=en_paiscod]").val("1058");
		swal.close();

		var beterrrabda = $(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"]").attr('status');

		if(empty($(DIV_TABELA_ENDERECO + " div[posicao="+posicao+"]").attr('status'))){
			edicao_end($(cep));
		}
	});
}


//--! ABRINDO CONSULTAS PAIS --//
function buscaPais(elemento){
	var texto = $(elemento).val();
	var naopesquisa = false;
    if (texto.trim() === ''){
        naopesquisa = true;
    }

    if (texto == $(elemento).attr('en_paiscod')){
        return;
    }

    swal.loading('Pesquisando País');
    fechaSwalCli();
    var ord = '1';
    cnsPais_abre(texto.trim(), 'box-inc-pais', ord, naopesquisa);
}

function fechaSwalCli(){
    if($('#box-inc-pais').hasClass('active') || $(DIV_TABELA_ENDERECO + " input[name=en_paiscod]").attr('en_paiscod') !== ''){
        swal.close();
    }else{
        setTimeout(function(){
            fechaSwalCli();
        },400);
    }
}

function cnsPais_retorno() {
	var aux = DIV_TABELA_ENDERECO + " div.active";

    $(aux + " input[name=en_paiscod]").attr('en_paiscod', objpais.codigo);
	$(aux + " input[name=en_paiscod]").val(objpais.codigo);
    $(aux + " input[name=en_pais]").val(objpais.pais.substring(0,12));
}
//--! ABRINDO CONSULTAS PAIS --//

//--! ABRINDO CONSULTAS MUNICIPIO --//
function buscaMunicipio(elemento){
	var texto = $(elemento).val();
	var naopesquisa = false;
    if (texto.trim() === ''){
        naopesquisa = true;
    }

    if (texto == $(elemento).attr('en_muncod')){
        return;
    }

    swal.loading('Pesquisando Municipio');
    fechaSwalCli();
    var ord = '0';
    cnsMuni_abre(texto.trim(), 'box-inc-muni', ord, naopesquisa);
}

function fechaSwalCli(){
    if($('#box-inc-muni').hasClass('active') || $(DIV_TABELA_ENDERECO + " input[name=en_muncod]").attr('en_muncod') !== ''){
        swal.close();
    }else{
        setTimeout(function(){
            fechaSwalCli();
        },400);
    }
}

function cnsMuni_retorno() {
	var aux = DIV_TABELA_ENDERECO + " div.active";

    $(aux + " input[name=en_muncod]").attr('en_muncod', objmuni.codigo);

	$(aux + " input[name=en_muncod]").val(objmuni.codigo);
	$(aux + " input[name=en_cidade]").val(objmuni.municipio);
    $(aux + " input[name=en_uf]").val(objmuni.uf);
}
//--! ABRINDO CONSULTAS MUNICIPIO --//


//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function etiqueta_cliente(){
	var actpos = $('#position').val();
	if(empty(actpos)){
        swal('', 'É necessario selecionar um Cliente', 'warning');
		return;
    }

	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		grava(0,'',function(){
			etiqueta_cliente();
		});
		return;
	}

	var cl_number = objTabelaCli.registros[actpos].cl_number;

    window.open('Etq.ClieFornec.Clientes.Layout.php?&status="A"&margem=Todas&grupo=Todos&uf=Todas&cidade=Todas&todosEnderecos=false&colPag=2&ordem=0&iCli=' + cl_number);

}



//########################################################
//########################################################
			//FIM FUNÇÕES DOS ENDERECOS
//########################################################
//########################################################
















//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################

$(document).ready(function(){
	loading.show();

	if(!validaVersao("10.05",true)){
			$("#linhaNatops").hide();
	}


	$(DIV_TABELA_DETALHES + " input[name=cl_natureza]").mask('9.999');
	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		// VERIFICA SE TEM ALGUMA CONSULTA EM ABERTO
		if(!verificaDimmerConsultaActive()){
            $('#search').focus();

		}
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search, #compra')
		.on("keyup",function(e){
			var actpos = Number($("#position").val());
			switch (e.which) {
				case 40: //PARA BAIXO
					if (actpos >= 0) {
						selecionaLinha(DIV_TABELA, actpos, 2);
					}
				break;

				case 13:
					monta_query();
				break;
			}
		})
		.focus(function(e){
			$(this).select();
		});

	$('#ckFiltroCompra').on('click',function(){
		$("#compra").val("").prop('disabled',true);
		if($('#ckFiltroCompra').is(':checked')){
			$("#compra").val("").prop('disabled',false).select();
		}
	});

	$("#compra").on('keypress', function(e){
		return somenteNumero(event, false, false, this);
	});












	//########################################################
	//ALTERA A COR DA LINHA QUANDO UM INPUT É SELECIONADO
	//SELECIONA O TEXTO INTEIRO NO CLICK TABELA PRINCIPAL
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());

		if(!$(this).parent().hasClass("inativo")){
			switch ($(this).attr("name")) {
				case "cl_grupo": case "cl_grupofin": case "cl_ativo":
					ComboLinha($(this));
				break;
				default:
					$(this).select();
				break;
			}
		}
	});

	//########################################################
	//MUDA O COMBO PARA INPUT AO PERDER O FOCO DO COMBO
	//########################################################
	$(DIV_TABELA).on('blur', 'select[name=cl_grupo], select[name=cl_grupofin], select[name=cl_ativo]', function(){
		TiraComboLinha($(this));
	});

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA
	//########################################################
	$(DIV_TABELA).on("keypress keyup change", 'input',function(e){
		var actpos = Number($("#position").val()),
			cell = $(this).parent().index(),
			ao_terminar = "";

		if(e.type == "change"){
			edicao($(this));
		}
		if(e.type == "keyup"){
			switch (e.which) {
				case 38: //PARA CIMA
					edicao($(this));

					ao_terminar = function() {
						if (actpos > 0) {
							selecionaLinha(DIV_TABELA,--actpos,cell);
						}
						else if(actpos === 0){
		                    $("#search").select();
		                }
					};

					if(!Verifica_Alteracao(DIV_TABELA)){
						grava(cell, null, function() { ao_terminar(); });
						return;
					}

					ao_terminar();

				break;

				case 40://PARA BAIXO
					edicao($(this));

					ao_terminar = function() {
						if (actpos+1 < $("#record").val()){
							selecionaLinha(DIV_TABELA,++actpos,cell);
						}else{
							insere();
						}
					};

					if(!Verifica_Alteracao(DIV_TABELA)){
						grava(cell, null, function() { ao_terminar(); });
						return;
					}

					ao_terminar();
				break;

				case 27://ESC
					edicao($(this));
					cancela(cell);
				break;
			
			case 45://INSERT
					if(Verifica_Alteracao(DIV_TABELA)){
						insere();
					}
				break;
			}			
		}
		if(e.type === 'keypress'){
			switch (e.which) {
				case 13://ENTER
					edicao($(this));
					grava(cell);
				break;
			}
		}
	});




















	$(DIV_TABELA_DETALHES).on('change', 'input[type=text]:not(.inativo), input[type=date]:not(.inativo), select:not(.inativo)', function(){
		if ($(this).hasClass('number')) {
			notnull($(this));
		}
		edicao($(this));
	});

	$(DIV_TABELA_DETALHES).on('keypress', 'input[type=text]:not(.inativo).number, input[name=cl_restricao]', function(e){
		switch ($(this).attr("name")){
			case "cl_restricao":
				return somenteNumero(event, false, false, this);
			case "cl_limite":
				return somenteNumero(event, false, true, this);
			default:
				return somenteNumero(event, true, false, this);
		}
	});

	//########################################################
	//ATUALIZA VALOR DO CHECKED AO SER CLICADO
	//FAZ A VERIFICAÇÃO PARA SABER SE OS CHECKBOX ESTÃO MARCADOS OU NÃO
	//########################################################
	$(DIV_TABELA_DETALHES + " .ui.checkbox").checkbox({
		onChange: function() {
			var value = "",
				$checkbox = $(this).parent();
			switch ($(this).attr('name')) {
				case 'cl_consumo':
					value = $checkbox.checkbox('is checked') ? "1" : "0";
				break;
				default:
					value = $checkbox.checkbox('is checked') ? "T" : "F";
				break;
			}

			$(this).val(value);
			edicao($(this));
    	}
    });


	//########################################################
	//SELECIONA O TEXTO INTEIRO NO CLICK DIV DE DETALHES
	//########################################################
	$(DIV_TABELA_DETALHES).on("click", 'input', function(){
		$(this).select();
	});

	$(DIV_TABELA_DETALHES + ' select[name=cl_pessoa]').on('change', function(){
		if($(DIV_TABELA_DETALHES + " input[name=cl_iest]").val() === ""){//SOMENTE FAZ OS TESTES PARA ALTERAR SE O CAMPO ESTIVER VAZIO
			switch ($(DIV_TABELA_DETALHES + " select[name=cl_pessoa]").val()) {
				case "F"://FISICO
				$(DIV_TABELA_DETALHES + " input[name=cl_iest]").val('ISENTO');
				break;
				case "J"://JURIDICO
				$(DIV_TABELA_DETALHES + " input[name=cl_iest]").val('');
				break;
				default:
				$(DIV_TABELA_DETALHES + " input[name=cl_iest]").val('');
				break;
			}
		}
	});

	//########################################################
	//########################################################
	$(DIV_TABELA_DETALHES).on('focus', 'input[name=cl_cgc]', function(){
		var cl_cgc = $(DIV_TABELA_DETALHES + ' input[name=cl_cgc]');
		switch ($(DIV_TABELA_DETALHES + " select[name=cl_pessoa]").val()) {
			case "F":
				cl_cgc.mask('999.999.999-99');
			break;
			case "J":
				cl_cgc.mask('99.999.999/9999-99');
			break;
			default:
				cl_cgc.unmask();
			break;
		}
	});

	//########################################################
	//ABRE O SWEET ALERT COM A TABELA DE REPRESENTANTES
	//########################################################
	$(DIV_TABELA_DETALHES).on("blur", 'input[name=vd_nome]', function(){
		mostraRepresentante();
	});

	$("#representante").on("click", function(){
		mostraRepresentante(false);
	});

	//########################################################
	//ABRE O INCLUDE DE TRANSPORTADORA
	//########################################################
	$(DIV_TABELA_DETALHES).on("blur", 'input[name=tr_nome]', function(){
		buscaTransportadora();
	});

	$("#transportadora").on("click", function(){
		buscaTransportadora();
	});

	$(DIV_TABELA_DETALHES).on('keyup', 'input[type=text], input[type=date]', function(e){
		var extra = $(this).attr('name');
		switch (e.which) {
			case 27://ESC
				$(this).blur();

				if(!Verifica_Alteracao(DIV_TABELA)){
					switch ($(this).attr("name")) {
						case "vd_nome":
							mostraRepresentante(true,'esc');
						return;
						case "tr_nome":
							buscaTransportadora('esc');
						return;
					}
				}

				cancela(0,extra);
			break;

			case 13://ENTER
				$(this).blur();

				if(!Verifica_Alteracao(DIV_TABELA)){
					switch ($(this).attr("name")) {
						case "vd_nome":
							mostraRepresentante(true,'enter');
						return;
						case "tr_nome":
							buscaTransportadora('enter');
						return;
					}
				}

				grava(0,extra);
			break;
		}
	});

















	//########################################################
	//ABRE E FECHA A FILDSET DE OBSERVAÇÕES
	//########################################################
	$("#legenda_obs").on('click', function(){
		if(empty(objTabelaCli.total) || objTabelaCli.total <= 0){
			$("#search").select();
			return;
		}
		if($('#divObs').is(':hidden')){
			$('#divObs').show();
			if(!empty($.trim($(DIV_TABELA).html())) && !empty($.trim($('#position').val()))){
				$("#divObs").attr('Cliente',$('#position').val());
				monta_obs($('#position').val());
			}
		}
		else{
			$('#divObs').hide();
		}
	});

	//########################################################
	//TABELA DE OBSERVAÇÕES
	//########################################################
	$(DIV_TABELA_OBS).on("focus", 'input',function(){
		pintaLinha_Obs($(this).parent().parent());
		if (!$(this).parent().hasClass("inativo")) {
            $(this).select();
        }
	});

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA_OBS
	//########################################################
	$(DIV_TABELA_OBS).on("keypress keyup change", 'input',function(e){
		var actpos = Number($("#position_obs").val()),
			cell = $(this).parent().index(),
			ao_terminar = "";

		if(e.type == "change"){
			edicao_obs($(this));
		}
		if(e.type == "keyup"){
			switch (e.which) {
				case 38: //PARA CIMA
					edicao_obs($(this));

					ao_terminar = function() {
						if (actpos > 0) {
							selecionaLinha(DIV_TABELA_OBS,--actpos,cell);
						}
						selecionaLinha(DIV_TABELA_OBS,actpos,cell);
					};

					if(!Verifica_Alteracao(DIV_TABELA_OBS)){
						grava_obs(cell, function() { ao_terminar(); });
						return;
					}

					ao_terminar();
				break;

				case 40://PARA BAIXO
					edicao_obs($(this));

					ao_terminar = function() {
						if (actpos+1 < $("#record_obs").val()){
							selecionaLinha(DIV_TABELA_OBS,++actpos,cell);
						}else{
							insere_obs();
						}
					};

					if(!Verifica_Alteracao(DIV_TABELA_OBS)){
						grava_obs(cell, function() { ao_terminar(); });
						return;
					}

					ao_terminar();
				break;

				case 27://ESC
					edicao_obs($(this));
					cancela_obs(cell);
				break;
			}
		}
		if(e.type === 'keypress'){
			switch (e.which) {
				case 13://ENTER
					edicao_obs($(this));
					grava_obs(cell);
				break;
			}
		}
	});



	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA_ENDERECO
	//########################################################
	$(DIV_TABELA_ENDERECO).on("keyup", 'input', function(e){
		var cell = $(this).parent().index();
		switch (e.which) {
			case 13://ENTER
				grava_end(cell);
			break;
		}
	});








	$(DIV_TABELA_ENDERECO).on('change', 'input', function(){
		if($(this).attr('name') == 'en_cep'){
			buscaCep($(this));
		} else {
			edicao_end($(this));
		}
	});

	$(DIV_TABELA_ENDERECO).on('change', 'select', function(){
		edicao_end($(this));
	});








	//########################################################
	//PADRÃO DE CLICKS DOS INPUTS
	$("#obs_insere").on("click", function(){
		insere_obs();
	});

	$("#obs_deleta").on("click", function(){
		exclui_obs();
	});

	$("#obs_grava").on("click", function(){
		grava_obs();
	});

	$("#obs_cancela").on("click", function(){
		cancela_obs();
	});

	$("#obs_atualiza").on("click", function(){
		var actpos = $("#position").val();
		monta_obs(actpos);
	});

	//########################################################

	//########################################################
	//PADRÃO DE CLICKS DOS INPUTS
	$("#pesquisar").on("click", function(){
		monta_query();
	});

	$("#insere").on("click", function(){
		insere();
	});

	$("#deleta").on("click", function(){
		exclui();
	});

	$("#grava").on("click", function(){
		grava();
	});

	$("#cancela").on("click", function(){
		cancela();
	});



	$("#pagto").on("click", function(){
		roboCob();
	});

	//########################################################

	//########################################################
	//PADRÃO DE CLICKS DOS INPUTS
	$("#end_atualiza").on("click", function(){
		var actpos = $("#position").val();
		monta_end(actpos);
	});
	$("#end_insere").on("click", function(){
		insere_end();
	});
	$("#end_deleta").on("click", function(){
		exclui_end();
	});
	$("#end_grava").on("click", function(){
		grava_end();
	});
	$("#end_cancela").on("click", function(){
		cancela_end();
	});

	//########################################################

	//########################################################
	//PADRÃO DE CLICKS DOS INPUTS
	$("#status").on("click", function(){
		editar("status");
	});

	$("#grupo").on("click", function(){
		editar("grupo");
	});

	$(".pendencia").on("click", function(){
		editar("p");
	});

	$(".cifra").on("click", function(){
		editar("h");
	});

	$(".boleto").on("click", function(){
		editar("r");
	});

	$(".insere_fornec").on("click", function(){
		editar("f");
	});

	$(".somas").on("click", function(){
		editar("s");
	});

	$(".agenda").on("click", function(){
		editar("a");
	});

	$("#btnGfin").on("click", function(){
		editar("g");
	});

	$("#btnSenha").on("click", function(){
		editar("trocasenha");
	});

	$("#btnFator").on("click", function(){
		editar_detalhes("fator");
	});

	$("#btnFideliz").on("click", function(){
		editar_detalhes("fidelizacao");
	});

	$("#btnCredito").on("click", function(){
		editar_detalhes("credito");
	});

	$("#btnCNPJ").on("click", function(){
		editar_detalhes("cnpj");
	});

	$("#btnIE").on("click", function(){
		editar_detalhes("ie");
	});

	$("#btnCurva").on("click", function(){
		editar_detalhes("curva");
	});
	//########################################################


	//########################################################
	//EDICAO PARA A PROCEDURE zCliDivs
	//########################################################
	$("#btnZCredito").on("click", function(){
		editaFator("z");
	});

	$("#btnFator").on("click", function(){
		editaFator("f");
	});

	$("#btnCredito").on("click", function(){
		editaFator("l");
	});












	//-- DIVS DE ENDEREÇOS --//
	$(DIV_TABELA_ENDERECO).on("focus", 'input, select',function(){
		pintaLinha_end($(this).parent().parent());
	});
	//########################################################








	//########################################################
	//ABRE E FECHA A FILDSET DE ENDEREÇOS
	$("#legenda_enderecos").on('click', function(){
		if(empty(objTabelaCli.total) || objTabelaCli.total <= 0){
			$("#search").select();
			return;
		}
		if($('#divEnd').is(':hidden')){
			$('#divEnd').show();
			if(!empty($.trim($(DIV_TABELA).html())) && !empty($.trim($('#position').val())) ){
				$("#divEnd").attr('Cliente',$('#position').val());
				monta_end($('#position').val());
			} else {
				$("#divEnd").attr('Cliente','0');
				// monta_end($('#position').val());
			}
		}
		else{
			$('#divEnd').hide();
		}
	});
	//########################################################










	//########################################################
	//SELECIONA O TEXTO INTEIRO NO CLICK DIV DE ENDERECOS
	$(DIV_TABELA_ENDERECO).on("click", 'input', function(){
		$(this).select();
	});
	//########################################################





	//########################################################
	//ABRE O INCLUDE DE EMAIL
	//########################################################
	$('#btnEmai').on("click", function(){
		buscaEmail(this);
	});
	//########################################################



	//########################################################
	//ABRE O INCLUDE DE PAIS
	//########################################################
	$(DIV_TABELA_ENDERECO).on("change", 'input[name=en_paiscod]', function(){
		if($("#position").val() !== null){
			buscaPais(this);
		}
	});
	//########################################################

	//########################################################
	//ABRE O INCLUDE DE MUNICIPIO
	//########################################################
	$(DIV_TABELA_ENDERECO).on("change", 'input[name=en_muncod]', function(){
		if($("#position").val() !== null){
			buscaMunicipio(this);
		}
	});



	$("#maisfiltros").on("click", function(){
		if($("#divfiltros").hasClass("hide")){
			$("#divfiltros").removeClass("hide");
		}else{
			$('#divfiltros .ui.dropdown').dropdown("set selected","%"); //#cbGfin,#cbMargem
			$("#divfiltros").addClass("hide");
		}
	});

	//########################################################
	//DEIXA O USUARIO ARRASTAR A DIV
	//########################################################
	$( "#box-inc-trans, #box-inc-muni, #box-inc-pais").draggable({ cursor: "move", handle: ".box-consulta-titulo" });
});
