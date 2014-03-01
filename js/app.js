/**
 * @file
 * Implements the barnsligipt slideshow in an ember framework.
 */

App = Ember.Application.create({});


/**
 * An Ember slide object.
 *
 * This reimplements the barnsligipt slide object so that Ember can have easier
 * access to update the properties.
 *
 * @type @exp;Ember@pro;Object@call;extend
 */
App.EmberSlide = Ember.Object.extend({
  id: null,
  src: null,
  thumbnail: null,
  exif: null,
  loaded: false,

  /**
   * Get EXIF and thumbnail data for the image.
   */
  load: function() {
    if (this.loaded) {
      return this;
    }
    var ep = new ExifProcessor(this.src);
    var image = this;
    return ep.execute(function () {
      image.set('thumbnail', image.get('src'));
      // Image has exif thumbnail.
      if (ep.exifInfo.isValid) {
        var thumbnail = "data:image/jpeg," + ep.exifInfo.exifData.toHexString(ep.exifInfo.thumbOffset, ep.exifInfo.thumbLength);
        image.set('thumbnail', thumbnail);
        image.set('exif', ep.exifInfo);
      }
      image.set('loaded', true);
      return image;
    });
  }

});


/**
 * Application slides.
 *
 * @type @exp;Ember@pro;Object@call;extend
 */
App.EmberSlides = Ember.Object.extend({
  slides: [],
  currentSlide: 0,
  currentPage: 0,
  slidesPerPage: 4,

  init: function () {
    var barnsligipt = new Barnsligipt();
    var slides = this.slides;
    Ember.$.each(barnsligipt.images, function (key, image) {
      var slide = App.EmberSlide.create({
        'src': image.src,
        'id': image.id
      });
      slides.push(slide);
    });
  },

  /**
   * Total number of slides in the system.
   */
  count : function () {
    var count = 0;
    Ember.$.each(this.get('slides'), function(key, value) {
      count++;
    });
    return count;
  },

  /**
   * Utility function to get and load a slide.
   */
  getSlide: function(id) {
    var slide = slides.slides.findBy('id', Number(id));
    slide.load();
    return slide;
  },

  /**
   * Determine the number of slide pages.
   */
  pageCount: function() {
    var count = this.count() / this.slidesPerPage;
    return Math.ceil(count);
  },

  /**
   * Get the set of images that represent the current page.
   */
  nextSet: function() {
    var count = this.count();
    var start = this.currentPage * this.slidesPerPage;
    var stop = start + this.slidesPerPage;

    var display = [];

    if (start > count) {
      start = start - count;
      stop = start + this.slidesPerPage;
    }

    // Normal case- return the next few.
    if (stop <= count) {
      for (var i = start; i < stop; i++) {
        display.push(this.slides[i]);
      }
    }

    // Next set of full images has to wrap around the list.
    else if (stop > count && count > this.slidesPerPage) {
      var remainder = stop - count;

      // First slide is the current index to the total number of slides.
      for (var i = start; i < count; i++) {
        display.push(this.slides[i]);
      }
      // Second group is the first slide to the remainder.
      for (var i = 0; i < remainder; i++) {
        display.push(this.slides[i]);
      }
    }

    // Not enough images to fill a complete set.
    else {
      for (var i = start; i <= count; i++) {
        display.push(this.slides[i]);
      }
    }

    // Load all image data.
    $.each(display, function(key, slide) {
      slide.load();
    });

    return display;
  }
});


var slides = App.EmberSlides.create();

App.ApplicationController = Ember.Controller.extend({});

App.Router.map(function() {
  this.resource('slides', { path: 'slides/:page_id' });
  this.resource('slide', { path: 'slide/:slide_id' });
});


App.IndexRoute = Ember.Route.extend({
  model: function() {
    return slides.nextSet();
  },
  actions: {
    next: function() {
      this.replaceWith('slides', 1);
    },
    previous: function(slide) {
      this.replaceWith('slides', slides.count());
    }
  }
});


App.SlidesRoute = Ember.Route.extend({
  model: function(params) {
    slides.set('currentPage', params.page_id);
    return slides.nextSet();
  },
  actions: {
    next: function() {
      var page = Number(slides.currentPage) + 1;
      if (page >= slides.pageCount()) {
        page = 0;
      }
      this.replaceWith('slides', page);
    },
    previous: function() {
      var page = slides.get('currentPage') - 1;
      if (page <= 0) {
        page = slides.pageCount();
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
    slides.set('currentSlide', params.slide_id);
    return slides.getSlide(params.slide_id);
  },
  actions: {
    next: function() {
      var page = Number(slides.currentSlide) + 1;
      if (page > slides.count()) {
        page = 1;
      }
      this.transitionTo('slide', page);
    },
    previous: function() {
      var page = Number(slides.currentSlide) - 1;
      if (page <= 0) {
        page = slides.count();
      }
      this.transitionTo('slide', page);
    },
    close: function() {
      this.replaceWith('application');
    }
  },
  deactivate: function(reason) {
    this.controllerFor('application').set('isViewing', false);
  }
});