//87 group Id: Cf712dd6f2676add8a6997fbeb0587619

var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var app = express();
var fs = require('fs');

var jsonParser = bodyParser.json();

var outType = 'text';
var event = '';
var v_path = '/v2/bot/message/reply';

var timerFlag = 'off';
var voicelength = 0;
var idiotGroup = 'Cf712dd6f2676add8a6997fbeb0587619';

var twitchEmoji = require('./JsonData/twitchEmoji.json');
var J_newCharStatus = require('./JsonData/newCharStatus.json');
var JSONmapping = require('./JsonData/WebFileToJsonMapping.json');

// 房間入口
// key:value
// GroupMid : room Object
var TRPG = {
    first: {
        KP_MID: '',
        GP_MID: '',
        players: []
    }
};
TRPG.createRoom = function (p_mid, room_Obj) {
    eval('TRPG.' + p_mid + ' = room_Obj');
}

// 紀錄使用者的資訊，以及進入的房間
// key:value
// UserMid: {GP_MID,displayName,userId,pictureUrl,statusMessage}
var userToRoom = {};

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
    //  res.send(parseInput(req.query.input));
    res.send('Hello');
});

app.post('/', jsonParser, function (req, res) {
    event = req.body.events[0];
    let type = event.type;

    if (type == 'leave' && TRPG.hasOwnProperty(event.source.groupId)) {
        eval('delete TRPG.' + event.source.groupId);
        console.log('room existance: ' + TRPG.hasOwnProperty(event.source.groupId));
    }
    let msgType = event.message.type;
    let msg = event.message.text;
    let rplyToken = event.replyToken;
	
    if(msgType=="sticker"){
	console.log(event.message.packageId);
	console.log(event.message.stickerId);
    }

    let rplyVal = null;

    var roomMID = 'first';

    // 先找是否已經進入房間
    if (event.source.type == 'user') {
        for (var p in userToRoom) {
            if (p == event.source.userId) {
                for (var r in TRPG) {
                    if (userToRoom[p].GP_MID == r) {
                        roomMID = r;
                        break;
                    }
                }
            }
            if (roomMID != 'first') {
                break;
            }
        }
    } else if (event.source.type == 'group') {
        for (var r in TRPG) {
            if (r == event.source.groupId) {
                roomMID = r;
                break;
            }
        }
    }

    outType = 'text';

    console.log(msg);
    if (type == 'message' && msgType == 'text') {
        try {
            rplyVal = parseInput(roomMID, rplyToken, msg);
            console.log('rplyVal: ' + rplyVal);
        } catch (e) {
            console.log('parseInput error');
            console.log(e.toString());
        }
    }

    if (rplyVal) {
        if (outType == 'ccd') {
            replyMsgToLine('push', TRPG[roomMID].KP_MID, rplyVal);
        } else {
            replyMsgToLine(outType, rplyToken, rplyVal);
        }
    } else {
        console.log('Do not trigger');
    }

    res.send('ok');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

function replyMsgToLine(outType, rplyToken, rplyVal) {

    let rplyObj;
    if(outType == 'video'){
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [{
	        "type": "video",
	        "originalContentUrl": rplyVal,
	        "previewImageUrl": "https://github.com/sleepingcat103/RoboYabaso/raw/master/201542716135.png"
	    }]
        }
    } else if(outType == 'audio'){
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [{
	        "type": "audio",
	        "originalContentUrl": rplyVal,
	        "duration": voicelength
	    }]
        }
    } else if (outType == 'image') {
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [{
                type: "image",
                originalContentUrl: rplyVal,
                previewImageUrl: rplyVal
            }]
        }
    } else if (outType == 'sticker') {
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [rplyVal]
        }
    } else if (outType == 'push') {
        v_path = '/v2/bot/message/push';
        rplyObj = {
            to: rplyToken,
            messages: [{
                type: "text",
                text: rplyVal
            }]
        }
    } else if (outType == 'pushsecret') {
        v_path = '/v2/bot/message/push';
        rplyObj = {
            to: rplyToken,
            messages: [{
	        "type": "audio",
	        "originalContentUrl": rplyVal,
	        "duration": voicelength
	    }]
        }
    } else {
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [{
                type: "text",
                text: rplyVal
            }]
        }
    }

    let rplyJson = JSON.stringify(rplyObj);
    var options = setOptions();
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

function setOptions() {
    var options = {
        host: 'api.line.me',
        port: 443,
        path: v_path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fHACwQBpF8Jz2Tvr11NcdBkBAPLftsw+/Nym37Lzux87Sim/mjlBXZ+Uox3wdTMn8unRALSm3SHP3TbjWd+aCFsFioFGkhM4yvzgQnD6fBsFd0s7ANMzGyxhqjRBS549Jw9FUGl5UJVHralGlzbGLAdB04t89/1O/w1cDnyilFU='
        }
    }
    return options;
}

function getUserProfile(p_MID) {

    v_path = '/v2/bot/profile/' + p_MID;
    var options = {
        host: 'api.line.me',
        port: 443,
        path: v_path,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer fHACwQBpF8Jz2Tvr11NcdBkBAPLftsw+/Nym37Lzux87Sim/mjlBXZ+Uox3wdTMn8unRALSm3SHP3TbjWd+aCFsFioFGkhM4yvzgQnD6fBsFd0s7ANMzGyxhqjRBS549Jw9FUGl5UJVHralGlzbGLAdB04t89/1O/w1cDnyilFU='
        }
    };
    v_path = null;
    var request = https.request(options, function (response) {
        console.log('Status: ' + response.statusCode);
        console.log('Headers: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        response.on('data', function (body) {
            var newBody = MyJSONStringify(body);
            userToRoom[p_MID].displayName = newBody.displayName;
            userToRoom[p_MID].userId = newBody.userId;
            userToRoom[p_MID].pictureUrl = newBody.pictureUrl;
            userToRoom[p_MID].statusMessage = newBody.statusMessage;
            //eval('replyMsgToLine(\'push\', userToRoom.'+ p_MID +'.GP_MID , newBody.displayName + \' 加入群組囉!!\' )');
            replyMsgToLine('push', userToRoom[p_MID].GP_MID, userToRoom[p_MID].displayName + ' 加入房間囉!!');
            newBody = null;
        });
    });

    request.on('error', function (e) {
        console.log('Request error: ' + e.message);
    });
    request.end();
}

////////////////////////////////////////
//////////////// 分析開始 //////////////
////////////////////////////////////////
function parseInput(roomMID, rplyToken, inputStr) {

    //console.log('InputStr: ' + inputStr);
    _isNaN = function (obj) {
        return isNaN(parseInt(obj));
    }
    let msgSplitor = (/\S+/ig);
    let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
    let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階
	
    //角卡功能快速入口//
    for (i = 0; i < TRPG[roomMID].players.length; i++) {
        if (mainMsg[0].toString() == TRPG[roomMID].players[i].getVal('name'))
            return CharacterControll(roomMID, mainMsg[0], mainMsg[1], mainMsg[2], mainMsg[3]);
    }
	
    //不是很重要的功能
    if (trigger.match(/排序/) != null && mainMsg.length >= 3) {
        return SortIt(inputStr, mainMsg);
	    
    } else if (trigger.match(/choice|隨機|選項|幫我選/) != null && mainMsg.length >= 3) {
        return choice(inputStr, mainMsg);
	    
    } else if (trigger.match(/運氣|運勢/) != null) {
        return randomLuck(mainMsg); //占卜運氣
	    
    } else if (trigger.match(/立flag|死亡flag/) != null) {
        return BStyleFlagSCRIPTS();
	    
    // 縮網址
    } else if (trigger == 'shorten' && mainMsg.length > 1){
        
	var s = ''; 
	for (i = 1; i < mainMsg.length; i++) {
	    s = s + mainMsg[i]+ ' ';
        }
	request.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
            json: {
                'longUrl': s
            }
        }, function (error, response, body) {
            if(error) {
                return 'error' + error;
            } else {
		s = body.id;
		replyMsgToLine(outType, rplyToken, s);
            }
        });
	    
    //google
    }else if(trigger == 'google' || trigger == '搜尋' || trigger == '谷哥'){
        var tmp = ''; 
	for (i = 1; i < mainMsg.length; i++) {
	    tmp = tmp + mainMsg[i]+ ' ';
        }
	    
	let s = GetUrl('https://www.google.com.tw/search', {
            q: tmp
        });
	    
	console.log('search url: '+ s);
	    
	request.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
            json: {
                'longUrl': s
            }
        }, function (error, response, body) {
            if(error) {
                return 'error' + error;
            } else {
		s = body.id;
		    console.log('s: '+ s);
		    console.log('outType: '+ outType);
		    console.log('rplyToken: '+ rplyToken);
		replyMsgToLine(outType, rplyToken, s + '\ngoogle很難嗎'+ Cat());
            }
        });
    
    //圖片回應
    } else if (IsKeyWord(trigger, ['臭貓', '小方方', '方董']) || IsKeyWord(mainMsg[0], ['FQ', 'FK']) || (IsKeyWord(trigger, '@方翊宸') && mainMsg.length == 1)) {
        return Image('godcat');
	    
    } else if (IsKeyWord(trigger, ['狂', '風兒', '屁還', '屁孩', '碩文', '碩彣']) || (trigger == '@碩文' && mainMsg.length == 1) ) {
	return Image('pi');
	    
    } else if (IsKeyWord(trigger, ['振宇', '王振宇']) || (trigger == '@王振宇' && mainMsg.length == 1)) {
        return Image('wang');

    } else if (IsKeyWord(trigger, ['ㄇㄏ', '名鴻']) || (trigger == '@名鴻' && mainMsg.length == 1)) {
	return Image('mh');
	    
    } else if (IsKeyWord(trigger, ['良丞', '良成']) || (trigger == '@王良丞' && mainMsg.length == 1)) {
        return Image('lc');
	    
    } else if (trigger == '生科') {
        outType = 'image';
        return 'https://i.imgur.com/jYxRe8wl.jpg'; 
	    
    } else if (trigger.match(/手手/) != null) {
        outType = 'image';
        return 'https://imgur.dcard.tw/0cE3QNA.jpg';
	    
    //貓咪嘴砲
    } else if (trigger == '貓咪') {
        return MeowHelp();
	    
    } else if (trigger.match(/喵/) != null) {
        return Meow();
	    
    } else if (trigger.match(/貓/) != null) {
        return Cat();
	    
    } else if (IsKeyWord(trigger, ['help', '幫助'])) {
        return Help();
	    
    } else if (trigger == '大哥') {
        return Bro();
	    
    //TRPG相關功能
    } else if (trigger.match(/coc創角/) != null && mainMsg[1] != NaN) {
        return build6char(mainMsg[1]);
	    
    } else if (trigger == 'db') {
        return db(mainMsg[1], 1);
	    
    } else if (trigger == '角色' || trigger == 'char') {
        if (roomMID == 'first') {
            if (event.source.type == 'user') {
                return '你還沒進入房間喵!!!';
            } else {
                return '房間還沒有建立!!\n請先輸入  setgp';
            }
        } else {
            return CharacterControll(roomMID, mainMsg[1], mainMsg[2], mainMsg[3], mainMsg[4]);
        }
	    
    } else if (trigger == 'join') {
        if (event.source.type == 'user' &&
            userToRoom.hasOwnProperty(event.source.userId) &&
            userToRoom[event.source.userId].GP_MID == mainMsg[1]) {
            return '你已經在房間裡了喵!';
        } else if (event.source.type == 'user') {
            eval('userToRoom.' + event.source.userId + ' = {}');
            userToRoom[event.source.userId] = {
                GP_MID: mainMsg[1],
                displayName: '',
                userId: '',
                pictureUrl: '',
                statusMessage: ''
            };
            getUserProfile(event.source.userId)
            return '加入房間喵!\n請到群組確認加入訊息~';
        } else {
            return '你想幹嘛啦~~~';
        }
	    
    }else if (trigger == 'ccb') {
        return ccb(roomMID, mainMsg[1], mainMsg[2]);
	    
    }else if (trigger == 'ccd') {
        for (i = 0; i < TRPG[roomMID].players.length; i++) {
            if (mainMsg[1].toString() == TRPG[roomMID].players[i].getVal('name'))
                return CharacterControll(roomMID, mainMsg[1], mainMsg[0], mainMsg[2], mainMsg[3]);
        }
        if (TRPG[roomMID].KP_MID != '') {
            replyMsgToLine('push', TRPG[roomMID].KP_MID, ccd_dice(mainMsg[3], mainMsg[1], mainMsg[2]));
            if (TRPG[roomMID].KP_MID == event.source.userId) {
                replyMsgToLine('push', TRPG[roomMID].GP_MID, '')
            } else {
                return '成功執行暗骰';
            }
        } else if (roomMID == 'first') { // 房間還沒創或是沒進入房間
            return '你還沒進入房間';
        } else {
            return '現在房間沒有KP，你想傳給誰喵?';
        }
	    
    //TRPG房間相關指令開始於此
    } else if (trigger == 'getkp') {
        if (TRPG[roomMID].KP_MID != '') {
            return TRPG[roomMID].KP_MID;
        } else if (event.source.type != 'group') {
            return '在群組才能使用唷!!!';
        } else {
            return '目前沒有設置KP喵!!!';
        }
    } else if (trigger == 'setkp') {
        if (event.source.type == 'user') {
            if (TRPG[roomMID].KP_MID == '' || TRPG[roomMID].KP_MID == event.source.userId) {
                if (roomMID == 'first') {
                    return '你還沒有進入房間';
                }
                TRPG[roomMID].KP_MID = event.source.userId;
                return '設定完成喵'; //，KP的MID是\n' + TRPG[roomMID].KP_MID;
            } else {
                return '如果要更換KP，請現任KP先卸任之後，才能重新"setkp"';
            }
        } else {
            return '私密BOT才能設定KP哦!!!';
        }
    } else if (trigger == 'killkp') {
        if (event.source.type == 'user' && TRPG[roomMID].KP_MID == event.source.userId) {
            TRPG[roomMID].KP_MID = '';
            return '已經沒有KP了喵';
        } else {
            if (TRPG[roomMID].KP_MID != '') {
                return '只有KP在私下密語才能使用這個功能哦!';
            } else if (roomMID == 'first') {
                return '你還沒有進入房間';
            } else {
                return '現在沒有KP喵~';
            }
        }
	    
    } else if (trigger == 'getgp') {
        if (TRPG[roomMID].GP_MID != '') {
            return TRPG[roomMID].GP_MID;
        } else {
            return '你還沒有進房間哦!!!';
        }
	    
    } else if (trigger == 'setgp') {
        if (event.source.type == 'group') {
            if (TRPG.hasOwnProperty(event.source.groupId)) {
                return '在群組開啟了遊戲房間!!!';
            } else {
                TRPG.createRoom(event.source.groupId, createNewRoom(event.source.groupId));
                return '房間建立成功，請PL私密輸入\njoin ' + event.source.groupId;
            }
        } else {
            return '必須是群組才能開房間唷 <3 ';
        }
	    
    } else if ((trigger == 'leaveroom' || event.type == 'leave') && TRPG.hasOwnProperty(event.source.groupId)) {
        eval('delete TRPG.' + event.source.groupId);
        console.log('room existance: ' + TRPG.hasOwnProperty(event.source.groupId));
        return '已經刪除房間資訊了喵~';
	    
    } else if (trigger == 'getuid') {
        if (event.source.type == 'user')
            return '你的uid是:' + event.source.userId;
        //else if(event.source.type =='group')
        //   return '群組的uid是' + event.source.groupId;
        else
            return eval('\'群組的uid是: \' + event.source.+' + event.source.type + 'Id');
	
    //普通ROLL擲骰判定
    } else if (inputStr.match(/\w/) != null && inputStr.toLowerCase().match(/\d+d+\d/) != null) {
        return nomalDiceRoller(inputStr, mainMsg[0], mainMsg[1], mainMsg[2]);
	    
    } else if (trigger == 'getprofile' && event.source.type == 'user') {
        return userToRoom[event.source.userId].displayName + '\n' +
            userToRoom[event.source.userId].userId + '\n' +
            userToRoom[event.source.userId].pictureUrl + '\n' +
            userToRoom[event.source.userId].statusMessage;
    
    //匯率
    } else if (IsKeyWord(trigger, ['!日幣', '！日幣', '！jp', '!jp'])) {
        JP(rplyToken);

    //圖奇表情符號
    //圖片不好用
    //} else if (twitchEmoji.hasOwnProperty(trigger)) {
    //    outType = 'image';
    //    return 'https://static-cdn.jtvnw.net/emoticons/v1/' + twitchEmoji[trigger] + '/1.0';
	    
    //貼圖
    }else if(IsKeyWord(trigger, ['打架', '互相傷害r', '來互相傷害', '來互相傷害r'])){
	return Sticker("2", "517");
	    
    }else if(trigger == '幫QQ' || trigger == '哭哭' || mainMsg[0] == 'QQ'){
	return Sticker("1", "9");
	    
    }else if(trigger == '<3'){
	return Sticker("1", "410");
	    
    }else if(trigger == '招財貓'){
	return Sticker("4", "607");
	    
    }else if(IsKeyWord(trigger, ['好冷', '很冷', '冷爆啦', '冷死', '外面好冷'])){
	return Sticker("2", "29");
	    
    //聲音相關
    //需要好用的API
    }else if(trigger == 'voice' || trigger == 'say' || trigger == '話せ'){
        return;
        outType = 'audio';
        voicelength = 5000;
	    
	let s = GetUrl('http://translate.google.com/translate_tts', {
            ie: 'UTF-8',
            total: 1,
            idx: 0,
            textlen: 32,
            client: 'tw-ob',
            tl: 'En-gb',
            e: 'm4a',
	    q: 'test voice'
        });
	
        var file = fs.createWriteStream("file.m4a");
        var request = http.get(s, 
	    function(response) {
	        response.pipe(file);
		//var data = fs.readFileSync('file.m4a', 'utf8');
		//replyMsgToLine(outType, rplyToken, data);
	    }
        );
            
//  }else if(trigger == 'voice' || trigger == 'say' || trigger == '話せ'){
//         let s = inputStr.toLowerCase().replace(trigger, '').trim();
            
//         outType = 'audio';
//         voicelength = s.length*500;
        
//         s = GetUrl('https://webapi.aitalk.jp/webapi/v2/ttsget.php', {
//                 username: 'MA2017',
//                 password: 'MnYrnxhH',
//                 text: s,
//                 speaker_name: 'reina_emo',
//                 ext: 'aac',
//                 volume: 2.00,
//                 range: 1.50
//         });
            
//         //console.log('url: ' + s);
//         //console.log('voice length: ' + voicelength);
            
//         request.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
//             json: {
//                 'longUrl': s
//             }
//         }, function (error, response, body) {
//             if(error) {
//                 console.log(error);
//             } else {
//                 s = body.id;
//                 //console.log("google url= " + s);
//                 replyMsgToLine(outType, rplyToken, s);
//             }
//         });
	    
    // }else if(trigger == 'secret' || trigger == '秘密' || trigger == 'ひみつ'){
    //     let s = inputStr.toLowerCase().replace(trigger, '').trim();
            
    //     outType = 'audio';
    //     voicelength = s.length*500;
        
    //     s = GetUrl('https://webapi.aitalk.jp/webapi/v2/ttsget.php', {
    //             username: 'MA2017',
    //             password: 'MnYrnxhH',
    //             text: s,
    //             speaker_name: 'reina_emo',
    //             ext: 'aac',
    //             volume: 2.00,
    //             range: 1.50
    //     });
            
    //     //console.log('url: ' + s);
            
    //     request.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
    //         json: {
    //             'longUrl': s
    //         }
    //     }, function (error, response, body) {
    //         if(error) {
    //             console.log(error);
    //         } else {
    //             s = body.id;
    //             //console.log("google url= " + s);
    //             replyMsgToLine('pushsecret', idiotGroup, s);
    //         }
    //     });
            
    // }else if(trigger == '告訴你'){
    //     let s = inputStr.toLowerCase().replace(trigger, '');
    //     //s = 'http://api.voicerss.org/?key=ad9bb556e281481093e10b10ffc673e5&hl=zh-tw&src=' + s;
            
    //     var regExp = /^[A-Za-z.,\s]+$/g;
    //     if (regExp.test(s)){
    //             //全是英文
    //         s = 'http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-gb&q=' + s;
    //     }else{
    //             //非全英文
    //         s = 'http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh&q=' + s;
    //     }
            
    //     //console.log('url: ' + s);
            
    //     request.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyD8cFQEtnwmlbV-D1MtmvLjc_rVGFZfg6s', {
    //         json: {
    //             'longUrl': s
    //         }
    //     }, function (error, response, body) {
    //         if(error) {
    //             console.log(error);
    //         } else {
    //             s = body.id;
    //             //console.log("google url= " + s);
    //             replyMsgToLine('push', idiotGroup, s);
    //         }
    //     });
    }
}

////////////////////////////////////////
//////////////// special return (sticker & image)
////////////////////////////////////////
function Sticker(package, sticker){
	outType = 'sticker';
	var stk = {
	    type: "sticker",
	    packageId: package,
	    stickerId: sticker
	};
	return stk;
}

function Image(id){

//屁孩
let piArr = ['\
https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/14570304_1166680320088981_2520143854908017535_n.jpg?oh=7a58b68d49620d131e47a537a61f1f8a&oe=59CD439F', '\
https://i.ytimg.com/vi/GvxaQHPoLu8/maxresdefault.jpg', '\
https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/p.png'];
	
//振宇
let wangArr = ['\
https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/17796399_1874499289243029_3191330377913562194_n.jpg?oh=563a8e1a27294de20a5f88941dc72089&oe=59DBCA90', '\
https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/11422678_849084711833568_5050870415218617870_n.jpg?oh=8d8505efffa318db9b9086b2c35225db&oe=59C7BA94'];

//ㄇㄏ
let mhArr = ['\
https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/mh-1.jpg', '\
https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/mh-2.jpg'];
	
//良承
let lcArr = ['\
https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/lc-1.jpg', '\
https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/lc-2.jpg', '\
https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/lc-0.jpg'];
	
//神貓
let godcatArr = ['https://raw.githubusercontent.com/sleepingcat103/RoboYabaso/master/m.jpg'];
	
    var rplyArr;
    eval('rplyArr = ' + id + 'Arr');
	
    outType = 'image';
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];	
}

////////////////////////////////////////
//////////////// jp
////////////////////////////////////////

function JP(replyToken) {
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
            //str += "\r\n"+fax[3].children[3].attribs["data-name"] + "  " +fax[3].children[3].children[0].data;
            //str += "\r\n"+fax[3].children[5].attribs["data-name"] + "  " +fax[3].children[5].children[0].data;
            //str += "\r\n"+fax[3].children[7].attribs["data-name"] + "  " +fax[3].children[7].children[0].data;
            //str += "\r\n"+fax[3].children[9].attribs["data-name"] + "  " +fax[3].children[9].children[0].data;
            console.log(str);
            replyMsgToLine(outType, replyToken, str);
        })
        .catch(function (err) {
            return "Fail to get data.";
        });
}

///////////////////////////////////////
/////////////////角色功能///////////////
///////////////////////////////////////

function createChar(p_name, p_uid) {
    var player = J_newCharStatus;
    player.status.name = p_name;
    player.status.uid = p_uid;
    player.getVal = function (p_sta) {
        return eval('this.status.' + p_sta);
    };
    player.setVal = function (p_sta, p_val) {
        if (p_sta == 'name' || p_sta == '職業') {
            this.status.name = p_val;
        } else if (isNaN(Number(p_val))) {
            eval('this.status.' + p_sta + ' = \'' + p_val + '\'');
        } else {
            if (Number(p_val) < 0) {
                eval('this.status.' + p_sta + ' = \'' + 0 + '\'');
            } else if (Number(p_val) > 99) {
                eval('this.status.' + p_sta + ' = \'' + 99 + '\'');
            } else {
                eval('this.status.' + p_sta + ' = \'' + p_val + '\'');
            }
        }
    };
    player.delVal = function (p_sta) {
        eval('delete this.status.' + p_sta);
    };
    player.showAll = function () {
        var result = "";
        var v_cnt = 0;
        for (var p in this.status) {
            if (this.status.hasOwnProperty(p)) {
                v_cnt = Number(v_cnt) + 1;
                if (v_cnt % 3 == 0)
                    result += p + ": " + this.status[p] + "\n";
                else
                    result += p + ": " + this.status[p] + "\t";
            }
        };
        return result;
    };
    player.show = function () {
        var MaxHP = Math.round((parseInt(this.getVal('con')) + parseInt(this.getVal('siz'))) / 2);
        var MaxMP = this.getVal('pow');
        var MaxSan = 99 - parseInt(this.getVal('克蘇魯神話'));
        var tempstr = '+=====================+\n';
        tempstr += this.getVal('name') + '\n';
        tempstr += this.getVal('職業') + '\n';
        tempstr += padRight('STR:', 4) + padRight(this.getVal('str'), 3) + padRight('DEX:', 4) + padRight(this.getVal('dex'), 3) + padRight('CON:', 4) + padRight(this.getVal('con'), 3) + '\n';
        tempstr += padRight('POW:', 4) + padRight(this.getVal('pow'), 3) + padRight('APP:', 4) + padRight(this.getVal('app'), 3) + padRight('INT:', 4) + padRight(this.getVal('int'), 3) + '\n';
        tempstr += padRight('SIZ:', 4) + padRight(this.getVal('siz'), 3) + padRight('EDU:', 4) + padRight(this.getVal('edu'), 3) + padRight('DB:', 4) + padRight(this.getVal('db'), 3) + '\n';
        tempstr += '+=====================+\n';
        tempstr += padRight('HP:', 4) + padRight(this.getVal('hp'), 3) + '/' + MaxHP + '\n';
        tempstr += padRight('MP:', 4) + padRight(this.getVal('mp'), 3) + '/' + MaxMP + '\n';
        tempstr += padRight('SAN:', 4) + padRight(this.getVal('san'), 3) + '/' + MaxSan + '\n';
        tempstr += padRight('STATUS:', 8) + this.getVal('status') + '\n';
        tempstr += padRight('ITEM:', 8) + this.getVal('item') + '\n';
        tempstr += '+=====================+';
        return tempstr;
    };
    player.export = function () {
        var retStr = JSON.stringify(this.status);
        return retStr;
    };
    player.import = function (p_str) {
        var newChar = JSON.parse(p_str);
        var oriName = this.getVal('name');
        this.status = newChar;
        this.setVal('name', oriName);
        return '成功匯入角色 ' + this.getVal('name') + ' !!!!';
    };
    player.importFromTRPG = function (p_str) {
        var tempChar = JSON.parse(p_str);
        var newChar = tempChar.skill;
        for (var p in newChar) {
            if (this.status.hasOwnProperty(JSONmapping[p])) {
                eval('this.status.' + JSONmapping[p] + '=\'' + newChar[p] + '\'');
            }
        }
        return '成功匯入角色 ' + this.getVal('name') + ' !!!!';
        //return JSON.stringify(newChar);
    };
    return player;
}

////////////////////////////////////////
//////////////// 創房間 ////////////////
////////////////////////////////////////

function createNewRoom(p_Mid) {
    var room = {
        GP_MID: p_Mid,
        KP_MID: '',
        players: []
    };
    room.setkp = function (p_Mid) {
        this.KP_MID = p_Mid;
    };
    room.getGPMid = function () {
        return this.GP_MID;
    };
    room.getKPMid = function () {
        return this.KP_MID;
    };
    room.newChar = function (p_char) {
        this.players.push(p_char);
    };
    return room;
}

////////////////////////////////////////
//////////////// 角色卡
////////////////////////////////////////

function CharacterControll(roomMID, trigger, str1, str2, str3) {
    if (trigger == undefined || trigger == null || trigger == '') {
        return Meow() + '請輸入更多資訊';
    }

    //建立新角
    if (trigger == 'new' || trigger == '建立') {
        if (str1 == undefined || str1 == null || str1 == '') return '沒有輸入名稱喵!';
        for (i = 0; i < TRPG[roomMID].players.length; i++) {
            if (TRPG[roomMID].players[i].getVal('name') == str1) return '已經有同名的角色了!';
        }
        var newPlayer;
        if (event.source.type == 'user') {
            newPlayer = createChar(str1, event.source.userId);
        } else {
            newPlayer = createChar(str1, '');
        }
        TRPG[roomMID].players.push(newPlayer);
        if (str2 == undefined || str2 == null || str2 == '') {
            return '成功建立角色 ' + str1 + ' 請補充他/她的能力值!';
        } else if (str2 == 'trpg') {
            return newPlayer.importFromTRPG(str3);
        } else {
            return newPlayer.import(str2);
        }
    }

    //角色設定(特定狀態查詢) 刪除 查看
    for (i = 0; i < TRPG[roomMID].players.length; i++) {
        if (trigger == TRPG[roomMID].players[i].getVal('name')) {
            if (str1 == 'debug') {
                return TRPG[roomMID].players[i].debug(str1); //players[i].show();
            } else if (str1 == 'ccb') {
                return coc6(TRPG[roomMID].players[i].getVal(str2), str2);
            } else if (str1 == 'ccd') {
                if (TRPG[roomMID].KP_MID != '') {
                    if (event.source.type == 'user' && event.source.userId == TRPG[roomMID].KP_MID) {
                        replyMsgToLine('push', TRPG[roomMID].GP_MID, '剛剛好像發生了什麼事');
                        return ccd_dice(TRPG[roomMID].players[i].getVal('name'), TRPG[roomMID].players[i].getVal(str2), str2);
                    } else if (event.source.type == 'group' ||
                        (event.source.type == 'user' && event.source.userId == TRPG[roomMID].players[i].getVal('uid'))) {
                        replyMsgToLine('push', TRPG[roomMID].KP_MID, ccd_dice(TRPG[roomMID].players[i].getVal('name'), TRPG[roomMID].players[i].getVal(str2), str2));
                        return '成功執行暗骰';
                    }
                    return Meow();
                } else {
                    return '現在沒有KP，你是想傳給誰辣';
                }
            } else if (str1 == 'skills') {
                return TRPG[roomMID].players[i].showAll();
            } else if (str1 == 'addskill') {
                if (TRPG[roomMID].players[i].status.hasOwnProperty(str2)) {
                    return '該技能之前就學過了';
                } else {
                    if (str3 == '' || str3 == undefined) {
                        TRPG[roomMID].players[i].setVal(str2, '0')
                    } else {
                        TRPG[roomMID].players[i].setVal(str2, str3)
                    }
                }
                return TRPG[roomMID].players[i].getVal('name') + ' 學會了 ' + str2 + ' !!! ';
            } else if (str1 == 'deleteskill') {
                if (TRPG[roomMID].players[i].status.hasOwnProperty(str2)) {
                    TRPG[roomMID].players[i].delVal(str2)
                    return '已經刪除技能: ' + str2 + '.';
                } else {
                    return '你沒有這個技能.';
                }
            } else if (str1 == 'output') {
                return TRPG[roomMID].players[i].export();
            } else if (str1 == undefined || str1 == '' || str1 == '狀態' || str1 == '屬性') {
                return TRPG[roomMID].players[i].show();
            } else if (str1 == 'delete' || str1 == '刪除') {
                TRPG[roomMID].players.splice(i, 1);
                return '已刪除 ' + trigger + ' 角色資料喵~';
            } else {
                try {
                    if (str2 == undefined || str2 == null || str2 == '') {
                        return trigger + ': ' + str1 + '[' + TRPG[roomMID].players[i].getVal(str1) + ']';
                    } else {
                        if (TRPG[roomMID].players[i].status.hasOwnProperty(str1) &&
                            (event.source.type == 'group' ||
                                (event.source.type == 'user' && event.source.userId == TRPG[roomMID].KP_MID) ||
                                (event.source.type == 'user' && TRPG[roomMID].KP_MID == '')
                            )
                        ) {
                            var tempVal = TRPG[roomMID].players[i].getVal(str1);
                            var afterVal = str2;
                            if (afterVal.charAt(0) == '+' && str1 != 'db') {
                                afterVal = Number(tempVal) + Number(afterVal.substring(1));
                            } else if (afterVal.charAt(0) == '-' && str1 != 'db') {
                                afterVal = Number(tempVal) - Number(afterVal.substring(1));
                            }
                            TRPG[roomMID].players[i].setVal(str1, afterVal);
                            return trigger + ': ' + str1 + '[' + tempVal + '->' + TRPG[roomMID].players[i].getVal(str1) + ']';
                        } else {
                            return Meow();
                        }
                    }
                } catch (err) {
                    return err.toString();
                }
            }
        }
    }
    //列出所有角色
    if (trigger == 'list' || trigger == '清單') {
        var tempstr = '角色清單:\n';
        for (i = 1; i < TRPG[roomMID].players.length + 1; i++) {
            tempstr += i + '. ' + TRPG[roomMID].players[i - 1].getVal('name') + '\n';
        }
        return tempstr;
    }
    return '沒有這個角色喵~';
}


////////////////////////////////////////
//////////////// COC6 CCB成功率骰
////////////////////////////////////////
function ccb(roomMID, chack, text) {
    var val_status = chack;
    for (i = 0; i < TRPG[roomMID].players.length; i++) {
        if (val_status.toString() == TRPG[roomMID].players[i].getVal('name')) {
            val_status = TRPG[roomMID].players[i].getVal(text);
            break;
        }
    }
    if (val_status <= 99) {
        return coc6(val_status, text);
    } else {
        return '**Error**\n找不到該角色或者輸入錯誤';
    }
}

function ccd(chack, text, who) {
    if (chack <= 99) {
        return ccd_dice(who, chack, text)
    } else {
        return '**Error**\n輸入錯誤';
    }
}

function coc6(chack, text) {

    let temp = Dice(100);
    if (text == null) {
        if (temp > 95) return 'ccb<=' + chack + ' ' + temp + ' → 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return 'ccb<=' + chack + ' ' + temp + ' → 喔喔！大成功！';
            else return 'ccb<=' + chack + ' ' + temp + ' → 成功';
        } else return 'ccb<=' + chack + ' ' + temp + ' → 失敗';
    } else {
        if (temp > 95) return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 大成功！';
            else return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 成功';
        } else return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 失敗';
    }
}

function ccd_dice(p_name, chack, text) {

    let temp = Dice(100);
    if (text == null) {
        if (temp > 95) return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → 喔喔！大成功！';
            else return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → 成功';
        } else return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → 失敗';
    } else {
        if (temp > 95) return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 大成功！';
            else return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 成功';
        } else return p_name + '做了' + 'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 失敗';
    }
}

////////////////////////////////////////
//////////////// COC6傳統創角
////////////////////////////////////////      



function build6char() {

    let ReStr = '六版核心創角：';
    let str = BuildDiceCal('3d6', 0);
    let siz = BuildDiceCal('(2d6+6)', 0);

    ReStr = ReStr + '\nＳＴＲ：' + str;
    ReStr = ReStr + '\nＤＥＸ：' + BuildDiceCal('3d6', 0);
    ReStr = ReStr + '\nＣＯＮ：' + BuildDiceCal('3d6', 0);
    ReStr = ReStr + '\nＰＯＷ：' + BuildDiceCal('3d6', 0);
    ReStr = ReStr + '\nＡＰＰ：' + BuildDiceCal('3d6', 0);
    ReStr = ReStr + '\nＩＮＴ：' + BuildDiceCal('(2d6+6)', 0);
    ReStr = ReStr + '\nＳＩＺ：' + siz;
    ReStr = ReStr + '\nＥＤＵ：' + BuildDiceCal('(3d6+3)', 0);

    let strArr = str.split(' ');
    let sizArr = siz.split(' ');
    let temp = parseInt(strArr[2]) + parseInt(sizArr[2]);

    ReStr = ReStr + '\nＤＢ：' + db(temp, 0);
    return ReStr;
}

////////////////////////////////////////
//////////////// 普通ROLL
////////////////////////////////////////
function nomalDiceRoller(inputStr, text0, text1, text2) {

    //首先判斷是否是誤啟動（檢查是否有符合骰子格式）
    // if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;

    //再來先把第一個分段拆出來，待會判斷是否是複數擲骰
    let mutiOrNot = text0.toLowerCase();

    //排除小數點
    if (mutiOrNot.toString().match(/\./) != null) return undefined;

    //先定義要輸出的Str
    let finalStr = '';


    //是複數擲骰喔
    if (mutiOrNot.toString().match(/\D/) == null) {
        if (text2 != null) {
            finalStr = text0 + '次擲骰：\n' + text1 + ' ' + text2 + '\n';
        } else {
            finalStr = text0 + '次擲骰：\n' + text1 + '\n';
        }
        if (mutiOrNot > 30) return '不支援30次以上的複數擲骰。';

        for (i = 1; i <= mutiOrNot; i++) {
            let DiceToRoll = text1.toLowerCase();
            if (DiceToRoll.match('d') == null) return undefined;

            //寫出算式
            let equation = DiceToRoll;
            while (equation.match(/\d+d\d+/) != null) {
                let tempMatch = equation.match(/\d+d\d+/);
                equation = equation.replace(/\d+d\d+/, RollDice(tempMatch));
            }

            //計算算式
            let aaa = equation;
            aaa = aaa.replace(/\d+[[]/ig, '(');
            aaa = aaa.replace(/]/ig, ')');
            //aaa = aaa.replace(/[[]\d+|]/ig, "");
            let answer = eval(aaa.toString());

            finalStr = finalStr + i + '# ' + equation + ' = ' + answer + '\n';
        }

    } else {
        //一般單次擲骰
        let DiceToRoll = mutiOrNot.toString().toLowerCase();
        DiceToRoll = DiceToRoll.toLowerCase();
        if (DiceToRoll.match('d') == null) return undefined;

        //寫出算式
        let equation = DiceToRoll;
        while (equation.match(/\d+d\d+/) != null) {
            let totally = 0;
            let tempMatch = equation.match(/\d+d\d+/);
            if (tempMatch.toString().split('d')[0] > 300) return undefined;
            if (tempMatch.toString().split('d')[1] == 1 || tempMatch.toString().split('d')[1] > 1000000) return undefined;
            equation = equation.replace(/\d+d\d+/, RollDice(tempMatch));
        }

        //計算算式
        let aaa = equation;
        aaa = aaa.replace(/\d+[[]/ig, '(');
        aaa = aaa.replace(/]/ig, ')');
        let answer = eval(aaa.toString());

        if (text1 != null) {
            finalStr = text0 + '：' + text1 + '\n' + equation + ' = ' + answer;
        } else {
            finalStr = text0 + '：\n' + equation + ' = ' + answer;
        }

    }

    return finalStr;
}


////////////////////////////////////////
//////////////// 擲骰子運算
////////////////////////////////////////

function sortNumber(a, b) {
    return a - b
}


function Dice(diceSided) {
    return Math.floor((Math.random() * diceSided) + 1)
}

function RollDice(inputStr) {
    //先把inputStr變成字串（不知道為什麼非這樣不可）
    let comStr = inputStr.toString();
    let finalStr = '[';
    let temp = 0;
    var totally = 0;
    for (let i = 1; i <= comStr.split('d')[0]; i++) {
        temp = Dice(comStr.split('d')[1]);
        totally += temp;
        finalStr = finalStr + temp + '+';
    }

    finalStr = finalStr.substring(0, finalStr.length - 1) + ']';
    finalStr = finalStr.replace('[', totally + '[');
    return finalStr;
}

function FunnyDice(diceSided) {
    return Math.floor((Math.random() * diceSided)) //猜拳，從0開始
}

function BuildDiceCal(inputStr, flag) {

    //首先判斷是否是誤啟動（檢查是否有符合骰子格式）
    if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;

    //排除小數點
    if (inputStr.toString().match(/\./) != null) return undefined;

    //先定義要輸出的Str
    let finalStr = '';

    //一般單次擲骰
    let DiceToRoll = inputStr.toString().toLowerCase();
    if (DiceToRoll.match('d') == null) return undefined;

    //寫出算式
    let equation = DiceToRoll;
    while (equation.match(/\d+d\d+/) != null) {
        let tempMatch = equation.match(/\d+d\d+/);
        if (tempMatch.toString().split('d')[0] > 200) return '不支援200D以上擲骰唷';
        if (tempMatch.toString().split('d')[1] == 1 || tempMatch.toString().split('d')[1] > 500) return '不支援D1和超過D500的擲骰唷';
        equation = equation.replace(/\d+d\d+/, BuildRollDice(tempMatch));
    }

    //計算算式
    let answer = eval(equation.toString());
    finalStr = equation + ' = ' + answer;
    if (flag == 0) return finalStr;
    if (flag == 1) return answer;


}

function BuildRollDice(inputStr) {
    //先把inputStr變成字串（不知道為什麼非這樣不可）
    let comStr = inputStr.toString().toLowerCase();
    let finalStr = '(';

    for (let i = 1; i <= comStr.split('d')[0]; i++) {
        finalStr = finalStr + Dice(comStr.split('d')[1]) + '+';
    }

    finalStr = finalStr.substring(0, finalStr.length - 1) + ')';
    return finalStr;
}

////////////////////////////////////////
//////////////// DB計算
////////////////////////////////////////
function db(value, flag) {
    let restr = '';
    if (value >= 2 && value <= 12) restr = '-1D6';
    if (value >= 13 && value <= 16) restr = '-1D4';
    if (value >= 17 && value <= 24) restr = '+0';
    if (value >= 25 && value <= 32) restr = '+1D4';
    if (value >= 33 && value <= 40) restr = '+1D6';
    if (value < 2 || value > 40) restr = '?????';
    //return restr;	
    if (flag == 0) return restr;
    if (flag == 1) return 'db -> ' + restr;
}

////////////////////////////////////////
//////////////// 占卜&其他
////////////////////////////////////////


function BStyleFlagSCRIPTS() {
    let rplyArr = ['\
「打完這仗我就回老家結婚」', '\
「打完這一仗後我請你喝酒」', '\
「你、你要錢嗎！要什麼我都能給你！/我可以給你更多的錢！」', '\
「做完這次任務，我就要結婚了。」', '\
「幹完這一票我就金盆洗手了。」', '\
「好想再XXX啊……」', '\
「已經沒什麼好害怕的了」', '\
「我一定會回來的」', '\
「差不多該走了」', '\
「我只是希望你永遠不要忘記我。」', '\
「我只是希望能永遠和你在一起。」', '\
「啊啊…為什麼會在這種時候、想起了那些無聊的事呢？」', '\
「能遇見你真是太好了。」', '\
「我終於…為你們報仇了！」', '\
「等到一切結束後，我有些話想跟妳說！」', '\
「這段時間我過的很開心啊。」', '\
把自己的寶物借給其他人，然後說「待一切結束後記得還給我。」', '\
「真希望這份幸福可以永遠持續下去。」', '\
「我們三個人要永永遠遠在一起！」', '\
「這是我女兒的照片，很可愛吧？」', '\
「請告訴他/她，我永遠愛他/她」', '\
「聽好，在我回來之前絕不要亂走動哦」', '\
「要像一個乖孩子一樣等著我回來」', '\
「我去去就來」', '\
「快逃！」', '\
「對方只有一個人，大家一起上啊」', '\
「我就不信，這麼多人還殺不了他一個！」', '\
「幹，幹掉了嗎？」', '\
「身體好輕」', '\
「可惡！你給我看著！（逃跑）」', '\
「躲在這裡就應該不會被發現了吧。」', '\
「我不會讓任何人死的。」', '\
「可惡！原來是這麼回事！」', '\
「跑這麼遠應該就行了。」', '\
「我已經甚麼都不怕了」', '\
「這XXX是什麼，怎麼之前沒見過」', '\
「什麼聲音……？就去看一下吧」', '\
「是我的錯覺嗎？/果然是錯覺/錯覺吧/可能是我（看/聽）錯了」', '\
「二十年後又是一條好漢！」', '\
「大人/將軍武運昌隆」', '\
「這次工作的報酬是以前無法比較的」', '\
「我才不要和罪犯呆在一起，我回自己的房間去了！」', '\
「其實我知道事情的真相…（各種廢話）…犯人就是……」', '\
「我已經天下無敵了~~」', '\
「大人！這邊就交給小的吧，請快離開這邊吧」', '\
「XX，這就是我們流派的最終奧義。這一招我只會演示一次，你看好了！」', '\
「誰敢殺我？」', '\
「從來沒有人能越過我的劍圍。」', '\
「就算殺死也沒問題吧？」', '\
「看我塔下強殺！」', '\
「騙人的吧，我們不是朋友嗎？」', '\
「我老爸是....你有種就....」', '\
「我可以好好利用這件事」'];

    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}


function randomLuck(TEXT) {
    let rplyArr = ['超大吉', '大吉', '大吉', '中吉', '中吉', '中吉', '小吉', '小吉', '小吉', '小吉', '凶', '凶', '凶', '大凶', '大凶', '你還是，不要知道比較好', '這應該不關我的事'];
    return TEXT[0] + ' ： ' + rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

////////////////////////////////////////
//////////////// Others
////////////////////////////////////////

function SortIt(input, mainMsg) {

    let a = input.replace(mainMsg[0], '').match(/\S+/ig);
    for (var i = a.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = a[randomIndex];
        a[randomIndex] = a[i];
        a[i] = itemAtIndex;
    }
    return mainMsg[0] + ' → [' + a + ']';
}

function choice(input, str) {
    let a = input.replace(str[0], '').match(/\S+/ig);
    return str[0] + '[' + a + '] → ' + a[Dice(a.length) - 1];
}

function MyJSONStringify(object) {
    var simpleObject = '';
    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof (object[prop]) == 'object') {
            continue;
        }
        if (typeof (object[prop]) == 'function') {
            continue;
        }
        //simpleObject[prop] = object[prop];
        simpleObject += object[prop];
    }
    return JSON.parse(simpleObject);
};

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

function IsKeyWord(target, strs){
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
////////////////////////////////////////
//////////////// Help
////////////////////////////////////////

function Help() {
    return '【擲骰BOT】 貓咪&小伙伴‧改\
		\n 支援角卡、房間、KP、暗骰等功能\
		\n 使用說明:\
		\n https://github.com/sleepingcat103/RoboYabaso/blob/master/README.txt\
		';
}

function MeowHelp() {
    return Meow() + '\n要做什麼喵?\n\n(輸入 help 幫助 以獲得資訊)';
}

function Meow() {
    let rplyArr = ['喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵!', '喵喵....喵?', '喵!!!', '喵~喵~', '喵屁喵', '喵三小?', '玩不膩喵?'];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function Cat() {
    let rplyArr = ['喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵!', '喵喵....喵?', '喵!!!', '喵~喵~', '衝三小', '87玩夠沒', '生ㄎㄎㄎㄎㄎㄎ'];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function Bro() {
    let rplyArr = ['大哥是對的!!', '叫本大爺有何貴幹?', '幹嘛? 說好的貓罐罐呢?', '大哥你叫的?', '大哥永遠是對的!!!!'];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
};

