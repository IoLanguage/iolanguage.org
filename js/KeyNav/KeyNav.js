

/* 
	This is a script to add key navigation to a page.
 	How it works:
	Find top element with keynav 

*/

//console.log("keynav run")

import {} from "./DomElementHelpers.js";

class KeyNav {

	init () {
		this._currentElement = null
		return this
	}

	setCurrentElement (e) {
		if (this._currentElement !== e) {
			this.hideSelection()
			this._currentElement = e
			this.showSelection()
		}
		return this
	}

	currentElement () {
		return this._currentElement
	}

	showSelection () {
		const e = this.currentElement()
		if (e) {
			if (!Element_isLink(e)) {
				e.style.borderLeft = "0.04em solid #996"
			}

			const hoverStyle = Element_hoverStyle(e)
			if (hoverStyle) {
				const hoverStyleDict = Style_getDict(hoverStyle)
				this._lastStyleDict = Style_getDict(e.style)
				Style_setDict(e.style, hoverStyleDict)
			}

			/*
			const newColor = Element_hoverColor(e) //"#aaaa33"
			if (newColor && e.style.color !== newColor) {
				this._lastColor = e.style.color
				e.style.color = newColor
			}
			*/
			if (!Element_isInViewport(e)) {
				e.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}
		}
		return e
	}

	hideSelection () {
		const e = this.currentElement()
		if (e) {
			if (!Element_isLink(e)) {
				e.style.borderLeft = "0.04em solid transparent"
			}

			if (this._lastStyleDict) {
				Style_setDict(e.style, this._lastStyleDict)
				this._lastStyleDict = null
			}

			/*
			if (this._lastColor || this._lastColor === "") {
				e.style.color = this._lastColor
				this._lastColor = null
			}
			*/
		}
		return this
	}

		selectorFunc () {
		const aFunc = (e) =>  { 
			if(e.className) {
				return e.className.split(" ").indexOf("KeyNav") !== -1 
			}
			return null
		}
		return aFunc
	}

	setup () {
		//console.log("KeyNav.setup()")
		const elements = document.getElementsByClassName("KeyNav");
		const e = elements[0]
		this.setCurrentElement(e)
	   	//console.log("first KeyNav element: ", e)
		this.startListening()
	   	return this
	}

	startListening () {
		document.addEventListener('keydown', (event) => { this.onKeyDown(event) });
		return this
	}

	onKeyDown (event) {
		const key = event.key;
		//console.log("key = ", key)
		const arrowNames = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Enter"]
		if (arrowNames.indexOf(key) !== -1) {
			const methodName = "on" + key
			const method = this[methodName]
			if (method) {
				method.apply(this, [event])
				event.preventDefault();
			}
		}
	}

	onEnter (event) {
		this.openCurrentElement()
	}

	openCurrentElement () {
		const e = this.currentElement()
		if (e && e.href) {
			//const source = location.toString().replace(location.search, "")
			//window.open(e.href + "?from=" + encodeURIComponent(source), "_top"); 
			window.open(e.href); 
			//e.click()
			//clickLink(e)
		}
	}

	// arrow key events

	selectorFunc () {
		const aFunc = (e) =>  { 
			if(e.className) {
				return e.className.split(" ").indexOf("KeyNav") !== -1 
			}
			return null
		}
		return aFunc
	}

	onArrowRight (event) {
		const currentElement = this.currentElement()
		if (currentElement) {
			const descendants = Element_detectDescendants(currentElement, this.selectorFunc())
			const e = descendants[0]
			if (e) {
				this.setCurrentElement(e)
			} else {
				const isCommandKey = event.metaKey
				if (isCommandKey) {
					this.openCurrentElement()
				} else {
					//this.onArrowDown(event)
				}
			}
		}
	}

	onArrowLeft (event) {
		const currentElement = this.currentElement()
		if (currentElement) {
			const e = Element_detectAncestor(currentElement, this.selectorFunc())
			if (e) {
				this.setCurrentElement(e)
			} else {
				this.goBack()
			}
		}
	}


	currentAncestor () {
		const currentElement = this.currentElement()
		if (currentElement) {
			const ancestor = Element_detectAncestor(currentElement, this.selectorFunc())
			return ancestor
		}
		return null
	}

	currentSiblings () {
		const ancestor = this.currentAncestor()
		if (ancestor) {
			const siblings = Element_detectDescendants(ancestor, this.selectorFunc())
			return siblings
		}
		return []
	}

	onArrowDown (event) {
		const siblings = this.currentSiblings()
		const i = siblings.indexOf(this.currentElement())
		if (i !== -1) {
			const nextIndex = i+1
			if (siblings.length > nextIndex) {
				const nextSibling = siblings[nextIndex]
				this.setCurrentElement(nextSibling)
			}
		}
	}

	onArrowUp (event) {
		const siblings = this.currentSiblings()
		const i = siblings.indexOf(this.currentElement())
		if (i !== -1) {
			const nextIndex = i-1
			if (nextIndex >= 0) {
				const nextSibling = siblings[nextIndex]
				this.setCurrentElement(nextSibling)
			}
		}
	}
	
	goBack () {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const from = urlParams.get('from')
		if (from) {
			window.open(decodeURIComponent(from), "_top"); 
		}
	}

}


window.addEventListener('load', (event) => {
    //window.keyNav = new KeyNav().init().setup()
});

//export default class KeyNav { }

