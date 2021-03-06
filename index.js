const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const qs = require('querystring')
const fs = require('fs')
const https = require('https')
const http = require('http')

var path = require('path')


const app = express()

const token = "EAAHGqJDZATz4BAF2FTeo8KxKaaaAW4pKyBPUqBxFA1Kc5SkAoAAYF37IsjJ74P5mCXVF19J5GrsNPm3HGQmZAzXm7SmOhweJo5q2UzGComVXubCvu7xVhi6et0BgMQKAwFc01GQGmsrxhZBvZCvw3bBVhlwnHSnXg6SK8v3o0DKtWpw0jOUF"

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.send('OCL Testing project1')
})

app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
	var messaging_events = req.body.entry[0].messaging

	if(messaging_events){
		for (var i = 0; i < messaging_events.length; i++) {
			var event = req.body.entry[0].messaging[i]
			console.log(JSON.stringify(event))
			var sender = event.sender.id
			console.log('Sender : '+sender+' |||||||||||||||||||||||||||||||||||||||||||||||||')
			authUser(sender, event)
		}
	}else{
		for (var i = 0; i < req.body.entry[0].standby.length; i++) {
			var event = req.body.entry[0].standby[i]
			console.log(JSON.stringify(event))
			var sender = event.sender.id
			console.log('Sender : '+sender+' |||||||||||||||||||||||||||||||||||||||||||||||||')
			authUser(sender, event)
		}
	}
	
	
	res.send('OK')
})

function authUser(sender, event){
	
    eventHandle(sender, event)
                    
}

function eventHandle(sender, event){
	
	if (event.message && event.message.quick_reply){
				
		var text = event.message.quick_reply.payload
				

	}else if(event.message && event.message.attachments){

		var attachment_type = event.message.attachments[0].type

		if( attachment_type === '' ){

			
		}

	}else if (event.message && event.message.text && event.message.nlp) {
		var text = event.message.text

		var entity = event.message.nlp.entities
			
		
		
			if(entity.greetings && entity.greetings[0].confidence > 0.7)	{			

				var msgData = { text: "Hey!! :-D"}

				sendMessage(sender, msgData)
				
			}else if(entity.thanks && entity.thanks[0].confidence > 0.7)	{
				var msgData = { text: 'You are welcome :-)'}
				
				sendMessage(sender, msgData)
			}else if(entity.bye && entity.bye[0].confidence > 0.7)	{
				var msgData = { text: 'See you soon :-)'}
				
				sendMessage(sender, msgData)
			}else{
				var msgData = { "text": text }

				sendMessage(sender, msgData)
				
			}
							

	}else if (event.postback) {
		var payload = event.postback.payload

		console.log('Postback : ' + JSON.stringify(event.postback.payload))

		if(payload){

			if(payload === 'HELP'){
				
			}else if(payload == 'GET_STARTED'){
				var msgData = {}
				if(event.postback.referral){
					if(event.postback.referral.ref == "feedback"){
						
					}else{
						
					}
					

				}else{
					
					//msgData = {}
					//sendMessage(sender, msgData1, 'get_started', 'greeting', 'GREET', Date.now())
				}
				
				
			}

		}

	}

}

function sendMessage(sender, msgData){

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: msgData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
			sendMessage(sender, {text: "Uhh.. I think I am stuck :-( Let's start again. Try these commands : Play, Help or Score"})

		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
			sendMessage(sender, {text: "Uhh.. I think I am stuck :-( Let's start again. Try these commands : Play, Help or Score"})

		}
	})
}

app.listen(process.env.PORT || 5000, function () {
  console.log('OCL test messenger app listening on port 5000!')
})