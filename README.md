zselect
=======

a jquery chosen plugin, its value`s in the order of select when select is multiple, it has remark of every item

How to use?
=======
you can use like this:	
	
	[html]
	<input type="hidden" name="contry_code" id="test-select">
	
	[js]
	$("#test-select").zselect({
		multiple: true/false	//is multiple select or not
		options:[{				//select options
			value:1,
			label:"China",
			mark:"Asia"
		},{
			value:2,
			label:"USA",
			mark:"America"
		},{
			value:3,
			label:"India",
			mark:"Asia"
		}],
		value:[1,2]
	});
	
Also, you can use it like this:

	[html]
	<input type="hidden" name="contry_code" id="test-select" data-multiple="true" data-options='[{value:1,label:"China",mark:"Asia"},{value:2,label:"USA",mark:"America"},{value:3,label:"India",mark:"Asia"}]' value="1,2">
	
	[js]
	$("#test-select").zselect();