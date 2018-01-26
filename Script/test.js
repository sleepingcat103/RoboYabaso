var google = require('googleapis');
var googleAuth = require('google-auth-library');
var request = require('request');
var sheetrock = require('sheetrock');

//google sheet
//client_secret.json
var myClientSecret = {"installed":{"client_id":"679508808367-6foqlrkagv2v7qusqua0nkmvo6b424c6.apps.googleusercontent.com","project_id":"my-project-1511956147962","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://accounts.google.com/o/oauth2/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"1-w0sdtE0LT7ZCWrdVUIdwNy","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}};

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);

//sheetsapi.json
oauth2Client.credentials = {"access_token":"ya29.GltNBUPTeXr094wOq6KSEJqYg4DXtkLyvs8hAdA3lDc4Zc6a8GLj3vd69ZAWHy7M7egwIgPpw2LJO9l432puFcErwTfwmp5S3eClJudQi7OBknYVEsKmVjvAqGEx","refresh_token":"1/oZUfFdL0n5tpgs5JPTcQQCCtpI3D-Tyn4CFmFZNfyfI","token_type":"Bearer","expiry_date":1516871850908};

//試算表的ID
var mySheetId='1QvtxfT4PXrIXwC-gbWABddmrwhd0-zaU4JyNRuHR-ig';
var sheets = google.sheets('v4');



//測試
try {
	
	//Player Format
	var sampleplayer = [["4","roomid", "playerid", "CharacterName", "StatusJSon"]];
	
	SheetRefresh();
	//SheetDelete(player);
	//SheetEdit(player);
	
}catch(e){
	console.log(e);
}

//整理表格 (刪除空白行)
function SheetRefresh(){
	
	sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: mySheetId,
        range:encodeURI('test'),
    }, function(err, response) {
        if (err) {
            console.log('Fail to get data: '+err.message);
            return;
        }else{
			var rows = response.values;
			
			var i=0;
			 //(取出有資料的) 
			var playerList = rows.filter(function (element,index,array) {
				if(element[1]!=null){
					element[0]=++i;
					return element ;
				}
			});
			
			sheets.spreadsheets.values.clear({
				auth: oauth2Client,
				spreadsheetId: mySheetId,
				range:encodeURI('test'),
			}, function(err, response) {
				if (err) {
					console.log('Fail to clean data: '+err.message);
					return;
				}else{
					
					//加回去
					sheets.spreadsheets.values.update({
						spreadsheetId: mySheetId,
						range: 'test',
						valueInputOption: "RAW",
						auth: oauth2Client,
						resource: {
							"values": playerList
						},
					}, function(err, response) {
						if (err) {
							console.log('Fail to rewrite data:'+err.message);
							return;
						}else{console.log('Refresh success!');}
					});
				}
			});
		}
    });
}

function SheetAdd(player) {
	//檢查重複
	var selectQuery = 'select A,B,C,D,E WHERE D = ' + player[0][3] + ' and A = ' + player[0][1];
	sheetrock({
		url: 'https://docs.google.com/spreadsheets/d/1QvtxfT4PXrIXwC-gbWABddmrwhd0-zaU4JyNRuHR-ig/edit#gid=0',
		query: selectQuery,
		callback: function (error, options, response) {
			if(error) {
				console.log('Fail to get data: ' +　error);
				
			} else {
				if(response.rows.length>1){
					console.log('Character already Existed!');
					return;
				}
			}
		}
	});
	
    sheets.spreadsheets.values.update({
	    spreadsheetId: mySheetId,
		range: 'test',
		valueInputOption: "RAW",
		auth: oauth2Client,
		resource: {
			"values": player
		},
    }, function(err, response) {
        if (err) {
            console.log('Error: '+err.message);
            return;
        }else{console.log('Add success!');}
    });
}

//single Edit
function SheetEdit(player) {
	var No = player[0][0];
    sheets.spreadsheets.values.update({
	    spreadsheetId: mySheetId,
		range: 'test!A' + No + ':E' + No,
		valueInputOption: "RAW",
		auth: oauth2Client,
		resource: {
			"values": player
		},
    }, function(err, response) {
        if (err) {
            console.log('Error: '+err.message);
            return;
        }else{console.log('Edit success!');}
    });
}

//single Delete
function SheetDelete(player) {
	var No = player[0][0];
	player = [[No,"","","",""]];
	
    sheets.spreadsheets.values.update({
	    spreadsheetId: mySheetId,
		range: 'test!A' + No + ':E' + No,
		valueInputOption: "RAW",
		auth: oauth2Client,
		resource: {
			"values": player
		},
    }, function(err, response) {
        if (err) {
            console.log('Error: '+err.message);
            return;
        }else{console.log('Edit success!');}
    });
}

//抓取房間玩家&KP資訊
function GetDataByRoomId(roomID){
	var selectQuery = 'select A,B,C,D,E WHERE B = ' + roomID;
	sheetrock({
		url: 'https://docs.google.com/spreadsheets/d/1QvtxfT4PXrIXwC-gbWABddmrwhd0-zaU4JyNRuHR-ig/edit#gid=0',
		query: selectQuery,
		callback: function (error, options, response) {
			if(error) {
				console.log('Fail to get data: ' +　error);
			} else {
				if(response.rows.length>1){
					//製作房間&角色資訊
					console.log(response.rows[1].cellsArray);
				}
			}
		}
	});
}

function GenerateGoogleSheetData(player){
	//line bot 紀錄格式 轉 google Sheet 儲存模式
	//[["No","roomid", "playerid", "StatusJSon", "IsKP"]];
}

function GenerateLineBotData(player){
	//google Sheet 儲存模式 轉 line bot 紀錄格式 
}

