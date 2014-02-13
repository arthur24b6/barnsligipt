/**
 *
 * @file
 *
 */


var Barnsligipt = {
  'slideIndex' : 0
};

/**
 * Application settings.
 */
var settings = {
  contentDirectory: 'images/',
  baseURL: '',
  imagesPerPage: 3
};


Barnsligipt.settings = settings;


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
  $.each(images, function(index, src) {
    //if (index <= settings.imagesPerPage) {
      console.log(index);
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
   // }

   // else {
      return false;
   // }
  });

  function buildNavigation(images) {
    if (images.length > settings.imagesPerPage) {

    }
  }


  // Fade the main content area in.
  $('#content').fadeIn(3000);
}

  // Run the application.
  Barnsligipt.images = getImageListing();
  Barnsligipt.slideCount = Object.keys(Barnsligipt.images).length
  insertImages(Barnsligipt.images);

  // Capture clicks on the navigation.
  $('.navigation').click(function() {

    if ($(this).hasClass('next')) {

      console.log(Barnsligipt.slideIndex + Barnsligipt.settings.imagesPerPage);
      console.log(Barnsligipt.images.length); // - Barnsligipt.settings.imagesPerPage);
      // Advance
      if ((Barnsligipt.slideIndex + Barnsligipt.settings.imagesPerPage) <= Barnsligipt.slideCount - Barnsligipt.settings.imagesPerPage) {
        var start = Barnsligipt.slideIndex + Barnsligipt.settings.imagesPerPage;
        var stop = start + Barnsligipt.settings.imagesPerPage;

        var display = {};
        for (var i = start; i <= stop; i++) {
          display[i] = Barnsligipt.images[i];
          console.log(Barnsligipt.images[i]);
        }


        $('#content').html('');
        insertImages(display);
        Barnsligipt.slideIndex = start;
      }


    }

    if ($(this).hasClass('previous')) {

    }


  });

});