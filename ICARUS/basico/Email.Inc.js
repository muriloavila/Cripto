//########################################################
//########################################################
//CONSTANTES SEMPRE USADAS
//########################################################
//########################################################

$CNSEMAILdimmer = ativaDimmerConsulta('box-inc-mail', 
    function(){
        $('#'+objTMail.divDaConsulta).addClass('active');
        $('#searchMail').focus();
    }, 
    function(){
        objAnexos = [];
        $('#attachment-container').html('');
        $('#'+objTMail.divDaConsulta).removeClass('active');
    }
);
var passando = 0;

//########################################################
//OBJETO DA TABELA
//########################################################
var objTabelaMail = {};
var objTMail = {};
var parametrosAdicionais = {};
var corpoEmail = "";
var assinatura = "";
objTMail.divDaConsulta = '';
objTMail.divfundo = '';
objTMail.divfundo.selector = 'divfundo';
objTMail.abreviacao = '';
objTMail.numero = '';
objTMail.tipo = '';
represent = true;

var objDestinatarios = {};
var quill = {};
var email_relClieFornec; //LISTA DE EMAIL PARA RELATORIO DE CLIENTE/FORNECEDOR
var objAnexos = [];


//########################################################
//LIMITE DE REGISTROS
//########################################################
var LIMITE_REGISTROS_MAIL = 80;

//########################################################
//LOCAL DO EXEC
//########################################################
var EXEC_MAIL = '../basico/Email.Exec.Inc.php';
var EXEC_SEND = '../base/sweets/PHPemailSend/swiftmailer.send.php';

//########################################################
//TABELAS USADAS
//########################################################
var DIV_TABELA_EMAIL = "#dadosemail";




//########################################################
//########################################################
//FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################














//############################################################################################################################################
//############################################################################################################################################
                                                            //EMAIL NOVO
//############################################################################################################################################
//############################################################################################################################################


//########################################################
//ABRE A CONSULTA E REALIZA A PESQUISA COM O PARAMETRO PASSADO PRA FUNCAO
//########################################################
function cnsMail_abre(divDaConsulta, abreviacao, numero, tipo, parametrosAdicionais, abreDivfundo, campoEmail, listaEmail){
	//########################################################
    //DEFINE VARIAVEIS UTILIZADAS POR TODO O PROGRAMA
    objTMail.divDaConsulta = divDaConsulta;
	objTMail.abreviacao = abreviacao;
	objTMail.numero = numero;
	objTMail.tipo = tipo;
	objTMail.parametrosAdicionais = parametrosAdicionais;
    objTMail.listaEmail = listaEmail;
    objTMail.abreDivfundo = empty(abreDivfundo) ? undefined : true;
    //########################################################
    
    //########################################################
    //MOSTRA A DIV DA INCLUDE
	$CNSEMAILdimmer.dimmer("consulta show");
   

    if(!empty(objTMail.abreviacao)){ $("#searchMail").val(objTMail.abreviacao).attr('disabled', 'disabled').addClass('inativo'); }
    //########################################################

    //########################################################
    //ATRIBUI O ASSUNTO
    if(!empty(parametrosAdicionais) && !empty(parametrosAdicionais.assunto)){
        $("#txtassunto").val(parametrosAdicionais.assunto); 
    }
    //########################################################

    //########################################################
    
    if(empty(listaEmail)){
       mail_montaQuery();
    }else{
        objTabelaMail.mail = listaEmail.email.mail;
        objTabelaMail.corpo_email = {};
        
        objTabelaMail.corpo_email.em_razao = listaEmail.corpo_email.em_razao;
        objTabelaMail.corpo_email.usuario = listaEmail.corpo_email.usuario;
        
        $("#divEmail .ui.checkbox").addClass('disabled');
        mail_montaRel();
        mail_corpo();
    }  
}

//########################################################
//FECHA O INCLUDE
//########################################################
function cnsMail_fecha(preencheLinha){
    $CNSEMAILdimmer.dimmer("consulta hide");
	return;
}

//########################################################
//MONTA OS CHECKBOX CASO SEJA ABERTA A TELA DE RELATORIO DE CLIENTES E FORNECEDOR
//########################################################
function mail_montaRel(){
    $("#tabela-email-primaria").hide();
    $("#seletor-email-secundario").show();
    //MONTA FAMILIA
    $('#list-emails').append("<li class='pointer'>");
    for(var i = 0; i < objTMail.listaEmail.total; i++){
        var abrev = objTMail.listaEmail.email[i].abrev;
        var numero = objTMail.listaEmail.email[i].numero;
        var email = objTMail.listaEmail.email[i].email;
        
        var aux = "<li class='w400'  position_rel='" + i + "'>"+
                        "<div class='ui checkbox'>" +
                            "<input type='checkbox' id='" + i + "' value='"+numero+"' email='"+email+"' checked/>" +
                            "<label for='" + i + "' class='cor_padrao_after' >" + abrev + "</label>"+
                        "</div>"+
                        "<span class='float-right'>"+
                           "<label class='ui label'>"+email +"</label>"+
                        "</span>"+
                    "</li>";
        $('#list-emails').append(aux);
    }

    $("#record_mail").val(objTMail.listaEmail.total);
    $("#posicao_mail, #position_mail").hide();

    $('#list-emails').mCustomScrollbar({
        scrollInertia: 0.8,
        autoHideScrollbar: true,
        theme:"dark-3"
    });
}

//########################################################
//BUSCA OS EMAIL DO CLIENTE CASO SEJA PASSADO UM NUMERO DE CLIENTE/FORNECEDOR
//########################################################
function mail_montaQuery() {
	if($("#searchMail").is( ":focus" )){
		$('#searchMail').blur(); //para tirar o foco da pesquisa
	}
	$("#posicao_mail, #position_mail").show();

	LimpaTabela(DIV_TABELA_EMAIL);
	$("#destinatario").val('');
	$(DIV_TABELA_EMAIL).html("<img src='../component/loading.gif' />");

	//MONTA FUNCAO
	var funcao = "funcao=monta&numero="+objTMail.numero+"&tipo="+objTMail.tipo;

	ajax(funcao, EXEC_MAIL, function(retorno){
		//ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de clientes',retorno.mensagem,'error');
			return;
		}

		$('#record_mail').val(retorno.total);
		objTabelaMail = retorno;

		if(empty(objTabelaMail.vd_email)){
			$("#divEmail .ui.checkbox")
						.checkbox('uncheck')
						.addClass('disabled');
		}else{
			$("#divEmail .ui.checkbox")
						.removeClass('disabled');
		}

		//FUNCAO QUE TRAZ OS REGISTROS DA PAGINA ATUAL
		mail_pagination(1);
		mail_corpo();
        
        if(!empty(objTMail.parametrosAdicionais) && !empty(objTMail.parametrosAdicionais.arquivos)){
            $.each(objTMail.parametrosAdicionais.arquivos, function (key, file){
                mail_createAnexo(file[0]);
            });
        }
	});
}

//########################################################
//PAGINATION DO EMAIL PARA CONTROLAR O SCROLL E PREENCHER A TABELA
//########################################################
function mail_pagination(pagina, fCustom) {
	var totalDePaginas = objTabelaMail.total,
	fim = objTabelaMail.total,
	inicio = pagina - 1;

	//RESETA A POSICAO
	$('#position_mail').val("null");

	//RESETA TOTAL
	$('#record_mail').val(objTabelaMail.total);

	//EVITA QUE SCROLL SE PERCA SEMPRE QUE A TABELA É LIMPA
	LimpaTabela(DIV_TABELA_EMAIL);

	if(objTabelaMail.total > 0){
		for(var i = inicio; i < fim; i++){
			var mail_tabela = "<tr posicao="+ i + ">" + mail_montaLinha(i) + "</tr>";
			$(DIV_TABELA_EMAIL).append(mail_tabela);
		}
	}

	//SELECIONA A PRIMEIRA LINHA
	$('#searchMail').focus();
	if(objTabelaMail.total > 0 && empty(fCustom)){
		mail_pintaLinha($(DIV_TABELA_EMAIL + ' tr:eq(0)'));
		selecionaLinha(DIV_TABELA_EMAIL, 0, 2);
		$(DIV_TABELA_EMAIL).animate({ scrollTop: "=0" }, "fast"); //VOLTA O SCROLL PRA CIMA
	}

	if(!empty(fCustom)){
		fCustom();
	}

	$(DIV_TABELA_EMAIL).mCustomScrollbar({
		scrollInertia: 0.8,
		autoHideScrollbar: true,
		theme:"dark-3"
	});
}

//########################################################
//MONTA A LINHA DE CADA EMAIL
//########################################################
function mail_montaLinha(i) {
	var aux = objTabelaMail.registros[i];

	var table = ""+
							"<td class='w20 inativo center'><input value='' readonly  tabindex='-1'/></td>"+
							"<td class='w50 number'><input value='"+aux.el_seq+"' name='el_seq' /></td>"+
							"<td class='w90'><input value='"+aux.el_depto+"' name='el_depto' class='uppercase' /></td>"+
							"<td class='w100'><input value='"+aux.el_contato+"' name='el_contato' class='uppercase'  /></td>"+
							"<td class='w240'><input value='"+aux.el_email+"' name='el_email'  /></td>"+
							"<td class='w200 last'><input value='"+aux.el_fone+"' name='el_fone' class='uppercase' /></td>";

	return table;
}


//########################################################
//PINTA A LINHA EMAIL
//########################################################
function mail_pintaLinha(elemento) {
	var actpos = $(elemento).attr('posicao');
	$('#position_mail').val(actpos);
	$(DIV_TABELA_EMAIL + ' .active').removeClass('active');
	$(elemento).addClass('active');
}

//########################################################
//RETORNA OS VALORES ORIGINAIS PARA OS CAMPOS DA TABELA DE EMAIL
//########################################################
function mail_cancela(cell, extra) {
	var actpos = $("#position_mail").val();
	if(empty(actpos)){
		return;
	}

	if(empty(cell)){
		cell = 4;
	}

	var selecionado = mail_emSelecionados(actpos);

	var ao_final = function(){
		if(selecionado[0]){mail_selecaoLinhas();}
		selecionaLinha(DIV_TABELA_EMAIL,actpos,cell);
	};

	if(getStatus(actpos,DIV_TABELA_EMAIL) === 'a'){
		var tr = mail_montaLinha(actpos);

		$(DIV_TABELA_EMAIL + " tr[posicao="+actpos+"]").html(tr);
		Desbloqueia_Linhas(actpos,DIV_TABELA_EMAIL);

		ao_final();
	}else if(getStatus(actpos, DIV_TABELA_EMAIL) === '+'){
		objTabelaMail.registros.splice(actpos, 1);
		objTabelaMail.total -= 1;

		Desbloqueia_Linhas(actpos,DIV_TABELA_EMAIL);

		mail_pagination(1, function(){
			$("#record_mail").val(objTabelaMail.total);
			if(objTabelaMail.total > 0){
				if(actpos > 0){
					--actpos;
				}
				ao_final();
			}
		});
	}
	else{
		ao_final();
	}
}


//########################################################
//INSERE UMA NOVA LINHA COM NOVOS CAMPOS PARA O CADASTRO DE UM NOVO EMAIL PARA O CLIENTE
//########################################################
function mail_insere() {
	//SE EU ALTEREI ALGUM REGISTRO
	if(!Verifica_Alteracao(DIV_TABELA_EMAIL)){
		selecionaLinha(DIV_TABELA_EMAIL,$('#position_mail').val(),1);
		return;
	}

	if(empty(objTabelaMail)){
		objTabelaMail = {};
		objTabelaMail.registros = [];
		objTabelaMail.total = 0;
	}

	var novaPosicao = {};
	novaPosicao.el_seq = objTabelaMail.total > 0 ? (Number(objTabelaMail.registros[objTabelaMail.total - 1].el_seq)  + 1) : 1;
	novaPosicao.el_depto = "";
	novaPosicao.el_contato = "";
	novaPosicao.el_email = "";
	novaPosicao.el_fone = "";

	objTabelaMail.registros.push(novaPosicao);
	objTabelaMail.total += 1;

	var actpos = objTabelaMail.total > 0 ? (objTabelaMail.total - 1) : 0;

	mail_pagination(1, function(){
		mail_pintaLinha($(DIV_TABELA_EMAIL + " tr[posicao="+actpos+"]"));
		setStatus(actpos, '+', DIV_TABELA_EMAIL);
		Bloqueia_Linhas(actpos, DIV_TABELA_EMAIL);
		$("#record_mail").val(objTabelaMail.total);
		selecionaLinha(DIV_TABELA_EMAIL, actpos, 2);
	});
}

//########################################################
//BLOQUEIA AS LINHAS E ADICIONA O 'a' NO CMAPO A CADA MUDANÇA NOS TR OU NOS CAMPOS
//########################################################
function mail_edicao(elemento) {
	var actpos = $(elemento).closest("*[posicao]").attr('posicao');
	var campo = $(elemento).attr('name');
	var original = objTabelaMail.registros[actpos][campo];

	//NÃO HOUVE ALTERAÇÃO
	if($(elemento).val() == original || getStatus(actpos, DIV_TABELA_EMAIL) !== ''){
		return;
	}

	setStatus(actpos, 'a', DIV_TABELA_EMAIL);

	Bloqueia_Linhas(actpos, DIV_TABELA_EMAIL);
}


//########################################################
//GRAVA DADOS DE EMAIL
//########################################################
function mail_grava(cell, extra, fCustom) {
	var actpos = $("#position_mail").val();
	if(actpos === 'null'){
		swal('Erro ao gravar','É necessário selecionar uma linha','error');
		return;
	}

	if(empty($(DIV_TABELA_EMAIL + " input[name=el_email]").val())){
		swal({
			title: "Erro!",
			text: "Não foi informado o campo de Email",
			type: "error"
		}, function(){
			selecionaLinha(DIV_TABELA_EMAIL, actpos, 4);
		});

		return;
	}

	var regexMail = new RegExp(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);

	if(!regexMail.test($(DIV_TABELA_EMAIL + " input[name=el_email]").val())){
		swal({
			title: "Erro!",
			text: "Informe um Email Válido",
			type: "error"
		}, function(){
			selecionaLinha(DIV_TABELA_EMAIL, actpos, 4);
		});

		return;
	}

	var status = getStatus(actpos, DIV_TABELA_EMAIL);
	if(empty(cell)){
		cell = 4;
	}

	if(status === ''){
		selecionaLinha(DIV_TABELA_EMAIL, actpos, cell);
		return;
	}

	var linha = DIV_TABELA_EMAIL + " tr[posicao="+actpos+"] input";
	var number = objTMail.numero;

	var funcao = "funcao=grava_email&comando="+(status=='+' ? 'insert' : 'update')+
								"&number="+number+
								"&tipo="+objTMail.tipo+
								"&el_seq="+$(linha+"[name=el_seq]").val()+
								"&el_seq_old="+objTabelaMail.registros[actpos].el_seq+
								"&el_depto="+$(linha+"[name=el_depto]").val()+
								"&el_contato="+$(linha+"[name=el_contato]").val()+
								"&el_email="+$(linha+"[name=el_email]").val()+
								"&el_fone="+$(linha+"[name=el_fone]").val();

	swal.loading();
	ajax(funcao, EXEC_MAIL, function(retorno){
		if(!empty(retorno.error)){
			swal({
				title: "Erro Ao Gravar Email",
				text: retorno.mensagem,
				type: 'error'
			}, function(){
					selecionaLinha(DIV_TABELA_EMAIL, actpos, cell);
				}
			);
			return;
		}

		objTabelaMail.registros[actpos].el_seq = $(linha+"[name=el_seq]").val();
		objTabelaMail.registros[actpos].el_depto = $(linha+"[name=el_depto]").val();
		objTabelaMail.registros[actpos].el_contato = $(linha+"[name=el_contato]").val();
		objTabelaMail.registros[actpos].el_email = $(linha+"[name=el_email]").val();
		objTabelaMail.registros[actpos].el_fone = $(linha+"[name=el_fone]").val();

		if(status === '+'){
			setStatus(actpos, 'a', DIV_TABELA_EMAIL);
		}

		$("#record_mail").html(objTabelaMail.total);
		mail_cancela(cell);

		swal.close();

		if(!empty(fCustom)){
			fCustom();
		}
	});
}

//########################################################
//EXCLUI A LINHA SELECIONADA
//########################################################
function mail_exclui() {
	var actpos = $("#position_mail").val();
	if(actpos == 'null'){
		swal("Erro de Exclusão", 'É necessário selecionar uma linha', 'error');
		return;
	}

	if(getStatus(actpos, DIV_TABELA_EMAIL) !== ''){
		mail_cancela(2);
		return;
	}

	var number = objTMail.numero;
	var el_seq = objTabelaMail.registros[actpos].el_seq;
	var tipo = objTMail.tipo;

	swal({
		title: "Deseja Excluir a linha da Tabela de Email?",
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

		var funcao = "funcao=deleta_mail&number="+number+"&el_seq="+el_seq+"&tipo="+tipo;
		ajax(funcao, EXEC_MAIL, function(retorno){
			if(!empty(retorno.error)){
				swal({
					title: "Erro ao Excluir",
					text: retorno.mensagem,
					type: 'error'
				}, function(){
					selecionaLinha(DIV_TABELA_EMAIL, actpos, 2);
				});
			}

			objTabelaMail.registros.splice(actpos, 1);
			objTabelaMail.total -= 1;
			swal.close();

			mail_pagination(1, function(){
				$("#record_mail").html(objTabelaMail.total);
				if(objTabelaMail.total > 0){
					if(actpos > 0){
						--actpos;
					}
				}

				selecionaLinha(DIV_TABELA_EMAIL, actpos, 2);
			});
		});
	});
}

//########################################################
//MONTA CORPO DO EMAIL PADRÃO COM DADOS DA TABAUX EMAILTXT
//MONTA A ASSINATURA DO EMAIL COM A RAZÃO SOCIAL E O NOME DO USUARIO
//########################################################
function mail_corpo(forca) {
    var corpo = quill.getText();
	if(quill.getText() == '\n' || forca || !empty(objTMail.abreDivfundo)){ //VERIFICA SE JÁ EXISTE UM TEXTO NO TEXT FIELD
		quill.deleteText(0, quill.getLength()); // DELETA TODO O CONTEUDO QUE ESTIVER NO TEXT FIELD
        
        if(!empty(objTMail.parametrosAdicionais) && !empty(objTMail.parametrosAdicionais.corpoEmail)){
            var corpo = objTMail.parametrosAdicionais.corpoEmail;
            quill.clipboard.dangerouslyPasteHTML(0, corpo);
            quill.insertText(quill.getLength(), '\n');
            
        } else if(!empty(objTabelaMail.corpo_email.total)){
            for (var i = 0; i < objTabelaMail.corpo_email.total; i++) { // PERCORRE O OBJETO COM OS TEXTOS CADASTRADOS NA TABELA AUXILIAR
                if(objTabelaMail.corpo_email[i].af_string == 'S'){
                    quill.clipboard.dangerouslyPasteHTML(quill.getLength()-1, objTabelaMail.corpo_email[i].af_descr+'\n', '', true); // COLOCA ELES NO TEXT FIELD
                    quill.insertText(quill.getLength(), '\n');
                }
            }           
       }
    
        quill.insertText(quill.getLength(), '\n');
        
		quill.insertText(quill.getLength(), objTabelaMail.corpo_email.em_razao+'\n', {
				'italic' : true
		});

		quill.insertText(quill.getLength(), objTabelaMail.corpo_email.usuario+'\n', {
			'bold': true
		});
	}
}


//########################################################
//PINTA A LINHA SELECIONADA A CADA DOUBLECLICK E
//INSERE O EMAIL DA LINHA NO CAMPO DE DESTINATARIOS
//########################################################
function mail_selecaoLinhas(o_que){
	var actpos = Number($("#position_mail").val()),
			elemento = DIV_TABELA_EMAIL + " tr[posicao="+actpos+"] input",
			email = objTabelaMail.registros[actpos].el_email+';',
			classes = "bg cinza selecionado",
            status = getStatus(actpos,DIV_TABELA_EMAIL);
    
    if(status !== ''){
       return;
    }

	switch (o_que) {
		case "LT":
				$(DIV_TABELA_EMAIL + " input.selecionado").removeClass(classes).css("font-style", "").attr('readonly', false);
		break;
		default:
				if($(elemento).hasClass("selecionado")){//DESSELECIONANDO
					$(elemento).removeClass(classes).css("font-style","").attr('readonly', false);
					$("#destinatario").val($("#destinatario").val().replace(email, ''));
				}	else { //SELECIONANDO
					$(elemento).addClass(classes).css("font-style","italic").attr('readonly', true);
					$("#destinatario").val($("#destinatario").val() + email);
				}

		break;
	}
}


//########################################################
//VERIFICA AS LINHAS SELECIONADAS
//########################################################
function mail_emSelecionados(actpos){
	var tr_especifico = empty(actpos) ? "" : " tr[posicao="+actpos+"]",
			selecionado = $(DIV_TABELA_EMAIL + tr_especifico + " input.selecionado").parent().parent(),
			el_seq = "", selecionadoActive = false;

	if(selecionado.length > 0){
		selecionado.each(function(index, tr){
			if($(tr).hasClass("active")) {selecionadoActive = true}
			el_seq += $(tr).find(" input[name=el_seq]").val()+",";
		});

		el_seq = el_seq.substring(0,(el_seq.length-1));
	}

	return [selecionadoActive,el_seq];
}


//########################################################
//ENVIA EMAIL PELO ENVIO DIRETO
//########################################################
function mail_enviaDireto(){
	var destinatarios = $("#destinatario").val();
    
	if(empty(destinatarios) && empty(objTMail.listaEmail)){
		swal("Erro!", "Selecione ao mínimo um destinatário", 'error');
		return;
	}
    
    if(!empty(objTMail.listaEmail)){
        var emailsMarcados = mail_emailsMarcadas();
        if(empty(emailsMarcados)){
          swal('Atenção!', 'Selecione ao menos um Email', 'warning');
          return;
        }
    }

	var corpo = $("#editor-container .ql-editor").html();
	var assunto = $("#txtassunto").val().toUpperCase();
    
    if(empty(assunto)){
		swal("Erro!", "Necessário um assunto para o email", 'error');
		return;
	}
    
	var mail = objTabelaMail.mail;

	if(empty(mail)){
		swal('Atenção!', 'Usuario não possuí Email Cadastrado', 'warning');
		return;
	}

	corpo = corpo.split("");
	for (var i = 0; i < corpo.length; i++){
		corpo[i] = corpo[i].charCodeAt(0);
	}
	corpo = JSON.stringify(corpo);
	corpo = window.btoa(corpo);
    
    var listaAnexos = objAnexos.join(';');

	//TODO BUSCA ANEXOS TBM

	swal({
		title: "Deseja Enviar uma Cópia para: "+mail+"?",
		type: "warning",
		showCancelButton: true,
		confirmButtonText: "Sim",
		cancelButtonText: "Não",
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
		showLoaderOnCancel: true,
		closeOnCancel: false,
	}, function(confirmaEnviaCopia){
		if(!confirmaEnviaCopia){
			mail = "";
		}
        
        
		destinatarios += mail;
        
        if(!empty(objTMail.listaEmail)){            
            destinatarios += emailsMarcados;
        }
        
        if(destinatarios.substr(destinatarios.length - 1) != ';'){
           destinatarios += ';';
        }
    

		var funcao = "funcao=enviaEmail&corpo="+corpo+
									"&assunto="+assunto+
									"&destinatarios="+destinatarios+
                                    "&listaAnexos="+listaAnexos;


		ajax(funcao, EXEC_SEND, function(retorno){
			if(retorno.error){
				swal('Erro ao enviar E-mails',retorno.message,'error');
				return;
			}

			swal({
					title: "E-mail enviado com Sucesso",
					type: "success",
					timer: 1500,
					closeOnConfirm: true
			}, function(){
				swal.close();
				$("#divEmail .ui.checkbox").checkbox('uncheck');
				cnsMail_fecha(false);
			});
		});

	});
}


//########################################################
//ENVIA O ARQUIVO PARA O PHP SALVAR NA PASTA UPLOADS
//########################################################
function mail_enviaDados(event){
	files = event.target.files;
	var data = new FormData();

	for(var i = 0; i < files.length; i++){
		var file = files[i];
		data.append('file', file, file.name);
	}

	var xhr = new XMLHttpRequest();
 	xhr.open('POST', EXEC_MAIL+'?funcao=anexo', true);
 	xhr.send(data);
 	xhr.onload = function () {
		$("#attachment-container").html();
		if (xhr.status === 200) {
			var retorno = JSON.parse(this.responseText);
            if(empty(retorno)){
                swal('Erro', "Ocorreu um erro ao realizar o Upload. Tente Novamente", 'error');
                return;
            }

            if(!empty(retorno.error)){
                swal('Erro ao realizar o Upload', retorno.mensagem, 'error');
                return;
            }

            mail_createAnexo(retorno.filename);
		} else {
			$("#attachment-container").html("<p> Error in upload, try again.</p>");
		}
	};
}


//########################################################
//ADICIONA O ARQUIVO NO OBJANEXOS E CRIA A DIV BONITINHA DELE
//########################################################
function mail_createAnexo(filename) {
    if(objAnexos.indexOf(filename) == -1){
        objAnexos.push(filename);

        var linha = "<a class='ui label' name='"+filename+"'> "+
                        filename+
                        "<i class='icon close' onclick=mail_removeAnexo('"+filename+"')></i>"+
                    " </a>";
        $("#attachment-container").append(linha);
        $('#upl').val("");
    }
}


//########################################################
//REMOVE O ANEXO DA DIV E DO OBJANEXOS PARA NAO ENVIAR
//########################################################
function mail_removeAnexo(filename) {
    $("#attachment-container a[name='"+filename+"']").transition({
        animation: 'fade',
        onComplete: function(){
            var index = objAnexos.indexOf(filename);
            if(index > -1){
                objAnexos.splice(index, 1);
                $("#attachment-container a[name='"+filename+"']").remove();
            }
        }
    });
}


//########################################################
////BOTÃO DE MARCAR INPUTS DOS FIELDSETS
//########################################################
function mail_checkInput(ref){
	switch(ref){
		case 'emails':
			ckbox = $('#list-emails input');
			fieldSet = $('#toggleEmails');
		break;
	}
	for(var i = 0; i < ckbox.length; i++){
		ckbox[i].checked = !ckbox[i].checked;
	}
}


//########################################################
//DEFINE EMAILS A SEREM ENVIADOS
//########################################################
function mail_emailsMarcadas(){
    var emails = $('#list-emails input');

    var retorno = '';
    var count = 0;
    for(var i = 0; i < emails.length; i++){
        if(emails[i].checked){
            if(!empty($(emails[i]).attr('email'))){
                retorno += ';' + $(emails[i]).attr('email');
            }
        }else{
            count++;
        }
    }

    retorno = retorno.substring(1);//tira a primeira virgula
    return retorno;
}


//########################################################
//FAZ O ENVIO DE EMAIL POR OUTRAS APLICAÇÕES
//app == 'O' ENVIA VIA OUTLOOK
//app == 'G' ENVIA VIA GMAIL
//########################################################
function mail_application(app){
    if(empty(app)){
        return;
    }
    
    var destinatarios = $("#destinatario").val();
	if(empty(destinatarios) && empty(objTMail.listaEmail)){
		swal("Erro!", "Selecione ao mínimo um destinatário", 'error');
		return;
	}
    
    if(!empty(objTMail.listaEmail)){
        var destinatarios = mail_emailsMarcadas()+';';
        if(empty(destinatarios)){
          swal('Atenção!', 'Selecione ao menos um Email', 'warning');
          return;
        }
    }
    
    var assunto = $("#txtassunto").val().toUpperCase();
    if(empty(assunto)){
		swal("Erro!", "Necessário um assunto para o email", 'error');
		return;
	}

	swal({
		title: "Ao Enviar um email pelo Outlook ou GMAIL os Anexos serão perdidos, deseja continuar?",
		type: "warning",
		showCancelButton: true,
		confirmButtonText: "Sim",
		cancelButtonText: "Não",
		closeOnConfirm: false,
		closeOnCancel: true,
	}, function(confirmouEnviaApp){
		if(!confirmouEnviaApp){
			return;
		}

	    var corpo = $("#editor-container .ql-editor").html();
	    
	    corpo = corpo.replace(/((<br>)|(<\/p>))/g, "%0D%0A"); //TROCA OS <br> E <\p> POR %0D%0A (QUEBRA DE LINHA)
	    corpo = corpo.replace(/(<([^>]+)>)/ig, ""); //RETIRA TODAS AS TAGS HTML
	    
	    var mail = objTabelaMail.mail;
	    
	    
	    swal({
	        title: "Deseja Enviar uma Cópia para: "+mail+"?",
			type: "warning",
			showCancelButton: true,
			confirmButtonText: "Sim",
			cancelButtonText: "Não",
			closeOnConfirm: true,
			closeOnCancel: true,
	    }, function(confirmaEnviaCopia){
	        if(!confirmaEnviaCopia){
				mail = "";
			}
			destinatarios += mail+';';
	        switch(app){
	            case 'O':
	                document.location = "mailto:" +  destinatarios + '?subject=' + assunto + '&body=' + corpo;
	            return;
	            
	            case 'G':            
	                corpo = encodeURI(corpo);
	                corpo = corpo.replace(/%250D%250A/g, "%0D%0A");
	                
	                var mailto = "https://mail.google.com/mail/u/o/?view=cm&fs=1&tf=l&source=mailto&to="+ destinatarios +"&su="+ assunto +"&body="+corpo;
	                window.open(mailto, '_blank');
	            return;
	        }
	    });
		
	});   
}


//########################################################
//SELECIONA OS ANEXOS E REALIZA O DOWNLOAD DELES
//CASO TENHA 1 ARQUIVO SOMENTE ELE REALIZA O DOWNLOAD INDIVIDUAL
//CASO SEJA MAIS DE 1 ANEXO SERÁ ZIPADO OS ARQUIVOS E O DOWNLOAD ACONTECERÁ
//########################################################
function mail_downloadAnexos(){
    if(empty(objAnexos)){
       swal('Erro', 'Nenhum Anexo para Download', 'error');
        return;
    }
    
    var listaAnexos = objAnexos.join(';');
    
    var funcao = "funcao=anexos_download&lista="+listaAnexos;
    
    if(objAnexos.length > 1){
        funcao += "&zip=true";
    }
       
    ajax(funcao, EXEC_MAIL, function(retorno){
        //ERRO
		if(!empty(retorno.error)){
			swal('Erro ao buscar tabela de clientes',retorno.mensagem,'error');
			return;
		}
        
        var anchor = document.createElement('a');
        anchor.href = retorno.link;
        anchor.target = '_blank';
        anchor.download = retorno.filename;
        anchor.click();
    });
    return;
}


//########################################################
//TODAS AS FUNCOES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function(){
	//INCLUÍ O QUILL TEXT EDITOR
	if(empty($("#editor-container").html())){
		var toolbarOptions = [
			['attachment', 'bold', 'italic', 'underline', 'strike'], // toggled buttons
			['blockquote'],

			[{
				'list': 'ordered'
			}, {
				'list': 'bullet'
			}],
			[{
				'indent': '+1'
			}, {
				'indent': '-1'
			}], // outdent/indent
			[{
				'direction': 'rtl'
			}], // text direction

			[{
				'size': ['small', false, 'large', 'huge']
			}], // custom dropdown

			[{
				'color': []
			}], // dropdown with defaults from theme
			[{
				'align': []
			}],

			['clean', 'reload', 'download']
		];



		quill = new Quill('#editor-container', {
			modules: {
				toolbar: {
					container: toolbarOptions,
					handlers: {
						attachment: function(value) {
							$("#upl").click();
						},
                        reload: function(value){
                            mail_corpo(true);
                        },
                        download: function(value){
                            mail_downloadAnexos();
                        }
					}
				}
			},
			theme: 'snow'
		});

		$(".ql-download").attr('title', 'Download dos Arquivos em Anexo');
		$(".ql-reload").attr('title', 'Recarrega o Corpo do Email padrão da Tabela Auxiliar EMAILTXT');
		$(".ql-attachment").attr('title', 'Selecionar um arquivo para Anexo');
	}
	//INCLUÍ O QUILL TEXT EDITOR

	$('input[type=file]').unbind('change').on('change', mail_enviaDados);

	//########################################################
	//SELECIONA O TEXTO INTEIRO NO CLICK TABELA PRINCIPAL
	//########################################################
	$(DIV_TABELA_EMAIL).on("focus", 'input',function(){
		$(this).select();
	});

	$(DIV_TABELA_EMAIL).on('change', 'input', function(){
		mail_edicao($(this));
	});


	$(DIV_TABELA_EMAIL).on('focus', 'tr', function(){
		mail_pintaLinha($(this));
	});

	$(DIV_TABELA_EMAIL).unbind('dblclick').on('dblclick', 'input', function(){
		mail_selecaoLinhas();
	});

	//###########################################################################
	//VERIFICAÇÕES DO CHECKBOX DE REPRESENTANTE
	//###########################################################################

	//###########################################################################
	//INCLUÍ NO CAMPO DE DESTINATARIOS O EMAIL DO REPRESENTANTE CASO O CHECKBOX SEJA CHECADO
	//RETIRA DO CAMPO DE DESTINATARIOS CASO O CHECKBOX SEJA DESMARCADO
	$("#divEmail .ui.checkbox").checkbox({
		onChange: function() {
			$checkbox = $(this).parent();
			vd_email = objTabelaMail.vd_email + ";";

			if($checkbox.checkbox('is checked')){
				$("#destinatario").val($("#destinatario").val() + vd_email);
			}else{
				$("#destinatario").val($("#destinatario").val().replace(vd_email, ''));
			}
		}
	});
	//###########################################################################


	//###########################################################################
	//VERIFICA SE O CHECKBOX FOI CLICADO E SE ELE ESTA DESABILITADO,
	//CASO ESTEJA ELE EXIBE UMA MENSAGEM DE ERRO PARA O USUARIO
	$("#divEmail .ui.checkbox").on('click', function(){
		if($(this).hasClass('disabled') && (objTMail.tipo == 'CL' || objTMail.tipo == 'PV')){
			$(".msg").show();

			setTimeout(function () {
				$(".msg").hide();
			}, 4000);
		}
	});
    
    
	//###########################################################################

	$(DIV_TABELA_EMAIL).unbind('keyup').on('keypress keyup change', 'input', function(e){

		var actpos = Number($("#position_mail").val()),
				cell =$(this).parent().index(),
				ao_terminar = "";

		if(e.type == "keyup"){
			switch (e.which) {
				case 38://PARA CIMA
					mail_edicao($(this));

					ao_terminar = function() {
						if(actpos > 0){
							selecionaLinha(DIV_TABELA_EMAIL, --actpos, cell);
						}
						selecionaLinha(DIV_TABELA_EMAIL, actpos, cell);
					};

					if(!Verifica_Alteracao(DIV_TABELA_EMAIL)){
						mail_grava(cell, function(){ao_terminar();});
						return;
					}

					ao_terminar();
				break;

				case 40://PARA BAIXO
					mail_edicao($(this));

					ao_terminar = function(){
						if(actpos + 1 < $("#record_mail").val()){
							selecionaLinha(DIV_TABELA_EMAIL, ++actpos, cell);
						}else{
							mail_insere();
						}
					};

					if(!Verifica_Alteracao(DIV_TABELA_EMAIL)){
						mail_grava(cell, function(){ ao_terminar(); });
						return;
					}

					ao_terminar();
				break;

				case 27:
					mail_edicao($(this));
					mail_cancela(cell);
				break;
			}
		}

		if(e.type === 'keypress'){
			switch (e.which) {
				case 13:
					mail_edicao($(this));
					mail_grava(cell);
				break;
			}
		}
	});
    
    
});



//############################################################################################################################################
//############################################################################################################################################
                                                            //EMAIL NOVO
//############################################################################################################################################
//############################################################################################################################################
