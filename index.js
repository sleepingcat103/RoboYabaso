var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var path = require('path');
// var request = require("request");
var app = express();

var jsonParser = bodyParser.json();

var mainFunctions = require('./Controller/mainFunctions.js');
var messages = require('./JsonData/Messages.json');
var botToken = 'fHACwQBpF8Jz2Tvr11NcdBkBAPLftsw+/Nym37Lzux87Sim/mjlBXZ+Uox3wdTMn8unRALSm3SHP3TbjWd+aCFsFioFGkhM4yvzgQnD6fBsFd0s7ANMzGyxhqjRBS549Jw9FUGl5UJVHralGlzbGLAdB04t89/1O/w1cDnyilFU=';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

app.use('/scripts', express.static(path.join(__dirname, 'node_modules/bricks.js')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/jquery')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/jquery-ui-dist')));

app.get('/bb-trpg', function(req, res, next) {
	res.render('TrpgLiff', {
		charCard: '{"name":"神崎花火","日語":"65","靈感":"70","知識":"45","信用":"0","魅惑":"15","恐嚇":"15","說服":"10","話術":"5","心理學":"10","心理分析":"1","調查":"25","聆聽":"50","圖書館使用":"20","追蹤":"60","急救":"55","醫學":"1","鎖匠":"1","手上功夫":"10","隱密行動":"10","生存":"10","其他":"1","閃避":"24","攀爬":"40","跳躍":"20","游泳":"56","駕駛":"20","領航":"10","騎術":"5","自然學":"10","神秘學":"5","歷史":"5","會計":"5","估價":"5","法律":"5","喬裝":"5","電腦使用":"5","電器維修":"10","機械維修":"10","重機械操作":"1","str":"15","app":"10","siz":"16","con":"11","pow":"17","edu":"9","dex":"12","int":"14","hp":"14","san":"85","luck":"85","mp":"17","克蘇魯神話":"0","數學":"10","化學":"1","藥學":"1","人類學":"1","考古學":"1","電子學":"1","物理學":"1","工程學":"1","密碼學":"1","天文學":"1","地質學":"1","生物學":"1","動物學":"1","植物學":"1","物證學":"1","投擲":"70","鬥毆":"60","劍":"20","矛":"20","斧頭":"15","絞殺":"15","電鋸":"10","連枷":"10","鞭子":"5","弓箭":"30","手槍":"20","步槍":"25","衝鋒槍":"15","機關槍":"10","重武器":"10","火焰噴射器":"10","空手道":"60","美術":"5","演技":"5","偽造":"5","攝影":"5","克蘇魯神話":"0","item":"布質護腕,手機,單肩背包(生理用品，毛巾，髮圈*6，繃帶，白貼，爽身噴霧等等),金屬簍空指虎(防身用)(在背包),平凡人的資產,","db":"1D4","status":"無"}'
	});
})

app.post('/', jsonParser, function (req, res) {
    res.send('ok');
    var event = req.body.events[0];

    let type = event.type;
    if(!type == 'message') return;

    let msgType = event.message.type;
    let msg = event.message.text;
    let replyToken = event.replyToken;
    let to = event.source.type == 'group' ? event.source.groupId :
            event.source.type == 'room' ? event.source.roomId :
        /* event.source.type == 'user' */ event.source.userId

    if (type == 'message' && msgType == 'text') {
        dealWithInput({reply: replyToken, push: to}, msg);
    }
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

// 被動回覆訊息 (一般使用)
function replyMsgToLine(replyToken, rplyMsg) {
    let rplyObj = {
        replyToken: replyToken,
        messages: rplyMsg
    }
    postToLine(rplyObj, 'reply');
}

// 主動發送訊息
function pushMsgToLine(replyToken, rplyMsg){
    let rplyObj = {
        to: replyToken,
        messages: rplyMsg
    }
    postToLine(rplyObj, 'push');
}

function postToLine(msgObj, method){
    console.log(msgObj, method)
    return;
    let rplyJson = JSON.stringify(msgObj);
    var options = setPostOption(method == 'reply' ? '/v2/bot/message/reply' : '/v2/bot/message/push');
    var request = https.request(options, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (body) {
            console.log(body);
        });
    });
    request.on('error', function (e) {
        console.log('Request error: ' + e.message);
    })
    request.end(rplyJson);
}

// 組文字訊息
function getTextMsg(msg){
    return {
        type: "text",
        text: msg
    }
}
// 組圖片訊息
function getImageMsg(img){
    return {
        type: "image",
        originalContentUrl: img,
        previewImageUrl: img
    }
}
// 組貼圖訊息
function getStickerMsg(package, sticker){
    return {
	    type: "sticker",
	    packageId: package,
	    stickerId: sticker
	}
}

// 設定 API 所需 post 資訊
function setPostOption(path) {
    return {
        host: 'api.line.me',
        port: 443,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${botToken}`
        }
    };
}

function getUserProfile(p_MID) {

    v_path = '/v2/bot/profile/' + p_MID;
    var options = {
        host: 'api.line.me',
        port: 443,
        path: v_path,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${botToken}`
        }
    };
    v_path = null;
    var request = https.request(options, function (response) {
        console.log('Status: ' + response.statusCode);
        console.log('Headers: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        response.on('data', function (body) {
            console.log(body);
        });
    });

    request.on('error', function (e) {
        console.log('Request error: ' + e.message);
    });
    request.end();
}

function IsKeyWordEquals(target, strs){
    if(target==null||strs==null){
        return false;
    }

    if(target == strs)
	return true;

    for(i=0; i<strs.length; i++){
        if(target == strs[i]){
            return true;
        }
    }
    return false;
}

async function dealWithInput(tokens, inputStr) {
    try{
        let msgSplitor = (/\S+/ig);
        let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
        let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階

        //不是很重要的功能
        if (IsKeyWordEquals(trigger, ['抽卡', '抽爆', '抽!', '!抽', '抽！', '！抽', '10連抽', '10連', '10抽'])){
            replyMsgToLine(tokens.reply, [ mainFunctions.gotcha()] );

        } else if (trigger.match(/排序|排列|幫我排/) != null && mainMsg.length >= 3) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.SortIt(inputStr, mainMsg)) ]);

        } else if (trigger.match(/choice|隨機|選項|幫我選/) != null && mainMsg.length >= 3) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.choice(inputStr, mainMsg)) ]);

        } else if (trigger.match(/立flag|死亡flag/) != null) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.getRandomText('flag')) ]);

        // 有打request的
        } else if (trigger.match(/運氣|運勢/) != null) {
            replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.Luck(mainMsg[0])) ]);

        } else if (IsKeyWordEquals(trigger, ['統一發票','發票','!統一發票','!發票']) && mainMsg.length == 1) {
            replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.TWticket()) ]);

        } else if (IsKeyWordEquals(trigger, ['shorten', '縮網址', '短網址']) && mainMsg.length > 1){
            replyMsgToLine(tokens.reply, [ getTextMsg('現在沒有縮網址了喵') ]);

        } else if (IsKeyWordEquals(trigger, ['搜尋','google','谷哥']) && mainMsg.length > 1){
            replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.googleSearch(mainMsg)) ]);
        
        } else if (IsKeyWordEquals(trigger, ['!日幣', '！日幣', '！jp', '!jp'])) {
            replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.JP()) ]);

        //圖片回應
        } else if (IsKeyWordEquals(trigger, ['抽老婆']) && mainMsg.length == 1) {
            replyMsgToLine(tokens.reply, [ getImageMsg(mainFunctions.new_waifu()) ]);

        } else if (IsKeyWordEquals(trigger, ['臭貓', '小方方', '方董']) || IsKeyWordEquals(mainMsg[0], ['FQ', 'FK'])) {
            replyMsgToLine(tokens.reply, [ getImageMsg(mainFunctions.getImage('臭貓')) ]);

        } else if (IsKeyWordEquals(trigger, ['狂', '風兒', '屁還', '屁孩', '碩文', '碩彣']) || (trigger == '@碩文' && mainMsg.length == 1) ) {
            replyMsgToLine(tokens.reply, [ getImageMsg(mainFunctions.getImage('屁孩')) ]);

        } else if (IsKeyWordEquals(trigger, ['振宇', '王振宇']) || (trigger == '@王振宇' && mainMsg.length == 1)) {
            replyMsgToLine(tokens.reply, [ getImageMsg(mainFunctions.getImage('振宇')) ]);

        } else if (IsKeyWordEquals(trigger, ['ㄇㄏ', '名鴻']) || (trigger == '@名鴻' && mainMsg.length == 1)) {
            replyMsgToLine(tokens.reply, [ getImageMsg(mainFunctions.getImage('明鴻')) ]);

        } else if (IsKeyWordEquals(trigger, ['良丞', '良成']) || (trigger == '@王良丞' && mainMsg.length == 1)) {
            replyMsgToLine(tokens.reply, [ getImageMsg(mainFunctions.getImage('良丞')) ]);

        } else if (trigger == '生科') {
            replyMsgToLine(tokens.reply, [ getImageMsg(messages.images.single['生科']) ]);

        } else if (trigger.match(/手手/) != null) {
            replyMsgToLine(tokens.reply, [ getImageMsg(messages.images.single['手手']) ]);

        //貓咪嘴砲
        } else if (trigger == '貓咪') {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.MeowHelp()) ]);

        } else if (trigger.match(/喵/) != null) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.getRandomText('meow')) ]);

        } else if (trigger.match(/打l|上線/) != null) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.getRandomText('lol')) ]);

        } else if (trigger.match(/貓/) != null) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.getRandomText('cat')) ]);

        } else if (IsKeyWordEquals(trigger, ['help', '幫助'])) {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.Help()) ]);

        } else if (trigger == '大哥') {
            replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.getRandomText('bro')) ]);

        //貼圖
        } else if (IsKeyWordEquals(trigger, ['打架', '互相傷害r', '來互相傷害', '來互相傷害r'])){
            replyMsgToLine(tokens.reply, [ getStickerMsg("2", "517") ]);

        } else if (IsKeyWordEquals(trigger, ['幫qq','哭哭','qq','qaq'])){
            replyMsgToLine(tokens.reply, [ getStickerMsg("1", "9") ]);

        } else if (trigger == '<3'){
            replyMsgToLine(tokens.reply, [ getStickerMsg("1", "410") ]);

        } else if (trigger == '招財貓'){
            replyMsgToLine(tokens.reply, [ getStickerMsg("4", "607") ]);

        } else if (IsKeyWordEquals(trigger, ['好冷', '很冷', '冷爆啦', '冷死', '外面好冷'])){
            replyMsgToLine(tokens.reply, [ getStickerMsg("2", "29") ]);
        }

    }catch(e){
        console.log('error', e);
        return;
    }
}
