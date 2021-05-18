TIMEOUT_DEFAULT = 5000;

const get = (url) => {
    let hasTimedOut = false;
    let timeOutFn;
    return new Promise(function(resolve, reject) {

      timeOutFn = setTimeout(()=> {
          hasTimedOut = true;
          reject('API call has timedout');
      }, TIMEOUT_DEFAULT);
  
      fetch(url, {
          headers: {
              Accept: 'application/json'
          }
      }).then(response => { console.log(response)
          clearTimeout(timeOutFn);
          if(!response.ok) {
              throw new Error(`rejected because of http error: ${response.status}`)
          } 
          if(!hasTimedOut) {
              resolve(response.json());            
          }
      }).catch(error => { console.log(1111, error)
          if(hasTimedOut){
              return;
          }
          reject(error);
      })
    }) /* USE TRY and catch with await instead of catch here
    /* BUT MUST REMEMBER TO USE TRY AND CATCH
     .catch((error)=> {
        console.log(error);
        throw error;
    });*/ 
  }


  const post = (url) => (body) => {
      let timeOutFn;
      let hasTimedOut = false;
      return new Promise(function(resolve, reject) {
        timeOutFn = setTimeout(() => {
            hasTimedOut = true;
            reject('request has timedout')
        }, TIMEOUT_DEFAULT);

        fetch(url, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(response => {
            if(!response.ok) {
                throw new Error (`${response.status}`)
            }
            if(!hasTimedOut) {
                resolve(response.json())
            }
        }).catch((error) => {
            if(hasTimedOut) {
                return;
            }
            reject(error)
        })
      })
  }
