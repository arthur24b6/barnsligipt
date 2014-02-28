/**
 * @file
 *
 */


function Barnsligipt () {

  var settings = {
    contentDirectory: 'images/',
    baseURL: '',
    imagesPerPage: 4,
    gitHubListing: 'https://api.github.com/repos/arthur24b6/patar/contents/images',
    useDemoImages: true
  };

  /* ********************************* */

  this.slideIndex = 1;

  //var images = [];

  this.init = function () {
    if (settings.useDemoImages) {
      this.getGitHubListing();
    }
    else {
      this.getFileListing();
    }
  };

  /**
   * Calculate the number of pages needed.
   * @returns {unresolved}
   */
  this.pageCount = function() {
    var count = this.slideCount() / settings.imagesPerPage;
    return Math.ceil(count);
  };

  /**
   * Get the next set of images to display.
   *
   * @returns images
   */
  this.nextSet = function () {
    var count = this.slideCount();
    var start = slideIndex.page * settings.imagesPerPage;
    var stop = start + settings.imagesPerPage;

    if (start > count) {
      start = start - count;
      stop = start + settings.imagesPerPage;
    }

    var images = [];

    // Normal case- return the next few.
    if (stop <= count) {
      for (var i = start; i < stop; i++) {
        images.push(this.images[i]);
      }
    }

    // Next set of full images has to wrap around.
    else if (stop > count && count > settings.imagesPerPage) {
      var remainder = stop - count;

      // First slide is the current index to the total number of slides.
      for (var i = start; i < count; i++) {
        images.push(this.images[i]);
      }
      // Second group is the first slide to the remainder.
      for (var i = 0; i < remainder; i++) {
        images.push(this.images[i]);
      }
    }

    // Not enough images to fill a complete set.
    else {
      for (var i = start; i <= count; i++) {
        images.push(this.images[i]);
      }
    }
    return images;
  };


  /**
   * Get the previous set of images to display.
   * @returns {unresolved}
   */
  this.previousSet = function  () {
    var count = this.slideCount();
    var images = [];

    var stop = this.slideIndex - settings.imagesPerPage;

    // Case where image list needs to wrap around the array.
    if (stop < settings.imagesPerPage) {
      var remainder = count - stop;
      // Get the items greater.
      for (var i = remainder; i <= count; i++) {
        images.push(this.images[i]);
      }
      for (var i = 0; i <= this.slideIndex; i++) {
        images.push(this.images[i]);
      }
      this.slideIndex = remainder;
    }
    // Only need to get the previous three.
    else {
      for (var i = stop; i <= this.slideIndex; i++) {
        images.push(this.images[i]);
      }
      this.slideIndex = stop;
    }
    return images;
  };

  /**
   * Get the next slide.
   *
   * @returns image
   */
  this.next = function () {
    var count = this.slideCount();
    var next = 0;
    if (this.slideIndex < count - 1){
      next = this.slideIndex + 1;
    }
    this.slideIndex = next;
  };

  /**
   * Get the previous slide.
   *
   * @returns image
   */
  this.previous = function () {
    var count = this.slideCount();
    var previous = count - 1;
    if (this.slideIndex > 0){
      previous = this.sideIndex - 1;
    }
    this.slideIndex = previous;
  };

  this.slideCount = function () {
    return Object.keys(this.images).length;
  };


  /**
   * Utility function to build full urls.
   * @param string path
   * @returns {String}
   */
  function url (path) {
    return settings.baseURL + path;
  };


  /**
   * Get all the posts in the specified directory.
   *
   * @TODO handle directories.
   *
   * @returns array of post URIs
   */
  this.getFileListing = function () {
    var listing = new Array;
    // Get the directory listing.
    console.log(settings);
    $.ajax({url: url(settings.contentDirectory), async: false})
      .done(function(data) {
        var items = $(data).find('a');
        $(items).each(function(index, value) {
          // Apache writes the URLs relative to the directory.
          var uri = url(settings.contentDirectory) + $(this).attr('href');
          var extension = uri.substr((~-uri.lastIndexOf(".") >>> 0) + 2);
          // Only support jpeg/jpg file extensions.
          if (/\.jpe?g?$/i.test ($(this).attr('href'))) {
            listing.push({
              'id': index,
              'src': uri,
              'thumbnail': false,
              'exif': false,
              'loaded': false
            });
          }
        });
      });
    this.images = listing;
  };

  /**
   * Utility function to get a listing of files from a github repo.
   */
  this.getGitHubListing = function () {
    var listing = new Array;
    $.ajax({url: settings.gitHubListing, async: false})
      .done(function(data) {
        $.each(data, function(index, value) {
        // Only support jpeg/jpg file extensions.
        if (/\.jpe?g?$/i.test (value.name)) {
          listing.push({
            'id': index,
            'src': value.path,
            'thumbnail': false,
            'exif': false,
            'loaded': false
           });
        }
      });
   });
   this.images = listing;

  };

/**
 * Utility function gets EXIF thumbnail.
 *
 * This fetches the exif thumbnail from the source and fires an event when
 * the image has been loaded.
 *
 * @TODO this should not use Ember.set()
 *
 * @param object src
 *   The original image path.
 */
this.loadImage = function(slide) {
  if (slide.loaded) {
    return;
  }
  var data = {};
  var ep = new ExifProcessor(slide.src);
  return ep.execute(function () {
    // Image has exif thumbnail.
    if (ep.exifInfo.isValid) {
      var thumbnail = "data:image/jpeg," + ep.exifInfo.exifData.toHexString(ep.exifInfo.thumbOffset, ep.exifInfo.thumbLength);
      Ember.set(slide, 'thumbnail', thumbnail);
      Ember.set(slide, 'exif', exifDisplay(ep.exifInfo));
    }
    // Image does not have an exif thumbnail.
    else {
      Ember.set(slide, 'thumbnail', slide.src);
    }
    Ember.set(slide, 'loaded', true);
  });
};

  /**
   * Utility function to display EXIF data.
   * @param {type} data
   * @returns {String}
   */
  function exifDisplay (data) {
    var output = data.cameraMake + " " + data.cameraModel + " " + data.dateTime;
    return output;
  };

  this.init();
};
