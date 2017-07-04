//########################################################
//########################################################
               //CONSTANTES SEMPRE USADAS
//########################################################
//########################################################


//########################################################
//VERSÃO DA TELA
//########################################################
var RELEASE  = '0.002';


//########################################################
//LIMITE DE REGISTROS
//########################################################
var FO_LIMITE_REGISTROS = 60;

//########################################################
//OBJETOS
//########################################################
var objTabelaFo = {},
    objTabelaProd = {};

//########################################################
//LOCAL DO EXEC
//########################################################
var EXEC = "../basico/FormacaoPreco.Exec.php";

//########################################################
//TABELAS USADAS
//########################################################
var DIV_FORNECEDOR = "#consultaFornec",
    DIV_PRODUTO = "#consultaProduto",
    DIV_PRODUTO_NOVO = "#consultaProdutoNovo",
    DIV_PRODUTO_DETALHES = "#prod_det";



//########################################################
//########################################################
           //FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################

















//########################################################
//########################################################
              //FUNÇÕES DOS FORNECEDORES
//########################################################
//########################################################



function liberaAcesso() {
    if(!validaVersao(10.05)){
		return;
	}

    if (!TestaAcesso('BAS.PROD.REAJ')) {
        swal({
                title: "Atenção",
                text: "Você não possuí acesso a essa tela, ela será fechada!\nNome do acesso necessário: BAS.PROD.REAJ",
                type: "warning"
            },
            function() {
                var win = window.open("", "_self");
                win.close();
            }
        );
        return;
    }

    if (!TestaAcesso('BAS.PRODUTO', 2)) {
        $("#prod_det input[type=button]").attr("disabled", 'disabled');
    }

    if (!TestaAcesso('BAS.PROD.RESUMO')) {
        $(".resumo").attr("disabled", 'disabled');
    }

    getCombos();
}


//########################################################
//FUNÇÃO QUE PEGA OS VALORES QUE SERÃO INSERIDOS NOS COMBOS
//########################################################
function getCombos() {
    var funcao = 'funcao=loadCombo';
    ajax(funcao, EXEC, function(retorno) {

        if (!empty(retorno.error)) {
            swal('Erro ao buscar combos', retorno.mensagem, 'error');
            return;
        }

        //################################################################
        //EMPRESA
        //################################################################
        $.each(retorno.empresas, function(key, empresas) {
            $('#cbEmpresa').append($('<option>', {
                value: empresas.em_number,
                text: empresas.em_abrev
            }));
        });

        //################################################################
        //EMPRESA ATIVA
        //################################################################
        $('#cbEmpresa').val(retorno.actempresa);
        $('.logoEmpresa').attr("src", "../basico/Empresa.Exec.php?number=" + retorno.actempresa + "&funcao=imagem&troca=T");

        objInf = retorno;
        //objInf.empresas, objInf.actempresa, objInf.margem_padrao

        $('.ui.dropdown').dropdown();
        //########################################################
        //VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
        //########################################################
        $('.page .dropdown').dropdown({
             onChange: function(value,text,item) {
                 var select = item.parent().siblings("select").attr("id");
                 switch (select) {
                    case "cbEmpresa":
                         //########################################################
                         //AO TROCAR EMPRESA CHAMA FUNÇÃO
                         //########################################################
                         $('.logoEmpresa').attr("src", "../basico/Empresa.Exec.php?number=" + value + "&funcao=imagem&troca=T");
                         $('#fo_search').select();
                    break;
                    case "cbOrdem":
                         var max_number = 16;
                         switch ($(this).val()) {
                             case '2': max_number = 50; break;
                             case '3': max_number = 8; break;
                         }

                         var ao_final = function() {
                             monta_queryproduto();
                             $("#search").attr('maxlength', max_number).select();
                         };

                         if (!naoPercaDados(function() { ao_final(); })) {
                             return;
                         }

                         ao_final();
                    break;
                    case 'cbFamilia':
                        monta_queryproduto();
                        $('#search').select();
                    break;
                 }
             }
        });


        loading.close();
        monta_queryfornec();
    });
}


//########################################################
//FUNÇÃO QUE REALIZA A PESQUISA
//########################################################
function monta_queryfornec() {
    $('#fo_search').blur();

    $("#cbFamilia").html("<option>Selecione um Fornecedor</option>");
    LimpaTabela(DIV_PRODUTO);
    LimpaTabela(DIV_PRODUTO_NOVO);
    LimpaTabela(DIV_FORNECEDOR);
    $(DIV_FORNECEDOR).html("<img src='../component/loading.gif' />");

    var funcao = "funcao=montaFornec&em_number=" + $("#cbEmpresa").val() +
        "&fo_abrev=" + $("#fo_search").val() +
        "&pt_novopreco=" + ($('#cknovopreco').is(':checked') ? 'true' : 'false') +
        "&pt_ativo=" + ($('#ckinativos').is(':checked') ? 'true' : 'false');

    ajax(funcao, EXEC, function(retorno) {

        if (!empty(retorno.error)) {
            swal('Erro ao buscar Fornecedores', retorno.mensagem, 'error');
            return;
        }

        objTabelaFo = retorno;
        $('#recordfornec').val(retorno.total);
        swal.close();
        pagination(1);
    });
}


//########################################################
//MONTA AS PAGINAS
//########################################################
function montaPaginas(paginaAtual, totalDePaginas) {
    $("#pagination").html("");
    if (totalDePaginas == 1) {
        return;
    }

    var links = 4; // numero de paginas antes e depois da pagina atual
    var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
    var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);


    if (paginaAtual >= (links + 2)) {
        //CASO HOUVER M2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
        $('#pagination').append("<span onclick='pagination(" + 1 + ");'>" + 1 + "</span>");
        $('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
    }

    for (var i = inicio; i <= fim; i++) {
        if (i == paginaAtual) {
            $('#pagination').append("<span class='active cor_padrao'>" + i + "</span>");
        } else {
            //CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
            $('#pagination').append("<span onclick='pagination(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
        }
    }
    if (paginaAtual <= (totalDePaginas - (links + 2))) {
        $('#pagination').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
        //CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
        $('#pagination').append("<span onclick='pagination(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
    }
}


//########################################################
//PAGINA CORRETAMENTE A DIV APARTIR DE SEUS REGISTROS
//########################################################
function pagination(paginaAtual, fCustom) {
    var totalDePaginas = Math.ceil(objTabelaFo.total / FO_LIMITE_REGISTROS);
    if (paginaAtual > totalDePaginas) {
        paginaAtual = totalDePaginas;
    }

    var fim = paginaAtual * FO_LIMITE_REGISTROS;
    if (fim > objTabelaFo.total) {
        fim = objTabelaFo.total;
    }
    var inicio = ((paginaAtual - 1) * FO_LIMITE_REGISTROS);

    LimpaTabela(DIV_FORNECEDOR);
    $(DIV_PRODUTO).attr('Fornecedor', '');

    //REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
    montaPaginas(paginaAtual, totalDePaginas);

    //RESETA A POSICAO
    $('#positionfornec').val("null");

    //RESETA TOTAL
    $('#recordfornec').val(objTabelaFo.total);

    if (objTabelaFo.total > 0) {
        for (var i = inicio; i < fim; i++) {
            $(DIV_FORNECEDOR).append("<tr posicao='" + i + "'>"+ Fo_linha(i) + "</tr>");
        }
    }
    else{
        $("#fo_search").select();
        $("#Produtos_div").hide();
        $("#cbFamilia").html("").dropdown("restore placeholder text");
    }

    //SELECIONA A PRIMEIRA LINHA
    $('#fo_search').focus();
    if (objTabelaFo.total > 0 && empty(fCustom)) {
        selecaofornec($(DIV_FORNECEDOR + ' tr:eq(0)'));
        //VOLTA O SCROLL PRA CIMA
        $(DIV_FORNECEDOR).animate({ scrollTop: "=0" }, "fast");
    }

    if (!empty(fCustom)) {
        fCustom();
    }
}


//########################################################
//MONTA LINHAS
//########################################################
function Fo_linha(i) {
    var aux = objTabelaFo.registros[i],
         table = "<td class='w260 inativo'><input readonly value='"+aux.fo_abrev+"'></td>"+
            "<td class='w100 bg-verde-oliva'><input readonly value='"+aux.fo_curva+"'></td>"+
            "<td class='w90 inativo'><input readonly value='"+aux.fo_desc+"'></td>"+
            "<td class='w90 inativo'><input readonly value='"+aux.fo_descesp+"'></td>"+
            "<td class='w80 inativo'><input readonly value='"+aux.fo_rateio+"'></td>"+
            "<td class='w90 inativo'><input readonly value='"+aux.fo_uf+"'></td>"+
            "<td class='w90 inativo'><input readonly name='icmsinter' value='"+aux.icmsinter+"'></td>"+
            "<td class='w80 inativo'><input readonly value='"+aux.fo_calc_icms+"'></td>"+
            "<td class='w80 inativo'><input readonly value='"+aux.fo_calc_st+"'></td>";
    return table;
}


//########################################################
//PINTA A LINHA DE FORNECEDORES
//########################################################
function selecaofornec(elemento) {
    var actpos = $(elemento).attr('posicao');
    $('#positionfornec').val(actpos);
    $(DIV_FORNECEDOR + ' .active').removeClass('active');
    $(elemento).addClass('active');

    //EVITA COM QUE MONTE DETALHES + DE 1 VEZ
    if ($(DIV_PRODUTO).attr('Fornecedor') != actpos) {
        $(DIV_PRODUTO).attr('Fornecedor', actpos);

        if ($("#Produtos_div").is(":hidden")) {
            $("#Produtos_div").show();
        }

        monta_queryfamilia();
    }
}


//########################################################
//BUSCA FAMILIA DE PRODUTOS PARA DETERMINADO FORNECEDOR
//########################################################
function monta_queryfamilia() {
    var comboBox = $("#cbFamilia");
    comboBox.html("").dropdown("refresh");

    var funcao = "funcao=loadComboFamilia&fo_number=" + objTabelaFo.registros[$("#positionfornec").val()].fo_number;
    ajax(funcao, EXEC, function(retorno) {

        if (!empty(retorno.error)) {
            swal('Erro ao buscar familias', retorno.mensagem, 'error');
            return;
        }

        //################################################################
        //EMPRESA
        //################################################################
        comboBox.html("<option value='0'>Todos</option>");
        $.each(retorno.familia, function(key, familia) {
            $('#cbFamilia').append($('<option>', { value: familia.fa_number, text: familia.fa_nome }));
        });

        comboBox.dropdown("refresh");
        setTimeout(function() { comboBox.dropdown('set selected', comboBox[0][0].value ); }, 1);

        monta_queryproduto();
    });
}



//########################################################
//########################################################
           //FIM FUNÇÕES DOS FORNECEDORES
//########################################################
//########################################################





















//########################################################
//########################################################
//FUNÇÕES DOS PRODUTOS
//########################################################
//########################################################



//########################################################
//MONTA QUERY DOS PRODUTOS DO FORNECEDOR
//########################################################
function monta_queryproduto() {

    $("#informacoes_adicionais input").val("");

    LimpaTabela(DIV_PRODUTO);
    LimpaTabela(DIV_PRODUTO_NOVO);
    $(DIV_PRODUTO).html("<img src='../component/loading.gif' />");

    var empresa = $("#cbEmpresa"),
        actpos = $("#positionfornec").val(),
        em_number = $("#cbEmpresa").val(),
        novopreco;

    var funcao = "funcao=montaProd&fo_number=" + objTabelaFo.registros[actpos].fo_number +
        "&fa_number=" + $("#cbFamilia").val() +
        "&pt_ativo=" + ($("#ckinativos").is(":checked") ? "true" : "false") +
        "&cbOrdem=" + $("#cbOrdem").val() +
        "&pt_code=" + $('#search').val();

    ajax(funcao, EXEC, function(retorno) {

        if (!empty(retorno.error)) {
            swal('Erro ao buscar Produtos', retorno.mensagem, 'error');
            return;
        }

        objTabelaProd = retorno;
        $('#recordproduto').val(retorno.total);
        swal.close();
        //FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
        paginationProd(1);

    });
}


//########################################################
//MONTA PAGINATION DOS PRODUTOS DO FORNECEDOR
//########################################################
function montaPaginasProd(paginaAtual, totalDePaginas) {
    $("#paginacaopreco").html("");
    if (totalDePaginas == 1) {
        return;
    }

    var links = 4; // numero de paginas antes e depois da pagina atual
    var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
    var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);


    if (paginaAtual >= (links + 2)) {
        //CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
        $('#paginacaopreco').append("<span onclick='paginationProd(" + 1 + ");'>" + 1 + "</span>");
        $('#paginacaopreco').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
    }

    for (var i = inicio; i <= fim; i++) {
        if (i == paginaAtual) {
            $('#paginacaopreco').append("<span class='active cor_padrao'>" + i + "</span>");
        } else {
            //CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
            $('#paginacaopreco').append("<span onclick='paginationProd(" + i + ");' class='cor_padraoInvert_hover'>" + i + "</span>");
        }
    }
    if (paginaAtual <= (totalDePaginas - (links + 2))) {
        $('#paginacaopreco').append("<span class='no-border cor_padraoInvert_hover'>...</span>");
        //CASO HOUVER MAIS DE 2 TABELAS TOMAR CUIDADO COM A CHAMADA DA FUNÇÃO PAGINATION
        $('#paginacaopreco').append("<span onclick='paginationProd(" + totalDePaginas + ");' class='cor_padraoInvert_hover'>" + totalDePaginas + "</span>");
    }
}


//########################################################
//JOGA NA TELA A PAGINAÇÃO DAS 2 TABELAS DE PRODUTOS
//########################################################
function paginationProd(paginaAtual, fCustom) {
    var totalDePaginas = Math.ceil(objTabelaProd.total / FO_LIMITE_REGISTROS);
    if (paginaAtual > totalDePaginas) {
        paginaAtual = totalDePaginas;
    }

    var fim = paginaAtual * FO_LIMITE_REGISTROS;
    if (fim > objTabelaProd.total) {
        fim = objTabelaProd.total;
    }

    var inicio = ((paginaAtual - 1) * FO_LIMITE_REGISTROS);

    //RESETA A POSICAO E O TOTAL
    $('#positionproduto').val("null");
    $('#recordproduto').val(objTabelaProd.total);
    zeraDetalhes();
    $(DIV_PRODUTO_DETALHES).attr('prod', '');

    LimpaTabela(DIV_PRODUTO);
    LimpaTabela(DIV_PRODUTO_NOVO);

    //REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
    montaPaginasProd(paginaAtual, totalDePaginas);

    if (objTabelaProd.total > 0) {
        for (var i = inicio; i < fim; i++) {
            $(DIV_PRODUTO).append("<tr posicao='" + i + "'>" + Prod_linha(i, "prod") + "</tr>");
            $(DIV_PRODUTO_NOVO).append("<tr posicao='" + i + "'>" + Prod_linha(i, "prod_novo") + "</tr>");
        }

        if (!TestaAcesso('BAS.PRODUTO', 2)) {
            $(DIV_PRODUTO + " td," + DIV_PRODUTO_NOVO + " td").addClass("inativo");
            $(DIV_PRODUTO + " td input," + DIV_PRODUTO_NOVO + " td input").prop("readonly", true);
        }
    }

    //SELECIONA A PRIMEIRA LINHA
    if (objTabelaProd.total > 0 && empty(fCustom)) {
        pintaLinha_prod($(DIV_PRODUTO + ' tr:eq(0)'));
        $(DIV_PRODUTO).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
    }

    if (!empty(fCustom)) {
        fCustom();
    }
}


//########################################################
//RETORNA AS LINHAS DO PRODUTO PARA O LAYOUT
//########################################################
function Prod_linha(i, o_que) {

    var getCorMargem = function(margem) {

        if (margem == objInf.margem_padrao) {
            return "bg-laranja";
        }

        return "";
    };

    var aux = objTabelaProd.registros[i],
        table = "";

	switch (o_que) {
		case "prod":
			table += ""+
					"<td class='w20 inativo center'><input value='' readonly tabindex='-1'/></td>"+
					"<td class='w120 inativo'><input value='"+aux.pt_code+"' name='pt_code' maxlength='16' readonly tabindex='-1'/></td>"+
					"<td class='w330 inativo uppercase-input'><input name='pt_descr_aux' value='"+aux.pt_descr+"' maxlength='50' readonly tabindex='-1'/></td>"+
					"<td class='w70 inativo number'><input name='pt_precolista' value='"+aux.pt_precolista+"' maxlength='14' readonly tabindex='-1'/></td>"+
					"<td class='w60 number'><input name='pt_custo' value='"+aux.pt_custo+"' maxlength='17'/></td>"+
					"<td class='w60 number "+getCorMargem('A')+"'><input name='pt_margem_a' value='"+aux.pt_margem_a+"' maxlength='13'/></td>"+
					"<td class='w60 number "+getCorMargem('B')+"'><input name='pt_margem_b' value='"+aux.pt_margem_b+"' maxlength='13'/></td>"+
					"<td class='w60 number "+getCorMargem('C')+"'><input name='pt_margem_c' value='"+aux.pt_margem_c+"' maxlength='13'/></td>"+
					"<td class='w60 number'><input name='pt_margem_p' value='"+aux.pt_margem_p+"' maxlength='13'/></td>"+
					"<td class='w40 number'><input name='pt_ipi' value='"+aux.pt_ipi+"' maxlength='13'/></td>"+
					"<td class='w60 number'><input name='pt_preco' value='"+aux.pt_preco+"' maxlength='14'/></td>"+
					"";
		break;
		case "prod_novo":
			table += ""+
					"<td class='w20 inativo center'><input value='' readonly tabindex='-1'/></td>"+
					"<td class='w110 inativo'><input name='pt_code' value='"+aux.pt_code+"' maxlength='16' readonly tabindex='-1'/></td>"+
					"<td class='w220 uppercase-input'><input name='pt_descr' value='"+aux.pt_descr+"' maxlength='50'/></td>"+
					"<td class='w60 number'><input name='pt_novalista' value='"+aux.pt_novalista+"' maxlength='17'/></td>"+
					"<td class='w60 number'><input name='pt_desconto' value='"+aux.pt_desconto+"' maxlength='8'/></td>"+
					"<td class='w60 number'><input name='pt_despfrete' value='"+aux.pt_despfrete+"' maxlength='15'/></td>"+
					"<td class='w70 number'><input name='pt_novocusto' value='"+aux.pt_novocusto+"' maxlength='17'/></td>"+
					"<td class='w60 number "+getCorMargem('A')+"'><input name='pt_novomga' value='"+aux.pt_novomga+"' maxlength='13'/></td>"+
					"<td class='w60 number "+getCorMargem('B')+"'><input name='pt_novomgb' value='"+aux.pt_novomgb+"' maxlength='13'/></td>"+
					"<td class='w60 number "+getCorMargem('C')+"'><input name='pt_novomgc' value='"+aux.pt_novomgc+"' maxlength='13'/></td>"+
					"<td class='w50 number'><input name='pt_novomgp' value='"+aux.pt_novomgp+"' maxlength='13'/></td>"+
					"<td class='w40 number inativo'><input name='mva' value='"+aux.mva+"' maxlength='7' readonly tabindex='-1'/></td>"+
					"<td class='w70 number bg verde-oliva'><input name='pt_novopreco' value='"+aux.pt_novopreco+"' maxlength='14'/></td>"+
					"";
		break;
	}

    return table;
}


//########################################################
//ZERA OS DETALHES QUANDO NECESSÁRIO
//########################################################
function zeraDetalhes(){
    $(DIV_PRODUTO_DETALHES + " input[name=pt_unid], "+
      DIV_PRODUTO_DETALHES + " input[name=fp_code], "+
      DIV_PRODUTO_DETALHES + " input[name=pt_usuario], "+
      DIV_PRODUTO_DETALHES + " input[name=pt_curva]"
    ).val("");

    $(DIV_PRODUTO_DETALHES + " input[name=pt_icms]").prop("disabled", true);

    $.each(margens = ['a','b','c'], function( index, value ) {
        $(DIV_PRODUTO_DETALHES + " input[name=preco_"+value+"]").val("0,00");
    });
}


//########################################################
//PINTA A LINHA DE PRODUTOS
//########################################################
function pintaLinha_prod(elemento) {
    var posicao = $(elemento).attr('posicao');
    $('#positionproduto').val(posicao);

    $(DIV_PRODUTO + ' .active,' + DIV_PRODUTO_NOVO + ' .active').removeClass('active');
    $(DIV_PRODUTO + " tr[posicao=" + posicao + "], " + DIV_PRODUTO_NOVO + " tr[posicao=" + posicao + "]").addClass('active');

    if ($(DIV_PRODUTO_DETALHES).attr('prod') != posicao) {
        $(DIV_PRODUTO_DETALHES).attr('prod', posicao);

        var aux = objTabelaProd.registros[posicao];
        $(DIV_PRODUTO_DETALHES + " input[name=pt_unid]").val(aux.pt_unid);
        $(DIV_PRODUTO_DETALHES + " input[name=fp_code]").val(aux.fp_code);

        $(DIV_PRODUTO_DETALHES + " input[name=pt_icms]").val(aux.pt_icms);
        if (TestaAcesso('BAS.PRODUTO', 2)) { $(DIV_PRODUTO_DETALHES + " input[name=pt_icms]").prop("disabled", false); }

        $(DIV_PRODUTO_DETALHES + " input[name=pt_usuario]").val(aux.pt_usuario);
        $(DIV_PRODUTO_DETALHES + " input[name=pt_curva]").val(aux.pt_curva);

        $(DIV_FORNECEDOR + " tr[posicao='" + $("#positionfornec").val() + "'] input[name='icmsinter']").val(number_format(aux.icmsinter, 2, ",", "."));

        calculaFields();
    }
}


//########################################################
//NÃO PERMITE O CAMPO FICAR VAZIO E TRAS FORMATAÇÃO DE NUMERO
//########################################################
function notnull(elemento) {
    //PEGA O NAME DO INPUT
    var campo = $(elemento).attr('name');
    var casa = 2;

    switch (campo) {
        case 'pt_custo':
        case 'pt_novalista':
        case 'pt_novocusto':
            casa = 4;
        break;

        case 'pt_ipi':
            casa = 0;
        break;
    }

    if (empty($(elemento).val())) { $(elemento).val("0"); }
    if ($(elemento).val() !== '' ) {
        $(elemento).val( number_format(tonumber($(elemento).val()).replace(",", "."), casa, ",", ".") );
    }
}


//########################################################
//COLOCA E STATUS DE EDIÇÃO A DIV
//########################################################
function edicao(elemento) {
    var posicao = $("#positionproduto").val(),
        campo = $(elemento).attr('name'),
        original = objTabelaProd.registros[posicao][campo],
        tabela = "#" + $(elemento).closest("tbody").attr('id');

    //NAO HOUVE ALTERACAO
    if ($(elemento).val() == original || !empty(getStatus(posicao, tabela))) {
        return;
    }

    setStatus(posicao, 'a', DIV_PRODUTO);
    setStatus(posicao, 'a', DIV_PRODUTO_NOVO);

    Bloqueia_Linhas(posicao, DIV_PRODUTO);
    Bloqueia_Linhas(posicao, DIV_PRODUTO_NOVO);
}


//########################################################
//CANCELA LINHA APATIR DO QUE SE ENCONTRA NO REGISTRO
//########################################################
function cancela(cell, tabela, extra_itens) {
    var actpos = $('#positionproduto').val();
    if (empty(actpos)) {
        return;
    }

    if (empty(cell)) {
        cell = 2;
    }

    if (empty(tabela)) {
        tabela = DIV_PRODUTO;
    }

    //ESSA FUNÇÃO É FEITA DEPOIS DE FAZER TODAS AS VERIFICAÇÕES DO CANCELA
    var ao_final = function() {
        selecionaLinha(tabela, actpos, cell);

        if (!empty(extra_itens)) {
            setTimeout(function() {
                $(DIV_PRODUTO_DETALHES + " .ui.segment input[name=" + extra_itens + "]").select();
            }, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
        }
    };

    if (!Verifica_Alteracao(DIV_PRODUTO) || !Verifica_Alteracao(DIV_PRODUTO_NOVO)) {
        var tr = Prod_linha(actpos, 'prod'),
            tr_novo = Prod_linha(actpos, 'prod_novo');

        $(DIV_PRODUTO + " tr[posicao=" + actpos + "]").html(tr);
        $(DIV_PRODUTO_NOVO + " tr[posicao=" + actpos + "]").html(tr_novo);

        $(DIV_PRODUTO_DETALHES).attr('prod', "");
        pintaLinha_prod($(tabela + " tr[posicao=" + actpos + "]"));

        Desbloqueia_Linhas(actpos, DIV_PRODUTO);
        Desbloqueia_Linhas(actpos, DIV_PRODUTO_NOVO);
    }

    ao_final();
}


//########################################################
//SALVA ALTERAÇÕES DOS DADOS DOS PRODUTOS
//########################################################
function grava(cell, tabela, fcustom_grava, extra_itens) {
    var actpos = $("#positionproduto").val();
    if (empty(actpos)) {
        swal('Atenção', 'É necessário selecionar uma linha da tabela de produtos', 'warning');
        return;
    }

    if (empty(cell)) {
        cell = 2;
    }

    if (empty(tabela)) {
        tabela = DIV_PRODUTO;
    }

    if (Verifica_Alteracao(DIV_PRODUTO) || Verifica_Alteracao(DIV_PRODUTO_NOVO)) {
        selecionaLinha(tabela, actpos, cell);

        if (!empty(extra_itens)) {
            setTimeout(function() {
                $(DIV_PRODUTO_DETALHES + " .ui.segment input[name=" + extra_itens + "]").select();
            }, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
        }

        return;
    }

    var linha = DIV_PRODUTO + " tr[posicao=" + actpos + "] input",
        linha_novo = DIV_PRODUTO_NOVO + " tr[posicao=" + actpos + "] input",
        item_exta = DIV_PRODUTO_DETALHES + " .ui.segment:eq(0) input",
        actpos_fo = $("#positionfornec").val(),
        fo_number = objTabelaFo.registros[actpos_fo].fo_number;

    var funcao = "funcao=grava" +
        "&pt_code=" + objTabelaProd.registros[actpos].pt_code +
        "&pt_descr=" + $(linha + "[name=pt_descr_aux]").val() +
        "&pt_custo=" + $(linha + "[name=pt_custo]").val() +
        "&pt_margem_a=" + $(linha + "[name=pt_margem_a]").val() +
        "&pt_margem_b=" + $(linha + "[name=pt_margem_b]").val() +
        "&pt_margem_c=" + $(linha + "[name=pt_margem_c]").val() +
        "&pt_margem_p=" + $(linha + "[name=pt_margem_p]").val() +
        "&pt_ipi=" + $(linha + "[name=pt_ipi]").val() +
        "&pt_preco=" + $(linha + "[name=pt_preco]").val() +

        "&pt_icms=" + $(item_exta + "[name=pt_icms]").val() +

        "&pt_novalista=" + $(linha_novo + "[name=pt_novalista]").val() +
        "&pt_desconto=" + $(linha_novo + "[name=pt_desconto]").val() +
        "&pt_despfrete=" + $(linha_novo + "[name=pt_despfrete]").val() +
        "&pt_novocusto=" + $(linha_novo + "[name=pt_novocusto]").val() +
        "&pt_novomga=" + $(linha_novo + "[name=pt_novomga]").val() +
        "&pt_novomgb=" + $(linha_novo + "[name=pt_novomgb]").val() +
        "&pt_novomgc=" + $(linha_novo + "[name=pt_novomgc]").val() +
        "&pt_novomgp=" + $(linha_novo + "[name=pt_novomgp]").val() +
        "&pt_novopreco=" + $(linha_novo + "[name=pt_novopreco]").val() +

        "&inativos=" + ($("#ckinativos").is(":checked") ? "true" : "false") +
        "&fo_number=" + fo_number +
        "&fa_number=" + $("#cbFamilia").val();

    loading.show('Aguarde, gravando dados do produto...');

    ajax(funcao, EXEC, function(retorno) {
        loading.close();
        if (!empty(retorno.error)) {
            swal({
                    title: 'Erro ao gravar produto',
                    text: retorno.mensagem,
                    type: 'error'
                },
                function() {
                    selecionaLinha(tabela, actpos, cell);

                    if (!empty(extra_itens)) {
                        setTimeout(function() {
                            $("#divItens .ui.segment input[name=" + extra_itens + "]").select();
                        }, 20); //A FUNÇÃO SELECIONALINHA TEM UM setTimeout DE 10 ENTÃO COLOCO UM DE 20 PARA SOBRESCREVER
                    }
                }
            );
            return;
        }

        //VOU ATUALIZAR O MEU OBJETO JSON
        objTabelaProd.registros[actpos] = retorno.registros[0];

        cancela(cell, tabela, extra_itens);

        if (!empty(fcustom_grava)) {
            fcustom_grava();
            return;
        }
    });
}

//########################################################
//CALCULA PREÇO DE OUTRAS MARGENS DO DETALHES
//########################################################
function calculaFields(){
    var actpos = $("#positionproduto").val();
    if (empty(actpos)) {
        swal("Atenção", "Selecione um produto", "warning");
        return;
    }

    var linha_novo = DIV_PRODUTO_NOVO + " tr[posicao=" + actpos + "] input[name=",
        pt_novocusto = Number(tonumber($(linha_novo+"pt_novocusto]").val()).replace(",", ".")),
        margens = ['a','b','c'];

    $.each(margens, function( index, value ) {
        var margem = Number(tonumber($(linha_novo+"pt_novomg"+value+"]").val()).replace(",", "."));
        $(DIV_PRODUTO_DETALHES + " input[name=preco_"+value+"]").val( number_format(((margem/100+1) * pt_novocusto), 2,",",".") );
    });
}

//########################################################
//FUNÇAO QUE IMPEDE OS PRODUTOS DE FICAR DESATUALIZADO
//########################################################
function naoPercaDados(quemChamou) {
    if (!Verifica_Alteracao(DIV_PRODUTO) || !Verifica_Alteracao(DIV_PRODUTO_NOVO)) {
        grava(2, '', function() {
            quemChamou();
        });
        return false;
    }

    return true;
}


//########################################################
//RESUMO DE PRODUTO
//TODAS AS CHAMADAS DA CONSULTA DO RESUMO PRECISAM TER ESSE NOME PARA QUE FUNCIONE
//########################################################
function resumo(){
    var actpos = $("#positionproduto").val();
    if(empty(actpos)){
        swal('Atenção','É necessário selecionar uma linha','warning');
        return;
    }

    if (!naoPercaDados(function() { resumo(); })) {
        return;
    }

    itens = {
        objProduto: objTabelaProd.registros,
        actpos: actpos,
        divDaConsulta: 'boxconsresumo',
        limite: FO_LIMITE_REGISTROS,
        pagination: function(pagina, posicao){
            paginationProd(pagina, function(){
                pintaLinha_prod($(DIV_PRODUTO + " tr[posicao="+posicao+"] "));
            });
        },
        pintaLinha: function(posicao){
            pintaLinha_prod($(DIV_PRODUTO + " tr[posicao="+posicao+"] "));
        }
    };

    abre_resumo(itens);
}










//########################################################
//CALCULA NOVO PRECO EXEC
//EXIBE FORMULA DO CALCULO NOVO PRECO EXEC
//########################################################
function novoPreco(mostra,fCustom) {
    var actpos_fornec = $("#positionfornec").val();
    if (empty(actpos_fornec)) {
        swal("Atenção", "Selecione um fornecedor", "warning");
        return;
    }

    var actpos = $("#positionproduto").val();
    if (empty(actpos)) {
        swal("Atenção", "Selecione um produto", "warning");
        return;
    }


    var linha = DIV_PRODUTO + " tr[posicao=" + actpos + "] input[name=",
        linha_novo = DIV_PRODUTO_NOVO + " tr[posicao=" + actpos + "] input[name=",
        margem_padrao = "pt_novomg"+objInf.margem_padrao.toLowerCase(),
        fo_aux = objTabelaFo.registros[actpos_fornec],
        pt_aux = objTabelaProd.registros[actpos],

        funcao = "funcao=novoCusto"+

                 "&mostra="+(!empty(mostra) ? 1 : 0) +

                 "&fo_desc="+fo_aux.fo_desc+
                 "&fo_descesp="+fo_aux.fo_descesp+
                 "&fo_rateio="+fo_aux.fo_rateio+
                 "&fo_calc_icms="+fo_aux.fo_calc_icms+

                 "&pt_ipi="+$(linha+"pt_ipi]").val()+

                 "&pt_novalista="+$(linha_novo+"pt_novalista]").val()+
                 "&pt_desconto="+$(linha_novo+"pt_desconto]").val()+
                 "&pt_despfrete="+$(linha_novo+"pt_despfrete]").val()+

                 "&mva="+pt_aux.mva+
                 "&icmsintra="+pt_aux.icmsintra+
                 "&icmsinter="+pt_aux.icmsinter+

                 "&margem="+$(linha_novo+margem_padrao+"]").val();

    loading.show("recalculando custo");
    ajax(funcao, EXEC, function(retorno) {
        loading.close();

        if (!empty(retorno.error)) {
            swal('Erro ao calcular custo produto',retorno.mensagem,'error');
            return;
        }

        if(empty(mostra)){
            $(linha_novo+"pt_novocusto]").val(retorno.custo);
            $(linha_novo+"pt_novopreco]").val(retorno.preco);
        }
        else{
            swal({
                    title: "",
                    text: retorno.calculo,
                    type: "info",
                    html: true
                }
            );
        }

        if (!empty(fCustom)) {
            fCustom();
        }
    });
}


//########################################################
//CALCULA LOCALMENTE CUSTO MARGEM OU PRECO FIXO
//########################################################
function novo_C_M_PF(qual){
    var actpos = $("#positionproduto").val();
    if (empty(actpos)) {
        swal("Atenção", "Selecione um produto", "warning");
        return;
    }

    var linha_novo = DIV_PRODUTO_NOVO + " tr[posicao=" + actpos + "] input[name=",
        pt_nova_margem = Number(tonumber($(linha_novo+"pt_novomg"+objInf.margem_padrao.toLowerCase()+"]").val()).replace(",", ".")),
        pt_novopreco = Number(tonumber($(linha_novo+"pt_novopreco]").val()).replace(",", ".")),
        pt_novocusto = Number(tonumber($(linha_novo+"pt_novocusto]").val()).replace(",", ".")),

        linha = DIV_PRODUTO + " tr[posicao=" + actpos + "] input[name=",
        pt_custo = Number(tonumber($(linha+"pt_custo]").val()).replace(',','.')),
        pt_margem = Number(tonumber($(linha+"pt_margem_"+objInf.margem_padrao.toLowerCase()+"]").val()).replace(',','.'));

    switch (qual) {
        case 'C': //CUSTO
            $(linha_novo+"pt_novopreco]").val( number_format((pt_novocusto*(1+pt_nova_margem/100)),2,",",".") );
        break;
        case 'M': //MARGEM
            $(linha_novo+"pt_novomg"+objInf.pt_nova_margem.toLowerCase()+"]").val( number_format(( (pt_novopreco / pt_novocusto -1) * 10000/100 ),2,",",".") );
        break;
        case 'PF': //PREXO FIXO
            $(linha+"pt_preco]").val( number_format( (pt_custo * (1 + (pt_margem / 100))) ,2,",",".") );
        break;
    }

}


//########################################################
//EXECUTA PROCEDURE zFormaPreco APARTIR DA OPERAÇÃO
//########################################################
function formapreco(operacao) {
    var actpos_fornec = $("#positionfornec").val();
    if (empty(actpos_fornec)) {
        swal("Atenção", "Selecione um fornecedor", "warning");
        return;
    }

    var actpos = $("#positionproduto").val();
    if (empty(actpos)) {
        swal("Atenção", "Selecione um produto", "warning");
        return;
    }

    if (!naoPercaDados(function() { formapreco(operacao, letra, menuMargem); })) {
        return;
    }

    var fazer = "",
        cell = 2;

    switch (operacao) {
        case 'A':
            fazer = "copiar os registros da Lista Nova para a Lista Atual";
            break;

        case 'T':
            fazer = "copiar TODAS as margens atuais para a Lista Nova";
            cell = 7;
            break;

        case 'C':
            fazer = "zerar o preço de Lista Nova";
            cell = 3;
            break;

        case 'D':
            fazer = "atualizar todos os descontos da Lista Nova";
            cell = 4;
            break;

        case 'M':
            fazer = "Atualizar margem do fornecedor";
            break;
    }

     var execucao = function() {

          var  fo_number = objTabelaFo.registros[actpos_fornec].fo_number,
               fa_number = $("#cbFamilia").val(),
               teste = $('#cktodosfornec_qual').val(),
               funcao = "funcao=formapreco&comando=" + operacao +
               "&fo_number=" + ((operacao == 'M' && $('#cktodosfornec_qual').val() == 'true') ? 0 : fo_number) +
               "&margem=" + ((operacao == 'M') ? $("#cb_margem_qual").val() : objInf.margem_padrao) +
               "&fa_number=" + fa_number +
               "&inativos=" + ($("#ckinativos").is(":checked") ? "true" : "false");

          if (operacao == "D") {
               funcao += "&fAliq=" + $(DIV_PRODUTO_NOVO + " tr[posicao=" + actpos + "] input[name=pt_desconto]").val();
          }

          if (operacao == "M") {
               funcao += "&fAliq=" + $("#alt_nMargem_qual").val() +
                         "&pCurva=" + $("#nCurva_qual").val() +
                         "&fo_number_true=" + fo_number;
          }

          swal.loading("Aguarde o fim da requisição");
          ajax(funcao, EXEC, function(retorno) {

               if (!empty(retorno.error)) {
                    swal('Erro ao ' + fazer, retorno.mensagem, 'error');
                    return;
               }

               //VOU ATUALIZAR O MEU OBJETO JSON
               objTabelaProd.registros = retorno.registros;
               monta_queryproduto();
          });
     };

    if (operacao != 'M') {
        swal({
                title: "Deseja " + fazer + " ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                closeOnConfirm: false,
                closeOnCancel: true,
                showLoaderOnConfirm: true,
            },
            function(confirmou) {
                if (!confirmou) {
                    return;
                }

                execucao();
            }
        );
        return;
    }

    execucao();
}


//########################################################
//VALIDA A ATUALIZAÇÃO DAS MARGENS
//########################################################
function showAtualizaMargem() {
    var actpos = $("#positionfornec").val();
    if (empty(actpos)) {
        swal('Atenção', 'É necessário selecionar um fornecedor', 'warning');
        return;
    }

    $("#cb_margem_qual, #alt_nMargem_qual, #nCurva_qual, #cktodosfornec_qual").val("");
    var HTMLmargens = ""+
        "<div id='div_alt_margens' class='h200'>" +
            "<p>" +
                "<select id='cb_margem' class='ui search dropdown w250'>" +
                    "<option value='' selected>SELECIONE UMA MARGEM</option>" +
                    "<option value='A'>MARGEM A</option>" +
                    "<option value='B'>MARGEM B</option>" +
                    "<option value='C'>MARGEM C</option>" +
                    "<option value='P'>MARGEM P</option>" +
                "</select>" +
            "</p>" +

            "<div class='float-left w200' style='margin: 10px 0 10px 20px;'>" +
            "<p class='text-align-left' style='margin: 0 0 8px 0;'>Nova Alíquota</p>" +
            "<input type='number' id='alt_nMargem' class='w200 margin0 inline text-align-right' value='0.00' style='padding: 0px 12px;'>" +
            "</div>" +

            "<div class='float-left w200' style='margin: 10px 0 10px 20px;'>" +
            "<p class='text-align-left' style='margin: 0 0 8px 0;'>CURVA</p>" +
            "<input type='text' id='nCurva' class='w200 margin0 inline text-align-left uppercase' style='padding: 0px 12px;' maxlength='3'>" +
            "</div>" +

            "<p style='display: block;margin: 120px 0 0 0;height: 0;' class='incluido'>" +
            "</p>" +
            "<p style='display: block;margin: 0 10px 0 90px;' class='float-left incluido'>" +
            "<label class='text' for='cktodosfornec'>Todos Fornecedores:</label>" +
            "</p>" +
            "<div class='ui toggle checkbox' style='margin-right: 120px!important;'>"+
                 "<input type='checkbox' id='cktodosfornec'>"+
                 "<label for=''></label>"+
            "</div>"+
        "</div>";

    //EXIBE LAYOUT
    swal({
            title: "ALTERAÇÃO DE MARGENS",
            text: HTMLmargens,
            html: true,
            showCancelButton: true,
            confirmButtonText: "Executa",
            closeOnConfirm: false,
        },
        function(confirmou) {
            var ao_final = function() {
                //VOLTA AO PADRÃO
                $('.sweet-alert').css('overflow', 'hidden');
                $(".sweet-alert .sa-input-error").css('top', '34px');
            };

            if (!confirmou) {
                ao_final();
            }

            var cb_margem = $('.sweet-alert #cb_margem').val();
            if (empty(cb_margem)) {
                swal.showInputError("Selecione uma margem");
                return false;
            }

            var alt_nMargem = $(".sweet-alert #alt_nMargem").val();
            if (empty(alt_nMargem) || alt_nMargem < 0) {
                swal.showInputError("Digite um valor de alíquota");
                return false;
            }

            var nCurva = $('.sweet-alert #nCurva').val().toUpperCase();
            reg = /^[A-Z0-9]{0,3}$/g;

            if (!reg.test(nCurva)) {
                swal.showInputError("Curva digitada inválida!");
                return false;
            }

            var cktodosfornec = 'false';
            if ($('#cktodosfornec').is(':checked')) {
                cktodosfornec = 'true';
            }

            $("#cb_margem_qual").val(cb_margem);
            $("#alt_nMargem_qual").val(alt_nMargem);
            $("#nCurva_qual").val(nCurva);
            $("#cktodosfornec_qual").val(cktodosfornec);

            var fo_abrev = objTabelaFo.registros[actpos].fo_abrev,
                familia = $("#cbFamilia").val();
            confirmacao = "A margem <b class='font-size15'>" + cb_margem + "</b> de todos os produtos";

            if (familia !== '0' && cktodosfornec == 'false') {
                confirmacao += " da família <b class='font-size15'>" + familia + "</b>";
            }

            if (cktodosfornec == 'true') {
                confirmacao += " de <b class='font-size15'>todos</b> os fornecedores";
            } else {
                confirmacao += " do fornecedor <b class='font-size15'>" + fo_abrev + "</b>";
            }

            if (!empty(nCurva)) {
                confirmacao += " que estão dentro da curva <b class='font-size15'>" + nCurva + "</b>";
            }
            confirmacao += " será alterada para <b class='font-size15'>" + alt_nMargem + "%</b>.<br/><br/> Confirma a operação?</label></div>";

            ao_final();

            swal({
                    title: "LEIA COM ATENÇÃO",
                    text: confirmacao,
                    html: true,
                    type: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Não",
                    confirmButtonText: "Sim",
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true,
                    confirmButtonColor: "#DD6B55"
                },
                function(confirmou) {
                    if (confirmou) {
                        formapreco("M");
                    }
                }
            );
        }
    );

    //MUDANÇA DO SWEET ALERT PARA SE AJUSTAR AO NOVO LAYOUT
    $('.sweet-alert').css('overflow', 'visible');
    $(".sweet-alert .sa-input-error").css('top', '13px');

    $('.sweet-alert .ui.dropdown').dropdown();

    $('.sweet-alert #alt_nMargem')
        .attr('onkeypress', 'return somenteNumero(event,true,false,this); ')
        .blur(function() {
            if (empty($(this).val())) { $(this).val(0); }
            if (!empty($(this).val())) { $(this).val( number_format($(this).val(), 2, ".", "") ); }
        })
        .on("focus",function(){$(this).select();});

    $('.sweet-alert #nCurva').on("focus",function(){$(this).select();});
}


//########################################################
//RECALCULA O PREÇO LOCAL DE TODOS OS PRODUTOS
//########################################################
function recalculaTodos() {
    if (objTabelaProd.total < 0) {
        swal('Atenção', 'É necessario ter pelo menos um produto pesquisado para esse fornecedor', 'warning');
        return;
    }

    if (!naoPercaDados(function() { recalculaTodos(); })) {
        return;
    }

    swal({
            title: "Deseja recalcular TODOS os custos da Lista Nova ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            closeOnConfirm: false,
            closeOnCancel: true,
            showLoaderOnConfirm: true,
        },
        function(confirmou) {
            if (!confirmou) {
                return;
            }

            var actpos = $("#positionfornec").val(),
                aux_fo = objTabelaFo.registros[actpos],

                funcao = "funcao=recalculaTodos&fo_number=" + aux_fo.fo_number +
                         "&fa_number=" + $("#cbFamilia").val() +
                         "&pt_ativo=" + ($("#ckinativos").is(":checked") ? "true" : "false") +
                         "&cbOrdem=" + $("#cbOrdem").val() +
                         "&texto=" + $('#search').val() +
                         "&em_number=" + $("#cbEmpresa").val() +
                         "&fo_abrev=" + aux_fo.fo_abrev +
                         "&pt_novopreco=" + ($('#cknovopreco').is(':checked') ? 'true' : 'false');

            ajax(funcao, EXEC, function(retorno) {

                if (!empty(retorno.error)) {
                    swal('Erro ao recalcular custos dos produtos', retorno.mensagem, 'error');
                    return;
                }

                //VOU ATUALIZAR O MEU OBJETO JSON
                objTabelaProd.registros = retorno.registros;
                actpos = $("#positionproduto").val();
                paginationProd(getPagina("#recordproduto", "#paginacaopreco", FO_LIMITE_REGISTROS), function() {
                    selecionaLinha(DIV_PRODUTO_NOVO, actpos, 3);
                    swal.close();
                });
            });

        }
    );
}



//########################################################
//########################################################
//FIM FUNÇÕES DOS PRODUTOS
//########################################################
//########################################################

















//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function() {
    loading.show("Carregando Dados...");


    //########################################################
    //QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
    //########################################################
    shortcut.add("F2", function() {
        if ($('#fo_search').is(':focus')) {
            $('#search').focus();
        } else {
            $('#fo_search').focus();
        }
    });


    //########################################################
    //SELECIONA PESQUISA DO PRODUTO E MONTA A QUERY COM ENTER
    //########################################################
    $("#fo_search")
        .focus(function() { $(this).select(); })
        .on("keyup", function(e) {
            var actpos = $("#positionfornec").val();
            switch (e.which) {
                case 38: //PARA CIMA
                    if (actpos > 0) {
                        selecionaLinha(DIV_FORNECEDOR, --actpos, 0);
                    }
                break;

                case 40: //PARA BAIXO
                    if (Number(actpos) + 1 < $("#recordfornec").val()) {
                        selecionaLinha(DIV_FORNECEDOR, ++actpos, 0);
                    }
                break;

                case 13:
                    monta_queryfornec();
                break;
            }
        });

    //########################################################
    //KEYUP DOS INPUTS DA DIV_FORNECEDOR
    //########################################################
    $(DIV_FORNECEDOR).on("keyup", 'input', function(e) {
        var actpos = Number($("#positionfornec").val());
        var cell = $(this).parent().index();
        switch (e.which) {
            case 38: //PARA CIMA
                if (actpos > 0) {
                    selecionaLinha(DIV_FORNECEDOR, --actpos, cell);
                }
                else if(actpos === 0){
                    $("#fo_search").select();
                }
            break;

            case 40: //PARA BAIXO
                if (Number(actpos) + 1 < $("#recordfornec").val()) {
                    selecionaLinha(DIV_FORNECEDOR, ++actpos, cell);
                }
            break;
        }
    });

    //########################################################
    //SELECIONA FORNECEDOR
    //########################################################
    $(DIV_FORNECEDOR).on("focus", 'input', function() {
        selecaofornec($(this).parent().parent());
    });
















    //########################################################
    //SINCRONIZA AS 2 TABELAS
    //########################################################
    $("#consultaProduto, #consultaProdutoNovo").on("scroll", function() {
        $("#consultaProduto, #consultaProdutoNovo").scrollTop($(this).scrollTop());
    });


    //########################################################
    //SELECIONA PESQUISA DO PRODUTO E MONTA A QUERY COM ENTER
    //########################################################
    $("#search")
        .focus(function() { $(this).select(); })
        .on("keyup", function(e) {
            var actpos = $("#positionproduto").val();
            switch (e.which) {
                case 40: //PARA BAIXO
                    if (actpos >= 0) {
                        selecionaLinha(DIV_PRODUTO, actpos, 4);
                    }
                break;

                case 13:
                    monta_queryproduto();
                break;
            }
        });


    //########################################################
    //SELECAO DAS LINHAS
    //########################################################
    $(DIV_PRODUTO + "," + DIV_PRODUTO_NOVO).on("focus", 'td input', function() {
        pintaLinha_prod($(this).parent().parent());
        if (!$(this).parent().hasClass("inativo")) {
            $(this).select();
        }
    });


    //########################################################
    //KEYPRESS KEYUP DOS INPUTS DAS TABELAS
    //CHANGE DOS INPUTS DAS TABELAS
    //########################################################
    $(DIV_PRODUTO + "," + DIV_PRODUTO_NOVO).on("keypress keyup change", 'input', function(e) {

        var actpos = Number($("#positionproduto").val()),
            cell = $(this).parent().index(),
            input = $(this).attr('name'),
            tabela = "#" + $(this).closest("tbody").attr('id'),
            number = $(this).parent().hasClass("number"),
            ao_terminar = "",

            condicao_edicao = (fCustom) => {
                if(number){ notnull($(this)); }
                edicao($(this));

                var calculaNovoPreco_array = ["pt_novalista", "pt_desconto", "pt_despfrete"],
                    reajustaPrecoFixo_array = ["pt_custo", "pt_margem_a", "pt_margem_b", "pt_margem_c", "pt_margem_p"],
                    calculaNovoCusto_array = ["pt_novocusto", "pt_novomga", "pt_novomgb", "pt_novomgc", "pt_novomgp"],
                    ao_final = () => {
                        calculaFields();
                        if(!empty(fCustom)){ fCustom(); }
                    };

                if(!Verifica_Alteracao(tabela)){
                    if ($.inArray(input, calculaNovoPreco_array) !== -1) {
                        novoPreco(false,function(){ ao_final(); });
                        return;
                    }

                    var deve_fazer = "";
                    if($.inArray(input, reajustaPrecoFixo_array) !== -1) { deve_fazer = "PF"; } //PRECO FIXO
                    else if($.inArray(input, calculaNovoCusto_array) !== -1){ deve_fazer = "C"; } //CUSTO
                    else if(input == "pt_novopreco"){ deve_fazer = "M"; } //MARGEM

                    if(!empty(deve_fazer)){
                        novo_C_M_PF(deve_fazer);
                    }
                }

                ao_final();
            };

        if(e.type == "change"){
            condicao_edicao();
        }
        if(e.type == "keyup"){
            if(tabela == DIV_PRODUTO_NOVO && input == "pt_descr"){
                $(DIV_PRODUTO + " tr[posicao=" + $("#positionproduto").val() + "] input[name=pt_descr_aux]").val($(this).val());
            }
            switch (e.which) {
                case 38: //PARA CIMA
                    condicao_edicao(function(){
                        ao_terminar = function() {
                            if (actpos > 0) {
                                selecionaLinha(tabela, --actpos, cell);
                            }
                            selecionaLinha(tabela, actpos, cell);
                        };

                        if (!Verifica_Alteracao(DIV_PRODUTO) || !Verifica_Alteracao(DIV_PRODUTO_NOVO)) {
                            grava(cell, tabela, function() { ao_terminar(); });
                            return;
                        }

                        ao_terminar();
                    });
                break;

                case 40: //PARA BAIXO
                    condicao_edicao(function(){
                        ao_terminar = function() {
                            if (Number(actpos) + 1 < $("#recordproduto").val()) {
                                selecionaLinha(tabela, ++actpos, cell);
                            }
                            selecionaLinha(tabela, actpos, cell);
                        };

                        if (!Verifica_Alteracao(DIV_PRODUTO) || !Verifica_Alteracao(DIV_PRODUTO_NOVO)) {
                            grava(cell, tabela, function() { ao_terminar(); });
                            return;
                        }

                        ao_terminar();
                    });
                break;

                case 27: //ESC
                    condicao_edicao(function(){
                        cancela(cell, tabela);
                    });
                break;
            }
        }
        if(e.type === 'keypress'){
            switch (e.which) {
                case 13: //ENTER
                    condicao_edicao(function(){
                        grava(cell, tabela);
                    });
                break;
                default:
                    var sem_virgula = ["pt_ipi"],
                        sem_sinal = ["pt_novalista","pt_novocusto","pt_custo"];
                    if (number){
                        if ($.inArray(input, sem_virgula) !== -1) {
                            return somenteNumero(event,false,false, this);
                        }
                        else if ($.inArray(input, sem_sinal) !== -1) {
                            return somenteNumero(event,true,false, this);
                        }
                        else{
                            return somenteNumero(event,true,true, this);
                        }
                    }
                break;
            }
        }

    });


    //########################################################
    //SELECAO DAS LINHAS
    //########################################################
    $(DIV_PRODUTO_DETALHES).on("focus", '.ui.segment:eq(0) input:not(.inativo):not(.bg-laranja)', function() {
        $(this).select();
    });


    //########################################################
    //KEYPRESS KEYUP DOS INPUTS DA LINHA DIV_PRODUTO_DETALHES
    //CHANGE DOS INPUTS DA LINHA DIV_PRODUTO_DETALHES
    //########################################################
    $(DIV_PRODUTO_DETALHES).on("keypress keyup change", '.ui.segment:eq(0) input', function(e) {
        var actpos = Number($("#positionproduto").val()),
            extra_itens = $(this).attr('name'),

            condicao_edicao = () => {
                if($(this).hasClass('number')){
                    notnull($(this));
                }
                edicao($(this));
            };

        if(e.type == "change"){
            condicao_edicao();
        }
        if(e.type == "keyup" || e.type === 'keypress'){
            switch (e.which) {
                case 40: //PARA BAIXO
                    if (actpos >= 0) {
                        selecionaLinha(DIV_PRODUTO_NOVO, actpos, 3);
                    }
                break;
                case 27: //ESC
                    condicao_edicao();
                    cancela(2, '', extra_itens);
                break;
            }
        }
        if(e.type === 'keypress'){
            switch (e.which) {
                case 13: //ENTER
                    condicao_edicao();
                    grava(2, '', '', extra_itens);
                break;
                default:
                    return somenteNumero(event,true,false, this);
            }
        }
    });


    $('#boxconsresumo').draggable({ cursor: "move", handle: "#titulo_cnres" });
});
