window.addEventListener('load', () => {
  const app = document.querySelector('#app');
  const localStorage = window.localStorage;

  let cache, current;

  function clearQuestion() {
    while (app.firstChild) {
      app.removeChild(app.lastChild);
    }
  }

  function makeQuestion(obj) {
    const questionDiv = document.createElement('DIV');
    const choicesDiv = document.createElement('DIV');
    const {color, title, message, choices} = obj;
    let submitBtn;
    if(choices) {
      submitBtn = document.createElement('BUTTON');
      const choicesForm = document.createElement('FORM');
      choicesForm.setAttribute('data-title', title);
      submitBtn.addEventListener('click', sendPost, true);
      choicesForm.appendChild(submitBtn);
      for(let choice of choices) {
        const label = document.createElement('LABEL');
        const option = document.createElement('INPUT');
        option.setAttribute('type', 'radio');
        option.setAttribute('id',`${choice}`);
        option.setAttribute('name', 'choices');
        option.setAttribute('value', `${choice}`);
        label.setAttribute('for', `${choice}`);
        label.appendChild(option);
        choicesForm.appendChild(label);
      }
      choicesDiv.appendChild(choicesForm);
    }
    questionDiv.textContent = title;
    return {questionDiv, choicesDiv};
  }
  // Router Declaration
  const router = new Router({
    mode: 'history',
    page404: (path) => {
      const html = {
        color: 'yellow',
        title: 'Error 404 - Page NOT Found!',
        message: `The path '/${path}' does not exist on this site`,
        choices: ''
      };
      app.innerHTML = html;
    },
  });

  
  router.add('/', async() => {
    try {
      await get('http://localhost:3000/api/questions')
      .then(({questions}) => {     
        clearQuestion();
        const {questionDiv, choicesDiv} =  makeQuestion(questions[current || 0]);
        app.appendChild(questionDiv);
        app.appendChild(choicesDiv);
      });
    } catch(error) {
      console.log(error);
      let html = 'ERROR';
      app.innerHTML = html;
    }
  });
  
  router.add('/1', async() => {
    try {
      await get('http://localhost:3000/api/questions')
      .then(({questions}) => {     
        clearQuestion();
        const {questionDiv, choicesDiv} =  makeQuestion(questions[0]);
        app.appendChild(questionDiv);
        app.appendChild(choicesDiv);
      });
    } catch(error) {
      console.log(error);
      let html = 'ERROR';
      app.innerHTML = html;
    }
  });
  
  router.add('/historical', () => {
    let html ='';
    app.innerHTML = html;
  });

  router.add('/2', async() => {
    try {
      await get('http://localhost:3000/api/questions')
      .then(({questions}) => {     
        clearQuestion();
        const {questionDiv, choicesDiv} =  makeQuestion(questions[1]);
        app.appendChild(questionDiv);
        app.appendChild(choicesDiv);
      });
    } catch(error) {
      console.log(error);
      let html = 'ERROR';
      app.innerHTML = html;
    }
  });
  
  // router.add('/historical', () => {
  //   let html ='';
  //   app.innerHTML = html;
  // });
  
  // Navigate app to current url
  router.navigateTo(window.location.pathname);
  
  //  // Highlight Active Menu on Refresh/Page Reload
  // const link = document.querySelector(`a[href$='${window.location.pathname}']`);
  // link.classList.add('active');
  
  // []
  // .slice
  // .call(document.querySelectorAll('a'), 0)
  // .forEach((link, index) => {

  //       link.addEventListener('click', (event) => {
  //         // Block browser page load
  //         event.preventDefault();
      
  //         // Highlight Active Menu on Click
  //         const target = document.querySelector(`${event.target.tagName.toLowerCase()}:nth-of-type(${index+1})`);

  //         []
  //         .slice
  //         .call(document.querySelectorAll('a.item'), 0)
  //         .forEach((item, index, ar) => { item.classList.remove('active') });
  //         target.classList.add('active');
      
  //         // Navigate to clicked url
  //         const href = target.getAttribute('href');
  //         const path = href.substr(href.lastIndexOf('/'));
  //         router.navigateTo(path);
  //       });
  //   }
  // );

});


async function sendPost(event) {
  event.preventDefault();
  console.log(event);
  const form = document.querySelector('form');
  const data = new FormData(form);
  console.log(data);
  const formData = [].slice.call(form.elements, 0).reduce((acc, cur) => {
    if(cur.checked) {
      acc[cur.name] = cur.value;
    }
    return acc;
  }, {}); 
  formData.title = form.getAttribute('data-title');
  let cache = JSON.parse(localStorage.getItem('questionnaire'));  
  formData.cache = cache && cache.length ? cache.pop() : null;
  try {
    const posts =  await post('http://localhost:3000/api/posts')(JSON.stringify(formData));
    console.log(posts);
    if(!formData.cache){
      localStorage.setItem('questionnaire', JSON.stringify([posts.updates.updatedRange]));
    } else { // we have popped - update storage with an empty array
      localStorage.setItem('questionnaire', JSON.stringify([]));
    }
  }
  catch(error) {
    let html = '';
    app.innerHTML = html;
  }
  
}
