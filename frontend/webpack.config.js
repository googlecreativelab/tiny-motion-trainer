const path = require("path");

const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const { version } = require("./package.json");
const { preprocess } = require("./svelte.config");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

const local_tf4micro_kit = process.env.LOCAL_TF4MICRO_KIT;

module.exports = (env) => {
  const basePath = env.basePath || "";
  console.log(
    "=================================================================="
  );
  console.log(`= BUILDING FOR ${mode}`);
  console.log(`= BASE PATH: ${basePath}`);

  console.log(
    "=================================================================="
  );

  return {
    entry: {
      bundle: ["./src/main.js"],
    },
    resolve: {
      alias: {
        svelte: path.resolve("node_modules", "svelte"),
        "@": path.resolve(__dirname, "src"),
        "@scss/": path.resolve(__dirname, "src", "scss"),
        "tf4micro-motion-kit": local_tf4micro_kit
          ? path.resolve(__dirname, "..", "tf4micro-motion-kit", "web")
          : path.resolve(__dirname, "src", "tf4micro-motion-kit"),
      },
      extensions: [".mjs", ".js", ".svelte"],
      mainFields: ["svelte", "browser", "module", "main"],
    },
    output: {
      path: prod ? __dirname + "/dist" : __dirname + "/public/dev",
      filename: prod ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: prod ? "[name].[id].[contenthash].js" : "[name].[id].js",
    },
    module: {
      rules: [
        // prod
        // ? {
        //     test: /\.(?:svelte|m?js)$/,
        //     include: [
        //       path.resolve(__dirname, 'src'),
        //       path.resolve(__dirname, 'node_modules', 'svelte'),
        //     ],
        //     use: {
        //       loader: 'babel-loader',
        //     },
        //   }
        // : {},
        {
          test: /\.(png|jpg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
          type: "asset/resource",
        },
        {
          test: /\.svelte$/,
          use: {
            loader: "svelte-loader",
            options: {
              emitCss: true,
              hotReload: true,
              preprocess,
            },
          },
        },
        {
          test: /\.(scss|sass|css)$/i,
          use: [
            /**
             * MiniCssExtractPlugin doesn't support HMR.
             * For developing, use 'style-loader' instead.
             * */
            prod ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [
                    path.resolve(__dirname, "src", "scss", "theme"),
                    path.resolve(__dirname, "node_modules"),
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    mode,
    plugins: [
      new webpack.DefinePlugin({
        BASE_PATH: JSON.stringify(basePath),
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: `Tiny Motion Trainer`,
        template: "src/index.html",
      }),
      new MiniCssExtractPlugin({
        filename: prod ? "[name].[contenthash].css" : "[name].css",
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: "static", to: "static" }],
      }),
    ],
    devtool: prod ? "hidden-source-map" : "source-map",
  };
};
