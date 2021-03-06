'use strict';

/*
модуль загрузки data.json,
в котором хранится ассортимент магазина
*/

(function () {
  var MAX_RESPONSE_TIME = 5000;
  var MS_PER_SECOND = 1000;
  var JSON_TYPE = 'json';
  var TIME_UNIT = ' c';
  var OK_STATUS = 200;
  var Url = {
    GET: 'js/data.json'
  };

  function load(onLoad, onError, method, data) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = JSON_TYPE;
    xhr.timeout = MAX_RESPONSE_TIME;
    xhr.addEventListener('load', function () {
      if (xhr.status === OK_STATUS) {
        onLoad(xhr.response);
      } else {
        onError('Cтатус ответа: ' + xhr.status + ' ' + xhr.statusText);
      }
    });
    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });
    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout / MS_PER_SECOND + TIME_UNIT);
    });
    xhr.open(method, Url[method]);
    xhr.send(data);
  }

  window.backend = {
    load: load
  };
})();


/*
модуль загрузки данных ассортимента магазина
*/

(function() {

  let dependencies = {
    backend: window.backend
  };

  dependencies.backend.load(onLoad, onError, 'GET');

  function onLoad(response) {
    sessionStorage.setItem('data', JSON.stringify(response.goods));
  }

  function onError(error) {
    console.log(error);
  }

})();
 // backend

/*
модуль для снятия классов --nojs
*/

(function() {

  let header = document.querySelector('.header');
  let pagewrapper = document.querySelector('.page-wrapper');
  let menubutton = document.querySelector('.menu-button');
  let menu = document.querySelector('.site-menu-list');
  let slideSelector = document.querySelector('.slide__selector');

  if (slideSelector) {
    slideSelector.classList.remove('slide__selector--nojs');
  }

  header.classList.remove('header--nojs');
  pagewrapper.classList.remove('page-wrapper--nojs');
  menubutton.classList.remove('menu-button--nojs');
  menu.classList.remove('site-menu-list--nojs');

})();


/*
модуль для работы кнопки открытия/закрытия меню
*/

(function() {

  let menuButton = document.querySelector('.menu-button');
  let menu = document.querySelector('.site-menu-list');

  function menuToggle() {
    menu.classList.toggle('site-menu-list--open');
    menuButton.classList.toggle('menu-button--menu-open');
  }

  menuButton.addEventListener('click', menuToggle);

  window.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 27 && menuButton.classList.contains('menu-button--menu-open')) {
      evt.preventDefault();
      menuToggle();
    }
  });

})();


/*
модуль вывода сообщения
*/

(function() {

  const MESSAGE_DURATION = 1000;
  const MESSAGE_SHOW_CLASS = 'msg--show';

  let msg = document.querySelector('#msg');
  let msgText;

  if (msg !== null) {
    msgText = msg.querySelector('.msg__text');
  }

  function showMsgBlock(text) {
    msgText.textContent = text;
    msg.classList.add(MESSAGE_SHOW_CLASS);
    setTimeout(function () {
      msg.classList.remove(MESSAGE_SHOW_CLASS);
    }, MESSAGE_DURATION);
  }

  window.message = {
    showMsgBlock: showMsgBlock
  };

})();


/*
модуль взаимодействия с хранилищем sessionStorage,
в котором хранятся данные корзины + ассортимент магазина
*/

(function() {

  const ID_LENGTH = 8;

  function getCartTotalCountFromStorage() {
    return + sessionStorage.getItem('cartTotalCount');
  }

  function getCartTotalPriceFromStorage() {
    return + sessionStorage.getItem('cartTotalPrice');
  }

  function getCartFromStorage() {
    return {
      orders: JSON.parse(sessionStorage.getItem('cartOrders')),
      totalCount: + sessionStorage.getItem('cartTotalCount'),
      totalPrice: + sessionStorage.getItem('cartTotalPrice')
    };
  }

  function setCartInStorage(orders, totalCount, totalPrice) {
    sessionStorage.setItem('cartOrders', JSON.stringify(orders));
    sessionStorage.setItem('cartTotalCount', totalCount);
    sessionStorage.setItem('cartTotalPrice', totalPrice);
  }

  function getPrice(id) {
    let data = JSON.parse(sessionStorage.getItem('data'));
    return + data[id].price;
  }

  // изменяет содержимое корзины в хранилище
  function changeOrderInStorage(order, action) {
    let cart = getCartFromStorage();
    let orders = cart.orders;
    let id = order.slice(0, ID_LENGTH);
    let samplePrice = getPrice(id);
    let orderCount = + orders[order].quantity;
    let orderPrice = + orders[order].price;
    let totalCount = + cart.totalCount;
    let totalPrice = + cart.totalPrice;

    if (action === 'delete') {
      totalCount -= orderCount;
      totalPrice -= orderPrice;
    } else {
      let deltaQuantity = (action === 'minus') ? (- 1) : (+ 1);
      let deltaPrice = (action === 'minus') ? (- samplePrice) : (+ samplePrice);

      totalCount += deltaQuantity;
      totalPrice += deltaPrice;
      orders[order].quantity += deltaQuantity;
      orders[order].price += deltaPrice;
    }

    if (action === 'delete' || orders[order].quantity === 0) {
      delete orders[order];
    }

    setCartInStorage(orders, totalCount, totalPrice);

  }

  // возвращает булево значение - пуст ли данный заказ
  function canOrderBeDeleted(order, action) {
    let cart = getCartFromStorage();
    let orders = cart.orders;
    let orderCount = + orders[order].quantity;
    let newOrderCount = (action === 'minus') ? (orderCount - 1) : (orderCount + 1);
    let orderCanBeDeleted = false;

    if (newOrderCount < 0 || newOrderCount === 0) {
      orderCanBeDeleted = true;
    }

    return orderCanBeDeleted;
  }

  window.storage = {
    getPrice: getPrice,
    canOrderBeDeleted: canOrderBeDeleted,
    setCartInStorage: setCartInStorage,
    getCartFromStorage: getCartFromStorage,
    changeOrderInStorage: changeOrderInStorage,
    getCartTotalCountFromStorage: getCartTotalCountFromStorage,
    getCartTotalPriceFromStorage: getCartTotalPriceFromStorage
  };

})();


/*
модуль для работы с попапом просмотра фото товара
*/

(function() {

  function removeSelectorActiveClass(popup) {
    popup.photosSelector.forEach(function(photo) {
      photo.classList.remove('photo__item--active');
    });
  }

  function changeBigImageToSelected(selector, popup) {
    let bigImg = popup.popupBlock.querySelector('.photo__img-large');
    let bigImgSource = popup.popupBlock.querySelector('.photo__img-large-srcset');
    let bigImgTitle = popup.popupBlock.querySelector('.photo__header');

    selector.classList.add('photo__item--active');
    bigImg.src = selector.dataset.img;
    bigImgSource.srcset = selector.dataset.srcset;
    bigImgTitle.textContent = selector.dataset.alt;
  }

  function renderImgs(popup) {
    let imgs = popup.popupBlock.querySelectorAll('img');
    imgs.forEach(function (img) {
      img.setAttribute('src', img.dataset.img);
    });
  }

  function renderSources(popup) {
    let sources = popup.popupBlock.querySelectorAll('source');
    sources.forEach(function (source) {
      source.setAttribute('srcset', source.dataset.img);
    });
  }

  window.image = {
    removeSelectorActiveClass: removeSelectorActiveClass,
    changeBigImageToSelected: changeBigImageToSelected,
    renderImgs : renderImgs,
    renderSources: renderSources
  };

})();


/*
модуль для вкл/откл скрола страницы
*/

(function() {

  let anchor = document.querySelector('.btn--up');
  let x;
  let y;

  if (anchor !== null) {
    anchor.addEventListener('click', function (evt) {
      evt.preventDefault();
      let blockID = anchor.getAttribute('href');
      document.querySelector('' + blockID).scrollIntoView(
        {
          behavior: 'smooth',
          block: 'start'
        }
      );
    });
  }

  function setXY() {
    x = window.scrollX;
    y = window.scrollY;
  }

  function scrollToXY() {
    window.scrollTo(x, y);
  }

  function disableScrolling() {
    setXY();
    window.addEventListener('scroll', scrollToXY);
  }

  function enableScrolling() {
    window.removeEventListener('scroll', scrollToXY);
  }

  window.scroll = {
    disableScrolling: disableScrolling,
    enableScrolling: enableScrolling
  };

})();


/*
модуль для работы с корзиной магазина
*/

(function() {

  let dependencies = {
    storage: window.storage,
    message: window.message
  };

  const TABLE_HIDE_CLASS ='cart__table--hide';
  const TOTAL_HIDE_CLASS ='cart__total--hide';
  const SUBMIT_BTN_HIDE_CLASS ='cart__btn--order--hide';
  const NOTIFICATION_HIDE_CLASS = 'cart__notification--hide';
  const CENTS_POSTFIX = '.00';
  const BTN_CLASS = 'cart__btn';

  let IconByAction = {
    'delete': 'X',
    'minus': '-',
    'plus': '+'
  };

  let table = document.querySelector('.cart__table');
  let totalBlock = document.querySelector('.cart__total');
  let notification = document.querySelector('.cart__notification');
  let cartSubmitBtn = document.querySelector('.cart__btn--order');
  let cartData = dependencies.storage.getCartFromStorage();
  let cartCounters = document.querySelectorAll('.user-menu-list__counter');
  let totalOutput;

  updateCartCounters();

  if (totalBlock !== null) {
    totalOutput = totalBlock.querySelector('output');
  }

  if (table !== null && cartData.totalCount !== 0) {
    drawCartTable();
    showCartTable();
  }

  function cleanCartTable() {
    let rows = table.children;
    for(let i = 0; i < rows.length; i++) {
      if (rows[i].nodeName !== 'CAPTION' && rows[i].nodeName !== 'THEAD') {
        table.removeChild(rows[i]);
        i--;
      }
    }
  }

  function showCartTable() {
    table.classList.remove(TABLE_HIDE_CLASS);
    totalBlock.classList.remove(TOTAL_HIDE_CLASS);
    cartSubmitBtn.classList.remove(SUBMIT_BTN_HIDE_CLASS);
    notification.classList.add(NOTIFICATION_HIDE_CLASS);
  }

  function hideCartTable() {
    table.classList.add(TABLE_HIDE_CLASS);
    totalBlock.classList.add(TOTAL_HIDE_CLASS);
    cartSubmitBtn.classList.add(SUBMIT_BTN_HIDE_CLASS);
    notification.classList.remove(NOTIFICATION_HIDE_CLASS);
  }

  function removeOrderFromCartTable(order, row) {
    table.removeChild(row);
    dependencies.message.showMsgBlock('Позиция удалена из корзины!');
  }

  function changeQuantityInOrder(order, row, action) {
    let orderCanBeDeleted = dependencies.storage.canOrderBeDeleted(order, action);
    if (orderCanBeDeleted === true || action === 'delete') {
      if (confirm('Удалить позицию из корзины?')) {
        removeOrderFromCartTable(order, row);
      } else {
        return;
      }
    }
    dependencies.storage.changeOrderInStorage(order, action);
    updateCart();
  }

  function updateCart() {
    let totalPrice = dependencies.storage.getCartTotalPriceFromStorage();
    (totalPrice === 0) ? hideCartTable() : drawCartTable();
    updateCartCounters();
  }

  function drawCartTable() {
    cleanCartTable();
    let fragment = document.createDocumentFragment();
    let cartData = dependencies.storage.getCartFromStorage();
    let data = JSON.parse(sessionStorage.getItem('data'));
    let orders = cartData.orders;
    for (let order in orders) {
      if (Object.prototype.hasOwnProperty.call(orders, order)) {
        let id = orders[order].id;
        let row = document.createElement('tr');
        addDataInARow(orders[order].id, row);
        addDataInARow(data[id].name, row);
        addDataInARow(orders[order].size, row);
        addСolorInARow(orders[order].color, row);
        addActionBtnInARow(order, row, 'minus');
        addDataInARow(orders[order].quantity, row);
        addActionBtnInARow(order, row, 'plus');
        addDataInARow(orders[order].price + CENTS_POSTFIX, row);
        addActionBtnInARow(order, row, 'delete');
        fragment.appendChild(row);
      }
    }
    table.appendChild(fragment);
    totalOutput.textContent = cartData.totalPrice + CENTS_POSTFIX;
  }

  function addDataInARow(data, row) {
    let td = document.createElement('td');
    td.textContent = data;
    row.appendChild(td);
  }

  function addСolorInARow(color, row) {
    let td = document.createElement('td');
    td.innerHTML = `<div style="width:15px;height:15px;margin:0 auto;border-radius:50%;" class="color--${color}" title="${color}"></div>`;
    row.appendChild(td);
  }

  function addActionBtnInARow(order, row, action) {
    let td = document.createElement('td');
    if (action !== 'delete') {
      td.style.width = '20px';
    }
    td.style.padding = '0';
    td.innerHTML = `<button class="${BTN_CLASS} ${BTN_CLASS}--${action} btn" title="${action}">${IconByAction[action]}</button>`;
    let btn = td.querySelector('button');
    btn.addEventListener('click', function(evt) {
      evt.preventDefault();
      changeQuantityInOrder(order, row, action);
    });
    row.appendChild(td);
  }

  // обновление общего счетчика товаров в корзине
  function updateCartCounters() {
    let cart = dependencies.storage.getCartFromStorage();
    if (cart.totalCount === 0) {
      cartCounters.forEach(function(cartCounter) {
        cartCounter.classList.remove('user-menu-list__counter--show');
        cartCounter.textContent = cart.totalCount;
      });
      return;
    }
    cartCounters.forEach(function(cartCounter) {
      cartCounter.classList.add('user-menu-list__counter--show');
      cartCounter.textContent = cart.totalCount;
    });
  }

  window.cart = {
    updateCartCounters: updateCartCounters
  };

})();
 // storage, message

/*
модуль для открытия/закрытия попапов
*/

// думаю, можно упростить данный модуль + image

(function() {

  let dependencies = {
    scroll: window.scroll,
    storage: window.storage,
    image: window.image,
    message: window.message,
    cart: window.cart
  };

  const ID_LENGTH = 4;

  let popupOpenBtns = document.querySelectorAll('.popup__open');
  let photoOpenBtns = document.querySelectorAll('.goods__show-btn');
  let popup;

  popupOpenBtns.forEach(function(popupOpenBtn) {
    popupOpenBtn.addEventListener('click', onPopupOpenBtnClick);
  });

  photoOpenBtns.forEach(function(photoOpenBtn) {
    photoOpenBtn.addEventListener('click', onPhotoOpenBtnClick);
  });

  function onPopupOpenBtnClick(evt) {
    openPopupBlock(evt.target.dataset.id);
  }

  function onPhotoOpenBtnClick(evt) {
    dependencies.image.renderImgs(popup);
    dependencies.image.renderSources(popup);
    evt.target.removeEventListener('click', onPhotoOpenBtnClick);
  }

  function closePopupBlock() {
    resetSelectedOptions();
    dependencies.scroll.enableScrolling();
    listeners('remove');
  }

  function openPopupBlock(id) {
    definePopup(id);
    dependencies.scroll.disableScrolling();
    listeners('add');
  }

  function definePopup(id) {
    var popupBlock = document.getElementById(id);

    popup = {
      goodsId: id.slice(ID_LENGTH),
      popupBlock : popupBlock,
      photosSelector : popupBlock.querySelectorAll('.photo__item'),
      popupCloseBtn : popupBlock.querySelector('.popup__close'),
      orderBtn : popupBlock.querySelector('.preorder__order'),
      minusBtn : popupBlock.querySelector('.preorder__btn--minus'),
      plusBtn : popupBlock.querySelector('.preorder__btn--plus'),
      quantityBlock : popupBlock.querySelector('.preorder__input'),
      priceBlock : popupBlock.querySelector('.preorder__price'),
      sizeBlock : popupBlock.querySelector('.preorder__select--sizes'),
      colorBlock : popupBlock.querySelector('.preorder__select--colors')
    };
  }

  function listeners(method) {
    popup.popupBlock.classList[method]('popup--show');
    popup.photosSelector.forEach(function(selector) {
      selector[method+'EventListener']('click', onSelectorClick);
    });
    popup.popupCloseBtn[method+'EventListener']('click', onPopupCloseBtnClick);
    if (popup.orderBtn !== null) {
      popup.orderBtn[method + 'EventListener']('click', addOrderToStorage);
      popup.minusBtn[method + 'EventListener']('click', minusOne);
      popup.plusBtn[method + 'EventListener']('click', plusOne);
      popup.quantityBlock[method + 'EventListener']('change', changePrice);
    }
    window[method + 'EventListener']('keydown', onWindowEscPress);
  }

  function onSelectorClick(evt) {
    dependencies.image.removeSelectorActiveClass(popup);
    dependencies.image.changeBigImageToSelected(evt.target, popup);
  }

  function onPopupCloseBtnClick() {
    closePopupBlock();
  }

  function onWindowEscPress(evt) {
    if (evt.keyCode === 27 && popup.popupBlock.classList.contains('popup--show')) {
      evt.preventDefault();
      closePopupBlock();
    }
    window.removeEventListener('keydown', onWindowEscPress);
  }

  function resetSelectedOptions() {
    if (popup.orderBtn !== null) {
      popup.sizeBlock.selectedIndex = 0;
      popup.colorBlock.selectedIndex = 0;
      popup.quantityBlock.value = 1;
      popup.priceBlock.textContent = dependencies.storage.getPrice(popup.goodsId);
    }
  }

  function changePrice() {
    var price = dependencies.storage.getPrice(popup.orderBtn.dataset.id);
    popup.priceBlock.textContent = price * (+ popup.quantityBlock.value);
  }

  function minusOne() {
    if (+ popup.quantityBlock.value === 0) {
      return;
    }
    popup.quantityBlock.value = + popup.quantityBlock.value - 1;
    changePrice();
  }

  function plusOne() {
    popup.quantityBlock.value = + popup.quantityBlock.value + 1;
    changePrice();
  }

  function addOrderToStorage() {
    var id = popup.orderBtn.dataset.id;
    var size = popup.sizeBlock.value;
    var color = popup.colorBlock.value;
    var quantity = + popup.quantityBlock.value;
    var price = + popup.priceBlock.textContent;
    var key = id+'-'+size+'-'+color;

    if (quantity === 0) {
      dependencies.message.showMsgBlock('Сначала выберите количество товара!');
      return;
    }

    var cart = dependencies.storage.getCartFromStorage();
    var orders = cart.orders || {};
    var totalCount = + cart.totalCount + quantity;
    var totalPrice = + cart.totalPrice + price;

    if (Object.prototype.hasOwnProperty.call(orders, key)) {
      quantity += orders[key].quantity;
      price += orders[key].price;
    }

    orders[key] = {
      id: id,
      size: size,
      color: color,
      quantity: quantity,
      price: price
    };

    dependencies.storage.setCartInStorage(orders, totalCount, totalPrice);

    dependencies.message.showMsgBlock('Товар добавлен в корзину!');
    dependencies.cart.updateCartCounters();
  }

})();
 // scroll, storage, image, message, cart

/*
модуль управления слайдером
*/


(function() {

  const RADIOLABEL_CHECKED_CLASS = 'slide__radiolabel--checked';
  const SLIDE_SHOW_CLASS = 'slide__item--show';
  const SLIDE_INTERVAL = 4000;

  let slides = document.querySelectorAll('.slide__item');
  let radioLabels = document.querySelectorAll('.slide__radiolabel');
  let nextBtn = document.querySelector('.slider__btn-next');
  let previousBtn = document.querySelector('.slider__btn-prev');
  let currentSlideNo = 0;
  let troughLabel = false;
  let slideInterval;

  if (nextBtn !== null && previousBtn !== null) {
    activateSlider();
  }

  function activateSlider() {
    slideInterval = setInterval(goToNextSlide, SLIDE_INTERVAL); //интервал повторения

    nextBtn.addEventListener('click', function() { //при клике на вперед
      troughLabel = false;
      pauseSlideShow();
      goToNextSlide();
    });

    previousBtn.addEventListener('click', function() { // при клике на назад
      troughLabel = false;
      pauseSlideShow();
      goToPreviousSlide();
    });

    radioLabels.forEach(function(label) {
      label.addEventListener('click', function() {
        troughLabel = true;
        pauseSlideShow();
        goToSlide(+ this.getAttribute('data-id'));
      });
    });
  }

  function pauseSlideShow() {
    clearInterval(slideInterval); //очистка интервала повторения
  }

  function goToNextSlide() {
    goToSlide(currentSlideNo + 1);
  }

  function goToPreviousSlide() {
    goToSlide(currentSlideNo - 1);
  }

  function goToSlide(n) {
    radioLabels[currentSlideNo].classList.remove(RADIOLABEL_CHECKED_CLASS);
    slides[currentSlideNo].classList.remove(SLIDE_SHOW_CLASS);
    currentSlideNo = (troughLabel) ? n : (n + slides.length) % slides.length; // текущий слайд -1 или +1
    radioLabels[currentSlideNo].classList.add(RADIOLABEL_CHECKED_CLASS);
    slides[currentSlideNo].classList.add(SLIDE_SHOW_CLASS);
  }

})();



