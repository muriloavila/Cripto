//########################################################
//########################################################
            //CONSTANTES SEMPRE USADAS
//########################################################
//########################################################

//########################################################
//VERSÃO DA TELA
//########################################################
var RELEASE = '0.001';


//########################################################

//########################################################
//LIMITE DE REGISTROS
var LIMITE_REGISTROS = 80;

//########################################################
//LOCAL DO EXEC
var EXEC = '../consulta/Catalogo.Online.Exec.php';
//########################################################

//########################################################
//ERRO
var ERRO_500 = 'Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!';
//########################################################

//########################################################


//########################################################
//TABELAS USADAS
var DIV_TABELA = "#dadosprod";
var DIV_TABELA_CONV = "#dadosconversao";
var DIV_TABELA_APLIC = "#dadosaplicacao";
var DIV_TABELA_OBS = "#prod_obs";

//########################################################
//########################################################
            //FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################
















//########################################################
//LIBERA ACESSO
//########################################################
function liberaAcesso(){ //chamada pela funcao safety() esta na Icarus.Library.js
    var ind = aAcesso.indexOf('BAS.PRODUTO');
    sfTra = aNivel[ind];
    if(sfTra===undefined){
        var win = window.open("","_self");
        alert('Nível de acesso insuficiente para acessar essa tela!\nAcesso necessário: BAS.PRODUTO');
        win.close();
        return;
    }
    montaCombo();
}


//########################################################

//########################################################
//MONTA COMBOS
//########################################################
function montaCombo(){
    var funcao = "funcao=combo";
    swal.loading();

    ajax(funcao,EXEC,function(resposta){
        combo = json(resposta);
        // console.log(combo);

        if(!combo){
            swal("Erro ao gerar Relatório",ERRO_500,'error');
            return;
        }

        if(!empty(combo.error)){
            swal('Erro ao buscar dados do relatório',combo.mensagem,'error');
            return;
        }

        //MONTA FAMILIA
        $('#list-familias').append("<li class='familias pointer'>");
        for(var i = 0; i < combo.familia.length; i++){
            var nome = combo.familia[i].nome;
            var numero = combo.familia[i].numero;

            var aux = "" +
                "<label class='w170 float-left' numero='"+numero+"' >" + nome + "</label>";
            $('#list-familias').append(aux);
        }

        //APLICACAO
		$.each(combo.familia, function (key, familia){
			$('#grupo').append($('<option>', {value: familia.numero, text : familia.nome }));
		});

        $('#list-familias').mCustomScrollbar({
            scrollInertia: 0.8,
            autoHideScrollbar: true,
            theme:"dark-3"
        });


        //APLICACAO
		$.each(combo.aplic, function (key, aplic){
			$('#veiculo').append($('<option>', {value: aplic.ap_number, text : aplic.ap_code }));
		});


        //FORNECEDOR
		$.each(combo.fornec, function (key, fornec){
			$('#fornecedor').append($('<option>', {value: fornec.fo_number, text : fornec.fo_abrev }));
		});

        swal.close();
    });
}



//########################################################
//EXIBE SOMENTE AS FAMILIAS COM PRODUTOS NO MERCADO 'L'
//########################################################
function somenteLancamento(){
    var exibeLancamento = '';
    if($("#somenteLancamento").attr('lancamento') == 'true'){
        exibeLancamento = 'true';
    }
    funcao = "funcao=combo&lancamento="+exibeLancamento;
    ajax(funcao,EXEC,function(resposta){
        combo = json(resposta);
        // console.log(combo);

        if(!combo){
            swal("Erro ao gerar Relatório",ERRO_500,'error');
            return;
        }

        if(!empty(combo.error)){
            swal('Erro ao buscar dados do relatório',combo.mensagem,'error');
            return;
        }

        LimpaTabela('#list-familias');

        //MONTA FAMILIA
        $('#list-familias').append("<li class='pointer'>");
        for(var i = 0; i < combo.familia.length; i++){
            var nome = combo.familia[i].nome;
            var numero = combo.familia[i].numero;

            var aux = "" +
                "<label class='w170 float-left' numero='"+numero+"' >" + nome + "</label>";
            $('#list-familias').append(aux);
        }

        $('#list-familias').mCustomScrollbar({
            scrollInertia: 0.8,
            autoHideScrollbar: true,
            theme:"dark-3"
        });

        //TROCA O TIPO DE EXIBICAO DAS FAMILIAS
        if($("#somenteLancamento").attr('lancamento') == 'true'){
            $("#somenteLancamento").attr('lancamento','false');
        }else{
            $("#somenteLancamento").attr('lancamento','true');
        }

        swal.close();
    });
}

















//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function monta_query(familia,name,lancamento){
	if($("#search").is(":focus")){
		$('#search').blur(); //para tirar o foco da pesquisa
	}

	$(DIV_TABELA).html("<img src='../component/loading.gif' />");

    if(!empty(familia) || !empty(lancamento)){
        //MONTA A FUNCAO
    	funcao = encodeURI("busca=" +
                                "&familia=" + familia +
                                "&lancamento=" + lancamento +
                                "&cOriginal=" +
                                "&aplic=" +
                                "&veiculo=" +
                                "&fornecedor=" +
    							"&funcao=monta");
    }else{
    	//MONTA A FUNCAO
    	funcao = encodeURI("busca=" + $("#search").val() + "&lancamento=" +
                                "&cOriginal=" + $("#cOriginal").val() +
                                "&aplic=" + $("#aplic").val() +
                                "&veiculo=" + $("#veiculo").val() +
                                "&fornecedor=" + $("#fornecedor").val()+
    							"&familia=" + (empty(familia) ? $("#grupo").val() : familia) +
    							"&funcao=monta");
    }

    swal.loading("gerando Catálogo");
	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Produtos',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de produtos',retorno.mensagem,'error');
			return;
		}

		$('#record').val(retorno.total);
		objTabelaProd = retorno;


        var tabCatalogo = "<div id='monta' class='page seletor h160 w760'>"+
                			"<table class='table'>"+
                				"<tbody class='title'>"+
                					"<tr>"+
                						"<td class='w150'>Código</td>"+
                						"<td class='w550'>Descrição</td>"+
                						"<td class='w40'>Obs</td>"+
                					"</tr>"+
                				"</tbody>"+
                			"</table>"+
                			"<table class='table bg-branco'>"+
                				"<tbody id='dadosprod' class='h100'>"+
                				"</tbody>"+
                			"</table>"+
                			"<div class='footer'>"+
                				"<div class='pagination' id='pagination'></div>"+
                				"<span class='registros'>"+
                					"<label>Posição:</label>"+
                					"<input id='position' value='null' readonly class='bolder'/>"+
                				"</span>"+
                				"<span class='registros'>"+
                					"<label>Registros:</label>"+
                					"<input id='record' value='null' readonly class='bolder'/>"+
                				"</span>"+
                			"</div>"+
                		"</div>"+

                        "<div id='monta_detalhes' class='page seletor h230 w760'>"+

                            "<fieldset class='w600 float-left hide' id='field_obs' style='padding: 0px;'>"+
                                "<div id='divObs' class='w600'>"+
                                    "<table class='table'>"+
                                        "<tbody class='title'>"+
                                            "<tr>"+
                                                "<td class='w50'>Nº</td>"+
                                                "<td class='w540 last'>Observação</td>"+
                                            "</tr>"+
                                        "</tbody>"+
                                    "</table>"+

                                    "<table class='table bg-branco' style='margin-bottom: 5px!important;'>"+
                                        "<tbody id='prod_obs' class='h90'>"+

                                        "</tbody>"+
                                    "</table>"+
                                    "<input type='button' class='btn fecha' name='obs_fecha'/>"+
                                "</div>"+
                            "</fieldset>"+



                			"<table class='table' style='width:602px;'>"+
                				"<tbody class='title'>"+
                					"<tr>"+
                						"<td class='w170'>Nº Conversão</td>"+
                						"<td class='w330'>Aplicação</td>"+
                                        "<td class='w90'>Ano</td>"+
                					"</tr>"+
                				"</tbody>"+
                			"</table>"+
                            "<table class='table bg-branco w170 float-left'>"+
                				"<tbody id='dadosconversao' class='w170 h150'>"+
                				"</tbody>"+
                			"</table>"+
                            "<table class='table bg-branco w420 float-left'>"+
                				"<tbody id='dadosaplicacao' class='h150' style='width:428px;'>"+
                				"</tbody>"+
                			"</table>"+
                            "<div class='w150 h160 float-left'>"+
                                "<div class='w130 h150 float-right'>"+
                                    "<img src='' id='imagemProduto' title=''"+
                                        "style='width:122px; height:146px;border:1px solid #ccc;float:right;'/>"+
                                "</div>"+
                            "</div>"+
                            "<label class='float-left'>Grupo</label>"+
                            "<label class='w270 float-left familia' readonly id='pt_familia'></label>"+
                        "</div>";

		swal({
				title: "Catálogo",
				text: tabCatalogo,
				html: true,
				// showCancelButton: true,
	            confirmButtonText: "Fechar",
	            // cancelButtonText: "Cancelar",
	            closeOnConfirm: true,
	            closeOnCancel: true,
			},
			function(confirmou){
				if(confirmou){
					swal.close();
				}
			}
		);

        //DEIXA O SWEET ALERT GRANDE PARA CONTER O CATALOGO
        $(".sweet-alert").css("width","784px");
        $(".sweet-alert").css("margin-left","-410px");

        executaComandos();

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
	});

    //RETORNA O SWEET ALERT AO PADRAO
    $(".sweet-alert").css("width","478px");
    $(".sweet-alert").css("margin-left","-256px");

}
//########################################################


//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(pagina, fCustom){
  var totalDePaginas = Math.ceil(objTabelaProd.total / LIMITE_REGISTROS);

  if(pagina > totalDePaginas){
		pagina = totalDePaginas;
	}

	var fim = pagina * LIMITE_REGISTROS;
	if(fim > objTabelaProd.total)
		fim = objTabelaProd.total;
	var inicio = ((pagina - 1) * LIMITE_REGISTROS);

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas(pagina,totalDePaginas);

	// LIMPA CAMPOS DA TABELA | DETALHES | IMPOSTOS
	LimpaTabela(DIV_TABELA);

	//RESETA A POSICAO
	$('#position').val("null");

	//RESETA TOTAL
	$('#record').val(objTabelaProd.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabelaProd.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += monta_linha(i);
			tabela += "</tr>";
			$(DIV_TABELA).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaProd.total > 0 && empty(fCustom)){
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

	//VOLTA O FOCO PRO SEARCH CASO A BUSCA NÃO RETORNE RESULTADOS
	if(objTabelaProd.total === 0){
		$('#search').focus();
	}
}
//########################################################


//########################################################
//MONTA OS INDICES DE PAGINA EM BAIXO DA TABELA
//########################################################
function montaPaginas(paginaAtual,total){
	$('#pagination').html("");
	if(total == 1){
		return;
	}

	var links = 4;
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < total ? (paginaAtual + links) : total);


	if(paginaAtual > (links + 2)){
	   $('#pagination').append("<span onclick='pagination(" + 1 + ");'>" + 1 + "</span>");
	   $('#pagination').append("<span class='no-border'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
	   if(i == paginaAtual){
		   $('#pagination').append("<span class='active'>" + i + "</span>");
	   }else{
		   $('#pagination').append("<span onclick='pagination(" + i + ");'>" + i + "</span>");
	   }
	}
	if(paginaAtual < (total - (links + 2))){
	   $('#pagination').append("<span class='no-border'>...</span>");
	   $('#pagination').append("<span onclick='pagination(" + total + ");'>" + total + "</span>");
	}
}
//########################################################


//########################################################
//MONTA LINHAS
//########################################################
function monta_linha(i){
	var aux = objTabelaProd.registros[i];

	//MONTA A LINHA
	var table =	"" +
		"<td class='w150'><input value='"+aux.pt_code+"' name='pt_code' class='uppercase' readonly/></td>"+
		"<td class='w550'><input value='"+aux.pt_descr+"' name='pt_descr' class='uppercase' readonly/></td>"+
		"<td class='w30 center'><input value='"+(!empty(aux.pt_obs) ? '*' : '')+"' name='pt_obs' class='uppercase' readonly/></td>";

	return table;
}
//########################################################


//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	if(actpos == $('#position').val()) return; // SE FOR A LINHA ATUAL N FAZ NADA

	$('#position').val(actpos);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');

    $("#pt_familia").html(objTabelaProd.registros[actpos].fa_nome);

    validaFoto();

	monta_conversao(actpos);
}
//########################################################









//########################################################
//MONTA OS INPUTS DA DIV CONVERSAO
//########################################################
function monta_conversao(actpos){
	if(empty(actpos)){
		return;
	}

    //LIMPA AS TABELAS
	LimpaTabela(DIV_TABELA_CONV);

	$(DIV_TABELA_CONV).html("<img src='../component/loading.gif' />");

	//MONTA A FUNCAO
	funcao = encodeURI("pt_code=" + objTabelaProd.registros[actpos].pt_code+
							"&funcao=monta_conversao");

    ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Produtos',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de produtos',retorno.mensagem,'error');
			return;
		}

		objTabelaConv = retorno;


        // LIMPA CAMPOS DA TABELA | DETALHES | IMPOSTOS
    	LimpaTabela(DIV_TABELA_CONV);

    	if(objTabelaConv.total > 0){
    		for(var i = 0; i < objTabelaConv.total; i++){
    			var tabela = "<tr posicao=" + i + " inativo>";
    			tabela += monta_linha_conv(i);
    			tabela += "</tr>";
    			$(DIV_TABELA_CONV).append(tabela);
    		}
    	}

    	$(DIV_TABELA_CONV).mCustomScrollbar({
    		scrollInertia: 0.8,
    		autoHideScrollbar: true,
    		theme:"dark-3"
    	});

        monta_aplicacao(actpos);

	});
}
//########################################################

//########################################################
//MONTA LINHA CONVERSAO
//########################################################
function monta_linha_conv(i){
    var aux = objTabelaConv.registros[i];

	//MONTA A LINHA
	var table =	"" +
		"<td class='w80'><input value='"+aux.fo_abrev+"' name='fo_abrev' class='uppercase' readonly/></td>"+
		"<td class='w90'><input value='"+aux.fp_code+"' name='fp_code' class='uppercase' readonly/></td>";

	return table;
}
//########################################################











//########################################################
//MONTA OS INPUTS DA DIV APLICACAO
//########################################################
function monta_aplicacao(actpos){
	if(empty(actpos)){
		return;
	}

    //LIMPA AS TABELAS
	LimpaTabela(DIV_TABELA_APLIC);

	$(DIV_TABELA_APLIC).html("<img src='../component/loading.gif' />");

	//MONTA A FUNCAO
	funcao = encodeURI("pt_code=" + objTabelaProd.registros[actpos].pt_code+
							"&funcao=monta_aplicacao");

    ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Produtos',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de produtos',retorno.mensagem,'error');
			return;
		}

		objTabelaAplic = retorno;


        // LIMPA CAMPOS DA TABELA | DETALHES | IMPOSTOS
    	LimpaTabela(DIV_TABELA_APLIC);

    	if(objTabelaAplic.total > 0){
    		for(var i = 0; i < objTabelaAplic.total; i++){
    			var tabela = "<tr posicao=" + i + " inativo>";
    			tabela += monta_linha_aplic(i);
    			tabela += "</tr>";
    			$(DIV_TABELA_APLIC).append(tabela);
    		}
    	}

    	$(DIV_TABELA_APLIC).mCustomScrollbar({
    		scrollInertia: 0.8,
    		autoHideScrollbar: true,
    		theme:"dark-3"
    	});
	});
}


//########################################################
//MONTA LINHA APLICACAO
//########################################################
function monta_linha_aplic(i){
    var aux = objTabelaAplic.registros[i];

	//MONTA A LINHA
	var table =	"" +
		"<td class='w100'><input value='"+aux.ap_code+"' name='ap_code' class='uppercase' readonly/></td>"+
		"<td style='width:224px;'><input value='"+aux.pa_codeorig+"' name='pa_codeorig' class='uppercase' readonly/></td>"+
        "<td class='w80'><input value='"+aux.pa_ano+"' name='pa_ano' class='uppercase' readonly/></td>";

	return table;
}
//########################################################









//############################################################################################################################################
															//OBSERVACAO
//############################################################################################################################################

//############################################################################################################################################

//########################################################
//MONTA TABELA DE OBSERVAÇÃO
//########################################################
function monta_obs(){
	actpos = $("#position").val(); //POSIÇÃO DO PRODUTO
	if(empty(actpos)){
		return;
	}

	LimpaTabela(DIV_TABELA_OBS);

	$(DIV_TABELA_OBS).html("<img src='../component/loading.gif' />");

	var prod_num = objTabelaProd.registros[actpos].pt_code; //CÓDIGO DO PRODUTO
	var funcao = "funcao=monta_obs&prod_num="+prod_num;

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

		LimpaTabela(DIV_TABELA_OBS);

		objTabelaObs = retorno;

		var tabela = "";
		for(var i = 0; i < objTabelaObs.total; i++){
			tabela += "<tr posicao=" + i + " inativo>";
			tabela += monta_linhaObs(i);
			tabela += "</tr>";
		}
		$(DIV_TABELA_OBS).append(tabela);

        $(DIV_TABELA_OBS).mCustomScrollbar({
    		scrollInertia: 0.8,
    		autoHideScrollbar: true,
    		theme:"dark-3"
    	});
	});
}
//########################################################

//########################################################
//MONTA LINHAS DA TABELA OBSERVAÇÃO
//########################################################
function monta_linhaObs(i){
	var aux = objTabelaObs.registros[i];
	var table = "<td class='w50 inativo number'><input value='"+aux.po_number+"' name='po_number' readonly/></td>"+
				"<td class='w510 last'><input value='"+aux.po_linha+"' name='po_linha' readonly/></td>";
	return table;
}
//########################################################




//############################################################################################################################################
												//FIM OBSERVACAO
//############################################################################################################################################

//############################################################################################################################################



















//########################################################
//EXECUTA COMANDOS (KEY UP,CLICK, BLUR) NAS TABELAS DO SWEET ALERT
//########################################################
function executaComandos(){
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
    //PINTA LINHA PRODUTO
    //########################################################
    $(DIV_TABELA).on("focus", 'input',function(){
        pintaLinha($(this).parent().parent());
    });


    //########################################################
    //CLICK OBS
    //########################################################
    $(DIV_TABELA).on("click", 'input[name=pt_obs]',function(){
        //CASO OBS NAO ESTEJA VISIVEL ELE ENTRA
        if($("#field_obs").css('display') == "none"){
            $("#monta_detalhes table").hide();

            $("#field_obs").show();
            $("#field_obs table").show();

            monta_obs();

            return;
        }

        //CASO JA ESTEJA VISIVEL ELE SO FECHA
        $("#field_obs").hide();
        $("#field_obs table").hide();

        $("#monta_detalhes table").show();
    });

    //########################################################
    //FECHA OBS
    //########################################################
    $("#divObs").on("click", 'input[name=obs_fecha]',function(){
        $("#field_obs").hide();
        $("#field_obs table").hide();

        $("#monta_detalhes table").show();
    });





}
//########################################################



//########################################################
//VALIDA FOTO
//########################################################
function validaFoto(){
	var actpos = $('#position').val(); // posicao atual do cursor
	var imagem = objTabelaProd.registros[actpos].pt_imagem;
	var caminho = $('#caminhoImagem').val();

	if(imagem !== ""){
		imagem = imagem.replace(".jpg","");
		imagem = imagem.replace(".png","");
		var img = new Image();
		try{
			img.src = caminho+imagem+'.jpg';
		}catch(e){

		}
		img.onload=function(){
			$('#imagemProduto').attr('src',  img.src);
			$('#imagemProduto').attr('title',  caminho+imagem+'.jpg');
		};

		img.onerror=function(){
			var imgPng = new Image();
			imgPng.src = caminho+imagem+'.png';
			imgPng.onload=function(){
				$('#imagemProduto').attr('src',  imgPng.src);
				$('#imagemProduto').attr('title',  caminho+imagem+'.png');
			};

			imgPng.onerror=function(){
				img.src = '../imagens/SemFotoCatalog.png';
			};
		};
	}else{
		$('#imagemProduto').attr('src',  '../imagens/SemFotoCatalog.png');
	}
}
//########################################################


































$(document).ready(function(){

	//########################################################
	//MONTA QUERY AO APERTAR ENTER
	//########################################################
	$('#search, #cFornec, #cOriginal').keypress(function(e){
		if(e.which == 13){
			monta_query();
		}
	});





    //########################################################
	//
	//########################################################
	$('#list-familias').on("click", 'label',function(){
        familia = $(this).attr('numero');
        name = $(this).html();
		monta_query(familia, name, '');
	});






});

//########################################################
//########################################################
//FIM PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################
