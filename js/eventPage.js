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

$.popUpPort = 0;
$.username = "none";
$.testActionId = 61;

$.portManager = {
autoRunPortList : {},

addPort:  function(tab_id, new_port)
{
	if(new_port)
	{
		$.portManager.autoRunPortList[tab_id] = new_port;
		$.BGLog.BGMention("Add port: "+tab_id+"	--> "+new_port);
	}
},

getPort: function(tab_id)
{
	return $.portManager.autoRunPortList[tab_id];
},

deletePort: function(tab_id)
{
	delete $.portManager.autoRunPortList["tab_id"];
},

};

chrome.runtime.onConnect.addListener(function(port){
	if(port.name == "autorun")
	{
		$.BGLog.BGMention("AutoRun port is connected!");
		var tabID = port.sender.tab.id;
		$.portManager.addPort(tabID, port);
	}
	else if(port.name == "popup")
	{
		$.BGLog.BGMention("PopupRun port is connected!");
		$.popUpPort = port;
	}

	if(port)
	{
		port.onMessage.addListener(function(message)
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
	// chrome.storage.local.get("duedate_now", function(value){
	// 	if(value.duedate_now == undefined)
	// 	{
	// 		chrome.storage.local.set({'duedate_now': true},function(){
	// 			$.BGLog.BGMention("init duedate_now: true");
	// 		});
	// 	}
	// });

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

setDuedate: function(tab_id, issue_ID, ALT_token, DueDate)
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
			singleField: true,
			filedsToForcePresent: "duedate",
		}
	};

	current_port = $.portManager.getPort(tab_id);
	if(current_port)
	{
		$.BGLog.BGMention("postMessage: "+message);
		current_port.postMessage(message);
	}
	else
	{
		alert("修改到期日失败！");
	}
},

setCompleteDate: function(tab_id, issue_ID, ALT_token, CompleteDate)
{
	var message = {
		option: "set_complete_date",
		value: {
			url: "https://jira.cvte.com/secure/AjaxIssueAction.jspa?decorator=none",
			requestHeader: {"X-AUSERNAME": $.username,
							"X-SITEMESH-OFF": true},
			customfield_11321: CompleteDate,
			issueId: issue_ID,
			atl_token: ALT_token,
			singleField: true,
			filedsToForcePresent: "customfield_11321",
		}
	};

	current_port = $.portManager.getPort(tab_id);
	if(current_port)
	{
		$.BGLog.BGMention("postMessage: "+message);
		current_port.postMessage(message);
	}
	else
	{
		alert("修改实际完成日失败！");
	}
},

reloadOperation: function(tab_id)
{
	var message = {
		option: "reload",
	}
	current_port = $.portManager.getPort(tab_id);
	if(current_port)
	{
		$.BGLog.BGMention("postMessage: "+message);
		current_port.postMessage(message);
	}
	else
	{
		alert("刷新页面失败！");
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

$.dataHandler = {
m_urlData: [],
updateUrlData: function(urlmsg)
{
	m_urlData = urlmsg;
},

updateDuedate:	function(tabId)
{
	chrome.storage.local.get("duedate_input", function(value){
		var duedate = value.duedate_input;
		duedate = $.background.convertDate(duedate);
		if(duedate != undefined && m_urlData[2] == $.testActionId)
		{
			$.background.setDuedate(tabId, m_urlData[1], m_urlData[3], duedate);
		}
	});
},

updateCompleteDate:	function(tabId){
	chrome.storage.local.get("complete_date_input", function(value){
		var complete_date = value.duedate_input;
		complete_date = $.background.convertDate(complete_date);
		if(complete_date != undefined && m_urlData[2] == $.testActionId)
		{
			chrome.storage.local.get("enable_complete_date", function(data){
				if(data.enable_complete_date == true)
					$.background.setCompleteDate(tabId, m_urlData[1], m_urlData[3], complete_date);
				});
			}
		});
},

};

chrome.webRequest.onCompleted.addListener(
function(details){
	var url = details.url;
	var tabId = details.tabId;
	if(url.match($.turnTestUrlRegExp))
	{
		var urlmsg_arr = $.turnTestUrlRegExp.exec(url);
		//init url mssage
		$.dataHandler.updateUrlData(urlmsg_arr);
		//update duedate and complete date
		chrome.storage.local.get("enable_duedate", function(data){
			if(data.enable_duedate == true)
				$.dataHandler.updateDuedate(tabId);
		});

		chrome.storage.local.get("enable_complete_date", function(data){
			if(data.enable_complete_date == true)
				$.dataHandler.updateCompleteDate(tabId);
		});

		$.background.reloadOperation(tabId);
	}
	return {cancel: 0};

},//function
{urls: ["<all_urls>"]},
["responseHeaders"]
);//chrome

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
// {
// 	if(message.option == 'update_duedate')
// 	{
// 		chrome.storage.local.set(message.value, function(){
// 			$.BGLog.BGMention("update duedate complete!");
// 		});
// 	}
// });

$.background.backgroundInit();
