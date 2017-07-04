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
//OBJETO TABELA CAMBIO
var objTabelaCamb = {};

//########################################################
//LIMITE DE REGISTROS
var CAMB_LIMITE_REGISTROS = 80;

//########################################################
//LOCAL DO EXEC
var EXEC = "../basico/Cambio.Exec.php";

//########################################################
//TABELAS USADAS
var DIV_TABELA = '#dadoscamb';


//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################








//########################################################
//########################################################
			//FUNÇÕES DA TABELA CAMBIO
//########################################################
//########################################################
function liberaAcesso(){//chamada pela funcao safety() esta na Icarus.Library.js
	var ind = aAcesso.indexOf('BAS.MOEDA');
	var sfCam = aNivel[ind];

	if (sfCam===undefined){ //usuario sem acesso fecha janela
		var win = window.open("","_self");
		win.close();
	}
		if(sfCam <= '2'){
		$(".deleta").attr("disabled",true);
		$(".deleta").css("opacity","0.3");
	}
	if (sfCam <= '1'){
		$(".grava").attr("disabled",true);
		$(".grava").css("opacity","0.3");

		$(".insere").attr("disabled",true);
		$(".insere").css("opacity","0.3");

		$(".cancela").attr("disabled",true);
		$(".cancela").css("opacity","0.3");
	}

	getCombos();

}

//################################################################
//FUNÇÃO QUE PEGA OS VALORES QUE SERÃO INSERIDOS NOS COMBOS
//################################################################
function getCombos(){
	loading.close();

	var funcao = 'funcao=loadCombo';
	ajax(funcao,EXEC,function(retorno){
		// retorno = json(retorno);
		// if(!retorno){
		// 	var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
		// 	swal('Erro ao montar combo',erro,'error');
		// 	return;
		// }
		//ERRO
		if(!empty(retorno.error)){
			loading.close();
			swal('Erro ao buscar combos',retorno.mensagem,'error');
			return;
		}

		$.each(retorno.moeda, function (i, moeda){
		    $('#Moedas').append($('<option>', {value: moeda.af_codigo, text : moeda.af_codigo }));
		});

		$("#dataini").val(retorno.data);
		if(!Modernizr.inputtypes.date){
			$("#dataini").val('');
			jQuery(function($){$("#dataini").mask("99/99/9999");});
			$("#dataini").val(function(index,value){ return converteData(retorno.data,'DATA_BR');});
		}

		$('.ui.dropdown').dropdown();
		//########################################################
		//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
		//########################################################
		$('#det_cambio .dropdown').dropdown({
			onChange: function() {
				$('#pesquisa').select();
			}
		});


		// swal.close();
		loading.close();
		$('#pesquisa').select();
	});
}
//########################################################





//########################################################
//FUNÇÃO QUE REALIZA A PESQUISA
//########################################################
function monta_query(){
	// swal.loading();
	loading.show();
	var funcao ="order=" + get("cbOrdem").value +
							"&texto=" + get("pesquisa").value +
							"&dtini=" + get("dataini").value +
							"&funcao=monta";

	ajax(funcao,EXEC,function(retorno){
		loading.close();
		LimpaTabela(DIV_TABELA);
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar tabela de Cambio',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar Cambio',retorno.mensagem,'error');
			return;
		}

		// swal.close();

		$('#record').html(retorno.total);
		objTabelaCamb = retorno;
		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
		$('#pesquisa').select();
	});
}


//########################################################
//TROCA A PAGINA QUE ESTA SENDO EXIBIDA ATUALMENTE
//########################################################
function pagination(pagina, fCustom){
	if(!Verifica_Alteracao(DIV_TABELA)){
		return;
	}

	var totalDePaginas = Math.ceil(objTabelaCamb.total / CAMB_LIMITE_REGISTROS);
	if(pagina > totalDePaginas){
		pagina = totalDePaginas;
	}

	var fim = pagina * CAMB_LIMITE_REGISTROS;
	if(fim > objTabelaCamb.total)
		fim = objTabelaCamb.total;
	var inicio = ((pagina - 1) * CAMB_LIMITE_REGISTROS);

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas(pagina,totalDePaginas);

	//RESETA A POSICAO
	$('#posicao').val("null");

	//RESETA TOTAL
	$('#record').val(objTabelaCamb.total);


	LimpaTabela(DIV_TABELA);
	if(objTabelaCamb.total > 0){
	 // total de registros
		var str = "";
		for(var i = inicio; i < fim; i++){
			str += i;
			var table = "<tr posicao='" + i + "'>";
			table += Camb_linha(i);
			table += "</tr>";
			$(DIV_TABELA).append(table);}
	}

	//SELECIONA PRIMEIRA LINHA
	$('#pesquisa').focus();
	if(objTabelaCamb.total > 0 && empty(fCustom)){
		pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
		// selecionaLinha(DIV_TABELA,0,4);
		$(DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
	} else if(!Verifica_Alteracao(DIV_TABELA)){
	 	$('#pesquisa').focus();
	  }


	// $('#search').focus();
 //    if(objTabelaTransp.total > 0 && empty(fCustom)){
 //    	pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
 //    	// selecionaLinha(DIV_TABELA,0,2);
 //        $(DIV_TABELA).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
 //    }


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
//MONTA PAGINAS
//########################################################
function montaPaginas(paginaAtual,totalDePaginas){
	$('#pagination').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

	if(paginaAtual >= (links + 2)){
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination').append("<span onclick='pagination(" + 1 + ");'>" + 1 + "</span>");
		$('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
			$('#pagination').append("<span onclick='pagination(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}
	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination').append("<span onclick='pagination(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
	}
}


//########################################################
//MONTA LINHAS
//########################################################
function Camb_linha(i){
	var aux = objTabelaCamb.registros[i];
    var table = "<td class='w20 center inativo'> <input value='' readonly/></td>"+
				"<td class='w60 center'>"+
					"<input  value='"+ aux.do_moeda +"'  name='do_moeda' class='uppercase '/>"+
					"<select name='do_moeda'></select>"+
				"</td>"+
 		    	"<td class='w130'><input type='date' value='"+ aux.do_data +"' name='do_data' class='uppercase'  /></td>" +
          		"<td class='w80 center'>"+
          			"<input  value='"+ aux.do_status +"' name='do_status' class='uppercase' />"+
          			"<select name='do_status'></select>"+
          		"</td>" +
				"<td class='w80 number'><input value='"+ aux.do_valor +"' name='do_valor' class='uppercase'/></td>";
	return table;
	}


//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var posicao = $(elemento).attr('posicao');
	$('#posicao').val(posicao);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');
}



//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao(elemento){
	var posicao = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaCamb.registros[posicao][campo];
	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(posicao,DIV_TABELA) !== ''){
		return;
	}
	setStatus(posicao,'a',DIV_TABELA);
	Bloqueia_Linhas(posicao,DIV_TABELA);
}
//########################################################



//########################################################
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere(){
	//SE ESTA ALTERANDO UM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#posicao').val(),1);
		return;
	}

	if(empty(objTabelaCamb)){
		objTabelaCamb = {};
		objTabelaCamb.registros = [];
		objTabelaCamb.total = 0;
	}

	var novaPosicao = {};
	novaPosicao.do_moeda = 'DOLAR';
	novaPosicao.do_data = getDataHoje();
	novaPosicao.do_status = 'P';
	novaPosicao.do_valor = '0,0000';

	objTabelaCamb.registros.push(novaPosicao);
	objTabelaCamb.total += 1;

	var actpos = (objTabelaCamb.total > 0 ? (objTabelaCamb.total - 1) : 0);


	pagination((Math.ceil(objTabelaCamb.total / CAMB_LIMITE_REGISTROS)), function(){
		pintaLinha($(DIV_TABELA + " tr[posicao="+actpos+"]"));

		setStatus(actpos, '+', DIV_TABELA);
		Bloqueia_Linhas(actpos, DIV_TABELA);
		selecionaLinha(DIV_TABELA,actpos, 4);
		$("#record").val(objTabelaCamb.total);
		$( "tr[posicao="+actpos+"] input[name='do_valor']").focus();


	});

}
//########################################################

//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela(cell){
	var actpos = $('#posicao').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 4;
	}

	if(getStatus(actpos,DIV_TABELA) === 'a'){
		var td = Camb_linha(actpos);

		$(DIV_TABELA + " tr[posicao="+actpos+"]").html(td);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		selecionaLinha(DIV_TABELA,actpos,cell);
	}
	else if(getStatus(actpos,DIV_TABELA) === '+'){
		objTabelaCamb.registros.splice(actpos,1);
		objTabelaCamb.total -= 1;

		var paginaAtual = getPagina('#record','#pagination',CAMB_LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		pagination(paginaAtual,function(){
			$('#record').html(objTabelaCamb.total);
			if(objTabelaCamb.total > 0){
				if(actpos > 0){
					--actpos;
				}
				selecionaLinha(DIV_TABELA,actpos,cell);
			}
		});
	}
	else if(getStatus(actpos,DIV_TABELA) === ''){
		selecionaLinha(DIV_TABELA,actpos,cell);
	}
}
//########################################################

//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava(cell){
	var actpos = $('#posicao').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}
	var status = getStatus(actpos,DIV_TABELA);

	if(empty(cell)){
		cell = 4;
	}

	//NÃO HOUVE ALTERAÇÃO
	if(status === ''){
		selecionaLinha(DIV_TABELA,actpos,cell);
		return;
	}

	//PEGA EM FORMA DE array() OS INPUTS QUE ESTAO DENTRO DA MINHA LINHA SELECIONADA
	var linha = DIV_TABELA + " tr[posicao="+actpos+"] input";
	//INICIA A VARIAVEL DE FUNCAO
	var funcao = "funcao=grava&comando=" + (status == '+' ? 'insert' : 'update');
	funcao += "&do_moeda="+$(linha+"[name=do_moeda]").val()+
				"&do_data="+ converteData($(linha+"[name=do_data]").val(), 'DATA_US')+
				"&do_status="+$(linha+"[name=do_status]").val()+
				"&do_valor="+$(linha+"[name=do_valor]").val()+
				"&do_moeda_original="+objTabelaCamb.registros[actpos].do_moeda+
				"&do_data_original="+objTabelaCamb.registros[actpos].do_data;

	swal.loading('Gravando dados...');

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);

		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			LimpaTabela(DIV_TABELA);
			$(DIV_TABELA).html(erro);
			swal('Erro ao gravar alterações da tabela',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao gravar',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA,actpos,cell);
				}
			);
			return;
		}

		//VOU ATUALIZAR O MEU OBJETO JSON
		objTabelaCamb.registros[actpos].do_moeda = $(linha+"[name=do_moeda]").val();
		objTabelaCamb.registros[actpos].do_data = $(linha+"[name=do_data]").val();
		objTabelaCamb.registros[actpos].do_valor = $(linha+"[name=do_valor]").val();
		objTabelaCamb.registros[actpos].do_status = $(linha+"[name=do_status]").val();
		if(status === '+'){
			setStatus(actpos,'a',DIV_TABELA);
		}

		$('#record').html(objTabelaCamb.total);
		cancela(cell);
		swal.close();
	});
}
//########################################################

//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui(reftab){
	var actpos = $('#posicao').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	if(getStatus(actpos,DIV_TABELA) !== ''){
		cancela(4);
		return;
	}

	var do_moeda = objTabelaCamb.registros[actpos].do_moeda;
	var do_data = objTabelaCamb.registros[actpos].do_data;

	swal({
		title: "Deseja excluir da tabela "+do_moeda+" Da data: "+do_data+"?",
		type: "warning",
		showCancelButton: true,
		confirmButtonText: "Sim",
		cancelButtonText: "Não",
		closeOnConfirm: false,
		closeOnCancel: true,
		showLoaderOnConfirm: true,
		confirmButtonColor: "#DD6B55"
	},
	function(confirmouExclusao) {
		if(!confirmouExclusao){
			return;
		}
		var funcao = "funcao=deleta&do_moeda=" + do_moeda +"&do_data="+do_data;

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
						title:'Erro ao excluir',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,actpos,4);
					}
				);
				return;
			}

			objTabelaCamb.registros.splice(actpos,1);
			objTabelaCamb.total -= 1;
			swal.close();

			var paginaAtual = getPagina('#record',"#pagination", CAMB_LIMITE_REGISTROS);

			pagination(paginaAtual, function(){
				$('#record').html(objTabelaCamb.total);
				if(objTabelaCamb.total > 0){
					if(actpos > 0){
						--actpos;
					}
					selecionaLinha(DIV_TABELA,actpos,4);
				}
			});
		});
	});
}

//########################################################
//FUNÇÃO APRA TROCAR O INPUT DAS MOEDAS E DO STATUS COMBOBOX
//########################################################
function ComboLinha(campo){
	var actpos = $('#posicao').val();
	if(empty(actpos)){
		return;
	}

	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA) && !$(DIV_TABELA + " tr[posicao="+actpos+"]").hasClass('active')){
		return;
	}

	var Ovalor = ( $(campo).attr("name") == "do_moeda" ? "do_moeda" : "do_status" );
	var ComboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name="+Ovalor+"]";
	var InputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name="+Ovalor+"]";

	if(Ovalor == "do_moeda"){
		var OptionsOriginais = $("#Moedas").html();
		if(empty($.trim($(ComboMor).html()))){
			$(ComboMor).append($(OptionsOriginais));
		}
	}
	else if(Ovalor == "do_status"){
		if(empty($.trim($(ComboMor).html()))){
			$(ComboMor).append($('<option>', {value: 'P', text : 'PREVISTO' }));
			$(ComboMor).append($('<option>', {value: 'R', text : 'REAL' }));
		}
	}

	//VALOR QUE ESTAVA NO INPUT É O VALOR QUE APARECERÁ NO COMBO
	$(ComboMor + " option[value="+$(InputMor).val()+"]").attr('selected', 'selected');

	//ESCONDE INPUT
	$(InputMor).hide();

	//MOSTRA COMBO
	$(ComboMor).show();

	//DEIXA COMBO FOCADO
	$(ComboMor).focus();
}

//########################################################
//FUNÇÃO APRA TROCAR O COMBOBOX DAS MOEDAS E DO STATUS PARA INPUT
//########################################################
function TiraComboLinha(campo){
	var actpos = $("#posicao").val();
	if(empty(actpos)){
		return;
	}

	var Ovalor = ( $(campo).attr("name") == "do_moeda" ? "do_moeda" : "do_status" );

	//COMBO DESEJADO
	var ComboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name="+Ovalor+"]";

	//INPUT SELECIONADO
	var InputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name="+Ovalor+"]";

	$(InputMor).val($(ComboMor).val());


	//MOSTRA INPUT
	$(InputMor).show();

	//ESCONDE COMBO
	$(ComboMor).hide();

	edicao($(InputMor));
}

//########################################################
//NÃO PERMITE O CAMPO FICAR VAZIO E TRAS FORMATAÇÃO DE NUMERO
//########################################################
function notnull(elemento){
	if($(elemento).val() === ''){
		$(elemento).val('0');
	}
	if($(elemento).val() !== '' && $(elemento).val() != $(elemento).attr("last_value")){
		$(elemento).val(toNumber($(elemento).val()));
		$(elemento).val(function(index,value){ return value.replace(",","."); });
		$(elemento).val(function(index,value){return number_format($(elemento).val(),4,",",""); });
		$(elemento).attr('last_value', $(elemento).val());
	}
}

//########################################################
//########################################################
			//FIM FUNÇÕES DA TABELA CAMBIO
//########################################################
//########################################################









//########################################################
//########################################################
		//PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################

$(document).ready(function(){
	loading.show();
	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());
	});


	//########################################################
	//EDICAO DOS DADOS
	$(DIV_TABELA).on('click', 'td:not(.inativo) input', function(){ //CLICK
		$(this).select();
	});

	$(DIV_TABELA).on('change', "input:not([name='do_data'])", function(){//MUDANÇA
		edicao($(this));
	});

	$(DIV_TABELA).on('blur', "input[name='do_data']", function(){//MUDANÇA
		edicao($(this));
	});

	$(DIV_TABELA).on('blur', "td.number input", function(){//MUDANÇA
		notnull($(this));
	});
	//########################################################



	//########################################################
	//MUDA O INPUT PARA COMBO AO CLICAR NA MOEDA
	$(DIV_TABELA).on('focus', 'input[name=do_moeda], input[name=do_status]', function(){
		ComboLinha($(this));
	});



	//########################################################
	//MUDA O COMBO PARA INPUT AO PERDER O FOCO DO COMBO
	//########################################################
	$(DIV_TABELA).on('blur', 'select[name=do_moeda], select[name=do_status]', function(){
		TiraComboLinha($(this));
	});



	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		$('#pesquisa').focus();
	});
	//########################################################

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#pesquisa').keypress(function(e){
		if(e.which == 13)
			monta_query();
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#dataini').keypress(function(e){
		if(e.which == 13){
			monta_query();
		}
	});


	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA
	//########################################################
	$(DIV_TABELA).on("keyup", 'input',function(e){
		var actpos = $("#posicao").val();
		var cell = $(this).parent().index();
		var campo = $(this).attr('name');
		switch (e.which) {
			case 38: //PARA CIMA
				if(actpos > 0 && campo !== 'do_data'){
					selecionaLinha(DIV_TABELA,--actpos,cell);
				}
			break;

			case 40://PARA BAIXO
				if(campo !== 'do_data'){
					if (Number(actpos)+1 < $("#record").val()){
						selecionaLinha(DIV_TABELA,++actpos,cell);
					}else if(Verifica_Alteracao(DIV_TABELA)){
						insere();
					}
				}
			break;

			case 27://ESC
				$(this).blur();
				cancela(cell);
			break;

			case 45://INSERT
				if(Verifica_Alteracao(DIV_TABELA)){
					insere();
				}
			break;
			//########################################################


			//########################################################
			//REALIZA PESQUISA AO APERTAR ENTER
			//########################################################
			case 13://ENTER
				$(this).blur();
				grava(cell);
			break;
		}
	});


});


//########################################################
//########################################################
		//FIM PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################
