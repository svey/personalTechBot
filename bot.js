var express = require("express");
var app = express();

app.get('/', function(req, res) {
  res.send('The robot is happily running.')
});

app.listen(process.env.PORT || 3000);

var twit = require('twit');
var config = require('./config.js');
var resume = require('./resume.js');

var Twitter = new twit(config);

const sendResponseToDM = (user, text) => {
  Twitter.post('direct_messages/new', { user, text }, (err, data, res) => {
    console.log('messaged!')
  })
}

const sendResponseToMention = (id, status) => {
  Twitter.post('statuses/update', { in_reply_to_status_id: id, status }, (err, data, res) => {
    console.log('replied!')
  })
}

const deleteMessage = (id) => {
  Twitter.post('direct_messages/destroy', { id }, (err, data, res) => {
    
  })
}

const retweet = (id) => {
  Twitter.post('statuses/retweet/:id', { id }, function (err, data, response) {
    console.log('retweeted!')
  })
}

const monitor = Twitter.stream('statuses/filter', { track: 'personalTechBot' })

const post = Twitter.stream('statuses/filter', { follow: [ '18463930', '418', '914061', '339977188', '1909232666', '45918978' ] })

post.on('tweet', tweet => {
  var id = tweet.id_str;
  retweet(id);
})

monitor.on('tweet', tweet => {
  var messageId = tweet.id_str;
  var username = tweet.user.screen_name;
  var status;
  var text;

  tweet.entities.hashtags.forEach(hashtag => {
    switch(hashtag.text) {
      case 'resume':
        status = `@${username} check your Twitter Messages!`;
        text = `@${username} here is Marcus' resume: \n ${resume}`
        sendResponseToMention(messageId, status)
        sendResponseToDM(username, text)
        break;
      case 'schedule':
        status = `@${username} personalTechBot checking in! Here is Marcus' calendar: `;
        sendResponseToMention(messageId, status)
        break;
      default:
        status = `@${username} personalTechBot checking in! sorry I don\'t know what ${hashtag.text} is`
        sendResponseToMention(messageId, status)
    }
  })
  sendResponseToDM('marcus_svehlak', ` inquired about you on ${new Date()}`)
})
