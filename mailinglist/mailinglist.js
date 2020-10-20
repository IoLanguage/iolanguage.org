// quick and dirty test

// -------------------------------------------------------------------------------------

function assert(v) {
	if (!v) {
		throw new Error("assertation failed")
	}
} 
function IteratorAsArray (iter) {
	const array = []
	let result = iter.next()
	while (!result.done) {
		array.push(result.value)
		result = iter.next()
	}
	return array
}

var cleanDiv = document.createElement("div");

function cleanString(s) {
	if (!s) {
		return "null"
	}
	s = s.split("<").join("&lt;")
	s = s.split(">").join("&gt;")

	s = s.replace(/[&<"']/g, function(m) {
		switch (m) {
		case '&':
			return '&amp;';
		case '<':
			return '&lt;';
		case '"':
			return '&quot;';
		default:
			return '&#039;';
		}
	});

	cleanDiv.innerHTML = s;
	s = cleanDiv.textContent || cleanDiv.innerText || "";

	return s
}


// -------------------------------------------------------------------------------------


class MboxMessage {

    init () {
        this._dict = {
            from: null,
            subject: null,
            date: null,
			id: null,
            content: ""
        }
		this._divString = null
        return this
    }


    dict () {
        return this._dict
    }

	setDict (dict) {
		this._dict = dict
		this.cleanDict()
		return this
	}


	from () {
		return this._dict.from
	}

	setFrom (v) {
		this._dict.from = v
		return this
	}


	subject () {
		return this._dict.subject
	}

	setSubject (v) {
		this._dict.subject = v
		return this
	}


	date () {
		return this._dict.date
	}

	setDate (v) {
		this._dict.date = v
		return this
	}


	content () {
		return this._dict.content
	}

	setContent (v) {
		this._dict.content = v
		return this
	}

	// ----

	year() {
		const parts = this.date().split(" ")
		if (parts.length === 6) {
			const year = parts[3]
			return year
		}
		return null
	}

	calcSimpleDate () {
		let d = this.date().split(" ")
		d.pop()
		d.pop()
		d = d.join(" ")
		return d
	}

	simpleDate(s) {
		if (!this._simpleDate) {
			this._simpleDate = this.calcSimpleDate()
		}
		return this._simpleDate
	}

	indexibleSlotNames () {
		return ["year", "subject", "sender"]
	}

	sender () {
		return this.from()
	}
	
	calcDivString () {
		let s = ""
		s += "<div class=message>\n"
			s += "<div class=messageHeader>"
				s += "Subject: " + this.subject() + "\n"
				s += "From: " + this.from() + "\n"
				s += "Date: " + this.date() + "\n"
			s += "</div>"
			s += "<div class=messageContent>"
				s += this.content()
			s += "</div>"
		s += "</div>"
		s += "<div class=messageDivider></div>"
		return s
	}

 	divString () {
		if (!this._divString) {
			this._divString = this.calcDivString()
		}
		return this._divString
	}
   
	cleanDict() {
		const dict = this._dict
		dict.subject = cleanString(dict.subject)
		if (!dict.date) { 
			dict.date = "" 
		}
		dict.date = cleanString(dict.date)
		dict.from = cleanString(dict.from)
		dict.content = cleanString(dict.content)



		var fromParts = dict.from.split(" &lt;")
		if (fromParts.length > 1) {
			dict.from = fromParts[0]
		}

		var fromParts = dict.from.split("@")
		if (fromParts.length > 1) {
			dict.from = fromParts[0]
		}


		var subjectParts = dict.subject.split("[Io] ")
		if (subjectParts.length > 1) {
			dict.subject = subjectParts[1]
		}

		subjectParts = dict.subject.split("[iolanguage] ")
		if (subjectParts.length > 1) {
			dict.subject = subjectParts[1]
		}

		subjectParts = dict.subject.split("Re: ")
		if (subjectParts.length > 1) {
			dict.subject = subjectParts[subjectParts.length -1]
		}

		subjectParts = dict.subject.split("Fwd: ")
		if (subjectParts.length > 1) {
			dict.subject = subjectParts[1]
		}

		if (dict.from.indexOf("Roberto A.") === 0) {
			console.log("dict.subject = '" + dict.subject + "'")
		}

		if (dict.subject === "" || dict.subject.trim().length === 0) {
			dict.subject = "[No Subject]"
			console.log("warning: no subject on message id ", dict.id)
		}

		return this
	}

	isValid() {
		const content = this.content()
		if (content.length === 0) { return false }
		if (content.length > 10000) { return false }
		if (content.indexOf("_NextPart_") !== -1) { return false }
		if (content.indexOf("Content-Transfer-Encoding: base64") !== -1) { return false }
		if (content.indexOf("Content-Type: text/html") !== -1) { return false }
		if (content.indexOf("redirect") !== -1) { return false }
		if (content.indexOf("subject") !== -1) { return false }
		return true
	}

	all () {
		return this.date() + " " + this.from() + " " + this.subject()
	}
}

// -------------------------------------------------------------------------------------


class MessageIndex {

	init () {
		this._indexes = new Map()
		return this
	}

	indexNames () {
		return IteratorAsArray(this._indexes.keys())
	}
	
	addMessage (msg) {
		msg.indexibleSlotNames().forEach(slotName => {
			this.addMessageToIndex(msg, slotName)
		})
		return this
	}

	mapForIndexName (indexName) {
		if (!this._indexes.has(indexName)) {
			this._indexes.set(indexName, new Map())
		}
		return this._indexes.get(indexName)
	}

	addMessageToIndex (msg, indexName) {
		const map = this.mapForIndexName(indexName)
		const k = msg[indexName].apply(msg)
		if (!map.has(k)) {
			if (k === null) {
				return this
			}
			map.set(k, [])
		}
		map.get(k).push(msg)
		return this
	}

	description () {
		let s = "MessageIndex:\n"
		this.indexNames().forEach(indexName => {
			const index = this._indexes.get(indexName)
			s += "   " + indexName + ":" + IteratorAsArray(index.keys()).length + "\n "
		})
		return s
	}

}

// -------------------------------------------------------------------------------------


class Mbox {

	init () {
		this._messages = []
		this._messageIndex = new MessageIndex().init()
		return this
	}

	messages () {
		return this._messages
	}

	setMessageDicts (msgDicts) {
		this._messages = msgDicts.map(msgDict => new MboxMessage().init().setDict(msgDict))
		//this.messages.filter(msg => msg.isValid())
		this.indexMessages()
		return this
	}

	indexMessages () {
		this._messages.forEach(msg => this._messageIndex.addMessage(msg))
		//console.log("indexed mbox ", this._messageIndex.description())
		return this
	}

	messageIndex () {
		return this._messageIndex
	}

}

// -------------------------------------------------------------------------------------

class View {

	static viewForId (id) {
		const e = document.getElementById(id)
		const view = new View().init()
		view._element = e
		return view
	}

	attachToElementId (id) {
		const e = document.getElementById(id)
		this._element = e
		return this
	}

	init () {
		this._name = ""
		this._subviews = []
		this._parentView = null
		this._isSelected = false
		this._target = null
		this._action = null
		return this
	}

	setInfo(dict) {
		this._info = dict
		return this
	}

	setClassName (aClassName) {
		this.element().className = aClassName
		return this
	}

	setName (aName) {
		this._name = aName
		this.element().innerHTML = aName
		return this
	}

	addToElementWithId (id) {
		const e = document.getElementById(id);
		e.appendChild(this.element())
		return this
	}

	name () {
		return this._name
	}

	addSubview (aView) {
		this._subviews.push(aView)
		this.element().appendChild(aView.element())
		return this
	}

	subviews() {
		return this._subviews
	}
	
	setParentView (aView) {
		this._parentView = aView
		return this
	}

	parentView () {
		return this._parentView
	}

	newSubview () {
		const aView = (new this.constructor).init().setParentView(this)
		this.addSubview(aView)
		return aView
	}

	makeElement () {
		const e = document.createElement("div")
		e.className = "menuItem"
		e.innerHTML = name
		const self = this
		e.onclick = function(event) { self.onClick(event) }
		return e
	}

	element() {
		if (!this._element) {
			this._element = this.makeElement()
		}
		return this._element
	}

	onClick (event) {
		//this.select()

		//console.log("view.onClick ", this.name() )
		//this.unselectSiblings()
		
		if (this._target && this._action) {
			this._target[this._action].apply(this._target, [this])
		}

		return this
	}

	setTarget(aTarget) {
		this._target = aTarget
		return this
	}

	setAction(methodName) {
		this._action = methodName
		return this
	}

	unselectSiblings () {
		this.siblings().forEach(v => v.unselect())
		return this
	}

	siblings () {
		if (this.parentView()) {
			return this.parentView().subviews().slice().filter(v => v !== this)
		}
		return []
	}

	didClick() {
		//console.log("view.didClick ", this.name() )
		return this
	}

	unselect () {
		this.element().style.fontWeight = "normal"
		this.element().style.color = "#aaa"
		return this
	}

	select () {
		this.element().style.fontWeight = "bold"
		this.element().style.color = "#fff"
		return this
	}

	setInnerHTML (s) {
		this.element().innerHTML = s
		return this
	}

	innerHTML () {
		return this.element().innerHTML
	}

	clear () {
		this.setInnerHTML("")
		this._subviews = [] // should removeSubview instead
		return this
	}

}

// ----------------------------------------------------------

class PathView extends View {

	init () {
		super.init()
		this._items = []
		return this
	}

	addItemNamed (name) {
		const view = this.newSubview().setInnerHTML(" &#47; <div class=PathItemTitle>" + name + "</div> &nbsp;")
		view.element().style.width = "fit-content"
		view.setClassName("PathItem")
		return view
	}

}

// ----------------------------------------------------------

class PathItem extends View {

	init () {
		this._name = ""
		return this
	}

	element () {
		const e = document.createElement("div")
		e.className = "PathItem"
		e.innerHTML = this.name()
	}
}

// ----------------------------------------------------------

class MenuView extends View {

	init () {
		return this
	}


}


// ----------------------------------------------------------

class MenuItemView extends View {

	init () {
		return this
	}

}

class MessagesView extends View {

}


var mbox = null

class App {

	init () {
		return this
	}

	run () {
		this._pathView = new PathView().init().attachToElementId("pathView") //.addItemNamed("Xxx")
		this._messagesView = MessagesView.viewForId("messagesView")

		mbox = new Mbox().init().setMessageDicts(archive)
				this._messageIndex = mbox.messageIndex()
		this.openRoot()
	}

	openRoot () {
		this._pathView.clear()
		this._pathView.addItemNamed("mailing list archive").setTarget(app).setAction("openRoot")

		this._messagesView.clear()

		this._messageIndex.indexNames().forEach(indexName => {
			const index = this._messageIndex.mapForIndexName(indexName)
			const view = this._messagesView.newSubview().setInnerHTML("<div class=name>" + indexName + "</div>\n<div class=comment>" + "" + "</div>")
			view.setClassName("entry")
			view.setTarget(app)
			view.setAction("clickedIndex")
			view._info = {
				indexName: indexName,
			}
		})
	}

	clickedIndex (indexView) {

		const indexName = indexView._info.indexName

		this._pathView.clear()
		this._pathView.addItemNamed("mailing list archive").setTarget(app).setAction("openRoot")
		this._pathView.addItemNamed(indexName)

		const index = this._messageIndex.mapForIndexName(indexName)
		this._messagesView.clear()
		var keys = IteratorAsArray(index.keys())
		if (indexName !== "year") {
			keys = keys.sort((k1, k2) => { return index.get(k1).length - index.get(k2).length } )
			keys.reverse()
		}

		keys.forEach(key => {
			const subindex = index.get(key)
			const itemCount = subindex.length
			const view = this._messagesView.newSubview().setInnerHTML("<div class=name>" + key + "</div>\n<div class=comment>" + itemCount + " messages</div>")
			view.setClassName("entry")
			view.element().style.width = "40em"
			view.element().style.paddingTop = "0.3em"
			view.setTarget(app)
			view.setAction("clickedSubindex")
			view.element().style.display = "block"
			//view.element().style.whiteSpace = "pre-wrap"

			view._info = {
				items: IteratorAsArray(subindex.values()),
				//subindex: subindex,
				//index: index,
				indexName: indexName,
				subindexName: key,
			}


		})

	}

	clickedSubindex (view) {
		const indexName = view._info.indexName
		const subindexName = view._info.subindexName
		
		//console.log("clickedSubindex ", subindexName)
		this._pathView.clear()
		this._pathView.addItemNamed("mailing list archive").setTarget(app).setAction("openRoot")
		this._pathView.addItemNamed(indexName).setTarget(app).setAction("clickedIndex").setInfo({ indexName: indexName })
		this._pathView.addItemNamed(subindexName).setTarget(app).setAction("clickedSubindex").setInfo({ indexName: indexName, subindexName: subindexName })

		this._messagesView.element().style.opacity = 0.0
		this._messagesView.element().style.transition = "opacity 2s"
		this._messagesView.clear()
		this.scrollToTop()

		setTimeout(() => {
			const s = view._info.items.map(item => item.divString()).join("")
			this._messagesView.setInnerHTML(s)
			this._messagesView.element().style.opacity = 1
		}, 100)
	}

	scrollToTop () {
		setTimeout(() => {
			window.scroll({
				top: 0, 
				left: 0, 
				behavior: 'auto'
			})
		}, 100)
	}
}

var app = null

document.addEventListener("DOMContentLoaded", function() {
	app = new App().init()
	app.run()
})



