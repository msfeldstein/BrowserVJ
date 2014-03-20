var dat=dat||{};dat.gui=dat.gui||{};dat.utils=dat.utils||{};dat.controllers=dat.controllers||{};dat.dom=dat.dom||{};dat.color=dat.color||{};dat.utils.css=function(){return{load:function(e,a){a=a||document;var b=a.createElement("link");b.type="text/css";b.rel="stylesheet";b.href=e;a.getElementsByTagName("head")[0].appendChild(b)},inject:function(e,a){a=a||document;var b=document.createElement("style");b.type="text/css";b.innerHTML=e;a.getElementsByTagName("head")[0].appendChild(b)}}}();
dat.utils.common=function(){var e=Array.prototype.forEach,a=Array.prototype.slice;return{BREAK:{},extend:function(b){this.each(a.call(arguments,1),function(a){for(var f in a)this.isUndefined(a[f])||(b[f]=a[f])},this);return b},defaults:function(b){this.each(a.call(arguments,1),function(a){for(var f in a)this.isUndefined(b[f])&&(b[f]=a[f])},this);return b},compose:function(){var b=a.call(arguments);return function(){for(var d=a.call(arguments),f=b.length-1;0<=f;f--)d=[b[f].apply(this,d)];return d[0]}},
each:function(a,d,f){if(e&&a.forEach===e)a.forEach(d,f);else if(a.length===a.length+0)for(var c=0,p=a.length;c<p&&!(c in a&&d.call(f,a[c],c)===this.BREAK);c++);else for(c in a)if(d.call(f,a[c],c)===this.BREAK)break},defer:function(a){setTimeout(a,0)},toArray:function(b){return b.toArray?b.toArray():a.call(b)},isUndefined:function(a){return void 0===a},isNull:function(a){return null===a},isNaN:function(a){return a!==a},isArray:Array.isArray||function(a){return a.constructor===Array},isObject:function(a){return a===
Object(a)},isNumber:function(a){return a===a+0},isString:function(a){return a===a+""},isBoolean:function(a){return!1===a||!0===a},isFunction:function(a){return"[object Function]"===Object.prototype.toString.call(a)}}}();
dat.controllers.Controller=function(e){var a=function(a,d){this.initialValue=a[d];this.domElement=document.createElement("div");this.object=a;this.property=d;this.__onFinishChange=this.__onChange=void 0};e.extend(a.prototype,{onChange:function(a){this.__onChange=a;return this},onFinishChange:function(a){this.__onFinishChange=a;return this},setValue:function(a){this.object[this.property]=a;this.__onChange&&this.__onChange.call(this,a);this.updateDisplay();return this},getValue:function(){return this.object[this.property]},
updateDisplay:function(){return this},isModified:function(){return this.initialValue!==this.getValue()}});return a}(dat.utils.common);
dat.dom.dom=function(e){function a(c){if("0"===c||e.isUndefined(c))return 0;c=c.match(d);return e.isNull(c)?0:parseFloat(c[1])}var b={};e.each({HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},function(c,a){e.each(c,function(c){b[c]=a})});var d=/(\d+(\.\d+)?)px/,f={makeSelectable:function(c,a){void 0!==c&&void 0!==c.style&&(c.onselectstart=a?function(){return!1}:function(){},c.style.MozUserSelect=a?"auto":"none",c.style.KhtmlUserSelect=
a?"auto":"none",c.unselectable=a?"on":"off")},makeFullscreen:function(c,a,d){e.isUndefined(a)&&(a=!0);e.isUndefined(d)&&(d=!0);c.style.position="absolute";a&&(c.style.left=0,c.style.right=0);d&&(c.style.top=0,c.style.bottom=0)},fakeEvent:function(c,a,d,f){d=d||{};var q=b[a];if(!q)throw Error("Event type "+a+" not supported.");var n=document.createEvent(q);switch(q){case "MouseEvents":n.initMouseEvent(a,d.bubbles||!1,d.cancelable||!0,window,d.clickCount||1,0,0,d.x||d.clientX||0,d.y||d.clientY||0,!1,
!1,!1,!1,0,null);break;case "KeyboardEvents":q=n.initKeyboardEvent||n.initKeyEvent;e.defaults(d,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0});q(a,d.bubbles||!1,d.cancelable,window,d.ctrlKey,d.altKey,d.shiftKey,d.metaKey,d.keyCode,d.charCode);break;default:n.initEvent(a,d.bubbles||!1,d.cancelable||!0)}e.defaults(n,f);c.dispatchEvent(n)},bind:function(c,a,d,b){c.addEventListener?c.addEventListener(a,d,b||!1):c.attachEvent&&c.attachEvent("on"+a,d);return f},
unbind:function(c,a,d,b){c.removeEventListener?c.removeEventListener(a,d,b||!1):c.detachEvent&&c.detachEvent("on"+a,d);return f},addClass:function(a,d){if(void 0===a.className)a.className=d;else if(a.className!==d){var b=a.className.split(/ +/);-1==b.indexOf(d)&&(b.push(d),a.className=b.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return f},removeClass:function(a,d){if(d){if(void 0!==a.className)if(a.className===d)a.removeAttribute("class");else{var b=a.className.split(/ +/),e=b.indexOf(d);-1!=
e&&(b.splice(e,1),a.className=b.join(" "))}}else a.className=void 0;return f},hasClass:function(a,d){return RegExp("(?:^|\\s+)"+d+"(?:\\s+|$)").test(a.className)||!1},getWidth:function(c){c=getComputedStyle(c);return a(c["border-left-width"])+a(c["border-right-width"])+a(c["padding-left"])+a(c["padding-right"])+a(c.width)},getHeight:function(c){c=getComputedStyle(c);return a(c["border-top-width"])+a(c["border-bottom-width"])+a(c["padding-top"])+a(c["padding-bottom"])+a(c.height)},getOffset:function(a){var d=
{left:0,top:0};if(a.offsetParent){do d.left+=a.offsetLeft,d.top+=a.offsetTop;while(a=a.offsetParent)}return d},isActive:function(a){return a===document.activeElement&&(a.type||a.href)}};return f}(dat.utils.common);
dat.controllers.OptionController=function(e,a,b){var d=function(f,c,e){d.superclass.call(this,f,c);var k=this;this.__select=document.createElement("select");if(b.isArray(e)){var l={};b.each(e,function(a){l[a]=a});e=l}b.each(e,function(a,c){var d=document.createElement("option");d.innerHTML=c;d.setAttribute("value",a);k.__select.appendChild(d)});this.updateDisplay();a.bind(this.__select,"change",function(){k.setValue(this.options[this.selectedIndex].value)});this.domElement.appendChild(this.__select)};
d.superclass=e;b.extend(d.prototype,e.prototype,{setValue:function(a){a=d.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue());return a},updateDisplay:function(){this.__select.value=this.getValue();return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.controllers.NumberController=function(e,a){var b=function(d,f,c){b.superclass.call(this,d,f);c=c||{};this.__min=c.min;this.__max=c.max;this.__step=c.step;a.isUndefined(this.__step)?this.__impliedStep=0==this.initialValue?1:Math.pow(10,Math.floor(Math.log(this.initialValue)/Math.LN10))/10:this.__impliedStep=this.__step;d=this.__impliedStep;d=d.toString();d=-1<d.indexOf(".")?d.length-d.indexOf(".")-1:0;this.__precision=d};b.superclass=e;a.extend(b.prototype,e.prototype,{setValue:function(a){void 0!==
this.__min&&a<this.__min?a=this.__min:void 0!==this.__max&&a>this.__max&&(a=this.__max);void 0!==this.__step&&0!=a%this.__step&&(a=Math.round(a/this.__step)*this.__step);return b.superclass.prototype.setValue.call(this,a)},min:function(a){this.__min=a;return this},max:function(a){this.__max=a;return this},step:function(a){this.__step=a;return this}});return b}(dat.controllers.Controller,dat.utils.common);
dat.controllers.NumberControllerBox=function(e,a,b){var d=function(f,c,e){function k(){var a=parseFloat(n.__input.value);b.isNaN(a)||n.setValue(a)}function l(a){var c=r-a.clientY;n.setValue(n.getValue()+c*n.__impliedStep);r=a.clientY}function q(){a.unbind(window,"mousemove",l);a.unbind(window,"mouseup",q)}this.__truncationSuspended=!1;d.superclass.call(this,f,c,e);var n=this,r;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"change",k);a.bind(this.__input,
"blur",function(){k();n.__onFinishChange&&n.__onFinishChange.call(n,n.getValue())});a.bind(this.__input,"mousedown",function(c){a.bind(window,"mousemove",l);a.bind(window,"mouseup",q);r=c.clientY});a.bind(this.__input,"keydown",function(a){13===a.keyCode&&(n.__truncationSuspended=!0,this.blur(),n.__truncationSuspended=!1)});this.updateDisplay();this.domElement.appendChild(this.__input)};d.superclass=e;b.extend(d.prototype,e.prototype,{updateDisplay:function(){var a=this.__input,c;if(this.__truncationSuspended)c=
this.getValue();else{c=this.getValue();var b=Math.pow(10,this.__precision);c=Math.round(c*b)/b}a.value=c;return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.NumberController,dat.dom.dom,dat.utils.common);
dat.controllers.NumberControllerSlider=function(e,a,b,d,f){function c(a,c,d,b,f){return b+(a-c)/(d-c)*(f-b)}var p=function(d,b,f,e,r){function y(d){d.preventDefault();var b=a.getOffset(h.__background),f=a.getWidth(h.__background);h.setValue(c(d.clientX,b.left,b.left+f,h.__min,h.__max));return!1}function g(){a.unbind(window,"mousemove",y);a.unbind(window,"mouseup",g);h.__onFinishChange&&h.__onFinishChange.call(h,h.getValue())}p.superclass.call(this,d,b,{min:f,max:e,step:r});var h=this;this.__background=
document.createElement("div");this.__foreground=document.createElement("div");a.bind(this.__background,"mousedown",function(c){a.bind(window,"mousemove",y);a.bind(window,"mouseup",g);y(c)});a.addClass(this.__background,"slider");a.addClass(this.__foreground,"slider-fg");this.updateDisplay();this.__background.appendChild(this.__foreground);this.domElement.appendChild(this.__background)};p.superclass=e;p.useDefaultStyles=function(){b.inject(f)};d.extend(p.prototype,e.prototype,{updateDisplay:function(){var a=
(this.getValue()-this.__min)/(this.__max-this.__min);this.__foreground.style.width=100*a+"%";return p.superclass.prototype.updateDisplay.call(this)}});return p}(dat.controllers.NumberController,dat.dom.dom,dat.utils.css,dat.utils.common,"/**\n * dat-gui JavaScript Controller Library\n * http://code.google.com/p/dat-gui\n *\n * Copyright 2011 Data Arts Team, Google Creative Lab\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n */\n\n.slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");
dat.controllers.FunctionController=function(e,a,b){var d=function(b,c,e){d.superclass.call(this,b,c);var k=this;this.__button=document.createElement("div");this.__button.innerHTML=void 0===e?"Fire":e;a.bind(this.__button,"click",function(a){a.preventDefault();k.fire();return!1});a.addClass(this.__button,"button");this.domElement.appendChild(this.__button)};d.superclass=e;b.extend(d.prototype,e.prototype,{fire:function(){this.__onChange&&this.__onChange.call(this);this.__onFinishChange&&this.__onFinishChange.call(this,
this.getValue());this.getValue().call(this.object)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.controllers.BooleanController=function(e,a,b){var d=function(b,c){d.superclass.call(this,b,c);var e=this;this.__prev=this.getValue();this.__checkbox=document.createElement("input");this.__checkbox.setAttribute("type","checkbox");a.bind(this.__checkbox,"change",function(){e.setValue(!e.__prev)},!1);this.domElement.appendChild(this.__checkbox);this.updateDisplay()};d.superclass=e;b.extend(d.prototype,e.prototype,{setValue:function(a){a=d.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&
this.__onFinishChange.call(this,this.getValue());this.__prev=this.getValue();return a},updateDisplay:function(){!0===this.getValue()?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0):this.__checkbox.checked=!1;return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.color.toString=function(e){return function(a){if(1==a.a||e.isUndefined(a.a)){for(a=a.hex.toString(16);6>a.length;)a="0"+a;return"#"+a}return"rgba("+Math.round(a.r)+","+Math.round(a.g)+","+Math.round(a.b)+","+a.a+")"}}(dat.utils.common);
dat.color.interpret=function(e,a){var b,d,f=[{litmus:a.isString,conversions:{THREE_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return null===a?!1:{space:"HEX",hex:parseInt("0x"+a[1].toString()+a[1].toString()+a[2].toString()+a[2].toString()+a[3].toString()+a[3].toString())}},write:e},SIX_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9]{6})$/i);return null===a?!1:{space:"HEX",hex:parseInt("0x"+a[1].toString())}},write:e},CSS_RGB:{read:function(a){a=a.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
return null===a?!1:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3])}},write:e},CSS_RGBA:{read:function(a){a=a.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);return null===a?!1:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3]),a:parseFloat(a[4])}},write:e}}},{litmus:a.isNumber,conversions:{HEX:{read:function(a){return{space:"HEX",hex:a,conversionName:"HEX"}},write:function(a){return a.hex}}}},{litmus:a.isArray,conversions:{RGB_ARRAY:{read:function(a){return 3!=
a.length?!1:{space:"RGB",r:a[0],g:a[1],b:a[2]}},write:function(a){return[a.r,a.g,a.b]}},RGBA_ARRAY:{read:function(a){return 4!=a.length?!1:{space:"RGB",r:a[0],g:a[1],b:a[2],a:a[3]}},write:function(a){return[a.r,a.g,a.b,a.a]}}}},{litmus:a.isObject,conversions:{RGBA_OBJ:{read:function(c){return a.isNumber(c.r)&&a.isNumber(c.g)&&a.isNumber(c.b)&&a.isNumber(c.a)?{space:"RGB",r:c.r,g:c.g,b:c.b,a:c.a}:!1},write:function(a){return{r:a.r,g:a.g,b:a.b,a:a.a}}},RGB_OBJ:{read:function(c){return a.isNumber(c.r)&&
a.isNumber(c.g)&&a.isNumber(c.b)?{space:"RGB",r:c.r,g:c.g,b:c.b}:!1},write:function(a){return{r:a.r,g:a.g,b:a.b}}},HSVA_OBJ:{read:function(c){return a.isNumber(c.h)&&a.isNumber(c.s)&&a.isNumber(c.v)&&a.isNumber(c.a)?{space:"HSV",h:c.h,s:c.s,v:c.v,a:c.a}:!1},write:function(a){return{h:a.h,s:a.s,v:a.v,a:a.a}}},HSV_OBJ:{read:function(d){return a.isNumber(d.h)&&a.isNumber(d.s)&&a.isNumber(d.v)?{space:"HSV",h:d.h,s:d.s,v:d.v}:!1},write:function(a){return{h:a.h,s:a.s,v:a.v}}}}}];return function(){d=!1;
var c=1<arguments.length?a.toArray(arguments):arguments[0];a.each(f,function(e){if(e.litmus(c))return a.each(e.conversions,function(e,f){b=e.read(c);if(!1===d&&!1!==b)return d=b,b.conversionName=f,b.conversion=e,a.BREAK}),a.BREAK});return d}}(dat.color.toString,dat.utils.common);
dat.GUI=dat.gui.GUI=function(e,a,b,d,f,c,p,k,l,q,n,r,y,g,h){function t(a,c,b,e){if(void 0===c[b])throw Error("Object "+c+' has no property "'+b+'"');e.color?c=new n(c,b):(c=[c,b].concat(e.factoryArgs),c=d.apply(a,c));e.before instanceof f&&(e.before=e.before.__li);v(a,c);g.addClass(c.domElement,"c");b=document.createElement("span");g.addClass(b,"property-name");b.innerHTML=c.property;var q=document.createElement("div");q.appendChild(b);q.appendChild(c.domElement);e=u(a,q,e.before);g.addClass(e,m.CLASS_CONTROLLER_ROW);
g.addClass(e,typeof c.getValue());s(a,e,c);a.__controllers.push(c);return c}function u(a,d,c){var b=document.createElement("li");d&&b.appendChild(d);c?a.__ul.insertBefore(b,params.before):a.__ul.appendChild(b);a.onResize();return b}function s(a,d,b){b.__li=d;b.__gui=a;h.extend(b,{options:function(d){if(1<arguments.length)return b.remove(),t(a,b.object,b.property,{before:b.__li.nextElementSibling,factoryArgs:[h.toArray(arguments)]});if(h.isArray(d)||h.isObject(d))return b.remove(),t(a,b.object,b.property,
{before:b.__li.nextElementSibling,factoryArgs:[d]})},name:function(a){b.__li.firstElementChild.firstElementChild.innerHTML=a;return b},listen:function(){b.__gui.listen(b);return b},remove:function(){b.__gui.remove(b);return b}});if(b instanceof l){var e=new k(b.object,b.property,{min:b.__min,max:b.__max,step:b.__step});h.each(["updateDisplay","onChange","onFinishChange"],function(a){var d=b[a],J=e[a];b[a]=e[a]=function(){var a=Array.prototype.slice.call(arguments);d.apply(b,a);return J.apply(e,a)}});
g.addClass(d,"has-slider");b.domElement.insertBefore(e.domElement,b.domElement.firstElementChild)}else if(b instanceof k){var f=function(d){return h.isNumber(b.__min)&&h.isNumber(b.__max)?(b.remove(),t(a,b.object,b.property,{before:b.__li.nextElementSibling,factoryArgs:[b.__min,b.__max,b.__step]})):d};b.min=h.compose(f,b.min);b.max=h.compose(f,b.max)}else b instanceof c?(g.bind(d,"click",function(){g.fakeEvent(b.__checkbox,"click")}),g.bind(b.__checkbox,"click",function(a){a.stopPropagation()})):
b instanceof p?(g.bind(d,"click",function(){g.fakeEvent(b.__button,"click")}),g.bind(d,"mouseover",function(){g.addClass(b.__button,"hover")}),g.bind(d,"mouseout",function(){g.removeClass(b.__button,"hover")})):b instanceof n&&(g.addClass(d,"color"),b.updateDisplay=h.compose(function(a){d.style.borderLeftColor=b.__color.toString();return a},b.updateDisplay),b.updateDisplay());b.setValue=h.compose(function(d){a.getRoot().__preset_select&&b.isModified()&&D(a.getRoot(),!0);return d},b.setValue)}function v(a,
d){var b=a.getRoot(),c=b.__rememberedObjects.indexOf(d.object);if(-1!=c){var e=b.__rememberedObjectIndecesToControllers[c];void 0===e&&(e={},b.__rememberedObjectIndecesToControllers[c]=e);e[d.property]=d;if(b.load&&b.load.remembered){b=b.load.remembered;if(b[a.preset])b=b[a.preset];else if(b[z])b=b[z];else return;b[c]&&void 0!==b[c][d.property]&&(c=b[c][d.property],d.initialValue=c,d.setValue(c))}}}function K(a){var b=a.__save_row=document.createElement("li");g.addClass(a.domElement,"has-save");a.__ul.insertBefore(b,
a.__ul.firstChild);g.addClass(b,"save-row");var d=document.createElement("span");d.innerHTML="&nbsp;";g.addClass(d,"button gears");var c=document.createElement("span");c.innerHTML="Save";g.addClass(c,"button");g.addClass(c,"save");var e=document.createElement("span");e.innerHTML="New";g.addClass(e,"button");g.addClass(e,"save-as");var f=document.createElement("span");f.innerHTML="Revert";g.addClass(f,"button");g.addClass(f,"revert");var q=a.__preset_select=document.createElement("select");a.load&&
a.load.remembered?h.each(a.load.remembered,function(b,d){E(a,d,d==a.preset)}):E(a,z,!1);g.bind(q,"change",function(){for(var b=0;b<a.__preset_select.length;b++)a.__preset_select[b].innerHTML=a.__preset_select[b].value;a.preset=this.value});b.appendChild(q);b.appendChild(d);b.appendChild(c);b.appendChild(e);b.appendChild(f);if(w){var b=document.getElementById("dg-save-locally"),n=document.getElementById("dg-local-explain");b.style.display="block";b=document.getElementById("dg-local-storage");"true"===
localStorage.getItem(document.location.href+".isLocal")&&b.setAttribute("checked","checked");var k=function(){n.style.display=a.useLocalStorage?"block":"none"};k();g.bind(b,"change",function(){a.useLocalStorage=!a.useLocalStorage;k()})}var r=document.getElementById("dg-new-constructor");g.bind(r,"keydown",function(a){!a.metaKey||67!==a.which&&67!=a.keyCode||A.hide()});g.bind(d,"click",function(){r.innerHTML=JSON.stringify(a.getSaveObject(),void 0,2);A.show();r.focus();r.select()});g.bind(c,"click",
function(){a.save()});g.bind(e,"click",function(){var b=prompt("Enter a new preset name.");b&&a.saveAs(b)});g.bind(f,"click",function(){a.revert()})}function L(a){function b(f){f.preventDefault();e=f.clientX;g.addClass(a.__closeButton,m.CLASS_DRAG);g.bind(window,"mousemove",d);g.bind(window,"mouseup",c);return!1}function d(b){b.preventDefault();a.width+=e-b.clientX;a.onResize();e=b.clientX;return!1}function c(){g.removeClass(a.__closeButton,m.CLASS_DRAG);g.unbind(window,"mousemove",d);g.unbind(window,
"mouseup",c)}a.__resize_handle=document.createElement("div");h.extend(a.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});var e;g.bind(a.__resize_handle,"mousedown",b);g.bind(a.__closeButton,"mousedown",b);a.domElement.insertBefore(a.__resize_handle,a.domElement.firstElementChild)}function F(a,b){a.domElement.style.width=b+"px";a.__save_row&&a.autoPlace&&(a.__save_row.style.width=b+"px");a.__closeButton&&(a.__closeButton.style.width=b+"px")}
function B(a,b){var d={};h.each(a.__rememberedObjects,function(c,e){var f={};h.each(a.__rememberedObjectIndecesToControllers[e],function(a,d){f[d]=b?a.initialValue:a.getValue()});d[e]=f});return d}function E(a,b,d){var c=document.createElement("option");c.innerHTML=b;c.value=b;a.__preset_select.appendChild(c);d&&(a.__preset_select.selectedIndex=a.__preset_select.length-1)}function D(a,b){var d=a.__preset_select[a.__preset_select.selectedIndex];d.innerHTML=b?d.value+"*":d.value}function G(a){0!=a.length&&
r(function(){G(a)});h.each(a,function(a){a.updateDisplay()})}e.inject(b);var z="Default",w;try{w="localStorage"in window&&null!==window.localStorage}catch(M){w=!1}var A,H=!0,x,C=!1,I=[],m=function(a){function b(){localStorage.setItem(document.location.href+".gui",JSON.stringify(c.getSaveObject()))}function d(){var a=c.getRoot();a.width+=1;h.defer(function(){a.width-=1})}var c=this;this.domElement=document.createElement("div");this.__ul=document.createElement("ul");this.domElement.appendChild(this.__ul);
g.addClass(this.domElement,"dg");this.__folders={};this.__controllers=[];this.__rememberedObjects=[];this.__rememberedObjectIndecesToControllers=[];this.__listening=[];a=a||{};a=h.defaults(a,{autoPlace:!0,width:m.DEFAULT_WIDTH});a=h.defaults(a,{resizable:a.autoPlace,hideable:a.autoPlace});h.isUndefined(a.load)?a.load={preset:z}:a.preset&&(a.load.preset=a.preset);h.isUndefined(a.parent)&&a.hideable&&I.push(this);a.resizable=h.isUndefined(a.parent)&&a.resizable;a.autoPlace&&h.isUndefined(a.scrollable)&&
(a.scrollable=!0);var e=w&&"true"===localStorage.getItem(document.location.href+".isLocal");Object.defineProperties(this,{parent:{get:function(){return a.parent}},scrollable:{get:function(){return a.scrollable}},autoPlace:{get:function(){return a.autoPlace}},preset:{get:function(){return c.parent?c.getRoot().preset:a.load.preset},set:function(b){c.parent?c.getRoot().preset=b:a.load.preset=b;for(b=0;b<this.__preset_select.length;b++)this.__preset_select[b].value==this.preset&&(this.__preset_select.selectedIndex=
b);c.revert()}},width:{get:function(){return a.width},set:function(b){a.width=b;F(c,b)}},name:{get:function(){return a.name},set:function(b){a.name=b;q&&(q.innerHTML=a.name)}},closed:{get:function(){return a.closed},set:function(b){a.closed=b;a.closed?g.addClass(c.__ul,m.CLASS_CLOSED):g.removeClass(c.__ul,m.CLASS_CLOSED);this.onResize();c.__closeButton&&(c.__closeButton.innerHTML=b?m.TEXT_OPEN:m.TEXT_CLOSED)}},load:{get:function(){return a.load}},useLocalStorage:{get:function(){return e},set:function(a){w&&
((e=a)?g.bind(window,"unload",b):g.unbind(window,"unload",b),localStorage.setItem(document.location.href+".isLocal",a))}}});if(h.isUndefined(a.parent)){a.closed=!1;g.addClass(this.domElement,m.CLASS_MAIN);g.makeSelectable(this.domElement,!1);if(w&&e){c.useLocalStorage=!0;var f=localStorage.getItem(document.location.href+".gui");f&&(a.load=JSON.parse(f))}this.__closeButton=document.createElement("div");this.__closeButton.innerHTML=m.TEXT_CLOSED;g.addClass(this.__closeButton,m.CLASS_CLOSE_BUTTON);this.domElement.appendChild(this.__closeButton);
g.bind(this.__closeButton,"click",function(){c.closed=!c.closed})}else{void 0===a.closed&&(a.closed=!0);var q=document.createTextNode(a.name);g.addClass(q,"controller-name");f=u(c,q);g.addClass(this.__ul,m.CLASS_CLOSED);g.addClass(f,"title");g.bind(f,"click",function(a){a.preventDefault();c.closed=!c.closed;return!1});a.closed||(this.closed=!1)}a.autoPlace&&(h.isUndefined(a.parent)&&(H&&(x=document.createElement("div"),g.addClass(x,"dg"),g.addClass(x,m.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(x),
H=!1),x.appendChild(this.domElement),g.addClass(this.domElement,m.CLASS_AUTO_PLACE)),this.parent||F(c,a.width));g.bind(window,"resize",function(){c.onResize()});g.bind(this.__ul,"webkitTransitionEnd",function(){c.onResize()});g.bind(this.__ul,"transitionend",function(){c.onResize()});g.bind(this.__ul,"oTransitionEnd",function(){c.onResize()});this.onResize();a.resizable&&L(this);c.getRoot();a.parent||d()};m.toggleHide=function(){C=!C;h.each(I,function(a){a.domElement.style.zIndex=C?-999:999;a.domElement.style.opacity=
C?0:1})};m.CLASS_AUTO_PLACE="a";m.CLASS_AUTO_PLACE_CONTAINER="ac";m.CLASS_MAIN="main";m.CLASS_CONTROLLER_ROW="cr";m.CLASS_TOO_TALL="taller-than-window";m.CLASS_CLOSED="closed";m.CLASS_CLOSE_BUTTON="close-button";m.CLASS_DRAG="drag";m.DEFAULT_WIDTH=245;m.TEXT_CLOSED="Close Controls";m.TEXT_OPEN="Open Controls";g.bind(window,"keydown",function(a){"text"===document.activeElement.type||72!==a.which&&72!=a.keyCode||m.toggleHide()},!1);h.extend(m.prototype,{add:function(a,b){return t(this,a,b,{factoryArgs:Array.prototype.slice.call(arguments,
2)})},addColor:function(a,b){return t(this,a,b,{color:!0})},remove:function(a){this.__ul.removeChild(a.__li);this.__controllers.slice(this.__controllers.indexOf(a),1);var b=this;h.defer(function(){b.onResize()})},destroy:function(){this.autoPlace&&x.removeChild(this.domElement)},addFolder:function(a){if(void 0!==this.__folders[a])throw Error('You already have a folder in this GUI by the name "'+a+'"');var b={name:a,parent:this};b.autoPlace=this.autoPlace;this.load&&this.load.folders&&this.load.folders[a]&&
(b.closed=this.load.folders[a].closed,b.load=this.load.folders[a]);b=new m(b);this.__folders[a]=b;a=u(this,b.domElement);g.addClass(a,"folder");return b},open:function(){this.closed=!1},close:function(){this.closed=!0},onResize:function(){var a=this.getRoot();if(a.scrollable){var b=g.getOffset(a.__ul).top,d=0;h.each(a.__ul.childNodes,function(b){a.autoPlace&&b===a.__save_row||(d+=g.getHeight(b))});window.innerHeight-b-20<d?(g.addClass(a.domElement,m.CLASS_TOO_TALL),a.__ul.style.height=window.innerHeight-
b-20+"px"):(g.removeClass(a.domElement,m.CLASS_TOO_TALL),a.__ul.style.height="auto")}a.__resize_handle&&h.defer(function(){a.__resize_handle.style.height=a.__ul.offsetHeight+"px"});a.__closeButton&&(a.__closeButton.style.width=a.width+"px")},remember:function(){h.isUndefined(A)&&(A=new y,A.domElement.innerHTML=a);if(this.parent)throw Error("You can only call remember on a top level GUI.");var b=this;h.each(Array.prototype.slice.call(arguments),function(a){0==b.__rememberedObjects.length&&K(b);-1==
b.__rememberedObjects.indexOf(a)&&b.__rememberedObjects.push(a)});this.autoPlace&&F(this,this.width)},getRoot:function(){for(var a=this;a.parent;)a=a.parent;return a},getSaveObject:function(){var a=this.load;a.closed=this.closed;0<this.__rememberedObjects.length&&(a.preset=this.preset,a.remembered||(a.remembered={}),a.remembered[this.preset]=B(this));a.folders={};h.each(this.__folders,function(b,d){a.folders[d]=b.getSaveObject()});return a},save:function(){this.load.remembered||(this.load.remembered=
{});this.load.remembered[this.preset]=B(this);D(this,!1)},saveAs:function(a){this.load.remembered||(this.load.remembered={},this.load.remembered[z]=B(this,!0));this.load.remembered[a]=B(this);this.preset=a;E(this,a,!0)},revert:function(a){h.each(this.__controllers,function(b){this.getRoot().load.remembered?v(a||this.getRoot(),b):b.setValue(b.initialValue)},this);h.each(this.__folders,function(a){a.revert(a)});a||D(this.getRoot(),!1)},listen:function(a){var b=0==this.__listening.length;this.__listening.push(a);
b&&G(this.__listening)}});return m}(dat.utils.css,'<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>',
".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n",
dat.controllers.factory=function(e,a,b,d,f,c,p){return function(k,l,q,n){var r=k[l];if(p.isArray(q)||p.isObject(q))return new e(k,l,q);if(p.isNumber(r))return p.isNumber(q)&&p.isNumber(n)?new b(k,l,q,n):new a(k,l,{min:q,max:n});if(p.isString(r))return new d(k,l);if(p.isFunction(r))return new f(k,l,"");if(p.isBoolean(r))return new c(k,l)}}(dat.controllers.OptionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.StringController=function(e,a,b){var d=
function(b,c){function e(){k.setValue(k.__input.value)}d.superclass.call(this,b,c);var k=this;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"keyup",e);a.bind(this.__input,"change",e);a.bind(this.__input,"blur",function(){k.__onFinishChange&&k.__onFinishChange.call(k,k.getValue())});a.bind(this.__input,"keydown",function(a){13===a.keyCode&&this.blur()});this.updateDisplay();this.domElement.appendChild(this.__input)};d.superclass=e;b.extend(d.prototype,
e.prototype,{updateDisplay:function(){a.isActive(this.__input)||(this.__input.value=this.getValue());return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common),dat.controllers.FunctionController,dat.controllers.BooleanController,dat.utils.common),dat.controllers.Controller,dat.controllers.BooleanController,dat.controllers.FunctionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.OptionController,
dat.controllers.ColorController=function(e,a,b,d,f){function c(a,b,d,c){a.style.background="";f.each(l,function(e){a.style.cssText+="background: "+e+"linear-gradient("+b+", "+d+" 0%, "+c+" 100%); "})}function p(a){a.style.background="";a.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";a.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
a.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var k=function(e,n){function r(b){t(b);a.bind(window,"mousemove",t);a.bind(window,
"mouseup",l)}function l(){a.unbind(window,"mousemove",t);a.unbind(window,"mouseup",l)}function g(){var a=d(this.value);!1!==a?(s.__color.__state=a,s.setValue(s.__color.toOriginal())):this.value=s.__color.toString()}function h(){a.unbind(window,"mousemove",u);a.unbind(window,"mouseup",h)}function t(b){b.preventDefault();var d=a.getWidth(s.__saturation_field),c=a.getOffset(s.__saturation_field),e=(b.clientX-c.left+document.body.scrollLeft)/d;b=1-(b.clientY-c.top+document.body.scrollTop)/d;1<b?b=1:0>
b&&(b=0);1<e?e=1:0>e&&(e=0);s.__color.v=b;s.__color.s=e;s.setValue(s.__color.toOriginal());return!1}function u(b){b.preventDefault();var d=a.getHeight(s.__hue_field),c=a.getOffset(s.__hue_field);b=1-(b.clientY-c.top+document.body.scrollTop)/d;1<b?b=1:0>b&&(b=0);s.__color.h=360*b;s.setValue(s.__color.toOriginal());return!1}k.superclass.call(this,e,n);this.__color=new b(this.getValue());this.__temp=new b(0);var s=this;this.domElement=document.createElement("div");a.makeSelectable(this.domElement,!1);
this.__selector=document.createElement("div");this.__selector.className="selector";this.__saturation_field=document.createElement("div");this.__saturation_field.className="saturation-field";this.__field_knob=document.createElement("div");this.__field_knob.className="field-knob";this.__field_knob_border="2px solid ";this.__hue_knob=document.createElement("div");this.__hue_knob.className="hue-knob";this.__hue_field=document.createElement("div");this.__hue_field.className="hue-field";this.__input=document.createElement("input");
this.__input.type="text";this.__input_textShadow="0 1px 1px ";a.bind(this.__input,"keydown",function(a){13===a.keyCode&&g.call(this)});a.bind(this.__input,"blur",g);a.bind(this.__selector,"mousedown",function(b){a.addClass(this,"drag").bind(window,"mouseup",function(b){a.removeClass(s.__selector,"drag")})});var v=document.createElement("div");f.extend(this.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"});f.extend(this.__field_knob.style,
{position:"absolute",width:"12px",height:"12px",border:this.__field_knob_border+(0.5>this.__color.v?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1});f.extend(this.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1});f.extend(this.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"});f.extend(v.style,{width:"100%",height:"100%",
background:"none"});c(v,"top","rgba(0,0,0,0)","#000");f.extend(this.__hue_field.style,{width:"15px",height:"100px",display:"inline-block",border:"1px solid #555",cursor:"ns-resize"});p(this.__hue_field);f.extend(this.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:this.__input_textShadow+"rgba(0,0,0,0.7)"});a.bind(this.__saturation_field,"mousedown",r);a.bind(this.__field_knob,"mousedown",r);a.bind(this.__hue_field,"mousedown",function(b){u(b);a.bind(window,
"mousemove",u);a.bind(window,"mouseup",h)});this.__saturation_field.appendChild(v);this.__selector.appendChild(this.__field_knob);this.__selector.appendChild(this.__saturation_field);this.__selector.appendChild(this.__hue_field);this.__hue_field.appendChild(this.__hue_knob);this.domElement.appendChild(this.__input);this.domElement.appendChild(this.__selector);this.updateDisplay()};k.superclass=e;f.extend(k.prototype,e.prototype,{updateDisplay:function(){var a=d(this.getValue());if(!1!==a){var e=!1;
f.each(b.COMPONENTS,function(b){if(!f.isUndefined(a[b])&&!f.isUndefined(this.__color.__state[b])&&a[b]!==this.__color.__state[b])return e=!0,{}},this);e&&f.extend(this.__color.__state,a)}f.extend(this.__temp.__state,this.__color.__state);this.__temp.a=1;var k=0.5>this.__color.v||0.5<this.__color.s?255:0,l=255-k;f.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toString(),border:this.__field_knob_border+"rgb("+
k+","+k+","+k+")"});this.__hue_knob.style.marginTop=100*(1-this.__color.h/360)+"px";this.__temp.s=1;this.__temp.v=1;c(this.__saturation_field,"left","#fff",this.__temp.toString());f.extend(this.__input.style,{backgroundColor:this.__input.value=this.__color.toString(),color:"rgb("+k+","+k+","+k+")",textShadow:this.__input_textShadow+"rgba("+l+","+l+","+l+",.7)"})}});var l=["-moz-","-o-","-webkit-","-ms-",""];return k}(dat.controllers.Controller,dat.dom.dom,dat.color.Color=function(e,a,b,d){function f(a,
b,d){Object.defineProperty(a,b,{get:function(){if("RGB"===this.__state.space)return this.__state[b];p(this,b,d);return this.__state[b]},set:function(a){"RGB"!==this.__state.space&&(p(this,b,d),this.__state.space="RGB");this.__state[b]=a}})}function c(a,b){Object.defineProperty(a,b,{get:function(){if("HSV"===this.__state.space)return this.__state[b];k(this);return this.__state[b]},set:function(a){"HSV"!==this.__state.space&&(k(this),this.__state.space="HSV");this.__state[b]=a}})}function p(b,c,e){if("HEX"===
b.__state.space)b.__state[c]=a.component_from_hex(b.__state.hex,e);else if("HSV"===b.__state.space)d.extend(b.__state,a.hsv_to_rgb(b.__state.h,b.__state.s,b.__state.v));else throw"Corrupted color state";}function k(b){var c=a.rgb_to_hsv(b.r,b.g,b.b);d.extend(b.__state,{s:c.s,v:c.v});d.isNaN(c.h)?d.isUndefined(b.__state.h)&&(b.__state.h=0):b.__state.h=c.h}var l=function(){this.__state=e.apply(this,arguments);if(!1===this.__state)throw"Failed to interpret color arguments";this.__state.a=this.__state.a||
1};l.COMPONENTS="r g b h s v hex a".split(" ");d.extend(l.prototype,{toString:function(){return b(this)},toOriginal:function(){return this.__state.conversion.write(this)}});f(l.prototype,"r",2);f(l.prototype,"g",1);f(l.prototype,"b",0);c(l.prototype,"h");c(l.prototype,"s");c(l.prototype,"v");Object.defineProperty(l.prototype,"a",{get:function(){return this.__state.a},set:function(a){this.__state.a=a}});Object.defineProperty(l.prototype,"hex",{get:function(){"HEX"!==!this.__state.space&&(this.__state.hex=
a.rgb_to_hex(this.r,this.g,this.b));return this.__state.hex},set:function(a){this.__state.space="HEX";this.__state.hex=a}});return l}(dat.color.interpret,dat.color.math=function(){var e;return{hsv_to_rgb:function(a,b,d){var e=a/60-Math.floor(a/60),c=d*(1-b),p=d*(1-e*b);b=d*(1-(1-e)*b);a=[[d,b,c],[p,d,c],[c,d,b],[c,p,d],[b,c,d],[d,c,p]][Math.floor(a/60)%6];return{r:255*a[0],g:255*a[1],b:255*a[2]}},rgb_to_hsv:function(a,b,d){var e=Math.min(a,b,d),c=Math.max(a,b,d),e=c-e;if(0==c)return{h:NaN,s:0,v:0};
a=(a==c?(b-d)/e:b==c?2+(d-a)/e:4+(a-b)/e)/6;0>a&&(a+=1);return{h:360*a,s:e/c,v:c/255}},rgb_to_hex:function(a,b,d){a=this.hex_with_component(0,2,a);a=this.hex_with_component(a,1,b);return a=this.hex_with_component(a,0,d)},component_from_hex:function(a,b){return a>>8*b&255},hex_with_component:function(a,b,d){return d<<(e=8*b)|a&~(255<<e)}}}(),dat.color.toString,dat.utils.common),dat.color.interpret,dat.utils.common),dat.utils.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||
window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e,a){window.setTimeout(e,1E3/60)}}(),dat.dom.CenteredDiv=function(e,a){var b=function(){this.backgroundElement=document.createElement("div");a.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear"});e.makeFullscreen(this.backgroundElement);this.backgroundElement.style.position="fixed";this.domElement=
document.createElement("div");a.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear"});document.body.appendChild(this.backgroundElement);document.body.appendChild(this.domElement);var b=this;e.bind(this.backgroundElement,"click",function(){b.hide()})};b.prototype.show=function(){var b=this;this.backgroundElement.style.display="block";this.domElement.style.display="block";this.domElement.style.opacity=
0;this.domElement.style.webkitTransform="scale(1.1)";this.layout();a.defer(function(){b.backgroundElement.style.opacity=1;b.domElement.style.opacity=1;b.domElement.style.webkitTransform="scale(1)"})};b.prototype.hide=function(){var a=this,b=function(){a.domElement.style.display="none";a.backgroundElement.style.display="none";e.unbind(a.domElement,"webkitTransitionEnd",b);e.unbind(a.domElement,"transitionend",b);e.unbind(a.domElement,"oTransitionEnd",b)};e.bind(this.domElement,"webkitTransitionEnd",
b);e.bind(this.domElement,"transitionend",b);e.bind(this.domElement,"oTransitionEnd",b);this.backgroundElement.style.opacity=0;this.domElement.style.opacity=0;this.domElement.style.webkitTransform="scale(1.1)"};b.prototype.layout=function(){this.domElement.style.left=window.innerWidth/2-e.getWidth(this.domElement)/2+"px";this.domElement.style.top=window.innerHeight/2-e.getHeight(this.domElement)/2+"px"};return b}(dat.dom.dom,dat.utils.common),dat.dom.dom,dat.utils.common);;/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

(function(global){
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);

    var t = (i+j+k)*G3;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    var z0 = zin-k+t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.5 - x0*x0-y0*y0-z0*z0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1-z1*z1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.5 - x2*x2-y2*y2-z2*z2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.5 - x3*x3-y3*y3-z3*z3;
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);

  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  function lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  // 2D Perlin Noise
  module.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  };

  // 3D Perlin Noise
  module.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  };

})(this);;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurx;
	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.BloomPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		this.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

		renderer.render( this.scene, this.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

		renderer.render( this.scene, this.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		this.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );
;/**
 * Depth-of-field post-process with bokeh shader
 */


THREE.BokehPass = function ( scene, camera, params ) {

	this.scene = scene;
	this.camera = camera;

	var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
	var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
	var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
	var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;

	// render targets

	var width = params.width || window.innerWidth || 1;
	var height = params.height || window.innerHeight || 1;

	this.renderTargetColor = new THREE.WebGLRenderTarget( width, height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	} );

	this.renderTargetDepth = this.renderTargetColor.clone();

	// depth material

	this.materialDepth = new THREE.MeshDepthMaterial();

	// bokeh material

	if ( THREE.BokehShader === undefined ) {
		console.error( "THREE.BokehPass relies on THREE.BokehShader" );
	}
	
	var bokehShader = THREE.BokehShader;
	var bokehUniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );

	bokehUniforms[ "tDepth" ].value = this.renderTargetDepth;

	bokehUniforms[ "focus" ].value = focus;
	bokehUniforms[ "aspect" ].value = aspect;
	bokehUniforms[ "aperture" ].value = aperture;
	bokehUniforms[ "maxblur" ].value = maxblur;

	this.materialBokeh = new THREE.ShaderMaterial({
		uniforms: bokehUniforms,
		vertexShader: bokehShader.vertexShader,
		fragmentShader: bokehShader.fragmentShader
	});

	this.uniforms = bokehUniforms;
	this.enabled = true;
	this.needsSwap = false;
	this.renderToScreen = false;
	this.clear = false;

	this.camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene2  = new THREE.Scene();

	this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene2.add( this.quad2 );

};

THREE.BokehPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.quad2.material = this.materialBokeh;

		// Render depth into texture

		this.scene.overrideMaterial = this.materialDepth;

		renderer.render( this.scene, this.camera, this.renderTargetDepth, true );

		// Render bokeh composite

		this.uniforms[ "tColor" ].value = readBuffer;

		if ( this.renderToScreen ) {

			renderer.render( this.scene2, this.camera2 );

		} else {

			renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

		}

		this.scene.overrideMaterial = null;

	}

};

;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DotScreenPass = function ( center, angle, scale ) {

	if ( THREE.DotScreenShader === undefined )
		console.error( "THREE.DotScreenPass relies on THREE.DotScreenShader" );

	var shader = THREE.DotScreenShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
	if ( angle !== undefined ) this.uniforms[ "angle"].value = angle;
	if ( scale !== undefined ) this.uniforms[ "scale"].value = scale;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.DotScreenPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( !pass.enabled ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( pass instanceof THREE.MaskPass ) {

				maskActive = true;

			} else if ( pass instanceof THREE.ClearMaskPass ) {

				maskActive = false;

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			renderTarget = this.renderTarget1.clone();

			renderTarget.width = window.innerWidth;
			renderTarget.height = window.innerHeight;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		var renderTarget = this.renderTarget1.clone();

		renderTarget.width = width;
		renderTarget.height = height;

		this.reset( renderTarget );

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

	if ( THREE.FilmShader === undefined )
		console.error( "THREE.FilmPass relies on THREE.FilmShader" );

	var shader = THREE.FilmShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.FilmPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "time" ].value += delta;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SavePass = function ( renderTarget ) {

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.SavePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.textureID = "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

	}

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.SavePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		renderer.render( this.scene, this.camera, this.renderTarget, this.clear );

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function ( texture, opacity ) {

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.TexturePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
	this.uniforms[ "tDiffuse" ].value = texture;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.enabled = true;
	this.needsSwap = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.TexturePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.quad.material = this.material;

		renderer.render( this.scene, this.camera, readBuffer );

	}

};
;/*
 RequireJS 1.0.8 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs,require,define;
(function(r){function K(a){return O.call(a)==="[object Function]"}function G(a){return O.call(a)==="[object Array]"}function $(a,c,l){for(var j in c)if(!(j in L)&&(!(j in a)||l))a[j]=c[j];return d}function P(a,c,d){a=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+a);if(d)a.originalError=d;return a}function aa(a,c,d){var j,k,t;for(j=0;t=c[j];j++){t=typeof t==="string"?{name:t}:t;k=t.location;if(d&&(!k||k.indexOf("/")!==0&&k.indexOf(":")===-1))k=d+"/"+(k||t.name);a[t.name]={name:t.name,location:k||
t.name,main:(t.main||"main").replace(fa,"").replace(ba,"")}}}function V(a,c){a.holdReady?a.holdReady(c):c?a.readyWait+=1:a.ready(!0)}function ga(a){function c(b,f){var g,m;if(b&&b.charAt(0)===".")if(f){q.pkgs[f]?f=[f]:(f=f.split("/"),f=f.slice(0,f.length-1));g=b=f.concat(b.split("/"));var a;for(m=0;a=g[m];m++)if(a===".")g.splice(m,1),m-=1;else if(a==="..")if(m===1&&(g[2]===".."||g[0]===".."))break;else m>0&&(g.splice(m-1,2),m-=2);m=q.pkgs[g=b[0]];b=b.join("/");m&&b===g+"/"+m.main&&(b=g)}else b.indexOf("./")===
0&&(b=b.substring(2));return b}function l(b,f){var g=b?b.indexOf("!"):-1,m=null,a=f?f.name:null,h=b,e,d;g!==-1&&(m=b.substring(0,g),b=b.substring(g+1,b.length));m&&(m=c(m,a));b&&(m?e=(g=n[m])&&g.normalize?g.normalize(b,function(b){return c(b,a)}):c(b,a):(e=c(b,a),d=G[e],d||(d=i.nameToUrl(b,null,f),G[e]=d)));return{prefix:m,name:e,parentMap:f,url:d,originalName:h,fullName:m?m+"!"+(e||""):e}}function j(){var b=!0,f=q.priorityWait,g,a;if(f){for(a=0;g=f[a];a++)if(!s[g]){b=!1;break}b&&delete q.priorityWait}return b}
function k(b,f,g){return function(){var a=ha.call(arguments,0),c;if(g&&K(c=a[a.length-1]))c.__requireJsBuild=!0;a.push(f);return b.apply(null,a)}}function t(b,f,g){f=k(g||i.require,b,f);$(f,{nameToUrl:k(i.nameToUrl,b),toUrl:k(i.toUrl,b),defined:k(i.requireDefined,b),specified:k(i.requireSpecified,b),isBrowser:d.isBrowser});return f}function p(b){var f,g,a,c=b.callback,h=b.map,e=h.fullName,ca=b.deps;a=b.listeners;var j=q.requireExecCb||d.execCb;if(c&&K(c)){if(q.catchError.define)try{g=j(e,b.callback,
ca,n[e])}catch(k){f=k}else g=j(e,b.callback,ca,n[e]);if(e)(c=b.cjsModule)&&c.exports!==r&&c.exports!==n[e]?g=n[e]=b.cjsModule.exports:g===r&&b.usingExports?g=n[e]:(n[e]=g,H[e]&&(T[e]=!0))}else e&&(g=n[e]=c,H[e]&&(T[e]=!0));if(x[b.id])delete x[b.id],b.isDone=!0,i.waitCount-=1,i.waitCount===0&&(J=[]);delete M[e];if(d.onResourceLoad&&!b.placeholder)d.onResourceLoad(i,h,b.depArray);if(f)return g=(e?l(e).url:"")||f.fileName||f.sourceURL,a=f.moduleTree,f=P("defineerror",'Error evaluating module "'+e+'" at location "'+
g+'":\n'+f+"\nfileName:"+g+"\nlineNumber: "+(f.lineNumber||f.line),f),f.moduleName=e,f.moduleTree=a,d.onError(f);for(f=0;c=a[f];f++)c(g);return r}function u(b,f){return function(g){b.depDone[f]||(b.depDone[f]=!0,b.deps[f]=g,b.depCount-=1,b.depCount||p(b))}}function o(b,f){var g=f.map,a=g.fullName,c=g.name,h=N[b]||(N[b]=n[b]),e;if(!f.loading)f.loading=!0,e=function(b){f.callback=function(){return b};p(f);s[f.id]=!0;A()},e.fromText=function(b,f){var g=Q;s[b]=!1;i.scriptCount+=1;i.fake[b]=!0;g&&(Q=!1);
d.exec(f);g&&(Q=!0);i.completeLoad(b)},a in n?e(n[a]):h.load(c,t(g.parentMap,!0,function(b,a){var c=[],e,m;for(e=0;m=b[e];e++)m=l(m,g.parentMap),b[e]=m.fullName,m.prefix||c.push(b[e]);f.moduleDeps=(f.moduleDeps||[]).concat(c);return i.require(b,a)}),e,q)}function y(b){x[b.id]||(x[b.id]=b,J.push(b),i.waitCount+=1)}function D(b){this.listeners.push(b)}function v(b,f){var g=b.fullName,a=b.prefix,c=a?N[a]||(N[a]=n[a]):null,h,e;g&&(h=M[g]);if(!h&&(e=!0,h={id:(a&&!c?O++ +"__p@:":"")+(g||"__r@"+O++),map:b,
depCount:0,depDone:[],depCallbacks:[],deps:[],listeners:[],add:D},B[h.id]=!0,g&&(!a||N[a])))M[g]=h;a&&!c?(g=l(a),a in n&&!n[a]&&(delete n[a],delete R[g.url]),a=v(g,!0),a.add(function(){var f=l(b.originalName,b.parentMap),f=v(f,!0);h.placeholder=!0;f.add(function(b){h.callback=function(){return b};p(h)})})):e&&f&&(s[h.id]=!1,i.paused.push(h),y(h));return h}function C(b,f,a,c){var b=l(b,c),d=b.name,h=b.fullName,e=v(b),j=e.id,k=e.deps,o;if(h){if(h in n||s[j]===!0||h==="jquery"&&q.jQuery&&q.jQuery!==
a().fn.jquery)return;B[j]=!0;s[j]=!0;h==="jquery"&&a&&W(a())}e.depArray=f;e.callback=a;for(a=0;a<f.length;a++)if(j=f[a])j=l(j,d?b:c),o=j.fullName,f[a]=o,o==="require"?k[a]=t(b):o==="exports"?(k[a]=n[h]={},e.usingExports=!0):o==="module"?e.cjsModule=k[a]={id:d,uri:d?i.nameToUrl(d,null,c):r,exports:n[h]}:o in n&&!(o in x)&&(!(h in H)||h in H&&T[o])?k[a]=n[o]:(h in H&&(H[o]=!0,delete n[o],R[j.url]=!1),e.depCount+=1,e.depCallbacks[a]=u(e,a),v(j,!0).add(e.depCallbacks[a]));e.depCount?y(e):p(e)}function w(b){C.apply(null,
b)}function F(b,f){var a=b.map.fullName,c=b.depArray,d=!0,h,e,i,l;if(b.isDone||!a||!s[a])return l;if(f[a])return b;f[a]=!0;if(c){for(h=0;h<c.length;h++){e=c[h];if(!s[e]&&!ia[e]){d=!1;break}if((i=x[e])&&!i.isDone&&s[e])if(l=F(i,f))break}d||(l=r,delete f[a])}return l}function z(b,a){var g=b.map.fullName,c=b.depArray,d,h,e,i;if(b.isDone||!g||!s[g])return r;if(g){if(a[g])return n[g];a[g]=!0}if(c)for(d=0;d<c.length;d++)if(h=c[d])if((e=l(h).prefix)&&(i=x[e])&&z(i,a),(e=x[h])&&!e.isDone&&s[h])h=z(e,a),b.depCallbacks[d](h);
return n[g]}function E(){var b=q.waitSeconds*1E3,b=b&&i.startTime+b<(new Date).getTime(),a="",c=!1,l=!1,k=[],h,e;if(i.pausedCount>0)return r;if(q.priorityWait)if(j())A();else return r;for(h in s)if(!(h in L)&&(c=!0,!s[h]))if(b)a+=h+" ";else if(l=!0,h.indexOf("!")===-1){k=[];break}else(e=M[h]&&M[h].moduleDeps)&&k.push.apply(k,e);if(!c&&!i.waitCount)return r;if(b&&a)return b=P("timeout","Load timeout for modules: "+a),b.requireType="timeout",b.requireModules=a,b.contextName=i.contextName,d.onError(b);
if(l&&k.length)for(a=0;h=x[k[a]];a++)if(h=F(h,{})){z(h,{});break}if(!b&&(l||i.scriptCount)){if((I||da)&&!X)X=setTimeout(function(){X=0;E()},50);return r}if(i.waitCount){for(a=0;h=J[a];a++)z(h,{});i.paused.length&&A();Y<5&&(Y+=1,E())}Y=0;d.checkReadyState();return r}var i,A,q={waitSeconds:7,baseUrl:"./",paths:{},pkgs:{},catchError:{}},S=[],B={require:!0,exports:!0,module:!0},G={},n={},s={},x={},J=[],R={},O=0,M={},N={},H={},T={},Z=0;W=function(b){if(!i.jQuery&&(b=b||(typeof jQuery!=="undefined"?jQuery:
null))&&!(q.jQuery&&b.fn.jquery!==q.jQuery)&&("holdReady"in b||"readyWait"in b))if(i.jQuery=b,w(["jquery",[],function(){return jQuery}]),i.scriptCount)V(b,!0),i.jQueryIncremented=!0};A=function(){var b,a,c,l,k,h;i.takeGlobalQueue();Z+=1;if(i.scriptCount<=0)i.scriptCount=0;for(;S.length;)if(b=S.shift(),b[0]===null)return d.onError(P("mismatch","Mismatched anonymous define() module: "+b[b.length-1]));else w(b);if(!q.priorityWait||j())for(;i.paused.length;){k=i.paused;i.pausedCount+=k.length;i.paused=
[];for(l=0;b=k[l];l++)a=b.map,c=a.url,h=a.fullName,a.prefix?o(a.prefix,b):!R[c]&&!s[h]&&((q.requireLoad||d.load)(i,h,c),c.indexOf("empty:")!==0&&(R[c]=!0));i.startTime=(new Date).getTime();i.pausedCount-=k.length}Z===1&&E();Z-=1;return r};i={contextName:a,config:q,defQueue:S,waiting:x,waitCount:0,specified:B,loaded:s,urlMap:G,urlFetched:R,scriptCount:0,defined:n,paused:[],pausedCount:0,plugins:N,needFullExec:H,fake:{},fullExec:T,managerCallbacks:M,makeModuleMap:l,normalize:c,configure:function(b){var a,
c,d;b.baseUrl&&b.baseUrl.charAt(b.baseUrl.length-1)!=="/"&&(b.baseUrl+="/");a=q.paths;d=q.pkgs;$(q,b,!0);if(b.paths){for(c in b.paths)c in L||(a[c]=b.paths[c]);q.paths=a}if((a=b.packagePaths)||b.packages){if(a)for(c in a)c in L||aa(d,a[c],c);b.packages&&aa(d,b.packages);q.pkgs=d}if(b.priority)c=i.requireWait,i.requireWait=!1,A(),i.require(b.priority),A(),i.requireWait=c,q.priorityWait=b.priority;if(b.deps||b.callback)i.require(b.deps||[],b.callback)},requireDefined:function(b,a){return l(b,a).fullName in
n},requireSpecified:function(b,a){return l(b,a).fullName in B},require:function(b,c,g){if(typeof b==="string"){if(K(c))return d.onError(P("requireargs","Invalid require call"));if(d.get)return d.get(i,b,c);c=l(b,c);b=c.fullName;return!(b in n)?d.onError(P("notloaded","Module name '"+c.fullName+"' has not been loaded yet for context: "+a)):n[b]}(b&&b.length||c)&&C(null,b,c,g);if(!i.requireWait)for(;!i.scriptCount&&i.paused.length;)A();return i.require},takeGlobalQueue:function(){U.length&&(ja.apply(i.defQueue,
[i.defQueue.length-1,0].concat(U)),U=[])},completeLoad:function(b){var a;for(i.takeGlobalQueue();S.length;)if(a=S.shift(),a[0]===null){a[0]=b;break}else if(a[0]===b)break;else w(a),a=null;a?w(a):w([b,[],b==="jquery"&&typeof jQuery!=="undefined"?function(){return jQuery}:null]);d.isAsync&&(i.scriptCount-=1);A();d.isAsync||(i.scriptCount-=1)},toUrl:function(b,a){var c=b.lastIndexOf("."),d=null;c!==-1&&(d=b.substring(c,b.length),b=b.substring(0,c));return i.nameToUrl(b,d,a)},nameToUrl:function(b,a,g){var l,
k,h,e,j=i.config,b=c(b,g&&g.fullName);if(d.jsExtRegExp.test(b))a=b+(a?a:"");else{l=j.paths;k=j.pkgs;g=b.split("/");for(e=g.length;e>0;e--)if(h=g.slice(0,e).join("/"),l[h]){g.splice(0,e,l[h]);break}else if(h=k[h]){b=b===h.name?h.location+"/"+h.main:h.location;g.splice(0,e,b);break}a=g.join("/")+(a||".js");a=(a.charAt(0)==="/"||a.match(/^[\w\+\.\-]+:/)?"":j.baseUrl)+a}return j.urlArgs?a+((a.indexOf("?")===-1?"?":"&")+j.urlArgs):a}};i.jQueryCheck=W;i.resume=A;return i}function ka(){var a,c,d;if(C&&C.readyState===
"interactive")return C;a=document.getElementsByTagName("script");for(c=a.length-1;c>-1&&(d=a[c]);c--)if(d.readyState==="interactive")return C=d;return null}var la=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,ma=/require\(\s*["']([^'"\s]+)["']\s*\)/g,fa=/^\.\//,ba=/\.js$/,O=Object.prototype.toString,u=Array.prototype,ha=u.slice,ja=u.splice,I=!!(typeof window!=="undefined"&&navigator&&document),da=!I&&typeof importScripts!=="undefined",na=I&&navigator.platform==="PLAYSTATION 3"?/^complete$/:/^(complete|loaded)$/,
ea=typeof opera!=="undefined"&&opera.toString()==="[object Opera]",L={},D={},U=[],C=null,Y=0,Q=!1,ia={require:!0,module:!0,exports:!0},d,u={},J,y,v,E,o,w,F,B,z,W,X;if(typeof define==="undefined"){if(typeof requirejs!=="undefined")if(K(requirejs))return;else u=requirejs,requirejs=r;typeof require!=="undefined"&&!K(require)&&(u=require,require=r);d=requirejs=function(a,c,d){var j="_",k;!G(a)&&typeof a!=="string"&&(k=a,G(c)?(a=c,c=d):a=[]);if(k&&k.context)j=k.context;d=D[j]||(D[j]=ga(j));k&&d.configure(k);
return d.require(a,c)};d.config=function(a){return d(a)};require||(require=d);d.toUrl=function(a){return D._.toUrl(a)};d.version="1.0.8";d.jsExtRegExp=/^\/|:|\?|\.js$/;y=d.s={contexts:D,skipAsync:{}};if(d.isAsync=d.isBrowser=I)if(v=y.head=document.getElementsByTagName("head")[0],E=document.getElementsByTagName("base")[0])v=y.head=E.parentNode;d.onError=function(a){throw a;};d.load=function(a,c,l){d.resourcesReady(!1);a.scriptCount+=1;d.attach(l,a,c);if(a.jQuery&&!a.jQueryIncremented)V(a.jQuery,!0),
a.jQueryIncremented=!0};define=function(a,c,d){var j,k;typeof a!=="string"&&(d=c,c=a,a=null);G(c)||(d=c,c=[]);!c.length&&K(d)&&d.length&&(d.toString().replace(la,"").replace(ma,function(a,d){c.push(d)}),c=(d.length===1?["require"]:["require","exports","module"]).concat(c));if(Q&&(j=J||ka()))a||(a=j.getAttribute("data-requiremodule")),k=D[j.getAttribute("data-requirecontext")];(k?k.defQueue:U).push([a,c,d]);return r};define.amd={multiversion:!0,plugins:!0,jQuery:!0};d.exec=function(a){return eval(a)};
d.execCb=function(a,c,d,j){return c.apply(j,d)};d.addScriptToDom=function(a){J=a;E?v.insertBefore(a,E):v.appendChild(a);J=null};d.onScriptLoad=function(a){var c=a.currentTarget||a.srcElement,l;if(a.type==="load"||c&&na.test(c.readyState))C=null,a=c.getAttribute("data-requirecontext"),l=c.getAttribute("data-requiremodule"),D[a].completeLoad(l),c.detachEvent&&!ea?c.detachEvent("onreadystatechange",d.onScriptLoad):c.removeEventListener("load",d.onScriptLoad,!1)};d.attach=function(a,c,l,j,k,o){var p;
if(I)return j=j||d.onScriptLoad,p=c&&c.config&&c.config.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script"),p.type=k||c&&c.config.scriptType||"text/javascript",p.charset="utf-8",p.async=!y.skipAsync[a],c&&p.setAttribute("data-requirecontext",c.contextName),p.setAttribute("data-requiremodule",l),p.attachEvent&&!(p.attachEvent.toString&&p.attachEvent.toString().indexOf("[native code]")<0)&&!ea?(Q=!0,o?p.onreadystatechange=function(){if(p.readyState===
"loaded")p.onreadystatechange=null,p.attachEvent("onreadystatechange",j),o(p)}:p.attachEvent("onreadystatechange",j)):p.addEventListener("load",j,!1),p.src=a,o||d.addScriptToDom(p),p;else da&&(importScripts(a),c.completeLoad(l));return null};if(I){o=document.getElementsByTagName("script");for(B=o.length-1;B>-1&&(w=o[B]);B--){if(!v)v=w.parentNode;if(F=w.getAttribute("data-main")){if(!u.baseUrl)o=F.split("/"),w=o.pop(),o=o.length?o.join("/")+"/":"./",u.baseUrl=o,F=w.replace(ba,"");u.deps=u.deps?u.deps.concat(F):
[F];break}}}d.checkReadyState=function(){var a=y.contexts,c;for(c in a)if(!(c in L)&&a[c].waitCount)return;d.resourcesReady(!0)};d.resourcesReady=function(a){var c,l;d.resourcesDone=a;if(d.resourcesDone)for(l in a=y.contexts,a)if(!(l in L)&&(c=a[l],c.jQueryIncremented))V(c.jQuery,!1),c.jQueryIncremented=!1};d.pageLoaded=function(){if(document.readyState!=="complete")document.readyState="complete"};if(I&&document.addEventListener&&!document.readyState)document.readyState="loading",window.addEventListener("load",
d.pageLoaded,!1);d(u);if(d.isAsync&&typeof setTimeout!=="undefined")z=y.contexts[u.context||"_"],z.requireWait=!0,setTimeout(function(){z.requireWait=!1;z.scriptCount||z.resume();d.checkReadyState()},0)}})();;/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"void main() {",

			"gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
 * - based on Nvidia example
 * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
 */

THREE.BleachBypassShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 base = texture2D( tDiffuse, vUv );",

			"vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
			"float lum = dot( lumCoeff, base.rgb );",
			"vec3 blend = vec3( lum );",

			"float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",

			"vec3 result1 = 2.0 * base.rgb * blend;",
			"vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",

			"vec3 newColor = mix( result1, result2, L );",

			"float A2 = opacity * base.a;",
			"vec3 mixRGB = A2 * newColor.rgb;",
			"mixRGB += ( ( 1.0 - A2 ) * base.rgb );",

			"gl_FragColor = vec4( mixRGB, base.a );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

THREE.BlendShader = {

	uniforms: {

		"tDiffuse1": { type: "t", value: null },
		"tDiffuse2": { type: "t", value: null },
		"mixRatio":  { type: "f", value: 0.5 },
		"opacity":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float mixRatio;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
			"gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

THREE.BokehShader = {

	uniforms: {

		"tColor":   { type: "t", value: null },
		"tDepth":   { type: "t", value: null },
		"focus":    { type: "f", value: 1.0 },
		"aspect":   { type: "f", value: 1.0 },
		"aperture": { type: "f", value: 0.025 },
		"maxblur":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"uniform float maxblur;",  // max blur amount
		"uniform float aperture;", // aperture - bigger values for shallower depth of field

		"uniform float focus;",
		"uniform float aspect;",

		"void main() {",

			"vec2 aspectcorrect = vec2( 1.0, aspect );",

			"vec4 depth1 = texture2D( tDepth, vUv );",

			"float factor = depth1.x - focus;",

			"vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",

			"vec2 dofblur9 = dofblur * 0.9;",
			"vec2 dofblur7 = dofblur * 0.7;",
			"vec2 dofblur4 = dofblur * 0.4;",

			"vec4 col = vec4( 0.0 );",

			"col += texture2D( tColor, vUv.xy );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );",

			"gl_FragColor = col / 41.0;",
			"gl_FragColor.a = 1.0;",

		"}"

	].join("\n")

};
;/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */



THREE.BokehShader = {

	uniforms: {

		"textureWidth":  { type: "f", value: 1.0 },
		"textureHeight":  { type: "f", value: 1.0 },

		"focalDepth":   { type: "f", value: 1.0 },
		"focalLength":   { type: "f", value: 24.0 },
		"fstop": { type: "f", value: 0.9 },

		"tColor":   { type: "t", value: null },
		"tDepth":   { type: "t", value: null },

		"maxblur":  { type: "f", value: 1.0 },

		"showFocus":   { type: "i", value: 0 },
		"manualdof":   { type: "i", value: 0 },
		"vignetting":   { type: "i", value: 0 },
		"depthblur":   { type: "i", value: 0 },

		"threshold":  { type: "f", value: 0.5 },
		"gain":  { type: "f", value: 2.0 },
		"bias":  { type: "f", value: 0.5 },
		"fringe":  { type: "f", value: 0.7 },

		"znear":  { type: "f", value: 0.1 },
		"zfar":  { type: "f", value: 100 },

		"noise":  { type: "i", value: 1 },
		"dithering":  { type: "f", value: 0.0001 },
		"pentagon": { type: "i", value: 0 },

		"shaderFocus":  { type: "i", value: 1 },
		"focusCoords":  { type: "v2", value: new THREE.Vector2()},


	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",
		"uniform float textureWidth;",
		"uniform float textureHeight;",

		"const float PI = 3.14159265;",

		"float width = textureWidth; //texture width",
		"float height = textureHeight; //texture height",

		"vec2 texel = vec2(1.0/width,1.0/height);",

		"uniform float focalDepth;  //focal distance value in meters, but you may use autofocus option below",
		"uniform float focalLength; //focal length in mm",
		"uniform float fstop; //f-stop value",
		"uniform bool showFocus; //show debug focus point and focal range (red = focal point, green = focal range)",

		"/*",
		"make sure that these two values are the same for your camera, otherwise distances will be wrong.",
		"*/",

		"uniform float znear; // camera clipping start",
		"uniform float zfar; // camera clipping end",

		"//------------------------------------------",
		"//user variables",

		"const int samples = SAMPLES; //samples on the first ring",
		"const int rings = RINGS; //ring count",

		"const int maxringsamples = rings * samples;",

		"uniform bool manualdof; // manual dof calculation",
		"float ndofstart = 1.0; // near dof blur start",
		"float ndofdist = 2.0; // near dof blur falloff distance",
		"float fdofstart = 1.0; // far dof blur start",
		"float fdofdist = 3.0; // far dof blur falloff distance",

		"float CoC = 0.03; //circle of confusion size in mm (35mm film = 0.03mm)",

		"uniform bool vignetting; // use optical lens vignetting",

		"float vignout = 1.3; // vignetting outer border",
		"float vignin = 0.0; // vignetting inner border",
		"float vignfade = 22.0; // f-stops till vignete fades",

		"uniform bool shaderFocus;",

		"bool autofocus = shaderFocus;",
		"//use autofocus in shader - use with focusCoords",
		"// disable if you use external focalDepth value",

		"uniform vec2 focusCoords;",
		"// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)",
		"// if center of screen use vec2(0.5, 0.5);",

		"uniform float maxblur;",
		"//clamp value of max blur (0.0 = no blur, 1.0 default)",

		"uniform float threshold; // highlight threshold;",
		"uniform float gain; // highlight gain;",

		"uniform float bias; // bokeh edge bias",
		"uniform float fringe; // bokeh chromatic aberration / fringing",

		"uniform bool noise; //use noise instead of pattern for sample dithering",

		"uniform float dithering;",
		"float namount = dithering; //dither amount",

		"uniform bool depthblur; // blur the depth buffer",
		"float dbsize = 1.25; // depth blur size",

		"/*",
		"next part is experimental",
		"not looking good with small sample and ring count",
		"looks okay starting from samples = 4, rings = 4",
		"*/",

		"uniform bool pentagon; //use pentagon as bokeh shape?",
		"float feather = 0.4; //pentagon shape feather",

		"//------------------------------------------",

		"float penta(vec2 coords) {",
			"//pentagonal shape",
			"float scale = float(rings) - 1.3;",
			"vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);",
			"vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);",
			"vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);",
			"vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);",
			"vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);",
			"vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);",

			"vec4  one = vec4( 1.0 );",

			"vec4 P = vec4((coords),vec2(scale, scale));",

			"vec4 dist = vec4(0.0);",
			"float inorout = -4.0;",

			"dist.x = dot( P, HS0 );",
			"dist.y = dot( P, HS1 );",
			"dist.z = dot( P, HS2 );",
			"dist.w = dot( P, HS3 );",

			"dist = smoothstep( -feather, feather, dist );",

			"inorout += dot( dist, one );",

			"dist.x = dot( P, HS4 );",
			"dist.y = HS5.w - abs( P.z );",

			"dist = smoothstep( -feather, feather, dist );",
			"inorout += dist.x;",

			"return clamp( inorout, 0.0, 1.0 );",
		"}",

		"float bdepth(vec2 coords) {",
			"// Depth buffer blur",
			"float d = 0.0;",
			"float kernel[9];",
			"vec2 offset[9];",

			"vec2 wh = vec2(texel.x, texel.y) * dbsize;",

			"offset[0] = vec2(-wh.x,-wh.y);",
			"offset[1] = vec2( 0.0, -wh.y);",
			"offset[2] = vec2( wh.x -wh.y);",

			"offset[3] = vec2(-wh.x,  0.0);",
			"offset[4] = vec2( 0.0,   0.0);",
			"offset[5] = vec2( wh.x,  0.0);",

			"offset[6] = vec2(-wh.x, wh.y);",
			"offset[7] = vec2( 0.0,  wh.y);",
			"offset[8] = vec2( wh.x, wh.y);",

			"kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;",
			"kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;",
			"kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;",


			"for( int i=0; i<9; i++ ) {",
				"float tmp = texture2D(tDepth, coords + offset[i]).r;",
				"d += tmp * kernel[i];",
			"}",

			"return d;",
		"}",


		"vec3 color(vec2 coords,float blur) {",
			"//processing the sample",

			"vec3 col = vec3(0.0);",

			"col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;",
			"col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;",
			"col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;",

			"vec3 lumcoeff = vec3(0.299,0.587,0.114);",
			"float lum = dot(col.rgb, lumcoeff);",
			"float thresh = max((lum-threshold)*gain, 0.0);",
			"return col+mix(vec3(0.0),col,thresh*blur);",
		"}",

		"vec2 rand(vec2 coord) {",
			"// generating noise / pattern texture for dithering",

			"float noiseX = ((fract(1.0-coord.s*(width/2.0))*0.25)+(fract(coord.t*(height/2.0))*0.75))*2.0-1.0;",
			"float noiseY = ((fract(1.0-coord.s*(width/2.0))*0.75)+(fract(coord.t*(height/2.0))*0.25))*2.0-1.0;",

			"if (noise) {",
				"noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;",
				"noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;",
			"}",

			"return vec2(noiseX,noiseY);",
		"}",

		"vec3 debugFocus(vec3 col, float blur, float depth) {",
			"float edge = 0.002*depth; //distance based edge smoothing",
			"float m = clamp(smoothstep(0.0,edge,blur),0.0,1.0);",
			"float e = clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);",

			"col = mix(col,vec3(1.0,0.5,0.0),(1.0-m)*0.6);",
			"col = mix(col,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);",

			"return col;",
		"}",

		"float linearize(float depth) {",
			"return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",


		"float vignette() {",
			"float dist = distance(vUv.xy, vec2(0.5,0.5));",
			"dist = smoothstep(vignout+(fstop/vignfade), vignin+(fstop/vignfade), dist);",
			"return clamp(dist,0.0,1.0);",
		"}",

		"float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
			"float rings2 = float(rings);",
			"float step = PI*2.0 / float(ringsamples);",
			"float pw = cos(j*step)*i;",
			"float ph = sin(j*step)*i;",
			"float p = 1.0;",
			"if (pentagon) {",
				"p = penta(vec2(pw,ph));",
			"}",
			"col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;",
			"return 1.0 * mix(1.0, i /rings2, bias) * p;",
		"}",

		"void main() {",
			"//scene depth calculation",

			"float depth = linearize(texture2D(tDepth,vUv.xy).x);",

			"// Blur depth?",
			"if (depthblur) {",
				"depth = linearize(bdepth(vUv.xy));",
			"}",

			"//focal plane calculation",

			"float fDepth = focalDepth;",

			"if (autofocus) {",

				"fDepth = linearize(texture2D(tDepth,focusCoords).x);",

			"}",

			"// dof blur factor calculation",

			"float blur = 0.0;",

			"if (manualdof) {",
				"float a = depth-fDepth; // Focal plane",
				"float b = (a-fdofstart)/fdofdist; // Far DoF",
				"float c = (-a-ndofstart)/ndofdist; // Near Dof",
				"blur = (a>0.0) ? b : c;",
			"} else {",
				"float f = focalLength; // focal length in mm",
				"float d = fDepth*1000.0; // focal plane in mm",
				"float o = depth*1000.0; // depth in mm",

				"float a = (o*f)/(o-f);",
				"float b = (d*f)/(d-f);",
				"float c = (d-f)/(d*fstop*CoC);",

				"blur = abs(a-b)*c;",
			"}",

			"blur = clamp(blur,0.0,1.0);",

			"// calculation of pattern for dithering",

			"vec2 noise = rand(vUv.xy)*namount*blur;",

			"// getting blur x and y step factor",

			"float w = (1.0/width)*blur*maxblur+noise.x;",
			"float h = (1.0/height)*blur*maxblur+noise.y;",

			"// calculation of final color",

			"vec3 col = vec3(0.0);",

			"if(blur < 0.05) {",
				"//some optimization thingy",
				"col = texture2D(tColor, vUv.xy).rgb;",
			"} else {",
				"col = texture2D(tColor, vUv.xy).rgb;",
				"float s = 1.0;",
				"int ringsamples;",

				"for (int i = 1; i <= rings; i++) {",
					"/*unboxstart*/",
					"ringsamples = i * samples;",

					"for (int j = 0 ; j < maxringsamples ; j++) {",
						"if (j >= ringsamples) break;",
						"s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
					"}",
					"/*unboxend*/",
				"}",

				"col /= s; //divide by sample count",
			"}",

			"if (showFocus) {",
				"col = debugFocus(col, blur, depth);",
			"}",

			"if (vignetting) {",
				"col *= vignette();",
			"}",

			"gl_FragColor.rgb = col;",
			"gl_FragColor.a = 1.0;",
		"} "

	].join("\n")

};
;/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.BrightnessContrastShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"brightness": { type: "f", value: 0 },
		"contrast":   { type: "f", value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float brightness;",
		"uniform float contrast;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			"gl_FragColor.rgb += brightness;",

			"if (contrast > 0.0) {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;",
			"} else {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;",
			"}",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Color correction
 */

THREE.ColorCorrectionShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"powRGB":   { type: "v3", value: new THREE.Vector3( 2, 2, 2 ) },
		"mulRGB":   { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 powRGB;",
		"uniform vec3 mulRGB;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",
			"gl_FragColor.rgb = mulRGB * pow( gl_FragColor.rgb, powRGB );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"color":    { type: "c", value: new THREE.Color( 0xffffff ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v * color, texel.w );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25",

	},

	uniforms: {

		"tDiffuse":        { type: "t", value: null },
		"uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { type: "fv1", value: [] }

	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",

		"}"


	].join("\n"),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

		return values;

	}

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader using mipmaps
 * - from Matt Handley @applmak
 * - requires power-of-2 sized render target with enabled mipmaps
 */

THREE.DOFMipMapShader = {

	uniforms: {

		"tColor":   { type: "t", value: null },
		"tDepth":   { type: "t", value: null },
		"focus":    { type: "f", value: 1.0 },
		"maxblur":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float focus;",
		"uniform float maxblur;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 depth = texture2D( tDepth, vUv );",

			"float factor = depth.x - focus;",

			"vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );",

			"gl_FragColor = col;",
			"gl_FragColor.a = 1.0;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
		"center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { type: "f", value: 1.57 },
		"scale":    { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join("\n")

};
;/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Frei-Chen filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.EdgeShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"aspect":    { type: "v2", value: new THREE.Vector2( 512, 512 ) },
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",

		"uniform vec2 aspect;",

		"vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",


		"mat3 G[9];",

		// hard coded matrix values!!!! as suggested in https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45

		"const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );",
		"const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );",
		"const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );",
		"const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );",
		"const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );",
		"const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );",
		"const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );",
		"const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );",
		"const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );",

		"void main(void)",
		"{",

			"G[0] = g0,",
			"G[1] = g1,",
			"G[2] = g2,",
			"G[3] = g3,",
			"G[4] = g4,",
			"G[5] = g5,",
			"G[6] = g6,",
			"G[7] = g7,",
			"G[8] = g8;",

			"mat3 I;",
			"float cnv[9];",
			"vec3 sample;",

			/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
			"for (float i=0.0; i<3.0; i++) {",
				"for (float j=0.0; j<3.0; j++) {",
					"sample = texture2D(tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
					"I[int(i)][int(j)] = length(sample);",
				"}",
			"}",

			/* calculate the convolution values for all the masks */
			"for (int i=0; i<9; i++) {",
				"float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
				"cnv[i] = dp3 * dp3;",
			"}",

			"float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);",
			"float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);",

			"gl_FragColor = vec4(vec3(sqrt(M/S)), 1.0);",
		"}",

	].join("\n")
};
;/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Sobel filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.EdgeShader2 = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"aspect":    { type: "v2", value: new THREE.Vector2( 512, 512 ) },
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"uniform vec2 aspect;",


		"vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",

		"mat3 G[2];",

		"const mat3 g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );",
		"const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );",


		"void main(void)",
		"{",
			"mat3 I;",
			"float cnv[2];",
			"vec3 sample;",

			"G[0] = g0;",
			"G[1] = g1;",

			/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
			"for (float i=0.0; i<3.0; i++)",
			"for (float j=0.0; j<3.0; j++) {",
				"sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
				"I[int(i)][int(j)] = length(sample);",
			"}",

			/* calculate the convolution values for all the masks */
			"for (int i=0; i<2; i++) {",
				"float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
				"cnv[i] = dp3 * dp3; ",
			"}",

			"gl_FragColor = vec4(0.5 * sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));",
		"} ",

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"resolution": { type: "v2", value: new THREE.Vector2( 1 / 1024, 1 / 512 )  }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",

		"#define FXAA_REDUCE_MIN   (1.0/128.0)",
		"#define FXAA_REDUCE_MUL   (1.0/8.0)",
		"#define FXAA_SPAN_MAX     8.0",

		"void main() {",

			"vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
			"vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );",
			"vec3 rgbM  = rgbaM.xyz;",
			"float opacity  = rgbaM.w;",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float lumaNW = dot( rgbNW, luma );",
			"float lumaNE = dot( rgbNE, luma );",
			"float lumaSW = dot( rgbSW, luma );",
			"float lumaSE = dot( rgbSE, luma );",
			"float lumaM  = dot( rgbM,  luma );",
			"float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
			"float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

			"vec2 dir;",
			"dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
			"dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

			"float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

			"float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
			"dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
				  "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
						"dir * rcpDirMin)) * resolution;",

			"vec3 rgbA = texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * ( 1.0 / 3.0 - 0.5 ) ).xyz;",
			"rgbA += texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * ( 2.0 / 3.0 - 0.5 ) ).xyz;",
			"rgbA *= 0.5;",

			"vec3 rgbB = texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * -0.5 ).xyz;",
			"rgbB += texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * 0.5 ).xyz;",
			"rgbB *= 0.25;",
			"rgbB += rgbA * 0.5;",

			"float lumaB = dot( rgbB, luma );",

			"if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

				"gl_FragColor = vec4( rgbA, opacity );",

			"} else {",

				"gl_FragColor = vec4( rgbB, opacity );",

			"}",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"time":       { type: "f", value: 0.0 },
		"nIntensity": { type: "f", value: 0.5 },
		"sIntensity": { type: "f", value: 0.05 },
		"sCount":     { type: "f", value: 4096 },
		"grayscale":  { type: "i", value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			"float x = vUv.x * vUv.y * time *  1000.0;",
			"x = mod( x, 13.0 ) * mod( x, 123.0 );",
			"float dx = mod( x, 0.01 );",

			// add noise
			"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

			// get us a sine and cosine
			"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			"if( grayscale ) {",

				"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			"}",

			"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.FocusShader = {

	uniforms : {

		"tDiffuse":       { type: "t", value: null },
		"screenWidth":    { type: "f", value: 1024 },
		"screenHeight":   { type: "f", value: 1024 },
		"sampleDistance": { type: "f", value: 0.94 },
		"waveFactor":     { type: "f", value: 0.00125 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float screenWidth;",
		"uniform float screenHeight;",
		"uniform float sampleDistance;",
		"uniform float waveFactor;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color, org, tmp, add;",
			"float sample_dist, f;",
			"vec2 vin;",
			"vec2 uv = vUv;",

			"add = color = org = texture2D( tDiffuse, uv );",

			"vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );",
			"sample_dist = dot( vin, vin ) * 2.0;",

			"f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;",

			"vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );",
			"color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );",

			"gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );",

		"}"


	].join("\n")
};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.FresnelShader = {

	uniforms: {

		"mRefractionRatio": { type: "f", value: 1.02 },
		"mFresnelBias": { type: "f", value: 0.1 },
		"mFresnelPower": { type: "f", value: 2.0 },
		"mFresnelScale": { type: "f", value: 1.0 },
		"tCube": { type: "t", value: null }

	},

	vertexShader: [

		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

			"vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

			"vec3 I = worldPosition.xyz - cameraPosition;",

			"vReflect = reflect( I, worldNormal );",
			"vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
			"vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
			"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform samplerCube tCube;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
			"vec4 refractedColor = vec4( 1.0 );",

			"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
			"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
			"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",

			"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

		"}"

	].join("\n")

};
;/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"h":        { type: "f", value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.HorizontalTiltShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"h":        { type: "f", value: 1.0 / 512.0 },
		"r":        { type: "f", value: 0.35 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",
		"uniform float r;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"float hh = h * abs( r - vUv.y );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join("\n")

};
;/**
 * @author tapio / http://tapio.github.com/
 *
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.HueSaturationShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"hue":        { type: "f", value: 0 },
		"saturation": { type: "f", value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float hue;",
		"uniform float saturation;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			// hue
			"float angle = hue * 3.14159265;",
			"float s = sin(angle), c = cos(angle);",
			"vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"float len = length(gl_FragColor.rgb);",
			"gl_FragColor.rgb = vec3(",
				"dot(gl_FragColor.rgb, weights.xyz),",
				"dot(gl_FragColor.rgb, weights.zxy),",
				"dot(gl_FragColor.rgb, weights.yzx)",
			");",

			// saturation
			"float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;",
			"if (saturation > 0.0) {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
			"} else {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);",
			"}",

		"}"

	].join("\n")

};
;/**
 * @author felixturner / http://airtight.cc/
 *
 * Kaleidoscope Shader
 * Radial reflection around center point
 * Ported from: http://pixelshaders.com/editor/
 * by Toby Schachman / http://tobyschachman.com/
 *
 * sides: number of reflections
 * angle: initial angle in radians
 */

THREE.KaleidoShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"sides":    { type: "f", value: 6.0 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float sides;",
		"uniform float angle;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv - 0.5;",
			"float r = length(p);",
			"float a = atan(p.y, p.x) + angle;",
			"float tau = 2. * 3.1416 ;",
			"a = mod(a, tau/sides);",
			"a = abs(a - tau/sides/2.) ;",
			"p = r * vec2(cos(a), sin(a));",
			"vec4 color = texture2D(tDiffuse, p + 0.5);",
			"gl_FragColor = color;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v, v, v, texel.w );",

		"}"

	].join("\n")

};
;/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.MirrorShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"side":     { type: "i", value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform int side;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv;",
			"if (side == 0){",
				"if (p.x > 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 1){",
				"if (p.x < 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 2){",
				"if (p.y < 0.5) p.y = 1.0 - p.y;",
			"}else if (side == 3){",
				"if (p.y > 0.5) p.y = 1.0 - p.y;",
			"} ",
			"vec4 color = texture2D(tDiffuse, p);",
			"gl_FragColor = color;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 * - compute normals from heightmap
 */

THREE.NormalMapShader = {

	uniforms: {

		"heightMap":  { type: "t", value: null },
		"resolution": { type: "v2", value: new THREE.Vector2( 512, 512 ) },
		"scale":      { type: "v2", value: new THREE.Vector2( 1, 1 ) },
		"height":     { type: "f", value: 0.05 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float height;",
		"uniform vec2 resolution;",
		"uniform sampler2D heightMap;",

		"varying vec2 vUv;",

		"void main() {",

			"float val = texture2D( heightMap, vUv ).x;",

			"float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
			"float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",

			"gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );",

		"}"

	].join("\n")

};
;/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Screen-space ambient occlusion shader
 * - ported from
 *   SSAO GLSL shader v1.2
 *   assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
 *   original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
 * - modifications
 * - modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
 * - made fog more compatible with three.js linear fog
 * - refactoring and optimizations
 */

THREE.SSAOShader = {

	uniforms: {

		"tDiffuse":     { type: "t", value: null },
		"tDepth":       { type: "t", value: null },
		"size":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },
		"cameraNear":   { type: "f", value: 1 },
		"cameraFar":    { type: "f", value: 100 },
		"fogNear":      { type: "f", value: 5 },
		"fogFar":       { type: "f", value: 100 },
		"fogEnabled":   { type: "i", value: 0 },
		"onlyAO":       { type: "i", value: 0 },
		"aoClamp":      { type: "f", value: 0.3 },
		"lumInfluence": { type: "f", value: 0.9 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float cameraNear;",
		"uniform float cameraFar;",

		"uniform float fogNear;",
		"uniform float fogFar;",

		"uniform bool fogEnabled;",  // attenuate AO with linear fog
		"uniform bool onlyAO;",      // use only ambient occlusion pass?

		"uniform vec2 size;",        // texture width, height
		"uniform float aoClamp;",    // depth clamp - reduces haloing at screen edges

		"uniform float lumInfluence;",  // how much luminance affects occlusion

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		// "#define PI 3.14159265",
		"#define DL 2.399963229728653",  // PI * ( 3.0 - sqrt( 5.0 ) )
		"#define EULER 2.718281828459045",

		// helpers

		"float width = size.x;",   // texture width
		"float height = size.y;",  // texture height

		"float cameraFarPlusNear = cameraFar + cameraNear;",
		"float cameraFarMinusNear = cameraFar - cameraNear;",
		"float cameraCoef = 2.0 * cameraNear;",

		// user variables

		"const int samples = 8;",     // ao sample count
		"const float radius = 5.0;",  // ao radius

		"const bool useNoise = false;",      // use noise instead of pattern for sample dithering
		"const float noiseAmount = 0.0003;", // dithering amount

		"const float diffArea = 0.4;",   // self-shadowing reduction
		"const float gDisplace = 0.4;",  // gauss bell center

		"const vec3 onlyAOColor = vec3( 1.0, 0.7, 0.5 );",
		// "const vec3 onlyAOColor = vec3( 1.0, 1.0, 1.0 );",


		// RGBA depth

		"float unpackDepth( const in vec4 rgba_depth ) {",

			"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
			"float depth = dot( rgba_depth, bit_shift );",
			"return depth;",

		"}",

		// generating noise / pattern texture for dithering

		"vec2 rand( const vec2 coord ) {",

			"vec2 noise;",

			"if ( useNoise ) {",

				"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
				"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

				"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",

			"} else {",

				"float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );",
				"float gg = fract( coord.t * ( height / 2.0 ) );",

				"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",

			"}",

			"return ( noise * 2.0  - 1.0 ) * noiseAmount;",

		"}",

		"float doFog() {",

			"float zdepth = unpackDepth( texture2D( tDepth, vUv ) );",
			"float depth = -cameraFar * cameraNear / ( zdepth * cameraFarMinusNear - cameraFar );",

			"return smoothstep( fogNear, fogFar, depth );",

		"}",

		"float readDepth( const in vec2 coord ) {",

			// "return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
			"return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );",


		"}",

		"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",

			"float garea = 2.0;",                         // gauss bell width
			"float diff = ( depth1 - depth2 ) * 100.0;",  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing

			"if ( diff < gDisplace ) {",

				"garea = diffArea;",

			"} else {",

				"far = 1;",

			"}",

			"float dd = diff - gDisplace;",
			"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
			"return gauss;",

		"}",

		"float calcAO( float depth, float dw, float dh ) {",

			"float dd = radius - depth * radius;",
			"vec2 vv = vec2( dw, dh );",

			"vec2 coord1 = vUv + dd * vv;",
			"vec2 coord2 = vUv - dd * vv;",

			"float temp1 = 0.0;",
			"float temp2 = 0.0;",

			"int far = 0;",
			"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

			// DEPTH EXTRAPOLATION

			"if ( far > 0 ) {",

				"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
				"temp1 += ( 1.0 - temp1 ) * temp2;",

			"}",

			"return temp1;",

		"}",

		"void main() {",

			"vec2 noise = rand( vUv );",
			"float depth = readDepth( vUv );",

			"float tt = clamp( depth, aoClamp, 1.0 );",

			"float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
			"float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

			"float pw;",
			"float ph;",

			"float ao;",

			"float dz = 1.0 / float( samples );",
			"float z = 1.0 - dz / 2.0;",
			"float l = 0.0;",

			"for ( int i = 0; i <= samples; i ++ ) {",

				"float r = sqrt( 1.0 - z );",

				"pw = cos( l ) * r;",
				"ph = sin( l ) * r;",
				"ao += calcAO( depth, pw * w, ph * h );",
				"z = z - dz;",
				"l = l + DL;",

			"}",

			"ao /= float( samples );",
			"ao = 1.0 - ao;",

			"if ( fogEnabled ) {",

				"ao = mix( ao, 1.0, doFog() );",

			"}",

			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

			"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
			"float lum = dot( color.rgb, lumcoeff );",
			"vec3 luminance = vec3( lum );",

			"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // mix( color * ao, white, luminance )

			"if ( onlyAO ) {",

				"final = onlyAOColor * vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // ambient occlusion only

			"}",

			"gl_FragColor = vec4( final, 1.0 );",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.SepiaShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float amount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec3 c = color.rgb;",

			"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
			"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
			"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

			"gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

		"}"

	].join("\n")

};
;/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Triangle blur shader
 * based on glfx.js triangle blur shader
 * https://github.com/evanw/glfx.js
 *
 * A basic blur filter, which convolves the image with a
 * pyramid filter. The pyramid filter is separable and is applied as two
 * perpendicular triangle filters.
 */

THREE.TriangleBlurShader = {

	uniforms : {

		"texture": { type: "t", value: null },
		"delta":   { type: "v2", value:new THREE.Vector2( 1, 1 )  }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"#define ITERATIONS 10.0",

		"uniform sampler2D texture;",
		"uniform vec2 delta;",

		"varying vec2 vUv;",

		"float random( vec3 scale, float seed ) {",

			// use the fragment position for a different seed per-pixel

			"return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed );",

		"}",

		"void main() {",

			"vec4 color = vec4( 0.0 );",

			"float total = 0.0;",

			// randomize the lookup values to hide the fixed number of samples

			"float offset = random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );",

			"for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {",

				"float percent = ( t + offset - 0.5 ) / ITERATIONS;",
				"float weight = 1.0 - abs( percent );",

				"color += texture2D( texture, vUv + delta * percent ) * weight;",
				"total += weight;",

			"}",

			"gl_FragColor = color / total;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Unpack RGBA depth shader
 * - show RGBA encoded depth as monochrome color
 */

THREE.UnpackDepthRGBAShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		// RGBA depth

		"float unpackDepth( const in vec4 rgba_depth ) {",

			"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
			"float depth = dot( rgba_depth, bit_shift );",
			"return depth;",

		"}",

		"void main() {",

			"float depth = 1.0 - unpackDepth( texture2D( tDiffuse, vUv ) );",
			"gl_FragColor = opacity * vec4( vec3( depth ), 1.0 );",

		"}"

	].join("\n")

};
;/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"v":        { type: "f", value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.VerticalTiltShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"v":        { type: "f", value: 1.0 / 512.0 },
		"r":        { type: "f", value: 0.35 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",
		"uniform float r;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"float vv = v * abs( r - vUv.y );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join("\n")

};
;/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"offset":   { type: "f", value: 1.0 },
		"darkness": { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float offset;",
		"uniform float darkness;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// Eskil's vignette

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
			"gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

			/*
			// alternative version from glfx.js
			// this one makes more "dusty" look (as opposed to "burned")

			"vec4 color = texture2D( tDiffuse, vUv );",
			"float dist = distance( vUv, vec2( 0.5 ) );",
			"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
			"gl_FragColor = color;",
			*/

		"}"

	].join("\n")

};
;// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:11,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};
;/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 */

THREE.TrackballControls = function ( object, domElement ) {

  var _this = this;
  var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5 };

  this.object = object;
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  // API

  this.enabled = true;

  this.screen = { left: 0, top: 0, width: 0, height: 0 };

  this.rotateSpeed = 1.0;
  this.zoomSpeed = 1.2;
  this.panSpeed = 0.3;

  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;
  this.noRoll = false;

  this.staticMoving = false;
  this.dynamicDampingFactor = 0.2;

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

  // internals

  this.target = new THREE.Vector3();

  var lastPosition = new THREE.Vector3();

  var _state = STATE.NONE,
  _prevState = STATE.NONE,

  _eye = new THREE.Vector3(),

  _rotateStart = new THREE.Vector3(),
  _rotateEnd = new THREE.Vector3(),

  _zoomStart = new THREE.Vector2(),
  _zoomEnd = new THREE.Vector2(),

  _touchZoomDistanceStart = 0,
  _touchZoomDistanceEnd = 0,

  _panStart = new THREE.Vector2(),
  _panEnd = new THREE.Vector2();

  // for reset

  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.up0 = this.object.up.clone();

  // events

  var changeEvent = { type: 'change' };
  var startEvent = { type: 'start'};
  var endEvent = { type: 'end'};


  // methods

  this.handleResize = function () {

    if ( this.domElement === document ) {

      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;

    } else {

      this.screen = this.domElement.getBoundingClientRect();
      // adjustments come from similar code in the jquery offset() function
      var d = this.domElement.ownerDocument.documentElement
      this.screen.left += window.pageXOffset - d.clientLeft
      this.screen.top += window.pageYOffset - d.clientTop

    }

  };

  this.handleEvent = function ( event ) {

    if ( typeof this[ event.type ] == 'function' ) {

      this[ event.type ]( event );

    }

  };

  this.getMouseOnScreen = function ( pageX, pageY, vector ) {

    return vector.set(
      ( pageX - _this.screen.left ) / _this.screen.width,
      ( pageY - _this.screen.top ) / _this.screen.height
    );

  };

  this.getMouseProjectionOnBall = (function(){

    var objectUp = new THREE.Vector3(),
        mouseOnBall = new THREE.Vector3();


    return function ( pageX, pageY, projection ) {

      mouseOnBall.set(
        ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
        ( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
        0.0
      );

      var length = mouseOnBall.length();

      if ( _this.noRoll ) {

        if ( length < Math.SQRT1_2 ) {

          mouseOnBall.z = Math.sqrt( 1.0 - length*length );

        } else {

          mouseOnBall.z = .5 / length;
          
        }

      } else if ( length > 1.0 ) {

        mouseOnBall.normalize();

      } else {

        mouseOnBall.z = Math.sqrt( 1.0 - length * length );

      }

      _eye.copy( _this.object.position ).sub( _this.target );

      projection.copy( _this.object.up ).setLength( mouseOnBall.y )
      projection.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
      projection.add( _eye.setLength( mouseOnBall.z ) );

      return projection;
    }

  }());

  this.rotateCamera = (function(){

    var axis = new THREE.Vector3(),
      quaternion = new THREE.Quaternion();


    return function () {

      var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

      if ( angle ) {

        axis.crossVectors( _rotateStart, _rotateEnd ).normalize();

        angle *= _this.rotateSpeed;

        quaternion.setFromAxisAngle( axis, -angle );

        _eye.applyQuaternion( quaternion );
        _this.object.up.applyQuaternion( quaternion );

        _rotateEnd.applyQuaternion( quaternion );

        if ( _this.staticMoving ) {

          _rotateStart.copy( _rotateEnd );

        } else {

          quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
          _rotateStart.applyQuaternion( quaternion );

        }

      }
    }

  }());

  this.zoomCamera = function () {

    if ( _state === STATE.TOUCH_ZOOM ) {

      var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
      _touchZoomDistanceStart = _touchZoomDistanceEnd;
      _eye.multiplyScalar( factor );

    } else {

      var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

      if ( factor !== 1.0 && factor > 0.0 ) {

        _eye.multiplyScalar( factor );

        if ( _this.staticMoving ) {

          _zoomStart.copy( _zoomEnd );

        } else {

          _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

        }

      }

    }

  };

  this.panCamera = (function(){

    var mouseChange = new THREE.Vector2(),
      objectUp = new THREE.Vector3(),
      pan = new THREE.Vector3();

    return function () {

      mouseChange.copy( _panEnd ).sub( _panStart );

      if ( mouseChange.lengthSq() ) {

        mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

        pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
        pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

        _this.object.position.add( pan );
        _this.target.add( pan );

        if ( _this.staticMoving ) {

          _panStart.copy( _panEnd );

        } else {

          _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

        }

      }
    }

  }());

  this.checkDistances = function () {

    if ( !_this.noZoom || !_this.noPan ) {

      if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

        _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

      }

      if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

        _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

      }

    }

  };

  this.update = function () {

    _eye.subVectors( _this.object.position, _this.target );

    if ( !_this.noRotate ) {

      _this.rotateCamera();

    }

    if ( !_this.noZoom ) {

      _this.zoomCamera();

    }

    if ( !_this.noPan ) {

      _this.panCamera();

    }

    _this.object.position.addVectors( _this.target, _eye );

    _this.checkDistances();

    _this.object.lookAt( _this.target );

    if ( lastPosition.distanceToSquared( _this.object.position ) > 0 ) {

      _this.dispatchEvent( changeEvent );

      lastPosition.copy( _this.object.position );

    }

  };

  this.reset = function () {

    _state = STATE.NONE;
    _prevState = STATE.NONE;

    _this.target.copy( _this.target0 );
    _this.object.position.copy( _this.position0 );
    _this.object.up.copy( _this.up0 );

    _eye.subVectors( _this.object.position, _this.target );

    _this.object.lookAt( _this.target );

    _this.dispatchEvent( changeEvent );

    lastPosition.copy( _this.object.position );

  };

  // listeners

  function keydown( event ) {

    if ( _this.enabled === false ) return;

    window.removeEventListener( 'keydown', keydown );

    _prevState = _state;

    if ( _state !== STATE.NONE ) {

      return;

    } else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

      _state = STATE.ROTATE;

    } else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

      _state = STATE.ZOOM;

    } else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

      _state = STATE.PAN;

    }

  }

  function keyup( event ) {

    if ( _this.enabled === false ) return;

    _state = _prevState;

    window.addEventListener( 'keydown', keydown, false );

  }

  function mousedown( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    if ( _state === STATE.NONE ) {

      _state = event.button;

    }

    if ( _state === STATE.ROTATE && !_this.noRotate ) {

      _this.getMouseProjectionOnBall( event.pageX, event.pageY, _rotateStart );
      _rotateEnd.copy(_rotateStart)

    } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

      _this.getMouseOnScreen( event.pageX, event.pageY, _zoomStart );
      _zoomEnd.copy(_zoomStart);

    } else if ( _state === STATE.PAN && !_this.noPan ) {

      _this.getMouseOnScreen( event.pageX, event.pageY, _panStart );
      _panEnd.copy(_panStart)

    }

    document.addEventListener( 'mousemove', mousemove, false );
    document.addEventListener( 'mouseup', mouseup, false );
    _this.dispatchEvent( startEvent );


  }

  function mousemove( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    if ( _state === STATE.ROTATE && !_this.noRotate ) {

      _this.getMouseProjectionOnBall( event.pageX, event.pageY, _rotateEnd );

    } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

      _this.getMouseOnScreen( event.pageX, event.pageY, _zoomEnd );

    } else if ( _state === STATE.PAN && !_this.noPan ) {

      _this.getMouseOnScreen( event.pageX, event.pageY, _panEnd );

    }

  }

  function mouseup( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    _state = STATE.NONE;

    document.removeEventListener( 'mousemove', mousemove );
    document.removeEventListener( 'mouseup', mouseup );
    _this.dispatchEvent( endEvent );

  }

  function mousewheel( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    var delta = 0;

    if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

      delta = event.wheelDelta / 40;

    } else if ( event.detail ) { // Firefox

      delta = - event.detail / 3;

    }

    _zoomStart.y += delta * 0.01;
    _this.dispatchEvent( startEvent );
    _this.dispatchEvent( endEvent );

  }

  function touchstart( event ) {

    if ( _this.enabled === false ) return;

    switch ( event.touches.length ) {

      case 1:
        _state = STATE.TOUCH_ROTATE;
        _rotateEnd.copy( _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateStart ));
        break;

      case 2:
        _state = STATE.TOUCH_ZOOM;
        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
        break;

      case 3:
        _state = STATE.TOUCH_PAN;
        _panEnd.copy( _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panStart ));
        break;

      default:
        _state = STATE.NONE;

    }
    _this.dispatchEvent( startEvent );


  }

  function touchmove( event ) {

    if ( _this.enabled === false ) return;

    event.preventDefault();
    event.stopPropagation();

    switch ( event.touches.length ) {

      case 1:
        _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateEnd );
        break;

      case 2:
        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy )
        break;

      case 3:
        _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panEnd );
        break;

      default:
        _state = STATE.NONE;

    }

  }

  function touchend( event ) {

    if ( _this.enabled === false ) return;

    switch ( event.touches.length ) {

      case 1:
        _rotateStart.copy( _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateEnd ));
        break;

      case 2:
        _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
        break;

      case 3:
        _panStart.copy( _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panEnd ));
        break;

    }

    _state = STATE.NONE;
    _this.dispatchEvent( endEvent );

  }

  this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

  this.domElement.addEventListener( 'mousedown', mousedown, false );

  this.domElement.addEventListener( 'mousewheel', mousewheel, false );
  this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

  this.domElement.addEventListener( 'touchstart', touchstart, false );
  this.domElement.addEventListener( 'touchend', touchend, false );
  this.domElement.addEventListener( 'touchmove', touchmove, false );

  window.addEventListener( 'keydown', keydown, false );
  window.addEventListener( 'keyup', keyup, false );

  this.handleResize();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );;// tween.js - http://github.com/sole/tween.js
'use strict';var TWEEN=TWEEN||function(){var a=[];return{REVISION:"7",getAll:function(){return a},removeAll:function(){a=[]},add:function(c){a.push(c)},remove:function(c){c=a.indexOf(c);-1!==c&&a.splice(c,1)},update:function(c){if(0===a.length)return!1;for(var b=0,d=a.length,c=void 0!==c?c:Date.now();b<d;)a[b].update(c)?b++:(a.splice(b,1),d--);return!0}}}();
TWEEN.Tween=function(a){var c={},b={},d=1E3,e=0,f=null,h=TWEEN.Easing.Linear.None,r=TWEEN.Interpolation.Linear,k=[],l=null,m=!1,n=null,p=null;this.to=function(a,c){null!==c&&(d=c);b=a;return this};this.start=function(d){TWEEN.add(this);m=!1;f=void 0!==d?d:Date.now();f+=e;for(var g in b)if(null!==a[g]){if(b[g]instanceof Array){if(0===b[g].length)continue;b[g]=[a[g]].concat(b[g])}c[g]=a[g]}return this};this.stop=function(){TWEEN.remove(this);return this};this.delay=function(a){e=a;return this};this.easing=
function(a){h=a;return this};this.interpolation=function(a){r=a;return this};this.chain=function(){k=arguments;return this};this.onStart=function(a){l=a;return this};this.onUpdate=function(a){n=a;return this};this.onComplete=function(a){p=a;return this};this.update=function(e){if(e<f)return!0;!1===m&&(null!==l&&l.call(a),m=!0);var g=(e-f)/d,g=1<g?1:g,i=h(g),j;for(j in c){var s=c[j],q=b[j];a[j]=q instanceof Array?r(q,i):s+(q-s)*i}null!==n&&n.call(a,i);if(1==g){null!==p&&p.call(a);g=0;for(i=k.length;g<
i;g++)k[g].start(e);return!1}return!0}};
TWEEN.Easing={Linear:{None:function(a){return a}},Quadratic:{In:function(a){return a*a},Out:function(a){return a*(2-a)},InOut:function(a){return 1>(a*=2)?0.5*a*a:-0.5*(--a*(a-2)-1)}},Cubic:{In:function(a){return a*a*a},Out:function(a){return--a*a*a+1},InOut:function(a){return 1>(a*=2)?0.5*a*a*a:0.5*((a-=2)*a*a+2)}},Quartic:{In:function(a){return a*a*a*a},Out:function(a){return 1- --a*a*a*a},InOut:function(a){return 1>(a*=2)?0.5*a*a*a*a:-0.5*((a-=2)*a*a*a-2)}},Quintic:{In:function(a){return a*a*a*
a*a},Out:function(a){return--a*a*a*a*a+1},InOut:function(a){return 1>(a*=2)?0.5*a*a*a*a*a:0.5*((a-=2)*a*a*a*a+2)}},Sinusoidal:{In:function(a){return 1-Math.cos(a*Math.PI/2)},Out:function(a){return Math.sin(a*Math.PI/2)},InOut:function(a){return 0.5*(1-Math.cos(Math.PI*a))}},Exponential:{In:function(a){return 0===a?0:Math.pow(1024,a-1)},Out:function(a){return 1===a?1:1-Math.pow(2,-10*a)},InOut:function(a){return 0===a?0:1===a?1:1>(a*=2)?0.5*Math.pow(1024,a-1):0.5*(-Math.pow(2,-10*(a-1))+2)}},Circular:{In:function(a){return 1-
Math.sqrt(1-a*a)},Out:function(a){return Math.sqrt(1- --a*a)},InOut:function(a){return 1>(a*=2)?-0.5*(Math.sqrt(1-a*a)-1):0.5*(Math.sqrt(1-(a-=2)*a)+1)}},Elastic:{In:function(a){var c,b=0.1;if(0===a)return 0;if(1===a)return 1;!b||1>b?(b=1,c=0.1):c=0.4*Math.asin(1/b)/(2*Math.PI);return-(b*Math.pow(2,10*(a-=1))*Math.sin((a-c)*2*Math.PI/0.4))},Out:function(a){var c,b=0.1;if(0===a)return 0;if(1===a)return 1;!b||1>b?(b=1,c=0.1):c=0.4*Math.asin(1/b)/(2*Math.PI);return b*Math.pow(2,-10*a)*Math.sin((a-c)*
2*Math.PI/0.4)+1},InOut:function(a){var c,b=0.1;if(0===a)return 0;if(1===a)return 1;!b||1>b?(b=1,c=0.1):c=0.4*Math.asin(1/b)/(2*Math.PI);return 1>(a*=2)?-0.5*b*Math.pow(2,10*(a-=1))*Math.sin((a-c)*2*Math.PI/0.4):0.5*b*Math.pow(2,-10*(a-=1))*Math.sin((a-c)*2*Math.PI/0.4)+1}},Back:{In:function(a){return a*a*(2.70158*a-1.70158)},Out:function(a){return--a*a*(2.70158*a+1.70158)+1},InOut:function(a){return 1>(a*=2)?0.5*a*a*(3.5949095*a-2.5949095):0.5*((a-=2)*a*(3.5949095*a+2.5949095)+2)}},Bounce:{In:function(a){return 1-
TWEEN.Easing.Bounce.Out(1-a)},Out:function(a){return a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375},InOut:function(a){return 0.5>a?0.5*TWEEN.Easing.Bounce.In(2*a):0.5*TWEEN.Easing.Bounce.Out(2*a-1)+0.5}}};
TWEEN.Interpolation={Linear:function(a,c){var b=a.length-1,d=b*c,e=Math.floor(d),f=TWEEN.Interpolation.Utils.Linear;return 0>c?f(a[0],a[1],d):1<c?f(a[b],a[b-1],b-d):f(a[e],a[e+1>b?b:e+1],d-e)},Bezier:function(a,c){var b=0,d=a.length-1,e=Math.pow,f=TWEEN.Interpolation.Utils.Bernstein,h;for(h=0;h<=d;h++)b+=e(1-c,d-h)*e(c,h)*a[h]*f(d,h);return b},CatmullRom:function(a,c){var b=a.length-1,d=b*c,e=Math.floor(d),f=TWEEN.Interpolation.Utils.CatmullRom;return a[0]===a[b]?(0>c&&(e=Math.floor(d=b*(1+c))),f(a[(e-
1+b)%b],a[e],a[(e+1)%b],a[(e+2)%b],d-e)):0>c?a[0]-(f(a[0],a[0],a[1],a[1],-d)-a[0]):1<c?a[b]-(f(a[b],a[b],a[b-1],a[b-1],d-b)-a[b]):f(a[e?e-1:0],a[e],a[b<e+1?b:e+1],a[b<e+2?b:e+2],d-e)},Utils:{Linear:function(a,c,b){return(c-a)*b+a},Bernstein:function(a,c){var b=TWEEN.Interpolation.Utils.Factorial;return b(a)/b(c)/b(a-c)},Factorial:function(){var a=[1];return function(c){var b=1,d;if(a[c])return a[c];for(d=c;1<d;d--)b*=d;return a[c]=b}}(),CatmullRom:function(a,c,b,d,e){var a=0.5*(b-a),d=0.5*(d-c),f=
e*e;return(2*c-2*b+a+d)*e*f+(-3*c+3*b-2*a-d)*f+a*e+c}}};
