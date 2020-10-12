
var fs = require('fs');

Object.defineSlot = function(obj, slotName, slotValue) {
    const descriptor = {
        configurable: true,
        enumerable: false,
        value: slotValue,
        writable: true,
    }
    Object.defineProperty(obj, slotName, descriptor)
}

Object.defineSlot(String.prototype, "after", function (aString) {
    const index = this.indexOf(aString);

    if (index === -1) {
        return "";
    }
    
    return this.slice(index + aString.length);
})

class Mbox {

    setPath (aString) {
        this._path = aString
        return this
    }

    run () {
        this.read()
        this.convert()
        this.write()
    }

    read () {
        var options = { encoding:'utf-8', flag:'r' };
        this._inData = fs.readFileSync(this._path, options);
        return this
    }  

    convert () {
        this._messages = []
        const chunks = this._inData.split("\n\nFrom ")
        chunks.forEach((chunk) => {
            this.handleChunk(chunk)
        })

        this._outData = "window.archive = " + JSON.stringify(this._messages, 2, 2)
        return this
    }

    handleChunk (chunk) {
        const message = { 
            from: null,
            subject: null,
            date: null,
            content: ""
        }


        const lines = chunk.split("\n")
        let inContent = false

        for (let i = 0; i < lines.length; i ++) {
            const line = lines[i]

            if (line.indexOf("From: ") === 0) {
                message.from = line.after("From: ")
            }

            if (line.indexOf("Message-ID:") === 0) {
                message.id = line.after("Message-ID:")
            }

            if (line.indexOf("Subject: ") === 0) {
                message.subject = line.after("Subject: ")
            }

            if (line.indexOf("Date: ") === 0) {
                message.date = line.after("Date: ")
            }

            if (line.indexOf("X-Yahoo-Profile:") === 0) {
                inContent = true
            } else {
                if (inContent) {
                    message.content += line + "\n"
                }
            }
        }

        this._messages.push(message)
    }

    write () {
        var options = { encoding:'utf-8', flag:'w' };
        fs.writeFileSync("archive.js", this._outData, options);
        return this
    }
}

const mbox = new Mbox()
mbox.setPath("archive.mbox")
mbox.run()