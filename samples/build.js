

"use strict";

const fs = require('fs');
const path = require('path');

class BuildTutorial {

	run () {
		const folderName = "misc"
		const fileNames = fs.readdirSync(folderName, {})
		const dict = {}
		fileNames.forEach(fileName => {
			const filePath = path.join(folderName, fileName)
			const value = fs.readFileSync(filePath, "utf8")
			dict[fileName] = value
		})

		const jsonString = JSON.stringify(dict, 2, 2)
		fs.writeFileSync("samples.json", jsonString);
	}

}

new BuildTutorial().run()