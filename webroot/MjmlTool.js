var mjmlEditor, htmlEditor, htmlPreview, errors, latestHtml;

$(document).ready(function() {
    mjmlEditor = ace.edit($("#mjmlEditor .editor")[0]);
    mjmlEditor.setTheme("ace/theme/twilight");
    mjmlEditor.session.setMode("ace/mode/xml");
    mjmlEditor.getSession().setUseWrapMode(true);
    mjmlEditor.commands.addCommand({
        name: 'doTransform',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: doTransform,
        readOnly: true // false if this command should not apply in readOnly mode
    });

    htmlEditor = ace.edit($("#htmlEditor .editor")[0]);
    htmlEditor.setTheme("ace/theme/twilight");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.getSession().setUseWrapMode(true);
    htmlEditor.setReadOnly(true);

    $("#submit").on("click", function(){
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

    $.get("/HelloWorld.mjml", null, function(responseText) {
        mjmlEditor.setValue(responseText);
        mjmlEditor.gotoLine(1)
    })

    htmlPreview = $("#htmlPreview iframe")
    errors = $("#mjmlEditor .errors")
    log = $("#htmlPreview .log")
})

function doTransform() {
    $.post({
        url: "/Mjml2Html",
        data: mjmlEditor.getValue(),
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