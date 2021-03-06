'use strict';

const routes = require('express').Router();
const http = require('http');
var https = require('https');
const qsocks = require('qsocks');
const Sequelize = require('sequelize');
const models = require('../../models');
const Op = Sequelize.Op;
let objects_info = [];
let result = {}; let qlik_app = ''; let qInfos;
let required_objects = ["kpi","barchart","combochart", "linechart","table"]; 

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
      doclist.forEach(function(values,index){
        let qMetavalue = values.qMeta;
        let stream = qMetavalue.stream;
        let stream_id = null;
        if(stream){
          stream_id = stream.id;
        }
        let appid = values.qDocId;
        let default_params = {"id":appid,"Name": values.qDocName,"AppId": appid,  "Description": qMetavalue.description, "PublishTime": qMetavalue.publishTime,"LastReloadTime": values.qLastReloadTime,"Thumbnail": values.qThumbnail.qUrl,"CreatedDate": qMetavalue.createdDate,"ModifiedDate": qMetavalue.modifiedDate,"ModifiedByUserName": "","Owner_ID": null,"Stream_ID": stream_id,"SavedInProductVersion": "","MigrationHash": "","DynamicColor": qMetavalue.dynamicColor,"SourceAppId": null,"TargetAppId": null};

        models.App.findOne({ where: {id: appid} }).then(status => {
           if(!status)
              models.App.create(default_params);
        }) 
      })
        res.send(doclist);
    });
  })
  .catch(function(err) {
    console.log('Something went wrong: ', err);
    response = {error: err}
    res.send(response);
  }) 
});

routes.get('/app/:appId/objects', (req, res) => {  
  getAppdatas([req.params.appId],res);
});

//Get App objects
routes.get('/appobjects', (req, res) => {  
  models.App.findAll().then(function(appdatas){
    appdatas = JSON.stringify(appdatas);
    appdatas = JSON.parse(appdatas);
    let appIds = [];
    appdatas.forEach(function(values,i){ 
      //let appIds = [];
      let id = values.id;
      if(id)
      appIds.push(id);
    })
    getAppdatas(['4fdd8d12-ef72-4edc-b10d-2284ca426a84'],res);
    res.send(appIds);
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
let elements_info = function(data){
  let elements= [];
  data.forEach(function(element){  
    if(required_objects.includes(element.qType))
        elements.push({ qType: element.qType, qId: element.qId  })
  });
  // console.log(elements);
  return elements;
}
let store_appobject = function(appdata,appId){   
  appdata.forEach(function(value,i){
    let whereConditions;
    let object_id = value.id;
    let measures_data = value.measures; 
       
    let default_params = {"AppId":appId,"EngineObjectId":object_id,"Title":value.title,"ObjectType":value.type,"dimension":value.dimensions };  
    if(measures_data.length > 0){ 
      measures_data.forEach(function(values,index){
        let qMeasuresdef = measures_data[index].qDef.qDef;   
            whereConditions =  { where: {EngineObjectId: object_id}}; 
            if(qMeasuresdef){
              whereConditions =  { where: {EngineObjectId: object_id , measures: qMeasuresdef } };
            }  

            models.AppObject.findOne(whereConditions).then(status => { 
              if(!status){
                default_params.measures = qMeasuresdef;
                models.AppObject.create(default_params);      
              }
            })
      });  
    }else{
      whereConditions =  { where: {EngineObjectId: object_id}}; 
      models.AppObject.findOne(whereConditions).then(status => { 
        if(!status){
          default_params.measures = '';
          models.AppObject.create(default_params);      
        }
      })
    }
  });
}
let getAppdatas = function(appIds,res){ 
  let appidslength = appIds.length; 
  appIds.forEach(function(appId,i){ 
   i = i + 1;  
  let config = authenticate(appId)
  qsocks.ConnectOpenApp(config)
  .then(function(connections) {
    qlik_app = connections[1];
    return qlik_app.getAllInfos()
  })
  .then(function(allinfos) {
    qInfos = allinfos.qInfos;
    return elements_info(qInfos);
  })
  .then(function(elements){   
    var promises = elements.map(element => { 
      return new Promise((resolve, reject) => { 
        let title, info, dimensions,tableproperty,measures;
        info = {id: element.qId, type: element.qType}; 
        qlik_app.getObject(info.id).then(object => {
          if(info.type == 'table'){
            object.getLayout().then(function(tableproperty) { 
              info["tableproperty"] = tableproperty;
            });
          }

          object.getEffectiveProperties().then(function(property) {  
            
            if(property.qHyperCubeDef){
              if(property.qHyperCubeDef.qDimensions)
                dimensions = property.qHyperCubeDef.qDimensions;

              if(property.qHyperCubeDef.qMeasures){
                measures = property.qHyperCubeDef.qMeasures; 
              }
              let property_title = property.title;
              if(property_title){ 
                title = typeof(property_title) == "object" ? property_title.qStringExpression.qExpr : property_title;
              }else if(property.qHyperCubeDef.qMeasures[0].qDef.qLabel){
                title = property.qHyperCubeDef.qMeasures[0].qDef.qLabel
              }else{
                title = '';
              } 
            }else{
              title = '';dimensions = '';measures = '';
            }  
            Object.assign(info,{title: title, dimensions: dimensions, measures: measures}); 
            objects_info.push(info); 
            resolve(info);
          }); 
        })
      })

    });

   Promise.all(promises).then(function(values){ 
      //result[appId] = values;   
      if(appidslength == 1){  
        store_appobject(values,appId); 
      }else if(i == appidslength){
        store_appobject(values,appId); 
      }
    }); 
  })
  .catch(function(err) {
    console.log('Something went wrong: ', err);
    response = {error: err}
     res.send(response);
  }) 
});

}

routes.get('/getapps', (req, res) => {  
  models.App.findAll().then(function(datas){
    res.send(datas);
  }) 
});
routes.get('/getobjects', (req, res) => {  
  models.AppObject.findAll().then(function(datas){
    res.send(datas);
  }) 
});
routes.get('/destroy',(req,res)=>{
  models.App.destroy({
  where: {},
  truncate: true
  })
  res.send('destroyed');
})
