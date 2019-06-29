
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const ADDRESS = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=';

getCypher();

function getCypher() {
    axios.get(`${ADDRESS}${process.env.TOKEN}`)
        .then(response => {
            return writeToFile('answer.json', JSON.stringify(response.data, null, 2))
        })
        .then(({ status }) => console.log(status))
        .catch(error => {
            console.error(error);
        })
}

function writeToFile(file, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, (error) => {
            console.error(error);
            reject({ status: 'Error, could not write/create file' });
        });
        resolve({ status: `File created with ${data}` });
    });
}
