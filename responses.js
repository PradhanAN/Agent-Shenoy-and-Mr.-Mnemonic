const axios = require("axios").default;

const token = process.env.WHATSAPP_TOKEN;

exports.response1 = (phone_number_id,from) => {
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
              text: "Hello! How may I help you?",
            },
            action: {
              button : "Choose from here",

              sections: [
                {
                  
                  rows:[
                    {
                      id: "article",
                      title:"Summarise articles 📰"
                    },
                    {
                      id: "pdf",
                      title:"Summarise pdf 📃"
                    },
                    {
                      id: "video",
                      title:"Summarise YouTube video🎥"
                    },
                    {
                      id:"gpt",
                      title: "Ask me anything 🙃"
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
exports.responseMessage = (phone_number_id,from,body) => {
        axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "text",
            text: {
              preview_url: false,
              body:body,
            },
          },
          headers: { "Content-Type": "application/json" },
        });
  
}



