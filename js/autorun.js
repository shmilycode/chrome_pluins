$.WQLog = {
	LogHead: "****Log from Extension-> ",
	PError: function(log)
	{
		console.log(this.LogHead + "Error: " + log);
	},
	PWarn: function(log)
	{
		console.log(this.LogHead + "Warn: " + log);
	},
	PMention: function(log)
	{
		console.log(this.LogHead + "Mention: " + log);
	},
};

$.port = chrome.runtime.connect({name: "autorun"});

$.autorun = {
testItemId: "action_id_61",
editIssueId: "edit-issue",
dateItemId: "duedate",
moreItemId: "opsbar-operations_more",

setDuedate:function(options){
	var requestContent = {
        timeout: 1000,
        url: options.url, 
        type: "post",
		beforeSend: function(xhr){
			for(opt in options.requestHeader)
			{
				xhr.setRequestHeader(opt, options.requestHeader[opt]);
			}
		},
        data:{
			"customfield_11321": options.duedate,
			"issueId": options.issueId,
			"atl_token": options.atl_token,
			"singleFieldEdit": options.singleField,
			"fieldsToForcePresent": "duedate"
		},
        success: function(data){
			$.WQLog.PMention("duedate request success!");
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){
			$.WQLog.PError(XMLHttpRequest.status);
			$.WQLog.PError(XMLHttpRequest.readyState);
			$.WQLog.PError(textStatus);
        }
	};
	$.ajax(requestContent);     
//	window.location.reload();//刷新当前页面.
//	document.getElementById(this.editIssueId).click();
},

listenTurnText:function(){
	var moreIssue = $("#"+ this.moreItemId);
	moreIssue.click(function(){
		$.port.postMessage({option: "set_duedate"});
	});
},

turnTextCB: function()
{
},

buildConnect: function()
{
	if($.port)
	{
		$.port.onMessage.addListener($.autorun.responseHandle);
	}
	else
	{
		$.WQLog.PError("Can't connect with background!");
	}
},

responseHandle: function(rep)
{
	//$.autorun.setCurrentDate();
	if(rep.option == "set_duedate")
	{
		$.autorun.setDuedate(rep.value);
		//alert("load success!");
	}
	document.location.reload();
},

getMetaUserName: function()
{
	var metaItem = $("meta[name=ajs-remote-user]");
	return metaItem.attr("content");
},

initialize: function()
{
	/*
	$.ajax({
	url: "test.php", 
	success: function(data)
	{
		this.data.test_item = testId;
		this.data.date_item = dateId;
	},
	error: function()
	{
		$.WQLog.PError("Can't post data from server!!!");
	},
	complete: function()
	{
		$.WQLog.PMention("Post data complete!!!");
	}
	});
	*/
	this.buildConnect();
	var userName = {username: this.getMetaUserName()};
	$.WQLog.PMention(userName.username);
	$.port.postMessage({option: "set_username", value: userName});
}
};
$.autorun.initialize();

//$.autorun.listenTurnText();


