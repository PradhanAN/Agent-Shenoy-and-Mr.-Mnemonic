const { Configuration, OpenAIApi } = require("openai");
const {responseMessage} = require("./responses");

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_APIKEY,
});
const openai = new OpenAIApi(configuration);


const gpt = async (query,phone_number_id, from) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: query,
        temperature: 0,
        max_tokens: 2500,
    });
  console.log("RESPONSE RECEIVED FROM CHATGPT");
    
    // responseGPT(phone_number_id, from, response);
    responseMessage(phone_number_id, from,response.data.choices[0].text);
    console.log("Summary sent");
    
}


exports.chat = (query,phone_number_id,from) => {
  
  console.log("INSIDE CHAT FUNCTION");
  gpt(query,phone_number_id,from);
  
}
