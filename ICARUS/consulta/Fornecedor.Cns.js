//########################################################
//########################################################
			//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################



//########################################################
//VERSÃƒO DA TELA
//########################################################
var CNSFRN_RELEASE = '0.001',

    
//########################################################
//VERIFICA SE JA RODOU O safety
//########################################################
    CNSFRN_SAFETY = false,
    

//########################################################
//LIMITE DE REGISTROSS
//########################################################
    CNSFORNEC_LIMITE_REGISTROS = 60,

    
//########################################################
//OBJETOS USADOS
//########################################################
    cnsFrn_acesso = [], //ARRAY DE ACESSO
    cnsFrn_nivel = [], //ARRAY DE NIVEL DE ACESSO
    objTabelaFornec = {},
    objFornecedor = {
        divDaConsulta: '',
        fornecNum: '',
        fornecAbrev: '',
        contato: '',
        telefone: '',
        fax: '',
        grupo: '',
        ativo: '',
        razao: '',
        pessoa: '',
        cnpj: '',
        ie: '',
        endereco: '',
        enderNum: '',
        bairro: '',
        cep: '',
        cidade: '',
        uf: '',
        pais: '',
        email: '',
        desconto: '',
        prazos: '',
        obs1: '',
        obs2: '',
        conta: '',
        consumo: '',
        calcICMS: '',
        calcST: ''
    },

    
//########################################################
//CONSTANTES USADAS
//########################################################
    CNSFORNEC_EXEC = '../consulta/Fornecedor.Cns.Exec.php',
    CNSFORNEC_DIV_TABELA = '#cnsFornec_dados',
    CNSFORNEC_DIV_TABELA_DETALHES = '#divDetalhesFornec';


//########################################################
//ATIVAÇÃƒO DO DIMMER
//########################################################
$CNSFORNECdimmer = ativaDimmerConsulta("box-inc-fornecedor",
    function(){
        $('#'+objFornecedor.divDaConsulta).addClass('active');
    	$('#cnsFornec_pesquisa').focus();
    },
    function(){
        $('#'+objFornecedor.divDaConsulta).removeClass('active');
    }
);



//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################




















//########################################################
//########################################################
			//FUNÇÕ•ES DA CONSULTA FORNECEDOR
//########################################################
//########################################################



//########################################################
//ABRE A CONSULTA E REALIZA A PESQUISA COM O PARAMETRO PASSADO PRA FUNCAO
//########################################################
function cnsFrn_abre(texto,divDaConsulta,ordem,naoPesquisa,modo, returnFocus){
	
	if(!CNSFRN_SAFETY){
		cnsFrn_safety(function(){ cnsFrn_abre(texto,divDaConsulta,ordem,naoPesquisa,modo, returnFocus); });
		return;
	}

	//COLOCA NO OBEJTO A DIV ONDE A CONSULTA FOI INSERIDA
	objFornecedor.divDaConsulta = divDaConsulta;
	objFornecedor.returnFocus = returnFocus; //PARA ONDE DEVE RETORNAR O FOCO CASO FECHE A CONSULTA

	//ALTERA ORDEM DO COMBO DE PESQUISA
	if(!empty(ordem)) $("#cnsFornec_ordem").val(ordem);

	if(!empty(modo)) $('#modo').val(modo);

	//COLOCA NO CAMPO DE PESQUISA DA CONSULTA OQUE FOI PESQUISADO
	$('#cnsFornec_pesquisa').val(texto.trim());

	//MONTA A QUERY
	if(empty(naoPesquisa)){
		cnsFornec_montaQuery();
		return;
	}

	$CNSFORNECdimmer.dimmer("consulta show");
}


// ########################################################
// LIBERA ACESSOS
// ########################################################
function cnsFrn_safety(fCustom){
    safety(CNSFORNEC_EXEC, function(){ cnsFrn_liberaAcesso(fCustom); }, CNSFRN_RELEASE);
}


//########################################################
//LIBERA ACESSOS
//########################################################
function cnsFrn_liberaAcesso(fCustom){
    if (!TestaAcesso('BAS.FOR.CONS')) { //usuario sem acesso fecha janela
        swal({
                title: "Atenção",
                text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
                      "Nome do acesso necessário: BAS.FOR.CONS",
                type: "warning",
                html: true,
            },
            function() {
                if(empty($CNSFORNECdimmer)){
                    var win = window.open("", "_self");
                    win.close();
                }
            }
        );
        return;
    }

    cnsFornec_getCombos(fCustom);
}


//########################################################
//CARREGA OS COMBOS
//########################################################
function cnsFornec_getCombos(fCustom){
    ajax("funcao=loadCombo", CNSFORNEC_EXEC, function(retorno){
        
		if(!empty(retorno.error)){
			swal('Erro ao buscar combos',retorno.mensagem,'error');
			return;
		}

        //UF
        $.each(retorno.uf, function (key, uf){
		    $('#cnsFornec_cbUF').append($('<option>', {value: uf.af_codigo, text : uf.af_codigo}));
		});
        
        //GRUPO
        $.each(retorno.grupo, function (key, grupo){
		    $('#cnsFornec_cbGrupo').append($('<option>', {value: grupo.af_codigo, text : grupo.af_codigo}));
		});
        
        
        $('#det_consFornecedor .ui.dropdown').dropdown();
		//########################################################
		//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
		//########################################################
		$('#det_consFornecedor .ui.dropdown').dropdown({
			onChange: function(value,text,itemlista) {
				if($(itemlista).parent().siblings("select").attr("id") == "cnsFornec_ordem"){
					$('#cnsFornec_pesquisa').val('');
				}
				$('#cnsFornec_pesquisa').select();
			}
		});

		CNSFRN_SAFETY = true;
		if(!empty(fCustom)){
			fCustom();
			return;
		}
        swal.close();
    });
}


//########################################################
//MONTA A QUERY PRINCIPAL
//########################################################
function cnsFornec_montaQuery(){

    LimpaTabela(CNSFORNEC_DIV_TABELA);
    $(CNSFORNEC_DIV_TABELA).html("<img src='../component/loading.gif' />");

    var funcao = "funcao=monta&texto="+ encode_uri($("#cnsFornec_pesquisa").val());

    funcao += "&order=" + $('#cnsFornec_ordem').val();

    funcao += "&status="+$("#cnsFornec_cbStatus").val()+"&grupo="+$('#cnsFornec_cbGrupo').val()+"&uf="+$('#cnsFornec_cbUF').val();

    ajax(funcao,CNSFORNEC_EXEC,function(retorno){
        
		if(!empty(retorno.error)){
            loading.close();
			swal('Erro ao buscar tabela de FORNECEDOR',retorno.mensagem,'error');
			return;
		}

		$('#cnsFornec_record').val(retorno.total);
		objTabelaFornec = retorno;

        if(empty(objFornecedor.divDaConsulta)){
            //FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
            LimpaTabela(CNSFORNEC_DIV_TABELA);
            cnsFornec_pagination(1);
            return;
		}

        //ainda não abriu a consulta
		if(!$('#'+objFornecedor.divDaConsulta).hasClass('active')){
			//retornou so um registro
			if(objTabelaFornec.total == 1) {
				$('#cnsFornec_position').val('0');
				cnsFrn_fecha(true);
                loading.close();
				swal.close();
				return;
			}

            $CNSFORNECdimmer.dimmer("consulta show");
		}

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		cnsFornec_pagination(1);
        loading.close();
        swal.close();
    });
}


//########################################################
//MONTA AS PAGINAS
//########################################################
function cnsFornec_montaPaginas(paginaAtual,totalDePaginas){
	
    $('#cnsFornec_pagination').html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

	if(paginaAtual > (links + 2)){
		$('#cnsFornec_pagination').append("<span onclick='cnsFornec_pagination(" + 1 + ");' class='cor_padraoInvert_hover bg-branco'>" + 1 + "</span>");
		$('#cnsFornec_pagination').append("<span class='no-border cor_padraoInvert_hover bg-branco'>...</span>");
	}
	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#cnsFornec_pagination').append("<span class='active cor_padrao bg-branco'>" + i + "</span>");
		}else{
			$('#cnsFornec_pagination').append("<span onclick='cnsFornec_pagination(" + i + ");' class='cor_padraoInvert_hover bg-branco'>" + i + "</span>");
		}
	}
	if(paginaAtual < (totalDePaginas - (links + 2))){
		$('#cnsFornec_pagination').append("<span class='no-border cor_padraoInvert_hover bg-branco'>...</span>");
		$('#cnsFornec_pagination').append("<span onclick='cnsFornec_pagination(" + totalDePaginas + ");' class='cor_padraoInvert_hover bg-branco'>" + totalDePaginas + "</span>");
	}
}


//########################################################
//POPULA AS PAGINAS DA TABELA
//########################################################
function cnsFornec_pagination(paginaAtual, fCustom){
    var totalDePaginas = Math.ceil(objTabelaFornec.total / CNSFORNEC_LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

    var fim = paginaAtual * CNSFORNEC_LIMITE_REGISTROS;
    if(fim > objTabelaFornec.total)
        fim = objTabelaFornec.total;
    var inicio = ((paginaAtual - 1) * CNSFORNEC_LIMITE_REGISTROS);

		// LIMPA CAMPOS DA TABELA | DETALHES | IMPOSTOS
		LimpaTabela(CNSFORNEC_DIV_TABELA);
		$(CNSFORNEC_DIV_TABELA_DETALHES + " input[type=text]").val("");
		$(CNSFORNEC_DIV_TABELA_DETALHES + ' input[type=checkbox]').parent().parent().removeClass('bootstrap-switch-on');
		$(CNSFORNEC_DIV_TABELA_DETALHES + ' input[type=checkbox]').parent().parent().addClass('bootstrap-switch-off');
		$(CNSFORNEC_DIV_TABELA_DETALHES + " select").val("option:eq(1)");

    //REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
    cnsFornec_montaPaginas(paginaAtual,totalDePaginas);

    //RESETA A POSICAO
    $('#cnsFornec_position').val("null");

    //RESETA TOTAL
    $('#cnsFornec_record').val(objTabelaFornec.total);

    //EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(CNSFORNEC_DIV_TABELA);
    if(objTabelaFornec.total > 0){
        for(var i = inicio; i < fim; i++){
            $(CNSFORNEC_DIV_TABELA).append("<tr posicao=" + i + ">" + cnsFornec_linha(i) + "</tr>");
        }
    }

    //SELECIONA A PRIMEIRA LINHA
    if(objTabelaFornec.total > 0 && empty(fCustom)){
        $('#cnsFornec_pesquisa').focus();
        cnsFornec_pintaLinha($(CNSFORNEC_DIV_TABELA + ' tr:eq(0)'));
        $(CNSFORNEC_DIV_TABELA).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
    }

    if(!empty(fCustom)){
		fCustom();
	}

	$(CNSFORNEC_DIV_TABELA).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}


//########################################################
//CRIA E RETORNA AS LINHAS
//########################################################
function cnsFornec_linha(i){
    var aux = objTabelaFornec.registros[i];

    //MONTA A LINHA
    var table = "<td class='w80 inativo center'><input value='"+aux.fo_number+"' name='fo_number' readonly/></td>"+
		"<td class='w150 inativo'><input value='"+aux.fo_abrev+"' name='fo_abrev' readonly/></td>"+
		"<td class='w110 inativo'><input value='"+aux.fo_contato+"' name='fo_contato'  readonly/></td>"+
		"<td class='w100 inativo'><input value='"+aux.fo_fone+"' name='fo_fone' readonly/></td>"+
		"<td class='w110 inativo'><input value='"+aux.fo_fax+"' name='fo_fax' class='uppercase' readonly/></td>"+
		"<td class='w70 inativo center'><input value='"+aux.fo_grupo+"' name='fo_grupo' class='uppercase' readonly/></td>"+
		"<td class='w50 inativo center last'><input value='"+aux.fo_ativo+"' name='fo_ativo' class='uppercase' readonly/></td>";

    return table;

}


//########################################################
//ATIVA A CLASSE ACTIVE NA LINHA FOCADA
//########################################################
function cnsFornec_pintaLinha(elemento){
	var actpos = $(elemento).attr('posicao');
	$('#cnsFornec_position').val(actpos);
	$(CNSFORNEC_DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');
    
    if($(CNSFORNEC_DIV_TABELA_DETALHES).attr('fornecedor') != actpos){
		$(CNSFORNEC_DIV_TABELA_DETALHES).attr('fornecedor',actpos);
        
		$(CNSFORNEC_DIV_TABELA_DETALHES + " input[type=text]").val("");
        jQuery.each(objTabelaFornec.registros[actpos], function(campo,valor){
            var linha = CNSFORNEC_DIV_TABELA_DETALHES + " input[name="+campo+"]";
            if(campo == "fo_lucro" || campo == "fo_calc_st"){
                var checkbox_atual = $(linha+"[type='checkbox']").val(valor).parent();
                checkbox_atual.checkbox('uncheck');
                if(valor === '1' || valor === 'T'){
                    checkbox_atual.checkbox('check');
                }
                return;
            }
            $(linha).val(valor);
        });
	}
}


//########################################################
//ABRINDO CONSULTAS DE EMAIL
//########################################################
function cnsFrn_btnEmail(ref){
	var actpos = $("#cnsFornec_position").val();
	if(empty(actpos)){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}

    var numero = $(CNSFORNEC_DIV_TABELA + " .active input[name=fo_number]").val(),
        abreviacao = $(CNSFORNEC_DIV_TABELA + " .active input[name=fo_abrev]").val(),
        tipo = "FO",
        ao_final = function(){ cnsMail_abre('box-inc-mail', abreviacao, numero ,tipo, "", "cnsEmail_divfundo"); };

	if(typeof cnsMail_abre == 'undefined'){
        loadDimmerConsulta("../basico/Email.Layout.Inc.php",null,ao_final);
        return;
    }
    ao_final();
}


//########################################################
//ABRE OS LINKS DESEJADOS
//########################################################
function cnsFrn_editar(acao){
	var actpos = $("#cnsFornec_position").val();
	if(actpos === 'null'){
        swal({
                title:'Atenção',
                text:'É necessário selecionar uma linha',
                type:'warning',
                timer:3000
            },
            function(){
                swal.close();
                setTimeout(function(){$('#cnsFornec_pesquisa').focus();},30);
            }
        );
		return;
	}
    
    var aux = objTabelaFornec.registros[actpos];
	switch(acao){
		case 'A': //AGENDA
			window.open(encodeURI("../utility/Agenda.Layout.php?nome="+aux.fo_abrev+"&ord=1" ));
		return;

		case 'S': // SOMA DEBITOS
			loading.show("Buscando Dados...");
			ajax("funcao=somaDebitos&fo_number="+aux.fo_number, CNSFORNEC_EXEC, function(retorno){
                loading.close();
				swal({
                        title: 'Soma Débitos',
                        text: retorno,
                        type: "info",
                        html: true
				    }
                );
			});
		return;
	}
}


//########################################################
//FECHA A CONSULTA DE FORNECEDOR
//########################################################
function cnsFrn_fecha(preencheLinha){
    if(!empty($CNSFORNECdimmer)){
        
        //A CONSULTA NAO ESTA INCLUIDA EM UMA OUTRA TELA
        if(empty(objFornecedor.divDaConsulta)){
            //VOLTA O SCROLL PRA CIMA
            $(CNSFORNEC_DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
            $("#cnsFornec_pesquisa").select();
            return;
        }

        // VOU FECHAR A CONSULTA SEM TER QUE PREENCHER AS LINHAS
        if(!preencheLinha){
            $CNSFORNECdimmer.dimmer("consulta hide");

            //RETORNA O FOCO
            if(!empty(objFornecedor.returnFocus)) objFornecedor.returnFocus.select();
            // if(!empty(objCliente.returnFocus)) objCliente.returnFocus.select();

            return;
        }

        var posicao = $('#cnsFornec_position').val();
        var divDaConsulta = objFornecedor.divDaConsulta; //conteudo do objeto

        objFornecedor.fornecNum = objTabelaFornec.registros[posicao].fo_number;
        objFornecedor.fornecAbrev = objTabelaFornec.registros[posicao].fo_abrev;
        objFornecedor.razao = objTabelaFornec.registros[posicao].fo_razao;
        objFornecedor.cnpj = objTabelaFornec.registros[posicao].fo_cgc;
        objFornecedor.telefone = objTabelaFornec.registros[posicao].fo_fone;
        objFornecedor.cep = objTabelaFornec.registros[posicao].fo_cep;
        objFornecedor.endereco = objTabelaFornec.registros[posicao].fo_ender;
        objFornecedor.enderNum = objTabelaFornec.registros[posicao].fo_endnum;
        objFornecedor.bairro = objTabelaFornec.registros[posicao].fo_bairro;
        objFornecedor.cidade = objTabelaFornec.registros[posicao].fo_cidade;
        objFornecedor.uf = objTabelaFornec.registros[posicao].fo_uf;
        objFornecedor.calculoSt = objTabelaFornec.registros[posicao].fo_calc_st;
        objFornecedor.lucro = objTabelaFornec.registros[posicao].fo_lucro;
        objFornecedor.conta = objTabelaFornec.registros[posicao].fo_grdesp;
        objFornecedor.divDaConsulta = divDaConsulta; //recupera divDaConsulta

        for(var i in objTabelaFornec.registros[posicao]){
            objFornecedor[i] = objTabelaFornec.registros[posicao][i];
        }
        
        if($('#'+objFornecedor.divDaConsulta).hasClass('active')){
            $CNSFORNECdimmer.dimmer("consulta hide");
        }
        cnsFrn_retorno();
    }
}



//########################################################
//########################################################
			//FIM FUNÇÕ•ES DA CONSULTA FORNECEDOR
//########################################################
//########################################################




















//########################################################
//########################################################
//TODAS AS FUNÇÕ•ES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
//########################################################


$(document).ready(function(){
    //########################################################
    //QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
    //########################################################
    shortcut.add("F2",function(){
        if(empty($CNSFORNECdimmer) || $CNSFORNECdimmer.dimmer("is active") ){
            $('#cnsFornec_pesquisa').focus();
        }
    });
    
    //########################################################
    //REALIZA PESQUISA AO APERTAR ENTER
    //########################################################
    $('#cnsFornec_pesquisa')
        .focus(function(){ $(this).select(); })
        .on("keyup keypress",function(e){
                var o_id = $(this).attr('id'),
                    actpos = Number($("#cnsFornec_position").val());

                if(e.type == "keyup" && o_id == "cnsFornec_pesquisa"){
                    switch (e.which) {
                        case 40://PARA BAIXO
                            if (actpos >= 0) { selecionaLinha(CNSFORNEC_DIV_TABELA, actpos, 1); }
                        break;

                        case 27://ESC
                            $(this).val("");
                        break;
                    }
                }
                if(e.type === 'keypress'){
                    switch (e.which) {
                        case 13://ENTER
                            cnsFornec_montaQuery();
                        break;
                        default:
                            if($('#cnsFornec_ordem').val() == 'numerica'){
                                return somenteNumero(e,false,false,this);
                            }
                        break;
                    }
                }
            });
    
    
    //########################################################
    //KEYUP DOS INPUTS DA TABELA
    //########################################################
    $(CNSFORNEC_DIV_TABELA)
        .on("focus", 'input',function(){ cnsFornec_pintaLinha($(this).parent().parent()); })
        .on("dblclick", 'input',function(){ cnsFrn_fecha(true); })
        .on("keyup keypress", 'input',function(e){
            var actpos = Number($("#cnsFornec_position").val()),
                actpos_para_cima = $(this).parent().parent().prev().attr("posicao"),
                actpos_para_baixo = $(this).parent().parent().next().attr("posicao"),

                paginaAtual = Number(getPagina('#cnsFornec_record','#cnsFornec_pagination', CNSFORNEC_LIMITE_REGISTROS)),
                totalDePaginas = Math.ceil(objTabelaFornec.total / CNSFORNEC_LIMITE_REGISTROS),

                cell = $(this).parent().index();
            if(e.type == "keyup"){
                switch (e.which) {
                    case 38: //PARA CIMA
                        if (!empty(actpos_para_cima)) {
                            selecionaLinha(CNSFORNEC_DIV_TABELA, actpos_para_cima, cell);
                        }
                        else if(paginaAtual > 1){
                            cnsFornec_pagination(paginaAtual-1,function(){
                                cnsFornec_pintaLinha($(CNSFORNEC_DIV_TABELA + " tr:last-of-type"));
                                selecionaLinha(CNSFORNEC_DIV_TABELA, $("#cnsFornec_position").val(), cell);
                            });
                        }
                        else{
                            selecionaLinha(CNSFORNEC_DIV_TABELA, actpos, cell);
                        }
                    break;

                    case 40://PARA BAIXO
                        if (!empty(actpos_para_baixo)) {
                            selecionaLinha(CNSFORNEC_DIV_TABELA, actpos_para_baixo, cell);
                        }
                        else if(paginaAtual < totalDePaginas){
                            cnsFornec_pagination(paginaAtual+1,function(){
                                cnsFornec_pintaLinha($(CNSFORNEC_DIV_TABELA + ' tr:eq(0)'));
                                $(CNSFORNEC_DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
                                selecionaLinha(CNSFORNEC_DIV_TABELA, $("#cnsFornec_position").val(), cell);
                            });
                        }
                    break;
                }
            }
            if(e.type === 'keypress'){
                switch (e.which) {
                    case 13://ENTER
                        cnsFrn_fecha(true);
                    break;
                }
            }
        });
});
