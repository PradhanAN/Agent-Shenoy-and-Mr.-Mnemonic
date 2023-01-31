
const token = process.env.WHATSAPP_TOKEN;

const {createMnemonicAndSend, generateImageAndSend} = require("./controller.js");

const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json());
let state = 0;
let question = "";
let answer = "";

app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.post("/webhook", (req, res) => {
  let body = req.body;
  console.log(state);

  console.log(JSON.stringify(req.body, null, 2));

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
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let option = "";
      try{
        option = req.body.entry[0].changes[0].value.messages[0].interactive
            .list_reply.id;
      }
      catch{
        option = "";
      }
      console.log("option")
      console.log(option);
      
      if(state == 0){
        state = 1;
        axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: from,
          type: "interactive",
          interactive: {
            type: "list",
            body: {
              text: "Select what you want to do",
            },
            action: {
              button : "Choose from here",

              sections: [
                {
                  
                  rows:[
                    {
                      id: "flashCard",
                      title:"Flash Cards"
                    },
                    {
                      id: "mnemonic",
                      title:"Acronym"
                    }
                    
                  ]
                },                
                
              ],
            },
          },
        },
        headers: { "Content-Type": "application/json" },
      });
      }
      else if(state == 10){
        let option =  req.body.entry[0].changes[0].value.messages[0].interactive
            .list_reply.id;
        if(option == "flashCard"){
          state = 3;

        }
        else if(option == "mnemonic"){
          state = 6;
        }
      }
      else if(state == 1 && option == "flashCard"){
        state = 4;
        axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Enter Question:" },
        },
        headers: { "Content-Type": "application/json" },
      });
      }
      else if(state == 4){
        state = 5;
        question = req.body.entry[0].changes[0].value.messages[0].text.body;
        axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Enter the answer:" },
        },
        headers: { "Content-Type": "application/json" },
      });
      }
      else if(state == 5){
        answer = req.body.entry[0].changes[0].value.messages[0].text.body;
        generateImageAndSend(answer, question, phone_number_id, from);
        state = 0;
      }
      else if(state == 1 && option == "mnemonic"){
        state = 7;
        axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Enter the letters:" },
        },
        headers: { "Content-Type": "application/json" },
      });
      }
      else if(state == 7){
        answer = req.body.entry[0].changes[0].value.messages[0].text.body;
        createMnemonicAndSend(answer, phone_number_id, from);
        state = 0;
      }
    }
    res.sendStatus(200);
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
