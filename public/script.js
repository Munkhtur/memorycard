const http = new EasyHTTP();
const cardsContainer = document.getElementById('cards-container');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const currentEl = document.getElementById('current');
const showBtn = document.getElementById('show');
const openModal = document.getElementById('show-modal');
const closeModal = document.getElementById('close-in');
const closeModalUp = document.getElementById('close-up');
const signUpModal = document.getElementById('signup-modal');
const signInModal = document.getElementById('signin-modal');
const hideBtn = document.getElementById('hide');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const addCardBtn = document.getElementById('add-card');
const cleardBtn = document.getElementById('clear');
const addContainer = document.getElementById('add-container');
const filterButton = document.getElementById('own-btn');
const logoutBtn = document.getElementById('logout');

//keep track of current card
let currentActiveCArd = 0;

//Store DOM card
const cardsEl = [];

//Store card data
getCardsData();
cardData = getCardsLocal();

//create all cards
function createCards() {
  cardData.forEach((data, i) => createCard(data, i));
}

// create a single card in DOM
function createCard(data, i) {
  const card = document.createElement('div');
  card.classList.add('card');

  if (i === 0) {
    card.classList.add('active');
  }

  card.innerHTML = `
  <div class="inner-card">
  <div class="inner-card-front">
    <p>${data.question}</p>
    <a href="#" class="delete-card" data-id="${data.id}">
                        <i class="fa fa-remove"></i>
                    </a>
  </div>
  <div class="inner-card-back">
    <p>${data.answer}</p>
  </div>
</div>
  `;
  card.addEventListener('click', (e) => {
    card.classList.toggle('show-answer');

    if (e.target.parentElement.classList.contains('delete-card')) {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).token
        : '';
      const id = e.target.parentElement.dataset.id;
      if (confirm('Are you sure?')) {
        http
          .delete(`/api/cards/${id}`, token)
          .then((data) => {
            if (!data.error) {
              const cards = JSON.parse(localStorage.getItem('cards'));
              const newCards = cards.filter((card) => card.id !== id);
              setCardsData(newCards);
              showAlert(`${data}`, 'alert success');
              location.reload();
            } else {
              showAlert(`${data.error}`, 'alert danger');
            }
          })
          .catch((error) => console.log(error));
      }
    }
  });

  //add to dom cards
  cardsEl.push(card);
  cardsContainer.appendChild(card);
  updateCurrentText();
}

function updateCurrentText() {
  currentEl.innerText = `${currentActiveCArd + 1}/${cardsEl.length}`;
}

function getCardsLocal() {
  const cards = JSON.parse(localStorage.getItem('cards'));
  return cards === null ? [] : cards;
}

//get cards from local storage
function getCardsData() {
  // const cards = JSON.parse(localStorage.getItem('cards'));
  try {
    const cards = http.get('/api/cards').then((data) => {
      setCardsData(data);
    });
    return cards === null ? [] : cards;
  } catch (error) {
    console.log(error);
  }
}

//add card to storage
function setCardsData(cards) {
  localStorage.setItem('cards', JSON.stringify(cards));
  // location.reload();
}

createCards();

//Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (user && user.username) {
    openModal.style.display = 'none';
    showBtn.style.display = 'block';
    logoutBtn.style.display = 'block';
  }
});

filterButton.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const cards = JSON.parse(localStorage.getItem('cards'));
  if (user) {
    const id = user.id;
    const newCards = cards.filter((card) => {
      return card.user.id === id;
    });
    console.log(newCards);
    setCardsData(newCards);
    location.reload();
  }
});

nextBtn.addEventListener('click', () => {
  cardsEl[currentActiveCArd].className = 'card left';

  currentActiveCArd += 1;

  if (currentActiveCArd > cardsEl.length - 1) {
    currentActiveCArd = cardsEl.length - 1;
  }

  cardsEl[currentActiveCArd].className = 'card active';
  updateCurrentText();
});

prevBtn.addEventListener('click', () => {
  cardsEl[currentActiveCArd].className = 'card right';

  currentActiveCArd -= 1;

  if (currentActiveCArd < 0) {
    currentActiveCArd = 0;
  }

  cardsEl[currentActiveCArd].className = 'card active';
  updateCurrentText();
});

//show add container
showBtn.addEventListener('click', () => addContainer.classList.add('show'));
hideBtn.addEventListener('click', () => addContainer.classList.remove('show'));

//add new card
addCardBtn.addEventListener('click', () => {
  const token = JSON.parse(localStorage.getItem('user')).token;
  const question = questionEl.value;
  const answer = answerEl.value;

  if (question.trim() && answer.trim()) {
    if (question.length > 20) {
      showError(questionEl, 'Question should not be more than 20 character');
      return;
    }
    if (answer.length > 200) {
      showError(answerEl, 'Answer should not be more than 200 character');
      return;
    }
    const newCard = { question, answer };
    createCard(newCard);

    questionEl.value = '';
    answerEl.value = '';

    addContainer.classList.remove('show');

    cardData.push(newCard);
    setCardsData(cardData);
    try {
      http
        .post('/api/cards', newCard, token)
        .then((data) => showAlert('New Card Added', 'alert success'));
    } catch (error) {
      console.log(error);
    }
  }
});

//clear cards button
cleardBtn.addEventListener('click', () => {
  localStorage.removeItem('cards');
  cardsContainer.innerHTML = '';
  window.location.reload();
});

// Modal
const signupModalOpen = document.getElementById('signup-open');

signupModalOpen.addEventListener('click', (e) => {
  signUpModal.classList.add('show-modal-up');
  signInModal.classList.remove('show-modal-in');
  e.preventDefault();
});

openModal.addEventListener('click', () =>
  signInModal.classList.add('show-modal-in')
);
closeModal.addEventListener('click', () =>
  signInModal.classList.remove('show-modal-in')
);
closeModalUp.addEventListener('click', () =>
  signUpModal.classList.remove('show-modal-up')
);

window.addEventListener('click', (e) =>
  e.target == signInModal
    ? signInModal.classList.remove('show-modal-in')
    : false
);
window.addEventListener('click', (e) =>
  e.target == signUpModal
    ? signUpModal.classList.remove('show-modal-up')
    : false
);

//user signup
const signUpBtn = document.getElementById('signup-btn');
const userNameUp = document.getElementById('up-username');
const userPasswordUp = document.getElementById('up-password');
const userPasswordUp2 = document.getElementById('up-password2');

const user = getUser();

function getUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user === null ? null : user;
}

//add user to storage
function setUser(newUser) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    localStorage.removeItem('user');
  }
  localStorage.setItem('user', JSON.stringify(newUser));
}

signUpBtn.addEventListener('click', async (e) => {
  const user = {};
  const username = userNameUp.value;
  const password = userPasswordUp.value;
  const password2 = userPasswordUp2.value;
  checkRequired([userNameUp, userPasswordUp, userPasswordUp2]);
  if (!checkLength(userNameUp, 2, 10) || !checkLength(userPasswordUp, 5, 25)) {
    return;
  }
  if (password2 !== password) {
    signUpError(userPasswordUp, 'passwords do not match');
    signUpError(userPasswordUp2, 'passwords do not match');
  }
  if (password === password2 && username != '') {
    user.username = username;
    user.password = password;
    try {
      http.post('/api/users', user).then((data) => {
        addContainer.classList.add('show');
        openModal.style.display = 'none';
        showBtn.style.display = 'block';
        setUser(data);
        signUpModal.classList.remove('show-modal-up');
      });
    } catch (error) {
      console.log(error);
    }
  }
  e.preventDefault();
});

// //user sign in
// let token = null;

// function setToken(newToken) {
//   token = `bearer ${newToken}`;
// }

const signInBtn = document.getElementById('signin-btn');
const userNameIn = document.getElementById('in-username');
const userPasswordin = document.getElementById('in-password');

signInBtn.addEventListener('click', (e) => {
  const username = userNameIn.value;
  const password = userPasswordin.value;
  const user = { username, password };
  checkRequired([userNameIn, userPasswordin]);
  try {
    http.post('/api/login', user).then((data) => {
      console.log(data);
      if (!data.error) {
        setUser(data);
        openModal.style.display = 'none';
        showBtn.style.display = 'block';
        addContainer.classList.add('show');
        signInModal.classList.remove('show-modal-in');
      } else {
        showAlert(`${data.error}`, 'alert danger');
        userNameIn.value = '';
        userPasswordin.value = '';
      }
    });
  } catch (error) {
    console.log(error);
  }

  e.preventDefault();
});

// show alerts

function showAlert(message, className) {
  this.clearAlert();
  const div = document.createElement('div');
  div.className = className;
  div.appendChild(document.createTextNode(message));
  const container = document.querySelector('#alert-div');
  const before = document.querySelector('#alert-before');
  container.insertBefore(div, before);
  setTimeout(() => {
    this.clearAlert();
  }, 3000);
}
function clearAlert() {
  const currentAlrt = document.querySelector('.alert');
  if (currentAlrt) {
    currentAlrt.remove();
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  location.reload();
});

function showError(input, message) {
  const formGroup = input.parentElement;
  const small = formGroup.querySelector('small');
  formGroup.className = 'form-group error';
  small.innerText = message;
}
function signUpError(input, message) {
  const small = input.parentElement.querySelector('small');
  input.className = 'form-input error';
  small.innerText = message;
}

function checkRequired(inputArr) {
  inputArr.forEach((input) => {
    if (input.value.trim() === '') {
      signUpError(input, `Field is required`);
    }
  });
}

function checkLength(input, min, max) {
  if (input.value.length < min) {
    signUpError(input, `Field must be at least ${min} characters`);
    return false;
  } else if (input.value.length > max) {
    signUpError(input, `Field must not be more than ${max} characters`);
    return false;
  } else {
    return true;
  }
}
