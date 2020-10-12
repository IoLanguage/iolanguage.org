

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

function main() {
	const messagesElement = document.getElementById("messagesElement");
	
	//console.log("archive.length = " + archive.length)
	let i = 0
	archive.forEach((message) => {
		i ++
		if (message.content.length === 0) { return }
		if (message.content.length > 10000) { return }
		if (message.content.indexOf("_NextPart_") !== -1) { return }
		if (message.content.indexOf("Content-Transfer-Encoding: base64") !== -1) { return }
		if (message.content.indexOf("Content-Type: text/html") !== -1) { return }
		if (message.content.indexOf("redirect") !== -1) { return }
		if (message.content.indexOf("subject") !== -1) { return }
		//if (i > 657) { return }


		/*
		let s = ""
		s += "<div class=message>\n"
		s += "	<div class=header>\n"
		//if (message.id) {
		//	s += "	<a name='" + cleanString(message.id) + "'></a>\n"
		//	s += "	<div class=from>Id: " + cleanString(message.id) + "</div>\n"
		//}
		s += "		<div class=from>From: " + cleanString(message.from) + "</div>\n"
		s += "		<div class=subject>Subject: " + message.subject + "</div>\n"
		if (message.date) {
			s += "		<div class=date>Date: " + cleanDate(message.date) + "</div>\n"
		}
		s += "	</div>\n"
		
		s += "	<div class=content>" + message.content + "</div>\n"
		s += "</div>\n"
		*/

		let s = ""
		s += "<div class=message>\n"
		/*
		s += "	<div class=header>\n"
		//if (message.id) {
		//	s += "	<a name='" + cleanString(message.id) + "'></a>\n"
		//	s += "	<div class=from>Id: " + cleanString(message.id) + "</div>\n"
		//}
		s += "		<div class=from>From: " + cleanString(message.from) + "</div>\n"
		s += "		<div class=subject>Subject: " + message.subject + "</div>\n"
		if (message.date) {
			s += "		<div class=date>Date: " + cleanDate(message.date) + "</div>\n"
		}
		s += "	</div>\n"
		*/
		s += "<div class=content>" 
		s += "<div class=messageHeader>"
		//s += "<b>"
		s += "Subject: " + cleanString(message.subject) + "\n"
		s += "From: " + cleanString(message.from)+ "\n"
		if (message.date) {
			s += "Date: " + cleanString(message.date)+ "\n"
		}
		//s += "</b>"

		s += "</div>"
		s += "<div class=messageContent>"
		s += message.content 
		s += "</div>"
		s += "</div>"

		var e = document.createElement("div")
		e.innerHTML = s
		messagesElement.appendChild(e)
	})

	//console.log("messages.length = " + messages.length)

	//messagesElement.innerHTML = messages.join("<br>")
	
}

document.addEventListener("DOMContentLoaded", function(){
	main()
})



