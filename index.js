const fs = require('fs');
var Twit = require('twit');
var T = new Twit(require('./config.js'));
var https = require('https');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

var TWEETS = []

function getTime()
{
    var current = new Date();
    var date = current.getFullYear()+'/'+(current.getMonth()+1)+'/'+current.getDate()
    var time = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds()
    var currentTime= new Date().toLocaleTimeString()
    var realtime = date.toString()+ ' ' + currentTime.toString()
    return realtime.toString()
}

var exec = require('child_process').exec, child;

var child = exec('python main.py', function (error, stdout, stderr) 
{
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) 
    {
        console.log('exec error: ' + error);
    }
});

var newsData = fs.readFileSync('./Cache/brnews.json')
newsData = JSON.parse(newsData)

if (newsData.status.toString().startsWith('200'))
{
    console.log('')
    console.log('Found ' + newsData.data.motds.length + ' News Cards')
    var tempStr = ''
    TWEETS.push('Updating news for ' + getTime() + '...')
    for (var i = 0; i < newsData.data.motds.length; i++)
    {
        tempStr = tempStr + newsData.data.motds[i].title.toString().trimEnd()
        tempStr = tempStr + ': ' + newsData.data.motds[i].body.toString().trimEnd()
        tempStr = tempStr + '    ' + newsData.data.motds[i].image.toString().trimEnd()
        TWEETS.push(tempStr)
        tempStr = ''
    }
    console.log('')

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    for (var i = 0; i < TWEETS.length; i++)
    {
        if (i > 0)
        {
            for (var x = 0; x < 5000; x++)
            {
                console.log('Continuing in ' + x + 'ms')
                sleep(1)
            }
            
            T.post('statuses/update', { status: (TWEETS[i].split('    ')[0].split(': ')[0].toString().trimEnd() + ': \n' +  TWEETS[i].split('    ')[0].split(': ')[1].toString().trimEnd() + '\n\nImage:\n' +TWEETS[i].split('    ')[1])}, function(err, data, response) 
            {
                console.log(data)
            })
        }
    }
    T.post('statuses/update', { status: 'Updated news for ' + getTime() + '...' }, function(err, data, response) {
        console.log(data)
    })
}
else 
{
    console.log('!200 Bad Request on NEWS')
}