const dotenv = require('dotenv');
dotenv.config();

const { nats } = require('config');

const NodeCache = require('node-cache');

const logger = require('./utilities/logger')('INDEX');
const NATSClient = require('./utilities/natsClient');

const measureService = require('./measureService');
const apcService = require('./apcService');
const paramsService = require('./paramsService');

let measureHandle = null;
let paramsHandle = null;

const initGlobalNATSClient = async () => {
  // instantiate the nats client
  global.natsClient = NATSClient.instance();

  const connection = process.env.NATS_SERVICE_CONNECTION || nats.connection;

  logger.info(`nats-server connection: ${connection}`);

  await global.natsClient.connect(nats.name, [connection]);

  // clear stream and consumer by existence
  let stream = await global.natsClient.getStream(nats.stream);
  if (stream) {
    let consumer = await global.natsClient.getConsumer(nats.stream, `${nats.consumer}_params`);
    if (consumer) {
      await global.natsClient.deleteConsumer(nats.stream, `${nats.consumer}_params`);
    }
    await global.natsClient.deleteStream(nats.stream);
  }

  // add the stream
  await global.natsClient.addStream(nats.stream, [`${nats.subject}.>`]);

  // add the consumer
  await global.natsClient.addConsumer(nats.stream, `${nats.subject}.params`, `${nats.consumer}_params`);
};

const initGlobalCache = async () => {
  global.cache = new NodeCache();

  global.cache.set('FACTOR_THICKNESS', 0.5);
  global.cache.set('FACTOR_MOISTURE', 0.5);
};


class ServiceManager {
  constructor() { 
    this._service = null;
  }

  set setService(service) {
    this._service = service;
  }

  get service() { 
    return this._service;
  }

  runService() { 
    this._service.runService();
  }
}


class ApcService { 
  async runService() { 
    await apcService.run();
  }
}

class ParamsService { 
  async runService() { 
    await paramsService.run();
  }
}


class MeasureService { 
  async runService() { 
    await measureService.run();
  }
}


const run = async () => {
  // initialize the global resource
  await initGlobalNATSClient();
  await initGlobalCache();


  const serviceManager = new ServiceManager();
  const apc = new ApcService();
  const params = new ParamsService();
  const measure = new MeasureService();


  serviceManager.setService = apc;


  serviceManager.runService();

  serviceManager.setService = params;
  paramsHandle = serviceManager.runService();

  serviceManager.setService = measure;
  measureHandle = serviceManager.runService();

};

run();

process.on('SIGINT', async () => {
  if (global.cache) {
    await global.cache.close();
    global.cache = null;
  }

  if (global.natsClient) {
    await global.natsClient.disconnect();
    global.natsClient = null;
  }

  if (paramsHandle) {
    clearInterval(paramsHandle);
  }

  if (measureHandle) {
    clearInterval(measureHandle);
  }

  process.exit();
});
