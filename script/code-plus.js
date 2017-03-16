/**
 * @author: shangyidong@meituan.com
 * Date: 2017-03-16
 * Time: 上午11:37
 */
var xmlHttp = false;
var betaBranchName = "";
var betaBranchUrl = "";
var host = "";
var groupName;
var appName;

$(function(){
	console.log('------begin------');
	console.log(jQuery);

    //获取域名
	host = window.location.host;
	var host2 =document.domain; 

	//获取页面完整地址
	var url = window.location.href;
	console.log("当前页面url：" + url);
	console.log(host);
	console.log(host2);
	console.log(url);

	if (host != "code.dianpingoa.com") {
		console.log("code-plus插件只在code.dianpingoa.com域名下有效");
		return;
	}

	var urlArray = url.split("/");
	console.log(urlArray.length);

	groupName = urlArray[3];
	appName = urlArray[4];
	var masterBranchUrl = "";
	//http://code.dianpingoa.com/settlebill/bb-merchant-finance-bill/ci_branch/lightMerge_beta
	if (groupName && appName) {
		masterBranchUrl = "http://" + host + "/" + groupName + "/" + appName + "/ci_branch/master";
		console.log(masterBranchUrl);
	} else {
		console.log("解析master分支url失败");
		return;
	}

    xmlHttp = createXMLHttpRequest();  
	//var url = "http://code.dianpingoa.com/tradesettle/ts-atm/ci_branch/master";  
	xmlHttp.open("GET", masterBranchUrl, true);// 异步处理返回   
	xmlHttp.onreadystatechange = backMessage;   
	//xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");  
	xmlHttp.send(); 
})


function backMessage() {
	console.log(xmlHttp.readyState);
	console.log(xmlHttp.status);
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        var str = xmlHttp.responseText;
        var doc = $.parseHTML(str);
        //console.log($(doc));
        $.each( doc, function( i, el ) {
	    	//nodeNames[i] = "<li>" + el.nodeName + "</li>";
	    	console.log(i + "---" +el.nodeName);
	    	if (i == 23) {
	    		//console.log($(el));
	    		//console.log($(el).children()[0].children[0].children[0].children[0].children[1].children[0].children.length);
	    		var branchNum = $(el).children()[0].children[0].children[0].children[0].children[1].children[0].children.length;
	    		for (var i = branchNum - 1; i >= 0; i--) {
	    			var branch = $(el).children()[0].children[0].children[0].children[0].children[1].children[0].children[i];
	    			var branchName = branch.value;
	    			//console.log(branch + "--" + branch.text);
	    			if (branch.text.indexOf("[beta]") > 0) {
	    				console.log("beta分支名称：" + branchName);
	    				betaBranchName = branchName;
	    				betaBranchUrl = "http://" + host + "/" + groupName + "/" + appName + "/ci_branch/" + betaBranchName;
	    				var betaLink = $("<a>Beta</a>");
	    				betaLink.attr("href", betaBranchUrl);
	    				$($(".ci")[0]).append($("<a href='" + betaBranchUrl + "'><h1 class=\"project_name\">Beta</h1></a>"));
	    			}
	    		}
	    	} 
	    });
    }
}

function createXMLHttpRequest() {  
    var xmlHttp;  
    if (window.XMLHttpRequest) {  
        xmlHttp = new XMLHttpRequest();  
        if (xmlHttp.overrideMimeType)  
            xmlHttp.overrideMimeType('text/xml');  
    } else if (window.ActiveXObject) {  
        try {  
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");  
        } catch (e) {  
            try {  
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");  
            } catch (e) {  
            }  
        }  
    }  
    return xmlHttp;  
}  