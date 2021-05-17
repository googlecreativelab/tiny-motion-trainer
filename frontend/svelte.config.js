const sveltePreprocess = require("svelte-preprocess");
const path = require("path");

const scssAliases = (aliases) => {
  return (url) => {
    for (const [alias, aliasPath] of Object.entries(aliases)) {
      if (url.indexOf(alias) === 0) {
        return {
          file: url.replace(alias, aliasPath),
        };
      }
    }
    return url;
  };
};

module.exports.preprocess = sveltePreprocess({
  postcss: {
    plugins: [require("autoprefixer")],
  },
  scss: {
    importer: [
      scssAliases({
        "@root": path.resolve(__dirname, "src"),
        "@scss": path.resolve(__dirname, "src", "scss"),
      }),
    ],
  },
  typescript: true,
});
