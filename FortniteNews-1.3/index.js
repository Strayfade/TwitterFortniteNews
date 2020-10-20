const fs = require('fs');
var Twit = require('twit');
var T = new Twit(require('./config.js'));
const http = require('https');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
function getRemoteFile(file, url, content) {
    let localFile = fs.createWriteStream(file);
    const request = http.get(url, function(response) {
        var len = parseInt(response.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576;
        response.on('data', function(chunk) {
            cur += chunk.length;
            showProgress(file, cur, len, total);
        });
        response.on('end', function() {
            console.log(content)
            console.log(file)
            twitterPost(content, file)
        });
        response.pipe(localFile);
    });
}
function showProgress(file, cur, len, total) {
    console.log("Downloading " + file + " - " + (100.0 * cur / len).toFixed(2) 
        + "% (" + (cur / 1048576).toFixed(2) + " MB) of total size: " 
        + total.toFixed(2) + " MB");
}
function getTime()
{
    var current = new Date();
    var date = current.getFullYear()+'/'+(current.getMonth()+1)+'/'+current.getDate()
    var time = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds()
    var currentTime= new Date().toLocaleTimeString()
    var realtime = date.toString()+ ' ' + currentTime.toString()
    return realtime.toString()
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function twitterPost(content, filePath)
{
    var b64content = fs.readFileSync(filePath, { encoding: 'base64' })
    T.post('media/upload', { media_data: b64content }, function (err, data, response) 
    {
        var mediaIdStr = data.media_id_string
        var altText = "Uploaded Image"
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
        T.post('media/metadata/create', meta_params, function (err, data, response) 
        {
            if (!err) 
            {
                var params = { status: content.toString(), media_ids: [mediaIdStr] }
                T.post('statuses/update', params, function (err, data, response) 
                {
                    console.log(data)
                })
            }
        })
    })
}
setInterval(function() 
{
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
    var newsData = fs.readFileSync('./Python/Cache/brnews.json')
    newsData = JSON.parse(newsData)
    if (newsData.status.toString().startsWith('200'))
    {
        var TWEETS = []
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
        for (var i = 0; i < TWEETS.length; i++)
        {
            if (i > 0)
            {
                for (var x = 0; x < 1000; x++)
                {
                    console.log('Continuing in ' + x + 'ms')
                    sleep(1)
                }
                var imagePath = './images/' + TWEETS[i].split('    ')[1].toString().replace('/','').replace('/','').replace('/','').replace(':','').replace('?','').replace('&','').replace('httpscdn2.unrealengine.com', '')
                getRemoteFile(imagePath, TWEETS[i].split('    ')[1], 'News for ' + getTime() + ': \n\n' + TWEETS[i].split('    ')[0])
                console.log(imagePath)
                console.log(TWEETS[i].split('    ')[0])
            }
        }
    }
    else 
    {
        console.log('!200 Bad Request on NEWS')
    }
},  900000);