//########################################################
//########################################################
            //CONSTANTES SEMPRE USADAS
//########################################################
//########################################################

//########################################################
//VERS�O DA TELA
//########################################################
var RELEASE = '0.002';


//########################################################

//########################################################
//LOCAL DO EXEC
var EXEC = "../basico/FormacaoPrecoAgrupado.Exec.php";
//########################################################

//########################################################
//ERRO
var ERRO_500 = 'Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!';
//########################################################


//########################################################
//########################################################
            //FIM CONSTANTES SEMPRE USADAS
//########################################################
//########################################################




















//########################################################
//########################################################
            //FUN��ES DA SELE��O RELATORIO DE HIST�RICO
//########################################################
//########################################################

//########################################################
//LIBERA ACESSO
//########################################################
function liberaAcesso(){ //chamada pela funcao safety() esta na Icarus.Library.js

	if(!validaVersao(10.09,false)){
		return;
	}

	if (!TestaAcesso('BAS.PROD.REAJ')){ //usuario sem acesso fecha janela
		swal({
				title:"Aten��o",
				text:"Voc� n�o possu� acesso a essa tela, ela ser� fechada!\nNome do acesso necess�rio: BAS.PROD.REAJ",
				type: "warning"
			},
			function(){
				var win = window.open("","_self");
				win.close();
			}
		);
		return;
	}

    trocaRelatorio(get('rel_01'));
    buscaFamilia();
}
//########################################################


//########################################################
//ONCHANGE DOS TIPOS DE RELATORIOS
//########################################################
function trocaRelatorio(ref){
    var mensagem = "Selecione um relat�rio";
    $(".legend_custo").html("Fator Multiplicador");
    $("#div_preco").show();
    $("#span_preco").show();

    $('#ipt_preco, #ipt_custo').val('1.0000');
     switch(ref.id){
          case 'rel_01':
               mensagem = "<p>Multiplica custo e/ou pre�o por fator digitado</p>";
               $(".column.esquerda").show();
          break;

          case 'rel_02':
               mensagem = "<p>Calcula pre�o = custo * fator (Empresa que n�o usa margens)</p>";
               $("#span_preco").hide();
               $(".column.esquerda").show();
          break;


          case 'rel_03':
               mensagem = "<p>Altera margem atual pelo percentual digitado. ex: 40%</p>";
               $("#lb_margem").html('Margens');
			   $("#margem_a,#margem_b,#margem_c,#margem_p").val('');

               $(".column.esquerda").hide();
          break;

          case 'rel_04':
               mensagem = "<p>Reajusta pre�o * fator digitado. ex: Pre�oA * 1.0500 = 5% acrescimo</p>";
               $("#lb_margem").html('Fatores');
			   $("#margem_a,#margem_b,#margem_c,#margem_p").val('1.0000');
			   $(".column.esquerda").hide();
          break;
     }

	$(".column.direita").toggle(!($(".column.esquerda").is(':visible')));

    $('#user-msg').html(mensagem);
}
//########################################################



//########################################################
//BUSCA FAMILIAS NO BANCO
//########################################################
function buscaFamilia(fornecedor){
    loading.show('Buscando familias...');

     var funcao = "funcao=busca-familia&fo_number=" + (fornecedor !== undefined ? fornecedor : '');
     ajax(funcao,EXEC,function(combo){
         loading.close();

          if(!empty(combo.error)){
               swal('Erro ao montar familias',combo.mensagem,'error');
               return;
          }

          LimpaTabela("#list-familias");
          if(!empty(combo.familia)){
               //MONTA FAMILIAS
               var familias = '';
               for(var i = 0; i < combo.familia.length; i++){
                    var id = combo.familia[i].id;
                    var nome = combo.familia[i].nome;
                    familias += "" +
                         "<li class='pointer'><div class='ui checkbox'>" +
                              "<input type='checkbox' id='fm_"+id+"' checked />" +
                              "<label class='cor_padrao_after' for='fm_"+id+"'>"+nome+"</label>" +
                         "</div></li>";
               }
               $('#list-familias').html(familias);
          }

          $('#list-familias').mCustomScrollbar({
             scrollInertia: 0.8,
             autoHideScrollbar: true,
             theme:"dark-3"
         });

          if(!empty(fornecedor)){
               $('#fornec-name').html($('#fo_abrev').attr('pesquisa'));
          }else{
               $('#fornec-name').html("todos os fornecedores");
          }

          $('#totfam').html(" (" + combo.total + ") ");

     });
}
//########################################################



//########################################################
//PESQUISA DE FORNECEDOR
//########################################################
function buscaFornecedor(){
    var texto = $("#fo_abrev").val();

    if(texto == $('#fo_abrev').attr('pesquisa')){
        return;
    }

    if($('#box-inc-fornecedor').is(':visible')){
        return;
    }

    var naopesquisa = (texto.trim() === "" ? true : false);

    cnsFrn_abre(texto,'box-inc-fornecedor',undefined,naopesquisa);
    $('#fo_number').val('');
}
//########################################################
function cnsFrn_retorno(){
    $('#fo_abrev').attr('pesquisa',objFornecedor.fornecAbrev);
    $("#fo_number").val(objFornecedor.fornecNum);
    $("#fo_abrev").val(objFornecedor.fornecAbrev);

    $(".icone_formacao").addClass("check").addClass("blue").removeClass("red").removeClass("remove");
    buscaFamilia(objFornecedor.fornecNum);
}
//########################################################








//########################################################
//N�O PERMITE O CAMPO FICAR VAZIO E TRAS FORMATA��O DE NUMERO
//########################################################
function notnull(elemento) {
	if($('#rel_04').is(':checked')){
		//PEGA O NAME DO INPUT
		var campo = $(elemento).attr('name');

		if (empty($(elemento).val())) {
			$(elemento).val("1");
		}
		if (!empty($(elemento).val()) && $(elemento).val() != $(elemento).attr("last_value")) {
			$(elemento).val(tonumber($(elemento).val()));
			$(elemento).val($(elemento).val().replace(",","."));
			$(elemento).val( number_format($(elemento).val(), 4, ",", ".") );
			$(elemento).attr('last_value', $(elemento).val());
		}
	}
}








//########################################################
//EXECUTA O REAJUSTE
//########################################################
function executa(perguntou){
    if (!perguntou) {
        swal({
            title: "Voc� confirma a atualiza��o?",
            text: "Aten��o, tenha certeza dos dados informados e dos filtros utilizados, lembre-se do BACKUP.",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "N�o",
            closeOnConfirm: false,
            closeOnCancel: true
        },
        function(isConfirm) {
            if (isConfirm)
                executa(true);
        });
        return;
    }

    var sComando = '';
	switch ($('#tipo_altera input[type=radio]:checked').attr('id')) {
		case 'rel_01': sComando = 'C'; break;
		case 'rel_02': sComando = 'P'; break;
		case 'rel_03': sComando = 'A'; break;
		case 'rel_04': sComando = 'M'; break;
	}

    var filtraFornec = $('#check-fornecedor').is(':checked');

    //VALIDA SE O CAMPO FORNECEDOR ESTA VAZIO
    if(filtraFornec && $("#fo_number").val().trim() === ''){
        swal('Erro ao reajustar pre�o','O campo do fornecedor est� marcado, por�m n�o foi escolhido nenhum fornecedor. Utilize o campo para realizar a pesquisa','error');
        return;
    }

    var familias = $('#list-familias input[type=checkbox]:checked');
    if(familias.length === 0){
        swal('Erro ao reajustar pre�o','N�o foi selecionada nenhuma fam�lia, n�o � poss�vel realizar o reajuste','error');
        return;
    }

    var fanumbers = "";
    for(i = 0; i < familias.length; i++){
        fanumbers += "," + familias[i].id.replace('fm_','');
    }
    fanumbers = fanumbers.substring(1);


    var funcao = "funcao=realiza-reajuste&sComando=" + sComando + "&iFor=" + (filtraFornec ? $('#fo_number').val() : 0) +
		"&pFamilia=" + fanumbers + "&fatorA=" + $('#margem_a').val() + "&fatorB=" + $('#margem_b').val() +
		"&fatorC=" + $('#margem_c').val() + "&fatorP=" + $('#margem_p').val() +
		"&fxCus=" + $('#ipt_custo').val() + "&fxPre=" + $('#ipt_preco').val();

    loading.show('Reajustando pre�o...');
    ajax(funcao,EXEC,function(retorno){
        loading.close();

        if(!empty(retorno.error)){
            swal('Erro ao reajustar pre�os',retorno.mensagem,'error');
        return;
        }

		swal({
            title: "Reajuste executado com �xito",
            type: "success",
			timer: 1000
        });

    });
}



//########################################################
////BOT�O DE MARCAR INPUTS DOS FIELDSETS EMPRESAS
//########################################################
function checkInput(ref){
   switch(ref){
       case 'familia':
           ckbox = $('#list-familias input');
           fieldSet = $('#toggleFamilia');
       break;
   }

   if(fieldSet.hasClass('disabled')){
       return;
   }

   for(var i = 0; i < ckbox.length; i++){
       ckbox[i].checked = !ckbox[i].checked;
   }
}
















//########################################################
//########################################################
		//PADR�O DE EVENTOS DOS INPUTS
//########################################################
//########################################################

//########################################################
//TODAS AS FUN��ES QUE FICAM DENTRO DOS INPUTS OU SELECTS
//########################################################
$(document).ready(function(){

	//########################################################
	//MASCARA DA PRECO E CUSTO
	//########################################################
	$(document).on("focus", 'input',function(){
        var id = $(this).attr('id');
        if(id == 'ipt_preco' || id == 'ipt_custo'){
            $(this).mask('9.9999');
        }
	});

    $(document).on("blur", 'input',function(){
        $(this).val($(this).val().replace(/\_/g,'0'));
	});
    //########################################################


    //########################################################
    //SELECIONA O TEXTO DOS CAMPO AO GANHAR FOCO
    //########################################################
    $("input:text").on('focus', function(){
        $(this).select();
    });
    //########################################################


    //########################################################
    //LIBERA PESQUISA DE FORNECEDOR
    //########################################################
    $("#check-fornecedor").on('change',function(){
        if($('#check-fornecedor').is(':checked')){
            $('#fo_abrev, #btn_fornecedor').removeClass('inactive').prop('disabled',false);
            $('#fo_abrev').focus();
        }else{
            $('#fo_abrev, #btn_fornecedor').addClass('inactive').prop('disabled',true);
            $('#fo_abrev, #fo_number').val("");
            $('#fo_abrev').attr('pesquisa','');
            buscaFamilia(undefined);
        }
        $(".icone_formacao").removeClass("check").removeClass("blue").addClass("red").addClass("remove");
    });
    //########################################################


    //########################################################
    //PESQUISA DE FORNECEDOR KEYUP
    //########################################################
    $("#fo_abrev").on('keyup',function(e){
        if(e.keyCode == 13)
            buscaFornecedor();
    });
    //########################################################


    //########################################################
	//EDICAO DOS DADOS
	//########################################################
	$('#margem_a, #margem_b, #margem_c, #margem_p').on('change', function(){
		notnull($(this));
	});
    //########################################################


     $(".ui.seletores li input[type=radio]").on("click",function(){
          trocaRelatorio(this);
     });

});

//########################################################
//########################################################
//FIM PADR�O DE EVENTOS DOS INPUTS
//########################################################
//########################################################
