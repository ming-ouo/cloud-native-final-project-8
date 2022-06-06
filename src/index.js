const dotenv = require('dotenv');
dotenv.config();

const { nats } = require('config');

const NodeCache = require('node-cache');
const MongoCache = require('./utilities/mongoCache');

const logger = require('./utilities/logger')('INDEX');
const NATSClient = require('./utilities/natsClient');

const measureService = require('./measureService');
const apcService = require('./apcService');
const paramsService = require('./paramsService');

const client = require('prom-client')
const express = require('express');

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
    //global.cache = new NodeCache();

    //global.cache.set('FACTOR_THICKNESS', 0.5);
    //global.cache.set('FACTOR_MOISTURE', 0.5);

    global.cache = new MongoCache(
        `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_CACHE_DB_NAME}?authSource=admin`,
        `${process.env.MONGO_CACHE_DB_NAME}`,
        `${process.env.MONGO_CACHE_COLLECTION_NAME}`
    );

    await global.cache.connect();

    let factor_thickness_result = await global.cache.get('FACTOR_THICKNESS');
    if (factor_thickness_result === undefined) {
        await global.cache.set('FACTOR_THICKNESS', 0.5);
    }

    let factor_moisture_result = await global.cache.get('FACTOR_MOISTURE');
    if (factor_moisture_result === undefined) {
        await global.cache.set('FACTOR_MOISTURE', 0.5);
    }

    factor_thickness_result = await global.cache.get('FACTOR_THICKNESS');
    factor_moisture_result = await global.cache.get('FACTOR_MOISTURE');

    logger.info(`FACTOR_THICKNESS: ${factor_thickness_result}`);
    logger.info(`FACTOR_MOISTURE": ${factor_moisture_result}`);
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

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'apc-simulator'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register })

const thickness_metric = new client.Gauge({
  name: 'thickness',
  help: 'thickness_metric',
});

const moisture_metric = new client.Gauge({
  name: 'moisture',
  help: 'moisture_metric',
});

const thickness_factor_metric = new client.Gauge({
  name: 'thickness_factor',
  help: 'thickness_factor_metric',
});

const moisture_factor_metric = new client.Gauge({
  name: 'moisture_factor',
  help: 'moisture_factor_metric',
});

register.registerMetric(thickness_factor_metric);
register.registerMetric(moisture_factor_metric);
register.registerMetric(thickness_metric);
register.registerMetric(moisture_metric);

global.thickness_factor_metric = thickness_factor_metric
global.moisture_factor_metric = moisture_factor_metric
global.thickness_metric = thickness_metric
global.moisture_metric = moisture_metric

const app = express();

app.get('/metrics', async (req, res) => {
    //global.thickness_factor_metric.set((Math.random() * (0.120 - 0.0200) + 0.0200))
    //global.moisture_factor_metric.set((Math.random() * (0.120 - 0.0200) + 0.0200))

    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.listen(8080, () => console.log('Server is running on http://localhost:8080, metrics are exposed on http://localhost:8080/metrics'));
