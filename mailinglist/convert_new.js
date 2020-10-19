// Unfortunately, these libraries don't properly parse many of the messages in the 
// iolanguage mailing list mbox file downloaded from yahoo groups.

const Mbox = require('node-mbox'); // mbox parser

const simpleParser = require('mailparser').simpleParser; // message parser
//const Iconv = require('iconv').Iconv; // message character encodings 

const fs = require('fs');

const mbox    = new Mbox("archive.mbox", { });

const outputMessages = []

mbox.on('message', function(msg) {

    console.log(msg.toString())
    console.log("------------------------------------")
    console.log("------------------------------------")
    console.log("------------------------------------")

    /*
    simpleParser( msg.toString(), {  }, (err, parsed) => {
        if (err) {
            console.log("-- err -- ", err)
            exit()
        } else {
            //console.log("parsed.from: ", parsed.from)
            //console.log("parsed.subject: ", parsed.subject)
            //console.log("parsed.messageId: ", parsed.messageId)
            //console.log(parsed)
            outputMessages.push(parsed)
        }
    })
    */
});

mbox.on('error', function(err) {
  console.log('got an error', err);
  exit()
});

mbox.on('end', function() {
    console.log('done reading mbox file');
    const outPath = "archive.js"
    const outData = "window.archive = " + JSON.stringify(outputMessages.map(msg => DictForMessage(msg)).filter(d => d !== null), 2, 2)
    //const outData = "window.archive = " + JSON.stringify(outputMessages, 2, 2)
    const options = { encoding:'utf-8', flag:'w' };
    fs.writeFileSync(outPath, outData, options);
    console.log("wrote " + outputMessages.length + " messages to '" + outPath + "'")

});

function DictForMessage(parsedMsg) {
    //console.log("parsedMsg.headers.subject: ", parsedMsg.headers.subject, "----------------")
   if (!parsedMsg.headers.get("from")) {
        console.log("skipping record: \n", parsedMsg.headers.keys(), JSON.stringify(parsedMsg, 2, 2), "\n----------------")

        return null
    }

    //parsedMsg.fromString = parsedMsg.from.value.address + parsedMsg.from.value.name
    //delete parsedMsg.textAsHtml

    
    //console.log("id: " + parsedMsg.messageId)
    const dict = {}
    dict.subject = parsedMsg.headers.get("subject")
    //dict.from = parsedMsg.headers.get("from").value.name + " / " + parsedMsg.headers.get("from").value.address
    dict.fromAddress = parsedMsg.from.value[0].address 
    dict.fromName = parsedMsg.from.value[0].name

    /*
    if (!parsedMsg.from.value[0].name) {
        console.log("parsedMsg.from = ", parsedMsg.from)
        exit()
    }
    */

    dict.content = parsedMsg.text
    dict.id =  parsedMsg.messageId
    dict.date = parsedMsg.headers.get("date") //parsedMsg.date

    return dict
}
