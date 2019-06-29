
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const ADDRESS_GET_FILE = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=';
const ADDRESS_SEND_FILE = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=';
const FILE = 'answer.json';

const main = async () => {
  try {
    const data = await getCypher();
    await writeToFile(FILE, data);

    const answer = await readFromFile(FILE);
    const { cifrado, numero_casas } = answer;
    answer.decifrado = ceasarCypherSolver(cifrado, numero_casas);
    answer.resumo_criptografico = createSHA1Hash(answer.decifrado);
    await writeToFile(FILE, answer);

    sendFile();

  } catch (error) {
    console.error(error);
  }
}
main();

function sendFile() {

  const formData = new FormData();
  formData.append('answer', fs.createReadStream(FILE));
  const formHeaders = formData.getHeaders();

  axios.post(`${ADDRESS_SEND_FILE}${process.env.TOKEN}`, formData, {
    headers: {
      ...formHeaders,
    },
  })
    .then(response => console.log(response.data))
    .catch(error => {
      console.error(error)
      console.log(error.data)
    })
}


function getCypher() {
  return new Promise((resolve, reject) => {
    axios.get(`${ADDRESS_GET_FILE}${process.env.TOKEN}`)
      .then(response => resolve(response.data))
      .catch(error => reject(console.error(error)))
  });
}

function readFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE, (error, data) => {
      if (error) {
        console.error('Something went wrong trying to read the file')
        reject(error);
      }
      return resolve(JSON.parse(data));
    });
  });
}

function writeToFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(data, null, '\t'), (error) => {
      console.error(error);
      reject({ status: 'Error, could not write/create file' });
    });
    resolve({ status: `File created with :\n${data}` });
  });
}

function ceasarCypherSolver(text, shift) {

  const lowerCase = { start: 97, end: 122 };
  const alphabetSize = lowerCase.end - lowerCase.start;

  const arrOfCharCodes = [];
  for (letter of text) {
    const letterCode = letter.charCodeAt(0);

    if (letterCode < lowerCase.start || letterCode > lowerCase.end) {
      arrOfCharCodes.push(letterCode);
      continue;
    }

    let letterCodePlusShift = letterCode - shift;

    if (letterCodePlusShift > lowerCase.end) {
      letterCodePlusShift -= alphabetSize;
    } else if (letterCodePlusShift < lowerCase.start) {
      letterCodePlusShift += alphabetSize;
    }

    arrOfCharCodes.push(letterCodePlusShift);
  }
  return String.fromCharCode(...arrOfCharCodes);
}

function createSHA1Hash(text) {
  const sha1Creator = crypto.createHash('sha1');
  sha1Creator.update(text);
  return sha1Creator.digest('hex');
}