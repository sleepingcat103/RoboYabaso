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
        }
    }

    if (rplyVal) {
        if (outType == 'kp_ccd') {
            replyMsgToLine('text', rplyToken, rplyVal);
            replyMsgToLine('ccd', GP_MID, '某八七再擲暗骰不給你們知道');
        } else if (outType == 'ccd') {
            replyMsgToLine(outType, KP_MID, rplyVal);
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
    } else if (outType == 'ccd') {
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

var Player = {

    createNew: function () {
        var player = {};

        var player_status = ['\
undefined', '0', '無', '正常', '0', '0', '0', '0', '0', '0', '\
0', '0', '0', '0', '0', '75', '75', '0', '15', '15', '\
10', '5', '10', '1', '25', '20', '20', '10', '30', '30', '\
1', '10', '10', '10', '0', '20', '20', '20', '20', '10', '\
5', '10', '5', '5', '5', '5', '5', '5', '5', '10', '\
10', '1', '10', '1', '1', '1', '1', '1', '1', '1', '\
1', '1', '1', '1', '1', '1', '1', '20', '25', '20', '\
20', '15', '15', '10', '10', '5', '15', '20', '25', '15', '\
10', '10', '10', '5', '5', '5', '5', '0', '0', '0', '\
0', '0', '0', '0', '0', '0', '0', '0', '無', '無', '\
無', '無', '無', '無', '無', '無', '無', '無'];

        player.debug = function (string) {
            return eval(string);
        }

        player.show = function () {
            var tempstr;
            tempstr = '+==========================+\n';
            tempstr += player.getVal('name') + '\n';
            tempstr += 'STR: ' + player.getVal('str') + ' DEX: ' + player.getVal('dex') + ' CON: ' + player.getVal('con') + '\n';
            tempstr += 'POW: ' + player.getVal('pow') + ' APP: ' + player.getVal('app') + ' INT: ' + player.getVal('int') + '\n';
            tempstr += 'SIZ: ' + player.getVal('siz') + ' EDU: ' + player.getVal('edu') + ' DB: ' + player.getVal('db') + '\n';
            tempstr += '+--------------------------+\n';
            tempstr += 'HP: ' + player.getVal('hp') + ' MP: ' + player.getVal('mp') + ' SAN: ' + player.getVal('san') + '\n';
            tempstr += 'STATUS: ' + player.getVal('status') + '\n';
            tempstr += 'ITEM: ' + player.getVal('item') + '\n';
            tempstr += '+==========================+\n';
            return tempstr;
        }

        player.showall = function () {
            var tempstr = 'name' + ': ' + player_status[0] + '\n' + '\
db'+ ': ' + player_status[1] + '\n' + '\
item'+ ': ' + player_status[2] + '\n' + '\
status'+ ': ' + player_status[3] + '\n' + '\
str'+ ': ' + player_status[4] + '\n' + '\
dex'+ ': ' + player_status[5] + '\n' + '\
con'+ ': ' + player_status[6] + '\n' + '\
pow'+ ': ' + player_status[7] + '\n' + '\
app'+ ': ' + player_status[8] + '\n' + '\
int'+ ': ' + player_status[9] + '\n' + '\
siz'+ ': ' + player_status[10] + '\n' + '\
edu'+ ': ' + player_status[11] + '\n' + '\
hp'+ ': ' + player_status[12] + '\n' + '\
mp'+ ': ' + player_status[13] + '\n' + '\
san'+ ': ' + player_status[14] + '\n' + '\
靈感'+ ': ' + player_status[15] + '\n' + '\
知識'+ ': ' + player_status[16] + '\n' + '\
信用'+ ': ' + player_status[17] + '\n' + '\
魅惑'+ ': ' + player_status[18] + '\n' + '\
恐嚇'+ ': ' + player_status[19] + '\n' + '\
說服'+ ': ' + player_status[20] + '\n' + '\
話術'+ ': ' + player_status[21] + '\n' + '\
心理學'+ ': ' + player_status[22] + '\n' + '\
心理分析'+ ': ' + player_status[23] + '\n' + '\
調查'+ ': ' + player_status[24] + '\n' + '\
聆聽'+ ': ' + player_status[25] + '\n' + '\
圖書館使用'+ ': ' + player_status[26] + '\n' + '\
追蹤'+ ': ' + player_status[27] + '\n' + '\
急救'+ ': ' + player_status[28] + '\n' + '\
醫學'+ ': ' + player_status[29] + '\n' + '\
鎖匠'+ ': ' + player_status[30] + '\n' + '\
手上功夫'+ ': ' + player_status[31] + '\n' + '\
隱密行動'+ ': ' + player_status[32] + '\n' + '\
生存'+ ': ' + player_status[33] + '\n' + '\
閃避'+ ': ' + player_status[34] + '\n' + '\
攀爬'+ ': ' + player_status[35] + '\n' + '\
跳躍'+ ': ' + player_status[36] + '\n' + '\
游泳'+ ': ' + player_status[37] + '\n' + '\
駕駛'+ ': ' + player_status[38] + '\n' + '\
領航'+ ': ' + player_status[39] + '\n' + '\
騎術'+ ': ' + player_status[40] + '\n' + '\
自然學'+ ': ' + player_status[41] + '\n' + '\
神秘學'+ ': ' + player_status[42] + '\n' + '\
歷史'+ ': ' + player_status[43] + '\n' + '\
會計'+ ': ' + player_status[44] + '\n' + '\
估價'+ ': ' + player_status[45] + '\n' + '\
法律'+ ': ' + player_status[46] + '\n' + '\
喬裝'+ ': ' + player_status[47] + '\n' + '\
電腦使用'+ ': ' + player_status[48] + '\n' + '\
電器維修'+ ': ' + player_status[49] + '\n' + '\
機械維修'+ ': ' + player_status[50] + '\n' + '\
重機械操作'+ ': ' + player_status[51] + '\n' + '\
數學'+ ': ' + player_status[52] + '\n' + '\
化學'+ ': ' + player_status[53] + '\n' + '\
藥學'+ ': ' + player_status[54] + '\n' + '\
人類學'+ ': ' + player_status[55] + '\n' + '\
考古學'+ ': ' + player_status[56] + '\n' + '\
電子學'+ ': ' + player_status[57] + '\n' + '\
物理學'+ ': ' + player_status[58] + '\n' + '\
工程學'+ ': ' + player_status[59] + '\n' + '\
密碼學'+ ': ' + player_status[60] + '\n' + '\
天文學'+ ': ' + player_status[61] + '\n' + '\
地質學'+ ': ' + player_status[62] + '\n' + '\
生物學'+ ': ' + player_status[63] + '\n' + '\
動物學'+ ': ' + player_status[64] + '\n' + '\
植物學'+ ': ' + player_status[65] + '\n' + '\
物證學'+ ': ' + player_status[66] + '\n' + '\
投擲'+ ': ' + player_status[67] + '\n' + '\
鬥毆'+ ': ' + player_status[68] + '\n' + '\
劍'+ ': ' + player_status[69] + '\n' + '\
矛'+ ': ' + player_status[70] + '\n' + '\
斧頭'+ ': ' + player_status[71] + '\n' + '\
絞殺'+ ': ' + player_status[72] + '\n' + '\
電鋸'+ ': ' + player_status[73] + '\n' + '\
連枷'+ ': ' + player_status[74] + '\n' + '\
鞭子'+ ': ' + player_status[75] + '\n' + '\
弓箭'+ ': ' + player_status[76] + '\n' + '\
手槍'+ ': ' + player_status[77] + '\n' + '\
步槍'+ ': ' + player_status[78] + '\n' + '\
衝鋒槍'+ ': ' + player_status[79] + '\n' + '\
機關槍'+ ': ' + player_status[80] + '\n' + '\
重武器'+ ': ' + player_status[81] + '\n' + '\
火焰噴射器'+ ': ' + player_status[82] + '\n' + '\
美術'+ ': ' + player_status[83] + '\n' + '\
演技'+ ': ' + player_status[84] + '\n' + '\
偽造'+ ': ' + player_status[85] + '\n' + '\
攝影'+ ': ' + player_status[86] + '\n' + '\
克蘇魯神話'+ ': ' + player_status[87] + '\n';
            tempstr = tempstr + player_status[98] + ': ' + player_status[88] + '\n';
            tempstr = tempstr + player_status[99] + ': ' + player_status[89] + '\n';
            tempstr = tempstr + player_status[100] + ': ' + player_status[90] + '\n';
            tempstr = tempstr + player_status[101] + ': ' + player_status[91] + '\n';
            tempstr = tempstr + player_status[102] + ': ' + player_status[92] + '\n';
            tempstr = tempstr + player_status[103] + ': ' + player_status[93] + '\n';
            tempstr = tempstr + player_status[104] + ': ' + player_status[94] + '\n';
            tempstr = tempstr + player_status[105] + ': ' + player_status[95] + '\n';
            tempstr = tempstr + player_status[106] + ': ' + player_status[96] + '\n';
            tempstr = tempstr + player_status[107] + ': ' + player_status[97];

            return tempstr;
        }

        player.new = function (value) {
            player_status[0] = value;
        }

        player.set = function (string, value) {
            var tempstr;
		console.log('set');
            var pos = this.status_getposition(string.trim());
		console.log('pos'+'='+pos);
            if (pos == '-1') {
                tempstr = '是什麼喵??';
            } else {
                if (value.charAt(0).toString() == '+') {
                    value = player.getVal(string) * 1 + value.substr(1, value.length - 1) * 1;
                    if (value > 99) value = 99;
                } else if (value.charAt(0).toString() == '-') {
                    value = player.getVal(string) * 1 - value.substr(1, value.length - 1) * 1;
                    if (value < 0 || value == NaN || value == undefined || value == null || value == '') value = 0;
		}
		console.log('set'+string+'.'+value);
                player_status[pos] = value;
                tempstr = player.getVal(string);
            }
            return tempstr;
        }

        player.addskill = function (string) {
	    if(this.status_getposition(string)>0) {
		return '已經有這個技能了喵~';
	    }
            for (i = 0; i < 10; i++) {
                if (this.player_status[98 + i] == '無') {
                    this.player_status[98 + i] = string;
                    return string + ' 新增成功!';
                }
            }
            return '技能欄已滿!';
        }

        player.deleteskill = function (string) {
            for (i = 0; i < 10; i++) {
                if (player_status[98 + i] == string) {
                    player_status[88 + i] = '0';
                    player_status[98 + i] = '無';
                    return string + ' 技能已刪除!';
                }
            }
            return '沒有該技能!';
        }

        player.ccb = function (string) {
            return coc6(player.getVal(string), string);
        }

        player.delete = function () {
            player_status = ['\
undefined', '0', '無', '正常', '0', '0', '0', '0', '0', '0', '\
0', '0', '0', '0', '0', '75', '75', '0', '15', '15', '\
10', '5', '10', '1', '25', '20', '20', '10', '30', '30', '\
1', '10', '10', '10', '0', '20', '20', '20', '20', '10', '\
5', '10', '5', '5', '5', '5', '5', '5', '5', '10', '\
10', '1', '10', '1', '1', '1', '1', '1', '1', '1', '\
1', '1', '1', '1', '1', '1', '1', '20', '25', '20', '\
20', '15', '15', '10', '10', '5', '15', '20', '25', '15', '\
10', '10', '10', '5', '5', '5', '5', '0', '0', '0', '\
0', '0', '0', '0', '0', '0', '0', '0', '無', '無', '\
無', '無', '無', '無', '無', '無', '無', '無'];
        }

		player.output = function() {
			return player_status.join(';');
		}
		
		player.input = function(string) {
			player_status = string.split(';');
		}

        player.status_getposition = function (string) {
            var tempstr = '-1';

            if (string == 'name') {
                tempstr = 0;
            } else if (string == 'db') {
                tempstr = 1;
            } else if (string == 'item') {
                tempstr = 2;
            } else if (string == 'status') {
                tempstr = 3;
            } else if (string == 'str') {
                tempstr = 4;
            } else if (string == 'dex') {
                tempstr = 5;
            } else if (string == 'con') {
                tempstr = 6;
            } else if (string == 'pow') {
                tempstr = 7;
            } else if (string == 'app') {
                tempstr = 8;
            } else if (string == 'int') {
                tempstr = 9;
            } else if (string == 'siz') {
                tempstr = 10;
            } else if (string == 'edu') {
                tempstr = 11;
            } else if (string == 'hp') {
                tempstr = 12;
            } else if (string == 'mp') {
                tempstr = 13;
            } else if (string == 'san') {
                tempstr = 14;
            } else if (string == '靈感') {
                tempstr = 15;
            } else if (string == '知識') {
                tempstr = 16;
            } else if (string == '信用') {
                tempstr = 17;
            } else if (string == '魅惑') {
                tempstr = 18;
            } else if (string == '恐嚇') {
                tempstr = 19;
            } else if (string == '說服') {
                tempstr = 20;
            } else if (string == '話術') {
                tempstr = 21;
            } else if (string == '心理學') {
                tempstr = 22;
            } else if (string == '心理分析') {
                tempstr = 23;
            } else if (string == '調查') {
                tempstr = 24;
            } else if (string == '聆聽') {
                tempstr = 25;
            } else if (string == '圖書館使用' || string == '圖書館') {
                tempstr = 26;
            } else if (string == '追蹤') {
                tempstr = 27;
            } else if (string == '急救') {
                tempstr = 28;
            } else if (string == '醫學') {
                tempstr = 29;
            } else if (string == '鎖匠' || string == '開鎖') {
                tempstr = 30;
            } else if (string == '手上功夫') {
                tempstr = 31;
            } else if (string == '隱密行動') {
                tempstr = 32;
            } else if (string == '生存') {
                tempstr = 33;
            } else if (string == '閃避' || string == '迴避') {
                tempstr = 34;
            } else if (string == '攀爬') {
                tempstr = 35;
            } else if (string == '跳躍') {
                tempstr = 36;
            } else if (string == '游泳') {
                tempstr = 37;
            } else if (string == '駕駛') {
                tempstr = 38;
            } else if (string == '領航') {
                tempstr = 39;
            } else if (string == '騎術') {
                tempstr = 40;
            } else if (string == '自然學') {
                tempstr = 41;
            } else if (string == '神秘學') {
                tempstr = 42;
            } else if (string == '歷史') {
                tempstr = 43;
            } else if (string == '會計') {
                tempstr = 44;
            } else if (string == '估價') {
                tempstr = 45;
            } else if (string == '法律') {
                tempstr = 46;
            } else if (string == '喬裝') {
                tempstr = 47;
            } else if (string == '電腦使用') {
                tempstr = 48;
            } else if (string == '電器維修') {
                tempstr = 49;
            } else if (string == '機械維修') {
                tempstr = 50;
            } else if (string == '重機械操作') {
                tempstr = 51;
            } else if (string == '數學') {
                tempstr = 52;
            } else if (string == '化學') {
                tempstr = 53;
            } else if (string == '藥學') {
                tempstr = 54;
            } else if (string == '人類學') {
                tempstr = 55;
            } else if (string == '考古學') {
                tempstr = 56;
            } else if (string == '電子學') {
                tempstr = 57;
            } else if (string == '物理學') {
                tempstr = 58;
            } else if (string == '工程學') {
                tempstr = 59;
            } else if (string == '密碼學') {
                tempstr = 60;
            } else if (string == '天文學') {
                tempstr = 61;
            } else if (string == '地質學') {
                tempstr = 62;
            } else if (string == '生物學') {
                tempstr = 63;
            } else if (string == '動物學') {
                tempstr = 64;
            } else if (string == '植物學') {
                tempstr = 65;
            } else if (string == '物證學') {
                tempstr = 66;
            } else if (string == '投擲') {
                tempstr = 67;
            } else if (string == '鬥毆') {
                tempstr = 68;
            } else if (string == '劍') {
                tempstr = 69;
            } else if (string == '矛') {
                tempstr = 70;
            } else if (string == '斧頭') {
                tempstr = 71;
            } else if (string == '絞殺') {
                tempstr = 72;
            } else if (string == '電鋸') {
                tempstr = 73;
            } else if (string == '連枷') {
                tempstr = 74;
            } else if (string == '鞭子') {
                tempstr = 75;
            } else if (string == '弓箭') {
                tempstr = 76;
            } else if (string == '手槍') {
                tempstr = 77;
            } else if (string == '步槍') {
                tempstr = 78;
            } else if (string == '衝鋒槍') {
                tempstr = 79;
            } else if (string == '機關槍') {
                tempstr = 80;
            } else if (string == '重武器') {
                tempstr = 81;
            } else if (string == '火焰噴射器') {
                tempstr = 82;
            } else if (string == '美術') {
                tempstr = 83;
            } else if (string == '演技') {
                tempstr = 84;
            } else if (string == '偽造') {
                tempstr = 85;
            } else if (string == '攝影') {
                tempstr = 86;
            } else if (string == '克蘇魯神話' || string == '克蘇魯') {
                tempstr = 87;
            } else {
                for (i = 0; i < 10; i++) {	console.log(i+'.'+string+'.'+(player_status[98 + i])+'.');
                    if (string == player_status[98+i]) {	//額外技能 //
                        return 88+i;
                    }
                }
            }
            return tempstr;
        }

        player.getVal = function (string) {
		console.log('getVal: '+string);
            var temp = this.status_getposition(string);
            if (temp == '-1') return '是什麼喵?';
            else return player_status[temp];
        }

        return player;
    }
}

var players = [Player.createNew(), Player.createNew(), Player.createNew(), Player.createNew(), Player.createNew()];

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
    for (i = 0; i < 5; i++) {
        if (mainMsg[0].toString() == players[i].getVal('name')) return CharacterControll(mainMsg[0], mainMsg[1], mainMsg[2]);
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
        return CharacterControll(mainMsg[1], mainMsg[2], mainMsg[3]);
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
        return KP_MID;
    }
    else if (trigger == 'setkp') {
        if (event.source.type == 'user') {
            KP_MID = event.source.userId;
            return '你的MID是' + KP_MID;
        } else {
            return '私密才能設定MID';
        }
    }
    else if(trigger == 'killkp'){
	    KP_MID = '';
	    return 'KP已死亡';
    }
    else if (trigger == 'getgp') {
        return GP_MID;
    }
    else if (trigger == 'setgp') {
        if (event.source.type == 'group') {
            GP_MID = event.source.groupId;
            return 'MID是' + GP_MID;
        } else {
            return '邊緣人不能設定群組MID';
        }
    }
	//ccd指令開始於此
    else if (trigger == 'ccd' && KP_MID == event.source.userId && event.source.type == 'user') {
        outType = 'kp_ccd';
        return ccb(mainMsg[1], mainMsg[2]);
    }
    else if (trigger == 'ccd') {
        outType = 'ccd';
        return ccb(mainMsg[1], mainMsg[2]);//coc6(mainMsg[1],mainMsg[2]);
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

function CharacterControll(trigger, str1, str2) {
    if (trigger == undefined || trigger == null || trigger == '') {
        return Meow() + '請輸入更多資訊';
    }
    //建立新角
    if (trigger == 'new' || trigger == '建立') {
        if (str1 == undefined || str1 == null || str1 == '') return '沒有輸入名稱喵!';
        if (str1.indexOf(';') < 0) {
            for (i = 0; i < 5; i++) {
                if (players[i].getVal('name') == str1) return '已經有同名的角色了!';
            }

            for (i = 0; i < 5; i++) {
                if (players[i].getVal('name') == 'undefined') {
                    players[i].new(str1);
                    return '成功建立角色 ' + str1 + ' 請補充他/她的能力值!';
                }
            }
            return '角色上限已滿! (max=5)\n請刪除不用的角色喵!';
        } else {
            var newName;
            newName = str1.substr(0, str1.indexOf(';'));
            for (i = 0; i < 5; i++) {
                if (players[i].getVal('name') == newName) return '已經有同名的角色了!';
            }
            for (i = 0; i < 5; i++) {
                if (players[i].getVal('name') == 'undefined') {
                    //players[i].input(str1.trim());
                    return '成功建立角色 ' + players[i].input(str1.trim()) + '喵!';
                }
            }
            return '角色上限已滿! (max=5)\n請刪除不用的角色喵!';
        }
    }

    //角色設定(特定狀態查詢) 刪除 查看
    for (i = 0; i < 5; i++) {
        if (trigger == players[i].getVal('name')) {
            if (str1 == 'debug') {
                return players[i].debug(str1);//players[i].show();
            }
            else if (str1 == 'ccb') {
                return coc6(players[i].getVal(str2), str2);
            }
	    else if (str1 == 'ccd' && KP_MID == event.source.userId && event.source.type == 'user') {
		outType = 'kp_ccd';
		return coc6(players[i].getVal(str2), str2);
	    }
	    else if (str1 == 'ccd') {
		outType = 'ccd';
		return coc6(players[i].getVal(str2), str2);
	    }
            else if (str1 == 'skills') {
                return players[i].showall();
            }
            else if (str1 == 'addskill') {
                return players[i].addskill(str2.trim());
            }
            else if (str1 == 'deleteskill') {
                return players[i].deleteskill(str2.trim());
            }
            else if (str1 == 'output') {
                return players[i].output();
            }
            else if (str1 == undefined || str1 == '' || str1 == '狀態' || str1 == '屬性') {
                return players[i].show();
            }
            else if (str1 == 'delete' || str1 == '刪除') {
                players[i].delete();
                return '已刪除 ' + trigger + ' 角色資料喵~';
            }
            else {
                try {
                    if (str2 == undefined || str2 == null || str2 == '') {
                        return trigger + ': ' + str1 + '[' + players[i].getVal(str1.toString().toLowerCase()) + ']';
                    } else {
                        let tempstr = players[i].getVal(str1.toString().toLowerCase());
			    console.log(str1+'.'+str2);
                        return trigger + ': ' + str1 + '[' + tempstr + '->' + players[i].set(str1.toString().toLowerCase(), str2.toString()) + ']';
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
        for (i = 1; i < 6; i++) {
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
    for (i = 0; i < 5; i++) {
        if (val_status.toString() == players[i].getVal('name')) {
            //return players[i].ccb(text.toString().toLowerCase().trim());
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
