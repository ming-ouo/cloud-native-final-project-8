const { domainService } = require('config');
const axios = require('axios');
const { app } = require("../index");
const request = require("supertest");

describe('Module for Params Service', () => {

  it('test thickness post api response status to be 200', async  () => { 

    jest.setTimeout(30000);

    const tFactor = Math.random().toFixed(2);
    request(app)
      .post(`${domainService.params.endpoint}/api/v1/factor/thickness/`)
      .send({ factor: tFactor })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        return
      });

  })
});
