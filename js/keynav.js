

/* 
	This is a script to add key navigation to a page.
 	How it works:
	Find top element with keynav 

*/

class KeyNav {

	init () {
		return this
	}

	setup () {
		console.log("KeyNav.setup()")
		const elements = document.getElementsByClassName("KeyNav");
	   	console.log("first KeyNav element: ", elements[0])

		this.startListening()
	   	return this
	}

	startListening () {
		document.addEventListener('keydown', (event) => { this.onKeyDown(event) });
		return this
	}

	onKeyDown (event) {
		const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"

	}


}


window.addEventListener('load', (event) => {
    window.keyNav = new KeyNav().init().setup()

});

export default class KeyNav { }
