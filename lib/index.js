"use strict";

require("core-js/modules/web.dom-collections.iterator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const converter = require('./converter');

function convert(type, graphqlData) {
  try {
    return converter(graphqlData, type);
  } catch (e) {
    console.error('unexpected error in graphql2chartjs; please check your graphql response');
    console.error(e);
  }
}

class Graphql2Chartjs {
  constructor(graphqlData, arg) {
    this.handleInit(graphqlData, arg);
  }

  handleInit(graphqlData, arg) {
    this.data = {};

    if (!graphqlData) {
      return;
    }

    if (typeof arg === 'string') {
      this.gqlData = graphqlData;
      this.chartType = arg;
      this.data = convert(arg, graphqlData);
    } else if (typeof arg === 'function') {
      this.transformer = arg;
      this.gqlData = this.transformGqlData(graphqlData, arg);
      this.data = convert(this.chartType, this.gqlData);
    } else {
      console.error('invalid second argument to graphql2chartjs');
    }
  }

  transformGqlData(graphqlData, transformer) {
    const transformedGqlData = {};
    Object.keys(graphqlData).forEach(datasetName => {
      if (Array.isArray(graphqlData[datasetName])) {
        transformedGqlData[datasetName] = graphqlData[datasetName].map(dataPoint => {
          return _objectSpread({}, dataPoint, {}, transformer(datasetName, dataPoint));
        });
      }
    });
    return transformedGqlData;
  }

  reset(graphqlData, arg) {
    this.handleInit(graphqlData, arg);
  }

  add(graphqlData, arg) {
    if (!graphqlData) {
      console.warn('invalid graphql data provided to Graphql2Chartjs');
      return;
    }

    if (!this.gqlData || this.gqlData && Object.keys(this.gqlData).length === 0) {
      this.handleInit(graphqlData, arg);
      return;
    }

    this.mergeData(typeof arg === 'function' ? this.chartType : arg, typeof arg === 'function' ? this.transformGqlData(graphqlData, arg) : graphqlData);
  }

  reform(transformer) {
    this.gqlData = this.transformGqlData(this.gqlData, transformer);
    this.data = convert(this.chartType, this.gqlData);
  }

  mergeData(type, graphqlData) {
    const oldGqlData = _objectSpread({}, this.gqlData);

    Object.keys(graphqlData).forEach(dsName => {
      if (oldGqlData[dsName]) {
        graphqlData[dsName].forEach(dp => {
          const oldDs = oldGqlData[dsName];
          let oldDsLength = oldGqlData[dsName].length;
          let refIndex;

          for (var _i = oldDs.length - 1; _i >= 0; _i--) {
            let refDp = oldDs[_i];

            if (refDp.label && refDp.label === dp.label) {
              refIndex = _i;
              break;
            } else if (refDp.data_r !== undefined) {
              if (refDp.data_x === dp.data_x && refDp.data_y === dp.data_y && refDp.data_r === dp.data_r) {
                refIndex = _i;
                break;
              }
            } else if (refDp.data_x !== undefined) {
              if (refDp.data_x === dp.data_x && refDp.data_y === dp.data_y) {
                refIndex = _i;
                break;
              }
            } else if (refDp.data_t !== undefined) {
              if (refDp.data_t === dp.data_t && refDp.data_y === dp.data_y) {
                refIndex = _i;
                break;
              }
            }
          }

          if (!refIndex) {
            refIndex = oldDsLength;
            oldDsLength++;
            oldGqlData[dsName] = [...oldGqlData[dsName], _objectSpread({}, dp)];
          } else {
            oldGqlData[dsName][refIndex] = _objectSpread({}, oldGqlData[dsName][refIndex], {}, dp);
          }
        });
      } else {
        oldGqlData[dsName] = graphqlData[dsName];
      }
    });
    this.gqlData = oldGqlData;
    this.data = convert(type, oldGqlData);
  }

}

if (typeof window != 'undefined') {
  window.Graphql2Chartjs = Graphql2Chartjs;
  window.graphql2chartjs = Graphql2Chartjs;
  window.GraphQL2ChartJS = Graphql2Chartjs;
  window.Graphql2chartjs = Graphql2Chartjs;
}

module.exports = Graphql2Chartjs;