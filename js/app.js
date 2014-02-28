/**
 *
 * @file
 * Basic slide show constructure which sits between Ember and EXIF data.
 */


var slideshow = new Barnsligipt();

var slides = slideshow.images;


App = Ember.Application.create({
  isViewing: false,
  slide: 0,
  page: 0,
  settings: {
    contentDirectory: 'images/',
    imagesPerPage: 4
  },
  slides: slideshow.images
});

function spin () {
  $('.thumbnail, #slide').each(function () {
    $(this).spin('small', '#999999');
  });

  $('.thumbnail img, #slide img').hide();

  $('.thumbnail img, #slide img').on('load', function () {
    $(this).fadeIn(function() {
      $(this).parent('div').spin(false);
    });
  });
};

var slideIndex = {
  slide: 0,
  page: 0
};


App.Router.map(function() {
  this.resource('slides', { path: 'slides/:page_id' });
  this.resource('slide', { path: 'slide/:slide_id' });
});


App.IndexRoute = Ember.Route.extend({
  model: function() {
    var test = slideshow.images.slice(0, 4);
    Ember.$.each(test, function(index, slide) {
      slideshow.loadImage(slide);
    });
    return test;
  },
  actions: {
    next: function() {
      this.replaceWith('slides', 1);
    },
    previous: function(slide) {
      this.replaceWith('slides', slideshow.pageCount());
    }
  }
});


 App.IndexView = Ember.View.extend({
   // @TODO this is only called on the first route load.
  didInsertElement: function() {
    this.$('.thumbnail, #slide').each(function () {
      $(this).spin('small', '#999999');
    });
    this.$('.thumbnail img, #slide img').hide();
    this.$('.thumbnail img, #slide img').on('load', function () {
      $(this).fadeIn(function() {
        $(this).parents('div').spin(false);
      });
    });
  }
 });

App.ApplicationController = Ember.Controller.extend({});

App.SlidesRoute = Ember.Route.extend({
  model: function(params) {
    Ember.set(slideIndex, 'page', params.page_id);
    var slidePage = slideshow.nextSet();
    Ember.$.each(slidePage, function(index, slide) {
      slideshow.loadImage(slide);
    });
    return slidePage;
  },
  actions: {
    next: function(slides) {
      var page = Number(slideIndex.page) + 1;
      if (page >= slideshow.pageCount()) {
        page = 0;
      }
      this.replaceWith('slides', page);
    },
    previous: function(slides) {
      var page = slideIndex.page - 1;
      if (Number(slideIndex.page) <= 0) {
        page = slideshow.pageCount();
      }
      this.replaceWith('slides', page);
    }
  }
});


App.SlideRoute = Ember.Route.extend({
  beforeModel: function(transition) {
    this.controllerFor('application').set('isViewing', true);
  },
  model: function(params) {
    Ember.set(slideIndex, 'slide', params.slide_id);
    var slide = Ember.get(slides, params.slide_id);
    slideshow.loadImage(slide);
    return slide;
  },
  afterModel: function() {
    console.log('after render');
  },
  actions: {
    next: function() {
      var page = Number(slideIndex.slide) + 1;
      if (page > slideshow.slideCount()) {
        page = 1;
      }
      this.replaceWith('slide', page);
    },
    previous: function() {
      var page = Number(slideIndex.slide) - 1;
      if (page <= 0) {
        page = slideshow.slideCount();
      }
      this.replaceWith('slide', page);
    },
    close: function() {
      this.replaceWith('application');
    }
  },
  deactivate: function(reason) {
    this.controllerFor('application').set('isViewing', false);
  }
});

App.SlideView = Ember.View.extend({
  // @TODO this is only called on the first route load.
  didInsertElement: function() {
    console.log('view!');
    this.$('.thumbnail, #slide').each(function () {
      $(this).spin('small', '#999999');
    });
    this.$('.thumbnail img, #slide img').hide();
    this.$('.thumbnail img, #slide img').on('load', function () {
      $(this).fadeIn(function() {
        $(this).parents('div').spin(false);
      });
    });
  }
 });