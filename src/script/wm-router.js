$(function(){
	

	var PMer = {
		$container:$('.wm-container'),
		_configs:[],
		_pageStack:[],
		_defaultPage:null,
		_pageIndex:1,
		setDefault:function(defaultName){
			this._defaultPage = this._find('name',defaultName)
			return this;
		},
		push:function(config){
			this._configs.push(config);
			return this;
		},
		init:function(){
			var self = this;
			$(window).on('hashchange',function(){
				var state = history.state || {};
				var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
				var page = self._find('url',url) || self._defaultPage;
				if(state._pageIndex<self._pageIndex || self._findInStack(url)){
					self._back(page);
				}else{
					self._go(page);
				}
			})

			if (history.state && history.state._pageIndex) {
                this._pageIndex = history.state._pageIndex;
            }

			this._pageIndex--;
			var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
			var page = self._find('url',url) || self._defaultPage;
			this._go(page);

			return this;
		},
		_go:function(config){
			this._pageIndex++;
			history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

			var html = $(config.template).html()
			var $html = $(html).addClass(config.name+' slideIn');
			$html.on('animationend webkitAnimationEnd',function(){
				$html.removeClass('slideIn')
			})
			this.$container.append($html);

			var stack = this._pageStack[this._pageStack.length-1] || {}
			try{
				stack.dom/*.remove()*/
					.addClass('slideGo')
					.on('animationend webkitAnimationEnd',function(){
						stack.dom.off('animationend webkitAnimationEnd').removeClass('slideGo').remove()
					})
			}catch(e){}

			this._pageStack.push({
				config:config,
				dom:$html
			})
			
			this.pageReady(config.name);
			console.warn('go')
		},
		_back:function(config){
			this._pageIndex--;
			var stack = this._pageStack.pop();
			var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
			var found = this._findInStack(url);
			if(!found){
				var html = $(config.template).html();
				var $html = $(html).addClass(config.name)
				this.$container.prepend($html)

				this._pageStack.push({
					config:config,
					dom:$html
				})

				this.pageReady(config.name);
			}else{
				var last_stack = this._pageStack[this._pageStack.length-1]
				this.$container.prepend(last_stack.dom)
				last_stack.dom.addClass('slideBack')
					.on('animationend webkitAnimationEnd',function(){
						last_stack.dom.removeClass('slideBack')
					})
				this.pageReady(config.name);
			}

			$('.fullpage').remove()
			stack.dom.addClass('slideOut').on('animationend webkitAnimationEnd',function(){
				stack.dom.remove()
			})
			console.warn('back')
		},
		_findInStack:function(url){
			var found = null;
			for(var i = 0;i<this._pageStack.length;i++){
				var stack = this._pageStack[i];
				if(stack.config.url === url){
					found = stack;
					break;
				}
			}
			return found;
		},
		_find:function(key,value){
			var page = null;
			for(var i = 0;i<this._configs.length;i++){
				if(this._configs[i][key] === value){
					page = this._configs[i];
					break;
				}
			}
			return page;
		},
		pageReady:function(name){
			var ob;
			try{
				ob = eval(name);
			}catch(e){}
			for(var k in ob){
				if((typeof ob[k] === 'function' || Object.prototype.toString.call(ob[k])==='[object Function]') && ob.hasOwnProperty(k)){
					if(k[0] !== '_'){
						ob[k]();
					}
				}
			}
		}
	}
	function setPM(){
		var pages = {},
			tpls = $('script[type="text/html"][id*="tpl_"]').not(".dialog");
		for(var i = 0;i<tpls.length;i++){
			var tpl = tpls[i],
				name = tpl.id.replace(/tpl_/,'')
			pages[name] = {
				name:name,
				url:'#'+name,
				template:'#'+tpl.id
			}
		}
		pages.home.url = '#';
		for(var page in pages){
			PMer.push(pages[page])
		}
		PMer
			.setDefault('home')
			.init()
	}
	setPM()



	
	

	
})