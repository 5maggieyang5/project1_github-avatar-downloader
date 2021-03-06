const request      = require('request');
const GITHUB_TOKEN = require("./secrets");
const fs           = require('fs');
const repoOwner    = process.argv[2];
const repoName     = process.argv[3];

console.log('Welcome to the GitHub Avatar Downloader!');

//the function makes a request for JSON, getting back an array of contributors.
function getRepoContributors(repoOwner, repoName, cb) {
  let options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers:{
      'User-Agent': 'request',
      'Authorization': GITHUB_TOKEN
    }
  };

  if(repoOwner && repoName) {
    request(options, function(err, res, body){
      let data = JSON.parse(body);
      cb(err, data);
    });
  } else {
    console.log("Please provide the repoOwner & repoName.");
  }
}

//the function fetches the desired avatar_url and saves this information to the given filePath
function downloadImageByURL(url, filePath) {
  request.get(url)

  .on('error', function (err) {
    throw err;
  })

  .on('response', function (response) {
    console.log('Downloading image...');
    // `.pipe and fs.createWriteStream to save the file to working directory ('./future.jpg')
    response.pipe(fs.createWriteStream(filePath + response.headers['content-type'].split('/')[1]))
  })

  .on('finish', function(){
    console.log('Download complete.');
  });
}

//loops through each item in the array, download the avartar
getRepoContributors(repoOwner, repoName, function(err, result){
  if(err){
    console.error(err);
  } else {
    for (let item of result){
      //constructs a file path using the login value
      let filePath = `avatars/${item['login']}.`;
      //get the avartar url
      let url = item['avatar_url'];
      downloadImageByURL(url, filePath);
    }
  }
})

