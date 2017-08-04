$.PopupLog = {
PopupWarn: function(log){
	console.log("****PopupWarn: " + log );
},

PopupError: function(log){
	console.log("****PopupError: " + log);
},

PopupMention: function(log){
	console.log("***PopupMention: " + log);
},
};

$.PopupItemsId = {
duedate_form: "duedate-form",

duedate_input: "duedate-input",

duedate_checkbox: "duedate-now",

duedate_button: "duedate-button",
};

$("#" + $.PopupItemsId.duedate_form).submit(function(datas){
	var input_date = $("#" + $.PopupItemsId.duedate_input).val();
	var selected = $("#"+$.PopupItemsId.duedate_checkbox).prop('checked');
	if(input_date)
	{
		var data = {'duedate_input': input_date, 'duedate_now': selected};
		chrome.storage.local.set(data, function(){
			$.PopupLog.PopupMention("input_date saved!");
		});

		var dataToSend = {option: 'update_duedate', value: data};
		chrome.runtime.sendMessage(dataToSend, function(response){
			$.PopupLog.PopupMention("popup send data to background!");
		});

		$.WQ_Animation.buttonMoveAnimation(300, true, function(){
			$("#"+$.PopupItemsId.duedate_button).prop('disabled', true);
		});
	}

	//necessary
	return false;
});

$("#"+$.PopupItemsId.duedate_checkbox).change(function(datas){
	var isChecked = $("#"+$.PopupItemsId.duedate_checkbox).prop('checked');
	if(true == isChecked){
		var current_date = new Date();
		var year = current_date.getFullYear();
		var mon = ("0" + (current_date.getMonth() + 1)).slice(-2);
		var day = ("0" + current_date.getDate()).slice(-2);

		$("#"+$.PopupItemsId.duedate_input).val(year + '-' + mon + '-' + day);
	}
	$.WQ_Animation.buttonMoveAnimation(300, false, function(){
		$("#"+$.PopupItemsId.duedate_button).prop('disabled', false);
	});
	return false;
});

$("#"+$.PopupItemsId.duedate_input).change(function(){
	$("#"+$.PopupItemsId.duedate_checkbox).prop('checked', false);
	$.WQ_Animation.buttonMoveAnimation(300, false, function(){
		$("#"+$.PopupItemsId.duedate_button).prop('disabled', false);
	});
	return false;
});

$("#danger-button").click(function(){
	alert("看什么看，自己加！");
});

$.PopupManager = {
initManager: function()
{
	chrome.storage.local.get("duedate_now", function(value){
		if(value.duedate_now == undefined)
		{
			chrome.storage.local.set({'duedate_now': true}, function(){});
		}
	});
	chrome.storage.local.get("duedate_input", function(value){
		if(value.duedate_input == undefined)
		{
			$.Popupmanager.setDuedateCurrentTime();
			var input_date = $("#" + $.PopupItemsId.duedate_input).val();
			if(input_date)
			{
				chrome.storage.local.set({'duedate_input': input_date}, function(){});
			}
		}
	});
	$.PopupManager.initDuedateInput();
	$.PopupManager.initDuedateCheckBox();
	//$.PopupManager.initDuedateInput();
},

initDuedateCheckBox: function()
{
	chrome.storage.local.get("duedate_now", function(value){
		$("#"+$.PopupItemsId.duedate_checkbox).prop('checked', value.duedate_now);
		console.log(value.duedate_now);
		if(value.duedate_now == true)
		{
			$.PopupManager.setDuedateCurrentTime();
		}
	});
},

initDuedateInput: function()
{
	chrome.storage.local.get("duedate_input", function(value){
		$("#" + $.PopupItemsId.duedate_input).val(value.duedate_input);
	});
},

setDuedateCurrentTime: function()
{
	var current_date = new Date();
	var year = current_date.getFullYear();
	var mon = ("0" + (current_date.getMonth() + 1)).slice(-2);
	var day = ("0" + current_date.getDate()).slice(-2);

	$("#"+$.PopupItemsId.duedate_input).val(year + '-' + mon + '-' + day);
},
};

$.WQ_Animation = {

buttonMoveAnimation: function(speed, fromLeftToRight, callback){
	var buttonIssue = $("#"+$.PopupItemsId.duedate_button);
//	var buttonWidth = buttonIssue.css('marginLeft')*2+buttonIssue.css('borderLeft')*2+buttonIssue.css('paddingLeft')*2+buttonIssue.width();
	var buttonWidth = buttonIssue.outerWidth(true);
	var left = $("#"+$.PopupItemsId.duedate_form).width() - buttonWidth;
	if(fromLeftToRight == true)
	{
		$("#"+$.PopupItemsId.duedate_button).animate({"margin-left": left+"px"}, speed, "swing", callback);
	}
	else
	{
		$("#"+$.PopupItemsId.duedate_button).animate({"margin-left": "0px"}, speed, "swing", callback);
	}
},

buttonMove: function(el, mouseLeft, mouseTop){
	var buttonWidth = el.outerWidth(true);
	var buttonHeight = el.outerHeight(true);

	var leftRnd = (Math.random()-0.5);
	var topRnd = (Math.random()-0.5);
	var btnLeft = mouseLeft + (leftRnd>0?(leftRnd+1):(leftRnd-1))*buttonWidth;
	var btnTop = mouseTop+(topRnd>0?(topRnd+1):(topRnd-1))*buttonHeight;
	btnLeft = btnLeft<0?(btnLeft+window.innerWidth-buttonWidth):btnLeft;
	btnLeft = btnLeft>window.innerWidth?(btnLeft-window.innerWidth+buttonWidth):btnLeft;
	btnTop = btnTop<0?(btnTop+window.innerHeight-buttonHeight):btnTop;
	btnTop = btnTop > window.innerHeight?(btnTop-window.innerHeight+buttonHeight):btnTop;
	el.css({"position": "fixed"});
	el.css({"left": btnLeft+'px'});
	el.css({"top": btnTop+'px'});
},

overButton :function(e){
	if(!e){
		e = window.event;
	}
	$.WQ_Animation.buttonMove($("#danger-button"), e.clientX, e.clientY);
	return false;
},
cannotTouch: function(){
	var a = $("#danger-button");
	a.mouseover($.WQ_Animation.overButton);
},

};

//initial
$.PopupManager.initManager();
$.WQ_Animation.cannotTouch();
