'use strict';

(function () {
  var basketCards = document.querySelector('.goods__cards');
  var catalogCards = document.querySelector('.catalog__cards');


  var cardClickHandler = function (evt) {
    evt.preventDefault();
    var target = evt.target;
    var good = target.closest('.catalog__card');
    var goodId = good.getAttribute('data-id');

    if (target.classList.contains('card__btn-composition')) {
      (window.data.catalog[goodId]['domCard']).querySelector('.card__composition').classList.toggle('card__composition--hidden');
    } else if (target.classList.contains('card__btn-favorite')) {
      target.classList.toggle('card__btn-favorite--selected');
      target.blur();
    } else if (target.classList.contains('card__btn')) {
      var catalogItem = window.data.catalog[goodId];
      if (catalogItem['domCard'].amount === 0) {
        return;
      }
      if (window.data.basket[goodId]) {
        catalogItem['domCard'].amount--;
        target.blur();
      } else {
        addToBasket(catalogItem);
      }
    }
    catalogCards.removeEventListener('click', function (evtClick) {
      cardClickHandler(evtClick);
    });
  };
  var addToBasket = function (item) {
    var addedProduct = Object.assign({}, item['objCard']);
    addedProduct.amount = 1;
    var card = window.data.renderBasketGood(addedProduct);
    basketCards.classList.remove('goods__cards--empty');
    basketCards.querySelector('.goods__card-empty').style.display = 'none';
    basketCards.appendChild(card);
    window.data.basket[item.id] = {'objCard': item, 'domCard': card};
  };
  catalogCards.addEventListener('click', function (evtClick, elem) {
    cardClickHandler(evtClick, window.data.catalog[elem]);
  });


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
