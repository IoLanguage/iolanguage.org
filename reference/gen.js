var fs = require('fs');
var categories = JSON.parse(fs.readFileSync('docs.json', 'utf8'));

// format is: Category / Package / Class / slots / slotName : slotValue

function keysForDict(dict) {
    var keys = [];
    for (var key in dict) {
      if (dict.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys
}

var output = ""
output += "<div class='docs'>\n"
output += "\n"

/* --- index ------------------------------------------------------------------- */

output += "<div class='index leftSpace'>"
output += "<div class='indexColumns'>"

var catOutput = ""
var indexOutput = ""

var catKeys = keysForDict(categories).sort()

catOutput += "<div class='categoryIndexName'>" + "Categories" + "</div>\n"

for (var h = 0; h < catKeys.length; h++) {
    var catKey = catKeys[h]
    catOutput += "<div class='classIndex'>\n" // package
    catOutput += "<a href='#" + catKey +"'>"
    catOutput += "<div class='classIndexName'>" + catKey + "</div>\n"
    catOutput += "</a>\n"        
    catOutput += "</div>\n" // end class        
}

catOutput += "<br><br><br><br>"
//output += catOutput

for (var h = 0; h < catKeys.length; h++) {
    var catKey = catKeys[h]
    var cat = categories[catKey]
    indexOutput += "<div class='categoryIndex'>\n" // category
    indexOutput += "<a name='" + catKey + "'></a>\n"
    indexOutput += "<div class='categoryIndexName'>" + catKey + "</div>\n"
    indexOutput += "<div class='categoryItems'>" // categoryItems

    var packageKeys = keysForDict(cat).sort()
    for (var i = 0; i < packageKeys.length; i++) {
        var packageKey = packageKeys[i]
        var aPackage = cat[packageKey]
        var classKeys = keysForDict(aPackage).sort()
        
        //var singleton = classKeys.length == 1 && classKeys[0] == packageKey

        indexOutput += "<div class='packageIndex'>\n" // package
        indexOutput += "<div class='packageIndexName'>" + packageKey + "</div>\n"
        indexOutput += "<div class='packageItemsIndex'>" // packageItems  

        //if (!singleton) {
            for (var j = 0; j < classKeys.length; j++) {
                var classKey = classKeys[j]
                var aClass = aPackage[classKey]

                indexOutput += "<div class='classIndex'>\n" // class
                indexOutput += "<a href='#" + packageKey + "." + classKey + "'>"
                indexOutput += "<div class='classIndexName'>" + classKey + "</div>\n"
                indexOutput += "</div>\n" // end class        
                indexOutput += "</a>\n"        
            }
        //}
        indexOutput += "</div>\n" // end packageItems       
        indexOutput += "</div>\n" // end package        
    }
    
    indexOutput += "</div>\n" // end categoryItems        
    indexOutput += "</div>\n" // end category        
}
indexOutput += "</div>" // end indexColumns
indexOutput += "</div>" // end index
output += indexOutput





/* ---------------------------------------------------------------------------- */

output += "<div class='categories'>"

var catKeys = keysForDict(categories).sort()

for (var h = 0; h < catKeys.length; h++) {
    var catKey = catKeys[h]
    var cat = categories[catKey]
    output += "<div class='category'>\n"
    output += "<div class='categoryName'>" + catKey + "</div>\n"
    
    var packageKeys = keysForDict(cat).sort()
    for (var i = 0; i < packageKeys.length; i++) {
        var packageKey = packageKeys[i]
        var aPackage = cat[packageKey]

        output += "<div class='package'>\n"
        output += "<div class='packageName'>" + packageKey + "</div>\n"        

        var classKeys = keysForDict(aPackage).sort()
        for (var j = 0; j < classKeys.length; j++) {
            var classKey = classKeys[j]
            var aClass = aPackage[classKey]
            
            output += "<a name='" + packageKey + "." + classKey + "'></a>\n"
            output += "<div class='class'>\n"
            output += "<div class='className'>" + classKey + "</div>\n"     
            
            if (aClass.description) {
                output += "<div class='classDescription'>" + aClass.description + "</div>\n"     
            }
            
            if (aClass.slots) {   
                //output += "slot count " + aClass.slots.length
            
                var slotKeys = keysForDict(aClass.slots).sort()
                for (var k = 0; k < slotKeys.length; k++) {
                    var slotKey = slotKeys[k]
                    var slotValue = aClass.slots[slotKey]

                    output += "<div class='slot'>\n"
                    output += "<div class='slotName'>" + slotKey + "</div>\n"        
                    output += "<div class='slotValue'>" + slotValue + "</div>\n"        
                    output += "</div>\n" // end slot        
                }             
            }
            output += "</div>\n" // end class        
        }                
        output += "</div>\n" // end package        
    }
    
    output += "</div>\n" // end category
}

output += "</div>\n" // end categories
output += "</div>" // end docs

var header = fs.readFileSync('header.html', 'utf8');
var footer = fs.readFileSync('footer.html', 'utf8');

output = header + output + footer

fs.writeFile("index.html", output, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 