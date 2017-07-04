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
//OBJETO DA TABELA MOVIMENTO
var objTabelaCest = {};
//########################################################


//########################################################
//LIMITE DE REGISTROS
var LIMITE_REGISTROS = 80;
//########################################################

//########################################################
//LOCAL DO EXEC
var EXEC = '../consulta/Cest.Cns.Exec.php';
//########################################################


//########################################################
//TABELAS USADAS
var DIV_TABELA = '#dadosCest';
//########################################################

//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################






















//########################################################
//########################################################
			//FUNÇÕES DA TABELA CEST
//########################################################
//########################################################




//########################################################
//LIBERA ACESSO
//########################################################
// function liberaAcesso(){//chamada pela funcao safety() esta na Icarus.Library.js
// 	if (!TestaAcesso('EST.MOVIMENTO')){
// 		swal({
// 				title:"Atenção",
// 				text:"Você não possuí acesso a essa tela, ela será fechada!\nNome do acesso necessário: EST.MOVIMENTO",
// 				type: "warning"
// 			},
// 			function(){
// 				var win = window.open("","_self");
// 				win.close();
// 			}
// 		);
// 		return;
// 	}
// 	else if (!TestaAcesso('EST.MOVIMENTO',2)){
// 		$(".insere").attr("disabled",'disabled');
// 		$(".grava").attr("disabled",'disabled');
// 		$(".cancela").attr("disabled",'disabled');
// 		$(".localiza").attr("disabled",'disabled');
// 		$(".armazem").attr("disabled",'disabled');
// 		$(".corrige-estoque").attr("disabled",'disabled');
// 		$(".ajusta-item").attr("disabled",'disabled');
// 		$(".transfere-movimento").attr("disabled",'disabled');
// 		$(".impressora ").attr("disabled",'disabled');
// 		$(".altera-lote ").attr("disabled",'disabled');
// 	}
// 	getCombos();
// }


//########################################################

//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function monta_query(){
	if($("#search").is( ":focus" )){
		$('#search').blur(); //para tirar o foco da pesquisa
	}

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	swal.loading('Carregando dados...');

	//REQUISIÇÃO AJAX
	var funcao = "busca=" + $("#cbOrdem").val() +
				"&texto=" + $("#search").val() +
				"&funcao=monta";

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar tabela de CEST',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela CEST',retorno.mensagem,'error');
			return;
		}

		if(retorno.total === 0){
			swal('Nenhum resultado encontrado','Redefina a busca','warning');
			return;
		}

		$('#record').val(retorno.total);
		objTabelaCest = retorno;
		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
	});
}

//########################################################

//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas(paginaAtual,totalDePaginas){
	$('#pagination').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? (paginaAtual + links) : totalDePaginas);

	if(paginaAtual > (links + 1)){
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination').append("<span onclick='pagination(" + 1 + ");'>" + 1 + "</span>");
		$('#pagination').append("<span class='no-border'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination').append("<span class='active'>" + i + "</span>");
		}else{
			//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
			$('#pagination').append("<span onclick='pagination(" + i + ");'>" + i + "</span>");
		}
	}
	if(paginaAtual < (totalDePaginas - links)){
		$('#pagination').append("<span class='no-border'>...</span>");
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination').append("<span onclick='pagination(" + totalDePaginas + ");'>" + totalDePaginas + "</span>");
	}
}

//########################################################

//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(paginaAtual,fCustom){
	var totalDePaginas = Math.ceil(objTabelaCest.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objTabelaCest.total)
		fim = objTabelaCest.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas(paginaAtual,totalDePaginas);

	//RESETA A POSICAO
	$('#position').val("null");

	//RESETA TOTAL
	$('#records').val(objTabelaCest.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabelaCest.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += Cest_linha(i);
			tabela += "</tr>";
			$(DIV_TABELA).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaCest.total > 0 && empty(fCustom)){
		pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
		//VOLTA O SCROLL PRA CIMA
		$(DIV_TABELA).animate({ scrollTop: "=0" }, "fast");

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

	swal.close();
}

//########################################################

//########################################################
//MONTA LINHAS
//########################################################
function Cest_linha(i){
	var aux = objTabelaCest.registros[i];
	var titleDesc = (aux.ce_descr.length > 112 ? aux.ce_descr : '');


	var table = ""+
		"<td class='w100'> <input readonly value='"+ aux.ce_cest +"' />  </td>"+
		"<td class='w100'> <input readonly value='"+ aux.ce_ncm +"' />  </td>" +
		"<td class='w570 last'> <input readonly value='"+ (aux.ce_descr.length > 112 ? (aux.ce_descr.substring(0,109)+'...') : aux.ce_descr) +"' title='"+titleDesc+"' />  </td>"+
	"";

	return table;
}

//########################################################

//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position').val(actpos);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');
}


//########################################################
//########################################################
			//FIM FUNÇÕES DA TABELA CEST
//########################################################
//########################################################




































//########################################################
//########################################################
		//PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################

//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function(){
	$('#search').focus(); //FOCO NO CAMPO DE BUSCA

	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		$('#search').focus();
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search').keypress(function(e){
		if(e.which == 13)
			monta_query();
	});

	//########################################################
	//RESETA PARAMETROS AO TROCAR A ORDEM DO COMBO
	//########################################################
	$('#cbOrdem').on("change",function(){
		$('#search').val('');
		$('#search').select();
	});

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA
	//########################################################
	$(DIV_TABELA).on("keyup", 'input',function(e){
		var actpos = $("#position").val();
		var cell = $(this).parent().index();
		switch (e.which) {
			case 38: //PARA CIMA
				if(actpos > 0){
					selecionaLinha(DIV_TABELA,--actpos,cell);
				}
			break;

			case 40://PARA BAIXO
				if (Number(actpos)+1 < $("#record").val()){
					selecionaLinha(DIV_TABELA,++actpos,cell);
				}
			break;
		}
	});

	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - PESQUISA APLICAÇÃO
	//########################################################
	$("#search").on('click', function(){
		$(this).select();
	});

	//########################################################
	//KEYPRESS SÓ PERMITE NÚMEROS NO CAMPO DE BUSCA PARA DEST E NCM
	//########################################################
	$("#search").on("keypress",function(e){
		if($("#cbOrdem option[value=2]").is(':not(:checked)')){
			return somenteNumero(e,false,false,this);
		}
	});

	//########################################################
	//MASCARA DA CEST
	//########################################################
	$("#search").on("keyup",function(e){
		if($("#cbOrdem option[value=0]").is(':checked')){
			if($("#search").val().length > 2 && $("#search").val().substring(2,3) != '.'){
				var aux = $("#search").val();
				$("#search").val(aux.substring(0,2) + '.' + aux.substring(2));
			}
			if($("#search").val().length > 6 && $("#search").val().substring(6,7) != '.'){
				var aux = $("#search").val();
				$("#search").val(aux.substring(0,6) + '.' + aux.substring(6));
			}
		}
	});

});

//########################################################
//########################################################
//FIM PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################
