const { natsMessageHandler } = require('../messageUtil');

describe('Module messageUtil', () => {
  const fakeType = 'FACTOR_THICKNESS';
  const fakeType2 = 'FACTOR_MOISTURE';
  const fakeFactor = 0.5;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Method natsMessageHandler for global.cache = undefined', async () => {
    global.cache = undefined

    let ret = natsMessageHandler(
      JSON.stringify({
        type: fakeType,
        factor: fakeFactor,
      })
    );

    expect(ret).toBe(undefined);
  });

  it('Method natsMessageHandler for success', async () => {
    global.cache = {
      set: jest.fn().mockReturnValueOnce(true),
    };

    natsMessageHandler(
      JSON.stringify({
        type: fakeType,
        factor: fakeFactor,
      })
    );

    expect(global.cache.set).toHaveBeenCalledWith(fakeType, fakeFactor);
  });

  it('Method natsMessageHandler for else if branch', async () => {
    global.cache = {
      set: jest.fn().mockReturnValueOnce(true),
    };

    natsMessageHandler(
      JSON.stringify({
        type: fakeType2,
        factor: fakeFactor,
      })
    );

    expect(global.cache.set).toHaveBeenCalledWith(fakeType2, fakeFactor);
  });

  it('Method natsMessageHandler for failed', async () => {
    global.cache = {
      set: jest.fn().mockReturnValueOnce(true),
    };

    natsMessageHandler(
      JSON.stringify({
        type: 'FAKE_TYPE',
        factor: fakeFactor,
      })
    );

    expect(global.cache.set).toBeCalledTimes(0);
  });
});
