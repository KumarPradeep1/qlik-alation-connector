'use strict';

var https = require('https');
var axios = require('axios');
const routes = require('express').Router();
const Sequelize = require('sequelize');
const models = require('../../models');
const constants = require('../../config/constants.js');

// API Authentication
routes.post('/api/login', (req, response) => {
  console.log(req.body)
  var query = req.body;
  var user = query.password.split("\\")
  var user_dir =user[0]+"/"+user[1]
  var params = { path: query.url+query.username+"/"+constants.USER_EXIST_API+user_dir,
                 query : {},
                 username: query.username,
                 password: query.password }
  var config = authenticate(params);

  axios(config).then(function (res) {
    console.log(res.data.value)
    console.log(Object.keys(res.data))
    if (res.data.value)
      response.send({success: "true", message: constants.LOGIN_SUCCESS })
    else
      response.send({failure: "true", message: constants.LOGIN_FAILURE })
  }).catch(function (error) {
    response.send({ failure: "true", error: error.response.statusText })
  });
});

// Streams API
routes.post('/api/streams', (req, response) => {
   console.log(req.body)
  var query = req.body;
  var user = query.password.split("\\")
  var user_dir =user[0]+"/"+user[1]
  var params = { path: query.url+query.username+"/"+constants.GET_STREAMS,
                 query : {},
                 username: query.username,
                 password: query.password }
  var config = authenticate(params);
  axios(config).then(function (res) {
    let streams = res.data;
    if(streams){
      streams.forEach(function(values,index){
        let streamid = values.id;
        let stream_params = { "id": streamid,"Name": values.name, "CreatedDate":values.createdDate,
                              "ModifiedDate": values.modifiedDate, "ModifiedByUserName": values.ModifiedByUserName, "Owner_ID":values.owner.id }
        models.Streams.findOne({ where: {id: streamid} }).then(status => {
           if(!status)
              models.Streams.create(stream_params);
        })
      })
    }
    response.send(res.data)
  }).catch(function (error) {
    response.send({ error: error.code })
  });
});

// Authentication API
routes.get('/user', (req, response) => {
  var user_dir =req.query.directory+"/"+req.query.name
  var params = { path: req.query.host+constants.USER_EXIST_API+user_dir,
                 query : {},
                 virtual_proxy: req.query.virtual_proxy,
                 userdirectory: req.query.userdirectory }
  var config = authenticate(params);

  axios(config).then(function (res) {
    console.log(res.data.value)
    console.log(Object.keys(res.data))
    if (res.data.value)
      response.send({success: "true", message: constants.LOGIN_SUCCESS })
    else
      response.send({failure: "true", message: constants.LOGIN_FAILURE })
  }).catch(function (error) {
    response.send({ failure: "true", error: error.response.statusText })
  });
});

// Streams API
routes.get('/streams', (req, response) => {
  var params = { path: req.query.host+constants.GET_STREAMS,
                 query : {},
                 virtual_proxy: req.query.virtual_proxy,
                 userdirectory: req.query.userdirectory }
  var config = authenticate(params);

  axios(config).then(function (res) {
    let streams = res.data;
    if(streams){
      streams.forEach(function(values,index){
        let streamid = values.id;
        let stream_params = { "id": streamid,"Name": values.name, "CreatedDate":values.createdDate,
                              "ModifiedDate": values.modifiedDate, "ModifiedByUserName": values.ModifiedByUserName, "Owner_ID":values.owner.id }
        models.Streams.findOne({ where: {id: streamid} }).then(status => {
           if(!status)
              models.Streams.create(stream_params);
        })
      })
    }
    response.send(res.data)
  }).catch(function (error) {
    response.send({ error: error.code })
  });
});

// STREAM APPS API
routes.get('/streams/:streamId', (req, response) => {
  var params = { path: req.query.host+constants.GET_APPS,
                 query : {filter: "stream.id eq "+req.params.streamId},
                 proxy_name: req.query.virtual_proxy,
                 userdirectory: req.query.userdirectory
             }
  var config = authenticate(params);
  axios(config).then(function (res) {
    console.log(res.data)
    response.send(res.data)
  }).catch(function (error) {
    console.log(error);
    response.send({ error: error.code })
  });
});

// APP SHEETS API
routes.get('/app/:appId/sheets', (req, response) => {
  var params = { path: req.query.host+constants.GET_APP_OBJECTS,
                 query : {filter: "objectType eq 'sheet' and app.id eq "+req.params.appId}}
  var options = authenticate(params)
  axios(options).then(function (res) {
    console.log(res.data)
    response.send(res.data)
  }).catch(function (error) {
    console.log(error);
    response.send({ error: error.code })
  });
});

let authenticate = function(params){
  let query = Object.assign({xrfkey: constants.XRF_KEY }, params.query)
  let config = {
    url: params.path,
    method: 'get',
    params: query,
    headers: {
        'Content-Type':'application/json',
        'x-qlik-xrfkey' : constants.XRF_KEY,
    }
  }
  config.headers[''+params.username] = params.password
  console.log(config.headers)
  return config;
}

module.exports = routes;
