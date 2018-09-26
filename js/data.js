'use strict';

(function () {
  // константы для генерации товаров
  var GOODS_AMOUNT = 26;
  var GOOD_NAMES = [
    'Чесночные сливки',
    'Огуречный педант',
    'Молочная хрюша',
    'Грибной шейк',
    'Баклажановое безумие',
    'Паприколу итальяно',
    'Нинзя-удар васаби',
    'Хитрый баклажан',
    'Горчичный вызов',
    'Кедровая липучка',
    'Корманный портвейн',
    'Чилийский задира',
    'Беконовый взрыв',
    'Арахис vs виноград',
    'Сельдерейная душа',
    'Початок в бутылке',
    'Чернющий мистер чеснок',
    'Раша федераша',
    'Кислая мина',
    'Кукурузное утро',
    'Икорный фуршет',
    'Новогоднее настроение',
    'С пивком потянет',
    'Мисс креветка',
    'Бесконечный взрыв',
    'Невинные винные',
    'Бельгийское пенное',
    'Острый язычок'];

  var NUMBERS = ['one', 'two', 'three', 'four', 'five'];

  var PICTURE_ROUTES = [
    'gum-cedar.jpg',
    'gum-chile.jpg',
    'gum-eggplant.jpg',
    'gum-mustard.jpg',
    'gum-portwine.jpg',
    'gum-wasabi.jpg',
    'ice-cucumber.jpg',
    'ice-eggplant.jpg',
    'ice-garlic.jpg',
    'ice-italian.jpg',
    'ice-mushroom.jpg',
    'ice-pig.jpg',
    'marmalade-beer.jpg',
    'marmalade-caviar.jpg',
    'marmalade-corn.jpg',
    'marmalade-new-year.jpg',
    'marmalade-sour.jpg',
    'marshmallow-bacon.jpg',
    'marshmallow-beer.jpg',
    'marshmallow-shrimp.jpg',
    'marshmallow-spicy.jpg',
    'marshmallow-wine.jpg',
    'soda-bacon.jpg',
    'soda-celery.jpg',
    'soda-cob.jpg',
    'soda-garlic.jpg',
    'soda-peanut-grapes.jpg',
    'soda-russian.jpg'
  ];
  var PATH = 'img/cards/';

  var GOOD_INGRIDIENTS = [
    'молоко',
    'сливки',
    'вода',
    'пищевой краситель',
    'патока',
    'ароматизатор бекона',
    'ароматизатор свинца',
    'ароматизатор дуба, идентичный натуральному',
    'ароматизатор картофеля',
    'лимонная кислота',
    'загуститель',
    'эмульгатор',
    'консервант: сорбат калия',
    'посолочная смесь: соль, нитрит натрия',
    'ксилит',
    'карбамид',
    'вилларибо',
    'виллабаджо'
  ];

  var MIN_VALUE_AMOUNT = 0;
  var MAX_VALUE_AMOUNT = 20;

  var MIN_VALUE_PRICE = 100;
  var MAX_VALUE_PRICE = 1500;

  var MIN_VALUE_WEIGHT = 30;
  var MAX_VALUE_WEIGHT = 300;

  var MIN_RATING_VALUE = 1;
  var MAX_RATING_VALUE = 5;

  var MIN_RATING_NUMBER = 10;
  var MAX_RATING_NUMBER = 900;

  var MIN_ENERGY_VALUE = 70;
  var MAX_ENERGY_VALUE = 500;

  var PRICE_AMOUNT_NODE_INDEX = 0;
  var PRICE_WEIGHT_NODE_INDEX = 2;

  var catalogCards = document.querySelector('.catalog__cards');

  var catalog = {};
  var basket = {};

  // создание массива товаров
  var createArrayOfGoods = function (count) {
    var generateGoods = [];
    for (var j = 0; j < count; j++) {
      generateGoods.push(
          {
            'id': 'good-' + j,
            'name': GOOD_NAMES[j],
            'picture': PATH + window.utils.getRandomElement(PICTURE_ROUTES),
            'amount': window.utils.getRandomValue(MIN_VALUE_AMOUNT, MAX_VALUE_AMOUNT),
            'price': window.utils.getRandomValue(MIN_VALUE_PRICE, MAX_VALUE_PRICE),
            'weight': window.utils.getRandomValue(MIN_VALUE_WEIGHT, MAX_VALUE_WEIGHT),
            'rating': {
              'value': window.utils.getRandomValue(MIN_RATING_VALUE, MAX_RATING_VALUE),
              'number': window.utils.getRandomValue(MIN_RATING_NUMBER, MAX_RATING_NUMBER)},
            'nutritionFacts': {
              'sugar': window.utils.getRandomBoolean(),
              'energy': window.utils.getRandomValue(MIN_ENERGY_VALUE, MAX_ENERGY_VALUE),
              'contents': window.utils.getRandomContent(GOOD_INGRIDIENTS)
            }});
    }
    return generateGoods;
  };

  // добавление класса в зависимости от количества товара
  var addClassNameByGoodAvailability = function (element, good) {
    if (good.amount < 6) {
      element.classList.remove('card--in-stock');
    }
    if (good.amount > 0) {
      element.classList.add('card--little');
    } else {
      element.classList.add('card--soon');
    }
  };

  // добавление класса в зависимости от рейтинга
  var addGoodsRate = function (element, good) {
    if (good.rating.value !== 5) {
      var rating = element.querySelector('.stars__rating');
      rating.classList.remove('stars__rating--five');
      rating.classList.add('stars__rating--' + NUMBERS[good.rating.value]);
    }
  };

  // добавление значения в зависимости от состава товара
  var setNutrition = function (element, good) {
    var nutrition = element.querySelector('.card__characteristic');
    nutrition.textContent = good.nutritionFacts.sugar ? 'Содержит сахар' : 'Без сахара';
  };

  // создание карточки в DOM
  var createDomCard = function (item) {
    var cardTemplate = document.querySelector('#card').content.querySelector('.catalog__card');
    var cardElement = cardTemplate.cloneNode(true);

    addClassNameByGoodAvailability(cardElement, item);

    var picture = cardElement.querySelector('.card__img');
    picture.src = item.picture;
    picture.alt = item.name;

    // добавляем id
    cardElement.id = item.id;

    cardElement.querySelector('.card__title').textContent = item.name;

    var price = cardElement.querySelector('.card__price');
    price.childNodes[PRICE_AMOUNT_NODE_INDEX].textContent = item.price + ' ';
    price.childNodes[PRICE_WEIGHT_NODE_INDEX].textContent = '/ ' + item.weight + ' Г';

    addGoodsRate(cardElement, item);
    cardElement.querySelector('.star__count').textContent = item.rating.number;
    setNutrition(cardElement, item);
    cardElement.querySelector('.card__composition-list').textContent = item.nutritionFacts.contents;

    return cardElement;
  };

  // отрисовка карточек
  var renderCards = function (count) {
    var cardsArray = createArrayOfGoods(count);
    var fragment = document.createDocumentFragment();
    cardsArray.forEach(function (good) {
      var renderCard = createDomCard(good);
      fragment.appendChild(renderCard);
      // объект каталог заполняем двумя коллекциями, срендереными dom элементами, соответствующие объекту карточки
      catalog[good.id] = {'objCard': good, 'domCard': renderCard};
    });
    return fragment;
  };

  var init = function () {
    catalogCards.classList.remove('catalog__cards--load');
    catalogCards.querySelector('.catalog__load').classList.add('visually-hidden');
    catalogCards.appendChild(renderCards(GOODS_AMOUNT));
  };

  init();

  window.data = {
    addClassNameByGoodAvailability: addClassNameByGoodAvailability,
    createDomCard: createDomCard,
    catalog: catalog,
    basket: basket
  };
})();
