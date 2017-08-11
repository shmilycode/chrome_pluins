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
//duedate id
duedate_form: "duedate-form",
duedate_input: "duedate-input",
duedate_checkbox: "enable-duedate-checkbox",
duedate_button: "duedate-button",

//complete date id
complete_date_form: "complete-date-form",
complete_date_input: "complete-date-input",
complete_date_checkbox: "enable-complete-date-checkbox",
complete_date_button: "complete-date-button",

//procesing time id
processing_time_form: "processing-time-form",
processing_time_checkbox: "enable-processing-time-checkbox",
};

//data index
$.DataIndex = {
enable_duedate: "enable_dudate",
enable_complete_date: "enable_complete_date",
duedate_input: "duedate_input",
duedate_now: "duedate_now",
complete_date_input: "complete_date_input",
};

$.StorageManager = {
SaveDictionaryData: function(data)
{
	chrome.storage.local.set(data, function(){
		$.PopupLog.PopupMention("Date saved!");
	});
}
}

//////////////////////////////////////////////////////////////////////////
///////////////////////duedate event handle///////////////////////////////
//////////////////////////////////////////////////////////////////////////
$.DuedateHandler = {
onDuedateSwitchChange: function(event, state)
{
	var enabled = state;
	if(true == enabled){
		$('#'+$.PopupItemsId.duedate_input).attr('disabled',  false);
	}
	else {
		$('#'+$.PopupItemsId.duedate_input).attr('disabled',  true);
	}
	$.StorageManager.SaveDictionaryData({"enable_duedate": enabled});
	return false;
},

onDuedateFormSubmit: function(dates)
{
	var input_date = $("#" + $.PopupItemsId.duedate_input).val();
	if(input_date)
	{
		var data = {"duedate_input": input_date,
			 "enable_duedate": true};
		$.StorageManager.SaveDictionaryData(data);

		var dataToSend = {option: 'update_duedate', value: data};
		chrome.runtime.sendMessage(dataToSend, function(response){
			$.PopupLog.PopupMention("popup send data to background!");
		});
	}

	//necessary
	return false;
},

onDuedateInputChange: function()
{
	$.DuedateHandler.onDuedateFormSubmit();
	return false;
},
};
///////////////////////duedate event handle end///////////////////////////////
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
///////////////////////complete date event handle/////////////////////////
$.CompleteDateHandler = {

onCompleteDateSwitchChange: function(event, state)
{
	var enabled = state;
	if(true == enabled){
		$('#'+$.PopupItemsId.complete_date_input).attr('disabled', false);
	}
	else {
		$('#'+$.PopupItemsId.complete_date_input).attr('disabled', true);
	}
	//store it
	$.StorageManager.SaveDictionaryData({"enable_complete_date": enabled});
	return false;
},

onCompleteDateFormSubmit: function(datas)
{
	var input_date = $("#" + $.PopupItemsId.complete_date_input).val();
	if(input_date)
	{
		var data = {"complete_date_input": input_date,
			 "enable_complete_date": true};
		$.StorageManager.SaveDictionaryData(data);

		var dataToSend = {option: 'update_complete_date', value: data};
		chrome.runtime.sendMessage(dataToSend, function(response){
			$.PopupLog.PopupMention("popup send data to background!");
		});
	}

	//necessary
	return false;
},

onCompleteDateInputChange: function()
{
	$.CompleteDateHandler.onCompleteDateFormSubmit();
	return false;
},
};
///////////////////////complete date event handle end/////////////////////////
//////////////////////////////////////////////////////////////////////////

$("#danger-button").click(function(){
	alert("看什么看，自己加！");
});

$.PopupUI = {
initUI: function()
{
	$.PopupUI.initDuedateForm();
	$.PopupUI.initCompleteDateForm();
	$.PopupUI.initProcessingTimeForm();
},

initDuedateForm: function()
{
	$('#'+$.PopupItemsId.duedate_checkbox).bootstrapSwitch();
	$("#"+$.PopupItemsId.duedate_checkbox).on('switchChange.bootstrapSwitch', $.DuedateHandler.onDuedateSwitchChange);
	$("#"+$.PopupItemsId.duedate_input).change($.DuedateHandler.onDuedateInputChange);
},

initCompleteDateForm: function()
{
	$('#'+$.PopupItemsId.complete_date_checkbox).bootstrapSwitch();
	$("#"+$.PopupItemsId.complete_date_checkbox).on('switchChange.bootstrapSwitch', $.CompleteDateHandler.onCompleteDateSwitchChange);
	$("#"+$.PopupItemsId.complete_date_input).change($.CompleteDateHandler.onCompleteDateInputChange);
},

initProcessingTimeForm: function()
{
	$('#' + $.PopupItemsId.processing_time_checkbox).bootstrapSwitch();
}
};

$.PopupManager = {
initManager: function()
{
	$.PopupManager.restoreDefaultDatabase();
	$.PopupManager.initDuedateInput();
	$.PopupManager.initDuedateCheckBox();
	$.PopupManager.initCompleteDateInput();
	$.PopupManager.initCompleteDateCheckBox();
},

restoreDefaultDatabase: function()
{
	chrome.storage.local.get("enable_duedate", function(value){
		if(value.duedate_now == undefined)
		{
			$.StorageManager.SaveDictionaryData({"enable_duedate": true});
		}
	});
	chrome.storage.local.get("duedate_input", function(value){
		if(value.duedate_input == undefined)
		{
			$.Popupmanager.setInputBoxCurrentTime($.PopupItemsId.duedate_input);
			var input_date = $("#" + $.PopupItemsId.duedate_input).val();
			if(input_date)
			{
				$.StorageManager.SaveDictionaryData({"duedate_input": input_date});
			}
		}
	});
	chrome.storage.local.get("enable_complete_date", function(value){
		if(value.enable_complete_date == undefined)
		{
			$.StorageManager.SaveDictionaryData({'enable_complete_date': true});
		}
	});

	chrome.storage.local.get("complete_date_input", function(value){
		if(value.complete_date_input == undefined)
		{
			$.PopupManager.setInputBoxCurrentTime($.PopupItemsId.complete_date_input);
			var input_date = $("#" + $.PopupItemsId.complete_date_input).val();
			if(input_date)
			{
				$.StorageManager.SaveDictionaryData({'complete_date_input': input_date});
			}
		}
	});
},

initDuedateCheckBox: function()
{
	chrome.storage.local.get("enable_duedate", function(value){
		$("#"+$.PopupItemsId.duedate_checkbox).bootstrapSwitch('state', value.enable_duedate);
	});
},

initDuedateInput: function()
{
	chrome.storage.local.get("duedate_input", function(value){
		$("#" + $.PopupItemsId.duedate_input).val(value.duedate_input);
	});
},

initCompleteDateCheckBox: function()
{
	chrome.storage.local.get("enable_complete_date", function(value){
		$("#"+$.PopupItemsId.complete_date_checkbox).bootstrapSwitch('state', value.enable_complete_date);
	});
},

initCompleteDateInput: function()
{
	chrome.storage.local.get("complete_date_input", function(value){
		$("#" + $.PopupItemsId.complete_date_input).val(value.complete_date_input);
	});
},
setInputBoxCurrentTime: function(input_box)
{
	var current_date = new Date();
	var year = current_date.getFullYear();
	var mon = ("0" + (current_date.getMonth() + 1)).slice(-2);
	var day = ("0" + current_date.getDate()).slice(-2);

	$("#"+input_box).val(year + '-' + mon + '-' + day);
},
};

$.WQ_Animation = {

buttonMoveAnimation: function(button, speed, fromLeftToRight, callback){
	var buttonIssue = $("#"+button);
//	var buttonWidth = buttonIssue.css('marginLeft')*2+buttonIssue.css('borderLeft')*2+buttonIssue.css('paddingLeft')*2+buttonIssue.width();
	var buttonWidth = buttonIssue.outerWidth(true);
	var left = $("#"+$.PopupItemsId.duedate_form).width() - buttonWidth;
	if(fromLeftToRight == true)
	{
		$("#"+button).animate({"margin-left": left+"px"}, speed, "swing", callback);
	}
	else
	{
		$("#"+button).animate({"margin-left": "0px"}, speed, "swing", callback);
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
$.PopupUI.initUI();
$.PopupManager.initManager();
$.WQ_Animation.cannotTouch();
