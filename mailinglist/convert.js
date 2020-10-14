
const fs = require('fs');

// --------------------------------------------------------

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

// --------------------------------------------------------

class LineFile {

    init () {
        this._lines = null
        this._index = 0
        return this
    }

    setPath (aString) {
        this._path = aString
        return this
    }

    read () {
        var options = { encoding:'utf-8', flag:'r' };
        console.log("reading '" + this._path + "'")
        const data = fs.readFileSync(this._path, options);
        console.log("read " + data.length + " bytes")
        this._lines = data.split("\n")
        return this
    }  

    currentLine () {
        if (this._index === this._lines.length) {
            return null
        }
        return this._lines[this._index]
    }

    nextLine () {
        if (this._index < this._lines.length) {
            this._index ++
        }
        return this.currentLine()
    }

    previousLine () {
        if (this._index > 0) {
            this._index --
        }
        return this.currentLine()
    }

}

// -----------------------------

class MboxMessage {

    init () {
        this._dict = {
            from: null,
            subject: null,
            date: null,
            content: ""
        }
        return this
    }

    dict () {
        return this._dict
    }

    readLineFile (lineFile) {
        while (this.readHeader(lineFile)) {
        }
    
        while (this.readContent(lineFile)) {
        }
    }

   readHeader (lineFile) {
        const dict = this._dict
        const line = lineFile.currentLine()

        if (line.indexOf("From: ") === 0) {
            dict.from = line.after("From: ")
        }

        if (line.indexOf("Message-ID:") === 0) {
            dict.id = line.after("Message-ID:")
        }

        if (line.indexOf("Subject: ") === 0) {
            dict.subject = line.after("Subject: ")
        }

        if (line.indexOf("Date: ") === 0) {
            dict.date = line.after("Date: ")
        }

        if (this.lineIsHeaderEnd(line)) {
            lineFile.nextLine()
            return false
        }

        lineFile.nextLine()
        
        return true
    }

    readContent (lineFile) {
        const line = lineFile.currentLine()

        if (line === null || this.lineIsHeaderStart(line)) {
            return false
        }
        
        this._dict.content += line + "\n"
        lineFile.nextLine()
        return this
    }

    lineIsHeaderStart (line) {
        const parts = line.split(" ")
        const isStart = (parts[0] === "From" && parts.length === 7)
        return isStart
    }

    lineIsHeaderEnd (line) {
        return (line.indexOf("X-Yahoo-Profile:") === 0)
    }

}

// -------------------------------------

class Mbox {

    init () {
        this._lineFile = new LineFile().init()
        this._messages = []
        return this
    }

    setPath (aString) {
        this._path = aString
        return this
    }

    path () {
        return this._path
    }

    run () {
        this._lineFile.setPath(this.path()).read()
        this.convert()
        this.write()
    }

    convert () {
        this._messages = []

        while (this._lineFile.currentLine() ) {
            const message = new MboxMessage().init()
            this._messages.push(message)
            message.readLineFile(this._lineFile)           
        }

        return this
    }

    write () {
        this._outData = "window.archive = " + JSON.stringify(this._messages.map(msg => msg.dict()), 2, 2)
        var options = { encoding:'utf-8', flag:'w' };
        fs.writeFileSync("archive.js", this._outData, options);
        return this
    }
}


const mbox = new Mbox().init()
mbox.setPath("archive.mbox")
mbox.run()