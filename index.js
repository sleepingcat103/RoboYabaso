var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var app = express();
 
var jsonParser = bodyParser.json();

var outType = 'text';
var event = '';
var v_path = '/v2/bot/message/reply';

var KP_MID = '';
var GP_MID = '';

var options = {
    host: 'api.line.me',
    port: 443,
    path: v_path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer actVI2pGSgmQ+JYuF2il02qMYH+1+3Q6pvaTjjL4J77uWSuVRoTZnloLqZG39jxfuZAWyS77LfHuQ9rHx4vupzxq3sDLKcwRraRq0F0t9B8aULHlhuO2BYmiIvOFjT6Vs+RFkd3GDQnNB2Ykvo6rlgdB04t89/1O/w1cDnyilFU='
    }
}
app.set('port', (process.env.PORT || 5000));

// views is directory for all template files

app.get('/', function (req, res) {
    //  res.send(parseInput(req.query.input));
    res.send('Hello');
});

app.post('/', jsonParser, function (req, res) {
    event = req.body.events[0];
    let type = event.type;
    let msgType = event.message.type;
    let msg = event.message.text;
    let rplyToken = event.replyToken;

    let rplyVal = null;

    outType = 'text';

    console.log(msg);
    if (type == 'message' && msgType == 'text') {
        try {
            rplyVal = parseInput(rplyToken, msg);
        }
        catch (e) {
            console.log('catch error');
	    console.log(e.toString());
        }
    }

    if (rplyVal) {
        if (outType == 'kp_ccd') {
            replyMsgToLine('text', rplyToken, rplyVal);
            replyMsgToLine('push', GP_MID, '剛剛好像發生了什麼事');
        }else if(outType == 'pl_ccd') {
            replyMsgToLine('text', rplyToken, '成功執行暗骰');
            replyMsgToLine('push', KP_MID, rplyVal);
        }else if(outType == 'gp_ccd') {
            replyMsgToLine('text', rplyToken, '成功執行暗骰');
            replyMsgToLine('push', KP_MID, rplyVal);
        }else if (outType == 'ccd') {
            replyMsgToLine('push', KP_MID, rplyVal);
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
    setOptions();
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
    options = {
        host: 'api.line.me',
        port: 443,
        path: v_path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer actVI2pGSgmQ+JYuF2il02qMYH+1+3Q6pvaTjjL4J77uWSuVRoTZnloLqZG39jxfuZAWyS77LfHuQ9rHx4vupzxq3sDLKcwRraRq0F0t9B8aULHlhuO2BYmiIvOFjT6Vs+RFkd3GDQnNB2Ykvo6rlgdB04t89/1O/w1cDnyilFU='
        }
    }
}

///////////////////////////////////////
/////////////////測試功能///////////////
///////////////////////////////////////

function createChar(p_name,p_uid){
     var player = {
	status:{
	name: p_name,	uid: p_uid,	db: '0',	item: '無',
	status: '正常',	str: '0',	dex: '0',	con: '0',
	pow: '0',	app: '0',	int: '0',	siz: '0',
	edu: '0',	hp: '0',	mp: '0',	san: '0',
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
	return '成功匯入角色 ' + this.getVal('name') + ' !!!!'
     };
     return player;
}

//var players = [Player.createNew(), Player.createNew(), Player.createNew(), Player.createNew(), Player.createNew()];
var players = [];

function removeA(a) {
	players.splice(a,1);
}

////////////////////////////////////////
//////////////// 分析開始 //////////////
////////////////////////////////////////
function parseInput(rplyToken, inputStr) {

    console.log('InputStr: ' + inputStr);
    _isNaN = function (obj) {
        return isNaN(parseInt(obj));
    }
    let msgSplitor = (/\S+/ig);
    let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
    let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階

    //角卡功能快速入口//	
    for (i = 0; i < players.length; i++) {
        if (mainMsg[0].toString() == players[i].getVal('name')) return CharacterControll(mainMsg[0], mainMsg[1], mainMsg[2],mainMsg[3]);
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
        return CharacterControll(mainMsg[1], mainMsg[2], mainMsg[3],mainMsg[4]);
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
    }
        //ccb指令開始於此
    else if (trigger == 'ccb') {
        return ccb(mainMsg[1], mainMsg[2]);//coc6(mainMsg[1],mainMsg[2]);
    }
        //KP指令開始於此
    else if (trigger == 'getkp') {
	if(KP_MID != ''){
           return KP_MID;
	}else{
	   return '現在沒有KP哦!!!';
	}
    }
    else if (trigger == 'setkp') {
        if (event.source.type == 'user') {
	    if( KP_MID == '' || KP_MID == event.source.userId ){
            	KP_MID = event.source.userId;
            	return '已經設定完成，KP的MID是' + KP_MID;
	    }else{
		return '如果要更換KP，請現任KP先下"killkp"之後，才能重新"setkp"';
	    }
        } else {
            return '私密BOT才能設定KP哦!!!';
        }
    }
    else if(trigger == 'killkp'){
	if (event.source.type == 'user' && KP_MID == event.source.userId){
	   KP_MID = '';
	   return 'KP已經重製了';
	}else{
	   if(KP_MID!=''){
		return '只有KP在私下密語才能使用這個功能哦!';
	   }else{
		return '現在沒有KP。';
	   }
	}
    }
    else if (trigger == 'getgp') {
	if(GP_MID != ''){
           return GP_MID;
	}else{
	   return '現在沒有KP哦!!!';
	}
    }
    else if (trigger == 'setgp') {
        if (event.source.type == 'group') {
            GP_MID = event.source.groupId;
            return 'MID是' + GP_MID;
        } else {
            return '邊緣人不能設定群組MID';
        }
    }
    else if(trigger == 'getuid'){
	if(event.source.type =='user')
	   return '你的uid是\n'+event.source.userId;
	else if(event.source.type =='group')
	   return '群組的uid是\n'+event.source.groupId;
    }
	//ccd指令開始於此
    else if (trigger == 'ccd' && KP_MID == event.source.userId && event.source.type == 'user') {
        outType = 'kp_ccd';
        return ccb(mainMsg[1], mainMsg[2]);
    }
    else if (trigger == 'ccd') {
	if(KP_MID!=''){
	   outType = 'ccd';
           return ccb(mainMsg[1], mainMsg[2]);//coc6(mainMsg[1],mainMsg[2]);
	}else{
	   return '現在沒有KP，你是想傳給誰辣';
	}
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
    }
}

////////////////////////////////////////
//////////////// 角色卡 測試功能
////////////////////////////////////////

function CharacterControll(trigger, str1, str2, str3) {
    if (trigger == undefined || trigger == null || trigger == '') {
        return Meow() + '請輸入更多資訊';
    }
    //建立新角
    if (trigger == 'new' || trigger == '建立') {
        if (str1 == undefined || str1 == null || str1 == '') return '沒有輸入名稱喵!';
        for (i = 0; i < players.length; i++) {
            if (players[i].getVal('name') == str1) return '已經有同名的角色了!';
        }
	var newPlayer;
	if(event.source.type == 'user'){
	   newPlayer = createChar(str1,event.source.userId);
	}else{
	   newPlayer = createChar(str1,'');
	}
	players.push(newPlayer);
	if(str2 == undefined || str2 == null || str2 == ''){
	    return '成功建立角色 ' + str1 + ' 請補充他/她的能力值!';
	}else{
	    return newPlayer.import(str2);
	}
    }

    //角色設定(特定狀態查詢) 刪除 查看
    for (i = 0; i < players.length; i++) {
        if (trigger == players[i].getVal('name')) {
            if (str1 == 'debug') {
                return players[i].debug(str1);//players[i].show();
            }
            else if (str1 == 'ccb') {
                return coc6(players[i].getVal(str2), str2);
            }
	    else if (str1 == 'ccd'){
		if(KP_MID != ''){
		   if(event.source.type == 'user' && event.source.userId == KP_MID){
			outType = 'kp_ccd';
			return ccd_dice(players[i].getVal('name'),players[i].getVal(str2), str2);
		   }else if(event.source.type == 'user' && event.source.userId == players[i].getVal('uid')){
			outType = 'pl_ccd';
			return ccd_dice(players[i].getVal('name'),players[i].getVal(str2), str2);
		   }else if(event.source.type == 'group'){
			outType = 'gp_ccd';
			return ccd_dice(players[i].getVal('name'),players[i].getVal(str2), str2);
		   }
		   return Meow();
		}else{
			return '現在沒有KP，你是想傳給誰辣';
		}
	    }
            else if (str1 == 'skills') {
                return players[i].showAll();
            }
            else if (str1 == 'addskill') {
		if(players[i].status.hasOwnProperty(str2)){
		   return '該技能之前就學過了';
		}else{
		   if(str3 == '' || str3 == undefined){
			players[i].setVal(str2,'0')
		   }else{
			players[i].setVal(str2,str3)
		   }
		}
		return players[i].getVal('name') + ' 學會了 ' + str2 + ' !!! ';
            }
            else if (str1 == 'deleteskill') {
		if(players[i].status.hasOwnProperty(str2)){
		   players[i].delVal(str2)
                   return '已經刪除技能: '+str2 + '.';
		}else{
		   return '你沒有這個技能.';
		}
            }
            else if (str1 == 'output') {
                return players[i].export();
            }
            else if (str1 == undefined || str1 == '' || str1 == '狀態' || str1 == '屬性') {
                return players[i].show();
            }
            else if (str1 == 'delete' || str1 == '刪除') {
		removeA(i);
                return '已刪除 ' + trigger + ' 角色資料喵~';
            }
            else {
                try {
                    if (str2 == undefined || str2 == null || str2 == '') {
                        return trigger + ': ' + str1 + '[' + players[i].getVal(str1) + ']';
                    } else {
			if( players[i].status.hasOwnProperty(str1) &&
			   (event.source.type == 'group' ||
			    (event.source.type == 'user' && event.source.userId == KP_MID)||
			    (event.source.type == 'user' && KP_MID == '')
			   )
			){
			   var tempVal = players[i].getVal(str1);
			   var afterVal = str2;
			   if(afterVal.charAt(0) == '+' && str1 != 'db'){
				afterVal = Number(tempVal) + Number(afterVal.substring(1));
			   }else if(afterVal.charAt(0) == '-' && str1 != 'db'){
				afterVal = Number(tempVal) - Number(afterVal.substring(1));
			   }
			   players[i].setVal(str1,afterVal);
                           return trigger + ': ' + str1 + '[' + tempVal + '->' + players[i].getVal(str1) + ']';
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
        var tempstr = '角色清單: (max=5)\n';
        for (i = 1; i < players.length+1; i++) {
            tempstr += i + '. ' + players[i - 1].getVal('name') + '\n';
        }
        return tempstr;
    }
    return '沒有這個角色喵~';
}


////////////////////////////////////////
//////////////// COC6 CCB成功率骰
////////////////////////////////////////
function ccb(chack, text) {
    var val_status = chack;
    for (i = 0; i < players.length; i++) {
        if (val_status.toString() == players[i].getVal('name')) {
            val_status = players[i].getVal(text.toString().toLowerCase().trim());
            break;
        }
    }
    if (val_status <= 99) {
        return coc6(val_status, text);
    } else {
        return 'error';
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
//////////////// 工具
////////////////////////////////////////

function padLeft(str,lenght){
    if(str.length >= lenght)
        return str;
    else
        return padLeft('　' + str,lenght);
}
function padRight(str,lenght){
    if(str.length >= lenght)
        return str;
    else
        return padRight(str+'　',lenght);
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

////////////////////////////////////////
//////////////// Help
////////////////////////////////////////

function Help() {
    return '【擲骰BOT】 貓咪改\
		\n 本BOT為COC6內部跑團工具\
		\n 其他功能有用到再考慮寫進去\
		\n \
		\n == 基本擲骰功能 ==\
		\n 支援四則運算，可以加上空白後發言\
		\n 範例輸入:\
		\n 1d10\
		\n 2d6+3d4\
		\n 3d6 鐵拳攻擊\
		\n \
		\n 另外還有複數擲骰功能\
		\n 範例輸入:\
		\n 5 3D6\
		\n \
		\n == coc技能骰 ==\
		\n 輸入 ccb 成功率 (技能)\
		\n 範例輸入:\
		\n ccb 50\
		\n ccb 30 抓兔子\
		\n \
		\n == DB查詢 ==\
		\n DB為STR+SIZE的傷害加權\
		\n 啟動語: db 數值\
		\n \
		\n == coc創角功能 ==\
		\n 啟動語: coc創角\
		\n \
		\n == 其他功能 ==\
		\n 以下為娛樂功能\
		\n 字句中有關鍵字就會啟動\
		\n \
		\n 1.選擇功能: choice/隨機/選項/幫我選\
		\n 	範例: 隨機選顏色 紅 黃 藍\
		\n 2.隨機排序: 排序\
		\n 	範例: 吃東西排序 羊肉 牛肉 豬肉\
		\n 3.占卜功能: 運氣/運勢\
		\n 	範例: 今日運勢\
		\n 4.死亡FLAG: 立Flag/死亡flag\
		';
}

function MeowHelp() {
    return Meow() + '\n要做什麼喵?\n\n(輸入 help 幫助 以獲得資訊)';
}

function Meow() {
    let rplyArr = ['喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵屁喵', '喵三小?有病?'];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function Cat() {
    let rplyArr = ['喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵', '\
衝三小', '87玩夠沒', '生科ㄎㄎ'];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}
