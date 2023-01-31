"use strict";

const token = process.env.WHATSAPP_TOKEN;
let state = 0;
let userSummary,option_selected;

const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json());

const {chat} = require("./chatWithChatGpt");

const {
  responseMessage,
  response1,
  
  responseExit
} = require("./responses.js");

const {scrapeFromArticle,scrapeFromVideo,scrapeFromPdf} = require('./scrape');

app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.post("/webhook", (req, res) => {
  let body = req.body;

  // console.log(JSON.stringify(req.body, null, 2));

  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from;
      
      if (state === 0  && req.body.entry[0].changes[0].value.messages[0].text && req.body.entry[0].changes[0].value.messages[0].text.body &&
          (req.body.entry[0].changes[0].value.messages[0].text.body==='Hi' || req.body.entry[0].changes[0].value.messages[0].text.body==='hi' ||
           req.body.entry[0].changes[0].value.messages[0].text.body==='HI')) {
        state = state + 1;
        // console.log("inside state 0 if");
        response1(phone_number_id, from);
      } 
      
      
      else if (state === 1){
        state = state + 1;
        option_selected =
          req.body.entry[0].changes[0].value.messages[0].interactive
            .list_reply.id;
        // console.log("inside state 1 if");
        if (option_selected === "article") {
          responseMessage(phone_number_id, from,"Send link to the article to summarize 🔗");
        }
        else if (option_selected === "pdf"){
          responseMessage(phone_number_id, from,"Send me the PDF 📃");
        }
        else if(option_selected === "video"){
          responseMessage(phone_number_id, from,"Send link to the video 🔗");
        }
        else if(option_selected === "gpt"){
          state = 3;

          responseMessage(phone_number_id, from,"You can ask me anything!\nType 'EXIT' to quit");
        }        
      } 
      
      else if (state === 2) {
        
        if(option_selected === "article"){
          let link = req.body.entry[0].changes[0].value.messages[0].text.body;
          scrapeFromArticle(link,phone_number_id,from);
          
        }
        else if(option_selected === "pdf"){
          console.log(req.body.entry[0].changes[0].value.messages[0]);
          let media_id = req.body.entry[0].changes[0].value.messages[0].document.id;
          scrapeFromPdf(media_id,phone_number_id,from);
        }
        else if(option_selected === "video"){
          let link = req.body.entry[0].changes[0].value.messages[0].text.body;
          
          scrapeFromVideo(link,phone_number_id,from);
        }
        state = 0;
        
        
        
      }
      else if(state === 3){
          
            let prompt =  req.body.entry[0].changes[0].value.messages[0].text.body;
            console.log(prompt);
            if(prompt === "EXIT"){
              responseMessage(phone_number_id, from,"Thank you! Have a nice day.\nSend me a 'Hi' message if you want me to do anything else");
              state = 0;
            }
            else{
              chat(prompt,phone_number_id,from);
            }
          
          
        }
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});
