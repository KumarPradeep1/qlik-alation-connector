var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');
const qsocks = require('qsocks');

function auth_params(appid){
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

let objects_info = [];
let required_objects = ["kpi","barchart","combochart", "linechart","table"];
let qlik_app = ""
let HyperCubeDefParams = [{
    qTop: 0,
    qLeft: 0,
    qWidth: 10,
    qHeight: 100
    }];

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/index');
routes(app);

app.get('/', (req, res) => res.send('Basic QLik - Alation Connector'))
console.log('todo list RESTful API server started on: ' + port);
app.listen(port, () => console.log('Example app listening on port 3000!'))

// Retreiving apps
app.get('/apps', (req, res) => {
  config = auth_params("doclists")
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

app.get('/app/:appId', (req, res) => { 
  let appId = req.params.appId;
  config = auth_params(appId)
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
        let title, info, headdata,tableproperty;
        info = {id: element.qId, type: element.qType}

        qlik_app.getObject(info.id).then(object => {
          if(info.type == 'table'){
            object.getLayout().then(function(tableproperty) { 
              info["tableproperty"] = tableproperty;
            });
          }

          object.getEffectiveProperties().then(function(property) {
            console.log("66666666666666")
            console.log(property)
            if(property.qHyperCubeDef.qDimensions)
              headdata = property.qHyperCubeDef.qDimensions;

            if(property.qHyperCubeDef.qMeasures)
              measures = property.qHyperCubeDef.qMeasures;

            if(property.title){
              title = property.title
            }else if(property.qHyperCubeDef.qMeasures[0].qDef.qLabel){
              title = property.qHyperCubeDef.qMeasures[0].qDef.qLabel
            }else{
              title = null;
            }

            info["title"] = title;
            info["dimensions"] = headdata;
            info["measures"] = measures;
            objects_info.push(info);
          });

          object.getHyperCubeData('/qHyperCubeDef', HyperCubeDefParams)
          .then(function(data) {
            info["data"] = data[0].qMatrix
            objects_info.push(info)
            resolve(info);
          });
        })
      })
    });

    Promise.all(promises).then(function(values){
      result = {}
      result[appId] = values
      res.send(result);
    });
  })
  .catch(function(err) {
    console.log('Something went wrong: ', err);
    response = {error: err}
    res.send(response);
  })
});


app.get('/metadata', (req, res) => {
  let apps, app_objects, obj_props = []
  config = auth_params("doclists")
  qsocks.Connect(config)
  .then(function(connections) {
    connections.getDocList().then(function(doclist) {
      apps = doclist
      console.log(doclist)
      var promises = doclist.map(element => {
        console.log("222222222222222")
        console.log(element)
        config['appname'] = element.qDocId;
        return new Promise((resolve, reject) => {
          qsocks.ConnectOpenApp(config)
          .then(function(connections) {
            console.log("55555555555555555")
            qlik_app = connections[1];
            return qlik_app.getAllInfos()
          })
          .then(function(allinfos) {
            console.log("66666666666666666")
            qInfos = allinfos.qInfos;
            console.log(qInfos)
            app_objects.push(qInfos)
            // resolve(qInfos);
            // return qInfos
          })
        });
      });

      Promise.all(promises).then(function(values){
        result = {}
        result["result"] = values
        res.send(result);
      });
    });
  })
  .catch(function(err) {
    console.log('Something went wrong: ', err);
    response = {error: err}
    res.send(response);
  })
});

function elements_info(data){
  let elements= [];
  data.forEach(function(element){
    if (required_objects.includes(element.qType))
      elements.push({ qType: element.qType, qId: element.qId  })
  });
  return elements;
}
