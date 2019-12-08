console.log('Connerted')
let newPasswordValue;
let confirmationValue;
const form = document.querySelector('form');
const newPassword = document.getElementById('new-password')
const confirmationPassword = document.getElementById('password-confirmation');
const validationMessage = document.getElementById('validation-message')
const submitBtn = document.getElementById('update-profile')
function validatePassword(message, add, remove) {
    validationMessage.textContent = message;
    validationMessage.classList.add(add);
    validationMessage.classList.remove(remove);
}

confirmationPassword.addEventListener('input', e => {
    e.preventDefault();
    newPasswordValue = newPassword.value;
    confirmationValue = confirmationPassword.value;
    if (newPasswordValue !== confirmationValue) {
        validatePassword('New password & password-confirmation doesn"t match', 'color-red', 'color-green');
        submitBtn.setAttribute('disabled',true);
    } else {
        validatePassword('Passowords match', 'color-green', 'color-red');
        submitBtn.removeAttribute('disabled');
    }
});
