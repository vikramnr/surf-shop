const clear = document.getElementById('clear-distance')
clear.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('location').value = '';
    document.querySelector('input[tyype=radio]:checked').checked = false;

});