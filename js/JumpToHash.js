
	var blackout = null;
	var blackoutPeriod = .2;
	
	function addBlackout() {
	    if (blackout) { 
	        return; 
	    }
	    
	    var div = document.createElement("div");
        div.className = "blackout"
        div.style.zIndex = "10";
        div.style.height = "100vh";
        div.style.width = "100%";
        div.style.background = "black";
        div.style.position = "fixed";
        div.style.top = 0;
        div.style.left = 0;
        div.style.opacity = 0;
        div.innerHTML = "";
        div.style.animation = "fadein " + blackoutPeriod + "s";
        div.style.animationTimingFunction = "ease-in-out";
        document.body.appendChild(div);	
        blackout = div;    
	}
	
	function removeBlackout() {
	    var rate = 3
        blackout.style.animation = "fadeout " + blackoutPeriod*rate + "s";
            setTimeout(function () {
                document.body.removeChild(blackout);
                blackout = null	    
	        }, blackoutPeriod*1000*rate);
	}
	
	function jumpto(hash) {
            addBlackout()
            
            setTimeout(function () {
	            window.location = hash;
	            removeBlackout()
	        }, blackoutPeriod*1000);
	        
	    //console.log("jumpto: " + hash)
	}
	
	window.onload = function() {
        var anchors = document.getElementsByTagName('a');
        for(var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            var url = anchor.getAttribute('href', 2)
            if (url && url[0] == "#") {
                anchor.onclick = null;
                anchor.onclick = function() {
                    jumpto(this.getAttribute('href', 2));
                    return false
                }
            }
        }
    }
	