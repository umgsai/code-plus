/**
 * @author: shangyidong@meituan.com
 * Date: 2017-03-16
 * Time: 上午11:37
 */
var masterBranchUrl = "";
var betaBranchName = "";
var betaBranchUrl = "";
var host = "";
var groupName = "";
var appName = "";
var url = "";

String.prototype.endWith=function(endStr){
    var d=this.length-endStr.length;
    return (d>=0&&this.lastIndexOf(endStr)==d)
}

$(function(){
    host = window.location.host;
    if (host != "code.dianpingoa.com") {
        console.log("code-plus插件只在code.dianpingoa.com域名下有效");
        return false;
    }

    var title = $('title');
    title.bind('DOMNodeInserted', function(e) {
        var newUrl = window.location.href;
        console.log("newUrl:" + newUrl);
        var newUrlArray = newUrl.split("/");

        if( groupName == newUrlArray[3] && appName == newUrlArray[4]) {
            console.log("项目没有改变");
        } else {
            console.log("项目已改变");
            groupName = newUrlArray[3];
            appName = newUrlArray[4];
            if (initAppInfo()){
                getBetaBranchName();
            }
        }

        //groupName = newUrlArray[3];
        //appName = newUrlArray[4];
        //等待新页面渲染完成
        setTimeout(function () {
            updatePage();
        }, 400);

        setTimeout(function () {
            if (newUrl == betaBranchUrl) {
                //给beta分支页面添加链接
                updateBetaPage();
            }
        }, 500);
    });

    if (!initAppInfo()) {
    	return;
	}

    getBetaBranchName();
})

function updateBetaPage() {
    console.log("已切换到beta分支..");
    console.log($(".module-machine-list")[0].children[1].children.length);
    var tbody = $(".module-machine-list")[0].children[1].children;
    //var modules = tbody.children;
    //console.log("模块数量：" + tbody);
    for (var i = 0; i < tbody.length; i++) {
        var tr = tbody[i]
        //console.log(tr.children.length);
        for (var j = 0; j < tr.children.length; j++) {
            var module = tr.children[j].children[1].children[0];
            var moduleName = module.innerHTML;
            moduleName = moduleName.replace(/[\r\n]/g,"");//去掉特殊字符
            //console.log(module);
            if (String(moduleName).endWith("-service")) {
                console.log("service："  + moduleName);
                console.log(tr.children[3].children[1]);
                var serviceIp = tr.children[3].children[1].innerHTML;
                serviceIp = serviceIp.replace(/[\r\n]/g,"");//去掉特殊字符
                if (serviceIp.length <= 0) {
                    //有可能还没有申请主机
                    continue;
                }
                var serviceAddress = "http://" + serviceIp + ":4080/services";
                $($(".module-machine-list")[0].children[1].children[i].children[3]).append($("<a href='"+ serviceAddress +"' target='_blank'>Go</a>"));
            } else if (String(moduleName).endWith("-web") || String(moduleName).endWith("-mq")) {
                var webIp = tr.children[3].children[1].innerHTML;
                webIp = webIp.replace(/[\r\n]/g,"");//去掉特殊字符
                if (webIp.length <= 0) {
                    //有可能还没有申请主机
                    continue;
                }
                var webAddress = "http://" + webIp + ":8080/";
                $($(".module-machine-list")[0].children[1].children[i].children[3]).append($("<a href='"+ webAddress +"' target='_blank'>Go</a>"));
            }
            break;
        }
    }
}

function updatePage() {
	if (betaBranchName.length <= 0) {
		return;
	}
	if (window.document.getElementsByClassName("ci")[0].children.length > 1) {
	    console.log("已添加beta分支链接");
	    return;
    }
    //分隔符
    var spanLabel = document.createElement("span");
    spanLabel.setAttribute("class", "separator");
    window.document.getElementsByClassName("ci")[0].appendChild(spanLabel);
    console.log("beta分支名称：" + betaBranchName);
    //betaBranchName = branchName;
    betaBranchUrl = "http://" + host + "/" + groupName + "/" + appName + "/ci_branch/" + betaBranchName;
    var betaLink = $("<a>Beta</a>");
    betaLink.attr("href", betaBranchUrl);
    $($(".ci")[0]).append($("<a href='" + betaBranchUrl + "'><h1 class=\"project_name\">Beta</h1></a>"));
}

function getBetaBranchName() {
	if (masterBranchUrl.length <= 0) {
		return 0;
	}
	console.log(masterBranchUrl);
    $.ajax({
        type: "GET",
        url: masterBranchUrl,
        data: {},
		dataType: "html",
        success: function (data) {
            var doc = $.parseHTML(data);
            //console.log(doc);
            $.each(doc, function(i, el) {
                if (i == 23) {
                    var branchNum = $(el).children()[0].children[0].children[0].children[0].children[1].children[0].children.length;
                    for (var i = branchNum - 1; i >= 0; i--) {
                        var branch = $(el).children()[0].children[0].children[0].children[0].children[1].children[0].children[i];
                        //console.log(branch + "--" + branch.text);
                        //获取beta分支名字
                        if (branch.text.indexOf("[beta]") > 0) {
                            //当前页面即为beta分支页面
                            betaBranchName = branch.value;
                            //顶部添加beta分支链接
                            updatePage();
                            //添加跳转到service&web&mq页面的链接
                            updateBetaPage();
                            break;
                        }
                    }
                }

            });
        }
    });
}

function initAppInfo() {
    //获取域名
    host = window.location.host;
    var host2 =document.domain;

    //获取页面完整地址
    url = window.location.href;

    if (host != "code.dianpingoa.com") {
        console.log("code-plus插件只在code.dianpingoa.com域名下有效");
        return false;
    }

    var urlArray = url.split("/");
    if (urlArray.length == 4) {
        masterBranchUrl = "";
        betaBranchName = "";
        betaBranchUrl = "";
        groupName = "";
        appName = ""
		return false;
	}
	/*
    for (var i = 0;i < urlArray.length; i++) {
    	console.log(i + "-" + urlArray[i]);
	}
	*/

    groupName = urlArray[3];
    appName = urlArray[4];
    if (groupName.length > 0 && appName.length > 0) {
        masterBranchUrl = "http://" + host + "/" + groupName + "/" + appName + "/ci_branch/master";
        console.log(masterBranchUrl);
    } else {
        console.log("解析master分支url失败");
        return false;
    }
    return true;
}