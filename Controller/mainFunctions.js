
// var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");

var Messages = require('../JsonData/Messages.json');
var rate = {upSSR: 1.0, SSR: 2.0, SR: 20.0, R: 100.0};
var i,j;

class mainFunctions {
    constructor() {
        this.SortIt = this.SortIt.bind(this);
        this.choice = this.choice.bind(this);
        this.Help = this.Help.bind(this);
        this.MeowHelp = this.MeowHelp.bind(this);
        this.getRandomText = this.getRandomText.bind(this);
        this.new_waifu = this.new_waifu.bind(this);
        this.getImage = this.getImage.bind(this);
        this.gotcha = this.gotcha.bind(this);
        this.Luck = this.Luck.bind(this);
        this.JP = this.JP.bind(this);
        this.shortenURL = this.shortenURL.bind(this);
        this.googleSearch = this.googleSearch.bind(this);
        this.TWticket = this.TWticket.bind(this);
    }

    // 文字回覆
    SortIt(input, mainMsg) {
        let arr = input.replace(mainMsg[0], '').match(/\S+/ig);
        for (var i = 0; i < arr.length; i++) {
            var randomIndex = getRandom(arr.length);
            var itemAtIndex = arr[randomIndex];
            arr[randomIndex] = arr[i];
            arr[i] = itemAtIndex;
        }
        return mainMsg[0] + ' → [' + arr + ']';
    }

    choice (input, mainMsg) {
        let a = input.replace(mainMsg[0], '').match(/\S+/ig);
        return mainMsg[0] + '[' + a + '] → ' + a.getRandom();
    }

    Help() {
        return '【擲骰BOT】 貓咪&小伙伴‧改\
            \n 支援角卡、房間、KP、暗骰等功能\
            \n 使用說明:\
            \n https://github.com/sleepingcat103/RoboYabaso/blob/master/README.txt\
            ';
    }

    MeowHelp() {
        return Meow() + '\n要做什麼喵?\n\n(輸入 help 幫助 以獲得資訊)';
    }

    getRandomText(target){
        return Messages.text[target].getRandom();
    }

    // 圖片回覆
    new_waifu() {
        //偷人家的隨機老婆來用
        var new_id = Math.floor(Math.random() * 60000);
        return `https://www.thiswaifudoesnotexist.net/example-${new_id}.jpg`;
    }

    getImage(id){
        return Messages.images.person[id].getRandom();
    }

    // 特殊回覆
    gotcha(){
        // 10抽
        
        var myrate = Object.keys(rate);
        var result=[];
        var msg = '';
        for(i=0;i<10;i++){
            var chance = Math.random()*100;

            for(j=0; j<myrate.length; j++){
                if(rate[myrate[j]]>chance){
                    result.push(myrate[j]);
                    break;
                }
            }
        }
        if(result.join('') == 'RRRRRRRRRR') {
            result[9] = 'SR';
        }
        if((result.join('').match(/SS/g) || []).length == 0 && (result.join('').match(/S/g) || []).length < 3) {
            var rplyArr = ['可撥的非洲仔 z', '非洲歡迎你，朋友', '再...再10抽一定出', '....跟下個月的自己借錢好了', '下次會更好...嗎?', '123 出彩好幾單'];
        if((result.join('').match(/S/g) || []).length == 1) rplyArr.push('保底 ㄏ');
            msg = rplyArr.getRandom();
        }

        var flex = {
            "type": "flex",
            "altText": "123 出彩好簡單",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": []
                },
                "styles": {
                    "body": {
                        "backgroundColor": "#fbf3e3",
                    }
                }
            }
        }

        for(i=0;i<10;i=i+5){
            var box = {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": []
            }
            for(j=0; j<5; j++){
                box.contents.push({
                    "type": "icon",
                    "url": `https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/pictures/gotcha/${result[i+j]}.png`,
                    "size": "4xl",
                })
            }
            flex.contents.body.contents.push(box);
        }

        if(msg) {
        flex.contents.body.contents.push({
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [{
                "type": "text",
                "text": msg,
                "size": "lg",
                "color": "#568ad8"
            }]
        });
        }
        return flex;
    }

    // need promise
    Luck(str) {
        return new Promise(function(resolve, reject){
            try{
                var table = ['牡羊.白羊.牡羊座.白羊座', '金牛.金牛座', '雙子.雙子座', '巨蟹.巨蟹座', '獅子.獅子座', '處女.處女座', '天秤.天平.天秤座.天平座', '天蠍.天蠍座', '射手.射手座', '魔羯.魔羯座', '水瓶.水瓶座', '雙魚.雙魚座'];
                var target = str.replace('運氣', '').replace('運勢','');

                var index = table.indexOf(table.find(function(element){
                    if(element.indexOf(target)>0) return element;
                }));

                if(index>0){
                    var today = new Date().toISOString().substring(0, 10);
                    var options = {
                        uri: 'http://astro.click108.com.tw/daily_' + index + '.php?iAcDay=' + today + '&iAstro=' + index,
                        transform: function (body) {
                            return cheerio.load(body);
                        }
                    };
                    rp(options).then(function ($) {
                        var fax = $(".TODAY_CONTENT")[0]

                        var s =
                        fax.children[1].children[0].data + '\n' +
                        fax.children[3].children[0].children[0].data + '\n' +
                        fax.children[4].children[0].data + '\n' +
                        fax.children[6].children[0].children[0].data + '\n' +
                        fax.children[7].children[0].data + '\n' +
                        fax.children[9].children[0].children[0].data + '\n' +
                        fax.children[10].children[0].data + '\n' +
                        fax.children[12].children[0].children[0].data + '\n' +
                        fax.children[13].children[0].data;

                        resolve(s);
                    })
                    .catch(function (err) {
                        resolve("Fail to get data.");
                    });
                }else{
                    let rplyArr = ['超大吉', '大吉', '大吉', '中吉', '中吉', '中吉', '小吉', '小吉', '小吉', '小吉', '凶', '凶', '凶', '大凶', '大凶', '你還是，不要知道比較好', '這應該不關我的事'];
                    resolve(str + ' ： ' + rplyArr.getRandom());
                }
            }catch(e){
                resolve(e);
            }
        });
        
    }

    JP() {
        return new Promise(function(resolve, reject){
            try{
                var options = {
                uri: "https://www.esunbank.com.tw/bank/personal/deposit/rate/forex/foreign-exchange-rates",
                transform: function (body) {
                    return cheerio.load(body);
                }
            };
            rp(options)
                .then(function ($) {
                    var fax = $("#inteTable1 > tbody > .tableContent-light");
                    var str = "玉山銀行目前日幣的即期賣出匯率為 " + fax[3].children[5].children[0].data + " 換起來! ヽ(`Д´)ノ";

                    resolve(str);
                })
                .catch(function (err) {
                    resolve("Fail to get data.");
                });
            }catch(e){
                resolve(e);
            }
        });
    }

    shortenURL(mainMsg){
        return new Promise(function(resolve, reject){
            try{
                var s = '';
                for (i = 1; i < mainMsg.length; i++) {
                    s = s + mainMsg[i]+ ' ';
                }

                var rq = require("request");
                rq.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
                    json: {
                        'longUrl': s
                    }
                }, function (error, response, body) {
                    if(error) {
                        resolve('error' + error);
                    } else {
                        resolve(body.id);
                    }
                });
            }catch(e){
                resolve(e);
            }
        });
        
    }

    googleSearch(mainMsg){
        return new Promise(function(resolve, reject){
            try{
                var tmp = '';
                for (i = 1; i < mainMsg.length; i++) {
                    tmp = tmp + mainMsg[i]+ ' ';
                    }

                var s = GetUrl('https://www.google.com.tw/search', {
                    q: tmp
                });

                var rq = require("request");
                rq.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
                    json: {
                        'longUrl': s
                    }
                }, function (error, response, body) {
                    if(error) {
                        resolve('error' + error);
                    } else {
                        resolve(body.id + '/n' + Messages.text['google'].getRandom());
                    }
                });
            }catch(e){
                resolve(e);
            }
        });
    }

    TWticket() {
        return new Promise(function(resolve, reject){
            try{
                var options = {
                    uri: 'http://invoice.etax.nat.gov.tw/index.html',
                    transform: function (body) {
                        return cheerio.load(body);
                    }
                };
                rp(options).then(function ($) {
                    var fax = $(".t18Red");

                    var s =
                    $("#area1")[0].children[3].children[0].data.halfToFull() +
                    '\n特別獎：\n    ' +
                    fax[0].children[0].data.halfToFull() +
                    '\n特獎：\n    ' +
                    fax[1].children[0].data.halfToFull() +
                    '\n頭獎～六獎：\n    ' +
                    fax[2].children[0].data.replace(/、/g,'n    ').halfToFull(false) +
                    '\n增開六獎：\n    ' +
                    fax[3].children[0].data.replace(/、/g,'n    ').halfToFull(false);

                    resolve(s);
                })
                .catch(function (err) {
                    resolve(err);
                });
            }catch(e){
                resolve(e);
            }
        });
        
    }
}
module.exports = new mainFunctions();

////////////////////////////////////////
//////////////// 共用方法 ///////////////
////////////////////////////////////////

function getRandom(num) {
    return Math.floor((Math.random() * num) + 0);
}

function padLeft(str, length) {
    if (str.length >= length)
        return str;
    else
        return padLeft('　' + str, length);
}

function padRight(str, length) {
    if (str.length >= length)
        return str;
    else
        return padRight(str + '　', length);
}

function GetUrl(url, data) {
    if (data != "" && typeof data != "undefined") {
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var dataName = keys[i];
            if (data.hasOwnProperty(dataName)) {
                url += (i == 0) ? "?" : "&";
                url += dataName + "=" + data[dataName];
            }
        }
    }
    return url;
}

String.prototype.halfToFull = function (flag) {
    var temp = "";
    for (var i = 0; i < this.toString().length; i++) {
        var charCode = this.toString().charCodeAt(i);
        if (charCode <= 126 && charCode >= 33) {
            charCode += 65248;
        } else if (charCode == 32) { // 半形空白轉全形
            if(flag){
                    charCode = 12288;
            }
        }
        temp = temp + String.fromCharCode(charCode);
    }
    return temp;
};

Array.prototype.getRandom = function(){
    return this[getRandom(this.length)];
}
