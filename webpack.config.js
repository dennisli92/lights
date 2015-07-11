module.exports = {
    entry: "./modules/entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { 
                test: /\.css$/, 
                loader: "style!css" 
            },
            {
                test: /\.js$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            },
            { 
                test: /\.js$/, 
                exclude: /node_modules/, 
                loader: 'babel-loader'
            },
        ]
    }
};
