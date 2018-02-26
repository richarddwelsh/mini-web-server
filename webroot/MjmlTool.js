var mjmlEditor, jsonEditor, htmlEditor, htmlPreview, errors, latestHtml;

var phpExpressionFinder = /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*(?:\[(?:'[a-z]+'|[0-9]+)\])*/g;
var twigExpressionFinder = /{{[a-z9-9]+}}/g;

$(document).ready(function() {
    mjmlEditor = ace.edit($("#mjmlEditor .editor")[0]);
    mjmlEditor.setTheme("ace/theme/twilight");
    mjmlEditor.session.setMode("ace/mode/xml");
    mjmlEditor.getSession().setUseWrapMode(true);
    mjmlEditor.commands.addCommand({
            name: 'doTransform',
            bindKey: {win: 'Ctrl-R',  mac: 'Command-R'}, // R for Run
            exec: doTransform,
            readOnly: true // false if this command should not apply in readOnly mode
        });
    mjmlEditor.commands.addCommand({
            name: 'doSaveMjml',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'}, // S for Save
            exec: function() { doSave("mjml") },
            readOnly: true // false if this command should not apply in readOnly mode
        })

    jsonEditor = ace.edit($("#jsonEditor .editor")[0]);
    jsonEditor.setTheme("ace/theme/twilight");
    jsonEditor.session.setMode("ace/mode/json");
    jsonEditor.getSession().setUseWrapMode(true);
    jsonEditor.commands.addCommand({
        name: 'doSaveJson',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'}, // S for Save
        exec: function() { doSave("json") },
        readOnly: true // false if this command should not apply in readOnly mode
    })

    htmlEditor = ace.edit($("#htmlEditor .editor")[0]);
    htmlEditor.setTheme("ace/theme/twilight");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.getSession().setUseWrapMode(true);
    htmlEditor.setReadOnly(true);
    htmlEditor.commands.addCommand({
        name: 'doSaveHtml',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'}, // S for Save
        exec: function() { doSave("html") },
        readOnly: true // false if this command should not apply in readOnly mode
    })

    $("#send-submit").on("click", function(){
        $.post({
            url: "/SendTest",
            data: {
                to: $("#to").val(),
                subject: $("#subject").val() + " " + new Date(),
                html: latestHtml
            },
            success: function(responseObj) {
                console.log(responseObj);
                log.empty();
                log.append($("<p>" + responseObj.response + "<br/>" + responseObj.messageId + "</p>"))
            },
            dataType: "json", // what is expected in return
        })
    })

    $("#load-submit").on("click", function (){
        $.get("/MJML/" + $("#filename").val(), null, function(responseText) {
            mjmlEditor.setValue(responseText);
            mjmlEditor.gotoLine(1)
        })
    })

    $("#save-submit").on("click", function (){
        doSave("mjml")
    })

    $.get("/MJML/placeholders.json", null, function(responseText) {
        jsonEditor.setValue(responseText);
        jsonEditor.gotoLine(1)
        }, "text")

    htmlPreview = $("#htmlPreview iframe")
    errors = $("#mjmlEditor .errors")
    log = $("#htmlPreview .log")
})

function doSave(what) {
    var filenames = {
        "mjml": "/MJML/" + $("#filename").val(),
        "html": "/MJML/" + $("#filename").val().replace("mjml", "html"),
        "json": "/MJML/placeholders.json"
    }
    var codeWindow = {
        "mjml": mjmlEditor,
        "html": htmlEditor,
        "json": jsonEditor
    }

    $.ajax({
        method: "PUT",
        url: filenames[what],
        contentType: "text/plain",
        data: codeWindow[what].getValue(),
        success: function() {
            alert (filenames[what] + " saved successfully")
        }
    })

}

function doTransform() {
    // do placeholder substitutions first (in the browser)
    var placeholders = eval("(" + jsonEditor.getValue() + ")"),
        substitutedHtml = mjmlEditor.getValue()
            .replace(phpExpressionFinder, function(match) { return placeholders["php_vars"][match] || match })
            .replace(twigExpressionFinder, function(match) { return placeholders["twig_vars"][match] || match });

    $.post({
        url: "/Mjml2Html",
        data: substitutedHtml,
        contentType: "text/xml",
        dataType: "json", // what is expected in return
        success: function(responseObj) {
            // console.log(responseObj);

            if (responseObj.html) {
                latestHtml = responseObj.html;
                htmlEditor.setValue(latestHtml);
                htmlEditor.selection.clearSelection();

                populateIframe(latestHtml, htmlPreview)
            }

            // handle & show errors here
            if (responseObj.errors.length > 0) {
                errors.empty();
                for (var i = 0, len = responseObj.errors.length; i < len; i++) {
                    var e = responseObj.errors[i];
                    if (e.formattedMessage)
                        errors.append($("<p>" + e.formattedMessage + "</p>"))
                    else
                        errors.append($("<p>" + e + "</p>"))
                }
            } else {
                errors.empty();
            }
        }
    })
}

function populateIframe(htmlString, iframeElem) {
    var iframe = iframeElem[0];
    iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);

    iframe.document.open();
    iframe.document.write(htmlString);
    iframe.document.close();
}