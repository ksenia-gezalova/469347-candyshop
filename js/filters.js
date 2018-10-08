'use strict';

(function () {
  var MIN_PRICE = 0;
  var MAX_PRICE = 235;
  var sidebar = document.querySelector('.catalog__sidebar');
  var range = document.querySelector('.range');
  var rangeLine = document.querySelector('.range__filter');
  var rangeFill = range.querySelector('.range__fill-line');
  var rangeRight = range.querySelector('.range__btn--right');
  var rangeLeft = range.querySelector('.range__btn--left');
  var rangeMax = range.querySelector('.range__price--max');
  var rangeMin = range.querySelector('.range__price--min');
  var rangeCount = range.querySelector('.range__count');

  var catalogCards = document.querySelector('.catalog__cards');
  var inputsFilter = sidebar.querySelectorAll('input');

  var fragment = document.createDocumentFragment();

  var activeFilters = {
    kind: [],
    facts: [],
    price: []
  };

  var MAX = 1;
  var MIN = 0;

  var init = function () {
    rangeMax.textContent = MAX_PRICE;
    rangeMin.textContent = MIN_PRICE;
    rangeFill.style.right = MIN_PRICE + 'px';
    rangeFill.style.left = MIN_PRICE + 'px';
    rangeRight.style.left = MAX_PRICE + 'px';
    rangeLeft.style.left = MIN_PRICE + 'px';
  };

  var uncheckedInput = function (items) {
    items.forEach(function (item) {
      item.checked = false;
    });
  };

  // удаление всех карточек
  var removeItems = function () {
    while (catalogCards.firstChild) {
      catalogCards.removeChild(catalogCards.firstChild);
    }
  };

  var resetFilters = function () {
    activeFilters.kind = [];
    activeFilters.facts = [];
    activeFilters.price = [];
    init();
  };

  // функция показа блока с пустым значением примененных фильтров
  var showEmptyFilters = function () {
    var notFound = document.querySelector('#empty-filters').content.querySelector('.catalog__empty-filter').cloneNode(true);
    var btnSubmit = notFound.querySelector('.catalog__show-all');
    removeItems();
    catalogCards.appendChild(notFound);
    // uncheckedInput(inputsFilter);

    btnSubmit.addEventListener('click', function (evt) {
      evt.preventDefault();
      showAll(window.data.catalog);
    });
  };

  // функция движения ползунка слайдера
  var pinMove = function (elem) {
    elem.addEventListener('mousedown', function (evt) {
      evt.preventDefault();
      // запоминаем начальные координаты передвигаемого пина
      var startCoords = {
        x: evt.clientX,
      };
      // создаем функцию отслеживания передвижения мышки
      var onMouseMove = function (moveEvt) {
        moveEvt.preventDefault();

        // координаты передвижения мышки
        var shift = {
          x: startCoords.x - moveEvt.clientX,
        };

        startCoords = {
          x: moveEvt.clientX,
        };
        // находим динамическое положение пина
        var newLeft = elem.offsetLeft - shift.x;
        // находим правую границу слайдера
        var rightEdge = rangeLine.offsetWidth - elem.offsetWidth;
        // если курсор вышел за левую границу слайдера
        if (newLeft < 0) {
          newLeft = 0;
        } else if (newLeft > rightEdge) {
          // если курсор вышел за правую границу слайдера
          newLeft = rightEdge;
        }
        // отрисовываем передвижение
        elem.style.left = newLeft + 'px';

        // отрисовка линии отдельно для левого пина и отдельно для правого
        if (elem.classList.contains('range__btn--left')) {
          rangeFill.style.left = newLeft + 'px';
          // если левый пин заходит за правый
          if (rangeRight.offsetLeft < newLeft) {
            newLeft = rangeRight.offsetLeft;
            elem.style.left = newLeft + 'px';
            rangeMin.textContent = newLeft;
            return;
          }
          // динамическое изменение цены
          rangeMin.textContent = newLeft;
        } else if (elem.classList.contains('range__btn--right')) {
          rangeFill.style.right = (rangeLine.offsetWidth - elem.offsetWidth - newLeft) + 'px';
          // если правый пин заходит за левый
          if (rangeLeft.offsetLeft > newLeft) {
            newLeft = rangeLeft.offsetLeft;
            elem.style.left = newLeft + 'px';
            rangeMax.textContent = newLeft;
            return;
          }
          // динамическое изменение цены
          rangeMax.textContent = newLeft;
        }

        filterByPriceSlider(evt, window.data.catalog);
      };
      // снимаем обработчики при отпускании кнопки мыши
      var onMouseUp = function (upEvt) {
        upEvt.preventDefault();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      // добавляем обрботчики на весь документ
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

    });
  };

  var addCardToFragment = function (good, frag) {
    var card = window.data.createDomCard(good);
    frag.appendChild(card);
  };

  // функция переключения состояния у инпутов
  var setCheckedOnFilter = function (tag) {
    var parent = tag.closest('.input-btn');
    var input = parent.querySelector('.input-btn__input');
    if (input.checked) {
      input.checked = false;
    } else {
      input.checked = true;
    }
  };

  // трансформируем передаваемый таргет в ключ объекта nutritionFacts
  var getTransformedFact = function (fact) {
    if (fact === 'Без сахара') {
      return 'sugar';
    } else if (fact === 'Вегетарианское') {
      return 'vegetarian';
    } else if (fact === 'Безглютеновое') {
      return 'gluten';
    } return '';
  };

  // проверка существует ли фильтрафия по факту в массиве с фильтрами
  var checkIfExistInFacts = function (currentFacts) {
    var isGlutenActive = activeFilters.facts.indexOf('gluten') !== -1;
    var isSugarActive = activeFilters.facts.indexOf('sugar') !== -1;
    var isVeganActive = activeFilters.facts.indexOf('vegetarian') !== -1;
    var gluten = isGlutenActive && !currentFacts.gluten;
    var sugar = isSugarActive && !currentFacts.sugar;
    var vegan = isVeganActive && currentFacts.vegetarian;
    return (
      (!isGlutenActive || gluten) &&
      (!isSugarActive || sugar) &&
      (!isVeganActive || vegan)
    );
  };

  // применение фильтров
  var applyFilters = function (items) {
    var current;
    Object.keys(items)
    .forEach(function (id) {
      current = items[id].good;
      // фильтр по типу пуст если длина массива с фильтрами по типу равна 0
      var isEmptyKind = activeFilters.kind.length === 0;
      // фильтр по типу существует, если он не пуст и в нем есть текущий фильтр по типу
      var isExistInKind = !isEmptyKind && activeFilters.kind.indexOf(current.kind) !== -1;

      var isEmptyFacts = activeFilters.facts.length === 0;
      var isExistInFacts = !isEmptyFacts && checkIfExistInFacts(current.nutritionFacts);

      var isEmptyPrice = activeFilters.price.length === 0;
      var isExistPrice = !isEmptyPrice && (current.price <= activeFilters.price[MAX] && current.price >= activeFilters.price[MIN]);

      if ((isEmptyKind || isExistInKind) && (isEmptyFacts || isExistInFacts) && (isEmptyPrice || isExistPrice)
      ) {
        /* console.log('current', current);
        console.log('_________________________________'); */
        addCardToFragment(current, fragment);
      }
    });
    catalogCards.appendChild(fragment);
    if ((catalogCards.querySelectorAll('.catalog__card')).length === 0) {
      showEmptyFilters();
    }
  };

  // фильтр по типу продукта
  var filterByKind = window.utils.debounce(function (evt, items) {
    var target = evt.target.innerText;
    setCheckedOnFilter(evt.target);
    // если в фильтрах по типу нет ни одного фильтра, добавляем текущий
    if (activeFilters.kind.length === 0) {
      activeFilters.kind.push(target);
    } else if (activeFilters.kind.indexOf(target) !== -1 && activeFilters.kind.length === 1) {
      // если в фильтрах по типу есть таргет и он единственный в массиве, очищаем массив
      activeFilters.kind = [];
    } else if (activeFilters.kind.indexOf(target) !== -1 && activeFilters.kind.length > 1) {
      // если в фильтрах есть таргет и длина массива больше 1, удаляем таргет из фильтров
      activeFilters.kind = activeFilters.kind.filter(function (item) {
        return item !== target;
      });
    } else if (activeFilters.kind.indexOf(target) === -1 && activeFilters.kind.length > 0) {
      // если в фильтрах нет таргета, и длина массива с фильтрами больше 0, добавляем таргет в фильтры
      activeFilters.kind.push(target);
    }
    removeItems();
    applyFilters(items, target);
  });

  // фильтр по сахару, глютену и вегетарианству
  var filterByFact = window.utils.debounce(function (evt, items) {
    var target = getTransformedFact(evt.target.innerText);
    setCheckedOnFilter(evt.target);

    // если фильтр по фактам пуст добавляем таргет в фильтры
    if (activeFilters.facts.length === 0) {
      activeFilters.facts.push(target);
    } else if (activeFilters.facts.indexOf(target) !== -1 && activeFilters.facts.length === 1) {
      // если таргет есть в фильтрах и длина массива равна 1, очищаем массив
      activeFilters.facts = [];
    } else if (activeFilters.facts.indexOf(target) !== -1 && activeFilters.facts.length > 1) {
      // если таргет есть в фильтрах и длина массивы больше 1, удаляем таргетный фильтр
      activeFilters.facts = activeFilters.facts.filter(function (item) {
        return item !== target;
      });
    } else if (activeFilters.facts.indexOf(target) === -1 && activeFilters.facts.length > 0) {
      // если таргета в фильтрах нет и длина массива больше 0, добавляем таргетный фильтр
      activeFilters.facts.push(target);
    }
    removeItems();
    applyFilters(items, target);
  });

  // фильтр по наличию
  var filterByAvailability = window.utils.debounce(function (evt, items) {
    removeItems();
    uncheckedInput(inputsFilter);
    setCheckedOnFilter(evt.target);
    activeFilters.kind = [];
    activeFilters.facts = [];
    Object.keys(items)
    .forEach(function (id) {
      if (items[id].good.amount > 0) {
        addCardToFragment(items[id].good, fragment);
      }
    });
    catalogCards.appendChild(fragment);
    if ((catalogCards.querySelectorAll('.catalog__card')).length === 0) {
      showEmptyFilters();
    }
  });

  // фильтр по избранному
  var filterBySelected = window.utils.debounce(function (evt, items) {
    removeItems();
    uncheckedInput(inputsFilter);
    setCheckedOnFilter(evt.target);
    resetFilters();
    Object.keys(items)
    .forEach(function (id) {
      if (items[id].good.isFavorite) {
        addCardToFragment(items[id].good, fragment);
      }
    });
    catalogCards.appendChild(fragment);
    if ((catalogCards.querySelectorAll('.catalog__card')).length === 0) {
      showEmptyFilters();
    }
  });

  // фильтр "показать все"
  var showAll = window.utils.debounce(function (items) {
    removeItems();
    uncheckedInput(inputsFilter);
    resetFilters();
    Object.keys(items)
    .forEach(function (id) {
      addCardToFragment(items[id].good, fragment);
    });
    catalogCards.appendChild(fragment);
  });

  var compareMax = function (a, b) {
    if (a.price > b.price) {
      return -1;
    } else if (a.price < b.price) {
      return 1;
    }
    return 0;
  };

  var compareMin = function (a, b) {
    if (a.price < b.price) {
      return -1;
    } else if (a.price > b.price) {
      return 1;
    }
    return 0;
  };

  var compareRating = function (a, b) {
    if (a.rating.value > b.rating.value) {
      return -1;
    } else if (a.rating.value < b.rating.value) {
      return 1;
    } else if (a.rating.value === b.rating.value && a.rating.number > b.rating.number) {
      return -1;
    } else if (a.rating.value === b.rating.value && a.rating.number < b.rating.number) {
      return 1;
    }
    return 0;
  };

  // фильтр по цене
  var filterByPrice = window.utils.debounce(function (items, value) {
    var priceArr = [];
    removeItems();
    uncheckedInput(inputsFilter);
    Object.keys(items)
    .forEach(function (id) {
      priceArr.push(items[id].good);
    });
    switch (value) {
      case 'max': priceArr.sort(compareMax);
        break;
      case 'min': priceArr.sort(compareMin);
        break;
    }
    priceArr.forEach(function (_, i) {

      addCardToFragment(priceArr[i], fragment);
    });
    catalogCards.appendChild(fragment);
  });

  // фильтр по популярности
  var filterByPopular = window.utils.debounce(function (evt, items) {
    var ratingArr = [];
    removeItems();
    uncheckedInput(inputsFilter);
    Object.keys(items)
    .forEach(function (id) {
      ratingArr.push(items[id].good);
    });
    ratingArr.sort(compareRating);
    ratingArr.forEach(function (_, i) {
      addCardToFragment(ratingArr[i], fragment);
    });
    catalogCards.appendChild(fragment);
  });

  var filterByPriceSlider = window.utils.debounce(function (evt, items) {
    var target = evt.target;
    // добавляем в массив фильтрации по цене заданный диапазон
    // если массив с ценой пуст
    if (activeFilters.price.length === 0) {
      activeFilters.price.push(rangeMin.innerText, rangeMax.innerText);
    } else if (activeFilters.price.length > 0) {
      // если в массиве есть предыдущая информация по цене, очищаем массив и добавляем новый диапазон
      activeFilters.price = [];
      activeFilters.price.push(rangeMin.innerText, rangeMax.innerText);
    }
    removeItems();
    applyFilters(items, target);
  });

  // хэндлер для работы с фильтрами в баре
  var filterBtnsHandler = function (evt) {
    evt.preventDefault();
    var target = evt.target.innerText;
    if (target === 'Мороженое' || target === 'Газировка' || target === 'Жевательная резинка' || target === 'Мармелад' || target === 'Зефир') {
      filterByKind(evt, window.data.catalog);
    } else if (target === 'Без сахара') {
      filterByFact(evt, window.data.catalog, 'sugar');
    } else if (target === 'Безглютеновое') {
      filterByFact(evt, window.data.catalog, 'gluten');
    } else if (target === 'Вегетарианское') {
      filterByFact(evt, window.data.catalog, 'vegetarian');
    } else if (target === 'В наличии') {
      filterByAvailability(evt, window.data.catalog);
    } else if (target === 'Только избранное') {
      filterBySelected(evt, window.data.catalog);
    } else if (target === 'Показать всё') {
      showAll(window.data.catalog);
    } else if (target === 'Сначала дорогие') {
      filterByPrice(window.data.catalog, 'max');
    } else if (target === 'Сначала дешёвые') {
      filterByPrice(window.data.catalog, 'min');
    } else if (target === 'По рейтингу') {
      filterByPopular(evt, window.data.catalog);
    }
  };

  // показывает количество товаров, подходящих под конкретные фильтры
  var initCountKind = function (labels, inputs, items) {
    labels.forEach(function (_, i) {
      var currentType = labels[i].innerText;
      if (window.data.types[currentType]) {
        inputs[i].textContent = '(' + window.data.types[currentType] + ')';
      }
      if (window.data.nutritionFacts[currentType]) {
        inputs[i].textContent = '(' + window.data.nutritionFacts[currentType] + ')';
      }
      if (currentType === 'Только избранное') {
        inputs[i].textContent = '(' + 0 + ')';
      }
      if (currentType === 'В наличии') {
        inputs[i].textContent = '(' + (Object.keys(items)).length + ')';
      }
    });
    rangeCount.textContent = '(' + (Object.keys(items)).length + ')';
  };

  init();
  pinMove(rangeRight);
  pinMove(rangeLeft);

  sidebar.addEventListener('click', filterBtnsHandler);

  window.filters = {
    initCountKind: initCountKind
  };

})();
