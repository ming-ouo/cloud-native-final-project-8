const { cron, domainService } = require('config');

const axios = require('axios');

const express = require('express');
const { json, urlencoded } = require('body-parser');
const cors = require('cors');

const { router } = require('./routers/v1/factor');
const logger = require('../utilities/logger')('INDEX');

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.use('', router);



class FactorManager { 
  constructor() { 
    this.factorType = null;
  }

  set setType(params) {
    this.factorType = params;
    this.factorType._factor = {
        factor: Math.random().toFixed(2)
    };
  }

  getParams() {
    return this.factorType._factor;
  };
}


class FactorType { 
  constructor(params) { 
    this._factor = params;
  }
}



// API: post api's endpoint
// FACTOR_TYPE: change the factor here to adjust the post param
const factorSeries = [
  {
    API: "moisture",
    FACTOR_TYPE: {
      factor: Math.random().toFixed(2)
    },
    PROMETHEUS_PARAM: (param) => global.moisture_factor_metric.set(param)
  },
  {
    API: "thickness",
    FACTOR_TYPE: {
      factor: Math.random().toFixed(2)
    },
    PROMETHEUS_PARAM: (param) => global.thickness_factor_metric.set(param)
  }
]


const postFactors = () => {

  factorSeries.forEach(async (element, id) => {
    
    let factorType = new FactorType(element.FACTOR_TYPE);

    factorManager.setType = factorType;

    let params = factorManager.getParams();
    logger.info(params.factor); 
    element.PROMETHEUS_PARAM(parseFloat(params.factor));

    await axios.post(`${domainService.params.endpoint}/api/v1/factor/${element.API}`, params);
        
  })
}

const factorManager = new FactorManager();

const run = async () => {
  return new Promise((resolve, reject) => {
    app.listen(domainService.params.port, () => {
      const handler = setInterval(async () => {
        // const tFactor = Math.random().toFixed(2);
        // const mFactor = Math.random().toFixed(2);

        postFactors();

        // let factorType = new FactorType({
        //   factor: tFactor,
        // });

        // factorManager.setType = factorType;

        // let params = factorManager.getParams();

        // await axios.post(`${domainService.params.endpoint}/api/v1/factor/thickness`, params);
        
        
        // factorType = new FactorType({
        //   factor: mFactor
        // })

        // factorManager.setType = factorType;

        // params = factorManager.getParams();

        // await axios.post(`${domainService.params.endpoint}/api/v1/factor/moisture`, params);
      }, cron.paramsPeriod);

      resolve(handler);
    });
  });
};

module.exports = {
  run,
  app
};
