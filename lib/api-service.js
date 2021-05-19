require('dotenv').config(); // read .env files and write to process.env
const fetch = require('node-fetch');


const get = (url) => () => {
  let hasTimedOut = false;
  let timeOutFn;
  return new Promise(function(resolve, reject) {
    timeOutFn = setTimeout(()=> {
        hasTimedOut = true;
        reject('API call has timedout');
    }, process.env.TIMEOUT);

    fetch(url, {
        headers: {
            Accept: 'application/json'
        }
    }).then(response => {
        clearTimeout(timeOutFn);
        if(!response.ok) {
            throw new Error(`rejected because of http error: ${response.status}`);
        } 
        if(!hasTimedOut) {
            resolve(response.json());            
        }
    }).catch(error => {
        if(hasTimedOut){
            return;
        }
        reject(error);
    });
  });/* use try/catch with await instead of .catch hear
    must remember to use try/catch 
    .catch((error)=> {
      console.log(error);
      throw error;
  });*/
};

const post = (url) => (body) => {
    let hasTimedOut = false;
    let timeoutFn;
    return new Promise(function(resolve, reject) {
        
        timeoutFn = setTimeout( () => {
            hasTimedOut = false;
            reject('Request has timedOut');
        }, process.env.TIMEOUT);

        fetch(url, {
            method: 'POST',
            Accept: 'application/json',
            body
        }).then(response => {
            console.log(response);
            clearTimeout(timeoutFn);
            if(!response.ok) {
                throw new Error(`${response.status}`);
            }
            if(!hasTimedOut) {
                resolve(response.json());
            }
        }).catch(error => {
            if(hasTimedOut) {
                return;
            }
            reject(console.error);
        });
    });

};
module.exports = {
    getQuestions: get('https://raw.githubusercontent.com/fanyak/questionnaire/main/db.json'),
    sendPost: post('https://script.google.com/macros/s/AKfycbwFrd8hgPVTwurWvMbeGtDOK30eUD9d4rv75oXO5ikz6LHthv3BgGjw0nq_f5oYVX16Iw/exec'),
};
