const { scraperOptions } = require("./scraperUtil.js");
const { responseMessage,response3Pdf } = require("./responses.js");
const extractor = require("unfluff");
const rp = require("promise-request-retry");
const axios = require("axios").default;
const pdf = require('pdf-parse');
const FormData = require('form-data');

const { Configuration, OpenAIApi } = require("openai");
const { getSubtitles } =require('youtube-captions-scraper') ;

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_APIKEY,
});
const openai = new OpenAIApi(configuration);

exports.scrapeFromArticle = (link, phone_number_id, from) => {
  
  responseMessage(phone_number_id, from,"Processing the content...");
  scraperOptions.qs.url = link;
  rp(scraperOptions)
    .then((htmlResponse) => {
      let data = extractor(htmlResponse.body, "en");
      let s = data.text;
      const summarize = async (article) => {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: article,
          temperature: 0,
          max_tokens: 2500,
        });
        responseMessage(phone_number_id, from, "The summary of this article is\n" +response.data.choices[0].text);
        console.log("Summary sent");
      };
    
      responseMessage(phone_number_id, from,"Preparing the summary for you...");
      summarize(
        s +
          "\nSummarise the following text with most unique and helpful points, into a numbered list of key points and takeaways."
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.scrapeFromVideo = (link, phone_number_id, from) => {
  
  responseMessage(phone_number_id, from,"Processing the video...");
  
  
  function youtube_parser(url) {
    var regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }
  
  const summarize = async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0,
        max_tokens: 2500,
    });
    
    responseMessage(phone_number_id, from,  "The summary of this video is\n" + response.data.choices[0].text);

    console.log("Summary sent");
    
  }
  getSubtitles({
    videoID: youtube_parser(link), // youtube video id
    lang: 'en' // default: `en`
  }).then(captions => {
    // console.log(captions);
    let text = "";
    
    captions.map((value, index) => {
        // console.log(value);
        text = text + value.text + " "
    })
    responseMessage(phone_number_id, from,"Preparing the summary for you...");
    text = text + "\nSummarise the following transcription of a youtube video with most unique and helpful points, into a numbered list of key points and takeaways.";
    summarize(text);
  });
};

exports.scrapeFromPdf = (media_id,phone_number_id, from) => {
  
  responseMessage(phone_number_id, from,"Processing the PDF...");
  
  const summarizePdf = async (pdf) => {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: pdf,
          temperature: 0,
          max_tokens: 2500,
        });
    
        responseMessage(phone_number_id, from, "The summary of this pdf is\n" + response.data.choices[0].text);
        var data = new FormData();
        var config = {
          method: 'delete',
          url: `https://graph.facebook.com/v15.0/${media_id}/?phone_number_id=${phone_number_id}`,
          headers: { 
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 
            ...data.getHeaders()
          },
          data : data
        };
        axios(config)
        .then(function (response) {
          console.log("SUCCESSFULLY DELETED");
        })
        .catch(function (error) {
          console.log("ERROR IN DELETING MEDIA");
        });
        console.log("Summary sent");
  };
  
  
  
  let config_for_url = {
    method: 'get',
    url: `https://graph.facebook.com/v15.0/${media_id}?phone_number_id=104573222548514`,
    headers: { 
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    }
  };
  axios(config_for_url)
  .then((response1) => {
    let config_for_download = {
      
      method: 'get',
      url: response1.data.url,
      headers: { 
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
      },
      responseType: 'arraybuffer'

    }
    axios(config_for_download)
    .then(function (response2) {
      
      pdf(response2.data).then(function(data) {
        responseMessage(phone_number_id, from,"Preparing the summary for you...");
        summarizePdf(data.text +"\nSummarise each component of the above text extracted from pdf with most unique and helpful points, into a numbered list of key points with a line gap between each point.");         
      });

    })
    .catch(function (error) {
      console.log("ERROR IN DOWNLOADING");

    });
    
  })
  .catch(function (error) {
    console.log("ERROR IN  GETTING URL")
  });
}
