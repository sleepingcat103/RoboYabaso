var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');  
var app = express();

var jsonParser = bodyParser.json();

var options = {
  host: 'api.line.me',
  port: 443,
  path: '/v2/bot/message/reply',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer actVI2pGSgmQ+JYuF2il02qMYH+1+3Q6pvaTjjL4J77uWSuVRoTZnloLqZG39jxfuZAWyS77LfHuQ9rHx4vupzxq3sDLKcwRraRq0F0t9B8aULHlhuO2BYmiIvOFjT6Vs+RFkd3GDQnNB2Ykvo6rlgdB04t89/1O/w1cDnyilFU=' 
  }
}
app.set('port', (process.env.PORT || 5000));

// views is directory for all template files

app.get('/', function(req, res) {
//  res.send(parseInput(req.query.input));
  res.send('Hello');
});

app.post('/', jsonParser, function(req, res) {
  let event = req.body.events[0];
  let type = event.type;
  let msgType = event.message.type;
  let msg = event.message.text;
  let rplyToken = event.replyToken;

  let rplyVal = null;
  console.log(msg);
  if (type == 'message' && msgType == 'text') {
    try {
      rplyVal = parseInput(rplyToken, msg); 
    } 
    catch(e) {
      console.log('catch error');
    }
  }

  if (rplyVal) {
    replyMsgToLine(rplyToken, rplyVal); 
  } else {
    console.log('Do not trigger'); 
  }

  res.send('ok');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function replyMsgToLine(rplyToken, rplyVal) {
	let rplyObj = {
    replyToken: rplyToken,
    messages: [
      {
        type: "text",
        text: rplyVal
      }
    ]
  }

  let rplyJson = JSON.stringify(rplyObj); 
  
  var request = https.request(options, function(response) {
    console.log('Status: ' + response.statusCode);
    console.log('Headers: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(body) {
      console.log(body); 
    });
  });
  request.on('error', function(e) {
    console.log('Request error: ' + e.message);
  })
  request.end(rplyJson);
}

////////////////////////////////////////
//////////////// 分析開始 //////////////
////////////////////////////////////////
function parseInput(rplyToken, inputStr) {
          
	console.log('InputStr: ' + inputStr);
	_isNaN = function(obj) {
		return isNaN(parseInt(obj));
    }                   
    let msgSplitor = (/\S+/ig);	
	let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
	let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階
                       
    //指令開始於此   
    if (trigger.match(/運氣|運勢/) != null) return randomLuck(mainMsg) ; //占卜運氣        
        
	//FLAG指令開始於此
    if (trigger.match(/立flag|死亡flag/) != null) return BStyleFlagSCRIPTS() ;        
	
	if (trigger.match(/coc創角/) != null && mainMsg[1] != NaN )	 return build6char(mainMsg[1]);
	
	if (trigger == 'db') return db(mainMsg[1], 1);
	
	if (trigger == '生科') return EatPoo();
  
	if (trigger == '貓咪') return MeowHelp();
	
	if (trigger.match(/貓|喵/) != null) return Meow();
	
	if (trigger == 'help' || trigger == '幫助') return Help();
		
 	if (trigger.match(/排序/)!= null && mainMsg.length >= 3) {        
			return SortIt(inputStr,mainMsg);
	}		

    //ccb指令開始於此
	if (trigger == 'ccb'&& mainMsg[1]<=99) return coc6(mainMsg[1],mainMsg[2]);
          
  
	//choice 指令開始於此
	if (trigger.match(/choice|隨機|選項|幫我選/)!= null && mainMsg.length >= 3) 
	{        
		return choice(inputStr,mainMsg);
	}

	//tarot 指令
	if (trigger.match(/tarot|塔羅牌|塔羅/) != null) {
		return NomalDrawTarot();
	}


    //普通ROLL擲骰判定
	if (inputStr.match(/\w/)!=null && inputStr.toLowerCase().match(/\d+d+\d/)!=null) {
        return nomalDiceRoller(inputStr,mainMsg[0],mainMsg[1],mainMsg[2]);
    }
	
}

////////////////////////////////////////
//////////////// COC6 CCB成功率骰
////////////////////////////////////////
function coc6(chack,text){
    let temp = Dice(100);
    if (text == null ) {
        if (temp > 95) return 'ccb<=' + chack  + ' ' + temp + ' → 大失敗！哈哈哈！';
	if (temp <= chack) {
		if(temp <= 5) return 'ccb<=' + chack + ' '  + temp + ' → 喔喔！大成功！';
		else return 'ccb<=' + chack + ' '  + temp + ' → 成功';
	}
	else return 'ccb<=' + chack  + ' ' + temp + ' → 失敗' ;
    } else {
        if (temp > 95) return 'ccb<=' + chack  + ' ' + temp + ' → ' + text + ' 大失敗！哈哈哈！';
	if (temp <= chack) {
		if(temp <= 5) return 'ccb<=' + chack + ' '  + temp + ' → ' + text + ' 大成功！';
		else return 'ccb<=' + chack + ' '  + temp + ' → ' + text + ' 成功';
	}
	else return 'ccb<=' + chack  + ' ' + temp + ' → ' + text + ' 失敗';
    }
}   
////////////////////////////////////////
//////////////// COC6傳統創角
////////////////////////////////////////      


  
function build6char(){

	let ReStr = '六版核心創角：';
	let str = BuildDiceCal('3d6',0);
	let siz = BuildDiceCal('(2d6+6)',0);
	
	ReStr = ReStr + '\nＳＴＲ：' + str;
	ReStr = ReStr + '\nＤＥＸ：' + BuildDiceCal('3d6',0);
	ReStr = ReStr + '\nＣＯＮ：' + BuildDiceCal('3d6',0);
	ReStr = ReStr + '\nＰＯＷ：' + BuildDiceCal('3d6',0);
	ReStr = ReStr + '\nＡＰＰ：' + BuildDiceCal('3d6',0);
	ReStr = ReStr + '\nＩＮＴ：' + BuildDiceCal('(2d6+6)',0);
	ReStr = ReStr + '\nＳＩＺ：' + siz;         
	ReStr = ReStr + '\nＥＤＵ：' + BuildDiceCal('(3d6+3)',0);         
	
	let strArr = str.split(' ');
	let sizArr = siz.split(' ');
	let temp = parseInt(strArr[2]) + parseInt(sizArr[2]);
	
	ReStr = ReStr + '\nＤＢ：' + db(temp, 0);
	return ReStr;
  } 
        
////////////////////////////////////////
//////////////// 普通ROLL
////////////////////////////////////////
function nomalDiceRoller(inputStr,text0,text1,text2){
  
	//首先判斷是否是誤啟動（檢查是否有符合骰子格式）
	// if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;
  
	//再來先把第一個分段拆出來，待會判斷是否是複數擲骰
	let mutiOrNot = text0.toLowerCase();
  
	//排除小數點
	if (mutiOrNot.toString().match(/\./)!=null)	return undefined;

	//先定義要輸出的Str
	let finalStr = '' ;  
  
  
	//是複數擲骰喔
	if(mutiOrNot.toString().match(/\D/)==null ) {
		if(text2 != null){
			finalStr= text0 + '次擲骰：\n' + text1 +' ' + text2 + '\n';
    	} else {
			finalStr= text0 + '次擲骰：\n' + text1 +'\n';
    	}
		if(mutiOrNot>30) return '不支援30次以上的複數擲骰。';
    
		for (i=1 ; i<=mutiOrNot ;i++){
			let DiceToRoll = text1.toLowerCase();
			if (DiceToRoll.match('d') == null) return undefined;

			//寫出算式
			let equation = DiceToRoll;
			while(equation.match(/\d+d\d+/)!=null) {
				let tempMatch = equation.match(/\d+d\d+/);
				equation = equation.replace(/\d+d\d+/, RollDice(tempMatch));
			}

			//計算算式
			let aaa = equation;
			aaa = aaa.replace(/\d+[[]/ig, '(' );
			aaa = aaa.replace(/]/ig, ')' );
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
		while(equation.match(/\d+d\d+/)!=null) {
			let totally = 0;
			let tempMatch = equation.match(/\d+d\d+/);    
			if (tempMatch.toString().split('d')[0]>300) return undefined;
			if (tempMatch.toString().split('d')[1]==1 || tempMatch.toString().split('d')[1]>1000000) return undefined;
			equation = equation.replace(/\d+d\d+/, RollDice(tempMatch));
		}
	  
		//計算算式
		let aaa = equation;
		aaa = aaa.replace(/\d+[[]/ig, '(' );
		aaa = aaa.replace(/]/ig, ')' );
		let answer = eval(aaa.toString());
		  
		if(text1 != null){
			finalStr= text0 + '：' + text1 + '\n' + equation + ' = ' + answer;
		} else {
				finalStr= text0 + '：\n' + equation + ' = ' + answer;
		}
	
	}
  
	return finalStr;
}        


////////////////////////////////////////
//////////////// 擲骰子運算
////////////////////////////////////////

function sortNumber(a,b)
{
	return a - b
}


function Dice(diceSided){          
    return Math.floor((Math.random() * diceSided) + 1)
}              
		
function RollDice(inputStr){
	//先把inputStr變成字串（不知道為什麼非這樣不可）
	let comStr=inputStr.toString();
	let finalStr = '[';
	let temp = 0;
	var totally = 0;
	for (let i = 1; i <= comStr.split('d')[0]; i++) {
		temp = Dice(comStr.split('d')[1]);
		totally +=temp;
		finalStr = finalStr + temp + '+';
    }

	finalStr = finalStr.substring(0, finalStr.length - 1) + ']';
	finalStr = finalStr.replace('[', totally +'[');
	return finalStr;
}

function FunnyDice(diceSided) {
	return Math.floor((Math.random() * diceSided)) //猜拳，從0開始
}

function BuildDiceCal(inputStr,flag){
  
	//首先判斷是否是誤啟動（檢查是否有符合骰子格式）
	if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;
    
	//排除小數點
	if (inputStr.toString().match(/\./)!=null)return undefined;

	//先定義要輸出的Str
	let finalStr = '' ;  
  
	//一般單次擲骰
	let DiceToRoll = inputStr.toString().toLowerCase();  
	if (DiceToRoll.match('d') == null) return undefined;
  
	//寫出算式
	let equation = DiceToRoll;
	while(equation.match(/\d+d\d+/)!=null) {
		let tempMatch = equation.match(/\d+d\d+/);    
		if (tempMatch.toString().split('d')[0]>200) return '不支援200D以上擲骰唷';
		if (tempMatch.toString().split('d')[1]==1 || tempMatch.toString().split('d')[1]>500) return '不支援D1和超過D500的擲骰唷';
		equation = equation.replace(/\d+d\d+/, BuildRollDice(tempMatch));
	}
  
	//計算算式
	let answer = eval(equation.toString());
    finalStr= equation + ' = ' + answer;
	if(flag==0)return finalStr;
	if(flag==1)return answer;
	

}        

function BuildRollDice(inputStr){
	//先把inputStr變成字串（不知道為什麼非這樣不可）
	let comStr=inputStr.toString().toLowerCase();
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
function db(value, flag){
	let restr ='';
	if (value>=2 && value<=12)	restr = '-1D6';
	if (value>=13 && value<=16)	restr = '-1D4';
	if (value>=17 && value<=24)	restr = '+0';
	if (value>=25 && value<=32)	restr = '+1D4';
	if (value>=33 && value<=40)	restr = '+1D6';
	if (value<2 || value>40) restr = '?????';
	//return restr;	
	if (flag == 0) return restr;
	if (flag == 1) return 'db -> ' + restr;
}


////////////////////////////////////////
//////////////// 占卜&其他
////////////////////////////////////////


function BStyleFlagSCRIPTS() {
        let rplyArr = ['\
「打完這仗我就回老家結婚（この戦いが終わったら、故郷に帰って結婚するんだ）」', '\
「打完這一仗後我請你喝酒」', '\
「你、你要錢嗎！要什麼我都能給你！/我可以給你更多的錢！」', '\
「做完這次任務，我就要結婚了。」', '\
「幹完這一票我就金盆洗手了。」', '\
「好想再XXX啊……」', '\
「已經沒什麼好害怕的了（もう何も恐くない）」', '\
「我一定會回來的（必ず帰る！）」', '\
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
「聽好，在我回來之前絕不要亂走動哦（いいか、俺が帰ってくるまでここを動くんじゃないぞ）」', '\
「要像一個乖孩子一樣等著我回來」', '\
「我去去就來（先に行って、すぐ戻るから）」', '\
「快逃！(逃げろう！/早く逃げろう！)」', '\
「對方只有一個人，大家一起上啊」', '\
「我就不信，這麼多人還殺不了他一個！」', '\
「幹，幹掉了嗎？（やったのか？）」', '\
「身體好輕」', '\
「可惡！你給我看著！（逃跑）」', '\
「躲在這裡就應該不會被發現了吧。」', '\
「我不會讓任何人死的。」', '\
「可惡！原來是這麼回事！」', '\
「跑這麼遠應該就行了。」', '\
「我已經甚麼都不怕了（もう何も恐くない）」', '\
「這XXX是什麼，怎麼之前沒見過（なんだこのXXX、見たことないな）」', '\
「什麽聲音……？就去看一下吧（:「何の音だ？ちょっと見てくる」', '\
「是我的錯覺嗎？/果然是錯覺/錯覺吧/可能是我（看/聽）錯了」', '\
「二十年後又是一條好漢！」', '\
「大人/將軍武運昌隆」', '\
「這次工作的報酬是以前無法比較的（:「今度の仕事でまとまったカネが入るんだ」', '\）」', '\
「我才不要和罪犯呆在一起，我回自己的房間去了！（この中に殺人者がいるかもしれないのに、一緒に居られるか!俺は自分の部屋に戻るぞ!）」', '\
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
           let rplyArr = ['超大吉','大吉','大吉','中吉','中吉','中吉','小吉','小吉','小吉','小吉','凶','凶','凶','大凶','大凶','你還是，不要知道比較好','這應該不關我的事'];
	       return TEXT[0] + ' ： ' + rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
        }

////////////////////////////////////////
//////////////// Tarot塔羅牌
////////////////////////////////////////
function MultiDrawTarot(CardToCal, text, type) {
	let returnStr = '';
	var tmpcard = 0;
	var cards = [];
	var revs = [];
	var i = 0;

	if (type == 1) //時間之流
	{
		cards[0] = FunnyDice(79); //先抽第0張
		revs[0] = FunnyDice(2);

		for (i = 1; i < 3; i++) {
			for (;;) {
				tmpcard = FunnyDice(79);
				if (cards.indexOf(tmpcard) === -1) //沒有重複，就這張了
				{
					cards.push(tmpcard);
					revs[i] = FunnyDice(2);
					break;
				}
			}
		}

		if (text != null)
			returnStr += text + ': \n';

		for (i = 0; i < 3; i++) {
			if (i == 0) returnStr += '過去: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 1) returnStr += '現在: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 2) returnStr += '未來: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]);
		}

	} else if (type == 2) //塞爾特大十字
	{
		cards[0] = FunnyDice(79); //先抽第0張
		revs[0] = FunnyDice(2);

		for (i = 1; i < 10; i++) {
			for (;;) {
				tmpcard = FunnyDice(79);
				if (cards.indexOf(tmpcard) === -1) //沒有重複，就這張了
				{
					cards.push(tmpcard);
					revs[i] = FunnyDice(2);
					break;
				}
			}
		}

		if (text != null)
			returnStr += text + ': \n';

		for (i = 0; i < 10; i++) {
			if (i == 0) returnStr += '現況: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 1) {
				if (revs[i] == 0) //正位
					returnStr += '助力: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
				else
					returnStr += '阻力: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			}
			if (i == 2) returnStr += '目標: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 3) returnStr += '基礎: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 4) returnStr += '過去: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 5) returnStr += '未來: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 6) returnStr += '自我: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 7) returnStr += '環境: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 8) {
				if (revs[i] == 0) //正位
					returnStr += '希望: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
				else
					returnStr += '恐懼: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			}
			if (i == 9) returnStr += '結論: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]);

		}

	} else {

		if (text == null)
			returnStr = tarotCardReply(FunnyDice(79)) + ' ' + tarotRevReply(FunnyDice(2));
		else
			returnStr = tarotCardReply(FunnyDice(79)) + ' ' + tarotRevReply(FunnyDice(2)) + ' ; ' + text;
	}


	return returnStr;
}

function NomalDrawTarot() {
	let returnStr = '';

	returnStr = tarotCardReply(FunnyDice(22)) + ' ' + tarotRevReply(FunnyDice(2));
	return returnStr;
}


function SortIt(input,mainMsg) {   
 
 	let a = input.replace(mainMsg[0], '').match(/\S+/ig);
    for (var i = a.length-1; i >=0; i--) {
 
        var randomIndex = Math.floor(Math.random()*(i+1));
        var itemAtIndex = a[randomIndex];
        a[randomIndex] = a[i];
        a[i] = itemAtIndex;
    }
     	return mainMsg[0] + ' → ['+ a + ']' ;
 }

function tarotRevReply(count) {
	let returnStr = '';

	if (count == 0) returnStr = '＋';
	if (count == 1) returnStr = '－';

	return returnStr;
}

function choice(input,str) {
	let a = input.replace(str[0], '').match(/\S+/ig);
	return str[0] + '['+ a + '] → ' + a[Dice(a.length)-1];
}

function tarotCardReply(count) {
	let returnStr = '';
	// returnStr = count + '愚者';
	if (count == 0) returnStr = '愚者';
	if (count == 1) returnStr = '魔術師';
	if (count == 2) returnStr = '女祭司';
	if (count == 3) returnStr = '女皇';
	if (count == 4) returnStr = '皇帝';
	if (count == 5) returnStr = '教皇';
	if (count == 6) returnStr = '戀人';
	if (count == 7) returnStr = '戰車';
	if (count == 8) returnStr = '力量';
	if (count == 9) returnStr = '隱者';
	if (count == 10) returnStr = '命運之輪';
	if (count == 11) returnStr = '正義';
	if (count == 12) returnStr = '吊人';
	if (count == 13) returnStr = '死神';
	if (count == 14) returnStr = '節制';
	if (count == 15) returnStr = '惡魔';
	if (count == 16) returnStr = '高塔';
	if (count == 17) returnStr = '星星';
	if (count == 18) returnStr = '月亮';
	if (count == 19) returnStr = '太陽';
	if (count == 20) returnStr = '審判';
	if (count == 21) returnStr = '世界';
	if (count == 22) returnStr = '權杖一';
	if (count == 23) returnStr = '權杖二';
	if (count == 24) returnStr = '權杖三';
	if (count == 25) returnStr = '權杖四';
	if (count == 26) returnStr = '權杖五';
	if (count == 27) returnStr = '權杖六';
	if (count == 28) returnStr = '權杖七';
	if (count == 29) returnStr = '權杖八';
	if (count == 30) returnStr = '權杖九';
	if (count == 31) returnStr = '權杖十';
	if (count == 32) returnStr = '權杖侍者';
	if (count == 33) returnStr = '權杖騎士';
	if (count == 34) returnStr = '權杖皇后';
	if (count == 35) returnStr = '權杖國王';
	if (count == 36) returnStr = '聖杯一';
	if (count == 37) returnStr = '聖杯二';
	if (count == 38) returnStr = '聖杯三';
	if (count == 39) returnStr = '聖杯四';
	if (count == 40) returnStr = '聖杯五';
	if (count == 41) returnStr = '聖杯六';
	if (count == 42) returnStr = '聖杯七';
	if (count == 43) returnStr = '聖杯八';
	if (count == 44) returnStr = '聖杯九';
	if (count == 45) returnStr = '聖杯十';
	if (count == 46) returnStr = '聖杯侍者';
	if (count == 47) returnStr = '聖杯騎士';
	if (count == 48) returnStr = '聖杯皇后';
	if (count == 49) returnStr = '聖杯國王';
	if (count == 50) returnStr = '寶劍一';
	if (count == 51) returnStr = '寶劍二';
	if (count == 52) returnStr = '寶劍三';
	if (count == 53) returnStr = '寶劍四';
	if (count == 54) returnStr = '寶劍五';
	if (count == 55) returnStr = '寶劍六';
	if (count == 56) returnStr = '寶劍七';
	if (count == 57) returnStr = '寶劍八';
	if (count == 58) returnStr = '寶劍九';
	if (count == 59) returnStr = '寶劍十';
	if (count == 60) returnStr = '寶劍侍者';
	if (count == 61) returnStr = '寶劍騎士';
	if (count == 62) returnStr = '寶劍皇后';
	if (count == 63) returnStr = '寶劍國王';
	if (count == 64) returnStr = '錢幣一';
	if (count == 65) returnStr = '錢幣二';
	if (count == 66) returnStr = '錢幣三';
	if (count == 67) returnStr = '錢幣四';
	if (count == 68) returnStr = '錢幣五';
	if (count == 69) returnStr = '錢幣六';
	if (count == 70) returnStr = '錢幣七';
	if (count == 71) returnStr = '錢幣八';
	if (count == 72) returnStr = '錢幣九';
	if (count == 73) returnStr = '錢幣十';
	if (count == 74) returnStr = '錢幣侍者';
	if (count == 75) returnStr = '錢幣騎士';
	if (count == 76) returnStr = '錢幣皇后';
	if (count == 77) returnStr = '錢幣國王';
	if (count == 78) returnStr = '空白牌';

	return returnStr;
}

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
		\n 4.塔羅牌占卜: tarot/塔羅牌/塔羅\
		\n 5.死亡FLAG: 立Flag/死亡flag\
		';			
}

function MeowHelp() {
	return Meow() + '\n要做什麼喵?\n\n(輸入 help 幫助 以獲得資訊)';
}

function Meow() {
	let rplyArr = ['喵喵?', '喵喵喵', '喵?', '喵~', '喵喵喵喵!', '喵<3', '喵喵.....', '喵嗚~', '喵喵! 喵喵喵!', '喵喵', '喵'];
	return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function EatPoo() {
	
	event.reply({
		type: 'image',
		originalContentUrl: 'https://i.imgur.com/0mnM0f3.png',
		previewImageUrl: 'https://i.imgur.com/0mnM0f3.png'
	});
	//return 'https://i.imgur.com/0mnM0f3.png';	
}
