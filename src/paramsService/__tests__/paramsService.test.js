const { domainService } = require('config');
const axios = require('axios');

describe('Module for Params Service', () => {

  it('test thickness post api response type to be boolean', async () => { 

    jest.setTimeout(30000);
    const tFactor = Math.random().toFixed(2);
    const res = await axios.post(`${domainService.params.endpoint}/api/v1/factor/thickness`, { factor: tFactor });
    const { data } = res;
    const responseStatus = data.ok;    
    expect(typeof responseStatus === 'boolean').toBeTruthy();
  })
});
