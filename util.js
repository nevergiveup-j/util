/**
 * 工具库
 */
!function(win, doc){
	var docEl = doc.documentElement,
		head = doc.getElementsByTagName("head")[0] || docEl,
		userAgent = navigator.userAgent.toLowerCase(),
		expando = "utilities" + timeNow(),
		util = {};
		
	/**
	 * 元素绑定事件
	 * @name util.bind
	 * @param {object}    elem		  目标元素
	 * @param {string}    type 		  事件类型
	 * @param {function}  handler	  处理函数
	 */
	util.bind = function(elem,type,handler){
		var guid = 1;
		if(win.addEventListener){ 
			elem.addEventListener(type, handler, false);
			return false; 
		}
		if (!guid) handler.guid = guid++;
		if (!elem.events) elem.events = {};
		var handlers = elem.events[type];
		if (!handlers) {
			handlers = elem.events[type] = {};
			if (elem["on" + type]) {
				handlers[0] = elem["on" + type];
			}
		}

		handlers[handler.guid] = handler;
		elem["on" + type] = _handleEvent;
		
		/** 
		 * 执行事件 
		 * @param {Object} event 
		 */ 
		function _handleEvent(event) { 
			var event = event || win.event; 
			var handles = this.events[event.type]; 
			for(var i in handles){ 
				handles[i].call(this,event); 
			} 
		}
	};

	/**
	 * 元素删除事件
	 * @name util.unbind
	 * @param {object}     elem		    目标元素
	 * @param {string}     type 		事件类型
	 * @param {function}   handler   	处理函数
	 */
	util.unbind = function(elem,type,handler){
		if(win.removeEventListener){ 
			elem.removeEventListener(type, handler); 
			return; 
		}
		if(elem.events){
			var fns = elem.events[type];
			if(fns){
				delete fns[handler._id]
			}
		}	
	};
	/**
	 *dom 扩展包
	*/ 
	util.dom = {
		/**
		 * 根据 id 获取元素
		 * @name util.byId
		 * @param {string}   elem		目标元素
		 * @param {object}   doc	    可选，上下文
		 */
		byId: function(elem,_doc){
			return ((typeof elem =="string") ? (_doc || doc).getElementById(elem) : elem) || null;
		},
		/**
		 * 根据 name 属性获取元素	
		 * @name util.byName
		 * @param {string}   name		目标元素
		 * @param {object}   doc	    可选，上下文
		 */
		byName: function(name,_doc){
			return (_doc || doc).getElementsByTagName(name);
		},
		/**
		 * 根据 class 属性获取元素
		 * @name util.byClass
		 * @param {string}   sArg		目标元素
		 * @param {object}   doc	    可选，上下文
		 */
		byClass:function(sArg,_doc){
			var reg = new RegExp("(^|\\s)"+ sArg +"(\\s|$)"),
				arr = [],
				aEl = util.dom.byName("*", _doc),
				i;
			for(i = 0; i < aEl.length; i++) reg.test(aEl[i].className) && arr.push(aEl[i]);
			return arr;
		},
		/**
		 * 元素选择器
		 * @name util.$
		 * @param {string}   sArg		#id/.clssName/tagName
		 * @param {object}   context	可选，上下文
		 */
		$: function(sArg, context) {
			switch(sArg.charAt(0)) {
				case "#":
					return util.dom.byId(sArg.substring(1),context);
					break;
				case ".":
					return util.dom.byClass(sArg.substring(1),context);
					break;
				default:
					return util.dom.byName(sArg,context);
					break;
			}
		},
		/**
		 * 获取目标父元素
		 * @name util.parent
		 * @param {object}   elem		目标元素
		 */
		parent:function(elem) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		/**
		 * 获取目标元素的子元素列表
		 * @name util.children
		 * @param {object}   elem		目标父级元素	
		 */
		children:function(elem){
			var n = elem.firstChild,
				r = [];
			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			};
			return r;
		},
		/**
		 * 获取目标下级元素
		 * @name util.next
		 * @param {object}   elem		目标元素
		 */
		next:function (elem){
			return util.dom._brother(elem,"nextSibling");
		},
		/**
		 * 获取目标上级元素
		 * @name util.prev
		 * @param {object}   elem		目标元素
		 */
		prev:function(elem){
			return util.dom._brother(elem,"previousSibling");
		},
		/**
		 * 获取目标第一个子元素
		 * @name util.first
		 * @param {object}   elem       目标元素	
		 */
		first:function(elem){
			elem=elem.firstChild;
			return (elem && elem.nodeType !=1) ? util.dom.next(elem):elem;
		},
		/**
		 * 获取目标元素最后一个子元素
		 * @name util.last
		 * @param {object} elem		目标元素
		 */
		last:function(elem){
			elem = elem.lastChild;
			return (elem && elem.nodeType !=1) ? util.dom.prev(elem):elem;
		},
		/**
		 * 获取DOM
		 */
		_brother:function(elem,position){
			do{
				elem = elem[position];
			}
			while (elem && elem.nodeType !=1);
			return elem;
		},
		/**
		 * 给元素追加内容到DOM
		 * @name util.append
		 * @param {object}   elem	    目标元素
		 * @param {string}   child  	追加内容
		 */
		append:function(elem,child){
			return util.dom._domManip(elem,child,function(c){
				if (this.nodeType == 1){
					this.appendChild(c);
				}	
			})
		},
		/**
		 * 给元素最前面元素追加内容到DOM
		 * @name util.prepend
		 * @param {object}   elem	    目标元素
		 * @param {string}   child  	追加内容
		 */
		prepend:function(elem,child){		
			return util.dom._domManip(elem,child,function(c){
				if (this.nodeType == 1){
					this.insertBefore(c,this.firstChild);
				}
			} );
		},
		/**
		 * 给元素之前追加内容到DOM
		 * @name util.before
		 * @param {object}   elem	    目标元素
		 * @param {string}   node    	追加内容
		 */
		before:function(elem,node){
			return util.dom._domManip(elem,node,function(c){
				this.parentNode.insertBefore(c,elem);
			});
		},
		/**
		 * 给元素之后追加内容到DOM
		 * @name util.before
		 * @param {object}   elem	    目标元素
		 * @param {string}   node   	追加内容
		 */
		after:function(elem,node){
			return util.dom._domManip(elem,node,function(c){
				this.parentNode.insertBefore(c,util.dom.next(elem));
			});
		},
		/**
		 * dom操作函数
		 */
		_domManip:function(elem,child,callback){
			var tmp = doc.createElement("div"),
				frag = doc.createDocumentFragment();
			if(typeof child  === "string"){
				tmp.innerHTML = child;
			}else{
				tmp.appendChild(child);
			};
			var n = tmp.firstChild;
			for ( ; n; n = n.nextSibling ) {
				if ( (n.nodeType === 1|| n.nodeType ===3) && n !== tmp ) {
					frag.appendChild(n);
				}
			};
			callback.call(elem,frag);
			return elem;			
		},
		/**
		 * 获取和设置元素特的值
		 * @name util.attr
		 * @param {object}   elem		目标元素
		 * @param {string}   attr       事件类型
		 * @param {string}   value	    事件值
		 */
		attr: function(elem,attr,value) {
			if(arguments.length == 2) {
				return elem.attributes[attr] ? elem.attributes[attr].nodeValue : undefined	
			}
			else if(arguments.length == 3) {
				elem.setAttribute(attr, value)	
			}
		},
		/**
		 * 从DOM树上移除目标元素
		 * @name util.remove
		 * @param {object}    elem      需要移除的元素
		 */
		remove:function(elem){
			var p = util.dom.parent(elem);
			p && p.removeChild(elem)
		},
		/**
		 * 给元素添加css
		 * @name util.css
		 * @param {object}    elem		目标元素
		 * @param {string}    css 		事件类型
		 * @return object {d: 元素应该生成的框的类型, p: 元素的定位类型, w: 元素的宽度, h: 元素的高度, t: 元素的顶部, l: 元素的左边, r: 元素的右边, b: 元素的底部}  	
		 */
		css:function(elem,css){
			if(!elem)return;
			var x,y,z,m;
				z = elem;
				x = z.style;               
			for(var s in css){
				m = css[s];
				y = m + "px";
				switch(s){
					case "opacity":
						x.filter = "alpha(opacity=" + m + ")";
						x.opacity = m / 100;
						break;
					default:
						x[s] = m;
						break;
				};        
			};
		},
		/**
		 * 获取元素css样式属性
		 * @name util.getStyle
		 * @param {object}   elem		目标元素	
		 */
		getStyle:function(elem){ 
			var style;
			if (doc.defaultView && doc.defaultView.getComputedStyle){
				style = doc.defaultView.getComputedStyle(elem, null);
			}else{
				style = elem.currentStyle;
			};	
			return style;
		},
        /**
         * 是否包含节点
         * @param  {Object} container
         * @param  {Object} contained
         * @return {Boolean}
         */
		contains: function(container, contained) {
            while (contained && contained.nodeName !== 'BODY') {
                if (container === contained.className) {
                    return true;
                }
                contained = contained.parentNode;
		    }
		    return false;
		},
		/**
		 * 判断目标元素是否包含指定的className
		 * @name util.hasClass
		 * @param {object}   elem		目标元素
		 * @param {string}   className	要检测的className
		 * @return boolean
		 */
		hasClass: function(elem,className) {
			return new RegExp("(^|\\s)" + className + "(\\s|$)").test(elem.className)
		},
		/**
		 * 给目标元素添加className
		 * @name util.addClass
		 * @param {object}   elem		目标元素
		 * @param {string}   className	要添加的className
		 */	
		addClass: function(elem,className) {
			var arr = elem.className.split(/\s+/);	
			util.dom.hasClass(elem,className) || arr.push(className);
			elem.className = arr.join(" ").replace(/(^\s*)|(\s*$)/, "")
		},
		/**
		 * 删除目标元素className
		 * @name util.removeClass
		 * @param {object}   elem		目标元素
		 * @param {string}   className	要删除的className
		 */
		removeClass: function(elem, className) {
			elem.className = elem.className.replace(new RegExp("(^|\\s)" + className + "(\\s|$)", "g"), "").split(/\s+/).join(" ")	
		},
		/**
		 * 对目标元素 class 的切换方法，即：如果元素用此class则移除此class，如果没有此class则添加此class
		 * @name util.toggleClass
		 * @param {object}  elem       目标元素
		 * @param {String}  className  class 名称
		 */
		toggleClass:function(elem, className){
			this.hasClass(elem,className) ? this.removeClass(elem,className) : this.addClass(elem,className);
		},
		/**
		 * 获取目标元素针对于文档的位置
		 * @name util.getOffsetPos
		 * @param  {object}   elem 目标元素
		 * @return {object}   {left: 元素左端距文档左侧位置, top: 元素左端距文档左侧位置}
		 */
		getOffsetPos:function(elem){
			if(!elem)return;
			var left = 0,top = 0;
			if("getBoundingClientRect" in docEl){
				var box = elem.getBoundingClientRect(),
					doc = elem.ownerDocument,
					clientTop = doc.clientTop || doc.body.clientTop || 0,
					clientLeft = doc.clientLeft || doc.body.clientLeft || 0 ,
					left = box.left + (self.pageXOffset || docEl  && docEl.scrollLeft || doc.body.scrollTop) - clientLeft,
					top = box.top + (self.pageYOffset || docEl && docEl.scrollTop || doc.body.scrollTop) - clientTop;
			}else{
				do{
					top+=elem.offsetTop,
					left+=elem.offsetLeft,
					elem = elem.offsetParent;
				}while(elem)
			 };
			 return {left:left,top:top}
		},
		/**
		 * 获取视口的大小
		 * @name util.getView
		 * @return {object}  {width: 视口的宽度, height: 视口的高度, scrollTop: 浏览器垂直滚动位置, scrollLeft: 浏览器水平滚动位置}  	
		 */
		getView:function(){
			var clientHeight = docEl.clientHeight || doc.body.clientHeight,
				clientWidth = docEl.clientWidth || doc.body.clientWidth,
				scrollTop = docEl.scrollTop || doc.body.scrollTop,
				scrollLeft = docEl.scrollLeft || doc.body.scrollLeft;
			return {width:clientWidth,height:clientHeight,scrollTop:scrollTop,scrollLeft:scrollLeft};
		}
	};
	
	//声明快捷方法
	util.id = util.dom.byId;
	util.name = util.dom.byName;
	util.byClass = util.dom.byClass;
	util.$ = util.dom.$;
	util.append = util.dom.append;
	util.prepend = util.dom.prepend;
	util.before = util.dom.before;
	util.after = util.dom.after;
	util.attr = util.dom.attr;
	util.remove = util.dom.remove;
	util.css = util.dom.css;
	util.getStyle = util.dom.getStyle;
    util.contains = util.dom.contains;
	util.hasClass = util.dom.hasClass;
	util.addClass = util.dom.addClass;
	util.removeClass = util.dom.removeClass;
	util.toggleClass = util.dom.toggleClass;
	util.getOffsetPos = util.dom.getOffsetPos;
	util.getView = util.dom.getView;
	
	/**
	 * 判断浏览器类型和版本
	 * @name util.browser
	 *
	 */ 
	util.browser = {
		version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
		chrome: /chrome/.test( userAgent ), 
		safari: /webkit/.test( userAgent ),
		opera: /opera/.test( userAgent ),
		msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
		mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent ),
		mobile: /Mobile/i.test( userAgent ) || 'ontouchstart' in doc.documentElement,
		ios: /\(i[^;]+;( U;)? CPU.+Mac OS X/i.test( userAgent ),
		iphone: /iphone/i.test( userAgent ),
		ipad: /ipad/i.test( userAgent ),
		android: /android/i.test( userAgent ) || /Linux/i.test( userAgent )
	};

	/**
	 * 遍历所有元素
	 * @name util.each
	 * @param  {object}     elem         目标元素
	 * @param  {function}   callback     
	 */ 
	util.each = function(elem,callback){
		if("function" == typeof callback){
			var returnValue,i, len = elem.length;
			for(i = 0; i<len;i++){
				returnValue = callback.call(elem[i],i,elem[i]);
				if(returnValue === false){break}
			}
			
		};
		return elem;	
	};

	/**
	 * 扩展
	 * @name util.extend
	 * @param {object}   elem	   目标元素
	 * @param {string}   options   扩展元素	
	 */
	util.extend = function(elem,options){ 
		for(var item in options){
			elem[item] = options[item];
		};
		return elem;
	};

	/**
	 * 判断目标参数是否Array对象
	 * @name util.isArray
	 * @param {string}   source    目标参数
	 */
	util.isArray = function(source){
		return '[object Array]' == Object.prototype.toString.call(source);
	};
	/**
	 * 判断目标参数是否为function或Function实例
	 * @name util.isFunction
	 * @param {string}   source    目标参数
	 */
	util.isFunction = function(source){
		return '[object Function]' == Object.prototype.toString.call(source);
	};

	/**
	 * 删除目标字符串两端的空白字符
	 * @name util.trim
	 * @param {string}   source   目标参数
	 */
	util.trim =  function(source){
		var trimer = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)', 'g');
        return source.replace(trimer, '');
	};
	/**
	 * 转化JSON格式
	 * @param  {data}    data    数据
	 */
	util.parseJSON = function( data ){
		if ( typeof data !== "string" || !data ) {
			return null;
		}
		// JSON RegExp
		var rvalidchars = /^[\],:{}\s]*$/,
			rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
			rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
			rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = util.trim( data );
		
		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test(data.replace(rvalidescape, "@")
			.replace(rvalidtokens, "]")
			.replace(rvalidbraces, "")) ) {

			// Try to use the native JSON parser first
			return window.JSON && window.JSON.parse ?
				window.JSON.parse( data ) :
				(new Function("return " + data))();

		} else {
			throw "Invalid JSON: " + data;
		}
	};
	/**
	 * 解决ie eval问题
	 * @name util.globalEval
	 * @param {string}   data    数据
	 */
	util.globalEval = function(data){
		var data = util.trim(data);
		if(data){
			var script = document.createElement("script");
			script.type = "text/javascript";
			if(util.browser.msie){
				script.text = data;
			}else{
				script.appendChild(document.createTextNode( data ) );
			}
			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			_head.insertBefore( script, _head.firstChild );
			_head.removeChild( script );
		}
	};
	/**
	 * 加载Css
	 * @name util.loadStyle
	 * @param  {string}    url     url地址
	 */
	util.loadStyle = function (url) {
		var css = document.createElement("link");
		css.setAttribute("rel", "stylesheet");
		css.setAttribute("type", "text/css");
		css.setAttribute("href", url);
		head.appendChild(css);        
	};
	/**
	 * 加载Javascript
	 * @name util.loadScript
	 * @param  {string}              url              url地址
	 * @param  {function | string}   opt_callback     数据加载结束时调用的函数或函数名
	 * @param  {object}              options          其他可选项
	 * @config {string}              [charset]        script的字符集
	 * @config {string}              [timeout]        超时时间，超过这个时间将不再响应本请求
	 */
	util.loadScript = function(url,opt_callback,options){
		var script      = document.createElement("script"),
			done        = true,
			timer,
			url         = url || "",
			callback    = opt_callback || function(){},
			opt         = options || {},
			timeout     = opt.timeout,
			charset     = opt.charset;
		
		if(timeout){
			timer = setTimeout(function(){
				script.onload = script.onreadystatechange = null;
			},timeout)
		};
		
		// IE和opera支持onreadystatechange
		// safari、chrome、opera支持onload	
		script.onload = script.onreadystatechange = function () {
			if (done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = false;
				try{
					callback();
					timeout && clearTimeout(timer);
				}catch(e){};
				head.removeChild( script );
			}
		};
		
		script.src = url;
		script.type	= "text/javascript";
		script.async = true;
		if(charset){
			script.charset = charset;
		};
		head.appendChild(script);	
	};

	
	function timeNow(){
		return +new Date;
	};
	/**
	 * cookie
	 */
	util.cookie = {
		/**
		 * 获取cookie的值,不对值进行解码
		 * @name util.cookie.getRaw
		 * @param {string} 	 key       目标参数 
		 */
		getRaw: function(key){
			if (util.cookie._isValidKey(key)) {
				var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
					result = reg.exec(document.cookie);
				if (result) {
					return result[2] || null;
				}
			}
			return null;
		},
		/**
		 * 获取cookie的值,用decodeURIComponent进行解码
		 * @name util.cookie.get
		 * @param {string} 	 key      目标参数 
		 */
		get: function(key){
			var value = util.cookie.getRaw(key);
			if ('string' == typeof value) {
				value = decodeURIComponent(value);
				return value;
			}
			return null;
		},
		/**
		 * 设置cookie的值,不对值进行解码
		 * @name util.cookie.setRaw
		 * @param {string} 	  key           目标参数
		 * @param {string} 	  value         设置参数值	
		 */
		setRaw: function(key, value, options){
			if (!util.cookie._isValidKey(key)) {
				return;
			}
			
			options = options || {};
			//options.path = options.path || "/"; // meizz 20100402 设定一个初始值，方便后续的操作
			//berg 20100409 去掉，因为用户希望默认的path是当前路径，这样和浏览器对cookie的定义也是一致的
			
			// 计算cookie过期时间
			var expires = options.expires;
			if ('number' == typeof options.expires) {
				expires = new Date();
				expires.setTime(expires.getTime() + options.expires);
			}
			
			document.cookie =
				key + "=" + value
				+ (options.path ? "; path=" + options.path : "")
				+ (expires ? "; expires=" + expires.toGMTString() : "")
				+ (options.domain ? "; domain=" + options.domain : "")
				+ (options.secure ? "; secure" : ''); 
		},
		/**
		 * 设置cookie的值,用decodeURIComponent进行解码
		 * @name util.cookie.set
		 * @param {string} 	  key           目标参数
		 * @param {string} 	  value         设置参数值	
		 */
		set: function(key, value, options){
			util.cookie.setRaw(key, encodeURIComponent(value), options);
		},
		/**
		 * 删除cookie的值
		 * @name util.cookie.remove
		 * @param {string} 	  key           目标参数
		 */
		remove: function(key, options){
			options = options || {};
			options.expires = new Date(0);
			util.cookie.setRaw(key, '', options);
		},
		_isValidKey: function(key){
			return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
		}
	};
	/**
	 * event对象
	 * @name util.event
	 * @param  {object}	  event        event事件
	 * @return {object}   {type: 类型, target: 目标元素, relatedTarget: 元素相关元素, pageX: 鼠标指针的X位置, pageY: 鼠标指针的Y位置, stopPropagation: 阻止事件冒泡, preventDefault: 阻止事件默认行为}
	 */
	util.event = function(event){
		event = event || win.event;
		if ( event[expando] == true ) return event;
		var originalEvent = event;
		// Mark it as fixed
		event[expando] = true;
		event = { originalEvent: originalEvent };
		// stopPropagation
		event.stopPropagation = function() {
			originalEvent.stopPropagation ? originalEvent.stopPropagation() : originalEvent.cancelBubble = true
		};
		// preventDefault
		event.preventDefault = function(){
			originalEvent.preventDefault ? originalEvent.preventDefault() : originalEvent.returnValue = false;
		};
		// type
		typeof originalEvent.type == "string" && ( event.type = originalEvent.type );
		// target
		if ( !event.target ){
			event.target = originalEvent.target || originalEvent.srcElement;
		}
		// check if target is  a textnode (safari)
		if ( event.target.nodeType == 3 )
			event.target = event.target.parentNode;
		// relatedTarget
		if ( !event.relatedTarget && event.fromElement )
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
		// pageX/Y	
		if ( event.pageX == null && originalEvent.clientX != null ) {
			event.pageX = originalEvent.clientX + (docEl && docEl.scrollLeft || doc.body && doc.body.scrollLeft || 0) - (docEl.clientLeft || 0);
			event.pageY = originalEvent.clientY + (docEl && docEl.scrollTop || doc.body && doc.body.scrollTop || 0) - (docEl.clientTop || 0);
		}
		return event;
	};

	/**
	 * 是否IE6浏览器
	 * @return {Boolean} 
	 */
	util.isIE6 = function(){
		return util.browser.msie && util.browser.version == "6.0";
	}

	/**
	 * 是否移动终端
	 * @return {Boolean}
	 */
	util.isMobile = function(){
		return util.browser.mobile
	}

	/**
	 * 将字符串中的占位符替换为对应的键值
	 * @param  {[string]}     s 模板
	 * @param  {[object]}     o 数据
	 */
	util.render = function(s,o,f) {
        return ((s.replace) ? s.replace(/\{(\w+)\}/g,function(match,key) {
            var ret = !f ? o[key] : f(key);
            return ret !== undefined ? ret : match;
        }):'');
	}

	win.util = util;

}(window, document);