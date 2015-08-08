module.exports = {
    entry: "./modules/entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel',
              query: {
                optional: ['runtime'],
                stage: 0
              }
            }
        ]
    }
};
