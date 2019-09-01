'use strict';

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


(function() {

  var dependencies = {
    backend: window.backend
  };

  dependencies.backend.load(onLoad, onError, 'GET');

  function onLoad(response) {
    window.data = response.allItems;
  }

  function onError(error) {
    console.log(error);
  }

})();
 // backend

(function() {

  var header = document.querySelector('.header');
  var pagewrapper = document.querySelector('.page-wrapper');
  var menubutton = document.querySelector('.menu-button');
  var menu = document.querySelector('.site-menu-list');
  var slideSelector = document.querySelector('.slide__selector');

  if (slideSelector) {
    slideSelector.classList.remove('slide__selector--nojs');
  }

  header.classList.remove('header--nojs');
  pagewrapper.classList.remove('page-wrapper--nojs');
  menubutton.classList.remove('menu-button--nojs');
  menu.classList.remove('site-menu-list--nojs');

})();


(function() {

  var menubutton = document.querySelector('.menu-button');
  var menu = document.querySelector('.site-menu-list');

  function menuToggle() {
    menu.classList.toggle('site-menu-list--open');
    menubutton.classList.toggle('menu-button--menu-open');
  }

  menubutton.addEventListener('click', menuToggle);

  window.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 27 && menubutton.classList.contains('menu-button--menu-open')) {
      evt.preventDefault();
      menuToggle();
    }
  });

})();


(function() {

  var popup;
  var msg = document.querySelector('#msg');
  var cartCounter = document.querySelector('#cart-counter');

  updateCartIconCount();

  function definePopup() {
    popup = window.popup;
  }

  function changePrice() {
    var price = + window.data[popup.orderBtn.dataset.id].price;
    popup.priceBlock.textContent = price * (+ popup.quantityBlock.value);
  }

  function minusOne() {
    if (+ popup.quantityBlock.value === 0) return;
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

    if (localStorage.getItem('cartCounter') === null) {
      localStorage.setItem('cart', JSON.stringify({}));
      localStorage.setItem('cartCounter', 0);
    }

    var cart = JSON.parse(localStorage.getItem('cart'));
    var totalQuantity = + localStorage.getItem('cartCounter') + quantity;

    if (Object.prototype.hasOwnProperty.call(cart, key)) {
      quantity += cart[key].quantity;
      price += cart[key].price;
    }

    cart[key] = {
      id: id,
      size: size,
      color: color,
      quantity: quantity,
      price: price
    };

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartCounter', totalQuantity);

    console.log(localStorage);

    showMsgBlock();
    updateCartIconCount();
  }

  function updateCartIconCount() {
    if (localStorage.getItem('cartCounter') !== null) {
      cartCounter.classList.add('user-menu-list__counter--show');
    } else {
      cartCounter.classList.remove('user-menu-list__counter--show');
    }

    cartCounter.textContent = localStorage.getItem('cartCounter');
  }

  function showMsgBlock() {
    msg.classList.add('msg--show');
    setTimeout(function() {
      msg.classList.remove('msg--show');
    }, 2000);
  }

  window.storage = {
    definePopup: definePopup,
    addOrderToStorage: addOrderToStorage,
    minusOne: minusOne,
    plusOne: plusOne,
    changePrice: changePrice
  };

})();


(function() {

  var popup;

  function definePopup() {
    popup = window.popup;
  }

  function removePhotoActiveClass() {
    popup.photosSmall.forEach(function(photo) {
      photo.classList.remove('photo__img-small--active');
    });
  }

  function changeImgFromBigToSmall(photo) {
    var phSmallSources = popup.popupBlock.querySelectorAll('.photo__img-small-srcset');
    var phSmallId = photo.getAttribute('data-id');
    var phBig = popup.popupBlock.querySelector('.photo__img-large');
    var phBigSource = popup.popupBlock.querySelector('.photo__img-large-srcset');
    var phBigTitle = popup.popupBlock.querySelector('.photo__header');

    photo.classList.add('photo__img-small--active');
    phBig.src = photo.src;
    phBigSource.srcset = phSmallSources[phSmallId].srcset;
    phBigTitle.textContent = photo.alt;
  }

  function renderImgs() {
    var phImgs = popup.popupBlock.querySelectorAll('img');
    phImgs.forEach(function(img) {
      img.setAttribute('src', img.getAttribute('data-img'));
    });
  }

  function renderSources() {
    var phSources = popup.popupBlock.querySelectorAll('source');
    phSources.forEach(function(source) {
      source.setAttribute('srcset', source.getAttribute('data-img'));
    });
  }

  window.image = {
    definePopup: definePopup,
    removePhotoActiveClass: removePhotoActiveClass,
    changeImgFromBigToSmall: changeImgFromBigToSmall,
    renderImgs: renderImgs,
    renderSources: renderSources
  };

})();


(function() {

  var anchor = document.querySelector('.btn--up');
  var x;
  var y;

  anchor.addEventListener('click', function (evt) {
    evt.preventDefault();
    var blockID = anchor.getAttribute('href');
    document.querySelector('' + blockID).scrollIntoView(
      {
        behavior: 'smooth',
        block: 'start'
      }
    );
  });

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


(function() {

  var dependencies = {
    scroll: window.scroll,
    storage: window.storage,
    image: window.image
  };

  var popupOpenBtns = document.querySelectorAll('.popup__open');
  var photoOpenBtns = document.querySelectorAll('.goods__show-btn');
  var popup;

  popupOpenBtns.forEach(function(popupOpenBtn) {
    popupOpenBtn.addEventListener('click', onPopupOpenBtnClick);
  });

  photoOpenBtns.forEach(function(photoOpenBtn) {
    photoOpenBtn.addEventListener('click', onPhotoOpenBtnClick);
  });

  function onPopupOpenBtnClick(evt) {
    var id = evt.target.getAttribute('data-id');
    openPopupBlock(id);
  }

  function onPhotoOpenBtnClick(evt) {
    dependencies.image.renderImgs();
    dependencies.image.renderSources();
    evt.target.removeEventListener('click', onPhotoOpenBtnClick);
  }

  function closePopupBlock() {
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
      popupBlock : popupBlock,
      photosSmall : popupBlock.querySelectorAll('.photo__img-small'),
      popupCloseBtn : popupBlock.querySelector('.popup__close'),
      orderBtn : popupBlock.querySelector('.preorder__order'),
      minusBtn : popupBlock.querySelector('.preorder__btn--minus'),
      plusBtn : popupBlock.querySelector('.preorder__btn--plus'),
      quantityBlock : popupBlock.querySelector('.preorder__input'),
      priceBlock : popupBlock.querySelector('.preorder__price'),
      sizeBlock : popupBlock.querySelector('.preorder__select--sizes'),
      colorBlock : popupBlock.querySelector('.preorder__select--colors')
    };

    window.popup = popup;
    dependencies.storage.definePopup();
    dependencies.image.definePopup();
  }

  function listeners(method) {
    popup.popupBlock.classList[method]('popup--show');
    popup.photosSmall.forEach(function(smallPhoto) {
      smallPhoto[method+'EventListener']('click', onSmallPhotoClick);
    });
    popup.popupCloseBtn[method+'EventListener']('click', onPopupCloseBtnClick);
    if (popup.orderBtn !== null) {
      popup.orderBtn[method+'EventListener']('click', dependencies.storage.addOrderToStorage);
      popup.minusBtn[method+'EventListener']('click', dependencies.storage.minusOne);
      popup.plusBtn[method+'EventListener']('click', dependencies.storage.plusOne);
      popup.quantityBlock[method+'EventListener']('change', dependencies.storage.changePrice);
    }
    window[method+'EventListener']('keydown', onWindowEscPress);
  }

  function onSmallPhotoClick(evt) {
    dependencies.image.removePhotoActiveClass();
    dependencies.image.changeImgFromBigToSmall(evt.target);
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

})();
 // scroll, storage, image

(function() {


})();


(function() {

  var RADIOLABEL_CHECKED_CLASS = 'slide__radiolabel--checked';
  var SLIDE_SHOW_CLASS = 'slide__item--show';
  var slides = document.querySelectorAll('.slide__item');
  var radioLabels = document.querySelectorAll('.slide__radiolabel');
  var nextBtn = document.querySelector('.slider__btn-next');
  var previousBtn = document.querySelector('.slider__btn-prev');
  var currentSlideNo = 0;
  var troughLabel = false;

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

  var slideInterval = setInterval(goToNextSlide, 4000); //интервал повторения

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
      goToSlide(this.getAttribute('data-id'));
    });
  });

})();



