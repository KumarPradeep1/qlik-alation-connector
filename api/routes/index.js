'use strict';

const routes = require('express').Router();
const http = require('http');
const qsocks = require('qsocks');

// GET Default Routes.
routes.get('/', (req, response) => {
  var url="http://localhost:3000/apps";
  var req = http.request(url,res=>{
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        response.send(chunk);
      });
    });
    req.end();
});

// GET Apps.
routes.get('/apps', (req, res) => {
  let config = authenticate("doclists")
  qsocks.Connect(config)
  .then(function(connections) {
    connections.getDocList().then(function(doclist) {
        res.send(doclist);
    });
  })
  .catch(function(err) {
    console.log('Something went wrong: ', err);
    response = {error: err}
    res.send(response);
  })
});

module.exports = routes;

let authenticate = function(appid){
  let config = {
      host: 'qlik.mashey.com',
      isSecure: true,
      prefix:'hdr' ,
      headers: {
      'Content-Type':'application/json',
      'x-qlik-xrfkey' : 'abcdefghijklmnop',
      'hdr-usr': 'MASHEY\\andrew'
      },
  }
  if(appid != 'doclists'){
    config['appname'] = appid;
  }
  return config
}
