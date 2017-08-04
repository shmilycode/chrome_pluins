$.BGLog = {
BGWarn: function(log){
	console.log("****BackgroundWarn: " + log );
},

BGError: function(log){
	console.log("****BackgroundError: " + log);
},

BGMention: function(log){
	console.log("***BackgroundMention: " + log);
},
};

$.turnTestUrlRegExp = 
		/https:\/\/jira.cvte.com\/secure\/WorkflowUIDispatcher.jspa\?id=(\d+)?\&action=(\d+)?\&atl_token=(\w{4}-\w{4}-\w{4}-\w{4}\|\w+?\|lin)\&decorator=dialog\&inline=true\&\_=(\d+)?/;

$.autoRunPort = 0;
$.popUpPort = 0;
$.username = "none";
$.testActionId = 61;

chrome.runtime.onConnect.addListener(function(port){
	if(port.name == "autorun")
	{
		$.BGLog.BGMention("AutoRun port is connected!");
		$.autoRunPort = port;
	}
	else if(port.name == "popup")
	{
		$.BGLog.BGMention("PopupRun port is connected!");
		$.popUpPort = port;
	}

	if($.autoRunPort)
	{
		$.autoRunPort.onMessage.addListener(function(message)
		{
			if("set_username" == message.option)
			$.username = message.value.username;
		});
	}

	if($.popUpPort)
	{
		$.popUpPort.onMessage.addListener(function(message)
		{
		});
	}
});

$.background = {
backgroundInit: function()
{
	chrome.storage.local.get("duedate_now", function(value){
		if(value.duedate_now == undefined)
		{
			chrome.storage.local.set({'duedate_now': true},function(){
				$.BGLog.BGMention("init duedate_now: true");
			});
		}
	});

	chrome.storage.local.get("duedate_input", function(value){
		if(value.duedate_input == undefined)
		{
			var input_date = $.background.getToday();
			chrome.storage.local.set({'duedate_input': input_date}, function(){
				$.BGLog.BGMention("init duedate_input: "+input_date);
			});
		}
	});

	$.background.initDuedate();
},

initDuedate: function()
{
	chrome.storage.local.get("duedate_now", function(value){
		if(value.duedate_now == true)
		{	
			var input_date = $.background.getToday();
			chrome.storage.local.set({'duedate_input': input_date}, function(){
				$.BGLog.BGMention("initDuedate: set duedate_input: "+input_date);
			});
		}
	});
},

setDuedate: function(issue_ID, ALT_token, DueDate)
{
	var message = {
		option: "set_duedate",
		value: {
			url: "https://jira.cvte.com/secure/AjaxIssueAction.jspa?decorator=none",
			requestHeader: {"X-AUSERNAME": $.username,
							"X-SITEMESH-OFF": true},
			duedate: DueDate,
			issueId: issue_ID,
			atl_token: ALT_token,
			singleField: true
		}
	};
	if($.autoRunPort)
	{
		$.BGLog.BGMention("postMessage: "+message);
		$.autoRunPort.postMessage(message);
	}
	else
	{
		alert("修改到期日失败！");
	}
},		

monthInChinese: ["一月", "二月", "三月", "四月", "五月", "六月", "七月",
	"八月", "九月", "十月", "十一月", "十二月"],

convertDate: function(date)
{
	var jiraDateRegExp = /(\w+)?\-(\w+)?\-(\w+)?/;
	var jiraDate;
	if(date.match(jiraDateRegExp))
	{
		var result = jiraDateRegExp.exec(date);
		var month = parseInt(result[2]);
		if(month >= 1)
		{
			jiraDate = result[3] + "\/" + this.monthInChinese[month-1] + "\/" + result[1].slice(-2);
		}
	}
	return jiraDate;
},

getToday: function()
{
	var current_date = new Date();
	var year = current_date.getFullYear();
	var mon = ("0" + (current_date.getMonth() + 1)).slice(-2);
	var day = ("0" + current_date.getDate()).slice(-2);
	var input_date = year + '-' + mon + '-' + day;
	return input_date;
},

};

chrome.webRequest.onCompleted.addListener(
function(details){
	var url = details.url;
	var urlmsg_arr = $.turnTestUrlRegExp.exec(url);
	if(url.match($.turnTestUrlRegExp))
	{
		chrome.storage.local.get("duedate_input", function(value){
			var duedate = value.duedate_input;
			duedate = $.background.convertDate(duedate);
			if(duedate != undefined && urlmsg_arr[2] == $.testActionId)
			{
				$.background.setDuedate(urlmsg_arr[1], urlmsg_arr[3], duedate);
			}
		});
	}
	return {cancel: 0};

},//function
{urls: ["<all_urls>"]},
["responseHeaders"]
);//chrome

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
	if(message.option == 'update_duedate')
	{
		chrome.storage.local.set(message.value, function(){
			$.BGLog.BGMention("update duedate complete!");
		});
	}
});

$.background.backgroundInit();
