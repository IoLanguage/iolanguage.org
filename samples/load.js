"use strict";

/*

	Some useful basics

*/

// A single function to access globals that works
// in the browser (which uses 'window') and on node.js (which uses 'global')

function getGlobalThis () {
	const isDef = function (v) {
		return typeof(v) !== "undefined"
	}

	if (isDef(globalThis)) {
        return globalThis;
    }

	if (isDef(self)) {
        return self;
    }

	if (isDef(window)) {
		window.global = window;
		return window;
	}

	if (isDef(global)) {
		global.window = global;
		return global;
	}

	// Note: this might still return the wrong result!
	if (isDef(this)) {
        return this;
    }
    
	throw new Error("Unable to locate global `this`");
  };

  getGlobalThis().getGlobalThis = getGlobalThis;

// --- eval source url --------------------------------

function evalStringFromSourceUrl (codeString, path) {
    const sourceUrl = "\n//# sourceURL=/" + path + " \n";
    const debugCode = codeString + sourceUrl;
    eval(debugCode);
}

// --- Object defineSlot ---

Object.defineSlot = function (obj, slotName, slotValue) {
    const descriptor = {
        configurable: true,
        enumerable: false,
        value: slotValue,
        writable: true,
    }

    if (typeof(slotValue) === "function") {
        slotValue.displayName = slotName
    }
    
    Object.defineProperty(obj, slotName, descriptor)
}

// --- URL promises -------------

URL.with = function (path) {
    return new URL(path, new URL(window.location.href))
}

Object.defineSlot(URL.prototype, "promiseLoad", function () {
    const path = this.href
    //console.log("loading ", path)
    return new Promise((resolve, reject) => {
        const rq = new XMLHttpRequest();
        rq.responseType = "arraybuffer";
        rq.open('GET', path, true);

        rq.onload  = (event) => { 
            if (rq.status >= 400 && rq.status <= 599) {
                reject(new Error(request.status + " " + rq.statusText + " error loading " + path + " "))
            }
            this.response = rq.response
            console.log("loaded ", path)
            resolve(rq.response) 
        }

        rq.onerror = (event) => { 
            console.log("error loading ", path)
            reject(undefined) 
        }
        rq.send()
    })
})

// --- Array promises --------------

Object.defineSlot(Array.prototype, "promiseSerialForEach", function (aBlock) {
    let promise = null
    this.forEach((v) => {
        if (promise) {
            promise = promise.then(() => { 
                return aBlock(v) 
            })
        } else {
            promise = aBlock(v)
        }
    })
    return promise
})

Object.defineSlot(Array.prototype, "promiseParallelMap", function (aBlock) {
    const promises = this.map((v) => aBlock(v))
    return Promise.all(promises) // passes results to then()
})

// -----------------------------------


class UrlResource {

    static _bytesLoaded = 0;
    static _urlsLoaded = 0;

    static with (url) {
        return this.clone().setPath(url)
    }

    static clone () {
        const instance = new this()
        instance.init()
        return instance
    }
	
    init () {
        this._path = null
        this._resourceHash = null
        this._request = null
        this._data = null
        return this
    }

    setPath (aPath) {
        this._path = aPath
        return this
    }

    path () {
        return this._path
    }

    pathExtension () {
        return this.path().split(".").pop()
    }

    setResourceHash (h) {
        this._resourceHash = h
        return this
    }

    resourceHash () {
        return this._resourceHash
    }

    promiseLoad () {
        // load unzipper if needed
        if (this.isZipFile()) {
            return this.promiseLoadUnzipIfNeeded().then(() => { 
                return this.promiseLoad_2()
            })
        }
        return this.promiseLoad_2()
    }

    promiseLoad_2 () {
        const h = this.resourceHash() 
        if (h && getGlobalThis().HashCache) {
            const hc = HashCache.shared()
            return hc.promiseHasKey(h).then((hasKey) => {
                if (hasKey) {
                    // if hashcache is available and hash data, use it
                    return hc.promiseAt(h).then((data) => {
                        this._data = data
                        return Promise.resolve(this)
                    })
                } else {
                    // otherwise, load normally and cache result
                    return this.promiseJustLoad().then(() => {
                        hc.promiseAtPut(h, this.data()).then(() => {
                            return Promise.resolve(this)
                        })
                    })
                }
            })
        } else {
            return this.promiseJustLoad()
        }
    }

    promiseJustLoad () {
        //debugger
        return URL.with(this.path()).promiseLoad().then((data) => {
            //debugger
            this._data = data;
            this.constructor._bytesLoaded += data.byteLength;
            this.constructor._urlsLoaded += 1;
            return Promise.resolve(this)
        }).catch((error) => {
            debugger
            this._error = error
            throw error
        })
    }

    promiseLoadAndEval () {
        //console.log("promiseLoadAndEval " + this.path())
        //debugger
        return this.promiseLoad().then(() => {
            this.eval()
            return Promise.resolve(this)
        })
    }

    eval () {
        if (this.pathExtension() === "js") {
            this.evalDataAsJS()
        } else if (this.pathExtension() === "css") {
            this.evalDataAsCss()
        }
    }

    evalDataAsJS () {
        //console.log("UrlResource eval ", this.path())
        evalStringFromSourceUrl(this.dataAsText(), this.path())
        return this
    }

    evalDataAsCss () {
        const cssString = this.dataAsText(); // default decoding is to utf8
        const sourceUrl = "\n\n//# sourceURL=" + this.path() + " \n"
        const debugCssString = cssString + sourceUrl
        //console.log("eval css: " +  entry.path)
        const element = document.createElement('style');
        element.type = 'text/css';
        element.appendChild(document.createTextNode(debugCssString))
        document.head.appendChild(element);
    }

    data () {
        return this._data;
    }

    dataAsText () {
        let data = this.data()
        if (typeof(data) === "string") {
            return data
        }

        if (this.isZipFile()) {
            data = this.unzippedData()
        } 

        return new TextDecoder().decode(data); // default decoding is to utf8
    }

    dataAsJson () {
        return JSON.parse(this.dataAsText())
    }

    // --- zip ---

    isZipFile () {
        return this.pathExtension() === "zip"
    }

    unzippedData () {
        return pako.inflate(this.data());
    }

    promiseLoadUnzipIfNeeded () {
        if (!getGlobalThis().pako) {
            return UrlResource.clone().setPath("source/boot/pako.js").promiseLoadAndEval()
        }
        return Promise.resolve()
    }
}


// ---------------------------------------

/*
	Load the samples and insert them into html using a template
*/

window.onload = function () {

	UrlResource.clone().setPath("/samples/samples.json").promiseLoad().then((urlResource) => {
		const e = document.getElementById("samples")
		e.innerHtml = ""

		const json = urlResource.dataAsJson()
		let s = ""
		Reflect.ownKeys(json).sort().forEach(key => {
			const value = json[key]
			s += "<div class=bar></div>"
			s += "<div class=section>" + key + "</div>\n";
			s += "<div class=code>"
			s += value
			s += "</div>\n"
			s += "</div>\n"
		})
		e.innerHTML = s
	})
}