const { app, router } = require("../routers/v1/factor");
const request = require("supertest");
const MockNatsClient = require("../../../node_modules/mock-nats-client/lib/MockNatsClient"); 

const { json, urlencoded } = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

app.use(json());
app.use(urlencoded({ extended: true }));

app.use('', router);

describe('Module for Params Service', () => {

	beforeEach(() => {
		global.natsClient = new MockNatsClient({ json: true });
  });
  

  it('test for moisture response correctness',  async function (){

    const factor = Math.random().toFixed(2);
    await global.natsClient.publish(`test`, {
      type: 'FACTOR_MOISTURE',
      factor,
    });

    const responseData = await request(app)
      .post('/api/v1/factor/moisture')
      .send({ factor: Math.random().toFixed(2) })
      .expect(200);
    
    expect(responseData.ok).toBe(true);
    
    
  });

  it('test for thickness response correctness',  async function (){

    const factor = Math.random().toFixed(2);
    await global.natsClient.publish(`test`, {
      type: 'FACTOR_THICKNESS',
      factor,
    });

    const responseData = await request(app)
      .post('/api/v1/factor/thickness')
      .send({ factor: Math.random().toFixed(2) })
      .expect(200);
    
    expect(responseData.ok).toBe(true);
    
    
  });
  

});