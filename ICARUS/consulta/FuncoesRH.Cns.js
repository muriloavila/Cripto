//########################################################
//########################################################
			//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################


//########################################################
//VERSÃO DA TELA
//########################################################
var CNSRH_RELEASE = '0.001';


//########################################################
//LOCAL DO EXEC
//########################################################
var CNSRH_EXEC = '../consulta/FuncoesRH.Cns.Exec.php';


//########################################################
var	objTabelaFuncRH = {},
	CNSRH_LIMITE_REGISTROS = 40,
	CNSRH_SAFETY = false;


$CNSRHdimmer = ativaDimmerConsulta("box-inc-funcao",
    function(){
		$('#'+objFuncRH.divDaConsulta).addClass('active');
		$('#cnsRH_pesquisa').focus();
    },
    function(){
        $('#'+objFuncRH.divDaConsulta).removeClass('active');
    }
);

//########################################################
//Objeto da consulta
//########################################################
var objFuncRH = {};
	objFuncRH.divDaConsulta = '';

//########################################################
//ATRIBUTOS
//########################################################
	objFuncRH.codigo = '';
	objFuncRHcbo = '';
	objFuncRH.descricao = '';
	objFuncRH.salario = '';

//########################################################
//fim do objFuncRH
//########################################################


//########################################################
//ABRE A CONSULTA E REALIZA A PESQUISA COM O PARAMTRO PASSA PRA FUNCAO
//########################################################
function cnsRH_abre(texto,divDaConsulta,ordem,naoPesquisa){
	if(!CNSRH_SAFETY){
		cnsRH_safety(function(){ cnsRH_abre(texto,divDaConsulta,ordem,naoPesquisa); },true,true);
		return;
	}

	//COLOCA NO OBEJTO A DIV ONDE A CONSULTA FOI INSERIDA
	objFuncRH.divDaConsulta = divDaConsulta;

	//ALTERA ORDEM DO COMBO DE PESQUISA
	if(!empty(ordem)){
		$('#cnsRH_ordem').parent().dropdown("set selected",ordem);
	}

	//COLOCA NO CAMPO DE PESQUISA DA CONSULTA OQUE FOI PESQUISADO
	get('cnsRH_pesquisa').value = texto.trim();

	if(naoPesquisa !== undefined && naoPesquisa === true){
		$CNSRHdimmer.dimmer("consulta show");
	}else{
		//MONTA A QUERY
		cnsRH_montaQuery();
	}
}

function cnsRH_fecha(preencheLinha){
	//A CONSULTA NAO ESTA INCLUIDA EM UMA OUTRA TELA
	if(objFuncRH.divDaConsulta === '' || objFuncRH.divDaConsulta === undefined)
		return;
		// VOU FECHAR A CONSULTA SEM TER QUE PREENCHER AS LINHAS
	if(!preencheLinha){
		$CNSRHdimmer.dimmer("consulta hide");
        try{cnsRH_fecha2();
        }catch(e){}
        return;
	}

	var posicao = get('cnsRH_position').value;
	var divDaConsulta = objFuncRH.divDaConsulta; //conteudo do objeto

	for(var i in objTabelaFuncRH.registros[posicao]){
		objFuncRH[i] = objTabelaFuncRH.registros[posicao][i];
	}
	
    $CNSRHdimmer.dimmer("consulta hide");
    cnsRHFunc_retorno();
}

/* FUNCAO QUE VALIDA O ACESSO */
function cnsRH_safety(fCustom, dontclose){
	safety(CNSRH_EXEC, function(){ cnsRh_liberaAcesso(fCustom, dontclose); }, CNSRH_RELEASE);
}


//########################################################
//LIBERA ACESSOS
//########################################################
function cnsRh_liberaAcesso(fCustom, dontclose){
	if (!TestaAcesso('RH.FUNCAO')) { //usuario sem acesso fecha janela
		swal({
				title: "Atenção",
				text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
					  "Nome do acesso necessário: RH.FUNCAO",
				type: "warning",
				html: true,
			},
			function() {
				if(empty(dontclose)){
					var win = window.open("", "_self");
					win.close();
				}
			}
		);
		return;
	}
	$("#cnsRH_pesquisa").focus();

	$('#cnsRH_ordem.ui.dropdown').dropdown();
	//########################################################
	//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
	//########################################################
	$('#cnsRH_ordem').parent().dropdown({
		onChange: function(value,text,itemlista) {
			$("#cnsRH_pesquisa").val('').focus();
		}
	});

	CNSRH_SAFETY = true;
	swal.close();
	if(!empty(fCustom)){
		fCustom();
	}
}


/* REALIZA PESQUISA AO PRESSIONAR O BOTÃO ENTER */
function cnsRH_pesquisa(ref){
	if (event.keyCode==13){
		 cnsRH_montaQuery();
	}
}



/* REALIZA A PESQUISA NO BANCO */
function cnsRH_montaQuery(){
	get('cnsRH_pesquisa').blur(); //para tirar o foco da pesquisa
	//AMPULHETA
	swal.loading();
	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela('#cnsRH_dados');


	//REQUISIÇÃO AJAX
	var funcao = encodeURI("order=" + get("cnsRH_ordem").value +
						"&texto=" + get("cnsRH_pesquisa").value +
						"&funcao=monta");

	ajax(funcao,'../consulta/FuncoesRH.Cns.Exec.php',function(retorno){
		LimpaTabela('#cnsRH_dados');
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar tabela de Funções do RH',erro,'error');
			return;
		}

		//ERRO
		if(retorno.error !== undefined && retorno.error === true){
			swal('Erro ao buscar informaões',retorno.mensagem,'error');
			return;
		}
		swal.close();
		$('#cnsRH_record').val(retorno.total);
		objTabelaFuncRH = retorno;
		//A CONSULTA NAO ESTA INCLUIDA EM UMA OUTRA TELA
		if(objFuncRH.divDaConsulta === '' || objFuncRH.divDaConsulta === undefined){
			//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
			cnsRH_pagination(1);
			return;
		}

		//ainda não abriu a consulta
		if(!$('#'+objFuncRH.divDaConsulta).hasClass('active')){
			//retornou so um registro
			if(objTabelaFuncRH.total == 1) {
				$('#cnsRH_position').val('0');
				cnsRH_fecha(true);
				return;
			}

			$CNSRHdimmer.dimmer("consulta show");
		}

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		cnsRH_pagination(1);
	});

}


//MONTA OS INDICES DE PAGINA EM BAIXO DA TABELA
function cnsRH_montaPaginacao(paginaAtual){
	//MONTA AS PAGINAS
	var total = Math.ceil(objTabelaFuncRH.total / CNSRH_LIMITE_REGISTROS);

	if(total == 1){
		$('#cnsRH_pagination span').hide();
		return;
	}

	$('#cnsRH_pagination').html("");


	var links = 4;
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < total ? ((paginaAtual + links)+1) : total);


	if(paginaAtual >= (links + 2)){
		$('#cnsRH_pagination').append("<span onclick='cnsRH_pagination(" + 1 + ");' class='cor_padraoInvert_hover'>" + 1 + "</span>");
		$('#cnsRH_pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#cnsRH_pagination').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			$('#cnsRH_pagination').append("<span onclick='cnsRH_pagination(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}
	if(paginaAtual <= (total - (links + 2))){
		$('#cnsRH_pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		$('#cnsRH_pagination').append("<span onclick='cnsRH_pagination(" + total + ");' class='cor_padraoInvert_hover'>" + total + "</span>");
	}
}

//TROCA A PAGINA QUE ESTA SENDO EXIBIDA ATUALMENTE
function cnsRH_pagination(pagina){
	var table = '';
	var fim = pagina * CNSRH_LIMITE_REGISTROS;
	if(fim > objTabelaFuncRH.total)
		fim = objTabelaFuncRH.total;

	var inicio = ((pagina - 1) * CNSRH_LIMITE_REGISTROS);

	cnsRH_montaPaginacao(pagina);


	$('#cnsRH_position').val("null");

	LimpaTabela('#cnsRH_dados');
	if(objTabelaFuncRH.total > 0){
		for(var i = inicio; i < fim; i++){
			table = "<tr posicao='" + i + "'>"+ cnsRH_linha(i) + "</tr>";
			$('#cnsRH_dados').append(table);
		}
	}

	if(objTabelaFuncRH.total == 1){
		cnsRH_selecao($('#cnsRH_dados tr[posicao=0]'));
		cnsRH_fecha(true);
	}
	else if(objTabelaFuncRH.total > 0){
		cnsRH_selecao($('#cnsRH_dados tr:eq(0)'));
		selecionaLinha('#cnsRH_dados', 0, 2);
		$('#cnsRH_dados').animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
	}else{
		$('#cnsRH_pesquisa').focus();
	}

	$("#cnsRH_dados").mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});

}

//RETORNA UMA LINHA COMPLETA DA TABELA - PEGANDO OS DADOS DA POSICAO i DO JSON COM AS INFORMACOES
function cnsRH_linha(i){
	var aux = objTabelaFuncRH.registros[i];
    var table = "" +
	"<td class='w90 bg blue-light'><input type='text' value='"+aux.codigo+"' readonly/></td>"+
	"<td class='w350 inativo'><input type='text' value='"+aux.descricao+"' readonly/></td>"+
	"<td class='w80 inativo'><input type='text' value='"+aux.cbo+"' readonly/></td>"+
	"<td class='w110 number inativo'><input type='text' value='"+aux.salario+"' readonly/></td>";
	return table;
}





function cnsRH_selecao(ref){
	if($(ref).parent().parent().hasClass('active'))
		return;
	var posicao = $(ref).parent().parent().attr('posicao');
	$('#cnsRH_position').val(posicao);
	$('#cnsRH_dados tr').removeClass('active');
	$(ref).parent().parent().addClass('active');
}









//########################################################
		//PADRÃO DE EVENTOS DOS INPUTS
//########################################################

//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function(){

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA
	//########################################################
	$('#cnsRH_dados').on("keyup", 'input',function(e){
		var actpos = $("#cnsRH_position").val();
		var cell = $(this).parent().index();
		switch (e.which) {
			case 38: //PARA CIMA
				if(actpos > 0){
					selecionaLinha('#cnsRH_dados',--actpos,cell);
				}
			break;

			case 40://PARA BAIXO
				if (Number(actpos)+1 < $("#cnsRH_record").val()){
					selecionaLinha('#cnsRH_dados',++actpos,cell);
				}
			break;

		}
	});

	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$('#cnsRH_dados').on("focus", 'input',function(){
		cnsRH_selecao(this);
	});

	//########################################################
	//TRANSFERENCIA DE VALOR
	//########################################################
	$('#cnsRH_dados').on("dblclick", 'input',function(){
		cnsRH_fecha(true);
	});

	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		$('#cnsRH_pesquisa').focus();
	});






}); //ready(function()
