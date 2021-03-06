'use strict';

(function () {
  var success = document.querySelector('.modal--success');
  var error = document.querySelector('.modal--error');
  var form = document.querySelector('#form-order');
  var closeSuccess = success.querySelector('.modal__close');
  var closeError = error.querySelector('.modal__close');
  var order = document.querySelector('#order');

  var formReset = function (element) {
    var inputs = element.querySelectorAll('input');
    inputs.forEach(function (input) {
      input.value = '';
    });
  };

  var closeEscHandlerSuccess = function (evt) {
    window.utils.isEscEvent(evt, closeModalSuccess);
  };

  var closeModalSuccess = function () {
    success.classList.add('modal--hidden');
    document.removeEventListener('keydown', closeEscHandlerSuccess);
  };

  closeSuccess.addEventListener('click', closeModalSuccess);

  closeSuccess.addEventListener('keydown', function (evt) {
    window.utils.isEnterEvent(evt, closeModalSuccess);
  });

  closeSuccess.addEventListener('focus', function (evt) {
    window.utils.isEnterEvent(evt, closeModalSuccess);
  });

  var closeEscHandlerError = function (evt) {
    window.utils.isEscEvent(evt, closeModalError);
  };

  var closeModalError = function () {
    error.classList.add('modal--hidden');
    document.removeEventListener('keydown', closeEscHandlerError);
  };

  closeError.addEventListener('click', closeModalError);

  closeError.addEventListener('keydown', function (evt) {
    window.utils.isEnterEvent(evt, closeModalError);
  });

  closeError.addEventListener('focus', function (evt) {
    window.utils.isEnterEvent(evt, closeModalError);
  });

  form.addEventListener('submit', function (evt) {
    window.backend.saveData(new FormData(form), successHandler, errorHandler);
    evt.preventDefault();
    formReset(order);
  });
  // обработка успешной отправки формы
  var successHandler = function () {
    success.classList.remove('modal--hidden');
    document.addEventListener('keydown', closeEscHandlerSuccess);
  };

  // обработка ошибок
  var errorHandler = function () {
    error.classList.remove('modal--hidden');
    document.addEventListener('keydown', closeEscHandlerError);
  };

  window.order = {
    formReset: formReset
  };

})();
