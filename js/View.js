


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

export default class View { }
