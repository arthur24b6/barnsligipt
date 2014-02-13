/**
 *
 * @file
 *
 */

/**
 * Application settings.
 */
var settings = {
  contentDirectory: 'images/',
  baseURL: '',
  imagesPerPage: 3
};


function Barnsligipt () {

  this.init = function () {
   this.getImageListing();

  }

  this.settings =  {
    contentDirectory: 'images/',
    baseURL: '',
    imagesPerPage: 3
  };

  this.slideIndex = 0;
  this.images =  {};

  /**
   * Get the next set of images to display.
   * @returns images
   */
  this.nextSet = function () {
    var count = this.slideCount();
    var images = {};

    var stop = this.slideIndex + this.settings.imagesPerPage;
    if (stop <= count) {
      // slice on start/stop
      for (var i = this.slideIndex; i < stop; i++) {
        images[i] = this.images[i];
      }
    }
    else {
      var remainder = stop - count;
      // First slide is the current index to the total number of slides.
      for (var i; i <= count; i++) {
        images[i] = this.images[i];
      }
      // Second group is the first slide to the remainder.
      for (var i = 0; i <= remainder; i++) {
        images[i] = this.images[i];
      }
    }
    return images;
  };

  this.previousSet = function  () {
    return images;
  };

  this.next = function () {
    var images = this.nextSet();

  }

  this.slideCount = function () {
    return Object.keys(this.images).length;
  };

  this.url = function(path) {
    return this.settings.baseURL + path;
  };


  /**
   * Get all the posts in the specified directory.
   *
   * @TODO handle directories.
   *
   * @returns array of post URIs
   */
  this.getImageListing = function () {
    var images = {};
    // Get the directory listing. Note that the sorting is being done by Apache's
    // list options. If this isn't supported on the server this won't work.
    $.ajax({url: url(settings.contentDirectory), async: false})
      .done(function(data) {
        var items = $(data).find('a');
        $(items).each(function(index, value) {
          // Apache writes the URLs relative to the directory.
          var uri = url(settings.contentDirectory) + $(this).attr('href');
          var extension = uri.substr((~-uri.lastIndexOf(".") >>> 0) + 2);
          // Only support jpeg/jpg file extensions.
          if (/\.jpe?g?$/i.test ($(this).attr('href'))) {
            images[index] = uri;
          }
        });
      });
    this.images = images;
  }

};



/**
 * Current data
 */

/**
 * Utility function to return a path based on the instalation location.
 *
 * @param string path
 *   Create a URL to this path.
 * @returns string
 */
function url(path) {
  return settings.baseURL + path;
}

$(document).ready(function() {

var slideshow = new Barnsligipt;

/**
 * Get all the posts in the specified directory.
 *
 * @TODO handle directories.
 *
 * @returns array of post URIs
 */
function getImageListing() {
  var images = {};
  // Get the directory listing. Note that the sorting is being done by Apache's
  // list options. If this isn't supported on the server this won't work.
  $.ajax({url: url(settings.contentDirectory), async: false})
    .done(function(data) {
      var items = $(data).find('a');
      $(items).each(function(index, value) {
        // Apache writes the URLs relative to the directory.
        var uri = url(settings.contentDirectory) + $(this).attr('href');
        var extension = uri.substr((~-uri.lastIndexOf(".") >>> 0) + 2);
        // Only support jpeg/jpg file extensions.
        if (/\.jpe?g?$/i.test ($(this).attr('href'))) {
          images[index] = uri;
        }
      });
    });
  return images;
}

/**
 * Process a list of image URLs into image elements.
 *
 * @TODO handle pagination.
 * @TODO template.
 *
 * @param array images
 */
function insertImages(images) {
  console.log(images);
  $.each(images, function(index, src) {
      var element = $('<a href="' + src +'"></a>');
      var ep = new ExifProcessor(src);
      ep.execute(generateThumb(element, src));

      var wrapper = $('<div class="thumbnail">');
      element.prependTo(wrapper);
      $(wrapper).prependTo('#content');

      $('a', wrapper).click(function() {
        // Handle full element load.
        console.log('click');
        return false;
      });
  });



  // Fade the main content area in.
  $('#content').fadeIn(3000);
}

  // Run the application.

  slideshow.images = getImageListing();
  var images = slideshow.nextSet();
  // Insert the set of images
  // @TODO this should be the set of images
  insertImages(images);

  // Capture clicks on the navigation.
  $('.navigation').click(function() {
    $('#content').html('');
    if ($(this).hasClass('next')) {
      var images = slideshow.nextSet();
      insertImages(images);
    }

    if ($(this).hasClass('previous')) {

    }


  });

});