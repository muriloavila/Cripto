//########################################################
//########################################################
			//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################


//########################################################
//VERSÃO DA TELA
//########################################################
var RELEASE  = '0.003';


//########################################################
//OBJETO DA TABELA
var objTabela = {};
//########################################################

//########################################################
//LIMITE DE REGISTROS
var LIMITE_REGISTROS = 80;
//########################################################

//########################################################
//LOCAL DO EXEC
var EXEC = '../basico/Familia.Exec.php';
//########################################################

//########################################################
//TABELAS USADAS
var DIV_TABELA = '#dados-familia';
//########################################################



//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################








//########################################################
//########################################################
		//FUNÇÕES DA TABELA PRINCIPAL
//########################################################
//########################################################

function liberaAcesso(){
	if (!TestaAcesso('BAS.FAMILIA')){ //usuario sem acesso fecha janela
		swal({
				title:"Atenção",
				text:"Você não possuí acesso a essa tela, ela será fechada!\n"+
					 "Nome do acesso necessário: BAS.FAMILIA",
				type: "warning"
			},
			function(){
				var win = window.open("","_self");
				win.close();
			}
		);
		return;
	}

	//ACESSOS DO PRODUTO
	if (!TestaAcesso('BAS.PRODUTO')){
		$(".flash").attr("disabled",'disabled');
	}
	//ACESSOS DA FAMILIA
	if (!TestaAcesso('BAS.FAMILIA',3)){
		$(".deleta").attr("disabled",'disabled');
	}

	if (!TestaAcesso('BAS.FAMILIA',2)){
		$(".grava").attr("disabled",'disabled');
		$(".insere").attr("disabled",'disabled');
		$(".cancela").attr("disabled",'disabled');
		$(".planilha").attr("disabled",'disabled');
	}

	$('#det_familia .ui.dropdown').dropdown();
	//########################################################
	//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
	//########################################################
	$('#det_familia .ui.dropdown').dropdown({
		onChange: function() {
			$('#search').val('');
			$('#search').select();
		}
	});
	loading.close();
	$('#search').select();
}

//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function monta(){
	if($("#search").is( ":focus" )){
	  	$('#search').blur(); //para tirar o foco da pesquisa
	}
	
	LimpaTabela(DIV_TABELA);
	$(DIV_TABELA).html("<img src='../component/loading.gif' />");

	var funcao = 'funcao=monta&ordem=' + $('#ordem').val() + "&pesquisa=" + $('#search').val() +
		"&fornecedor=" + $('#search_fornec').attr('fornec_number');
	ajax(funcao,EXEC,function(retorno){
		// retorno = json(retorno);
		// if(!retorno){
		// 	var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
		// 	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
		// 	LimpaTabela(DIV_TABELA);
		// 	$(DIV_TABELA).html(erro);
		// 	swal('Erro ao montar tabela de família',erro,'error');
		// 	return;
		// }

		if(!empty(retorno.error)){
			loading.close();
			swal('Erro ao buscar familias',retorno.mensagem,'error');
			return;
		}

		$('#records').val(retorno.total);
		objTabela = retorno;
		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
		$('#search').select();
	});
}

//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas(paginaAtual,totalDePaginas){
	$('#pagination').html("");
	if(totalDePaginas == 1)
		return;

	var links = 4;//NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

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
	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		$('#pagination').append("<span onclick='pagination(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
	}
}

//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(paginaAtual,fCustom){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		return;
	}

	var totalDePaginas = Math.ceil(objTabela.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objTabela.total)
		fim = objTabela.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);


	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas(paginaAtual,totalDePaginas);


	//RESETA A POSICAO
	$('#position').val("null");

	//RESETA TOTAL
	$('#records').val(objTabela.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabela.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += linha(i);
			tabela += "</tr>";
			$(DIV_TABELA).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabela.total > 0 && empty(fCustom)){
		pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
		//VOLTA O SCROLL PRA CIMA
		$(DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
	}
	else if(Verifica_Alteracao(DIV_TABELA)){
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
function linha(i){
	var aux = objTabela.registros[i];
	var table = "" +
        "<td class='w20 inativo center'><input value='' readonly /></td>"+
        "<td class='w60 inativo number'> <input value='"+aux.fa_number+"' name='fa_number' maxlength='11' readonly /></td>"+
        "<td class='w180'><input value='"+aux.fa_nome+"' name='fa_nome' maxlength='40' class='uppercase' /></td>"+
        "<td class='w70'><input value='"+aux.pt_classfisc+"' name='pt_classfisc' maxlength='12' /></td>"+
		"<td class='w60'><input value='"+aux.ce_cest+"' name='ce_cest' maxlength='9' /></td>"+
        "<td class='w40 number'><input value='"+aux.fa_ipi+"' name='fa_ipi' maxlength='8' /></td>"+
		"<td class='w70 number'><input value='"+aux.fa_comiss+"' name='fa_comiss' maxlength='10' /></td>"+
        "<td class='w60 center'>"+
			"<input value='"+aux.fa_cstpis+"' name='fa_cstpis' maxlength='2' />"+
			"<select name='fa_cstpis'></select>"+
		"</td>"+
        "<td class='w40 number'><input value='"+aux.fa_pis+"' name='fa_pis' maxlength='8' class='bg blue-light'/></td>"+
        "<td class='w60 number'><input value='"+aux.fa_cofins+"' name='fa_cofins' maxlength='8' class='bg blue-light'/></td>"+
        "<td class='w50 number'><input value='"+aux.fa_imposto+"' name='fa_imposto' maxlength='9' class='bg amarelo'/></td>"+
        "<td class='w60 number'><input value='"+aux.fa_redicm7+"' name='fa_redicm7' maxlength='8' /></td>"+
        "<td class='w60 number'><input value='"+aux.fa_redicm12+"' name='fa_redicm12' maxlength='8' /></td>";
	return table;
}

//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var actipos = $(elemento).attr('posicao');
	$('#position').val(actipos);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');
}

//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao(elemento){
	var actipos = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabela.registros[actipos][campo];

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actipos,DIV_TABELA) !== ''){
		return;
	}

	setStatus(actipos,'a',DIV_TABELA);

	Bloqueia_Linhas(actipos,DIV_TABELA);
}

//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela(cell){
	var actpos = $('#position').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

	//EDICAO
	if(getStatus(actpos,DIV_TABELA) === 'a'){
		var tr = linha(actpos);

		$(DIV_TABELA + " tr[posicao="+actpos+"]").html(tr);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		selecionaLinha(DIV_TABELA,actpos,cell);
	}
	else if(getStatus(actpos,DIV_TABELA) === '+'){
		objTabela.registros.splice(actpos,1);
		objTabela.total -= 1;

		var paginaAtual = getPagina('#records','#pagination',LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		pagination(paginaAtual,function(){
			$('#records').val(objTabela.total);
			if(objTabela.total > 0){
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
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere(){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),2);
		return;
	}

	if(empty(objTabela)){
		objTabela = {};
		objTabela.registros = [];
		objTabela.total = 0;
	}

	var novaPosicao = {};
	novaPosicao.fa_number = '';
	novaPosicao.fa_nome = '';
	novaPosicao.pt_classfisc = '';
	novaPosicao.ce_cest = '';
	novaPosicao.fa_ipi = '0,00';
	novaPosicao.fa_comiss = '0,000';
	novaPosicao.fa_cstpis = '01';
	novaPosicao.fa_pis = '0,00';
	novaPosicao.fa_cofins = '0,00';
	novaPosicao.fa_imposto = '0,00';
	novaPosicao.fa_redicm7 = '0,00';
	novaPosicao.fa_redicm12 = '0,00';

	objTabela.registros.push(novaPosicao);
	objTabela.total += 1;

	var actpos = objTabela.total > 0 ? (objTabela.total - 1) : 0;

	pagination((Math.ceil(objTabela.total / LIMITE_REGISTROS)),function(){
		pintaLinha($(DIV_TABELA + " tr[actipos="+actpos+"]"));
		setStatus(actpos,'+',DIV_TABELA);
		Bloqueia_Linhas(actpos,DIV_TABELA);
		$('#records').val(objTabela.total);
		selecionaLinha(DIV_TABELA,actpos,2);
	});
}

//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui(){
	var actipos = $('#position').val();//POSICAO DO REGISTRO NO JSON
	if(actipos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	var fa_number = $(DIV_TABELA + " tr[posicao="+actipos+"] td:eq(1) input").val();

	swal({
			title: "Deseja excluir a família selecionada?",
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
			var funcao = "funcao=deleta&number=" + fa_number;

			ajax(funcao,EXEC,function(retorno){
				retorno = json(retorno);
				if(!retorno){
					var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
					swal('Erro de exclusão',erro,'error');
					return;
				}
				if(!empty(retorno.error)){
					//ERRO
					swal({
							title:'Erro ao excluir famiia',
							text: retorno.mensagem,
							type: 'error'
						},
						function(){
							selecionaLinha(DIV_TABELA,actipos,2);
						}
					);
					return;
				}

				objTabela.registros.splice(actipos,1);
				objTabela.total -= 1;
				swal.close();

				var paginaAtual = getPagina('#records',"#pagination", LIMITE_REGISTROS);

				pagination(paginaAtual,function(){
					$('#records').val(objTabela.total);
					if(objTabela.total > 0){
						if(actipos > 0){
							--actipos;
						}
						selecionaLinha(DIV_TABELA,actipos,2);
					}
				});
			});
		}
	);
}

//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava(cell){
	var actpos = $('#position').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}

	var status = getStatus(actpos,DIV_TABELA);

	if(empty(cell)){
		cell = 2;
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
	funcao += "&fa_number=" + $(linha+"[name=fa_number]").val() +
			  "&fa_nome=" + encode_uri($(linha+"[name=fa_nome]").val()) +
			  "&pt_classfisc=" + $(linha+"[name=pt_classfisc]").val() +
			  "&ce_cest=" + $(linha+"[name=ce_cest]").val() +
			  "&fa_ipi=" + $(linha+"[name=fa_ipi]").val() +
			  "&fa_comiss=" + $(linha+"[name=fa_comiss]").val() +
			  "&fa_cstpis=" + $(linha+"[name=fa_cstpis]").val() +
			  "&fa_pis=" + $(linha+"[name=fa_pis]").val() +
			  "&fa_cofins=" + $(linha+"[name=fa_cofins]").val() +
			  "&fa_imposto=" + $(linha+"[name=fa_imposto]").val() +
			  "&fa_redicm7=" + $(linha+"[name=fa_redicm7]").val() +
			  "&fa_redicm12=" + $(linha+"[name=fa_redicm12]").val();

	// swal.loading('Gravando dados...');
	loading.show('Gravando dados...');
	ajax(funcao,EXEC,function(retorno){
		loading.close();
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			LimpaTabela(DIV_TABELA);
			$(DIV_TABELA).html(erro);
			swal('Erro ao gravar alterações na família',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao gravar tela de familia',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA,actpos,cell);
				}
			);
			return;
		}

		objTabela.registros[actpos].fa_nome = $(linha+"[name=fa_nome]").val();
		objTabela.registros[actpos].pt_classfisc = $(linha+"[name=pt_classfisc]").val();
		objTabela.registros[actpos].ce_cest = $(linha+"[name=ce_cest]").val();
		objTabela.registros[actpos].fa_ipi = $(linha+"[name=fa_ipi]").val();
		objTabela.registros[actpos].fa_comiss =  $(linha+"[name=fa_comiss]").val();
		objTabela.registros[actpos].fa_cstpis = $(linha+"[name=fa_cstpis]").val();
		objTabela.registros[actpos].fa_pis = $(linha+"[name=fa_pis]").val();
		objTabela.registros[actpos].fa_cofins = $(linha+"[name=fa_cofins]").val();
		objTabela.registros[actpos].fa_imposto = $(linha+"[name=fa_imposto]").val();
		objTabela.registros[actpos].fa_redicm7 = $(linha+"[name=fa_redicm7]").val();
		objTabela.registros[actpos].fa_redicm12 = $(linha+"[name=fa_redicm12]").val();
		if(status === '+'){
			objTabela.registros[actpos].fa_number = retorno.fa_number;
			setStatus(actpos,'a',DIV_TABELA);
		}

		$('#records').val(objTabela.total);
		cancela(cell);
		// swal.close();
	});
}

//########################################################
//NÃO PERMITE O CAMPO FICAR VAZIO E TRAS FORMATAÇÃO DE NUMERO
//########################################################
function notnull(elemento){
	//PEGA O NAME DO INPUT
	var campo = $(elemento).attr('name');
	//O INPUT FA_COMISS PRECISA DE 3 CASAS DECIMASI DEPOIS DA VIRGULA
	//ENTÃO É FEITO A VALIDAÇÃO PARA SER USADA LÁ EM BAIXO
	var casa = 2;
	if(campo === 'fa_comiss' ){
		casa = 3;
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
//PESQUISA DE FORNECEDOR
//########################################################
function buscaFornecedor(){
	var texto = $('#search_fornec').val();

 	if(texto === "" || texto == $('#search_fornec').attr('pesquisa')){
 		return;
	}

 	if($('#box-inc-fornecedor').is(':visible')){
 		return;
	}

 	var naopesquisa = false;
 	if(texto.trim() === ""){
 		naopesquisa = true;
	}
 	cnsFrn_abre(texto,'box-inc-fornecedor',undefined, naopesquisa);
}

//########################################################
//RETORNO PESQUISA DE FORNECEDOR
//########################################################
function cnsFrn_retorno(){
	$('#search_fornec').attr('pesquisa',objFornecedor.fornecAbrev);
	$('#search_fornec').val(objFornecedor.fornecAbrev);
	$('#search_fornec').attr('fornec_number',objFornecedor.fornecNum);
	$('#search').focus();
}

//########################################################
//EXPORTA EXCEL
//########################################################
function exporta() {
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		return;
	}

	if(empty($.trim($(DIV_TABELA).html()))){
		return;
	}

	swal({
			title: "EXPORTAR PARA EXCEL",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			showLoaderOnConfirm: true,
			inputPlaceholder: "Digite o nome do arquivo:",
		},
		function(inputValue){
			if (inputValue === false){
				return false;
			}

			var NomeArquivo = inputValue;
			NomeArquivo = NomeArquivo.trim();
			NomeArquivo = NomeArquivo.replace(/(\s)/g, "");

			if (NomeArquivo === "") {
				swal.showInputError("Você precisa digitar um nome antes");
				return false;
			}

			window.open(encodeURI("Familia.Exec.php?funcao=excel"+
								"&arquivo=" + NomeArquivo + "&fornecedor=" + $('#search_fornec').attr('fornec_number') +
								"&ordem=" + $('#ordem').val() + "&pesquisa=" + $('#search').val() ));
			swal.close();
		}
	);
}

//########################################################
//ALTERA CLASSIFICAÇÃO FISCAL
//########################################################
function altClassFisc(){
	var actpos = $('#position').val();
	if(empty(actpos)){
		return;
	}

	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		swal({
				title:'Atenção',
				text: 'Grave o registro antes',
				type: 'warning'
			},
			function(){
				selecionaLinha(DIV_TABELA,actpos,2);
			}
		);
		return;
	}

	var linha = DIV_TABELA + " tr[posicao="+actpos+"] input";

	var funcao = "funcao=AltClassFisc&fa_number=" + $(linha+"[name=fa_number]").val() +
			  	"&pt_classfisc=" + $(linha+"[name=pt_classfisc]").val() +
				"&ce_cest=" + $(linha+"[name=ce_cest]").val() +
			  	"&fa_ipi=" + $(linha+"[name=fa_ipi]").val();

	var pergunta = "";
	if(empty($('#search_fornec').attr('fornec_number'))){
		pergunta = "Deseja altera a Classificação Fiscal, CEST e o IPI de todos os produtos desta familia?";
	}
	else{
		pergunta = "Deseja altera a Classificação Fiscal, CEST e IPI de todos os produtos desta familia, pertencentes" +
					" ao Fornecedor " + $('#search_fornec').val() + "?";
		funcao += "&fo_number=" + $('#search_fornec').attr('fornec_number');
	}

	swal({
			title: pergunta,
			type: "warning",
			showCancelButton: true,
			confirmButtonText: "Sim",
			cancelButtonText: "Não",
			closeOnConfirm: false,
			closeOnCancel: true,
			showLoaderOnConfirm: true,
		},
		function(confirmou) {
			if(!confirmou){
				return;
			}

			ajax(funcao,EXEC,function(retorno){
				retorno = json(retorno);
				if(!retorno){
					var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
					swal('Erro de Classificação',erro,'error');
					return;
				}
				if(!empty(retorno.error)){
					//ERRO
					swal({
							title:'Erro ao Alterar Classificação',
							text: retorno.mensagem,
							type: 'error'
						},
						function(){
							selecionaLinha(DIV_TABELA,actpos,2);
						}
					);
					return;
				}

				swal("Atualização bem sucedida","","success");
			});
		}
	);
}

//########################################################
//INSERE COMBO NO INPUT ESPECIFICO
//########################################################
function ComboLinha(){
	var actpos = $('#position').val();
	if(empty(actpos)){
		return;
	}

	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA) && !$(DIV_TABELA + " tr[posicao="+actpos+"]").hasClass('active')){
		return;
	}



	//COMBO DESEJADO
	var ComboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name=fa_cstpis]";

	//INPUT SELECIONADO
	var InputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name=fa_cstpis]";

	//INSERE OPTIONS NO COMBO SE FOR VAZIO
	if(empty($.trim($(ComboMor).html()))){
		$(ComboMor).append($('<option>', {value: '01', text : '1 - NORMAL' }));
		$(ComboMor).append($('<option>', {value: '02', text : '2 - DIFERENCIADA' }));
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
//TIRA COMBO NO INPUT ESPECIFICO
//#######################################################
function TiraComboLinha(){
	var actpos = $("#position").val();
	if(empty(actpos)){
		return;
	}

	//COMBO DESEJADO
	var comboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name=fa_cstpis]";

	//INPUT SELECIONADO
	var inputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name=fa_cstpis]";

	$(inputMor).val($(comboMor).val());

	//MOSTRA INPUT
	$(inputMor).show();

	//ESCONDE COMBO
	$(comboMor).hide();

	edicao($(inputMor));
}



//########################################################
//########################################################
		//FUNÇÕES DA TABELA PRINCIPAL
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
	loading.show();
	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
        if($(".ui.dimmer.consultas").dimmer('is active').every(elem => elem == false)){
            if($('#search').is(':focus')){
                $('#search_fornec').focus();
            }
            else{
                $('#search').focus();
            }
        }
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search').keypress(function(e){
		if(e.which == 13)
			monta();
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
				if (Number(actpos)+1 < $("#records").val()){
					selecionaLinha(DIV_TABELA,++actpos,cell);
				}else if(Verifica_Alteracao(DIV_TABELA)){
					insere();
				}
			break;

			case 27://ESC
				$(this).blur();
				cancela(cell);
			break;

			case 45://INSER
				if(Verifica_Alteracao(DIV_TABELA)){
					insere();
				}
			break;

			case 13://ENTER
				$(this).blur();
				grava(cell);
			break;
		}
	});

	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());
		switch ($(this).attr("name")) {
			case "fa_cstpis":
				ComboLinha();
			break;
			case "ce_cest":
				$(this).mask('99.999.99');
			break;
		}
	});

	//########################################################
	//ABRE A COMBO
	//########################################################
	$(DIV_TABELA).on('blur', 'select[name=fa_cstpis]', function(){
		TiraComboLinha();
	});

	//########################################################
	//QUANDO TIVER A CLASSE NUMBER IRÁ VERIFICAR SE A FORMATAÇÃO DE NUMERO
	//EDICAO DOS DADOS
	//########################################################
	$(DIV_TABELA).on('change', 'input', function(){
		if($(this).parent().hasClass("number")){
			notnull($(this));
		}
		edicao($(this));
	});

	//########################################################
	//QUANDO TIVER A CLASSE NUMBER IRÁ VERIFICAR AS TECLAS DIGITADAS
	//########################################################
	$(DIV_TABELA).on('keypress', 'td.number input, input[name=pt_classfisc], input[name=ce_cest]', function(event){
		if($(this).attr("name") == "ce_cest"){
			return somenteNumero(event,false,false,this);
		}
		return somenteNumero(event,true,false,this);
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR
	//########################################################
	$(DIV_TABELA).on('click', 'td:not(.inativo) input', function(){
		$(this).select();
	});

	//########################################################
	//RESETA PARAMETROS AO MUDAR FORNECEDOR
	//########################################################
	$('#search_fornec').on("change",function(){
		if(!empty($('#search_fornec').attr('fornec_number')) && ($('#search_fornec').val() !== $('#search_fornec').attr('pesquisa'))){
			$('#search_fornec').attr('fornec_number','');
		}
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search_fornec').keypress(function(e){
		if(e.which == 13)
			buscaFornecedor();
	});
});



//########################################################
//########################################################
		//FIM PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################
