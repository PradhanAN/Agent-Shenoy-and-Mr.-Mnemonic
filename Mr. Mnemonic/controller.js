const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");
const {Headers} = require("node-fetch"); 
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const askMnemoonic = async (text) => {
    text = `Give me one acronymic sentence for ${text}`
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0,
        max_tokens: 2500,
    });
    console.log(response.data.choices[0].text);
    return response.data.choices[0].text;
}
const createImage = async (text) => {
    const response = await openai.createImage({
        prompt: text,
        n: 1,
        size: "1024x1024",
    });
    let image_url = response.data.data[0].url;
    console.log(image_url);
    return image_url;
}

const simplify = async (text) => {
  text = text + "Give me a simplified short answer."
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0,
        max_tokens: 2500,
    });
    console.log(response.data.choices[0].text);
    return response.data.choices[0].text;
} 

var myHeaders = new Headers();
const authTokenWhatsapp = process.env.WHATSAPP_TOKEN;
const clientId = "862fa2f48bfd168ebd67b45ca3f9e5513e97f694ed5e";
// let phoneNumberId = "109929145296447";
// let phoneNumber = "918610141355";
myHeaders.append("Authorization", `Bearer ${authTokenWhatsapp}`);
myHeaders.append("Content-Type", "application/json");

exports.generateImageAndSend = async (text, question, phoneNumberId, phoneNumber) => {
    let requestOptions = {
        method: 'GET',
        headers: {
            Cookie: "RITEKIT=hilrt9gvkms4itd35qqrstd60m"
        },
        redirect: 'follow'
    };
    text = await simplify(text);
    let colours = ["%23FF7EB9", "%23FF65A3", "%237AFCFF", "%23FEFF9C", "%23FFF740"];
    let colour = colours[Math.floor(Math.random() * 5)];
    console.log(colour);

    fetch(`https://api.ritekit.com/v2/image/quote?text=${text}&author=${question}&textFont=Roboto&textColor=%23000000&textFontWeight=200&authorFont=Roboto&authorColor=%23000000&authorFontWeight=400&backgroundColor1=${colour}&backgroundColor2=${colour}&width=1920&height=1080&client_id=${clientId}`, requestOptions)
        .then(response => {
            console.log(response.url);
            var raw = JSON.stringify({
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": phoneNumber,
                "type": "image",
                "image": {
                    "link": response.url
                }
            });

            let x = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch(`https://graph.facebook.com/v15.0/${phoneNumberId}/messages`, x)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
        })
        .catch(error => console.log('error', error));
}


exports.createMnemonicAndSend = async (text, phoneNumberId, phoneNumber) => {
    let mnemonic = await askMnemoonic(text);
    let imageURL = await createImage(mnemonic);

    var raw = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phoneNumber,
        "type": "text",
        "text": {
            "preview_url": false,
            "body": String(mnemonic)
        }
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(`https://graph.facebook.com/v15.0/${phoneNumberId}/messages`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    var raw = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phoneNumber,
        "type": "image",
        "image": {
            "link": imageURL
        }
    });

    let x = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(`https://graph.facebook.com/v15.0/${phoneNumberId}/messages`, x)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

}
// exports.deault = {generateImageAndSend, createMnemonicAndSend};