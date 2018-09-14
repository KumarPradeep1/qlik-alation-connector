'use strict';

var https = require('https');
var axios = require('axios');

const routes = require('express').Router();
const Sequelize = require('sequelize');
const models = require('../../models');

// Get Streams
routes.get('/streams', (req, response) => { 
  var params = { path: "https://qlik.mashey.com/hdr/qrs/stream/full",
                 query : {} }
  var options = authenticate(params)
  axios(options).then(function (res) { 
    let streamsData = res.data;
    if(streamsData){
      streamsData.forEach(function(values,index){
        let streamid = values.id;
        let stream_params = {"id":streamid,"Name":values.name, "CreatedDate":values.createdDate, "ModifiedDate":values.modifiedDate, "ModifiedByUserName":values.ModifiedByUserName, "Owner_ID":values.owner.id}
        models.Streams.findOne({ where: {id: streamid} }).then(status => {
           if(!status)
              models.Streams.create(stream_params);
        }) 
      })
    }
    response.send(res.data)
  }).catch(function (error) { 
    console.log(error);
  });
});

// Get All Apps for specific stream
routes.get('/streams/:streamId', (req, response) => {
  var params = { path: "https://qlik.mashey.com/hdr/qrs/app/full",
                 query: {filter: "stream.id eq "+req.params.streamId} }
  var params = { path: "https://qlik.mashey.com/hdr/qrs/app/full",
                 query : {filter: "stream.id eq "+req.params.streamId}}
  var options = authenticate(params)
  axios(options).then(function (res) {
    console.log(res.data)
    response.send(res.data)
})
});

// Get All Sheets for an specific App
routes.get('/app/:appId/sheets', (req, response) => {
  var params = { path: "https://qlik.mashey.com/hdr/qrs/app/object/full",
                 query : {filter: "objectType eq 'sheet' and app.id eq "+req.params.appId}}
  var options = authenticate(params)
  axios(options).then(function (res) {
    console.log(res.data)
    response.send(res.data)
})
});

let authenticate = function(params){
  let query = Object.assign({xrfkey: 'abcdefghijklmnop'}, params.query)
  let config = {
    url: params.path,
    method: 'get',
    params: query,
    headers: {
        'Content-Type':'application/json',
        'x-qlik-xrfkey' : 'abcdefghijklmnop',
        'hdr-usr': 'MASHEY\\andrew'
    }
  }
  return config;
}

module.exports = routes;
