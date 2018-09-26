'use strict';

(function () {
  var basketCards = document.querySelector('.goods__cards');
  var catalogCards = document.querySelector('.catalog__cards');


  var cardClickHandler = function (evt, element) {
    evt.preventDefault();
    var target = evt.target;
    if (target.classList.contains('card__btn-composition')) {
      window.data.catalog[element].querySelector('.card__composition').classList.toggle('card__composition--hidden');
    } else if (target.classList.contains('card__btn-favorite')) {
      target.classList.toggle('card__btn-favorite--selected');
      target.blur();
    } else if (target.classList.contains('card__btn')) {
      addCardToBasket();
    }
    /* catalogCards.removeEventListener('click', function (evtClick) {
      cardClickHandler(evtClick);
    }); */
    console.log(evt.target.getAttribute['data-id']);
  };
  catalogCards.addEventListener('click', function (evtClick, elem) {
    cardClickHandler(evtClick, window.data.catalog[elem]);
  });

  console.log(window.data.catalog);


  var btnBasketHandler = function (evt, element) {
    evt.preventDefault();
    var target = evt.target;
    if (target.classList.contains('card-order__close')) {
      basketCards.removeChild(element);
      basketCards.classList.add('goods__cards--empty');
      basketCards.querySelector('.goods__card-empty').style.display = 'block';
    } else if (target.classList.contains('card-order__btn--increase')) {
      element.querySelector('.card-order__count').value++;
    } else if (target.classList.contains('card-order__btn--decrease')) {
      element.querySelector('.card-order__count').value--;
      if (element.querySelector('.card-order__count').value === '0') {
        basketCards.removeChild(element);
        basketCards.classList.add('goods__cards--empty');
        basketCards.querySelector('.goods__card-empty').style.display = 'block';
      }
    }
  };

  window.catalog = {
    cardClickHandler: cardClickHandler
  };
})();
