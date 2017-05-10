var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var app = express();
 
var jsonParser = bodyParser.json();

var outType = 'text';
var event = '';
var v_path = '/v2/bot/message/reply';


// 房間入口
// key:value
// GroupMid : room Object
var TRPG = { 
    first : {
	KP_MID: '',
	GP_MID: '',
	players : []
    }
};
TRPG.createRoom = function(p_mid,room_Obj){
    eval('TRPG.'+p_mid+' = room_Obj');
}

// 紀錄使用者的資訊，以及進入的房間
// key:value
// UserMid: {GP_MID,displayName,userId,pictureUrl,statusMessage}
var userToRoom={};

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
    //  res.send(parseInput(req.query.input));
    res.send('Hello');
});

app.post('/', jsonParser, function (req, res) {
    event = req.body.events[0];
    let type = event.type;
	
    if(type == 'leave' && TRPG.hasOwnProperty(event.source.groupId)){
    	eval('delete TRPG.'+event.source.groupId);
	console.log('room existance: '+TRPG.hasOwnProperty(event.source.groupId));
    }
	
    let msgType = event.message.type;
    let msg = event.message.text;
    let rplyToken = event.replyToken;

    let rplyVal = null;

    var roomMID = 'first';
	
    // 先找是否已經進入房間
    if(event.source.type == 'user'){
	for (var p in userToRoom) {
	    if( p == event.source.userId ) {
		for(var r in TRPG){
		    if(userToRoom[p].GP_MID == r){
			    roomMID = r;
			    break;
		    }
		}
	    }
	    if(roomMID != 'first'){
		break;
	    }
	}
    }else if(event.source.type == 'group'){
	for(var r in TRPG){
	    if(r == event.source.groupId ){
		roomMID = r;
		break;
	    }
	}
    }
	
    outType = 'text';

    console.log(msg);
    if (type == 'message' && msgType == 'text') {
        try {
            rplyVal = parseInput(roomMID,rplyToken, msg);
        }
        catch (e) {
            console.log('catch error');
	    console.log(e.toString());
        }
    }
	
    if (rplyVal) {
        if (outType == 'ccd') {
            replyMsgToLine('push', TRPG[roomMID].KP_MID, rplyVal);
        }else {
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
    if (outType == 'image') {
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [
              {
                  type: "image",
                  originalContentUrl: rplyVal,
                  previewImageUrl: rplyVal
              }
            ]
        }
    } else if (outType == 'push') {
        v_path = '/v2/bot/message/push';
        rplyObj = {
            to: rplyToken,
            messages: [
              {
                  type: "text",
                  text: rplyVal
              }
            ]
        }
    } else {
        v_path = '/v2/bot/message/reply';
        rplyObj = {
            replyToken: rplyToken,
            messages: [
              {
                  type: "text",
                  text: rplyVal
              }
            ]
        }
    }

    let rplyJson = JSON.stringify(rplyObj);
    var options = setOptions();
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

    v_path = '/v2/bot/profile/'+p_MID;
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
	    replyMsgToLine('push',userToRoom[p_MID].GP_MID , userToRoom[p_MID].displayName + ' 加入房間囉!!');
	    newBody = null;
        });
    });

    request.on('error', function (e) {
        console.log('Request error: ' + e.message);
    });
    request.end();
}

///////////////////////////////////////
/////////////////角色功能///////////////
///////////////////////////////////////

function createChar(p_name,p_uid){
     var player = {
	status:{
	name: p_name,	uid: p_uid,	db: '0',	item: '無',
	status: '正常',	str: '0',	dex: '0',	con: '0',
	pow: '0',	app: '0',	int: '0',	siz: '0',
	edu: '0',	hp: '0',	mp: '0',	san: '0',
	luck: '0',	職業: '無',	
	靈感: '75',	知識: '75',	信用: '0',	魅惑: '15',
	恐嚇: '15',	說服: '10',	話術: '5',	心理學: '10',
	心理分析: '1',	調查: '25',	聆聽: '20',	圖書館使用: '20',
	追蹤: '10',	急救: '30',	醫學: '30',	鎖匠: '1',
	手上功夫: '10',	隱密行動: '10',	生存: '10',	閃避: '0',
	攀爬: '20',	跳躍: '20',	游泳: '20',	駕駛: '20',
	領航: '10',	騎術: '5',	自然學: '10',	神秘學: '5',
	歷史: '5',	會計: '5',	估價: '5',	法律: '5',
	喬裝: '5',	電腦使用: '5',	電器維修: '10',	機械維修: '10',
	重機械操作: '1',	數學: '10',	化學: '1',	藥學: '1',
	人類學: '1',	考古學: '1',	電子學: '1',	物理學: '1',
	工程學: '1',	密碼學: '1',	天文學: '1',	地質學: '1',
	生物學: '1',	動物學: '1',	植物學: '1',	物證學: '1',
	投擲: '20',	鬥毆: '25',	劍: '20',	矛: '20',
	斧頭: '15',	絞殺: '15',	電鋸: '10',	連枷: '10',
	鞭子: '5',	弓箭: '15',	手槍: '20',	步槍: '25',
	衝鋒槍: '15',	機關槍: '10',	重武器: '10',	火焰噴射器: '10',
	美術: '5',	演技: '5',	偽造: '5',	攝影: '5',
	克蘇魯神話: '0'
	}
     };
     player.getVal = function(p_sta) {
	return eval('this.status.'+p_sta);
     };
     player.setVal = function(p_sta,p_val){
	if(isNaN(Number(p_val))){
	   eval('this.status.'+p_sta+' = \''+p_val+'\'');
	}else{
	   if(Number(p_val)<0){
		eval('this.status.'+p_sta+' = \''+0+'\'');
	   }else if(Number(p_val)>99){
		eval('this.status.'+p_sta+' = \''+99+'\'');
	   }else{
		eval('this.status.'+p_sta+' = \''+p_val+'\'');
	   }
	}
     };
     player.delVal = function(p_sta){
	eval('delete this.status.'+p_sta);
     };
     player.showAll = function(){
	var result = "";
	var v_cnt = 0;
	for (var p in this.status) {
	    if( this.status.hasOwnProperty(p) ) {
		v_cnt = Number(v_cnt)+1;
		if( v_cnt%3 == 0)
		   result += p + ": " + this.status[p] + "\n";
		else
		   result += p + ": " + this.status[p] + "\t";
	    } 
	};
	return result;
     };
     player.show = function() {
	var tempstr = '+=====================+\n';
	tempstr += this.getVal('name') + '\n';
	tempstr += this.getVal('職業') + '\n';
	tempstr += padRight('STR:',4) + padRight(this.getVal('str'),3) + padRight('DEX:',4) + padRight(this.getVal('dex'),3) + padRight('CON:',4) + padRight(this.getVal('con'),3) + '\n';
	tempstr += padRight('POW:',4) + padRight(this.getVal('pow'),3) + padRight('APP:',4) + padRight(this.getVal('app'),3) + padRight('INT:',4) + padRight(this.getVal('int'),3) + '\n';
	tempstr += padRight('SIZ:',4) + padRight(this.getVal('siz'),3) + padRight('EDU:',4) + padRight(this.getVal('edu'),3) + padRight('DB:',4)  + padRight(this.getVal('db'),3) + '\n';
	tempstr += '+=====================+\n';
	tempstr += padRight('HP:',4) + padRight(this.getVal('hp'),3)   + padRight('MP:',4)  + padRight(this.getVal('mp'),3)  + padRight('SAN:',4) + padRight(this.getVal('san'),3) + '\n';
	tempstr += padRight('STATUS:',8) + this.getVal('status') + '\n';
	tempstr += padRight('ITEM:',8)  + this.getVal('item') + '\n';
	tempstr += '+=====================+';
	return tempstr;
     };
     player.export = function() {
	var retStr = JSON.stringify(this.status);
	return retStr;
     };
     player.import = function(p_str) {
	var newChar = JSON.parse(p_str);
	var oriName = this.getVal('name');
	this.status = newChar;
	this.setVal('name',oriName);
	return '成功匯入角色 ' + this.getVal('name') + ' !!!!';
     };
     player.importFromTRPG = function(p_str){
	var tempChar = JSON.parse(p_str);
	var newChar = tempChar.skill;
	for (var p in newChar){
	   if(this.status.hasOwnProperty(JSONmapping[p])){
		eval('this.status.'+ JSONmapping[p] +'=\''+ newChar[p] +'\'');
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

function createNewRoom(p_Mid){
     var room = {
	GP_MID: p_Mid,
	KP_MID:'',
	players: []
     };
     room.setkp = function(p_Mid){
	this.KP_MID = p_Mid;
     };
     room.getGPMid = function(){
	return this.GP_MID;
     };
     room.getKPMid = function(){
	return this.KP_MID;
     };
     room.newChar = function(p_char){
	this.players.push(p_char);
     };
     return room;
}

////////////////////////////////////////
//////////////// 分析開始 //////////////
////////////////////////////////////////
function parseInput(roomMID,rplyToken, inputStr) {

    console.log('InputStr: ' + inputStr);
    _isNaN = function (obj) {
        return isNaN(parseInt(obj));
    }
    let msgSplitor = (/\S+/ig);
    let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
    let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階

    //角卡功能快速入口//
    for (i = 0; i < TRPG[roomMID].players.length; i++) {
	if (mainMsg[0].toString() == TRPG[roomMID].players[i].getVal('name'))
		return CharacterControll( roomMID, mainMsg[0], mainMsg[1], mainMsg[2],mainMsg[3]);
    }

    if (trigger.match(/運氣|運勢/) != null) {
        return randomLuck(mainMsg); //占卜運氣
    }
    else if (trigger.match(/立flag|死亡flag/) != null) {
        return BStyleFlagSCRIPTS();
    }
    else if (trigger.match(/coc創角/) != null && mainMsg[1] != NaN) {
        return build6char(mainMsg[1]);
    }
    else if (trigger == 'db') {
        return db(mainMsg[1], 1);
    }
    else if (trigger == '角色' || trigger == 'char') {
	if(roomMID == 'first'){
	    if(event.source.type =='user'){
		return '你還沒進入房間喵!!!';
	    }else{
		return '房間還沒有建立!!\n請先輸入  setgp';
	    }
    	}else{
	    return CharacterControll(roomMID,mainMsg[1], mainMsg[2], mainMsg[3],mainMsg[4]);
	}
    }
    else if (trigger == 'join') {
	if(event.source.type == 'user' &&
	   userToRoom.hasOwnProperty(event.source.userId) &&
	   userToRoom[event.source.userId].GP_MID == mainMsg[1] ){
		return '你已經在房間裡了喵!';
	}else if(event.source.type == 'user'){
	    eval('userToRoom.'+event.source.userId+' = {}');
	    userToRoom[event.source.userId] = {
		    GP_MID: mainMsg[1],
		    displayName: '',
		    userId: '',
		    pictureUrl: '',
		    statusMessage: ''
	    };
	    getUserProfile(event.source.userId)	    
	    return '加入房間喵!\n請到群組確認加入訊息~';
	}else{
	    return '你想幹嘛啦~~~';
	}
    }
    else if (trigger == '貓咪') {
        return MeowHelp();
    }
    else if (trigger.match(/喵/) != null) {
        return Meow();
    }
    else if (trigger.match(/貓/) != null) {
        return Cat();
    }
    else if (trigger == 'help' || trigger == '幫助') {
        return Help();
    }
    else if (trigger.match(/排序/) != null && mainMsg.length >= 3) {
        return SortIt(inputStr, mainMsg);
    }   //ccb指令開始於此
    else if (trigger == 'ccb') {
        return ccb(roomMID,mainMsg[1], mainMsg[2]);
    }   //ccd指令開始於此
    else if (trigger == 'ccd') {
	for (i = 0; i < TRPG[roomMID].players.length; i++) {
	    if (mainMsg[1].toString() == TRPG[roomMID].players[i].getVal('name'))
	    	return CharacterControll( roomMID, mainMsg[1], mainMsg[0], mainMsg[2],mainMsg[3]);
	}
	if(TRPG[roomMID].KP_MID != ''){
	   replyMsgToLine('push', TRPG[roomMID].KP_MID, ccd_dice(mainMsg[3],mainMsg[1],mainMsg[2]));
           if (TRPG[roomMID].KP_MID == event.source.userId){
	       replyMsgToLine('push',TRPG[roomMID].GP_MID,'')
	   }else{
	       return '成功執行暗骰';
	   }
	}else if(roomMID == 'first'){ // 房間還沒創或是沒進入房間
	   return '你還沒進入房間';
	}else{
	   return '現在房間沒有KP，你想傳給誰喵?';
	}
    }    //房間相關指令開始於此
    else if (trigger == 'getkp') {
	if(TRPG[roomMID].KP_MID != ''){
           return TRPG[roomMID].KP_MID;
	}else if (event.source.type != 'group'){
	   return '在群組才能使用唷!!!';
	}else{
	   return '目前沒有設置KP喵!!!';
	}
    }
    else if (trigger == 'setkp') {
        if (event.source.type == 'user') {
	    if( TRPG[roomMID].KP_MID == '' || TRPG[roomMID].KP_MID == event.source.userId ){
		if(roomMID=='first'){
			return '你還沒有進入房間';
		}
		TRPG[roomMID].KP_MID = event.source.userId;
            	return '設定完成喵';	//，KP的MID是\n' + TRPG[roomMID].KP_MID;
	    }else{
		return '如果要更換KP，請現任KP先卸任之後，才能重新"setkp"';
	    }
        } else {
            return '私密BOT才能設定KP哦!!!';
        }
    }
    else if(trigger == 'killkp'){
	if (event.source.type == 'user' && TRPG[roomMID].KP_MID == event.source.userId){
	   TRPG[roomMID].KP_MID = '';
	   return '已經沒有KP了喵';
	}else{
	   if(TRPG[roomMID].KP_MID!=''){
		return '只有KP在私下密語才能使用這個功能哦!';
	   }else if(roomMID=='first'){
		return '你還沒有進入房間';
	   }else{
		return '現在沒有KP喵~';
	   }
	}
    }
    else if (trigger == 'getgp') {
	if(TRPG[roomMID].GP_MID != ''){
           return TRPG[roomMID].GP_MID;
	}else{
	   return '你還沒有進房間哦!!!';
	}
    }
    else if (trigger == 'setgp') {
	if(event.source.type == 'group'){
	    if(TRPG.hasOwnProperty(event.source.groupId)){
		return '在群組開啟了遊戲房間!!!';
	    }else{
		TRPG.createRoom(event.source.groupId,createNewRoom(event.source.groupId));
		return '房間建立成功，請PL私密輸入\njoin '+event.source.groupId;
	    }
	}else{
	    return '必須是群組才能開房間唷 <3 ';
	}
    }
    else if((trigger == 'leaveroom' || event.type == 'leave') && TRPG.hasOwnProperty(event.source.groupId)){
    	eval('delete TRPG.'+event.source.groupId);
	console.log('room existance: '+TRPG.hasOwnProperty(event.source.groupId));
	return '已經刪除房間資訊了喵~';
    }
    else if(trigger == 'getuid'){
	if(event.source.type == 'user' )
	   return '你的uid是:' + event.source.userId;
	//else if(event.source.type =='group')
	//   return '群組的uid是' + event.source.groupId;
	else
	   return eval('\'群組的uid是: \' + event.source.+'+event.source.type+'Id');
    }
        //生科火大圖指令開始於此
    else if (trigger == '生科') {
        outType = 'image';
        return 'https://i.imgur.com/jYxRe8wl.jpg';//coc6(mainMsg[1],mainMsg[2]);
    }
        //choice 指令開始於此
    else if (trigger.match(/choice|隨機|選項|幫我選/) != null && mainMsg.length >= 3) {
        return choice(inputStr, mainMsg);
    }
        //tarot 指令
    else if (trigger.match(/tarot|塔羅牌|塔羅/) != null) {
        return NomalDrawTarot();
    }
        //普通ROLL擲骰判定
    else if (inputStr.match(/\w/) != null && inputStr.toLowerCase().match(/\d+d+\d/) != null) {
        return nomalDiceRoller(inputStr, mainMsg[0], mainMsg[1], mainMsg[2]);
    }else if(trigger == 'getprofile' && event.source.type =='user'){
	return userToRoom[event.source.userId].displayName + '\n'+
	       userToRoom[event.source.userId].userId + '\n'+
	       userToRoom[event.source.userId].pictureUrl + '\n'+
	       userToRoom[event.source.userId].statusMessage;
    }
}

////////////////////////////////////////
//////////////// 角色卡 測試功能
////////////////////////////////////////

function CharacterControll(roomMID,trigger, str1, str2, str3) {
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
	if(event.source.type == 'user'){
	   newPlayer = createChar(str1,event.source.userId);
	}else{
	   newPlayer = createChar(str1,'');
	}
	TRPG[roomMID].players.push(newPlayer);
	if(str2 == undefined || str2 == null || str2 == ''){
	    return '成功建立角色 ' + str1 + ' 請補充他/她的能力值!';
	}else if (str2 == 'trpg'){
	    return newPlayer.importFromTRPG(str3);
	}else{
	    return newPlayer.import(str2);
	}
    }

    //角色設定(特定狀態查詢) 刪除 查看
    for (i = 0; i < TRPG[roomMID].players.length; i++) {
        if (trigger == TRPG[roomMID].players[i].getVal('name')) {
            if (str1 == 'debug') {
                return TRPG[roomMID].players[i].debug(str1);//players[i].show();
            }
            else if (str1 == 'ccb') {
                return coc6(TRPG[roomMID].players[i].getVal(str2), str2);
            }
	    else if (str1 == 'ccd'){
		if(TRPG[roomMID].KP_MID != ''){
		   if(event.source.type == 'user' && event.source.userId == TRPG[roomMID].KP_MID){
			replyMsgToLine('push', TRPG[roomMID].GP_MID, '剛剛好像發生了什麼事');
			return ccd_dice(TRPG[roomMID].players[i].getVal('name'),TRPG[roomMID].players[i].getVal(str2), str2);
		   }else if(event.source.type == 'group' ||
			   (event.source.type == 'user' && event.source.userId == TRPG[roomMID].players[i].getVal('uid'))){
			replyMsgToLine('push', TRPG[roomMID].KP_MID, ccd_dice(TRPG[roomMID].players[i].getVal('name'),TRPG[roomMID].players[i].getVal(str2), str2));
			return '成功執行暗骰';
		   }
		   return Meow();
		}else{
			return '現在沒有KP，你是想傳給誰辣';
		}
	    }
            else if (str1 == 'skills') {
                return TRPG[roomMID].players[i].showAll();
            }
            else if (str1 == 'addskill') {
		if(TRPG[roomMID].players[i].status.hasOwnProperty(str2)){
		   return '該技能之前就學過了';
		}else{
		   if(str3 == '' || str3 == undefined){
			TRPG[roomMID].players[i].setVal(str2,'0')
		   }else{
			TRPG[roomMID].players[i].setVal(str2,str3)
		   }
		}
		return TRPG[roomMID].players[i].getVal('name') + ' 學會了 ' + str2 + ' !!! ';
            }
            else if (str1 == 'deleteskill') {
		if(TRPG[roomMID].players[i].status.hasOwnProperty(str2)){
		   TRPG[roomMID].players[i].delVal(str2)
                   return '已經刪除技能: '+str2 + '.';
		}else{
		   return '你沒有這個技能.';
		}
            }
            else if (str1 == 'output') {
                return TRPG[roomMID].players[i].export();
            }
            else if (str1 == undefined || str1 == '' || str1 == '狀態' || str1 == '屬性') {
                return TRPG[roomMID].players[i].show();
            }
            else if (str1 == 'delete' || str1 == '刪除') {
		TRPG[roomMID].players.splice(i,1);
                return '已刪除 ' + trigger + ' 角色資料喵~';
            }
            else {
                try {
                    if (str2 == undefined || str2 == null || str2 == '') {
                        return trigger + ': ' + str1 + '[' + TRPG[roomMID].players[i].getVal(str1) + ']';
                    } else {
			if( TRPG[roomMID].players[i].status.hasOwnProperty(str1) &&
			   (event.source.type == 'group' ||
			    (event.source.type == 'user' && event.source.userId == TRPG[roomMID].KP_MID)||
			    (event.source.type == 'user' && TRPG[roomMID].KP_MID == '')
			   )
			){
			   var tempVal = TRPG[roomMID].players[i].getVal(str1);
			   var afterVal = str2;
			   if(afterVal.charAt(0) == '+' && str1 != 'db'){
				afterVal = Number(tempVal) + Number(afterVal.substring(1));
			   }else if(afterVal.charAt(0) == '-' && str1 != 'db'){
				afterVal = Number(tempVal) - Number(afterVal.substring(1));
			   }
			   TRPG[roomMID].players[i].setVal(str1,afterVal);
                           return trigger + ': ' + str1 + '[' + tempVal + '->' + TRPG[roomMID].players[i].getVal(str1) + ']';
			}else{
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
        for (i = 1; i < TRPG[roomMID].players.length+1; i++) {
            tempstr += i + '. ' + TRPG[roomMID].players[i - 1].getVal('name') + '\n';
        }
        return tempstr;
    }
    return '沒有這個角色喵~';
}


////////////////////////////////////////
//////////////// COC6 CCB成功率骰
////////////////////////////////////////
function ccb( roomMID, chack, text) {
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
	return ccd_dice(who,chack,text)
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
        }
        else return 'ccb<=' + chack + ' ' + temp + ' → 失敗';
    } else {
        if (temp > 95) return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 大成功！';
            else return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 成功';
        }
        else return 'ccb<=' + chack + ' ' + temp + ' → ' + text + ' 失敗';
    }
}
function ccd_dice(p_name,chack, text) {

    let temp = Dice(100);
    if (text == null) {
        if (temp > 95) return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → 喔喔！大成功！';
            else return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → 成功';
        }
        else return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → 失敗';
    } else {
        if (temp > 95) return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 大失敗！哈哈哈！';
        if (temp <= chack) {
            if (temp <= 5) return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 大成功！';
            else return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 成功';
        }
        else return p_name+'做了'+'ccd<=' + chack + ' ' + temp + ' → ' + text + ' 失敗';
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

        for (i = 1 ; i <= mutiOrNot ; i++) {
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

function MyJSONStringify (object){
    var simpleObject = '';
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        //simpleObject[prop] = object[prop];
	simpleObject += object[prop];
    }
    return JSON.parse(simpleObject);
};

function padLeft(str,length){
    if(str.length >= length)
        return str;
    else
        return padLeft('　' + str,length);
}
function padRight(str,length){
    if(str.length >= length)
        return str;
    else
        return padRight(str+'　',length);
}

var JSONmapping = {
character_name: 'name',
char_section0_1_field1: 'hp',
char_section0_1_field3: 'mp',
char_section0_1_field5: 'san',
char_section0_1_field7: 'luck',
char_section0_1_field9: 'status',
char_section0_1_field10: '職業',
char_section1_1_field1: 'str',
char_section1_1_field2: 'con',
char_section1_1_field3: 'dex',
char_section1_1_field4: 'app',
char_section1_1_field5: 'pow',
char_section1_1_field6: 'int',
char_section1_1_field7: 'siz',
char_section1_1_field8: 'edu',
char_section2_1_field1: '母語',
char_section2_1_field8: '靈感',
char_section2_1_field10: '知識',
char_section3_1_field1: '信用',
char_section3_1_field2: '魅惑',
char_section3_1_field3: '恐嚇',
char_section3_1_field4: '說服',
char_section3_1_field5: '話術',
char_section3_1_field6: '心理學',
char_section3_1_field7: '心理分析',
char_section4_1_field1: '調查',
char_section4_1_field2: '聆聽',
char_section4_1_field3: '圖書館使用',
char_section4_1_field4: '追蹤',
char_section4_1_field5: '急救',
char_section4_1_field6: '醫學',
char_section4_1_field7: '鎖匠',
char_section4_1_field8: '手上功夫',
char_section4_1_field9: '隱密行動',
char_section4_1_field10: '生存',
char_section5_1_field1: '閃避',
char_section5_1_field2: '攀爬',
char_section5_1_field3: '跳躍',
char_section5_1_field4: '游泳',
char_section5_1_field5: '駕駛',
char_section5_1_field6: '領航',
char_section5_1_field7: '騎術',
char_section6_1_field1: '自然學',
char_section6_1_field2: '神祕學',
char_section6_1_field3: '歷史',
char_section6_1_field4: '會計',
char_section6_1_field5: '估價',
char_section6_1_field6: '法律',
char_section6_1_field7: '喬裝',
char_section6_1_field8: '電腦使用',
char_section6_1_field9: '電器維修',
char_section6_1_field10: '機械維修',
char_section6_1_field11: '重機械操作',
char_section7_1_field1: '數學',
char_section7_1_field2: '化學',
char_section7_1_field3: '藥學',
char_section7_1_field4: '人類學',
char_section7_1_field5: '考古學',
char_section7_1_field6: '電子學',
char_section7_1_field7: '物理學',
char_section7_1_field8: '工程學',
char_section7_1_field9: '密碼學',
char_section7_1_field10: '天文學',
char_section7_1_field11: '地質學',
char_section7_1_field12: '生物學',
char_section7_1_field13: '動物學',
char_section7_1_field14: '植物學',
char_section7_1_field15: '物證學',
char_section8_1_field1: '投擲',
char_section8_1_field2: '鬥毆',
char_section8_1_field3: '劍',
char_section8_1_field4: '矛',
char_section8_1_field5: '斧頭',
char_section8_1_field6: '絞殺',
char_section8_1_field7: '電鋸',
char_section8_1_field8: '連枷',
char_section8_1_field9: '鞭子',
char_section8_1_field10: '弓箭',
char_section8_1_field11: '手槍',
char_section8_1_field12: '步槍',
char_section8_1_field13: '衝鋒槍',
char_section8_1_field14: '機關槍',
char_section8_1_field15: '重武器',
char_section8_1_field16: '火焰噴射器',
char_section9_1_field1: '美術',
char_section9_1_field2: '演技',
char_section9_1_field3: '偽造',
char_section9_1_field4: '攝影',
char_section10_1_field1: '克蘇魯神話'
//,char_section11_1_field1: 'item'
};

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
};
