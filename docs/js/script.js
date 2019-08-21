"use strict";

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
    scroll: window.scroll
  };

  var popupOpenBtns = document.querySelectorAll('.popup__open');
  var photoOpenBtns = document.querySelectorAll('.goods__show-btn');
  var popupBlock;
  var popupCloseBtn;
  var photosSmall;

  function onWindowEscPress(evt) {
    if (evt.keyCode === 27 && popupBlock.classList.contains('popup--show')) {
      evt.preventDefault();
      closePopupBlock();
    }
    window.removeEventListener('keydown', onWindowEscPress);
  }

  function closePopupBlock() {
    popupBlock.classList.remove('popup--show');
    dependencies.scroll.enableScrolling();
    photosSmall.forEach(function(photo) {
      photo.removeEventListener('click', removePhotoActiveClass);
      photo.removeEventListener('click', changeImgFromBigToSmall);
    });
    popupCloseBtn.removeEventListener('click', closePopupBlock);
  }

  function openPopupBlock() {
    var popupBlockId = 'popup' + this.getAttribute('data-popup-id');
    popupBlock = document.getElementById(popupBlockId);
    photosSmall = popupBlock.querySelectorAll('.photo__img-small');
    popupCloseBtn = popupBlock.querySelector('.popup__close');

    popupBlock.classList.add('popup--show');
    dependencies.scroll.disableScrolling();
    photosSmall.forEach(function(photo) {
      photo.addEventListener('click', removePhotoActiveClass);
      photo.addEventListener('click', changeImgFromBigToSmall);
    });
    popupCloseBtn.addEventListener('click', closePopupBlock);
    window.addEventListener('keydown', onWindowEscPress);
  }

  function removePhotoActiveClass() {
    photosSmall.forEach(function(photoSmall) {
      photoSmall.classList.remove('photo__img-small--active');
    });
  }

  function changeImgFromBigToSmall() {
    var phSmallSources = popupBlock.querySelectorAll('.photo__img-small-srcset');
    var phSmallId = this.getAttribute('data-id');
    var phBig = popupBlock.querySelector('.photo__img-large');
    var phBigSource = popupBlock.querySelector('.photo__img-large-srcset');
    var phBigTitle = popupBlock.querySelector('.photo__header');

    this.classList.add('photo__img-small--active');
    phBig.src = this.src;
    phBigSource.srcset = phSmallSources[phSmallId].srcset;
    phBigTitle.textContent = this.alt;
  }

  function renderImgs() {
    var phImgs = popupBlock.querySelectorAll('img');
    phImgs.forEach(function(img) {
      img.setAttribute('src', img.getAttribute('data-img'));
    });
  }

  function renderSources() {
    var phSources = popupBlock.querySelectorAll('source');
    phSources.forEach(function(source) {
      source.setAttribute('srcset', source.getAttribute('data-img'));
    });
  }

  function renderAllImgs() {
    renderImgs();
    renderSources();
    this.removeEventListener('click', renderAllImgs);
  }

  popupOpenBtns.forEach(function(btn) {
    btn.addEventListener('click', openPopupBlock);
  });

  photoOpenBtns.forEach(function(btn) {
    btn.addEventListener('click', renderAllImgs);
  });

})();
 // scroll

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


// var tableRowTemplate = document.getElementById('table-row').content.querySelector('.cart__table-row');


// function createTableRow() {
//   var tableRow = tableRowTemplate.cloneNode(true);
//   var goodId = tableRow.querySelector('.cart__table-cell--id');
//   var goodName = tableRow.querySelector('.cart__table-cell--name');
//   var goodSize = tableRow.querySelector('.cart__table-cell--size');
//   var goodColor = tableRow.querySelector('.cart__table-cell--color');
//   var goodNumber = tableRow.querySelector('.cart__table-cell--number');
//   var goodPrice = tableRow.querySelector('.cart__table-cell--price');

//   goodId.textContent = this.getAttribute('data-id');
//   goodName.textContent = this.getAttribute('data-name');
//   goodPrice.textContent = this.getAttribute('data-price');

//   console.log(tableRow);

// }

