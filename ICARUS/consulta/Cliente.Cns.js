//########################################################
//########################################################
			//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################



//########################################################
//VERSÃO DA TELA
//########################################################
var CNSCLI_RELEASE = '0.004',


//########################################################
//VERIFICA SE JA RODOU O safety
//########################################################
    CNSCLI_SAFETY = false,

//########################################################
//LIMITE DE REGISTROSS
//########################################################
    CNSCLIC_LIMITE_REGISTROS = 60,

    
//########################################################
//OBJETOS USADOS
//########################################################
    cnsCli_objEndereco = {}, //OBJETO PARA ENDEREÇOS DO CLIENTE
    objTabelaCli= {},
    objCliente= {
        divDaConsulta:'',
        numero:'',
        abrev :'',
        contato:'',
        telefone:'',
        fax:'',
        grupo:'',
        gfin:'',
        ativo:'',
        razao:'',
        pessoa:'',
        cnpj:'',
        iest:'',
        endereco:'',
        endernum:'',
        bairro:'',
        cidade:'',
        uf:'',
        cep:'',
        pais:'',
        prazos:'',
        email:'',
        margem:'',
        desconto:'',
        limiteCredito:'',
        pagamento:'',
        representanteAbrev:'',
        representanteNum :'',
        representanteComis :'',
        representanteAtivo:'',
        transportadoraAbrev:'',
        transportadoraNum :'',
        fator:'',
        obs1:'',
        obs2:'',
        complemento:'',
        ipinoicms:'',
        frete:'',
        consumo:'',
        atendenteComis:'',
        cl_natureza:''
    },


//########################################################
//CONSTANTES USADAS
//########################################################
    CNSCLI_EXEC = '../consulta/Cliente.Cns.Exec.php',
	CNSCLIC_DIV_TABELA = '#cnsCli_dados',
	CNSCLIC_DIV_TABELA_DETALHES = '#divDetalhesCli',
	CNSCLIC_DIV_TABELA_CLIOBS = "#cnsCli_table_obsCliente";


//########################################################
//ATIVAÇÃO DO DIMMER
//########################################################
$CNSCLIEdimmer = ativaDimmerConsulta("box-inc-cliente",
    function(){
        $('#'+objCliente.divDaConsulta).addClass('active');
        $('#cnsCli_pesquisa').focus();
    },
    function(){
        $('#'+objCliente.divDaConsulta).removeClass('active');
    }
);



//########################################################
//########################################################
			//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################




















//########################################################
//########################################################
			//FUNÇÕES DA CONSULTA CLIENTE
//########################################################
//########################################################



//########################################################
//ABRE A CONSULTA E REALIZA A PESQUISA COM O PARAMETRO PASSADO PRA FUNCAO
//########################################################
function cnsCli_abre(texto,divDaConsulta,ordem,naoPesquisa, returnFocus){
	
	if(!CNSCLI_SAFETY){
		cnsCli_safety(function(){ cnsCli_abre(texto,divDaConsulta,ordem,naoPesquisa, returnFocus); });
		return;
	}

	//COLOCA NO OBEJTO A DIV ONDE A CONSULTA FOI INSERIDA
	objCliente.divDaConsulta = divDaConsulta;
	objCliente.returnFocus = returnFocus; //PARA ONDE DEVE RETORNAR O FOCO CASO FECHE A CONSULTA
	
	//ALTERA ORDEM DO COMBO DE PESQUISA
	try{
		if(!empty(ordem)){
			$("#cnsCli_ordem").parent().dropdown('set selected',ordem);
		}
	}catch(e){}

	//COLOCA NO CAMPO DE PESQUISA DA CONSULTA OQUE FOI PESQUISADO
    $("#cnsCli_pesquisa").val(texto.trim());

	if(naoPesquisa !== undefined && naoPesquisa === true){
		//EXIBE A DIVFUNDO SOMENTE SE ESTIVER INCLUINDO A CONSULTA EM OUTRA TELA     
        
        $CNSCLIEdimmer.dimmer("consulta show");
        
        objTabelaCli.total = 0;
        cnsCli_pagination(1);
        
		if(ehMain()){
			cnsCli_montaQuery();
		}
	}else{
		//MONTA A QUERY
		cnsCli_montaQuery();
	}
}


//########################################################
//CHAMA SAFETY
//########################################################
function cnsCli_safety(fCustom){
	safety(CNSCLI_EXEC, function(){ cnsCli_liberaAcesso(fCustom); }, CNSCLI_RELEASE);
}


//########################################################
//LIBERA ACESSOS
//########################################################
function cnsCli_liberaAcesso(fCustom){
	if (!TestaAcesso('BAS.CLI.CONS')) { //usuario sem acesso fecha janela
		swal({
				title: "Atenção",
				text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
					  "Nome do acesso necessário: BAS.CLI.CONS",
				type: "warning",
				html: true,
			},
			function() {
				if(empty($CNSCLIEdimmer)){
					var win = window.open("", "_self");
					win.close();
				}
			}
		);
		return;
	}

	if (!TestaAcesso('BAS.CLIENTE',2)) {
		$(".cadCPF").prop("disabled",true);
	}

    if(ehMain()){
		$(".ui.button.agenda").before(
            "<button class='ui cor_padrao button pedidoDireto' data-content='Monta Pedido de Venda Direto' onclick='cnsCli_editar(\"D\");'><span>PV Direto</span></button>"
		);
	}

	cnsCli_getCombos(fCustom);
	$("#cnsCli_pesquisa").focus();
}


//########################################################
//CARREGA OS COMBOS
//########################################################
function cnsCli_getCombos(fCustom){
    //cnsCli_cbGrupo e cnsCli_cbUF
    var funcao = "funcao=loadCombo";
    ajax(funcao, CNSCLI_EXEC, function(retorno){
        
		if(!empty(retorno.error)){
			swal('Erro ao buscar combos',retorno.mensagem,'error');
			return;
		}

        //UF
        $.each(retorno.uf, function (key, uf){
		    $('#cnsCli_cbUF').append($('<option>', {value: uf.af_codigo, text : uf.af_codigo}));
		});
        
        //GRUPO
        $.each(retorno.grupo, function (key, grupo){
		    $('#cnsCli_cbGrupo').append($('<option>', {value: grupo.cl_grupo, text : grupo.cl_grupo}));
		});

		//VENDEDOR
        $.each(retorno.vendedor, function (key, vendedor){
		    $('#cnsCli_cbRep').append($('<option>', {value: vendedor.vd_nome, text : vendedor.vd_nome}));
		});
        
        $('#det_consCliente .ui.dropdown').dropdown();
		//########################################################
		//VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
		//########################################################
		$('#det_consCliente .ui.dropdown').dropdown({
			onChange: function(value,text,itemlista) {
				if($(itemlista).parent().siblings("select").attr("id") == "cnsCli_ordem"){
					$('#cnsCli_pesquisa').val('');
				}
				$('#cnsCli_pesquisa').select();
			}
		});

		CNSCLI_SAFETY = true;
		if(!empty(fCustom)){
			fCustom();
			swal.close();
			return;
		}
		swal.close();
    });
}


//########################################################
//MONTA A QUERY PRINCIPAL
//########################################################
function cnsCli_montaQuery(){

    LimpaTabela(CNSCLIC_DIV_TABELA);
    $(CNSCLIC_DIV_TABELA).html("<img src='../component/loading.gif' />");

    var funcao = "funcao=monta&texto="+ encode_uri($("#cnsCli_pesquisa").val())+
					"&order=" + $('#cnsCli_ordem').val()+
					"&status="+$("#cnsCli_cbStatus").val()+
			  		"&grupo="+$('#cnsCli_cbGrupo').val()+
					"&uf="+$('#cnsCli_cbUF').val()+
				 	"&ckcompra=" + ($('#ckFiltroCompra').is(':checked') ? 'true' : 'false')+
					"&compra="+$('#compra').val()+
					"&vendedor="+$('#cnsCli_cbRep').val()+"";

    ajax(funcao,CNSCLI_EXEC,function(retorno){
        
		if(!empty(retorno.error)){
            loading.close();
			swal('Erro ao buscar tabela de CLIENTE',retorno.mensagem,'error');
			return;
		}

		$('#cnsCli_record').val(retorno.total);
		objTabelaCli = retorno;

        if(empty(objCliente.divDaConsulta)){
			//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
			cnsCli_pagination(1);
			return;
		}

        //ainda não abriu a consulta
		if(!$('#'+objCliente.divDaConsulta).hasClass('active')){
			//retornou so um registro
			if(objTabelaCli.total == 1) {
				$('#cnsCli_position').val('0');
				cnsCli_fecha(true);
                loading.close();
				return;
			}
            
            $CNSCLIEdimmer.dimmer("consulta show");
		}

		//FUNCAO QUE MONTA A PAGINACAO / E TRAZ OS REGISTROS DA PAGINA ATUAL
		cnsCli_pagination(1);
        loading.close();
    });
}


//########################################################
//MONTA AS PAGINAS
//########################################################
function cnsCli_montaPaginas(paginaAtual,totalDePaginas){

	$("#cnsCli_pagination").html("");
	if(totalDePaginas == 1){
		return;
	}

	var links = 4; //NUMERO DE PAGINAS ANTES E DEPOIS DA PAGINA ATUAL
	var inicio = ((paginaAtual - links) > 1 ? (paginaAtual - links) : 1);
	var fim = ((paginaAtual + links) < totalDePaginas ? ((paginaAtual + links)+1) : totalDePaginas);

	if(paginaAtual > (links + 2)){
		$('#cnsCli_pagination').append("<span onclick='cnsCli_pagination(" + 1 + ");' class='cor_padraoInvert_hover bg branco'>" + 1 + "</span>");
		$('#cnsCli_pagination').append("<span class='no-border cor_padraoInvert_hover bg branco'>...</span>");
	}

	for(var i = inicio; i <= fim; i++){
		if(i == paginaAtual){
			$('#cnsCli_pagination').append("<span class='active cor_padrao bg branco'>" + i + "</span>");
		}else{
			$('#cnsCli_pagination').append("<span onclick='cnsCli_pagination(" + i + ");' class='cor_padraoInvert_hover bg branco'>" + i + "</span>");
		}
	}
	if(paginaAtual < (totalDePaginas - (links + 2))){
		$('#cnsCli_pagination').append("<span class='no-border cor_padraoInvert_hover bg branco'>...</span>");
		$('#cnsCli_pagination').append("<span onclick='cnsCli_pagination(" + totalDePaginas + ");' class='cor_padraoInvert_hover bg branco'>" + totalDePaginas + "</span>");
	}
}


//########################################################
//POPULA AS PAGINAS DA TABELA
//########################################################
function cnsCli_pagination(paginaAtual, fCustom){
    var totalDePaginas = Math.ceil(objTabelaCli.total / CNSCLIC_LIMITE_REGISTROS);
	if(paginaAtual > totalDePaginas){
		paginaAtual = totalDePaginas;
	}

    var fim = paginaAtual * CNSCLIC_LIMITE_REGISTROS;
    if(fim > objTabelaCli.total)
        fim = objTabelaCli.total;
    var inicio = ((paginaAtual - 1) * CNSCLIC_LIMITE_REGISTROS);

    //REMONTA AS PAGINAS, REORGANIZANDO OS INDICES E MARCANDO A PAG ATUAL
	cnsCli_montaPaginas(paginaAtual,totalDePaginas);

    //RESETA A REGISTROS
    $('#cnsCli_position').val("null");
    $('#cnsCli_record').val(objTabelaCli.total);

	// LIMPA CAMPOS DOS ITENS
    LimpaTabela(CNSCLIC_DIV_TABELA);
	$(CNSCLIC_DIV_TABELA_DETALHES + " input[type=text]").val('');
	$(CNSCLIC_DIV_TABELA_DETALHES).attr('Cliente','');

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	if(objTabelaCli.total > 0){
		for(var i = inicio; i < fim; i++){
			$(CNSCLIC_DIV_TABELA).append("<tr posicao="+i+">"+cnsCli_linha(i)+"</tr>");
		}
	}

    //SELECIONA A PRIMEIRA LINHA
    if(objTabelaCli.total > 0 && empty(fCustom)){
        $('#cnsCli_pesquisa').focus();
        cnsCli_pintaLinha($(CNSCLIC_DIV_TABELA + ' tr:eq(0)'));
        $(CNSCLIC_DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
    }

    if(!empty(fCustom)){
		fCustom();
	}

	$(CNSCLIC_DIV_TABELA).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}


//########################################################
//CRIA E RETORNA AS LINHAS
//########################################################
function cnsCli_linha(i){
    var aux = objTabelaCli.registros[i];
	var bgColor ="bg amarelo";


    //MONTA A LINHA
	 var table = "<td class='w70 inativo center'><input value='"+aux.cl_number+"' name='cl_number' readonly/></td>"+
	   "<td class='w130 inativo "+bgColor+"'><input type='text' readonly value='"+aux.cl_abrev+"' name='cl_abrev'/></td>"+
	   "<td class='w120 inativo'><input type='text' readonly value='"+aux.cl_contato+"'name='cl_contato' /></td>"+
	   "<td class='w110 inativo '><input type='text'  readonly value='"+aux.cl_fone+"' name='cl_fone'/></td>"+
	   "<td class='w100 inativo '><input type='text'  readonly value='"+aux.cl_fax+"' name='cl_fax'/></td>"+
	   "<td class='w60 inativo center'><input type='text'  readonly value='"+aux.cl_grupo+"' name='cl_grupo'/></td>"+
	   "<td class='w60 inativo center '><input type='text'  readonly value='"+aux.cl_gfin+"' name='cl_gfin'/></td>"+
	   "<td class='w60 inativo center last'><input type='text'  readonly value='"+aux.cl_ativo+"' name='cl_ativo'/></td>";

   return table;

}


//########################################################
//ATIVA A CLASSE ACTIVE NA LINHA FOCADA
//########################################################
function cnsCli_pintaLinha(elemento){
    var actpos = $(elemento).attr('posicao');
	$('#cnsCli_position').val(actpos);
	$(CNSCLIC_DIV_TABELA + ' .active').removeClass('active');
	$(elemento).addClass('active');

	if($(CNSCLIC_DIV_TABELA_DETALHES).attr('Cliente') != actpos){
		$(CNSCLIC_DIV_TABELA_DETALHES).attr('Cliente',actpos);
        
        var aux = objTabelaCli.registros[actpos];
		$(CNSCLIC_DIV_TABELA_DETALHES + " input[type=text]").val("");
        jQuery.each(aux, function(key,valor){
            $(CNSCLIC_DIV_TABELA_DETALHES + " input[name="+key+"]").val(valor);
        });
        cnsCli_montaObsCli(aux.cl_number);
	}
}


//########################################################
//BUSCA E JOGA NA TELA OBS DO CLIENTE
//########################################################
function cnsCli_montaObsCli(cl_number){

	LimpaTabela(CNSCLIC_DIV_TABELA_CLIOBS);
	$(CNSCLIC_DIV_TABELA_CLIOBS).html("<img src='../component/loading.gif' />");

	var funcao = "funcao=montaObsCli&cl_number="+cl_number;
    ajax(funcao,CNSCLI_EXEC,function(retorno){
        
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de observações do CLIENTE',retorno.mensagem,'error');
			return;
		}

		LimpaTabela(CNSCLIC_DIV_TABELA_CLIOBS);

		var tabela = "";
		for(var i = 0; i < retorno.length; i++){
			tabela += ""+
				"<tr posicao=" + i + ">"+
					"<td class='w50 center inativo'><input class='uppercase' value='"+retorno[i].co_number+"' name='co_number' readonly/></td>"+
					"<td class='w640 uppercase inativo'><input value='"+retorno[i].co_linha+"' name='co_linha' readonly/></td>"+
				"</tr>";
		}
		$(CNSCLIC_DIV_TABELA_CLIOBS).append(tabela);

		//SELECIONA A PRIMEIRA LINHA
		if(retorno.length > 0){
			cnsCli_pintaLinha_obsCliente($(CNSCLIC_DIV_TABELA_CLIOBS + ' tr:eq(0)'));
			$(CNSCLIC_DIV_TABELA_CLIOBS).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
		}

		$(CNSCLIC_DIV_TABELA_CLIOBS).mCustomScrollbar({
			scrollInertia: 0.8,
			autoHideScrollbar: true,
			theme:"dark-3"
		});
    });
}


//########################################################
//PINTA AS LINHAS DA OBS CLIENTE
//########################################################
function cnsCli_pintaLinha_obsCliente(elemento){
	$(CNSCLIC_DIV_TABELA_CLIOBS + ' .active').removeClass('active');
	$(elemento).addClass('active');
}


//########################################################
//INSERE CLIENTE COM NOVO CPF
//########################################################
function cnsCli_insere(){
	if (!TestaAcesso('BAS.CLIENTE',2)) {
		return;
	}

	let CPJ = "",
		pesquisa = $.trim($("#cnsCli_pesquisa").val());

	swal({
		title: "Digite o CPF/CNPJ do novo Cliente",
		type: "input",
		showCancelButton: true,
		confirmButtonText: "Ok",
		closeOnConfirm: false,
		closeOnCancel: true,
		showLoaderOnConfirm: true,
	}, function(inputValue){
		var aoFinal = function(){
			inputAlert.removeClass('w200').css('margin','20px 0 17px').off("keypress").off("blur");
			$(".sweet-alert .sa-input-error ").css('top','34px').css('right','26px');
		};

		if (inputValue === false){
			aoFinal();
			return;
		}

		if(empty(inputValue) && !validaCnpj(inputValue) && !valida_cpf(inputValue)){
			swal.showInputError("Insira um CPF/CNPJ Válido!");
			return false;
		}
        
		CPJ = inputValue;
	    var funcao = "funcao=insereCPF&newCPF="+CPJ;
		ajax(funcao, CNSCLI_EXEC, function(retorno){

			if(!empty(retorno.error)){
				swal({
						title: 'Erro ao inserir cliente',
						text: retorno.mensagem,
						type: 'error'
					},
					function(){
						selecionaLinha(CNSCLIC_DIV_TABELA, actpos, cell);
					}
				);
				return;
			}

			$('#cnsCli_pesquisa').val(CPJ);
			$("#cnsCli_ordem option[value=cnpj]").prop('selected',true);

			swal.close();
			cnsCli_montaQuery();
			aoFinal();
		});
	});
    
    var inputAlert = $(".sweet-alert fieldset input"),
		testaInputAlert = function(){
			if (empty(inputAlert.val())) {
				return;
			}

			if (validaCnpj(inputAlert.val())){
				inputAlert.mask("99.999.999/9999-99");
			}
			else if (valida_cpf(inputAlert.val())){
				inputAlert.mask("999.999.999-99");
			}
			inputAlert.unmask();
		};

	inputAlert.addClass('w200').css('margin','0 auto').blur( function(){ testaInputAlert(); }).keypress(function(evemt){ return somenteNumero(evemt,false,false,this); });
	$(".sweet-alert .sa-input-error").css('top','67px').css('right','60px');

	if(!empty(pesquisa)){
		if(/([Aa-zZ])+/.test(pesquisa)){
			return;
		}
		inputAlert.val(pesquisa).select();
		testaInputAlert();
	}
}


//########################################################
//ABRE OS LINKS DESEJADOS
//########################################################
function cnsCli_editar(acao){
	var funcao = "";
	var actpos = $("#cnsCli_position").val();
	if(actpos === 'null'){
        swal({
                title:'Atenção',
                text:'É necessário selecionar uma linha',
                type:'warning',
                timer:3000
            },
            function(){
                swal.close();
                setTimeout(function(){$('#cnsCli_pesquisa').focus();},30);
            }
        );
		return;
	}

	var cliente = objTabelaCli.registros[actpos].cl_number;
	switch(acao){

		case 'a':
			var cl_abrev = objTabelaCli.registros[actpos].cl_abrev;
			window.open(encodeURI("../utility/Agenda.Layout.php?nome="+cl_abrev+"&ord=0" ));
		return;

		case 'h':
			var obs = "";
			swal({
					title: "Digite uma Observação para o Relatório?",
					type: "input",
					showCancelButton: true,
					confirmButtonText: "Sim",
					closeOnConfirm: false,
					closeOnCancel: true,
					showLoaderOnConfirm: true,
				}, function(inputValue){
					if (inputValue !== false){
						obs = inputValue;
						window.open(encodeURI("../basico/Rel.Hist.Cliente.Layout.php?clnumber="+cliente+"&obs="+obs ));
					}
					swal.close();
				}
			);
		return;

		case 's': // SOMA DEBITOS
			swal.loading("Buscando Dados...");

			funcao = "funcao=somaDebitos&cl_number="+cliente;
			ajax(funcao, CNSCLI_EXEC, function(retorno){
				swal({
					title: 'Soma Debitos',
					text: retorno,
					type: "info",
					html: true
				});
			});
		return;

		case 'P': //RELATORIO DE PENDENCIAS DO CLIENTE
			window.open(encodeURI("../basico/Rel.Pendencia.Layout.php?numcli=" + cliente ));
		return;

		case 'D': //VERIFICA PEDIDO DE VENDA DIRETO
			swal.loading("Buscando Cliente...");

			funcao = "funcao=montapv&cl_number=" + cliente;
			ajax(funcao,CNSCLI_EXEC,function(retorno){
				//ERRO
				if(!empty(retorno.error)){
					swal('Erro ao buscar informações do cliente',retorno.mensagem, 'error');
					return;
				}

				//VERIFICA SE A TELA FOI ABERTA
				if(empty(window.open(encodeURI("../pvenda/PVDireto.Layout.php")))){
                    var link = "https://support.google.com/chrome/answer/95472?co=GENIE.Platform%3DDesktop&hl=pt-BR",
                        text = "Por favor libere o <a class='bold cl blue blue-dark_hover font-size16' target='_blank' href='"+link+"'>pop-up</a>";
					swal({
						title: "POP-UPS bloqueado",
						text: text,
						html: true,
						type: 'warning'
					});
					return;
				}

				swal.close();
				cnsCli_fecha(true);
			});
		return;
	}
}


//########################################################
//ABRINDO CONSULTAS DE EMAIL
//########################################################
function cnsCli_buscaEmail(){
	//DIV_TABELA
	var actpos = $("#cnsCli_position").val();
	if(empty(actpos)){
		swal('Erro','É necessário selecionar uma linha','error');
		return;
	}

	var numero = $(CNSCLIC_DIV_TABELA + " .active input[name=cl_number]").val(),
		abreviacao = $(CNSCLIC_DIV_TABELA + " .active input[name=cl_abrev]").val(),
		tipo = "CL",
        ao_final = function(){ cnsMail_abre('box-inc-mail', abreviacao, numero ,tipo, "", "divfundoEmail", null, null, true); };
    
    if(typeof cnsMail_abre == 'undefined'){
        loadDimmerConsulta("../basico/Email.Layout.Inc.php",null,ao_final);
        return;
    }
    ao_final();
}


//########################################################
//BUSCA OUTROS ENDEREÇOS DO CLIENTE
//########################################################
function cnsCli_outrosEnderecos(){
	//DIV_TABELA
	var actpos = $("#cnsCli_position").val();
	if(empty(actpos)){
		swal('Atenção','É necessário selecionar uma linha','warning');
		return;
	}

 	var cl_number = objTabelaCli.registros[actpos].cl_number;
 	var cl_abrev = objTabelaCli.registros[actpos].cl_abrev;

    var funcao = "funcao=outrosEnderecos"+
				 "&cl_number="+cl_number;

    ajax(funcao,CNSCLI_EXEC,function(retorno){
        
		if(!empty(retorno.error)){
			swal('Erro ao buscar endereços do CLIENTE',retorno.mensagem,'error');
			return;
		}



		cnsCli_objEndereco = retorno;
		if(cnsCli_objEndereco.total === 0){
            swal({
                    title:'Cliente não possui outros Endereços',
                    text: '',
                    type: 'warning'
                }
            );
            return;
        }


		var tabEnder = "<div id='divEndereco'>"+
                            "<table class='table bg-cinza cl-preto'>"+
                            "<tbody class='title'>"+
                                "<tr>"+
                                    "<td class = 'w30'>Nº</td>"+
                                    "<td class = 'w70'>Tipo</td>"+
                                    "<td class = 'w70'>CEP</td>"+
                                    "<td class = 'w210'>Endereço</td>"+
                                    "<td class = 'w50'>Número</td>"+
                                    "<td class = 'w130'>Bairro</td>"+
                                    "<td class = 'w20'>UF</td>"+
                                    "<td class = 'w120'>Cidade</td>"+
                                    "<td class = 'w50'>Pais</td>"+
                                    "<td class = 'w100'>Complemento</td>"+
                                    "<td class = 'w100'>Fone</td>"+
                                "</tr>"+
                            "</tbody>"+
                            "</table>"+
                            "<table class='table cl-preto'>"+
							"<tbody id='outros_enderecos' class='h160'>"+
							"</tbody>"+
    						"</table>"+
    						"<div class='footer'>"+
    							"<div class='pagination float-left' id='pagination_en'></div>"+
    							"<span class='registros'>"+
    								"<label>Posição:</label>"+
    								"<input id='position_en' value='null' class='bolder'/>"+
    							"</span>"+
    							"<span class='registros'>"+
    								"<label>Registros:</label>"+
    								"<input value= 'null' id='record_en'class='bolder'/>"+
    							"</span>"+
    						"</div>"+
    					"</div>";

		swal({
				title: ("Outros endereços do Cliente " + cl_abrev),
				text: tabEnder,
				html: true,
	            confirmButtonText: "Fechar",
	            closeOnConfirm: true,
			},
			function(confirmou){
				//VOLTA AO PADRÃO
				$('.sweet-alert').css('overflow', 'hidden');
				$('.sweet-alert').removeClass('w1000');
				$('.sweet-alert').css('margin-left', '-256px');

			}
		);

		//MUDANÇA DO SWEET ALERT PARA SE AJUSTAR AO NOVO LAYOUT
		$('.sweet-alert').css('overflow', 'visible');
		$('.sweet-alert').addClass('w1000');
		$('.sweet-alert').css('margin-left', '-500px');

		$('#position_en').val("null");

		//RESETA TOTAL
		$('#record_en').val(cnsCli_objEndereco.total);

	    //EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
		LimpaTabela("#outros_enderecos");
		var tabela = "";
		for(var i = 0; i < cnsCli_objEndereco.total; i++){
			tabela = "<tr posicao=" + i + ">";
			tabela += endereco_linha(i);
			tabela += "</tr>";
			$("#outros_enderecos").append(tabela);
		}


	    //SELECIONA A PRIMEIRA LINHA
        pintaLinha_endereco($("#outros_enderecos" + ' tr:eq(0)'));
        $("#outros_enderecos").animate({ scrollTop: "=0" }, "fast");


	    $("#outros_enderecos").mCustomScrollbar({
	        scrollInertia: 0.8,
	        autoHideScrollbar: true,
	        theme:"dark-3"
	    });


		//########################################################
		//PRECISA VALIDAR O PINTA LINHA SEMPRE QUE ABRE O SWEET ALERT
		$("#outros_enderecos").on("focus", 'tr',function(){
			pintaLinha_endereco($(this));
		});
    });

}


//########################################################
//CRIA A LINHA COM OS VALORES E RETORNA A TABELA FEITA
//########################################################
function endereco_linha(i){
    var aux = cnsCli_objEndereco.registros[i];

    var table = "<td class = 'w30 inativo number'><input name='en_number' value='"+aux.en_number+"' readonly/></td>"+
                "<td class = 'w70 inativo'><input name='en_tipo' value='"+aux.en_tipo+"' readonly/></td>"+
                "<td class = 'w70 inativo'><input name='en_cep' value='"+aux.en_cep+"' readonly/></td>"+
                "<td class = 'w210 inativo'><input name='en_ender' value='"+aux.en_ender+"' readonly/></td>"+
                "<td class = 'w50 inativo number'><input name='en_endnum' value='"+aux.en_endnum+"' readonly/></td>"+
                "<td class = 'w130 inativo'><input name='en_bairro' value='"+aux.en_bairro+"' readonly/></td>"+
                "<td class = 'w20 inativo'><input name='en_uf' value='"+aux.en_uf+"' readonly/></td>"+
                "<td class = 'w120 inativo'><input name='en_cidade' value='"+aux.en_cidade+"' readonly/></td>"+
                "<td class = 'w50 inativo'><input name='en_pais' value='"+aux.en_pais+"' readonly/></td>"+
                "<td class = 'w100 inativo'><input name='en_comple' value='"+aux.en_comple+"' readonly/></td>"+
                "<td class = 'w100 inativo'><input name='en_fone' value='"+aux.en_fone+"' readonly/></td>";

    return table;
} // fim ex_linha


//########################################################
//PINTA AS LINHAS DA TABELA DE ESCOLHA DE EXAMES NO SWAL
//########################################################
function pintaLinha_endereco(elemento){
    var actpos = $(elemento).attr('posicao');
	$('#position_en').val(actpos);
	$("#outros_enderecos" + ' .active').removeClass('active');
	$(elemento).addClass('active');
}//fim pintaLinha


//########################################################
//FECHA A CONSULTA DE MINUCIPIO
//########################################################
function cnsCli_fecha(preencheLinha){
    if(!empty($CNSCLIEdimmer)){
        //A CONSULTA NAO ESTA INCLUIDA EM UMA OUTRA TELA
        if(empty(objCliente.divDaConsulta)){
            //VOLTA O SCROLL PRA CIMA
            $(CNSCLI_DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
            $("#cnsCli_pesquisa").select();
            return;
        }

        // VOU FECHAR A CONSULTA SEM TER QUE PREENCHER AS LINHAS
        if(!preencheLinha){

            $CNSCLIEdimmer.dimmer("consulta hide");
            
            //RETORNA O FOCO
            if(!empty(objCliente.returnFocus)) objCliente.returnFocus.select();

            return;
        }
        var posicao = $('#cnsCli_position').val();
        var divDaConsulta = objCliente.divDaConsulta; //conteudo do objeto

        objCliente.numero = objTabelaCli.registros[posicao].cl_number;
        objCliente.abrev = objTabelaCli.registros[posicao].cl_abrev;
        objCliente.contato = objTabelaCli.registros[posicao].cl_contato;
        objCliente.telefone = objTabelaCli.registros[posicao].cl_fone;
        objCliente.fax = objTabelaCli.registros[posicao].cl_fax;
        objCliente.grupo = objTabelaCli.registros[posicao].cl_grupo;
        objCliente.gfin = objTabelaCli.registros[posicao].cl_grupofin;
        objCliente.ativo = objTabelaCli.registros[posicao].cl_ativo;
        objCliente.razao = objTabelaCli.registros[posicao].cl_razao;
        objCliente.pessoa = objTabelaCli.registros[posicao].cl_pessoa;
        objCliente.cnpj = objTabelaCli.registros[posicao].cl_cgc;
        objCliente.iest = objTabelaCli.registros[posicao].cl_iest;
        objCliente.endereco = objTabelaCli.registros[posicao].en_ender;
        objCliente.endernum = objTabelaCli.registros[posicao].en_endnum;
        objCliente.bairro = objTabelaCli.registros[posicao].en_bairro;
        objCliente.cidade = objTabelaCli.registros[posicao].en_cidade;
        objCliente.uf = objTabelaCli.registros[posicao].en_uf;
        objCliente.cep = objTabelaCli.registros[posicao].en_cep;
        objCliente.pais = objTabelaCli.registros[posicao].en_pais;
        objCliente.prazos = objTabelaCli.registros[posicao].cl_prazos;
        objCliente.email = objTabelaCli.registros[posicao].email;
        objCliente.margem = objTabelaCli.registros[posicao].cl_margem;
        objCliente.desconto = objTabelaCli.registros[posicao].cl_desconto;
        objCliente.limiteCredito = objTabelaCli.registros[posicao].cl_limite;
        objCliente.pagamento = objTabelaCli.registros[posicao].cl_pagamento;
        objCliente.representanteAbrev = objTabelaCli.registros[posicao].vd_nome;
        objCliente.representanteNum = objTabelaCli.registros[posicao].vd_number;
        objCliente.representanteComis = objTabelaCli.registros[posicao].vd_comiss;
        objCliente.representanteAtivo = objTabelaCli.registros[posicao].vd_ativo;
        objCliente.transportadoraAbrev = objTabelaCli.registros[posicao].tr_abrev;
        objCliente.transportadoraNum = objTabelaCli.registros[posicao].tr_number;
        objCliente.fator = objTabelaCli.registros[posicao].cl_fator;
        objCliente.obs1 = objTabelaCli.registros[posicao].obs1;
        objCliente.obs2 = objTabelaCli.registros[posicao].obs2;
        objCliente.complemento = objTabelaCli.registros[posicao].en_comple;
        objCliente.ipinoicms = objTabelaCli.registros[posicao].cl_ipinoicms;
        objCliente.frete = objTabelaCli.registros[posicao].cl_frete;
        objCliente.consumo = objTabelaCli.registros[posicao].cl_consumo;
        objCliente.atendenteComis = objTabelaCli.registros[posicao].at_comiss;
        objCliente.cl_natureza = objTabelaCli.registros[posicao].cl_natureza;
        objCliente.divDaConsulta = divDaConsulta; //recupera divDaConsulta
        
        if($('#'+objCliente.divDaConsulta).hasClass('active')){
            $CNSCLIEdimmer.dimmer("consulta hide");
        }
        cnsCli_retorno();
    }
}



//########################################################
//########################################################
			//FIM FUNÇÕES DA CONSULTA CLIENTE
//########################################################
//########################################################




















//########################################################
//########################################################
//TODAS AS FUNÇÕES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
//########################################################



$(document).ready(function(){
    
    //########################################################
	//QUANDO APERTADO F2, VOLTA O FOCUS PARA PESQUISA
	//########################################################
	shortcut.add("F2",function(){
        if(empty($CNSCLIEdimmer) || $CNSCLIEdimmer.dimmer("is active") ){
            $('#cnsCli_pesquisa').focus();
        }
	});
        
    //########################################################
    //REALIZA PESQUISA AO APERTAR ENTER
    //########################################################
    $('#cnsCli_pesquisa, #compra')
        .focus(function(){ $(this).select(); })
		.on("keyup keypress",function(e){
            var o_id = $(this).attr('id'),
                actpos = Number($("#cnsCli_position").val());
        
			if(e.type == "keyup" && o_id == "cnsCli_pesquisa"){
				switch (e.which) {
					case 40://PARA BAIXO
						if (actpos >= 0) { selecionaLinha(CNSCLIC_DIV_TABELA, actpos, 1); }
					break;

					case 27://ESC
						$(this).val("");
					break;
				}
			}
			if(e.type === 'keypress'){
				switch (e.which) {
					case 13://ENTER
						cnsCli_montaQuery();
					break;
                    default:
                        if($('#cnsCli_ordem').val() == 'num' || o_id == "compra"){
                            return somenteNumero(e,false,false,this);
                        }
                    break;
				}
			}
		});
    
    
    $("#ckFiltroCompra").on("click", function () { 
		$("#compra").val("").prop('disabled', !$(this)[0].checked ).select();
        if(!$(this).is(":checked")){$("#cnsCli_pesquisa").select();}
    });
    
    
    //########################################################
    //KEYUP DOS INPUTS DA TABELA
    //########################################################
    $(CNSCLIC_DIV_TABELA)
        .on("focus", 'input',function(){ cnsCli_pintaLinha($(this).parent().parent()); })
        .on("dblclick", 'input',function(){ cnsCli_fecha(true); })
        .on("keyup keypress", 'input',function(e){
            var actpos = Number($("#cnsCli_position").val()),
                actpos_para_cima = $(this).parent().parent().prev().attr("posicao"),
                actpos_para_baixo = $(this).parent().parent().next().attr("posicao"),

                paginaAtual = Number(getPagina('#cnsCli_record','#cnsCli_pagination', CNSCLIC_LIMITE_REGISTROS)),
                totalDePaginas = Math.ceil(objTabelaCli.total / CNSCLIC_LIMITE_REGISTROS),

                cell = $(this).parent().index();
            if(e.type == "keyup"){
                switch (e.which) {
                    case 38: //PARA CIMA
                        if (!empty(actpos_para_cima)) {
                            selecionaLinha(CNSCLIC_DIV_TABELA, actpos_para_cima, cell);
                        }
                        else if(paginaAtual > 1){
                            cnsCli_pagination(paginaAtual-1,function(){
                                cnsCli_pintaLinha($(CNSCLIC_DIV_TABELA + " tr:last-of-type"));
                                selecionaLinha(CNSCLIC_DIV_TABELA, $("#cnsCli_position").val(), cell);
                            });
                        }
                        else{
                            selecionaLinha(CNSCLIC_DIV_TABELA, actpos, cell);
                        }
                    break;

                    case 40://PARA BAIXO
                        if (!empty(actpos_para_baixo)) {
                            selecionaLinha(CNSCLIC_DIV_TABELA, actpos_para_baixo, cell);
                        }
                        else if(paginaAtual < totalDePaginas){
                            cnsCli_pagination(paginaAtual+1,function(){
                                cnsCli_pintaLinha($(CNSCLIC_DIV_TABELA + ' tr:eq(0)'));
                                $(CNSCLIC_DIV_TABELA).animate({ scrollTop: "=0" }, "fast");
                                selecionaLinha(CNSCLIC_DIV_TABELA, $("#cnsCli_position").val(), cell);
                            });
                        }
                    break;
                }
            }
            if(e.type === 'keypress'){
                switch (e.which) {
                    case 13://ENTER
                        cnsCli_fecha(true);
                    break;
                }
            }
        });

    
	$(CNSCLIC_DIV_TABELA_CLIOBS).on("focus", 'input',function(){
        cnsCli_pintaLinha_obsCliente($(this).parent().parent());
    });
});
