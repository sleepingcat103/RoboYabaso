var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
// var request = require("request");
var app = express();

var jsonParser = bodyParser.json();

var mainFunctions = require('./Controller/mainFunctions.js');
var messages = require('./JsonData/Messages.json');
var botToken = 'fHACwQBpF8Jz2Tvr11NcdBkBAPLftsw+/Nym37Lzux87Sim/mjlBXZ+Uox3wdTMn8unRALSm3SHP3TbjWd+aCFsFioFGkhM4yvzgQnD6fBsFd0s7ANMzGyxhqjRBS549Jw9FUGl5UJVHralGlzbGLAdB04t89/1O/w1cDnyilFU=';

app.set('port', (process.env.PORT || 5000));

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
    let rplyJson = JSON.stringify(msgObj);
    var options = setPostOption(method == reply ? '/v2/bot/message/reply' : '/v2/bot/message/push');
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

    let msgSplitor = (/\S+/ig);
    let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
    let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階

    //不是很重要的功能
    if (IsKeyWordEquals(trigger, ['抽卡', '抽爆', '抽!', '!抽', '抽！', '！抽', '10連抽', '10連', '10抽'])){
        replyMsgToLine(tokens.reply, [ gotcha()] );

    } else if (trigger.match(/排序|排列|幫我排/) != null && mainMsg.length >= 3) {
        replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.SortIt(inputStr, mainMsg)) ]);

    } else if (trigger.match(/choice|隨機|選項|幫我選/) != null && mainMsg.length >= 3) {
        replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.choice(inputStr, mainMsg)) ]);

    } else if (trigger.match(/立flag|死亡flag/) != null) {
        replyMsgToLine(tokens.reply, [ getTextMsg(mainFunctions.MeowHelpgetRandomText('flag')) ]);

    // 有打request的
    } else if (trigger.match(/運氣|運勢/) != null) {
        replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.Luck(mainMsg[0], replyToken)) ]);

    } else if (IsKeyWordEquals(trigger, ['統一發票','發票','!統一發票','!發票']) && mainMsg.length == 1) {
        replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.TWticket()) ]);

    } else if (IsKeyWordEquals(trigger, ['shorten']) && mainMsg.length > 1){
        replyMsgToLine(tokens.reply, [ getTextMsg(await mainFunctions.shortenURL(mainMsg)) ]);

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
        replyMsgToLine(tokens.reply, [ getImageMsg(messages.single['生科']) ]);

    } else if (trigger.match(/手手/) != null) {
        replyMsgToLine(tokens.reply, [ getImageMsg(messages.single['手手']) ]);

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

    } else if (IsKeyWordEquals(trigger,['幫QQ','哭哭','QQ','QAQ'])){
        replyMsgToLine(tokens.reply, [ getStickerMsg("1", "9") ]);

    } else if (trigger == '<3'){
        replyMsgToLine(tokens.reply, [ getStickerMsg("1", "410") ]);

    } else if (trigger == '招財貓'){
        replyMsgToLine(tokens.reply, [ getStickerMsg("4", "607") ]);

    } else if (IsKeyWordEquals(trigger, ['好冷', '很冷', '冷爆啦', '冷死', '外面好冷'])){
        replyMsgToLine(tokens.reply, [ getStickerMsg("2", "29") ]);
    }
}
