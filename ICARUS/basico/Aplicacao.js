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
//OBJETO DA TABELA APLICAÇÃO
var objTabelaApl = {};
//########################################################

//########################################################
//OBJETO DA TABELA PRODUTO
var objTabelaProd = {};
//########################################################


//########################################################
//LIMITE DE REGISTROS
var LIMITE_REGISTROS = 80;
//########################################################

//########################################################
//LOCAL DO EXEC
var EXEC = '../basico/Aplicacao.Exec.php';
//########################################################


//########################################################
//TABELAS USADAS
var DIV_TABELA = '#dadosapl';
var DIV_TABELA_PROD = '#dadosprod';
//########################################################


//########################################################
//CAMPO PARA RETORNO DA CONSULTA DE PRODUTO
var CAMPO = '';
//########################################################

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
function liberaAcesso(){ // chamada pela funcao safety() esta na Icarus.Library.js
	var ind = aAcesso.indexOf('BAS.APLICACAO');
	sfApli = aNivel[ind];
	ind = aAcesso.indexOf('BAS.PROD.APLIC');
	sfTra = aNivel[ind];

	if (sfApli===undefined){ // usuario sem acesso fecha janela
		var win = window.open("","_self");
		win.close();
	}
	if (sfApli <='2'){
		$(".deleta").attr("disabled",true);
	}
	if (sfApli <= '1'){
		$(".grava").attr("disabled",true);

		$(".insere").attr("disabled",true);

		$(".cancela").attr("disabled",true);
	}
	if(sfTra <= '1'){
		$(".clona").attr("disabled",true);
	}
	load_combo();
}
//########################################################

//########################################################
//CARREGA COMBOS
//########################################################
function load_combo(){//Esta funcao carrega os combos somente se eles forem utilizados
	var funcao = "funcao=loadCombo";
	ajax(funcao,EXEC,function(retorno){
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

		//REMOVE O VALOR NEHUMA
		$("#cbMarca option:eq(0)").remove();

		//ADICIONA O VALOR TODAS
		$('#cbMarca').append($('<option>', {value: '%', text : 'Todas' }));

		//ADICIONA OS VALORES QUE VIERAM DA TABELA AUX
		$.each(retorno.marca, function (i, marca){
			$('#cbMarca').append($('<option>', {value: marca.af_descr, text : marca.af_descr }));
		});

		$('.ui.dropdown').dropdown();
		//########################################################
		//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
		//########################################################
		$('#det_aplicacao .dropdown').dropdown({
			onChange: function(value,text,itemlista) {
				$('#search').select();
			}
		});


		swal.close();
	});
}
//########################################################

//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function monta_query(){
	if($("#search_apl").is( ":focus" )){
		$('#search_apl').blur(); //para tirar o foco da pesquisa
	}

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	$(DIV_TABELA).html("<img src='../component/loading.gif' />");

	//REQUISIÇÃO AJAX
	var funcao = "order=" + $("#cbOrdem").val() +
				"&texto=" + $("#search_apl").val() +
				"&ap_marca="+ $("#cbMarca").val() +
				"&funcao=monta";
	ajax(funcao,EXEC,function(retorno){
		//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
		LimpaTabela(DIV_TABELA);

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

		$('#record-apl').val(retorno.total);
		objTabelaApl = retorno;
		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
	});
}
//########################################################

//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas(paginaAtual,totalDePaginas){
	$('#pagination_apl').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

	if(paginaAtual >= (links + 2)){
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination_apl').append("<span onclick='pagination(" + 1 + ");'>" + 1 + "</span>");
		$('#pagination_apl').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination_apl').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
			$('#pagination_apl').append("<span onclick='pagination(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}
	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination_apl').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination_apl').append("<span onclick='pagination(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
	}
}
//########################################################

//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(paginaAtual,fCustom){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		return;
	}

	var totalDePaginas = Math.ceil(objTabelaApl.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objTabelaApl.total)
		fim = objTabelaApl.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);

	//ESCONDE DETALHES
	$("#prod").hide();
	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA_PROD);

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas(paginaAtual,totalDePaginas);

	//RESETA A POSICAO
	$('#position-apl').val("null");

	//RESETA TOTAL
	$('#records-apl').val(objTabelaApl.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabelaApl.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += Apl_linha(i);
			tabela += "</tr>";
			$(DIV_TABELA).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaApl.total > 0 && empty(fCustom)){
		pintaLinha($(DIV_TABELA + ' tr:eq(0)'));
		//VOLTA O SCROLL PRA CIMA
		$(DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
	}
	else if(Verifica_Alteracao(DIV_TABELA)){
		$('#search_apl').focus();
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

//########################################################
//MONTA LINHAS
//########################################################
function Apl_linha(i){
	var aux = objTabelaApl.registros[i];
	var table = ""+
	"<td class='w20 center inativo'><input value='' readonly /></td> " +
	"<td class='w70 number inativo' ><input value='"+aux.ap_number+"' name='ap_number' maxlength='10' readonly/></td>"+
	"<td class='w380' ><input value='"+aux.ap_code+"' name='ap_code' maxlength='60' class='uppercase'/></td>" +
	"<td class='w160' >"+
		"<input value='"+aux.ap_marca+"' name='ap_marca' maxlength='60' class='uppercase'/>"+
		"<select name='ap_marca'></select>"+
	"</td>" +
	"";

	return table;
}
//########################################################

//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position-apl').val(actpos);
	$(DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');

	//EVITA COM QUE A QUERY DOS PRODUTOS SEJA MONTADA DESNECESSARIAMENTE
	if($(DIV_TABELA_PROD).attr('apl') != actpos || $('#prod').is( ":hidden" )){
		//PREPARA PARA MONTAR PARTE DOS PRODUTOS
		$("#prod").show();
		//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
		LimpaTabela(DIV_TABELA_PROD);

		//MONTA PARTE DOS PRODUTOS
		monta_query_prod();
	}
}
//########################################################

//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao(elemento){
	var actpos = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaApl.registros[actpos][campo];

	if(campo == 'ap_code'){
		$(elemento).val(function(index,value){return Tira_acento(value);});
	}

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actpos,DIV_TABELA) !== ''){
		return;
	}

	setStatus(actpos,'a',DIV_TABELA);

	Bloqueia_Linhas(actpos,DIV_TABELA);
}
//########################################################

//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela(cell){
	var actpos = $('#position-apl').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

	if(getStatus(actpos,DIV_TABELA) === 'a'){
		var td = Apl_linha(actpos);

		$(DIV_TABELA + " tr[posicao="+actpos+"]").html(td);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		selecionaLinha(DIV_TABELA,actpos,cell);
	}
	else if(getStatus(actpos,DIV_TABELA) === '+'){
		objTabelaApl.registros.splice(actpos,1);
		objTabelaApl.total -= 1;

		var paginaAtual = getPagina('#record-apl','#pagination_apl',LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

		pagination(paginaAtual,function(){
			$('#record-apl').val(objTabelaApl.total);
			if(objTabelaApl.total > 0){
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
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere(){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
		return;
	}

	if(empty(objTabelaApl)){
		objTabelaApl = {};
		objTabelaApl.registros = [];
		objTabelaApl.total = 0;
	}

	var novaPosicao = {};
	novaPosicao.ap_number = '';
	novaPosicao.ap_code = '';
	novaPosicao.ap_marca = '';

	objTabelaApl.registros.push(novaPosicao);
	objTabelaApl.total += 1;

	var actpos = objTabelaApl.total > 0 ? (objTabelaApl.total - 1) : 0;

	pagination((Math.ceil(objTabelaApl.total / LIMITE_REGISTROS)),function(){
		pintaLinha($(DIV_TABELA + " tr[posicao="+actpos+"]"));
		setStatus(actpos,'+',DIV_TABELA);
		Bloqueia_Linhas(actpos,DIV_TABELA);
		$('#record-apl').val(objTabelaApl.total);
		selecionaLinha(DIV_TABELA,actpos,2);
	});
}
//########################################################

//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui(){
	var actpos = $('#position-apl').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	if(getStatus(actpos,DIV_TABELA) !== ''){
		cancela(1);
		return;
	}

	var ap_number = objTabelaApl.registros[actpos].ap_number;

	swal({
		title: "Deseja excluir a aplicação "+ap_number+" selecionada?",
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
		var funcao = "funcao=deleta&ap_number=" + ap_number;

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
						title:'Erro ao excluir tabela aplicação',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,actpos,1);
					}
				);
				return;
			}

			objTabelaApl.registros.splice(actpos,1);
			objTabelaApl.total -= 1;
			swal.close();

			var paginaAtual = getPagina('#record',"#pagination", LIMITE_REGISTROS);

			// pagination((Math.ceil(objTabelaCli.total / LIMITE_REGISTROS)),function()
			pagination(paginaAtual,function(){
			// pagination((Math.ceil(objTabelaApl.total / LIMITE_REGISTROS)),function(){
				$('#record-apl').val(objTabelaApl.total);
				if(objTabelaApl.total > 0){
					if(actpos > 0){
						--actpos;
					}
					selecionaLinha(DIV_TABELA,actpos,1);
				}
			});
		});
	});
}
//########################################################

//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava(cell, fCustom){
	var actpos = $('#position-apl').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}
	var status = getStatus(actpos,DIV_TABELA);

	if(empty(cell)){
		cell = 1;
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
	funcao += "&ap_number=" + $(linha+":eq(1)").val() +
			  "&ap_code=" + encode_uri($(linha+":eq(2)").val()) +
			  "&ap_marca=" + $(linha+":eq(3)").val() ;

	swal.loading('Gravando dados...');

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			LimpaTabela(DIV_TABELA);
			$(DIV_TABELA).html(erro);
			swal('Erro ao gravar alterações da Aplicação',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao gravar Aplicação',
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
		objTabelaApl.registros[actpos].ap_number = retorno;
		objTabelaApl.registros[actpos].ap_code = $(linha+":eq(2)").val();
		objTabelaApl.registros[actpos].ap_marca = $(linha+":eq(3)").val();
		if(status === '+'){
			setStatus(actpos,'a',DIV_TABELA);
		}

		$('#record-apl').val(objTabelaApl.total);
		cancela(cell);
		swal.close();
		if(!empty(fCustom)){
			fCustom();
		}
	});
}
//########################################################

//########################################################
//INSERE COMBO LINHA
//########################################################
function AplicComboLinha(){//Pega as marcas e coloca no combo da linha
	var actpos = $('#position-apl').val();
	if(empty(actpos)){
		return;
	}

	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA) && !$(DIV_TABELA + " tr[posicao="+actpos+"]").hasClass('active')){
		return;
	}

	//COMBO DESEJADO
	var ComboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name=ap_marca]";

	//INPUT SELECIONADO
	var InputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name=ap_marca]";

	//INSERE OPTIONS NO COMBO SE FOR VAZIO
	if(empty($.trim($(ComboMor).html()))){
		var OptionsOriginais = $("#cbMarca").html();
		$(ComboMor).append(OptionsOriginais);
		$(ComboMor+" option:eq(0)").remove();
	}

	//VALOR QUE ESTAVA NO INPUT É O VALOR QUE APARECERÁ NO COMBO
	$(ComboMor + " option[value='"+$(InputMor).val()+"'] ").attr('selected', 'selected');

	//ESCONDE INPUT
	$(InputMor).hide();

	//MOSTRA COMBO
	$(ComboMor).show();

	//DEIXA COMBO FOCADO
	$(ComboMor).focus();
}
//########################################################

//########################################################
//RETIRA COMBO LINHA
//########################################################
function TiraAplicLinha(){
	var actpos = $("#position-apl").val();
	if(empty(actpos)){
		return;
	}

	//COMBO DESEJADO
	var ComboMor = DIV_TABELA + " tr[posicao="+actpos+"] select[name=ap_marca]";

	//INPUT SELECIONADO
	var InputMor = DIV_TABELA + " tr[posicao="+actpos+"] input[name=ap_marca]";

	$(InputMor).val($(ComboMor).val());

	//MOSTRA INPUT
	$(InputMor).show();

	//ESCONDE COMBO
	$(ComboMor).hide();

	edicao($(InputMor));
}


//########################################################
//########################################################
			//FIM FUNÇÕES DA TABELA APLICAÇÃO
//########################################################
//########################################################

























//########################################################
//########################################################
			//FUNÇÕES DA TABELA PRODUTO
//########################################################
//########################################################



//########################################################
//MONTA QUERY DA TABELA PRODUTO
//########################################################
function monta_query_prod(){
	if($("#search_prod").is( ":focus" )){
		$('#search_prod').blur();
	}

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA_PROD);
	//AMPULHETA
	$(DIV_TABELA_PROD).html("<img src='../component/loading.gif' />");


	var ap_number = $(DIV_TABELA+" tr[posicao="+$("#position-apl").val()+"] input:eq(1)").val();
	if(ap_number === "") ap_number = 0;


	//REQUISIÇÃO AJAX

	var funcao = "ap_number=" + ap_number +
							"&order=" +  $("#cbOrdemf").val() +
							"&texto=" + $("#search_prod").val() +
							"&funcao=monta_prod";

	ajax(funcao,EXEC,function(retorno){
		//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
		LimpaTabela(DIV_TABELA_PROD);

		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar tabela produto',erro,'error');
			return;
		}

		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela produto',retorno.mensagem,'error');
			return;
		}

		$('#record-prod').val(retorno.total);
		objTabelaProd = retorno;

		//EVITA COM QUE A QUERY DOS PRODUTOs SEJA MONTADA DESNECESSARIAMENTE
		$(DIV_TABELA_PROD).attr("apl",$('#position-apl').val());

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination_prod(1);
	});
}
//########################################################

//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas_prod(paginaAtual,totalDePaginas){
	$('#pagination_prod').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

	if(paginaAtual >= (links + 2)){
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination_prod').append("<span onclick='pagination_prod(" + 1 + ");'>" + 1 + "</span>");
		$('#pagination_prod').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#pagination_prod').append("<span class='active cor_padrao'>" + i + "</span>");
		}else{
			//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
			$('#pagination_prod').append("<span onclick='pagination_prod(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
		}
	}
	if(paginaAtual <= (totalDePaginas - (links + 2))){
		$('#pagination_prod').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
		//CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
		$('#pagination_prod').append("<span onclick='pagination_prod(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
	}
}
//########################################################

//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination_prod(paginaAtual,fCustom){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA_PROD)){
		return;
	}

	var totalDePaginas = Math.ceil(objTabelaProd.total / LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

	var fim = paginaAtual * LIMITE_REGISTROS;
	if(fim > objTabelaProd.total)
		fim = objTabelaProd.total;
	var inicio = ((paginaAtual - 1) * LIMITE_REGISTROS);

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	montaPaginas_prod(paginaAtual,totalDePaginas);

	//RESETA A POSICAO
	$('#position-prod').val("null");

	//RESETA TOTAL
	$('#records-prod').val(objTabelaProd.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA_PROD);
	if(objTabelaProd.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += Prod_linha(i);
			tabela += "</tr>";
			$(DIV_TABELA_PROD).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaProd.total > 0 && empty(fCustom)){
		pintaLinha_prod($(DIV_TABELA_PROD + ' tr:eq(0)'));
		//VOLTA O SCROLL PRA CIMA
		$(DIV_TABELA_PROD).animate({ scrollTop: "=0" }, "fast");
	}
	else if(Verifica_Alteracao(DIV_TABELA)){
		$('#search_prod').focus();
	}

	if(!empty(fCustom)){
		fCustom();
	}

	//TRANSFORMA EM SCROLL PADRÃO
	$(DIV_TABELA_PROD).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}
//########################################################

//########################################################
//MONTA LINHAS
//########################################################
function Prod_linha(i){
	var aux = objTabelaProd.registros[i];

	var table =	"" +
		"<td class='w20 center inativo'><input value='' readonly /></td> " +
		"<td class='w140 inativo' ><input value='"+aux.pt_code+"' name='pt_code' pt_code='"+aux.pt_code+"'maxlength='' class='uppercase' readonly/></td>"+
		"<td class='w150'><input value='"+aux.pa_codeorig+"' name='pa_codeorig' maxlength='16' class='uppercase'/></td>" +
		"<td class='w300 inativo' ><input value='"+aux.pt_descr+"' name='pt_descr' class='uppercase'/></td>" +
		"";
	return table;
}
//########################################################

//########################################################
//PINTA AS LINHAS
//########################################################
function pintaLinha_prod(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#position-prod').val(actpos);
	$(DIV_TABELA_PROD + ' .active').removeClass('active');
	$(elemento).addClass('active');

	//SE TIVER INSERINDO OU ALTERANDO NÃO ATUALIZA OS DETALHES
	if(getStatus(actpos,DIV_TABELA_PROD) === 'a' || getStatus(actpos,DIV_TABELA_PROD) === '+') return;

	$('#det4').val(objTabelaProd.registros[actpos].pa_obs);
	$('#det5').val(objTabelaProd.registros[actpos].pa_motor);
	$('#det6').val(objTabelaProd.registros[actpos].pa_ano);
}
//########################################################

//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao_prod(elemento){
	var actpos = $(elemento.parent().parent()).attr('posicao');
	actpos = $('#position-prod').val();
	var campo = $(elemento).attr('name');
	var original = objTabelaProd.registros[actpos][campo];

	if(campo == 'pa_codeorig'){
		$(elemento).val(function(index,value){return Tira_acento(value);});
	}

	//NAO HOUVE ALTERACAO
	if($(elemento).val() == original || getStatus(actpos,DIV_TABELA_PROD) !== ''){
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA)){
		swal({
				title:'Erro ao mudar informações',
				text: 'Grave alterações feitas na tabela aplicação antes',
				type: 'error'
			},
			function(){
				selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
				$(elemento).val(objTabelaProd.registros[actpos][campo]);
			}
		);
		return;
	}

	setStatus(actpos,'a',DIV_TABELA_PROD);
	Bloqueia_Linhas(actpos,DIV_TABELA_PROD);
}
//########################################################

//########################################################
//INSERE NOVA LINHA E NOVO REGISTRO
//########################################################
function insere_prod(){
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA)){
		swal({
				title:'Erro de inserção',
				text: 'Grave alterações feitas na tabela aplicação antes',
				type: 'error'
			},
			function(){
				selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
			}
		);
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA_PROD)){
		selecionaLinha(DIV_TABELA_PROD,$("#position-prod").val(),2);
		return;
	}

	if(empty(objTabelaProd)){
		objTabelaProd = {};
		objTabelaProd.registros = [];
		objTabelaProd.total = 0;
	}

	var novaPosicao = {};
	novaPosicao.pt_code = '';
	novaPosicao.pa_codeorig = '';
	novaPosicao.pt_descr = '';
	novaPosicao.pa_obs = '';
	novaPosicao.pa_motor = '';
	novaPosicao.pa_ano = '';


	objTabelaProd.registros.push(novaPosicao);
	objTabelaProd.total += 1;

	var actpos = objTabelaProd.total > 0 ? (objTabelaProd.total - 1) : 0;

	pagination_prod((Math.ceil(objTabelaProd.total / LIMITE_REGISTROS)),function(){
		pintaLinha_prod($(DIV_TABELA_PROD + " tr[posicao="+actpos+"]"));
		setStatus(actpos,'+',DIV_TABELA_PROD);
		Bloqueia_Linhas(actpos,DIV_TABELA_PROD);
		$('#record-prod').val(objTabelaProd.total);
		selecionaLinha(DIV_TABELA_PROD,actpos,1);
		$(DIV_TABELA_PROD + " tr[posicao="+actpos+"] input:eq(1)").removeAttr("readonly");
	});
}
//########################################################

//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela_prod(cell){
	var actpos = $('#position-prod').val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 1;
	}

	//EDICAO
	if(getStatus(actpos,DIV_TABELA_PROD) === 'a'){
		var tr = Prod_linha(actpos);

		$(DIV_TABELA_PROD + " tr[posicao="+actpos+"]").html(tr);

		Desbloqueia_Linhas(actpos,DIV_TABELA_PROD);

		selecionaLinha(DIV_TABELA_PROD,actpos,cell);
	}
	else if(getStatus(actpos,DIV_TABELA_PROD) === '+'){
		objTabelaProd.registros.splice(actpos,1);
		objTabelaProd.total -= 1;

		var paginaAtual = getPagina('#record-prod','#pagination_prod',LIMITE_REGISTROS);

		Desbloqueia_Linhas(actpos,DIV_TABELA_PROD);

		pagination_prod(paginaAtual,function(){
			$('#record-prod').val(objTabelaProd.total);
			if(objTabelaProd.total > 0){
				if(actpos > 0){
					--actpos;
				}
				selecionaLinha(DIV_TABELA_PROD,actpos,cell);
			}
		});
	}
	else if(getStatus(actpos,DIV_TABELA_PROD) === ''){
		selecionaLinha(DIV_TABELA_PROD,actpos,cell);
	}
}
//########################################################

//########################################################
//EXCLUI LINHA E REGISTRO
//########################################################
function exclui_prod(){
	if(!Verifica_Alteracao(DIV_TABELA)){
		swal({
				title:'Erro de exclusão',
				text: 'Grave alterações feitas na tabela aplicação antes',
				type: 'error'
			},
			function(){
				selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
			}
		);
		return;
	}

	var actpos = $('#position-prod').val();//POSICAO DO REGISTRO NO JSON
	if(actpos === 'null'){
		swal('Erro de exclusão','É necessário selecionar uma linha','error');
		return;
	}

	if(!Verifica_Alteracao(DIV_TABELA_PROD)){
		cancela_prod(1);
		return;
	}

	var ap_number = objTabelaApl.registros[$('#position-apl').val()].ap_number;
	var pt_code = objTabelaProd.registros[actpos].pt_code;
	var pa_codeorig = objTabelaProd.registros[actpos].pa_codeorig;


	swal({
		title: "Deseja excluir o produto "+pt_code+" da aplicação "+ap_number+" ?",
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

		var funcao = "ap_number=" + ap_number + "&pt_code=" + pt_code + "&pa_codeorig="+pa_codeorig + "&funcao=deleta_prod";

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
						title:'Erro ao excluir parametro',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA_PROD,actpos,1);
					}
				);
				return;
			}

			objTabelaProd.registros.splice(actpos,1);
			objTabelaProd.total -= 1;
			swal.close();

			pagination_prod((Math.ceil(objTabelaProd.total / LIMITE_REGISTROS)),function(){
				$('#record-prod').val(objTabelaProd.total);
				if(objTabelaProd.total > 0){
					if(actpos > 0){
						--actpos;
					}
					selecionaLinha(DIV_TABELA_PROD,actpos,2);
				}
			});
		});
	});
}
//########################################################

//########################################################
//GRAVA OU ALTERA LINHA E REGISTRO
//########################################################
function grava_prod(cell, fCustom){
	if(!Verifica_Alteracao(DIV_TABELA)){
		swal({
				title:'Erro ao gravar',
				text: 'Grave alterações feitas na aplicação antes',
				type: 'error'
			},
			function(){
				selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
			}
		);
		return;
	}

	var actpos = $('#position-prod').val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}
	var status = getStatus(actpos,DIV_TABELA_PROD);

	if(empty(cell)){
		cell = 2;
	}

	//NÃO HOUVE ALTERAÇÃO
	if(status === ''){
		selecionaLinha(DIV_TABELA_PROD,actpos,cell);
		return;
	}

	//PEGA EM FORMA DE array() OS INPUTS QUE ESTAO DENTRO DA MINHA LINHA SELECIONADA
	var linha = DIV_TABELA_PROD + " tr[posicao="+actpos+"] input";
	var ap_number = objTabelaApl.registros[$('#position-apl').val()].ap_number;

	//INICIA A VARIAVEL DE FUNCAO
	var funcao = "funcao=grava_prod&comando=" + (status == '+' ? 'insert' : 'update');
	funcao += "&ap_number=" + ap_number +
			  "&pt_code=" + $(linha+":eq(1)").val() +
			  "&pa_codeorig=" + $(linha+":eq(2)").val() +
			  "&pa_obs=" + encode_uri($('#det4').val()) +
			  "&pa_motor=" + $('#det5').val() +
			  "&pa_ano=" + $('#det6').val() +
			  "&pt_code_original=" + objTabelaProd.registros[actpos].pt_code;


	swal.loading('Gravando dados...');

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
			LimpaTabela(DIV_TABELA_PROD);
			$(DIV_TABELA_PROD).html(erro);
			swal('Erro ao gravar alterações do produto',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao alterar parametro',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA_PROD,actpos,cell);
				}
			);
			return;
		}
		if(retorno.tipo === 'X'){
			swal({
					title:'Erro ao inserir novo produto',
					text: "Códgido do produto é invalido",
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
				}
			);
			return;
		}

		//VOU ATUALIZAR O MEU OBJETO JSON
		objTabelaProd.registros[actpos].pt_code = $(linha+":eq(1)").val();
		objTabelaProd.registros[actpos].pa_codeorig = $(linha+":eq(2)").val();
		objTabelaProd.registros[actpos].pt_descr = retorno.tipo.substring(1);
		objTabelaProd.registros[actpos].pa_obs = $('#det4').val();
		objTabelaProd.registros[actpos].pa_motor = $('#det5').val();
		objTabelaProd.registros[actpos].pa_ano = $('#det6').val();

		if(status === '+'){
			setStatus(actpos,'a',DIV_TABELA_PROD);
		}
		$('#record-prod').val(objTabelaProd.total);
		cancela_prod(cell);
		swal.close();
		if(!empty(fCustom)){
			fCustom();
		}
	});
}
//########################################################

//########################################################
//INSERE NOVO PRODUTO COM O DBLCLICK
//########################################################
function insereProd(){
	if(!Verifica_Alteracao(DIV_TABELA) || !Verifica_Alteracao(DIV_TABELA_PROD)){
		swal({
				title:'Erro ao inserir novo produto',
				text: 'Grave alterações feitas na aplicação/produto antes',
				type: 'error'
			},
			function(){
				selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
			}
		);
		return;
	}

	var pt_code = $("#codProd").val();
	if (pt_code === "") return;

	var ap_number = objTabelaApl.registros[$('#position-apl').val()].ap_number;
	var message = "";
	if (ap_number === ""){
		message +='Aplicação não selecionada\n';
	}

	var pa_codeorig = $("#codOEM").val();
	if (pa_codeorig === ""){
		message +='O codigo OEM não pode ser nulo!\n';
	}
	if (message === "" ){

		var funcao = "ap_number=" + ap_number +
					"&pt_code="+pt_code+
					"&pa_codeorig="+pa_codeorig +
					"&funcao=insereProd";

		swal.loading('Gravando dados...');

		ajax(funcao,EXEC,function(retorno){
			retorno = json(retorno);
			if(!retorno){
				var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
				LimpaTabela(DIV_TABELA_PROD);
				$(DIV_TABELA_PROD).html(erro);
				swal('Erro ao inserir novo produto',erro,'error');
				return;
			}

			if(!empty(retorno.error)){
				swal({
						title:'Erro ao inserir novo produto',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
					}
				);
				return;
			}
			//SE O CÓDIGO DO PRODUTO FOR INVAIDO EXIBE A MENSAGEM
			if(retorno.tipo === 'X'){
				swal({
						title:'Erro ao inserir novo produto',
						text: "Códgido do produto é invalido",
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
					}
				);
				return;
			}

			//VOU ATUALIZAR O MEU OBJETO JSON
			insere_prod();
			objTabelaProd.registros[$("#position-prod").val()].pt_code = pt_code;
			objTabelaProd.registros[$("#position-prod").val()].pa_codeorig = pa_codeorig;
			objTabelaProd.registros[$("#position-prod").val()].pt_descr = retorno.tipo.substring(1);


			var status = getStatus($("#position-prod").val(),DIV_TABELA_PROD);

			if(status === '+'){
				setStatus($("#position-prod").val(),'a',DIV_TABELA_PROD);
			}

			$('#record-prod').val(objTabelaProd.total);
			cancela_prod(1);
			swal.close();
		});
	}else{
		swal({
				title:'Erro ao inserir novo produto',
				text: message,
				type: 'error'
			},
			function(){
					selecionaLinha(DIV_TABELA,$('#position-apl').val(),2);
			}
		);
	}

}
//########################################################

//########################################################
//DUPLICA PRODUTO
//########################################################
function DuplicaProduto(){
	if(!Verifica_Alteracao(DIV_TABELA) || !Verifica_Alteracao(DIV_TABELA_PROD)){
		var ap_code = !Verifica_Alteracao(DIV_TABELA) ? "aplicação" : "";
		var prod = !Verifica_Alteracao(DIV_TABELA_PROD) ? "produto" : "";
		swal({
				title:'Erro abrir clone',
				text: 'Grave alterações feitas na tabela '+ap_code+"  "+prod+' antes',
				type: 'error'
			},
			function(){
				if(!empty(prod)){
					selecionaLinha(DIV_TABELA_PROD,$('#position-prod').val(),1);
				}
				else if(!empty(ap_code)){
					selecionaLinha(DIV_TABELA,$('#position-apl').val(),1);
				}
			}
		);
		return;
	}

	var actpos = $("#position-apl").val();
	var actposf = $("#position-prod").val();
	if(actpos === "null" || actpos === ""){
		swal({
				title:'Erro ao duplicar produto',
				text: "Aplicação não selecionada",
				type: 'error'
			},
			function(){
				$("#codAplic").focus();
			}
		);
		return;
	}
	else if(actposf === "null" || actposf === ""){
		swal({
				title:'Erro ao duplicar produto',
				text: 'Porduto não selecionado',
				type: 'error'
			},
			function(){
				$("#codAplic").focus();
			}
		);
		return;
	}

	var ap_number = $(DIV_TABELA + " tr[posicao="+actpos+"] input:eq(1)").val();
	var pt_code = $(DIV_TABELA_PROD + " tr[posicao="+actposf+"] input:eq(1)").val();
	var pa_codeorig = $(DIV_TABELA_PROD + " tr[posicao="+actposf+"] input:eq(2)").val();
	var ap_numberClona = $("#codAplic").val();
	var message = "";
	if(ap_number === ""){
		message +='Aplicação não pode ser vazia\n';
	}
	if(pt_code === ""){
		message +='Produto não pode ser vazio\n';
	}
	if(pa_codeorig === ""){
		message +='Codigo OEM é obrigatorio\n';
	}
	if(ap_numberClona === ""){
		message += 'Numero da aplicação a ser transferida é obrigatória\n';
	}
	if (message === "" ){
		var funcao = "ap_number=" + ap_number  + "&ap_numberClona=" + ap_numberClona + "&pt_code=" + pt_code + "&pa_codeorig=" + pa_codeorig + "&funcao=DuplicaProdAplic";
		ajax(funcao,EXEC,function(retorno){
			retorno = json(retorno);
			if(!retorno){
				var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				swal('Erro ao gravar alterações do produto',erro,'error');
				return;
			}

			if(!empty(retorno.error)){
				swal({
						title:'Erro ao clonar produto',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,actpos,1);
					}
				);
				return;
			}
			if(retorno.ret == 'O'){
				swal({
						title:'Erro ao clonar produto',
						text: "Produto já cadastro na aplicação",
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,actpos,1);
					}
				);
				return;
			}

			swal('Produto clonado',"Produto "+pt_code+" clonado com Sucesso para a aplicação "+ap_numberClona+"",'sucess');
		});
	}
	else{
		swal({
				title:'Erro ao inserir novo produto',
				text: message,
				type: 'error'
			},
			function(){
				$("#codAplic").focus();
			}
		);
	}
}
//########################################################

//########################################################
//PESQUISA DE PRODUTO
//########################################################
function buscaProduto(){
	var actpos = $('#position-prod').val();

	var codigo = $(CAMPO).val();

    if (codigo.trim() === ''){
        return;
    }

	if(codigo == $(CAMPO).attr('pt_code')){
        return;
    }

    swal.loading('Pesquisando produto');
    fechaSwalProd();
    cnsPrd_abre(codigo.trim(), 'box-inc-produto', 'cod');
}
//########################################################

//########################################################
//FECHA SWAL DA PESQUISA DE PRODUTO
//########################################################
function fechaSwalProd(){
	if($('#box-inc-produto').hasClass('active') ){
        swal.close();
    }else{
        setTimeout(function(){
            fechaSwalProd();
        },400);
    }
}
//########################################################

//########################################################
//RETORNO DA PESQUISA DE PRODUTO
//########################################################
function cnsPrd_retorno(){
    var ptcode = objProduto.codigo;
    //PREENCHE INFORMAÇÕES NA TABELA
	$(CAMPO).val(ptcode);
	$(CAMPO).attr('pt_code', ptcode);
	//RETORNA O FOCO PARA O PROXIMO CAMPO
	if(CAMPO == "#codProd") $("#codOEM").focus();
	else{
		$(DIV_TABELA_PROD + " tr[posicao="+actpos+"] input[name=pa_codeorig]").focus();
		validaCodigoProd(CAMPO);
	}
}
//########################################################

//########################################################
//VALIDA CÓDIGO DO PRODUTO
//########################################################
function validaCodigoProd(codProd){
	var pt_code = $(codProd).val();
	if(pt_code === "") {
		return;
	}
	var funcao = "funcao=validacodigo" + "&pt_code="+ pt_code;
	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor. \nEntre em contato com  o suporte da pennacorp!";
			//EVITA QUE O SCROLL SE PERCA SEMPRE QUE  A TABELA É LIMPA
			$(codProd).val("");
			$(DIV_TABELA_PROD).html(erro);
			swal('Erro ao verificar código do produto' , erro, 'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
					title:'Erro ao verificar código do produto',
					text: retorno.mensagem,
					type: 'error'
				},
				function(){
					selecionaLinha(DIV_TABELA_PROD);
				}
			);
			$(codProd).val("");
			return;
		}
		if (retorno.pt_descr == 'X'){
			swal('Erro ao validar código','O codigo do produto não é valido','error');
			$(codProd).val("");
			return;
		}
		$(DIV_TABELA_PROD + " tr[posicao="+actpos+"] input[name=pt_descr]").val(retorno.pt_descr.substring(1));
	});
}






//########################################################
//########################################################
			//FIM FUNÇÕES DA TABELA PRODUTO
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

	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		if($('#search_apl').is(":focus") && !$('#prod').is( ":hidden" ))
			$('#search_prod').focus();
		else $('#search_apl').focus();
	});

	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search_apl').keypress(function(e){
		if(e.which == 13)
			monta_query();
	});

	//########################################################
	//RESETA PARAMETROS AO TROCAR A ORDEM DO COMBO
	//########################################################
	$('#cbOrdem').on("change",function(){
		$('#search_apl').val('');
		$('#search_apl').select();
	});

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA
	//########################################################
	$(DIV_TABELA).on("keypress keyup change", 'input',function(e){
		var actpos = Number($("#position-apl").val());
		var cell = $(this).parent().index();
		ao_terminar = "";
		
		if(e.type == "change"){
			edicao($(this));
		}
		
		if(e.type == "keyup"){
			switch (e.which) {
				case 38: //PARA CIMA
					// if(actpos > 0){
					// 	selecionaLinha(DIV_TABELA,--actpos,cell);
					// }
					edicao($(this));

					ao_terminar = function() {
						if (actpos > 0) {
							selecionaLinha(DIV_TABELA,--actpos,cell);
						}
						else if(actpos == 0){
		                    $("#search_apl").select();
		                }
					};

					if(!Verifica_Alteracao(DIV_TABELA)){
						grava(cell, function() { ao_terminar(); });
						return;
					}

					ao_terminar();

				break;

				case 40://PARA BAIXO
					// if (Number(actpos)+1 < $("#record-apl").val()){
					// 	selecionaLinha(DIV_TABELA,++actpos,cell);
					// }else if(Verifica_Alteracao(DIV_TABELA)){
					// 	insere();
					// }
					edicao($(this));

					ao_terminar = function() {
						if (actpos+1 < $("#record-apl").val()){
							selecionaLinha(DIV_TABELA,++actpos,cell);
						}else{
							insere();
						}
					};

					if(!Verifica_Alteracao(DIV_TABELA)){
						grava(cell, function() { ao_terminar(); });
						return;
					}

					ao_terminar();

				break;

				case 27://ESC
					// $(this).blur();
					// cancela(cell);
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
	// 		case 13://ENTER
	// 			$(this).blur();
	// 			grava(cell);
	// 		break;
	// 	}
	// });

	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());

	});

	//########################################################
	//EDICAO DOS DADOS
	//########################################################
	// $(DIV_TABELA).on('change', 'input', function(){
	// 	edicao($(this));
	// });

	//########################################################
	//COLOCA O COMBOBOX DE MARCAS
	//########################################################
	$(DIV_TABELA).on("focus",'td:last-child input',function(){
		AplicComboLinha();
	});

	//########################################################
	//RETIRA O COMBOBOX DE MARCAS
	//########################################################
	$(DIV_TABELA).on("blur",'td:last-child select',function(){
		TiraAplicLinha();
	});

	//########################################################
	//DOUBLE CLICK INSERE NOVO PRODUTO
	//########################################################
	$(DIV_TABELA).on("dblclick", 'input',function(){
		insereProd();
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - TABELA APLICAÇÃO
	//########################################################
	$(DIV_TABELA).on('click', 'td:not(.inativo) input', function(){
		$(this).select();
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - PESQUISA APLICAÇÃO
	//########################################################
	$("#search_apl").on('click', function(){
		$(this).select();
	});

	//########################################################
	//KEYPRESS SÓ PERMITE NÚMEROS NO CAMPO PESQUISA APLICAÇÃO
	//########################################################
	$("#search_apl").on("keypress", function(e){
		if($("#cbOrdem").val() === 0){
		    if((event.keyCode != 44 || event.keyCode != 31) && (event.keyCode < 48 || event.keyCode > 57)){
		        return false;
		    }
		}
	});


























	//########################################################
	//REALIZA PESQUISA AO APERTAR ENTER
	//########################################################
	$('#search_prod').keypress(function(e){
		if(e.which == 13)
			monta_query_prod();
	});

	//########################################################
	//RESETA PARAMETROS AO TROCAR A ORDEM DO COMBO
	//########################################################
	$('#cbOrdemf').on("change",function(){
		$('#search_prod').val('');
		$('#search_prod').select();
	});

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA_PROD
	//########################################################
	$(DIV_TABELA_PROD).on("keypress keyup change", 'input',function(e){
		var actpos = Number($("#position-prod").val());
		var cell = $(this).parent().index();
		ao_terminar = "";

		
		if(e.type == "change"){
			edicao_prod($(this));
		}
		
		if(e.type == "keyup"){
			switch (e.which) {
				case 38: //PARA CIMA
					// if(actpos > 0){
					// 	selecionaLinha(DIV_TABELA,--actpos,cell);
					// }
					edicao_prod($(this));

					ao_terminar = function() {
						if (actpos > 0) {
							selecionaLinha(DIV_TABELA_PROD,--actpos,cell);
						}
						else if(actpos == 0){
		                    $("#search_apl").select();
		                }
					};

					if(!Verifica_Alteracao(DIV_TABELA_PROD)){
						grava_prod(cell, function() { ao_terminar(); });
						return;
					}

					ao_terminar();

				break;

				case 40://PARA BAIXO
					// 	if (Number(actpos)+1 < $("#record-prod").val()){
					// 		selecionaLinha(DIV_TABELA_PROD,++actpos,cell);
					// 	}else if(Verifica_Alteracao(DIV_TABELA_PROD)){
					// 		insere_prod();
					// 	}
					// break;
					edicao_prod($(this));

					ao_terminar = function() {
						if (actpos+1 < $("#record-prod").val()){
							selecionaLinha(DIV_TABELA_PROD,++actpos,cell);
						}else{
							insere_prod();
						}
					};

					if(!Verifica_Alteracao(DIV_TABELA_PROD)){
						grava_prod(cell, function() { ao_terminar(); });
						return;
					}

					ao_terminar();

				break;

				case 27: 
				// 	$(this).blur();
				// 	cancela_prod(cell);	
				// break;

					edicao_prod($(this));
					cancela_prod(cell);
				break;

				case 45://INSERT
					if(Verifica_Alteracao(DIV_TABELA_PROD)){
						insere_prod();
					}
				break;
			}
		}
		if(e.type === 'keypress'){
			switch (e.which) {
				case 13://ENTER
					edicao_prod($(this));
					grava_prod(cell);
				break;
			}
		}
	});
	// 		case 13://ENTER
	// 			$(this).blur();
	// 			grava(cell);
	// 		break;
	// 	}
	// });


	//########################################################
	//KEYUP DUPLICA PRODUTO
	//########################################################
	$("#navigatorf").on("keyup", 'button[name=codAplic]',function(e){
		if (e.which==13){
			DuplicaProduto();
		}
	});

	//########################################################
	//KEYPRESS SÓ PERMITE NÚMEROS NO CAMPO N.APLIC
	//########################################################
	$("#navigatorf").on("keypress", 'input[name=codAplic]',function(e){
	    if((event.keyCode != 44 || event.keyCode != 31) && (event.keyCode < 48 || event.keyCode > 57)){
	        return false;
	    }
	});

	//########################################################
	//ONCLICK BUTTON CLONAR
	//########################################################
	$("#navigatorf").on("click", 'button[name=btnClona]',function(e){
		DuplicaProduto();
	});

	//########################################################
	//SELECAO DAS LINHAS
	//########################################################
	$(DIV_TABELA_PROD).on("focus", 'input',function(){
		pintaLinha_prod($(this).parent().parent());
	});

	// //########################################################
	// //EDICAO DOS DADOS
	// //########################################################
	// $(DIV_TABELA_PROD).on('change', 'input', function(){
	// 	edicao_prod($(this));
	// });

	//########################################################
	//EDICAO DOS DETALHES
	//########################################################
	$("#detalhesf").on('change', 'input', function(){
		edicao_prod($(this));
	});

	//########################################################
	//BUSCA CÓDIGO DO PRODUTO - INSEREPROD(DOUBLE CLICK)
	//########################################################
	$("#detalhes").on("blur",'input[name=codProd]',function(){
		CAMPO = ("#codProd");
		buscaProduto();
	});
	//########################################################
	//BUSCA CÓDIGO DO PRODUTO - INSEREPROD(DOUBLE CLICK)
	//########################################################
	$("#detalhes").on("keyup",'input[name=codProd]',function(e){
		if(e.which == 13){
			CAMPO = ("#codProd");
			buscaProduto();
		}
	});

	//########################################################
	//BUSCA CÓDIGO DO PRODUTO - TABLEA PRODUTO
	//########################################################
	$(DIV_TABELA_PROD).on("blur",'td:nth-child(2) input',function(){
		actpos = $("#position-prod").val();
		CAMPO = (DIV_TABELA_PROD + " tr[posicao="+actpos+"] input[name=pt_code]");
		buscaProduto();
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - TABELA DE PRODUTO
	//########################################################
	$(DIV_TABELA_PROD).on('click', 'td:not(.inativo) input', function(){
		$(this).select();
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - INSERE PRODUTO COM DOUBLE CLICK
	//########################################################
	$("#localizaG").on('click', 'input', function(){
		$(this).select();
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - NAVIGATOR PRODUTO
	//########################################################
	$("#navigatorf").on('click', 'input', function(){
		$(this).select();
	});

	//########################################################
	//SELECIONA O CONTEUDO DO INPUT QUANDO CLICAR - DETALHES PRODUTO
	//########################################################
	$("#detalhesf").on('click', 'input', function(){
		$(this).select();
	});


	//########################################################
	//DEIXA O USUARIO ARRASTAR A DIV
	//########################################################
	$(function() {
		$( "#box-inc-produto").draggable({
			cursor: "move",
			handle: ".box-consulta-titulo"
		});
	});
});

//########################################################
//########################################################
//FIM PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################
