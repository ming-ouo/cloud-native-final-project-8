const express = require('express');

const steakStrategy = require('../../utilities/strategyUtil');

const logger = require('../../../utilities/logger')('APC_SERVICE');

const router = express.Router();

router.post('/api/v1/process', async (req, res) => {
  const { id, type, thickness, moisture } = req.body;

  const handle = logger.begin({
    id,
    type,
    thickness,
    moisture,
  });

  try {
    if (!global.cache) {
      throw new Error('the global cache is not existed');
    }
    const tFactor = await global.cache.get('FACTOR_THICKNESS');
    const mFactor = await global.cache.get('FACTOR_MOISTURE');
    
    const params = {
     "thickness": thickness,
      "moisture": moisture
    }
    const factors = {
      "tFactor": tFactor,
      "mFactor": mFactor
    }

    let data = null;
    if (type === 'SHARON') {
      data = new steakStrategy.sharonStrategy(params, factors).getInfo();
    } else if (type === 'STRIP') {
      data = new steakStrategy.stripStrategy(params, factors).getInfo();
    }
    else {
      data = new steakStrategy.defaultStrategy(params, factors).getInfo();
    }

    logger.end(handle, { tFactor, mFactor, ...data }, `process (${id}) of APC has completed`);

    return res.status(200).send({ ok: true, data: { ...data, tFactor, mFactor } });
  } catch (err) {
    logger.fail(handle, { tFactor, mFactor }, err.message);

    return res.status(500).send({ ok: false, message: err.message });
  }
});

module.exports = router;
