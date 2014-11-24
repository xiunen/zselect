(function(){
	var Zselect;
	/**
		elem.data
			-value
			-options
		config = {
			
		}
	*/
	Zselect = function(elem, config){
		this.init(elem, config || {});
	};
	Zselect.prototype = {
		default_config:{
			value_splitter: ",",
			width:"100%",
			multiple:false,
			option_template:function(item, i, search_token, index){
				var _this = this, regex = new RegExp("("+search_token+")", 'i');
                item.label = item.label.replace(/</g,"&lt;").replace(/>/g,"&gt;")
				return '<li data-value="'
					+ item.value
					+ '" class="zselect-clearfix'
					+ (index == -1 ? "" : " " + _this.config.disabled_class)
					+'"><span class="zselect-left zselect-label">'
					+ (item.label||"").replace(regex, '<b>$1</b>') +'</span><span class="zselect-right zselect-mark">'
					+ (item.mark || "")
					+ '</span></li>';
			},
			value_template:function(value, index){
				var item, str = "";
				this.options.every(function(that){
					if(that.value == value){
						item = that;
						return false;
					}
					return true;
				});
				if(!item)return str;
				str += '<span data-value="'+item.value+'" class="value-item zselect-left">';
				str += item.label.replace(/</g,"&lt;").replace(/>/g,"&gt;");
				if(this.multiple){
					str += '<a href="javascript:void(0)">&times;</a>';
				}
				str += '</span>';
				return str;
			},
			no_result_text: "find nothing",
			input_field_class: "input-field",
			dropdown_field_class: "dropdown-field",
			option_field_class: "option-field",
			value_field_class: "value-field",
			search_field_class: "search-field",
			highlight_class: "zselect-highlight",
			disabled_class:"zselect-disabled",
			active_class: "zselect-active",
			container_class: "zselect-container",
			multiple_select_class: "multiple-select",
			no_search:false
		},
		init:function(elem,config){
			this.config = $.extend({}, this.default_config, config);
			var	 value = config.value
					|| (elem.val && elem.val())
					|| elem.data("value"),
				_data_options = elem.data("options");
			this.element = elem;
			this.values = (value instanceof Array) ? value 
				: ((value && value.substring) ? value.split(this.config.value_splitter) : []);
			this.options = this.config.options 
				|| ((_data_options instanceof Array) ? _data_options : eval(_data_options))
				|| [];
			this.multiple = this.config.multiple
				|| (elem.data("multitple") ? true : false);
			this.render_option = this.config.option_template;
			this.render_value = this.config.value_template;
			this.no_search = this.config.no_search || elem.data("no_search");
			this.build_select();
			if(!elem.is(":hidden")){
				elem.hide();
			}
			this.build_style();
			this.bind_event();
		},
		build_style:function(){
			var ctx = $('<style/>');
			
			$('head').append(ctx);
		},
		build_select:function(){ 
			this.context = $('<div/>');
			this.context.addClass(this.config.container_class);
			if(this.multiple){
				this.context.addClass(this.config.multiple_select_class);
			}
			this.context.html('<div class="' + this.config.input_field_class + ' zselect-clearfix"></div><div class="'+this.config.dropdown_field_class+'" style="display:none"></div>');
			this.context.width(this.config.width);
			this.element.after(this.context);
			this.build_values();
			this.build_choices();
			if(!this.no_search){
				this.build_search();
			}
		},
		build_choices:function(search_token){
			var wrap = $('<ul/>'), 
				_this = this,
				_option_class = this.config.option_field_class,
				ctx = this.context.find('.' + _option_class),
				list = _this.options.filter(function(item){
					return !search_token || (item.label.indexOf(search_token) != -1);
				}), width, container;
			list = list.map(function(item, i){
				var index = -1;
				_this.values.every(function(_item, _i){
					if(_item + "" == item.value + ""){
						index = _i;
						return false;
					}
					return true;
				});
				return _this.render_option(item,i,search_token,index);
			});
			if(!list.length){
				list.push(_this.render_option({label:_this.config.no_result_text},0,"",0));
			}
			wrap.html(list.join(""));
			if(ctx.length){
				ctx.html(wrap);
			}else{
				ctx = $('<div/>');
				ctx.addClass(_option_class);
				ctx.html(wrap);
				container = this.context.find("." + _this.config.dropdown_field_class);
				container.width(this.context.width()-2);
				container.append(ctx);
			}
			ctx.find("." + _this.config.highlight_class).removeClass(_this.config.highlight_class);
			ctx.find("li:not(."+_this.config.disabled_class+")").first().addClass(_this.config.highlight_class);
		},
		build_values:function(){
			var _this = this,
				_value_class = this.config.value_field_class,
				ctx = this.context.find("." + _value_class),
				list = this.values.map(function(item, index){
					return _this.render_value(item, index);
				});
			if(ctx.length){
				ctx.html(list);
			}else{
				ctx = $('<div/>');
				ctx.addClass(_value_class);
                ctx.addClass("zselect-left");
				ctx.html(list);
				this.context.find("."+_this.config.input_field_class).prepend(ctx);
			}
		},
		rebuild_select:function(){
			this.element.val ? this.element.val(this.values.join(this.config.VALUE_SPLITTER)) 
				: this.element.data("value", this.values);
			this.build_values();
			this.build_choices();
		},
		build_search:function(){
			var _this = this,
				_search_class = _this.config.search_class || _this.default_config.search_field_class,
				ctx = _this.context.find("." + _search_class);
			if(!ctx.length){
				ctx = $('<div/>');
				ctx.addClass(_search_class);
                //if(this.multiple){
                ctx.addClass("zselect-left");
                //}
			}
			ctx.html('<input type="text">');
			//this.multiple ? this.context.find('.' + _this.config.input_field_class).append(ctx) 
			//	: this.context.find('.'+ _this.config.dropdown_field_class).prepend(ctx);
			this.context.find('.' + _this.config.input_field_class).append(ctx);
			
		},
		get_values: function(){
			return this.values;
		},
		set_values: function(values){
			values = (values instanceof Array) ? values : [values];
			this.values = values;
			this.rebuild_select();
		},
		remove_value:function(value){
			var _this = this;
			if(!value){
				_this.values.pop();
				_this.rebuild_select();
				this.element.trigger("change");
			}
		},
		remove_value2:function(value){
			var index = -1;
			this.values.every(function(item, i){
				if(item + "" == value + ""){
					index = i;
					return false;
				}
				return true;
			});
			if(index != -1){
				this.values.splice(index,1);
				this.rebuild_select();
				this.element.trigger("change");
			}
		},
		add_value:function(value){
			if(this.multiple){
				if(this.values.indexOf(value) == -1){
					this.values.push(value);
				}
			}else{
				this.values = [value];
				$("body").trigger("click");
			}
			this.rebuild_select();
			this.element.trigger("change");
		},
		arrow_up:function(elem){
			var _this = this, context = this.context.find("."+_this.config.option_field_class);
			var highlight_elem = context.find("."+_this.config.highlight_class), prev = highlight_elem.prev();
			if(highlight_elem.length){
                if(prev){
				    while(prev.length && prev.hasClass(_this.config.disabled_class)){
                        prev = prev.prev();
                    }
                    if(prev.length){
				        highlight_elem.removeClass(_this.config.highlight_class);
                        prev.addClass(_this.config.highlight_class);
                    }
                }
			}else{
				context.find("li:not(."+_this.config.disabled_class+")").last().addClass(_this.config.highlight_class);
			}
		},
		arrow_down:function(elem){
			var _this = this, context = this.context.find("."+_this.config.option_field_class+"");
			var highlight_elem = context.find("."+_this.config.highlight_class), next = highlight_elem.next();
			if(highlight_elem.length){
                if(next){
				    while(next.length && next.hasClass(_this.config.disabled_class)){
                        next = next.next();
                    }
                    if(next.length){
				        highlight_elem.removeClass(_this.config.highlight_class);
                        next.addClass(_this.config.highlight_class);
                    }
                }
			}else{
				context.find("li:not(."+_this.config.disabled_class+")").first().addClass(_this.config.highlight_class);
			}
		},
		add_hightlight_value:function(elem){
			var _this = this, context = this.context.find("."+_this.config.option_field_class+"");
			var highlight_elem = context.find("."+_this.config.highlight_class);
			if(highlight_elem.length){
				this.add_value(highlight_elem.data("value"));
				elem.val("");
			}
		},
		add_space_value:function(elem){
			var value = elem.val(),_this = this, _value, values, highlight_elem, context;
			value =$.trim(value);
			values = value.split(" ");
			_this.options.every(function(item){
				if(item.label + "" == value + ""){
					_value = item.value;
					return false;
				}
				return true;
			});
			if(_value){
				_this.add_value(_value);
				elem.val("");
			}else{
				context = this.context.find("."+_this.config.option_field_class+"");
				highlight_elem = context.find("."+_this.config.highlight_class);
				if(highlight_elem.length){
					this.add_value(highlight_elem.data("value"));
					elem.val("");
				}
			}
		},
		bind_event:function(){
			var _this = this;
			_this.context.on("keydown","."+_this.config.search_field_class+" input",function(e){
				var elem = $(this), value = elem.val(), BACKSPACE = 8, ENTER = 13;
				if(e.which == BACKSPACE || e.keyCode == BACKSPACE){
					_this.remove_value(value);
				}else if(e.which == ENTER || e.keyCode == ENTER){
                    return false;
                }
			});
			_this.context.on("keyup","."+_this.config.search_field_class+" input",function(e){
				var elem = $(this), value = elem.val(), key_map = {UP:38,DOWN:40,ENTER:13,BACKSPACE:8,SPACE:32};
				switch(e.which || e.keyCode){
					case key_map.UP:
						_this.arrow_up(elem);
						break;
					case key_map.DOWN:
						_this.arrow_down(elem);
						break;
					case key_map.ENTER:
						_this.add_hightlight_value(elem);
						break;
					case key_map.SPACE:
						_this.add_space_value(elem);
					default:
						_this.build_choices(value);
				}
				e.preventDefault();
			});
			_this.context.on("click","."+_this.config.input_field_class, function(e){
				var elem = $(this), is_active, dropdown = _this.context.find("."+_this.config.dropdown_field_class);
				is_active = elem.hasClass(_this.config.active_class);
				if(is_active){
					dropdown.hide();
					elem.removeClass(_this.config.active_class);
				}else{
                    dropdown.width(_this.context.width()-2);
					dropdown.show();
					elem.addClass(_this.config.active_class).val("");
					_this.context.find("input").trigger("focus");
				}
				return false;
			});
			_this.context.on("mouseenter","."+_this.config.option_field_class+" li:not(."+_this.config.disabled_class+")", function(){
				var elem = $(this);
				elem.siblings('li').removeClass(_this.config.highlight_class);
				elem.addClass(_this.config.highlight_class);
			});
			_this.context.on("mouseleave","."+_this.config.option_field_class+" li:not(."+_this.config.disabled_class+")", function(){
				var elem = $(this);
				elem.removeClass(_this.config.highlight_class);
			});
			_this.context.on("click","."+_this.config.option_field_class+" li:not(."+_this.config.disabled_class+")", function(){
				var elem = $(this);
				_this.add_value(elem.data("value"));
			});
			_this.element.on("zselect:update",function(){
				_this.rebuild_select();
			});
			_this.context.on("click","."+_this.config.search_field_class+" input", function(e){
				$(this).closest("." + _this.config.input_field_class).trigger("click");
				return false;
			});
			_this.context.on("click", "." + _this.config.value_field_class + " a", function(){
				var value = $(this).closest(".value-item").data("value");
				_this.remove_value2(value);
				_this.context.find("."+_this.config.input_field_class).trigger("click");
				return false;
			});
			$("html,body").on("click",function(){
				_this.context.find("."+_this.config.dropdown_field_class).hide();
				_this.context.find("."+_this.config.input_field_class).removeClass(_this.config.active_class);
			});
		}
	};
	$.fn.extend({
		zselect: function(opts){
			return this.each(function(){
				var elem = $(this), applied = elem.data("zselect");
				if(!applied){
					elem.data("zselect",new Zselect(elem, opts));
				}else{
					elem.trigger("zselect:update");
				}
			});
		}
	});
})();
