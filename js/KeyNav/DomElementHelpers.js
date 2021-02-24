"use strict"

/*

`   DomElement_...
`
    Helper functions for DOM elements.
    Mostly for use inside DomView.
    Not for general consumption as elements typically shouldn't be interacted with directly. 

*/


function getCssStyleForRule(rule) {
    var sheets = document.styleSheets;
    var slen = sheets.length;
    for(var i=0; i<slen; i++) {
        var rules = document.styleSheets[i].cssRules;
        var rlen = rules.length;
        for(var j=0; j<rlen; j++) {
            if(rules[j].selectorText == rule) {
                return rules[j].style;
            }
        }
    }
}


function getCssPropertyForRule(rule, prop) {
    var sheets = document.styleSheets;
    var slen = sheets.length;
    for(var i=0; i<slen; i++) {
        var rules = document.styleSheets[i].cssRules;
        var rlen = rules.length;
        for(var j=0; j<rlen; j++) {
            if(rules[j].selectorText == rule) {
                return rules[j].style[prop];
            }
        }
    }
}

window.Element_isInViewport = function (element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

window.Style_getDict = function (aStyle) {
    const dict = {}
    for (var k in aStyle) {
        if (aStyle.hasOwnProperty(k)) {
            const v = aStyle[k]
            //console.log(k + " : " + v)
            dict[k] = v
        }
    }
    return dict
}

window.Style_setDict = function (aStyle, aDict) {
    for (var k in aDict) {
        if (aDict.hasOwnProperty(k)) {
            const v = aDict[k]
            //console.log(k + " : " + v)
            try {
                if (k !== "0") {
                    aStyle[k] = v
                }
            } catch (e) {
                console.log(k + " " + typeof(k) + " : " + e)
            }
        }
    }
    return aStyle
}

window.Element_hoverStyle = function (anElement) {
    const cs = window.getComputedStyle(anElement, ':hover')
    const classNames = anElement.className.split(" ")
    for (let i = 0; i < classNames.length; i++) {
        const className = classNames[i]
        const name = "." + className + ':hover'
        const style = getCssStyleForRule(name);
        if (style) {
            return style
        }
    }

    return null
}

window.Element_hoverColor = function(anElement) {
    return Element_hoverProperty(anElement, "color")
}

window.Element_hoverBackgroundColor = function(anElement) {
    return Element_hoverProperty(anElement, "backgroundColor")
}

window.Element_hoverProperty = function(anElement, propertyName) {
    const cs = window.getComputedStyle(anElement, ':hover')
    const classNames = anElement.className.split(" ")
    for (let i = 0; i < classNames.length; i++) {
        const className = classNames[i]
        const name = "." + className + ':hover'
        const color = getCssPropertyForRule(name, propertyName);
        if (color) {
            return color
        }
    }

    return null
}

window.Element_isLink = function(anElement) {
    return anElement.tagName === "A"
}

window.Element_parentElement = function(anElement) {
    return anElement.parentElement
}

window.Element_childNodes = function(anElement) {
    return anElement.childNodes
}

window.Element_detectAncestor = function (anElement, aFunc) {
    const parent = anElement.parentElement
    if (parent) {
        if (aFunc.call(parent, parent)) {
            return parent
        }
        return Element_detectAncestor(parent, aFunc)
    }
    return null
}

window.Element_detectChild = function (anElement, aFunc) {
    const children = anElement.childNodes
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (aFunc.call(child, child)) {
            return child
        }
    }
    return null
}

window.Element_detectDescendant = function (anElement, aFunc) {
    const children = anElement.childNodes
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (aFunc.call(child, child)) {
            return child
        }
    }

    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const result = Element_detectDescendant(child, aFunc)
        if (result) {
            return result
        }
    }
    return null
}

window.Element_detectSelfOrDescendants = function (anElement, aFunc) {
    if (aFunc.call(anElement, anElement)) {
        return [anElement]
    }
    return Element_detectDescendants(anElement, aFunc)
}

window.Element_detectDescendants = function (anElement, aFunc) {
    let descendants = []
    const children = anElement.childNodes
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const ds = Element_detectSelfOrDescendants(child, aFunc)
        descendants = descendants.concat(ds)
    }

    return descendants
}

window.Element_detectNextSibling = function (anElement, aFunc) {
    const parent = anElement.parentElement
    if (parent) {
        if (aFunc.call(parent, parent)) {
            return parent
        }
        return Element_detectAncestor(parent, aFunc)
    }
    return null
}



window.DomElement_atInsertElement = function(el, index, child) {
    const children = el.children
    
    if (index < children.length) {
        el.insertBefore(child, children[index])
        return
    }
    
    if (index === children.length) {
        el.appendChild(child)
        return
    }
    
    throw new Error("invalid dom child index")
}

window.DomElement_description = function(element) {
    let s = false

    if (element === window) {
        s = "window"
    }

    if (!s) {
        s = element.getAttribute("id")
    }

    if (!s) {
        s = element.getAttribute("class")
    }

    if (!s) {
        s = element.tagName
    }

    return s
}

window.Element_setStyleIncludingDecendants = function(e, k, v) {
    if (e.style) {
        e.style[k] = v
    }
    
    for(let i = 0; i < e.childNodes.length; i ++) {
        const child = e.childNodes[i]
        Element_setStyleIncludingDecendants(child, k, v)
    }
}