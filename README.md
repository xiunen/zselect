zselect
=======

a jquery chosen plugin, it`s value has order when select multiple, it has remark of every item

How to use?
=======
html like	
	
	<input type="hidden" name="contry_code" id="test-select">

js like:

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