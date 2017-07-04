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
//LIMITE DE REGISTROS
var LIMITE_REGISTROS = 80;
//########################################################


//########################################################
var objTabelaEmpresa = {}; //OBJETO DA TABELA EMPRESA
//########################################################


//########################################################
//LOCAL DO EXEC
var EXEC = "../basico/Empresa.Exec.php";
//########################################################


//########################################################
//TABELAS USADAS
var DIV_TABELA = "#dadosemp";
var DIV_TABELA_DETALHES = "#divDetalhes";
//########################################################


//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################

























//########################################################

//########################################################
//LIBERA ACESSOS
//########################################################
function liberaAcesso(){// chamada pela funcao safety() esta na Icarus.Library.js

	swal.loading("Carregando Dados...");

	if (!TestaAcesso('ADM.EMPRESA')) { //usuario sem acesso fecha janela
		swal({
				title: "Atenção",
				text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
					  "Nome do acesso necessário: ADM.EMPRESA",
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

	if (!TestaAcesso('ADM.EMPRESA', 3)) {
		$("#deleta").attr("disabled", 'disabled');
		$("#clone").attr("disabled", 'disabled');
		$("#estoque").attr("disabled", 'disabled');
	}
	if (!TestaAcesso('ADM.EMPRESA', 2)) {
		$("#insere").attr("disabled", 'disabled');
		$("#grava").attr("disabled", 'disabled');
		$("#cancela").attr("disabled", 'disabled');
	}

	$('.ui.dropdown').dropdown();

	//########################################################
	//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
	//########################################################
	$('#det_empresa .dropdown').dropdown({
		onChange: function() { $('#search').val('').select(); }
	});

	bloqueia_detalhes(true);
	swal.close();

	monta_query();
}
//########################################################





//########################################################
//MONTA QUERY PRINCIPAL
//########################################################
function monta_query(){
	if($("#search").is(":focus")){
		$('#search').blur(); //para tirar o foco da pesquisa
	}

	LimpaTabela(DIV_TABELA);
	$(DIV_TABELA).html("<img src='../component/loading.gif' />");

	//MONTA A FUNCAO
	var funcao = encodeURI("ordem=" + $("#cbOrdem").val() +
							"&busca=" + $("#search").val() +
							"&funcao=monta");

	ajax(funcao,EXEC,function(retorno){
		retorno = json(retorno);
		if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
			swal('Erro ao montar Empresas',erro,'error');
			return;
		}
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de empresas',retorno.mensagem,'error');
			return;
		}

		$('#record').val(retorno.total);
		objTabelaEmpresa = retorno;

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		pagination(1);
		$('#search').select();
	});
}
//########################################################


//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(pagina, fCustom){
  var totalDePaginas = Math.ceil(objTabelaEmpresa.total / LIMITE_REGISTROS);

  if(pagina > totalDePaginas){
		pagina = totalDePaginas;
	}

	var fim = pagina * LIMITE_REGISTROS;
	if(fim > objTabelaEmpresa.total)
		fim = objTabelaEmpresa.total;
	var inicio = ((pagina - 1) * LIMITE_REGISTROS);

	//REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL


	// LIMPA CAMPOS DA TABELA | DETALHES | IMPOSTOS
	LimpaTabela(DIV_TABELA);
	$(DIV_TABELA_DETALHES + " input[type=text]").val("");
	$(DIV_TABELA_DETALHES + " select").val("option:eq(1)");

	montaPaginas(pagina,totalDePaginas);

	//RESETA A POSICAO
	$('#position').val("null");

	//RESETA TOTAL
	$('#record').val(objTabelaEmpresa.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA);
	if(objTabelaEmpresa.total > 0){
		for(var i = inicio; i < fim; i++){
			var tabela = "<tr posicao=" + i + ">";
			tabela += monta_linha(i);
			tabela += "</tr>";
			$(DIV_TABELA).append(tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	if(objTabelaEmpresa.total > 0 && empty(fCustom)){
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
	if(objTabelaEmpresa.total === 0){
		$('#search').focus();
		bloqueia_detalhes(true);
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
	var fim = ((paginaAtual + links) < total ? ((paginaAtual + links)+1) : total);


	if(paginaAtual >= (links + 2)){
	   $('#pagination').append("<span onclick='pagination(" + 1 + ");'>" + 1 + "</span>");
	   $('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
	   if(i == paginaAtual){
		   $('#pagination').append("<span class='active cor_padrao'>" + i + "</span>");
	   }else{
		   $('#pagination').append("<span onclick='pagination(" + i + "); class='cor_padraoInvert_hover'>" + i + "</span>");
	   }
	}
	if(paginaAtual <= (total - (links + 2))){
	   $('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
	   $('#pagination').append("<span onclick='pagination(" + total + ");' class='cor_padraoInvert_hover'>" + total + "</span>");
	}
}
//########################################################


//########################################################
//MONTA LINHAS
//########################################################
function monta_linha(i){
	var aux = objTabelaEmpresa.registros[i];

	//MONTA A LINHA
	var table =	"" +
		"<td class='w20 inativo center'><input value='' tabindex='-1' readonly /></td>"+
        "<td class='w40 number inativo'><input value='"+aux.em_number+"' name='em_number' tabindex='-1' readonly/></td>"+
        "<td class='w60 center'>"+
            "<input value='"+aux.em_grupo+"' name='em_grupo' class='uppercase'/>"+
            "<select name='em_grupo'></select>"+
        "</td>"+
        "<td class='w200'><input value='"+aux.em_abrev+"' name='em_abrev' class='uppercase' maxlength='20' /></td>"+
        "<td class='w330'><input value='"+aux.em_razao+"' name='em_razao' class='uppercase' maxlength='40' /></td>"+
        "<td class='w70 number'><input value='"+aux.em_icms+"' name='em_icms' maxlength='8' /></td>";

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

	var aux = objTabelaEmpresa.registros[actpos];

	if(!empty(aux.em_number)){
		$('#em_imagem').prop("src","../basico/Empresa.Exec.php?number="+aux.em_number+"&funcao=imagem&troca=F");
	}
	else{
		$('#em_imagem').prop("src","../imagens/imgNaoDisponivel.png");
	}

	monta_detalhes(actpos);
}
//########################################################


//########################################################
//MONTA OS INPUTS DA DIV DETALHES
//########################################################
function monta_detalhes(actpos){
	$(DIV_TABELA_DETALHES + " input[name=em_ligada]").val('F');
	$(DIV_TABELA_DETALHES + " input[name=em_armazem]").val('F');
	$(DIV_TABELA_DETALHES + " input[name=em_calc_ipi]").val('F');
	$(DIV_TABELA_DETALHES + " input[name=em_substrib]").val('F');
	if(empty(actpos)){
		return;
	}
	jQuery.each(objTabelaEmpresa.registros[actpos], function(key,value){
		var campo = key;
		$(DIV_TABELA_DETALHES + " input[name="+key+"]").val(value);

		if(campo == 'em_muncod' || campo == 'em_paiscod'){
			$(DIV_TABELA_DETALHES + " input[name="+key+"]").attr(key,value);
		}

		var linha;
		if(campo == "em_ligada" || campo == "em_armazem" || campo == "em_calc_ipi" || campo == "em_substrib"){
			linha = DIV_TABELA_DETALHES + " input[type='checkbox'][name="+campo+"]";
			var valida = (value === '1' || value === 'T' ? true : false);

			if(valida){
				$(linha).val(value).parent().checkbox('check');
			}else{
				$(linha).val(value).parent().checkbox('uncheck');
			}
	   }

	   if(campo == "em_tipo" || campo == "em_regime"){
			linha = DIV_TABELA_DETALHES + " select[name="+campo+"]";
			if(!empty(value)){
				$(linha).parent().dropdown("set selected",value);
			}
		}
	});

	bloqueia_detalhes(false);
}
//########################################################


//########################################################
//INSERE NOVA LINHA NA TABELA DE OBSERVAÇÃO
//########################################################
function insere(){
	if(!Verifica_Alteracao(DIV_TABELA)){
		selecionaLinha(DIV_TABELA,$('#position').val(),1);
		return;
	}

	//DETALHES
	if(empty(objTabelaEmpresa)){
		objTabelaEmpresa = {};
		objTabelaEmpresa.registros = [];
		objTabelaEmpresa.total = 0;
	}

	var novaPosicao = {};
	novaPosicao.em_number = "";
	novaPosicao.em_grupo = "SMT";
	novaPosicao.em_abrev = "";
	novaPosicao.em_razao = "";
	novaPosicao.em_icms = "0,00";
	novaPosicao.em_cgc = "";
	novaPosicao.em_iest = "";
	novaPosicao.em_tipo = "D";
	novaPosicao.em_cep = "";
	novaPosicao.em_ender = "";
	novaPosicao.em_endnum = "";
	novaPosicao.em_bairro = "";
	novaPosicao.em_muncod = "";
	novaPosicao.em_cidade = "";
	novaPosicao.em_uf = "";
	novaPosicao.em_paiscod = "";
	novaPosicao.em_pais = "";
	novaPosicao.em_fone = "";
	novaPosicao.em_email = "";
	novaPosicao.em_icmssn = "0,00";
	novaPosicao.em_regime = "3";
	novaPosicao.em_modelo = "";
	novaPosicao.em_serie = "";
	novaPosicao.em_ligada = "T";
	novaPosicao.em_armazem = "F";
	novaPosicao.em_calc_ipi = "F";
	novaPosicao.em_substrib = "T";
	novaPosicao.em_idcsc = "";
	novaPosicao.em_csc = "";
	novaPosicao.em_licenca = "";
	novaPosicao.em_anexo = "0";

	objTabelaEmpresa.registros.push(novaPosicao);
	objTabelaEmpresa.total += 1;

	var actpos = objTabelaEmpresa.total > 0 ? (objTabelaEmpresa.total - 1) : 0;

	pagination((Math.ceil(objTabelaEmpresa.total / LIMITE_REGISTROS)),function(){
		setStatus(actpos,'+',DIV_TABELA);
		pintaLinha($(DIV_TABELA + " tr[posicao="+actpos+"]"));
		Bloqueia_Linhas(actpos,DIV_TABELA);
		$('#record').val(objTabelaEmpresa.total);
		selecionaLinha(DIV_TABELA,actpos,3);
	});
}
//########################################################


//########################################################
//MUDA O STATUS DA LINHA EDITADA DA TABELA PRODUTO
//########################################################
function edicao(elemento){
	var posicao = $(elemento.parent().parent()).attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaEmpresa.registros[posicao][campo];

	//NÃO HOUVE ALTERAÇÃO
	if($(elemento).val() == original || getStatus(posicao,DIV_TABELA) !== ''){
		return;
	}

	setStatus(posicao, 'a', DIV_TABELA);
	Bloqueia_Linhas(posicao, DIV_TABELA);
}
//########################################################


//########################################################
//MUDA O STATUS DA LINHA EDITADA DA TABELA PRODUTO - DETALHES
//########################################################
function edicao_detalhes(elemento){
	var posicao = Number($('#position').val());
	if(empty(posicao)) return;

	var campo = $(elemento).attr('name');
	var original = objTabelaEmpresa.registros[posicao][campo];

	//NÃO HOUVE ALTERAÇÃO
	if($(elemento).val() == original || getStatus(posicao,DIV_TABELA) !== ''){
		return;
	}

	setStatus(posicao, 'a', DIV_TABELA);
	Bloqueia_Linhas(posicao, DIV_TABELA);
}
//########################################################


//########################################################
//CANCELA AS MUDANÇAS FEITAS NA TABELA DE PRODUTO
//########################################################
function cancela(cell,extra){
	var actpos = $("#position").val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

	if(getStatus(actpos,DIV_TABELA) === 'a'){
		var tr = monta_linha(actpos);

		$(DIV_TABELA + " tr[posicao="+actpos+"]").html(tr);
		monta_detalhes(actpos);

		Desbloqueia_Linhas(actpos,DIV_TABELA);

	}else if(getStatus(actpos,DIV_TABELA) === '+'){
		objTabelaEmpresa.registros.splice(actpos,1);
		objTabelaEmpresa.total -= 1;

		var paginaAtual = getPagina('#record','#pagination',LIMITE_REGISTROS);

		pagination(paginaAtual,function(){
			$('#record').val(objTabelaEmpresa.total);
			if(objTabelaEmpresa.total > 0){
				if(actpos > 0){
					--actpos;
				}
			}
		});

	}
	selecionaLinha(DIV_TABELA,actpos,cell);
	if(!empty(extra)){
		setTimeout(function () {
			$(DIV_TABELA_DETALHES + " input[name="+extra+"]").focus();
		}, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
	}
}
//########################################################


//########################################################
//GRAVA OS DADOS EDITADOS DA TABELA EMPRESA
//########################################################
function grava(cell, fcustom_grava, extra){
	var actpos = $("#position").val();
	if(empty(actpos)){
		swal('Atenção','É necessário selecionar uma linha','warning');
		return;
	}

	if(empty(cell)){
		cell = 2;
	}

    var status = getStatus(actpos, DIV_TABELA);

	if(empty(status)){
		selecionaLinha(DIV_TABELA, actpos, cell);
		if(!empty(extra)){
			setTimeout(function () {
				$(DIV_TABELA_DETALHES + " input[name="+extra+"]").focus();
			}, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
		}
		return;
	}

	var linha = DIV_TABELA + " tr[posicao="+actpos+"] input";



	//VALIDAÇÕES
	var mensagem = '';
	if(empty($(linha+"[name=em_grupo]").val()))
		mensagem +='Grupo é Obrigatório\n';

	if(empty($(linha+"[name=em_abrev]").val()))
		mensagem +='Nome da Empresa é Obrigatório\n';

	if(empty($(linha+ "[name=em_razao]").val()))
		mensagem +='Razão é Obrigatória\n';

	if(empty($(linha + "[name=em_icms]").val()))
		mensagem +='ICMS é Obrigatório\n';

	if(empty($(DIV_TABELA_DETALHES + " input[name=em_muncod]").val().trim()))
		mensagem +='O Código do município é Obrigatório\n';

	if(empty($(DIV_TABELA_DETALHES + " input[name=em_modelo]").val().trim()))
		mensagem +='O Modelo é Obrigatório\n';

	if(empty($(DIV_TABELA_DETALHES + " input[name=em_serie]").val().trim()))
		mensagem +='A Série NF é Obrigatória\n';


	if(!empty(mensagem)){
		swal("Não foi Possível Cadastrar a Empresa\n Verifique os Campos a baixo",mensagem,'error');
		return;
	}

	//VALIDA CODIGO DE MUNICIPIO E DE PAIS
	if($(DIV_TABELA_DETALHES + " input[name=em_muncod]").val().trim() != $(DIV_TABELA_DETALHES + " input[name=em_muncod]").attr("em_muncod")){
		swal("Atenção","Código de Município Invalido","warning");
	}
	if($(DIV_TABELA_DETALHES + " input[name=em_paiscod]").val().trim() != $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").attr("em_muncod")){
		swal("Atenção","Código do País Invalido","warning");
	}


	var funcao = "funcao=grava&comando="+(status=='+' ? 'insert' : 'update') +
				"&em_number=" + $(linha+"[name=em_number]").val()+
				"&em_grupo=" + $(linha+"[name=em_grupo]").val().toUpperCase()+
				"&em_abrev=" + $(linha+"[name=em_abrev]").val().toUpperCase()+
				"&em_razao=" + encode_uri($(linha+"[name=em_razao]").val().toUpperCase())+
				"&em_icms=" + $(linha+"[name=em_icms]").val().replace(/\./g,'').replace(',','.')+
				"&em_cgc=" + $(DIV_TABELA_DETALHES + " input[name=em_cgc]").val().toUpperCase()+
				"&em_iest=" + $(DIV_TABELA_DETALHES + " input[name=em_iest]").val().toUpperCase()+
				"&em_tipo=" + $(DIV_TABELA_DETALHES + " select[name=em_tipo] :selected").val().toUpperCase()+
				"&em_cep=" + $(DIV_TABELA_DETALHES + " input[name=em_cep]").val().toUpperCase()+
				"&em_ender=" + $(DIV_TABELA_DETALHES + " input[name=em_ender]").val().toUpperCase()+
				"&em_endnum=" + $(DIV_TABELA_DETALHES + " input[name=em_endnum]").val().toUpperCase()+
				"&em_bairro=" + $(DIV_TABELA_DETALHES + " input[name=em_bairro]").val().toUpperCase()+
				"&em_muncod=" + $(DIV_TABELA_DETALHES + " input[name=em_muncod]").val().toUpperCase()+
				"&em_cidade=" + $(DIV_TABELA_DETALHES + " input[name=em_cidade]").val().toUpperCase()+
				"&em_uf=" + $(DIV_TABELA_DETALHES + " input[name=em_uf]").val().toUpperCase()+
				"&em_paiscod=" + $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").val().toUpperCase()+
				"&em_pais=" + $(DIV_TABELA_DETALHES + " input[name=em_pais]").val().toUpperCase()+
				"&em_fone=" + $(DIV_TABELA_DETALHES + " input[name=em_fone]").val().toUpperCase()+
				"&em_email=" + $(DIV_TABELA_DETALHES + " input[name=em_email]").val()+
				"&em_icmssn=" + $(DIV_TABELA_DETALHES + " input[name=em_icmssn]").val().replace(/\./g,'').replace(',','.')+
				"&em_regime=" + $(DIV_TABELA_DETALHES + " select[name=em_regime] :selected").val().toUpperCase()+
				"&em_modelo=" + $(DIV_TABELA_DETALHES + " input[name=em_modelo]").val()+
				"&em_serie=" + $(DIV_TABELA_DETALHES + " input[name=em_serie]").val()+
				"&em_calc_ipi=" + $(DIV_TABELA_DETALHES + " input[name=em_calc_ipi]").val().toUpperCase()+
				"&em_substrib=" + $(DIV_TABELA_DETALHES + " input[name=em_substrib]").val().toUpperCase()+
				"&em_ligada=" + $(DIV_TABELA_DETALHES + " input[name=em_ligada]").val().toUpperCase()+
				"&em_armazem=" + $(DIV_TABELA_DETALHES + " input[name=em_armazem]").val().toUpperCase()+
				"&em_idcsc=" + $(DIV_TABELA_DETALHES + " input[name=em_idcsc]").val().toUpperCase()+
				"&em_csc=" + $(DIV_TABELA_DETALHES + " input[name=em_csc]").val()+
				"&em_licenca=" + $(DIV_TABELA_DETALHES + " input[name=em_licenca]").val()+
				"&em_anexo=" + $(DIV_TABELA_DETALHES + " input[name=em_anexo]").val();

	swal.loading();
	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);

        if(!retorno){
			var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";

			LimpaTabela(DIV_TABELA);

			$(DIV_TABELA).html(erro);
			swal('Erro ao gravar alterações da tabela',erro,'error');
			return;
		}

		if(!empty(retorno.error)){
			swal({
				title: 'Erro ao gravar',
				text: retorno.mensagem,
				type: 'error'
			}, function(){
					selecionaLinha(DIV_TABELA, actpos, cell);
				}
			);
			return;
		}

		//JOGA O RETORNO DO PRODUTO NO OBJETO
		objTabelaEmpresa.registros[actpos] = retorno.registros[0];

		if(status === '+'){
            setStatus(actpos, 'a', DIV_TABELA);
        }
		cancela(cell,extra);

		if(!empty(fcustom_grava)){
			fcustom_grava();
			return;
		}
		swal.close();
	});
}
//########################################################


//########################################################
//DELETA O EMPRESA SELECIONADO
//########################################################
function exclui(){
	var actpos = $('#position').val();
	if(empty(actpos)){
		swal('Atenção','É necessário selecionar uma linha','warning');
		return;
	}

	if(!empty(getStatus(actpos,DIV_TABELA))){
		cancela(1);
		return;
	}

	var em_number = objTabelaEmpresa.registros[actpos].em_number;

	swal({
			title: "Deseja excluir a Empresa selecionada?",
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

			var funcao = "funcao=deleta&em_number=" + em_number;

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
							title:'Erro ao excluir Empresa',
							text: retorno.mensagem,
							type: 'error'
						},
						function(){
							selecionaLinha(DIV_TABELA,actpos,1);
						}
					);
					return;
				}

				objTabelaEmpresa.registros.splice(actpos,1);
				objTabelaEmpresa.total -= 1;
				swal.close();

				pagination((Math.ceil(objTabelaEmpresa.total / LIMITE_REGISTROS)),function(){
					$('#records').val(objTabelaEmpresa.total);
					if(objTabelaEmpresa.total > 0){
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






















































//########################################################
//BLOQUEIA DIV DE DETALHES
//########################################################
function bloqueia_detalhes(bloqueia) {
	if (!TestaAcesso('ADM.EMPRESA', 2)) {
		bloqueia = true;
		$("#btn_cnpj,#btn_iest").prop("disabled", bloqueia);
	}

	var os_inputs = $(DIV_TABELA_DETALHES + " input[type=text]:not(.inativo), " +
					  DIV_TABELA_DETALHES + " input[type=date], " +
					  DIV_TABELA_DETALHES + " input[type=checkbox], " +
					  DIV_TABELA_DETALHES + " select:not(.inativo), #file_up "+
					  ""
				  	);
	var os_selects = $(DIV_TABELA_DETALHES + " .ui.dropdown:not(.inativo)");

	$("#btn_cnpj,#btn_iest").prop("disabled", bloqueia);

	os_inputs.prop("disabled", bloqueia);
	os_selects.removeClass("disabled");

	if($('#nomeUsuario').val() != "PENNA"){
		$(DIV_TABELA_DETALHES + " input[name=em_licenca]").prop("disabled", true);
	}

	if(bloqueia){
		$("#em_imagem").prop("src", "../imagens/imgNaoDisponivel.png");
		os_selects.addClass("disabled");
	}
}
//########################################################


//########################################################
//NÃO PERMITE O CAMPO FICAR VAZIO E TRAS FORMATAÇÃO DE NUMERO
//########################################################
function notnull(elemento) {
	//PEGA O NAME DO INPUT
	var campo = $(elemento).attr('name');
	var casa = 0;
	var muda_valor = '';

	switch (campo) {
		case 'em_icms':
		case 'em_icmssn':
			casa = 2;
			muda_valor = '0';
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

	if(empty($.trim($(comboMor).html()))){
		switch (Ovalor) {
			case "em_grupo":
				$(comboMor).append( '<option value="SMT">SMT</option>'+
									'<option value="SBM">SBM</option>'+
									'<option value="SSV">SSV</option>'+
									'<option value="SAS">SAS</option>');
			break;
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



//########################################################
//--! ABRINDO CONSULTAS MUNICIPIO --//
//########################################################
function buscaMunicipio(){
	var texto = $(DIV_TABELA_DETALHES + " input[name=em_muncod]").val().trim();
	var naopesquisa = false;
    if (texto === ''){
        naopesquisa = true;
    }

    if (texto == $(DIV_TABELA_DETALHES + " input[name=em_muncod]").attr('em_muncod')){
        return;
    }

    cnsMuni_abre(texto, 'box-inc-muni', '0', naopesquisa);
}
//########################################################
//		RETORNO CONSULTA DE MUNICIPIO
//########################################################
function cnsMuni_retorno() {
     $(DIV_TABELA_DETALHES + " input[name=em_muncod]").attr('em_muncod', objmuni.codigo);

	 $(DIV_TABELA_DETALHES + " input[name=em_muncod]").val(objmuni.codigo);
	 $(DIV_TABELA_DETALHES + " input[name=em_cidade]").val(objmuni.municipio);
     $(DIV_TABELA_DETALHES + " input[name=em_uf]").val(objmuni.uf);

	 $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").select();
}
//########################################################
//--! FIM CONSULTAS MUNICIPIO --//
//########################################################


//########################################################
//--! ABRINDO CONSULTAS PAIS --//
//########################################################
function buscaPais(){
	var texto = $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").val().trim();
	var naopesquisa = false;
    if (texto.trim() === ''){
        naopesquisa = true;
    }

    if (texto == $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").attr('em_paiscod')){
        return;
    }

    cnsPais_abre(texto.trim(), 'box-inc-pais', '1', naopesquisa);
}
//########################################################
//		RETORNO CONSULTA DE PAIS
//########################################################
function cnsPais_retorno() {
     $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").attr('em_paiscod', objpais.codigo);
	 $(DIV_TABELA_DETALHES + " input[name=em_paiscod]").val(objpais.codigo);
	 $(DIV_TABELA_DETALHES + " input[name=em_pais]").val(objpais.pais.substring(0,12));
     $(DIV_TABELA_DETALHES + " input[name=em_fone]").focus();
}
//########################################################
//--! FIM CONSULTAS PAIS --//
//########################################################


//########################################################
//REALIZA A BUSCA DE CEP PARA TRAZER A CIDADE ESTADO E PAIS
//########################################################
function buscaCep(cep){
	var actpos = $('#position').val();
	var original = $(cep).attr("em_cep");

	if($(cep).val() == original){
		return;
	}

	var funcao = "funcao=buscaCep&cep="+$(cep).val();
	swal.loading("Buscando informações...");

	ajax(funcao, EXEC, function(retorno){
		retorno = json(retorno);
		if(!retorno){
			swal('Erro',"Ocorreu um erro ao receber as informações. Tente novamente!",'error');
			return;
		}

		if(!empty(retorno.error)){
			$(DIV_TABELA_DETALHES + " div[posicao="+actpos+"] input[name=tr_cep]").focus().select();
			swal('Erro ao buscar cep',retorno.mensagem,'error');
			return;
		}

		var linha = DIV_TABELA_DETALHES+ " input";
		$(linha + "[name=em_ender]").val(retorno.em_ender);
		$(linha + "[name=em_bairro]").val(retorno.em_bairro);
		$(linha + "[name=em_cidade]").val(retorno.em_cidade);
		$(linha + "[name=em_uf]").val(retorno.em_uf);
		$(linha + "[name=em_muncod]").val(retorno.em_muncod);
		$(linha + "[name=em_pais]").val("Brasil");
		$(linha + "[name=em_paiscod]").val("1058");
		swal.close();
	});
}
//########################################################


//########################################################
//VALIDA CNPJ/CPF E IEST
//########################################################
function valida(acao){
	var actpos = $('#position').val();
	linha = DIV_TABELA_DETALHES + " input";

	switch (acao) {
		case 'CNPJ':
			var cnpj = $(linha+"[name=em_cgc]").val();
			if(!validaCnpj(cnpj) && !valida_cpf(cnpj))	swal('ERRO!','CNPJ/CPF Inválido','error');
			else swal('OK!','CNPJ/CPF - OK','success');
		return;

		case  "IEST":
			var iest = $(linha + "[name=em_iest]").val().trim();
			var estado = objTabelaEmpresa.registros[actpos].em_uf;

			if(CheckIE(iest, estado)){
				swal("OK!", "Inscrição Estadual Válida!", "success");
			} else {
				swal("ERRO!", "Inscrição Estadual Não valida!", "error");
			}
		return;

	}
}
//########################################################


//########################################################
//CERTIFICADO DIGITAL
//########################################################
function certificadoDigital(){
	var actpos = $("#position").val();
	if(empty(actpos)){
		swal('Atenção','Selecione uma empresa!','warning');
		return;
	}
	var empresa = $(DIV_TABELA + " tr[posicao="+actpos+"] input[name=em_number]").val();
	get('divfundo').style.visibility = 'visible';
	get('box-inc-certificado').style.visibility = 'visible';
	$('#box-inc-certificado').fadeIn(200);
	Cert_abre(empresa);
}
//########################################################


function upload_button(){
    var file = document.querySelector('input[type=file]').files[0];
    var actpos = $("#position").val();

    var img = $("#em_imagem");
    var reader = new FileReader();


    reader.onloadend = function(){
        img.attr('src', reader.result);

        $.ajax({
            url: EXEC,
            type: 'POST',
            data: {'funcao': 'trocaimagem', 'em_number': objTabelaEmpresa.registros[actpos].em_number, 'imagem': reader.result},
        })
        .done(function(retorno) {
			retorno = json(retorno);
			if(!retorno){
				var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
				swal('Erro ao Alterar Imagem',erro,'error');
				img.attr('src', "");
				return;
			}
			if(!empty(retorno.error)){
				//ERRO
				swal({
						title:'Erro ao Alterar Imagem',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(DIV_TABELA,actpos,1);
					}
				);
				img.attr('src', "");
				return;
			}
        });
    };

    if(file){
		if(file.type != 'image/png' && file.type != 'image/bmp'){
			swal("Atenção","Só são permitidos arquivos do Formato 'png' ou 'bmp' ",'warning');
			return;
		}
        reader.readAsDataURL(file);
    } else {
		img.attr('src', "");
    }
}




//########################################################
//########################################################
        //PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################

//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function(){
	$(DIV_TABELA_DETALHES + " input[name=em_cep]").mask('99999-999'); //MASCARA O CAMPO CEP

	$('.ui.image').dimmer({ on: 'hover' }) ;

	//########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
		$('#search').focus();
	});


	//########################################################
	//MONTA QUERY AO APERTAR ENTER
	//########################################################
	$('#search').keypress(function(e){
		if(e.which == 13)
			monta_query();
	});

	//########################################################
	//KEYUP DOS INPUTS DA DIV_TABELA
	//########################################################
	$(DIV_TABELA).on("keyup", 'input',function(e){
		var actpos = $("#position").val();
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
					if (Number(actpos)+1 < $("#record").val()){
						selecionaLinha(DIV_TABELA,++actpos,cell);
						return;
					}
					else{
						insere();
						return;
					}
				}
				selecionaLinha(DIV_TABELA,actpos,cell);
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
	//PINTA LINHA EMPRESA
	//########################################################
	$(DIV_TABELA).on("focus", 'input',function(){
		pintaLinha($(this).parent().parent());

		if(!$(this).parent().hasClass("inativo")){
			switch ($(this).attr("name")) {
				case "em_grupo":
					ComboLinha($(this));
				break;
			}
		}
	});

	//########################################################
	//MUDA O COMBO PARA INPUT AO PERDER O FOCO DO COMBO
	//########################################################
	$(DIV_TABELA).on('blur', 'select[name=em_grupo]', function(){
		TiraComboLinha($(this));
	});

	//########################################################
	//SELECIONA O TEXTO INTEIRO NO CLICK TABELA EMPRESA
	//########################################################
	$(DIV_TABELA +", " +DIV_TABELA_DETALHES).on("click", ' input', function(){
		$(this).select();
	});

	//########################################################
	//EDICAO DOS DADOS EMPRESA
	//########################################################
	$(DIV_TABELA).on('change', 'input', function(){
		if ($(this).hasClass('number')) {
			notnull($(this));
		}
		edicao($(this));
	});





	//########################################################
	//KEYPRESS DOS DETALHES
	//########################################################
	$(DIV_TABELA_DETALHES).on('keyup', 'input[type=text]', function(e){
		var actpos = $("#position").val();
		var extra = $(this).attr('name');
		switch (e.which) {
			case 27://ESC
				$(this).blur();
				cancela(0,extra);
			break;

			case 45://INSER
				if(Verifica_Alteracao(DIV_TABELA)){
					insere();
				}
			break;

			case 13://ENTER
				$(this).blur();
				grava(0,'',extra);
			break;
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
				default:
					value = $checkbox.checkbox('is checked') ? "T" : "F";
				break;
			}

			$(this).val(value);
			edicao_detalhes($(this));
    	}
    });



	//########################################################
	//EDICAO DOS DETALHES EMPRESA - DETALHES
	//########################################################
	$(DIV_TABELA_DETALHES).on('change', 'input:not([name=file_upload]):not([type=checkbox]), select', function(){
		if ($(this).hasClass('number')) {
			notnull($(this));
		}
		edicao_detalhes($(this));
	});

	//########################################################
	//CONSULTA DE MUNICIPIO
	//########################################################
	$(DIV_TABELA_DETALHES).on('change', 'input[name=em_muncod]', function(){
		buscaMunicipio();
	});

	//########################################################
	//CONSULTA DE PAIS
	//########################################################
	$(DIV_TABELA_DETALHES).on('change', 'input[name=em_paiscod]', function(){
		buscaPais();
	});

	//########################################################
	//CONSULTA DE PAIS
	//########################################################
	$(DIV_TABELA_DETALHES).on('change', 'input[name=em_cep]', function(){
		buscaCep($(this));
	});

	//########################################################
	//KEYPRESS SÓ PERMITE NÚMEROS
	//########################################################
	$(DIV_TABELA_DETALHES).on("keypress", ' input',function(e){
		var name = ($(this).attr('name'));
		if(name ==  'em_muncod' || name == 'em_paiscod' || name == 'em_modelo' || name == 'em_serie' || name == 'em_anexo' || name == 'em_cgc')
			return somenteNumero(e,false,false,this);
	});
	//########################################################
	//KEYPRESS SÓ PERMITE NÚMEROS
	//########################################################
	$(DIV_TABELA_DETALHES).on("keypress", ' input[name=em_icmssn]',function(e){
			return somenteNumero(e,true,true,this);
	});

	//########################################################
	//COLOCA A MASCARA CORRETA PARA CPF E CNPJ AO PERDER FOCO
	//########################################################
	$(DIV_TABELA_DETALHES + " input[name=em_cgc]").on('blur', function(){
		if (validaCnpj($(this).val())){
			$(this).mask("99.999.999/9999-99");
		}
		else if (valida_cpf($(this).val())){
			$(this).mask("999.999.999-99");
		}
		$(this).unmask();
	});
});

//########################################################
//########################################################
//FIM PADRÃO DE EVENTOS DOS INPUTS
//########################################################
//########################################################
