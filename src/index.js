const LastCallWebpackPlugin = require('last-call-webpack-plugin');

class OptimizeCssAssetsWebpackPlugin extends LastCallWebpackPlugin {
  constructor(options) {
    super({
      assetProcessors: [
        {
          phase: LastCallWebpackPlugin.PHASES.OPTIMIZE_CHUNK_ASSETS,
          regExp: (options && options.assetNameRegExp) || /\.css$/g,
          processor: (assetName, asset, assets) =>
            this.processCss(assetName, asset, assets),
        }
      ],
      canPrint: options && options.canPrint,
    });

    this.options.assetNameRegExp = !options || !options.assetNameRegExp ?
      /\.css$/g :
      options.assetNameRegExp;
    this.options.cssProcessor = !options || !options.cssProcessor ?
        require('cssnano') :
        options.cssProcessor;
    this.options.cssProcessorOptions = !options || options.cssProcessorOptions === undefined ?
      {} :
      options.cssProcessorOptions;
  }

  buildPluginDescriptor() {
    return { name: 'OptimizeCssAssetsWebpackPlugin' };
  }

  processCss(assetName, asset, assets) {
    const css = asset.sourceAndMap ? asset.sourceAndMap() : { source: asset.source() };
    const processOptions = Object.assign(
      { from: assetName, to: assetName },
      this.options.cssProcessorOptions
    );

    if (processOptions.map && !processOptions.map.prev) {
      try {
        let map = css.map;
        if (!map) {
          const mapJson = assets.getAsset(assetName + '.map');
          if (mapJson) {
            map = JSON.parse(mapJson);
          }
        }
        if (
          map &&
          (
            (map.sources && map.sources.length > 0) ||
            (map.mappings && map.mappings.length > 0)
          )
        ) {
          processOptions.map = Object.assign({ prev: map }, processOptions.map);
        }
      } catch (err) {
        console.warn('OptimizeCssAssetsPlugin.processCss() Error getting previous source map', err);
      }
    }
    return this.options
      .cssProcessor.process(css.source, processOptions, processOptions)
      .then(r => {
        if (processOptions.map && r.map && r.map.toString) {
          assets.setAsset(assetName + '.map', r.map.toString());
        }
        return r.css;
      });
  }
}

module.exports = OptimizeCssAssetsWebpackPlugin;
