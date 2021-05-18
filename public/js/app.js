window.addEventListener("load", () => {
  const app = document.querySelector("#app");

  function clearQuestion() {
    while (app.firstChild) {
      app.removeChild(app.lastChild);
    }
  }

  function makeQuestion(obj) {
    const questionDiv = document.createElement("DIV");
    const choicesDiv = document.createElement("DIV");
    const {color, title, message, choices} = obj;
    let submitBtn;
    if(choices) {
      submitBtn = document.createElement("BUTTON");
      const choicesForm = document.createElement("FORM");
      for(let choice of choices) {
        const label = document.createElement9("LABEL");
        const option = document.createElement('INPUT');
        option.setAttribute('type', 'radio');
        option.setAttribute('id','choice');
        label.setAttribute('for', 'choice');
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
      .then((question) => {
        return question;
      })
      .then((question) => {
        clearQuestion();
        makeQuestion(question) ;
      });
    } catch(error) {
      let html = errorTemplate({
        color: 'red',
        title: 'Error',
        message: error
      });
      app.innerHTML = html;
    }
  });
  
  router.add('/exchange', () => {
    let html = exchangeTemplate();
    app.innerHTML = html;
  });
  
  router.add('/historical', () => {
    let html = historicalTemplate();
    app.innerHTML = html;
  });
  
  // Navigate app to current url
  router.navigateTo(window.location.pathname);
  
   // Highlight Active Menu on Refresh/Page Reload
  const link = document.querySelector(`a[href$='${window.location.pathname}']`);
  link.classList.add('active');
  
  []
  .slice
  .call(document.querySelectorAll('a'), 0)
  .forEach((link, index) => {

        link.addEventListener('click', (event) => {
          // Block browser page load
          event.preventDefault();
      
          // Highlight Active Menu on Click
          const target = document.querySelector(`${event.target.tagName.toLowerCase()}:nth-of-type(${index+1})`);

          []
          .slice
          .call(document.querySelectorAll('a.item'), 0)
          .forEach((item, index, ar) => { item.classList.remove('active') });
          target.classList.add('active');
      
          // Navigate to clicked url
          const href = target.getAttribute('href');
          const path = href.substr(href.lastIndexOf('/'));
          router.navigateTo(path);
        });
    }
  );

})


async function sendPost(event) {
  event.preventDefault();
  //console.log(event);
  const form = document.querySelector("form");
  const data = new FormData(form);
  const formData = [].slice.call(form.elements, 0).reduce((acc, cur) => {
    if(cur.value) {
      acc[cur.name] = cur.value;
    }
    return acc;
  }, {})
  try {
    const posts =  await post('http://localhost:3000/api/posts')(JSON.stringify(formData));
    console.log(posts)
  }
  catch(error) {
    let html = errorTemplate({
      color: 'red',
      title: 'Error',
      message: error
    });
    app.innerHTML = html;
  }
}
