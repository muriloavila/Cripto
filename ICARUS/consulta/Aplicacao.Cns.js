//########################################################
//########################################################
			//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################


//########################################################
//VERSÃO DA TELA
//########################################################
var CNSAPL_RELEASE = '0.001';


//########################################################
//OBJETO DA TABELA APLICAÇÃO
var objTabelaApl = {};
//########################################################


//########################################################
//LIMITE DE REGISTROS
var CNSAPL_LIMITE_REGISTROS = 40;
//########################################################

//########################################################
//VERIFICA SE JA RODOU O safety
var CNSAPL_SAFETY = false;
//########################################################

//########################################################
//LOCAL DO EXEC
var CNSAPL_EXEC = '../consulta/Aplicacao.Cns.Exec.php';
//########################################################



//########################################################
//TABELAS USADAS
var CNSAPL_DIV_TABELA = '#cnsApl_dados';
//########################################################

/*///////////////////////////////////
Objeto da consulta
// *////////////////////////////////////
var objAplicacao = {};
objAplicacao.divDaConsulta = '';
/* ATRIBUTOS */
objAplicacao.ap_number = '';
objAplicacao.ap_code = '';
objAplicacao.ap_marca = '';
/* fim do objAplicacao */


//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################






























//########################################################
//########################################################
			//FUNÇÕES DA TABELA APLICAÇÃO
//########################################################
//########################################################

//########################################################
//LIBERA ACESSO
//########################################################
function cnsApl_safety(fCustom, dontclose){
	safety(CNSAPL_EXEC, function(){ cnsApl_liberaAcesso(fCustom, dontclose); }, CNSAPL_RELEASE);
}

//########################################################
//LIBERA ACESSOS
//########################################################
function cnsApl_liberaAcesso(fCustom, dontclose){
	if (!TestaAcesso('BAS.APLICACAO')) { //usuario sem acesso fecha janela
		swal({
				title: "Atenção",
				text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
					  "Nome do acesso necessário: BAS.APLICACAO",
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

	cnsApl_load_combo(fCustom);
}
	
//########################################################

//########################################################
//CARREGA COMBOS
//########################################################
function cnsApl_load_combo(fCustom){//Esta funcao carrega os combos somente se eles forem utilizados
	var funcao = "funcao=loadCombo";
	ajax(funcao,CNSAPL_EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar combo',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar combos',retorno.mensagem,'error');
			return;
		}

		//ADICIONA OS VALORES QUE VIERAM DA TABELA AUX
		$.each(retorno.marca, function (i, marca){
			$('#cnsApl_comboMarcas').append($('<option>', {value: marca.af_descr, text : marca.af_descr }));
		});

		swal.close();

		$("#cnsApl_pesquisa").focus();

		CNSAPL_SAFETY = true;
		if(!empty(fCustom)){
			fCustom();
		}
	});
}
//########################################################

//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function cnsApl_montaQuery(){
	if($("#cnsApl_pesquisa").is( ":focus" )){
		$('#cnsApl_pesquisa').blur(); //para tirar o foco da pesquisa
	}

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	// LimpaTabela(CNSAPL_DIV_TABELA);
	$(CNSAPL_DIV_TABELA).html('');

	$(CNSAPL_DIV_TABELA).html("<img src='../component/loading.gif' />");

	//REQUISIÇÃO AJAX
	var funcao = "order=" + $("#cnsApl_comboOrdem").val() +
				"&texto=" + $("#cnsApl_pesquisa").val() +
				"&ap_marca="+ $("#cnsApl_comboMarcas").val() +
				"&funcao=monta";
	ajax(funcao,CNSAPL_EXEC,function(retorno){
		//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
		// LimpaTabela(CNSAPL_DIV_TABELA);
		$(CNSAPL_DIV_TABELA).html('');

		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar tabela de Aplicações',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela Aplicação',retorno.mensagem,'error');
			return;
		}

		$('#cnsApl_record').val(retorno.total);
		objTabelaApl = retorno;
		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		// cnsApl_pagination(1);

		//A CONSULTA NAO ESTA INCLUIDA EM UMA OUTRA TELA
		if(objAplicacao.divDaConsulta === '' || objAplicacao.divDaConsulta === undefined){
			//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
			cnsApl_pagination(1);
			return;
		}

		//ainda não abriu a consulta
		if(!$('#'+objAplicacao.divDaConsulta).hasClass('active')){
			//retornou so um registro
			if(objTabelaApl.total == 1) {
				$('#cnsApl_position').val('0');
				cnsApl_fecha(true);
				return;
			}

			//abre sombreado e tela de consulta
			try{ get('divfundo').style.visibility = 'visible';
			}catch(e){}
			$('#'+objAplicacao.divDaConsulta).show();
			// sobe a consulta acima do 0 para ela desaparecer da tela
			$('#'+objAplicacao.divDaConsulta).css({
				'margin-left':'auto',
				'margin-right':'auto',
				'margin-top' : '-100%'
			});

			$('#'+objAplicacao.divDaConsulta).addClass('active');
			//inicia a animação gastando 500ms
			$('#'+objAplicacao.divDaConsulta).animate({
		        'margin-top' : '20px'
		    },500,function(){
		    	get('cnsApl_pesquisa').focus();
		    });
		}

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		cnsApl_pagination(1);



	});
}
//########################################################

//########################################################
//MONTA AS PAGINAS
//########################################################
function cnsApl_montaPaginas(paginaAtual,totalDePaginas){
	$('#cnsApl_pagination').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? (paginaAtual + links) : totalDePaginas);

	if(paginaAtual > (links + 2)){
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#cnsApl_pagination').append("<span onclick='cnsApl_pagination(" + 1 + ");'>" + 1 + "</span>");
		$('#cnsApl_pagination').append("<span class='no-border'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#cnsApl_pagination').append("<span class='active'>" + i + "</span>");
		}else{
			//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
			$('#cnsApl_pagination').append("<span onclick='cnsApl_pagination(" + i + ");'>" + i + "</span>");
		}
	}
	if(paginaAtual < (totalDePaginas - (links + 2))){
		$('#cnsApl_pagination').append("<span class='no-border'>...</span>");
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#cnsApl_pagination').append("<span onclick='cnsApl_pagination(" + totalDePaginas + ");'>" + totalDePaginas + "</span>");
	}
}
//########################################################

//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function cnsApl_pagination(paginaAtual,fCustom){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(CNSAPL_DIV_TABELA)){
		return;
	}

	var totalDePaginas = Math.ceil(objTabelaApl.total / CNSAPL_LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * CNSAPL_LIMITE_REGISTROS;
	if(fim > objTabelaApl.total)
		fim = objTabelaApl.total;
	var inicio = ((paginaAtual - 1) * CNSAPL_LIMITE_REGISTROS);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	// LimpaTabela(CNSAPL_DIV_TABELA);
	$(CNSAPL_DIV_TABELA).html('');

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	cnsApl_montaPaginas(paginaAtual,totalDePaginas);

	//RESETA A POSICAO
	$('#cnsApl_position').val("null");

	//RESETA TOTAL
	$('#cnsApl_record').val(objTabelaApl.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	// LimpaTabela(CNSAPL_DIV_TABELA);
	$(CNSAPL_DIV_TABELA).html('');

	if(objTabelaApl.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += cnsApl_linha(i);
			tabela += "</tr>";
			$(CNSAPL_DIV_TABELA).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaApl.total > 0 && empty(fCustom)){
		cnsApl_pintaLinha($(CNSAPL_DIV_TABELA + ' tr:eq(0)'));
		//VOLTA O SCROLL PRA CIMA
		$(CNSAPL_DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
	}
	else if(Verifica_Alteracao(CNSAPL_DIV_TABELA)){
		$('#cnsApl_search').focus();
	}

	if(!empty(fCustom)){
		fCustom();
	}

	// $(CNSAPL_DIV_TABELA).mCustomScrollbar({
	// 		scrollInertia: 0.8,
	// 		autoHideScrollbar: true,
	// 		theme:"dark-3"
	// });
}
//########################################################

//########################################################
//MONTA LINHAS
//########################################################
function cnsApl_linha(i){
	var aux = objTabelaApl.registros[i];
	var table = ""+
	"<td class='w90 number inativo' ><input value='"+aux.ap_number+"' name='ap_number' maxlength='10' readonly/></td>"+
	"<td class='w380' ><input value='"+aux.ap_code+"' name='ap_code' maxlength='60' class='uppercase' readonly/></td>" +
	"<td class='w160' ><input value='"+aux.ap_marca+"' name='ap_marca' maxlength='60' class='uppercase' readonly/>"+
	"</td>" +
	"";

	return table;
}
//########################################################

//########################################################
//PINTA AS LINHAS
//########################################################
function cnsApl_pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#cnsApl_position').val(actpos);
	$(CNSAPL_DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');
}
//########################################################

//########################################################
// ABRE A CONSULTA E REALIZA A PESQUISA COM O PARAMTRO PASSA PRA FUNCAO
//########################################################
function cnsApl_abre(texto,divDaConsulta,ordem,naoPesquisa){
	if(!CNSAPL_SAFETY){
		cnsApl_safety(function(){
			cnsApl_abre(texto,divDaConsulta,ordem,naoPesquisa);
		},true, true);
		return;
	}
	//COLOCA NO OBEJTO A DIV ONDE A CONSULTA FOI INSERIDA
	objAplicacao.divDaConsulta = divDaConsulta;

	//ALTERA ORDEM DO COMBO DE PESQUISA
	try{
		if(!empty(ordem)){
			get('cnsApl_comboOrdem').value = ordem;
		}
	}catch(e){}

	//COLOCA NO CAMPO DE PESQUISA DA CONSULTA OQUE FOI PESQUISADO
	$('#cnsApl_pesquisa').val(texto.trim());

	if(naoPesquisa !== undefined && naoPesquisa === true){
		//EXIBE A DIVFUNDO SOMENTE SE ESTIVER INCLUINDO A CONSULTA EM OUTRA TELA
		try{ get('divfundo').style.visibility = 'visible';
		}catch(e){}
		$('#'+objAplicacao.divDaConsulta).show();
		$('#'+objAplicacao.divDaConsulta).css({
			'margin-left':'auto',
			'margin-right':'auto',
			'margin-top' : '-100%'
		});
		$('#'+objAplicacao.divDaConsulta).addClass('active');
		$('#'+objAplicacao.divDaConsulta).animate({
	        'margin-top' : '20px'
	    },500,function(){
	    	get('cnsApl_pesquisa').focus();
	    });
	}else{
		//MONTA O COMBO PARA DEPOIS MONTAR A QUERY
		cnsApl_montaQuery();
	}
}
//########################################################

//########################################################
// FECHA A CONSULTA E PREENCHE AS LINHAS
//########################################################
function cnsApl_fecha(preencheLinha){
	//A CONSULTA NAO ESTA INCLUIDA EM UMA OUTRA TELA
	if(empty(objAplicacao.divDaConsulta))
		return;
	// VOU FECHAR A CONSULTA SEM TER QUE PREENCHER AS LINHAS
	if(!preencheLinha){
		$('#'+objAplicacao.divDaConsulta).removeClass('active');
		$('#'+objAplicacao.divDaConsulta).animate({
            'margin-top' : '-100%'
        },500,function(){
        	$('#'+objAplicacao.divDaConsulta).hide();
        	get('divfundo').style.visibility = 'hidden';
        });

        try{cnsApl_fecha2();
        }catch(e){}
        return;
	}

	var posicao = $('#cnsApl_position').val();
	var divDaConsulta = objAplicacao.divDaConsulta; //conteudo do objeto

	objAplicacao.ap_number = objTabelaApl.registros[posicao].ap_number;
	objAplicacao.ap_code = objTabelaApl.registros[posicao].ap_code;
	objAplicacao.ap_marca = objTabelaApl.registros[posicao].ap_marca;
	objAplicacao.divDaConsulta = divDaConsulta; //recupera divDaConsulta

	$('#'+divDaConsulta).removeClass('active');
	$('#'+divDaConsulta).animate({
        'margin-top' : '-100%'
	},500,function(){
    	$('#'+divDaConsulta).hide();
    	get('divfundo').style.visibility = 'hidden';
    	$('#'+divDaConsulta).removeClass('active');
    	cnsApl_retorno();
    });
}













//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function(){
	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		$('#cnsApl_pesquisa').focus();
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#cnsApl_pesquisa').keypress(function(e){
		if(e.which == 13)
			cnsApl_montaQuery();
	});

	//########################################################
	//RESETA PARAMETROS AO TROCAR A ORDEM DO COMBO
	//########################################################
	$('#cnsApl_comboOrdem').on("change",function(){
		$('#cnsApl_pesquisa').val('');
		$('#cnsApl_pesquisa').focus();
	});

	//########################################################
	//KEYPRESS SÓ PERMITE NÚMEROS NO CAMPO PESQUISA APLICAÇÃO - NUMEROS
	//########################################################
	$("#cnsApl_pesquisa").on("keypress", function(e){
		if($("#cnsApl_comboOrdem option[value=0]").is(':checked')){
			return somenteNumero(e,false,false,this);
		}
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - PESQUISA APLICAÇÃO
	//########################################################
	$("#cnsApl_pesquisa").on('click', function(){
		$(this).select();
	});

	//########################################################
	//TRANSFERENCIA DE VALOR
	//########################################################
	$(CNSAPL_DIV_TABELA).on("dblclick", 'input',function(){
		cnsApl_fecha(true);
	});


	//########################################################
	//KEYUP DOS INPUTS DA CNSAPL_DIV_TABELA
	//########################################################
	$(CNSAPL_DIV_TABELA).on("keyup", 'input',function(e){
		var actpos = $("#cnsApl_position").val();
		var cell = $(this).parent().index();
		switch (e.which) {
			case 38: //PARA CIMA
				if(actpos > 0){
					selecionaLinha(CNSAPL_DIV_TABELA,--actpos,cell);
				}
			break;

			case 40://PARA BAIXO
				if (Number(actpos)+1 < $("#cnsApl_record").val()){
					selecionaLinha(CNSAPL_DIV_TABELA,++actpos,cell);
				}
			break;
		}
	});

	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$('#cnsApl_dados').on("focus", 'input',function(){
		cnsApl_pintaLinha($(this).parent().parent());
	});


}); //ready(function()
