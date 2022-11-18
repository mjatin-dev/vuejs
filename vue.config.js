process.env.VUE_APP_VERSION = process.env.npm_package_version
module.exports = {
  devServer: {
    proxy: {
      '^/api/': {
        target: 'https://devapi.annumapp.com/',
        changeOrigin: true,
        logLevel: 'debug',
      },
    },
  },
}
