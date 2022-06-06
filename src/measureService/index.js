const { cron, domainService } = require('config');
const logger = require('../utilities/logger')('INDEX');

const axios = require('axios');
const uuidv4 = require('uuid').v4;

const types = ['SHARON', 'RIB_EYE'];

const paramsForTypes = (id) => ([
  {
    id,
    type: 'SHARON',
    thickness: 2 + Math.random().toFixed(2),
    moisture: 6 + Math.random().toFixed(2),
  },
  {
    id,
    type: 'RIB_EYE',
    thickness: 2 + Math.random().toFixed(2),
    moisture: 6 + Math.random().toFixed(2),
  },
])

class PayloadManager { 
  constructor() { 
    this.steakType = null;
  }

  set setType(params) {
    this.steakType = params;
  }

  getData() { 
    return this.steakType._payload;
  };
}


class PayloadType { 
  constructor(params) { 
    this._payload = params;
  }
}

const payloadManager = new PayloadManager();

const run = async () => {
  const handler = setInterval(async () => {
    const index = Math.floor((Math.random() * 10) % types.length);
    const id = uuidv4();
    
    // if need to add new payload type => add into paramsForTypes
    const paramsForPayloadType = paramsForTypes(id)[index];
    const payloadType = new PayloadType(paramsForPayloadType);

    payloadManager.setType = payloadType;
    const payload = payloadManager.getData();
    global.thickness_metric.set(parseFloat(paramsForPayloadType.thickness));
    global.moisture_metric.set(parseFloat(paramsForPayloadType.moisture));
    
    const { data } = await axios.post(`${domainService.apc.endpoint}/api/v1/process`, payload);
  }, cron.measurePeriod);

  return handler;
};

module.exports = {
  run,
  paramsForTypes
};
