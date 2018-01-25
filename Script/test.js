
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var express = require('express');

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

update([["Door", "$15", "2", "3/15/2016"],["Engine", "$100", "1", "3/20/2016"]]);

function getSheetContent() {
    sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: mySheetId,
        range:encodeURI('test'),
    }, function(err, response) {
        if (err) {
            console.log('Error: '+err.message);
            return;
        }else{
			//console.log('success!');
		}
        var rows = response.values;
        console.log(rows);
    });
}

function clearSheet(){
	sheets.spreadsheets.values.clear({
        auth: oauth2Client,
        spreadsheetId: mySheetId,
        range:encodeURI('test'),
    }, function(err, response) {
        if (err) {
            console.log('Error: '+err.message);
            return;
        }else{console.log('success!');}
    });
}

function update(data) {
    sheets.spreadsheets.values.update({
	    spreadsheetId: mySheetId,
		range: 'test',
		valueInputOption: "RAW",
		auth: oauth2Client,
		resource: {
			"values": {data}
		},
    }, function(err, response) {
        if (err) {
            console.log('Error: '+err.message);
            return;
        }else{console.log('success!');}
    });
}
