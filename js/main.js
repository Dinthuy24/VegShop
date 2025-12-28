function openLoginModal() {
    let formsg = document.querySelector('.modal.signup-login');
    let container = document.querySelector('.signup-login .modal-container');
    if (formsg) formsg.classList.add('open');
    if (container) container.classList.add('active'); // Active = hiện tab Login
    body.style.overflow = "hidden";
}

function openSignupModal() {
    let formsg = document.querySelector('.modal.signup-login');
    let container = document.querySelector('.signup-login .modal-container');
    if (formsg) formsg.classList.add('open');
    if (container) container.classList.remove('active'); // Remove active = hiện tab Signup
    body.style.overflow = "hidden";
}

let signupLink = document.querySelector('.signup-link');
let loginLink = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');

if (signupLink) {
    signupLink.addEventListener('click', () => {
        container.classList.remove('active');
    });
}

if (loginLink) {
    loginLink.addEventListener('click', () => {
        container.classList.add('active');
    });
}