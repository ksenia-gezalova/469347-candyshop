'use strict';

(function () {
  var basketCards = document.querySelector('.goods__cards');
  var catalogCards = document.querySelector('.catalog__cards');
  var basket = document.querySelector('.goods__card-wrap');
  var headerBasket = document.querySelector('.main-header__basket');
  var basketAmount = basket.querySelector('.goods__total');
  var totalPrice = basketAmount.querySelector('.goods__price');
  var totalAmount = basketAmount.querySelector('.goods__total-counter');
  var price = 0;

  // обновляем количество товара
  var updateAmount = function (id, delta) {
    var itemBasket = window.data.basket[id]['good'];
    var itemCatalog = window.data.catalog[id]['good'];
    var card = window.data.basket[id]['card'];
    itemBasket.amount += delta;
    itemCatalog.amount -= delta;
    var amount = card.querySelector('.card-order__count');
    amount.value = itemBasket.amount;
  };

  // обновляем количество добавленного в избранное
  var updateSelectedAmount = function (items, arr) {
    var selectedGoods = [];
    Object.keys(items).forEach(function (id) {
      if (items[id]['good'].isFavorite) {
        selectedGoods.push(items[id].good);
      }
    });
    arr.forEach(function (_, i) {
      var current = window.data.itemsLabel[i].innerText;
      if (current === 'Только избранное') {
        window.data.itemsCount[i].textContent =
          '(' + selectedGoods.length + ')';
      }
    });
  };

  // обновляем количество товара в наличии
  var updateStockAmount = function (items, arr) {
    var availableGoods = [];
    Object.keys(items).forEach(function (id) {
      if (items[id]['good'].amount > 0) {
        availableGoods.push(items[id].good);
      }
    });
    arr.forEach(function (_, i) {
      var current = window.data.itemsLabel[i].innerText;
      if (current === 'В наличии') {
        window.data.itemsCount[i].textContent =
          '(' + availableGoods.length + ')';
      }
    });
  };

  // хэндлер для кнопок карточки в каталоге
  var cardClickHandler = function (evt) {
    evt.preventDefault();
    var target = evt.target;
    // находим ближайшего родителя к элементу на котором произошло событие
    var good = target.closest('.catalog__card');
    // достаем айдишник товара
    if (!good) {
      return;
    }
    var goodId = good.getAttribute('data-id');

    if (target.classList.contains('card__btn-composition')) {
      // обращаемся к определенному товару и его объекту в DOM
      good
        .querySelector('.card__composition')
        .classList.toggle('card__composition--hidden');
    } else if (target.classList.contains('card__btn-favorite')) {
      if (target.classList.contains('card__btn-favorite--selected')) {
        target.classList.remove('card__btn-favorite--selected');
        // добавляем флаг
        window.data.catalog[goodId]['good'].isFavorite = false;
        // обновляем количество избранного товара
        updateSelectedAmount(window.data.catalog, window.data.itemsLabel);
        target.blur();
      } else {
        target.classList.add('card__btn-favorite--selected');
        // добавляем флаг
        window.data.catalog[goodId]['good'].isFavorite = true;
        // обновляем количество избранного товара
        updateSelectedAmount(window.data.catalog, window.data.itemsLabel);
        target.blur();
      }
    } else if (target.classList.contains('card__btn')) {
      var catalogItem = window.data.catalog[goodId];
      if (catalogItem['good'].amount === 0) {
        // обновляем количество товара в наличии
        updateStockAmount(window.data.catalog, window.data.itemsLabel);
        target.blur();
        return;
      }
      if (window.data.basket[goodId]) {
        // обновляем количество товаров в объектах каталога и корзины
        updateAmount(goodId, 1);
        // обновляем количество товара в наличии
        updateStockAmount(window.data.catalog, window.data.itemsLabel);
        price += window.data.catalog[goodId]['good']['price'];
        totalPrice.innerText = price + '₽';
        target.blur();
      } else {
        // добавляем товар корзину
        addToBasket(goodId);
        updateAmount(goodId, 1);
        updateStockAmount(window.data.catalog, window.data.itemsLabel);
        target.blur();
      }
      // меняем корзину в шапке в зависимости от количества добавленного товара
      if (headerBasket.innerText === 'В корзине ничего нет') {
        headerBasket.innerText = 1;
        totalAmount.innerText = 1;
      } else {
        totalAmount.textContent++;
        headerBasket.textContent++;
      }
      // отслеживаем актуальный класс в зависимости от товара, который еще остался
      window.data.addClassNameByGoodAvailability(
          catalogItem['card'],
          catalogItem['good']
      );
    }
  };

  // функция добавления товара в корзину
  var addToBasket = function (id) {
    var good = Object.assign({}, window.data.catalog[id]['good']);
    good.amount = 0;
    var card = window.data.createBasketDomCard(good);
    card.setAttribute('data-id', id);
    basketCards.classList.remove('goods__cards--empty');
    basketAmount.classList.remove('visually-hidden');
    basketCards.querySelector('.goods__card-empty').style.display = 'none';
    basketCards.appendChild(card);
    window.data.basket[id] = {good: good, card: card};
    price += window.data.basket[id]['good']['price'];
    totalPrice.innerText = price + '₽';
  };

  // хэндлер для кнопок карточек корзины
  var btnBasketHandler = function (evt) {
    evt.preventDefault();
    var target = evt.target;
    // находим ближайшего родителя к элементу на котором произошло событие
    var good = target.closest('.card-order');

    if (!good) {
      return;
    }
    // достаем айдишник товара
    var goodId = good.getAttribute('data-id');
    var currentGood = window.data.basket[goodId];
    var catalogItem = window.data.catalog[goodId];
    if (target.classList.contains('card-order__close')) {
      // удаляем элемент из корзины и добавляем значение, которое было в корзине объекту каталога
      catalogItem['good'].amount += currentGood['good'].amount;
      // удаляем количество элементов в хэдере корзины на количество товара, убранного из корзины
      headerBasket.textContent -= currentGood['good'].amount;
      totalAmount.textContent -= currentGood['good'].amount;
      price -= currentGood['good'].price * currentGood['good'].amount;
      totalPrice.innerText = price + '₽';
      // убираем элементы
      basketCards.removeChild(currentGood['card']);
      // обновляем количество товара в наличии
      updateStockAmount(window.data.catalog, window.data.itemsLabel);
      window.data.addClassNameByGoodAvailability(
          catalogItem['card'],
          catalogItem['good']
      );
      // удаляем объект
      delete window.data.basket[goodId];
    } else if (
      target.classList.contains('card-order__btn--increase') &&
      catalogItem['good'].amount > 0
    ) {
      currentGood['card'].querySelector('.card-order__count').value++;
      headerBasket.textContent++;
      totalAmount.textContent++;
      price += currentGood['good'].price;
      totalPrice.innerText = price + '₽';
      updateAmount(goodId, 1);
      updateStockAmount(window.data.catalog, window.data.itemsLabel);
      window.data.addClassNameByGoodAvailability(
          catalogItem['card'],
          catalogItem['good']
      );
    } else if (target.classList.contains('card-order__btn--decrease')) {
      currentGood['card'].querySelector('.card-order__count').value--;
      headerBasket.textContent--;
      totalAmount.textContent--;
      price -= currentGood['good'].price;
      totalPrice.innerText = price + '₽';
      updateAmount(goodId, -1);
      updateStockAmount(window.data.catalog, window.data.itemsLabel);
      if (
        currentGood['card'].querySelector('.card-order__count').value === '0'
      ) {
        basketCards.removeChild(currentGood['card']);
        delete window.data.basket[goodId];
      }
      window.data.addClassNameByGoodAvailability(
          catalogItem['card'],
          catalogItem['good']
      );
    }
    if (Object.keys(window.data.basket).length === 0) {
      basketCards.classList.add('goods__cards--empty');
      basketCards.querySelector('.goods__card-empty').style.display = 'block';
      basketAmount.classList.add('visually-hidden');
      headerBasket.innerText = 'В корзине ничего нет';
      price = 0;
    }
  };

  catalogCards.addEventListener('click', cardClickHandler);
  basket.addEventListener('click', btnBasketHandler);

  window.catalog = {
    cardClickHandler: cardClickHandler,
    btnBasketHandler: btnBasketHandler
  };
})();
