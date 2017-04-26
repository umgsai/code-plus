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

String.prototype.endWith = function(endStr) {
    var d = this.length - endStr.length;
    return (d >= 0 && this.lastIndexOf(endStr) == d);
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

        if (newUrlArray.length == 7 && newUrlArray[5] == "tickets") {
            console.log("发布页面");
            setTimeout(function () {
                //给发布页面添加链接
                updatePublishPage();
            }, 550);
        } else {
            console.log("非发布页面");
            return;
        }
    });

    if (!initAppInfo()) {
    	return;
	}

    getBetaBranchName();

    var urlArray = url.split("/");
    //发布页面
    if (urlArray.length == 7 && urlArray[5] == "tickets") {
        updatePublishPage();
    }
})

function updatePublishPage() {
    //给发布页面添加View链接
    var ticketPackingItem = $(".ticket-packing-item");
    //每次刷新会出发多次DOMNodeInserted事件，暂未解决
    ticketPackingItem.bind('DOMNodeInserted', function(e){
        //console.log("ticketPackingItem刷新");
        if (ticketPackingItem[0].children.length > 2) {
            var legendItem = ticketPackingItem[0].children[1];
            var legendItemText = legendItem.innerHTML;//分组操作(bb-merchant-finance-app-web | HealthCheckUrl:/index.jsp)
            var appName = legendItemText.split("(")[1].split("|")[0].replace(" ", "");
            //console.log(appName); //应用名
            //var tableItem = $(".grouping-rollouts-list")[0].children[2].children;
            for (var i = $(".grouping-rollouts-list").find("tbody").find("tr").length - 1; i >= 0; i--) {
                //var dataContent = tableItem[i].children[0].children[0].getAttribute("data-content");
                var dataContent = $($(".grouping-rollouts-list").find("tbody").find("tr")[i]).find(".group-hostname").attr("data-content");
                //解析得到二维数组
                var serverArray = eval('[' + dataContent + ']');
                if (!serverArray) {
                    continue;
                }
                if ($($(".grouping-rollouts-list").find("tbody").find("tr")[i]).find(".group-hostname").parent().children().length > 1) {
                    continue;
                }
                //一个分组可能有多台机器
                for (var j = 0; j < serverArray.length; j++) {
                    var  ipAddress = serverArray[j][1];
                    if (appName.endWith("-web") || appName.endWith("-mq")) {
                        address = "http://" + ipAddress + ":8080/index.jsp";
                    } else if (appName.endWith("-service")) {
                        address = "http://" + ipAddress + ":4080/services";
                    }
                    $($($(".grouping-rollouts-list").find("tbody").find("tr")[i]).find(".group-hostname").parent()).append($("<br/><a href='"+ address +"' target='_blank'>View" + (j + 1) + "</a>"))
                    $($($(".grouping-rollouts-list").find("tbody").find("tr")[i]).find(".group-hostname").parent()).append($("<br/><span>" + ipAddress + "</span>"))
                }
            }
        }

    });
}

function updateBetaPage() {
    console.log(betaBranchUrl);
    //获取页面完整地址
    url = window.location.href;
    console.log(url);
    if (url != betaBranchUrl) {
        console.log("当前页面不是beta分支页面..");
        return;
    }
    console.log("已切换到beta分支..");
    //console.log($(".module-machine-list")[0].children[1].children.length);
    //var tbody = $(".module-machine-list")[0].children[1].children;
    //var modules = tbody.children;
    //console.log("模块数量：" + tbody);
    for (var i = 0; i < $(".module-machine-list").find("tbody").find("tr").length; i++) {
        //var tr = tbody[i]
        //var module = tr.children[0].children[1].children[0];
        //var moduleName = module.innerHTML;
        var moduleName = $($(".module-machine-list").find("tbody").find("tr")[i]).find("td").find("a").find("span").html();
        moduleName = moduleName.replace(/[\r\n]/g,"");//去掉特殊字符
        //console.log(module);
        var ip = $($(".module-machine-list").find("tbody").find("tr")[i]).find(".ip-addr").html();
        if (!ip) {
           continue;
        }
        ip = ip.replace(/[\r\n]/g,"");//去掉特殊字符
        //console.log("IP:" + ip);
        if ($($(".module-machine-list").find("tbody").find("tr")[i]).find(".ip-addr").parent().children().length >= 3) {
            //已经添加过
            continue;
        }
        if (ip.length <= 0) {
            //还没有申请主机
            continue;
        }
        //多余1台主机
        if (ip.indexOf(",") > 0) {
            var ips = ip.split(",");
            var address = "";
            for (var j = 0; j < ips.length; j++) {
                if (String(moduleName).endWith("-service")) {
                    address = "http://" + ips[j] + ":4080/services";
                } else if (String(moduleName).endWith("-web") || String(moduleName).endWith("-mq")) {
                    address = "http://" + ips[j] + ":8080/index.jsp";
                }
                $($(".module-machine-list").find("tbody").find("tr")[i]).find(".ip-addr").parent().append($("<a href='" + address + "' target='_blank'>Go" + (j + 1) + "</a>"))
            }
        } else {
            //只有一台主机
            var address = "";
            if (String(moduleName).endWith("-service")) {
                address = "http://" + ip + ":4080/services";
            } else if (String(moduleName).endWith("-web") || String(moduleName).endWith("-mq")) {
                address = "http://" + ip + ":8080/index.jsp";
            }
            $($(".module-machine-list").find("tbody").find("tr")[i]).find(".ip-addr").parent().append($("<a href='" + address + "' target='_blank'>Go</a>"))
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
    $(".ci").append($("<a href='" + betaBranchUrl + "'><h1 class=\"project_name\">Beta</h1></a>"));
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
                    var branchNum = $(el).find(".project-refs-select").find("option").length;
                    for (var i = branchNum - 1; i >= 0; i--) {
                        var branch = $(el).find(".project-refs-select").find("option")[i];
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