//"use strict";

var MyModule = {
  preRun: [],
  postRun: [],
  'printErr': function(text) { 
    console.log('stderr: ' + text) 
  },
  print: (function() {
    var element = document.getElementById('output');
    if (element) element.value = ''; // clear browser cache
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      // These replacements are necessary if you render to raw HTML
      text = text.replace(/&/g, "&amp;");
      text = text.replace(/</g, "&lt;");
      text = text.replace(/>/g, "&gt;");
      text = text.replace('\n', '<br>', 'g');
      console.log(text);
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
      IoRepl.shared().addOutput(text)
    };
  })(),
  canvas: (function() {
    var canvas = document.getElementById('canvas');
    // As a default initial behavior, pop up an alert when webgl context is lost. To make your
    // application robust, you may want to override this behavior before shipping!
    // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
    canvas.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);
    return canvas;
  })(),
  setStatus: function(text) {
    console.log("setStatus:", text);
    //IoRepl.shared().statusElement().innerHTML += "."
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    MyModule.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  },
  onRuntimeInitialized: function () {
    console.log("onRuntimeInitialized")
    clearTimeout(window.loadTimeout);
    window.loadTimeout = null;
    IoRepl.shared().run();
  }
};

const statusElement = document.getElementById('status');

window.loadTimeout = setTimeout(() => {
  if (MyModule._IoState_new == undefined) {
    console.log("loadTimeout")
    statusElement.style.color = "orange"
    statusElement.innerHTML = "Interpreter failed to load.<br>"
    if (window.safari !== undefined) {
      statusElement.innerHTML += "This may be an issue with the Safari web browser."
    }
  }
}, 10*1000)

import initModule from "./iovm.js";
initModule(MyModule);

/*
const m = initModule(MyModule);
if (m) { 
  //debugger;
  m.then((Module) => {
    console.log("after then has Module._IoState_new:",  Module._IoState_new !== undefined)
    for (let [key, value] of Object.entries(Module)) {
      if (!MyModule.hasOwnProperty(key)) {
        MyModule[key] = Module[key]
      }
      //Module[key] = MyModule[key]
    }
    MyModule = Module
    //IoRepl.shared().run();
  })
}
*/



// ---------------------------------------------------------------------

/*
if (!window.chrome) {
  const e = document.getElementById('status');
  e.innerHTML = "Sorry, this currently only works with the Chrome browser."
  e.style.color = "orange"
}
*/

(class IoRepl extends Base {
  initPrototype () {
    this.newSlot("ioState", null)
    this.newSlot("isEvaling", false)
    this.newSlot("history", null)
    this.newSlot("historyIndex", 0)
  }

  init () {
      super.init()
      this.setHistory([])
      this.setIoState(this.newIoState())
      this.inputElement().addEventListener("keydown", (event) => { this.onKeyDown(event); })
      //this.inputElement().addEventListener("keyup", (event) => { this.onKeyUp(event); })
  }

  onKeyDown (event) {
    //console.log("down  ", event.keyCode, " meta: ", event.metaKey)

    const returnKeyCode = 13;
    const upArrowKeyCode = 38;
    const downArrowKeyCode = 40;
    const kKeyCode = 75;

    if (event.keyCode == returnKeyCode && event.metaKey) {
      this.onInput()
      this.clearInput()
      event.preventDefault()
    }

    if (event.keyCode == upArrowKeyCode && event.metaKey) {
      this.onCommandUpArrowKey(event)
    }

    if (event.keyCode == downArrowKeyCode && event.metaKey) {
      this.onCommandDownArrowKey(event)
    }

    if (event.keyCode == kKeyCode && !event.shiftKey && event.metaKey) {
      this.clearInput()
    }

    if (event.keyCode == kKeyCode && event.shiftKey && event.metaKey) {
      this.clearOutput()
    }

    this.textAreaAdjust()
  }

  outputElement () {
    return document.getElementById('output');
  }

  inputElement () {
    return document.getElementById('input');
  }

  statusElement () {
    return document.getElementById('status');
  }

  replElement () {
    return document.getElementById('repl');
  }

  resetIoState () {
    this.setIoState(this.newIoState())
  }

  newIoState () {
    this.cleanup()
    const ioState = MyModule._IoState_new()
    MyModule._IoState_init(ioState);
    return ioState
  }

  cleanup () {
    const ioState = this.ioState()
    if (ioState) {
      MyModule._IoState_free(ioState)
      this.setIoState(null)
    }
  }

  run () {
    this.statusElement().innerHTML = ""
    //this.statusElement().display = "none"
    this.replElement().style.opacity = 1
    this.replElement().style.animation = "fadein 2s"
    this.inputElement().value = '"Hello world!"'
    this.inputElement().focus()
  }

  onInput () {
    const s = this.inputElement().value
    //console.log("onInput:'" + s + "'")
    this.eval(s)
    //this.clearInput()
  }

  clearInput () {
    this.inputElement().value = ""
    //this.inputElement().focus()
  }

  clearOutput () {
    this.outputElement().innerHTML = ""
  }

  eval (jsString) {
    try {
      this.addResultElement(jsString)
      //const runString = jsString
      const runString = "(" + jsString + ") println"
      console.log("eval: ", runString)
      this.setIsEvaling(true)
      const ioState = this.ioState()
      const ioLobby = MyModule._IoState_lobby(ioState);    
      const cString = MyModule.allocateUTF8(runString); 
      const cLabel = MyModule.allocateUTF8("command line code"); 
      const result =  MyModule._IoState_on_doCString_withLabel_(ioState, ioLobby, cString, cLabel);
      MyModule._free(cString);
      MyModule._free(cLabel);
      this.setIsEvaling(false)
      //console.log("result:", result)
      window.scrollTo(0, document.body.scrollHeight);
      this.inputElement().focus()
    } catch (e) {
      this.addOutput("" + e)
      this.resetIoState()
    }
  }

  addInput (text) {
    this.outputElement().innerHTML += text + "<br>"
  }

  addOutput (text) {
    this.lastResultElement().innerHTML += text + '<br>';
  }

  addResultElement (text) {    
    const e = document.createElement('div')
    e.innerHTML = '<div class="replPair" style="animation:fadein 0.5s;">' + text + '<br><div class="resultcontainer"><div class="resultarrow">→</div><div class="result"></div></div></div><br>';
    this.outputElement().appendChild(e)
  }

  lastResultElement () {
    const resultElements = document.getElementsByClassName("result");
    if (resultElements.length) {
      return resultElements[resultElements.length-1]
    }
    return undefined
  }

  onSampleMenu (selectedOption) {
    this.inputElement().opacity = 0
    this.inputElement().value = ""
    this.inputElement().style.animation = ""
    setTimeout(() => {
      this.inputElement().value = selectedOption.value
      this.inputElement().opacity = 1
      this.inputElement().style.animation = "fadein 1s"
    }, 1)
  }

  textAreaAdjust () {
    const e = this.inputElement()
    e.style.height = "1px";
    e.style.height = (20 + e.scrollHeight)+"px";
  }

}.initThisClass());

// ---------------------------------------------------------------------

/*
void IoState_runCLI(IoState *self) {
printf("run CLI");
IoObject *result = IoState_on_doCString_withLabel_(
    self, self->lobby, "CLI run", "IoState_runCLI()");
IoObject *e = IoCoroutine_rawException(self->currentCoroutine);
printf("exited CLI with exception %p", (void *)e);

if (e != self->ioNil) {
    self->exitResult = -1;
} else if (!self->shouldExit && ISNUMBER(result)) {
    self->exitResult = CNUMBER(result);
}
}
*/
