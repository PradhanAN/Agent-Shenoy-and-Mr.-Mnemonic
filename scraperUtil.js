exports.scraperOptions = {
    uri: `http://api.scraperapi.com/`,
    qs: {
      api_key: process.env.SCRAPER_APIKEY,
      url: "",
    },
    retry: 5,
    verbose_logging: false,
    accepted: [200, 404, 403],
    delay: 5000,
    factor: 2,
    resolveWithFullResponse: true,
}