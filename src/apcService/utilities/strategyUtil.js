class Strategy {
  constructor(params, factors) {
      this.params = params;
      this.factors = factors;
  };
  getInfo(){
    
  }
}

class defaultStrategy extends Strategy{

  getInfo() {
    const temperature = (this.params.moisture * this.factors.mFactor).toFixed(2);

    return {
      period: 100,
      temperature,
    };
  }
}

class sharonStrategy extends  Strategy{

  getInfo() {
    const temperature = (this.params.thickness * this.factors.tFactor).toFixed(2);

    return {
      period: 20,
      temperature,
    };
  }
}

class stripStrategy extends  Strategy{

  getInfo() {
    const temperature = (this.params.thickness * this.factors.tFactor).toFixed(2);
    const period = (this.params.moisture * this.factors.mFactor + 20).toFixed(2);

    return {
      period,
      temperature,
    };
  }
}


module.exports = {
  defaultStrategy,
  sharonStrategy,
  stripStrategy
};
