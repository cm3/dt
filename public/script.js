/* public/script.js */

common = {"left":"","right":"","data_id":""};
//common["data_id"] = "";
//common["left"] = "";
//data_id = "KJ00000132260";
var user_id = document.URL.match("\/([^/]+?)\/(?:[^/]*?)$")[1];
var editor; //CodeMirror object

var markdown = function(_rl){
    //var converter = new showdown.Converter();
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    $("#"+_rl).load("../../panels/markdown.html",function(){
        /*
        var convertTextAreaToMarkdown = function(){
            //$("#markdown").html(converter.makeHtml($("#pad").val()));
            $("#markdown").html(converter.makeHtml(editor.getValue()));
        };
        */
        var convertTextAreaToMarkdown = function(){
            var parsed = reader.parse(editor.getValue());
            $("#markdown").html(writer.render(parsed));
        }
        /* $("#pad").keyup(convertTextAreaToMarkdown); */
        editor.on("changes", function(){
            convertTextAreaToMarkdown();
        });
        convertTextAreaToMarkdown();
        $("#markdown-nav").css("left","50%");
    });
}

var pdf = function(_rl){
    common[_rl] = "pdf";
    /*
    $("#"+_rl).load("/panels/pdf.html",function(){
        //console.log("here!!!!");
        $("#pdf-nav").css("left","50%");
        if(common["data_id"]){
            $("#pdf").attr({"src":"/data/pdf/"+common["data_id"]+".pdf"});
        }
    });
    */
    $.get("../../panels/pdf.html",function(data){
        $("#"+_rl).html(data);
        $(document).ready(function(){
            $("#pdf-nav").css("left","50%");
            if(common["data_id"]){
                $("#pdf").attr({"src":"../../data/pdf/"+common["data_id"]+".pdf"});
            }
        });
    });
}

var save_txt = function(){
    //$.post("/save-txt",{id:"KJ00000132260",txt:$("#pad").val()});
    $.post("../../save-txt",{id:common["data_id"],user:user_id,txt:editor.getValue()});
}

var save_ann = function(){
    var rows_ann = [];
    //var rows_txt = $("#pad").val().split("\n");
    var rows_txt = editor.getValue().split("\n");
    $.each($(".ann-input"),function(){
        if(this.innerText!=""){
            line_num = this.id.slice(7);
            rows_ann.push(line_num+"\t"+rows_txt[Number(line_num)-1]+"\t"+this.innerText);
        }
    });
    $.post("../../save-ann",{id:common["data_id"],user:user_id,txt:rows_ann.join("\n")});
}

var pad_auto = function(){
    var doc = editor.getDoc();
    doc.replaceSelection(doc.getSelection()
    .replace(/\n/g,"")
    .replace(/｡/g,"。")
    .replace(/｡/g,"。")
    .replace(/,/g,"、")
    .replace(/｢/g,"「")
    .replace(/｣/g,"」")
    .replace(/\(/g,"（")
    .replace(/\)/g,"）")
    .replace(/･/g,"・")
    .replace(/([^a-zA-Z])[oO]([^a-zA-Z])/g,"$1。\n$2") // 。の誤認識
    .replace(/([^a-zA-Z])L([^a-zA-Z])/g,"$1し$2") // しの誤認識
    .replace(/([^a-zA-Z]) +([^a-zA-Z])/g,"$1$2") //スペースを削除
    .replace(/([^a-zA-Z]) +([^a-zA-Z])/g,"$1$2") //これは2回やらないと、"あ い う"とか対処できない
    .replace(/([^a-zA-Z\.\-（）])([a-zA-Z\.])/g,"$1 $2") //英単語の始まりにスペース
    .replace(/([a-zA-Z\.])([^a-zA-Z\.\-（）])/g,"$1 $2") //英単語の終わりにスペース
    .replace(/\s+/g," ") //複数スペースは一つに
    .replace(/。([^\n])/g,"。\n$1")
    .replace(/。\n）/g,"。）\n")
    );
}

var load_data = function(_id){
    common["data_id"] = _id;
    pad("left");
    pdf("right");
}

var load_idlist = function(){
    $.get("./id.list", function(data){
        var _id_list = data.split("\n");
        for(var i=0;i<_id_list.length;i++){
            var _id = _id_list[i].replace(/^\s*(.*?)\s*$/, "$1");
            //console.log(_id);
            if(_id != ""){
                $("#idlist").append("<li><a href=\"#\" onclick=\"javascript:load_data('"+_id+"');\">"+_id+"</a></li>");
            }
        }
    });
}

var pad = function(_rl){
    //console.log("hey!")
    common[_rl] = "pad";
    $.get("../../panels/pad.html", function(data){
        $("#"+_rl).html(data);
        //if(common["data_id"]){
            $(document).ready(function(){
                $.get("./txt/"+common["data_id"]+".txt", function(data){
                    document.getElementById("pad").value=data;
                    //console.log(data);
                    editor = CodeMirror.fromTextArea(document.getElementById("pad"), {
                        lineNumbers: true,
                        lineWrapping: true,
                        mode: "markdown"
                    });
                    editor.setSize("100%","100%");
                    editor.on("scroll", function(){
                    scroll();
                    });
                });
            });
            /*
        }else{
            $("#pad").val(
                "　　　　　　　　　↑まずはデータを選んでください。"
            );
        }
        */
        $("#save_txt").click(save_txt);
        $("#pad_auto").click(pad_auto);
        load_idlist();
    });
}

var annotate = function(_rl){
    $("#"+_rl).load("../../panels/annotate.html",function(){
        $("#annotate-nav").css("left","50%");
        $("#annotate-raw-data").load("./ann/"+common["data_id"]+".ann",function(){
        var data = $("#annotate-raw-data").val().split("\n");
        var output = [];
        //var max_line_num = $("#pad").val().split("\n").length;
        var max_line_num = editor.lineCount();
        for(var i = 1;i < max_line_num+1; i++){
            //output.push("<input type='text' class='ann-input' value='' id='ann_row"+String(i)+"'>");
                        output.push("<span class='ann-input' contenteditable='true' value='' id='ann_row"+String(i)+"'></span>");
        }
        $("#annotate").html(output.join("\n"));
        for (var i = 0; i < data.length; i++){
            var data_i = data[i].split("\t");
            //output_ann(Number(data_i[0]),data_i[2]);
            //console.log($("#ann_row"+data_i[0]));
            $("#ann_row"+data_i[0]).text(data_i[2]);
        }
        $("#annotate").css("line-height",String(editor.defaultTextHeight())+"px")
        //$(".ann-input").focus(function(){console.log(this.offsetTop);});
        //output.shift();//output[0] is annotation of line 0: invalid.
        //console.log(output);
            scroll();
        });
        $("#save_ann").click(save_ann);
        $("#refresh_ann").click(function(){annotate("right");});
    });
}

var help = function(_rl){
    common[_rl] = "help";
    $("#"+_rl).load("../../panels/help.html",function(){
        $("#help-nav").css("left","50%");
    });
}

var scroll = function(){
    /* $("#annotate").scrollTop($("#pad").scrollTop()); */
    for(var i = 1;i <editor.lineCount()+1; i++){
        $("#ann_row"+String(i)).css("height",String(editor.getLineHandle(i-1)["height"])+"px");
    }
    $("#annotate").scrollTop(editor.getScrollInfo()["top"]);
}

$(window).load(function(){
    //var cm = CodeMirror(document.getElementById("left"));
    //console.log(common["left"]);
    if(common["left"] == ""){pad("left");}
    if(common["right"] == ""){help("right");}
});
