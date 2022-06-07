// const { natsMessageHandler } = require('../messageUtil');
const { setPayload, paramsForTypes, PayloadManager, PayloadType } = require('../index.js');
const uuidv4 = require('uuid').v4;
const NodeCache = require('node-cache');


describe('Module for Measure Service', () => {

  beforeEach(() => {
    global.cache = new NodeCache();
  });
  it('...The value of Sharon moisture range between upper and lower bound ', () => {

    const moistureLowerBound = 60;
    const moistureUpperBound = 70;
    const id = uuidv4();

    const sharonMoisture = parseFloat(paramsForTypes(id)[0].moisture);
    
    expect(sharonMoisture).toBeGreaterThanOrEqual(moistureLowerBound);
    expect(sharonMoisture).toBeLessThanOrEqual(moistureUpperBound);
  });

  it('...The value of Sharon thickness range between upper and lower bound ', () => {

    const thicknessLowerBound = 20;
    const thicknessUpperBound = 30;
    const id = uuidv4();

    const sharonThickness = parseFloat(paramsForTypes(id)[0].thickness);
    
    expect(sharonThickness).toBeGreaterThanOrEqual(thicknessLowerBound);
    expect(sharonThickness).toBeLessThanOrEqual(thicknessUpperBound);
  });

  it('...Test for all the payload which has moisture property to be in between of range', () => { 
    
    const id = uuidv4();
    paramsForTypes(id).forEach((ele, id) => {
      if (ele.hasOwnProperty('moisture')) { 
        const moistureLowerBound = 60;
        const moistureUpperBound = 70;
        
        expect(parseFloat(ele.moisture)).toBeGreaterThanOrEqual(moistureLowerBound);
        expect(parseFloat(ele.moisture)).toBeLessThanOrEqual(moistureUpperBound);

      }
    })
  }) 
  it('...Test for all the payload which has thickness property to be in between of range', () => { 
    
    const id = uuidv4();
    paramsForTypes(id).forEach((ele, id) => {
      if (ele.hasOwnProperty('thickness')) { 
        const thicknessLowerBound = 20;
        const thicknessUpperBound = 30;
        
        expect(parseFloat(ele.thickness)).toBeGreaterThanOrEqual(thicknessLowerBound);
        expect(parseFloat(ele.thickness)).toBeLessThanOrEqual(thicknessUpperBound);

      }
    })
  })
  
  it('...test for payload manager and payload type', () => { 
    const id = uuidv4();
    
    const thickness = 2 + Math.random().toFixed(2);
    const moisture = 6 + Math.random().toFixed(2);
    const payloadManager = new PayloadManager();
    const payloadType = new PayloadType({
      id,
      type: 'SHARON',
      thickness,
      moisture
    });
    
    payloadManager.setType = payloadType;

    const payload = payloadManager.getData();
    expect(payload).toStrictEqual({
      id,
      type: 'SHARON',
      thickness,
      moisture
    })



  })

  it('...test for payload', () => { 
    const a = setPayload();

    console.log(a);

    expect(a.payload).toStrictEqual(a.paramsForPayloadType)



  })

});
