// quick and dirty test

var cleanDiv = document.createElement("div");


function cleanString(s) {
	if (!s) {
		return "null"
	}
	s = s.split("<").join("&lt;")
	s = s.split(">").join("&gt;")

	cleanDiv.innerHTML = s;
	s = cleanDiv.textContent || cleanDiv.innerText || "";

	return s
}

function cleanDate(s) {
	let d = s.split(" ")
	d.pop()
	d.pop()
	d = d.join(" ")
	return d
}

function addMenuItem(name) {
	const menu = document.getElementById("menu");

	var menuItem = document.createElement("div")
	menuItem.className = "menuItem"
	menuItem.innerHTML = name
	menuItem.onclick = function(event) {
		showMenuItem(this)
	}
	menu.appendChild(menuItem)
	return menuItem

}

function yearForMessage(message) {
	const parts = message.date.split(" ")
	if (parts.length === 6) {
		const year = parts[3]
		return year
	}
	return null
}

function assert(v) {
	if (!v) {
		throw new Error("assertation failed")
	}
} 

function setupMenu() {
	const menu = document.getElementById("menu");
	const years = new Map()
	archive.forEach((message) => {	
		if (!messageIsValid(message)) {
			return
		}

		const year = this.yearForMessage(message)
		if (year) {
			var menuItem = years.get(year)
			if (!menuItem) {
				menuItem = this.addMenuItem(year)
				menuItem._messages = []
				years.set(year, menuItem)
				//console.log(year, " menuItem._messages = ", menuItem._messages)
			}
			menuItem._messages.push(message)
			menuItem.data = 123
			//console.log(year, " menuItem._messages = ", menuItem._messages.length)

			assert(menuItem._messages.length > 0)
		}
	})
	
	//console.log("years: ", years.values())
}

function main() {
	this.setupMenu()
	return
}

function menuItems() {
	const menuItems = []
	const menu = document.getElementById("menu");
	for (let i = 0; i < menu.children.length; i++) {
		menuItems.push(menu.children[i])
	}
	return menuItems
}

function unselectMenuItems() {
	menuItems().forEach(menuItem => menuItem.className = "menuItem")
}

function showMenuItem(menuItem) {
	unselectMenuItems()
	menuItem.className = "menuItemSelected"
	const messagesElement = document.getElementById("messagesElement");
	messagesElement.style.opacity = 0.1
	setTimeout(() => showMenuItem2(menuItem), 10)
}

function messageIsValid(message) {
	if (message.content.length === 0) { return false }
	if (message.content.length > 10000) { return false }
	if (message.content.indexOf("_NextPart_") !== -1) { return false }
	if (message.content.indexOf("Content-Transfer-Encoding: base64") !== -1) { return false }
	if (message.content.indexOf("Content-Type: text/html") !== -1) { return false }
	if (message.content.indexOf("redirect") !== -1) { return false }
	if (message.content.indexOf("subject") !== -1) { return false }
	return true
}

function htmlForMessage(message) {
	if (!message.divString) {
		let s = ""
		s += "<div class=message>\n"
			s += "<div class=messageHeader>"
				s += "Subject: " + message.subject+ "\n"
				s += "From: " + message.from+ "\n"
				s += "Date: " + message.date + "\n"
			s += "</div>"
			s += "<div class=messageContent>"
				s += message.content 
			s += "</div>"
		s += "</div>"
		message.divString = s
	}
	return message.divString
}

function showMenuItem2(menuItem) {
	const messages = menuItem._messages
	const messagesElement = document.getElementById("messagesElement");
	//messagesElement.innerHTML = ""

	const divStrings = messages.map(msg => htmlForMessage(msg))
	messagesElement.style.opacity = 0.1

	setTimeout(() => finishUpdate(divStrings), 10)


	/*
	const newChildren = divStrings.map(divString => {
		const e = document.createElement("div")
		e.innerHTML = divString
		return e
	})

	setTimeout(() => renderChildren(newChildren), 0)
	*/
}

function finishUpdate(divStrings) {
	messagesElement.innerHTML = divStrings.join("\n")
	messagesElement.style.opacity = 1
}

function renderChildren(newChildren) {
	const messagesElement = document.getElementById("messagesElement");
	messagesElement.innerHTML = ""
	newChildren.forEach(e => messagesElement.appendChild(e))
	messagesElement.style.opacity = 1
}

function cleanArchive() {
	archive.forEach(msg => {
		msg.subject = cleanString(msg.subject)
		if (!msg.date) { 
			msg.date = "" 
		}
		msg.date = cleanString(msg.date)
		msg.from = cleanString(msg.from)
		msg.content = cleanString(msg.content)
		htmlForMessage(msg)
	})
}

document.addEventListener("DOMContentLoaded", function(){
	cleanArchive()
	main()
	showMenuItem(menuItems()[0])
})



