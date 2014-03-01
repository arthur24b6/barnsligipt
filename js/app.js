/**
 * @file
 * Implements the barnsligipt slideshow in an ember framework.
 */

App = Ember.Application.create({});


/**
 * An ember slide object.
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

  init: function() {
   // this._super();
   // this.set("chromosomes", ["x"]); // everyone gets at least one X chromosome
  },

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
      image.thumbnail = image.src;
      // Image has exif thumbnail.
      if (ep.exifInfo.isValid) {
        var thumbnail = "data:image/jpeg," + ep.exifInfo.exifData.toHexString(ep.exifInfo.thumbOffset, ep.exifInfo.thumbLength);
        image.set('thumbnail', thumbnail);
        image.exif = ep.exifInfo;
      }
      image.set('loaded', true);
      return image;
    });
  }

});

/**
 * Application slides.
 * @type @exp;Ember@pro;Object@call;extend
 */
App.EmberSlides = Ember.Object.extend({
  slides: [],
  currentSlide: 0,
  currentPage: 0,
  slidesPerPage: 4,

  count : function () {
    var count = 0;
    Ember.$.each(this.get('slides'), function(key, value) {
      count++;
    });
    return count;
  },

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
   * Utility function to load a set of slides.
   */
  loadSet: function(start_index, stop_index) {
    var display = this.get('slides').slice(start_index, stop_index);
    Ember.$.each(display, function(index, slide) {
      slide.load();
    });
    return display;
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


Ember.$(document).ready(function() {spin();});

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

var slides = App.EmberSlides.create();

App.Router.map(function() {
  this.resource('slides', { path: 'slides/:page_id' });
  this.resource('slide', { path: 'slide/:slide_id' });
});

App.IndexRoute = Ember.Route.extend({
   beforeModel: function(transition) { spin(); },
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

App.ApplicationController = Ember.Controller.extend({});


App.SlidesRoute = Ember.Route.extend({
  beforeModel: function(transition) { spin(); },
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
    spin();
    this.controllerFor('application').set('isViewing', true);
  },
  model: function(params) {
    slides.set('currentSlide', params.slide_id);
    var slide = slides.slides.findBy('id', Number(params.slide_id));
    slide.load();
    return slide;
  },
  afterModel: function() {
    console.log('after render');
  },
  actions: {
    next: function() {
      var page = Number(slides.currentSlide) + 1;
      if (page > slides.count()) {
        page = 1;
      }
      this.replaceWith('slide', page);
    },
    previous: function() {
      var page = Number(slides.currentSlide) - 1;
      if (page <= 0) {
        page = slides.count();
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
