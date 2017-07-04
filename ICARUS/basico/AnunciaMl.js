//########################################################
//VERSÃO DA TELA
//########################################################
var CNSAML_RELEASE = '0.003';


var CNSAML_EXEC = '../basico/AnunciaMl.Exec.php';

var objAml = {};
var objTabelaAml = {};
var objAnexos = [];

//########################################################
//VERIFICA SE JA RODOU O safety
//########################################################
CNSAML_SAFETY = false;


//########################################################
//ATIVAÇÃO DO DIMMER
//########################################################
$CNSAMLdimmer = ativaDimmerConsulta("box-inc-anuncio",
    function(){
        // FUNÇÕES PARA SE FAZER AO ABRIR A TELA
        cnsAml_getCombos();
    },
    function(){
        
    }
);

var quill = {};



























//########################################################
//ABRE A CONSULTA DO MERCADO LIVRE
//########################################################
function anunciaMl_abre(ptcode) {
    objAml.pt_code = ptcode;
    cnsAml_loadTextEditor();
    

    if(!CNSAML_SAFETY){
        cnsAml_safety(function(){ anunciaMl_abre(ptcode); });
        return;
    }
    $CNSAMLdimmer.dimmer("consulta show");
}


//########################################################
//CHAMA SAFETY
//########################################################
function cnsAml_safety(fCustom){
    safety(CNSAML_EXEC, function(){ cnsAml_liberaAcesso(fCustom); }, CNSAML_RELEASE);
}


//########################################################
//LIBERA ACESSO DO MERCADO LIVRE
//########################################################
function cnsAml_liberaAcesso(fCustom){
    if (!TestaAcesso('M.LIVRE')) { //usuario sem acesso fecha janela
        swal({
                title: "Atenção",
                text: "Você não possuí acesso a essa tela, ela será fechada!<br>" +
                      "Nome do acesso necessário: M.LIVRE",
                type: "warning",
                html: true,
            },
            function() {
                if(empty($CNSAMLdimmer)){
                    var win = window.open("", "_self");
                    win.close();
                }else{
                    cnsAml_fecha();
                }
            }
        );
        return;
    }
    $CNSAMLdimmer.dimmer("consulta show");
}

//########################################################
//BUSCA AS INFORMAÇÕES DO PRODUTO, AS CATEGORIAS, OS TEMPLATES E OS TIPOS DE ANUNCIO
//########################################################
function cnsAml_getCombos(fCustom){
    var funcao = "funcao=loadCombo&pt_code="+objAml.pt_code;

    quill.deleteText(0, quill.getLength());
    loading.show("Carregando Categorias...");

    ajax(funcao, CNSAML_EXEC, function(retorno){
        if(!empty(retorno.error)){
            loading.close();

            var end = function(){};
            
            if(!empty(retorno.message)){
                retorno.mensagem = retorno.message;
                end = function(){
                    if(empty($CNSAMLdimmer)){
                        var win = window.open("", "_self");
                        win.close();
                    }else{
                        cnsAml_fecha();
                    }
                }
            }

            swal('Erro ao buscar combos',retorno.mensagem,'error');
            end();
            return;
        }

        $("#cnsAml_titulo").val(retorno.detalhes.pt_descr);
        $("#cnsAml_valor").val(retorno.detalhes.preco);
        $("#cnsAml_qtd").val(retorno.detalhes.estoque);

        objTabelaAml = retorno;

        //TIPOS DE ANUNCIOS 
        $.each(retorno.anuncios, function (key, tipos){
            $('#cnsAml_tipo').append($('<option>', {value: tipos.id, text : tipos.name}));
        });
        
        //cnsAml_categorias
        $.each(retorno.categorias, function (key, categoria){
            $('#cnsAml_categorias').append($('<option>', {value: categoria.id, text : categoria.name}));
        });

        //cnsAml_template
        $.each(retorno.templates, function (key, template){
            $('#cnsAml_template').append($('<option>', {value: key, text : template.name}));
        });


        $('#det_anunciaML .ui.dropdown').dropdown();
        //########################################################
        //VERIFICA TODAS AS MUDANÇAS QUE ACONTECEM AO MUDAR O SELECT
        //########################################################
        $('#det_anunciaML .ui.dropdown').dropdown({
            onChange: function(value,text,itemlista) {
                if($(itemlista).parent().siblings("select").attr("id") == "cnsAml_template"){
                    cnsAml_trocaTemplate($(itemlista).parent().siblings("select").val());
                }
                $('#cnsAml_titulo').select();
            }
        });


        CNSAML_SAFETY = true;
        if(!empty(fCustom)){
            fCustom();
            loading.close();
            return;
        }

        loading.close();
    });
}

//########################################################
//FECHA A CONSULTA DE MERCADO LIVRE
//########################################################
function cnsAml_fecha(div, div2) {
    // anunciaMl_limpaTela();
    $CNSAMLdimmer.dimmer("consulta hide");
}


//########################################################
//CARREGA O QUILL - EDITOR DE TEXTO
//########################################################
function cnsAml_loadTextEditor(){
    if(empty($('#editor-container').html())){
        quill = new Quill('#editor-container', {
            modules: {
            toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block']
                ]
            },
            theme: 'snow'  // or 'bubble'
        });
    }
}


//########################################################
//ALTERA TEMPLATE E RENDERIZA ELE NO QUILL
//########################################################
function cnsAml_trocaTemplate(value){
    var name = objTabelaAml.templates[value].name;

    var atributos = {};
    atributos.codigoProduto = objAml.pt_code;
    atributos.titulo = $("#cnsAml_titulo").val();
    atributos.preco = $("#cnsAml_valor").val();
    atributos.quantidade = $("#cnsAml_qtd").val();
    atributos.garantia = $("#cnsAml_garantia").val();
    var strAtributos = JSON.stringify(atributos);

    var funcao = "funcao=carregaTemplate&template="+name+"&parametros="+strAtributos;
    loading.show("Carregando Template...");
    quill.deleteText(0, quill.getLength()); // DELETA TODO O CONTEUDO QUE ESTIVER NO TEXT FIELD
    ajax(funcao, CNSAML_EXEC, function(retorno){
        loading.close();
        if(!empty(retorno.error)){
            loading.close();
            swal('Erro ao carregar Template',retorno.mensagem,'error');
            return;
        }  

        quill.clipboard.dangerouslyPasteHTML(0, retorno.arquivo);
        
    });    
}

//########################################################
//RECARREGA AS CATEGORIAS, BUSCANDO AS SUBCATEGORIAS DO ML
//########################################################
function cnsAml_reloadCategorias(categoria_id, parent_id){
    var funcao = "funcao=reloadCategorias&id="+categoria_id;

    swal.loading('Buscando Categorias...');

    ajax(funcao, CNSAML_EXEC, function(retorno){
        if(!empty(retorno.error)){
            loading.close();
            swal('Erro ao buscar combos',retorno.mensagem,'error');
            return;
        }

        var proximos = $("#"+parent_id).nextAll('select');
        console.log(proximos);

        if(proximos.length > 0 && proximos[0].id !== categoria_id){
            proximos.remove();
        }

        $("#categorias select").removeClass('bg verde-oliva');

        if(retorno.last == false){
            var newSelect = document.createElement('select');
            newSelect.id = categoria_id;

            $("#categorias").append(newSelect);
            $("#"+newSelect.id).addClass('ui search dropdown w110 categorias');

            $("#"+newSelect.id).append($('<option>', {value: '', text : 'Selecione'}));

            //cnsAml_categorias
            $.each(retorno.categorias, function (key, categoria){
                $("#"+newSelect.id).append($('<option>', {value: categoria.id, text : categoria.name}));
            });


        } else {
            $("#categorias select:last-child").addClass('bg verde-oliva');
        }
        swal.close();
    });
}


//########################################################
//ANUNCIA O PRODUTO NO MERCADO LIVRE
//########################################################
function cnsAml_anuncia(){
    swal.loading("Organizando dados...");

    var corpo = $("#editor-container .ql-editor").html();
    corpo = cnsAml_codifica(corpo);

    if(empty($("#cnsAml_titulo").val())){
        swal("Erro!", "Digite um Título para o Anuncio", 'error');
        return;
    }

    if(empty($("#cnsAml_qtd").val())){
        swal("Erro!", "Coloque uma quantidade de produtos para a venda", 'error');
        return;
    }

    if(Number($("#cnsAml_qtd").val()) <= 0 ){
        swal("Erro!", "Quantidade Invalida", 'error');
        return;
    }

    if(empty($("#cnsAml_valor").val())){
        swal("Erro!", "Digite um Valor para o produto", 'error');
        return;
    }

    if(empty($("#cnsAml_garantia").val())){
        swal("Erro!", "Digite a quantidade de meses para Garantia", 'error');
        return;
    }

    if(empty($("#cnsAml_tipo").val())){
        swal("Erro!", "Selecione o tipo de anuncio que deseja fazer", 'error');
        return;
    }

    if(empty($("#categorias select:last-child").hasClass('bg verde-oliva'))){
        swal("Erro!", "Selecione corretamente as categorias do anuncio", 'error');
        return;
    }

    var anuncioML = {};
    anuncioML.pt_code = objAml.pt_code;
    anuncioML.titulo = $("#cnsAml_titulo").val();
    anuncioML.quantidade = $("#cnsAml_qtd").val();
    anuncioML.preco = $("#cnsAml_valor").val();
    anuncioML.garantia = $("#cnsAml_garantia").val();
    anuncioML.tipoAnuncio = $("#cnsAml_tipo").val();
    anuncioML.categoria = $("#categorias select:last-child").val();
    anuncioML.video = $("#cnsAml_video").val();
    // IMAGENS
    anuncioML.imagens = objAnexos.join(';');
    var strAnuncioMl = JSON.stringify(anuncioML);



    var funcao = "funcao=anunciaProduto&template="+corpo+"&parametros="+strAnuncioMl;
    swal.loading("Publicando Anuncio...");
    ajax(funcao, CNSAML_EXEC, function(retorno){
        if(!retorno){
            var erro = "Houve um erro interno de servidor.\nEntre em contato com o suporte da pennacorp!";
            swal('Erro ao Publicar Anuncio',erro,'error');
            return;
        }

        //ERRO
        if(!empty(retorno.error)){
            swal('Erro Publicar anucnio',retorno.mensagem,'error');
            return;
        }

        swal({
            title: 'Anuncio Publicado Com Sucesso',
            text: retorno.link,
            type: 'success',
            showCancelButton: true,
            confirmButtonText: "Abrir Anuncio",
            cancelButtonText: "Fechar",
            closeOnConfirm: false,
            closeOnCancel: true,
        }, function(confirmar){
            if(!confirmar){
                return;
            }

            window.open(retorno.link);
        });
    });
}

//########################################################
//REALIZA O UPLOAD DAS IMAGENS NO SERVIDOR
//########################################################
function cnsAml_enviaImagens(event){
    if(objAnexos.length >= 5){
        swal("Erro", "Há um limite de 5 imagens por anuncio no Mercado Livre", "error");
        return;
    }

    files = event.target.files;
    var data = new FormData();

    for(var i = 0; i < files.length; i++){
        var file = files[i];
        data.append('file', file, file.name);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CNSAML_EXEC+"?funcao=upImagem", true);
    xhr.send(data);
    xhr.onload = function(){
        if(xhr.status === 200){
            var retorno = JSON.parse(this.responseText);

            if(empty(retorno)){
                swal('Erro', "Ocorreu um erro ao realizar o Upload. Tente Novamente", 'error');
                return;
            }

            if(!empty(retorno.error)){
                swal('Erro ao realizar o Upload', retorno.mensagem, 'error');
                return;
            }

            cnsAml_createImgAnexo(retorno.filename);            
        } else {
            swal('Erro', "Ocorreu um erro ao realizar o Upload. Tente Novamente", 'error');
            return;
        }
    }
}

//########################################################
//CRIA A LABEL DE ANEXO DA IMAGEM
//########################################################
function cnsAml_createImgAnexo(filename){
    if(objAnexos.indexOf(filename) == -1){
        objAnexos.push(filename);

        var linha = "<a class='ui label' name='"+filename+"'> "+
                filename+
                "<i class='icon close' onclick=cnsAml_removeAnexo('"+filename+"')></i>"+
            " </a>";
        $("#attachment-container").append(linha);
        $('#upl').val("");
    }
}


//########################################################
//FINALIZA UM ANUNCIO VALIDO NO MERCADO LIVRE
//########################################################
function anunciaMl_finalizarAnuncio(pt_code){
    swal({
        title: "Deseja finalizar o anúncio do produto " + pt_code + " no Mercado Livre?",
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

        var funcao = "funcao=finalizarAnuncio&pt_code=" + pt_code;
        ajax(funcao, CNSAML_EXEC, function(retorno){
            if(!empty(retorno.error)){
                //ERRO
                swal({
                        title:'Erro ao Finalizar o Anuncio',
                        text: retorno.mensagem,
                        type: 'error'
                    },
                    function(){
                    }
                );
                return;
            }

            swal({
                title:"Anuncio Finalizado com Sucesso!",
                text:"",
                type:"success",
                timer: 6000,
                showConfirmButton: true,
            });
        });
    });
}

//########################################################
//RELISTA UM ANUNCIO NO MERCADO LIVRE
//########################################################
function anunciaMl_relistarAnuncio(pt_code){
    swal({
        title: "Deseja Relistar o anúncio do produto " + pt_code + " no Mercado Livre?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        closeOnConfirm: false,
        closeOnCancel: true,
        showLoaderOnConfirm: false,
    }, function(confirmouRelistar){
        if(!confirmouRelistar){
            return;
        }

        var funcao = "funcao=buscaTiposAnuncios";
        ajax(funcao, CNSAML_EXEC, function(retorno){
            if(!empty(retorno.error)){
                swal({
                        title:'Erro ao buscar informações dos Anuncios',
                        text: retorno.mensagem,
                        type: 'error'
                    },
                    function(){
                    }
                );
                return;
            }

            var select = "";

            $.each(retorno.anuncios, function (key, anuncio){
                select += "<option value='" + anuncio.id + "'>" + anuncio.name + "</option>";
            });

            //PREPARA LAYOUT COM CAMPOS DE IMPOSTOS
            var HTMLRelista = ""+
                "<div id='div_impostos'>"+
                    "<input type='hidden' id='impostos_altera' value='false'>"+
                    "<p>"+
                        "<select id='rl_tipo' class='ui search dropdown'>"+
                            "<option value='' disabled selected>SELECIONE O TIPO DO ANUNCIO</option>"+
                            select+
                        "</select>"+
                    "</p>"+

                    "<div class='text-align-left' style='margin-top: 10px;'>"+
                        "<label style='margin-right: 70px;margin-left: 60px;margin-top: 8px;'>Quantidade</label>"+
                        "<label style='margin: 0 0 8px 0;margin-top: 8px;'>Valor</label>"+
                    "</div>"+

                    "<div class='text-align-left'>"+
                        "<input type='number' min='0' step='1' value='0' id='rl_quantidade'"+
                            "class='w100 inline number' style='margin-right: 70px;margin-left: 60px;margin-top: 8px;margin-bottom:-30px;'>"+

                        "<input type='number' min='0' step='1' value='0.00' id='rl_valor'"+
                            "class='w180 margin0 inline number' style='padding: 0px 12px;margin-top: 8px;margin-bottom:-30px;'>"+
                    "</div>"+
                "</div>";

            swal({
                title: "RELISTAR ANUNCIO",
                text: HTMLRelista,
                html: true,
                showCancelButton: true,
                confirmButtonText: "Relistar",
                closeOnConfirm: false,
                closeOnCancel: false,
                showLoaderOnConfirm: true,
            }, function(confirmou){
                if(!confirmou){
                    swal.close();
                    return;
                }

                if(empty($("#rl_valor").val()) || $("#rl_valor").val() == 0 ){
                    swal.showInputError("Digite um valor");
                    return false;
                }

                if(empty($("#rl_tipo").val()) || $("#rl_tipo").val() === 0 ){
                    swal.showInputError("Escolha um Tipo");
                    return false;
                }

                if(empty($("#rl_quantidade").val()) || $("#rl_quantidade").val() == 0 ){
                    swal.showInputError("Digite uma Quantidade");
                    return false;
                }

                funcao = "funcao=relistaAnuncio&pt_code="+pt_code+"&tipo="+$("#rl_tipo").val()+"&qtd="+$("#rl_quantidade").val()+"&valor="+$("#rl_valor").val();

                ajax(funcao, CNSAML_EXEC, function(retorno){
                    if(!empty(retorno.error)){
                        console.log(retorno.mensagem);
                        swal({
                                title:'Erro ao Relistar Anuncio',
                                text: retorno.mensagem,
                                type: 'error'
                            },
                            function(){
                            }
                        );
                        return;
                    }

                    swal({
                        title: 'Anuncio Relistado Com Sucesso',
                        text: retorno.link,
                        type: 'success',
                        showCancelButton: true,
                        confirmButtonText: "Abrir Anuncio",
                        cancelButtonText: "Fechar",
                        closeOnConfirm: false,
                        closeOnCancel: true,
                    }, function(confirmar){
                        if(!confirmar){
                            return;
                        }

                        window.open(retorno.link);

                    });

                });
            });
        });

    });
}

//########################################################
//REMOVE O ANEXO DA DIV E DO OBJANEXOS PARA NAO ENVIAR
//########################################################
function cnsAml_removeAnexo(filename) {
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

//########################################################################
//CODIFICA O TEXTO EM HTML DO TEMPLATE PARA ENVIAR SEM ERROS AO SERVIDOR
//########################################################################
function cnsAml_codifica(corpo){

    corpo = corpo.split("");
    for (var i = 0; i < corpo.length; i++){
        corpo[i] = corpo[i].charCodeAt(0);
    }
    corpo = JSON.stringify(corpo);
    corpo = window.btoa(corpo);

    return corpo;
}

//#######################################################
//ABRE O LINK DIGITADO NO YOUTUBE
//#######################################################
function cnsAml_openYT(){
    var link = $("#cnsAml_video").val();

    if(empty(link)){
        return;
    }

    window.open(link);
}



























$(document).ready(function(){
    $("#categorias").on('change', 'select', function(){
        cnsAml_reloadCategorias($(this).val(),$(this)[0].id);
    });

    $("#carregarImg").on('click', function(){
        $("#upl").click();
    });

    $('input[type=file]').unbind('change').on('change', cnsAml_enviaImagens);

    $("input[type=number").on('keypress', function(e){
        return somenteNumero(event, false, false, this);
    });

    $("#cnsAml_valor").on('keypress', function(e){
        return somenteNumero(event, false, false, this);
    });
});