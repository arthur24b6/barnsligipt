var settings = {
  contentDirectory: 'images/',
  baseURL: '/',
  imagesPerPage: 3,
  defaultImage: '/404'
};

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


/**
 * Utility function to get all images from an Apache directory listing.
 *
 * @returns {Array|getImageListing.listing}
 */
function getImageListing() {
  var listing = new Array;
  Ember.$.ajax({url: url(settings.contentDirectory), async: false})
    .done(function(data) {
      var items = Ember.$(data).find('a');
      Ember.$(items).each(function(index, value) {
        // Apache writes the URLs relative to the directory.
        var uri = url(settings.contentDirectory) + Ember.$(this).attr('href');
        var extension = uri.substr((~-uri.lastIndexOf(".") >>> 0) + 2);
        // Only support jpeg/jpg file extensions.
        if (/\.jpe?g?$/i.test (uri)) {
          listing.push(uri);
        }
      });
  });
  return listing;
}

/**
 * Utility function gets EXIF thumbnail.
 *
 * This fetches the exif thumbnail from the source and fires an event when
 * the image has been loaded.
 *
 * @param string src
 *   The original image path.
 */
function getThumbnail(src) {
  var ep = new ExifProcessor(src);
  ep.execute(function () {
    // Image has exif thumbnail.
    if (ep.exifInfo.isValid) {
      var image = "data:image/jpeg,";
      image += ep.exifInfo.exifData.toHexString(ep.exifInfo.thumbOffset, ep.exifInfo.thumbLength);
    }
    // Image does not have an exif thumbnail.
    // @TODO add a default image.
    else {
      image = settings.defaultImage;
    }
    Ember.$.event.trigger({
      type: 'thumbnailLoaded',
      'src' : ep.dataSource,
      'image' : image,
      'exif' : ep.exifInfo
    });
  });
}


App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    var listing = getImageListing();
    var images = new Array;

    // Start fetching all the thumbnails.
    Ember.$.each(listing, function(index, src) {
      getThumbnail(src);
    });

    // Listen for the thumbnails to complete and update the page.
    $(document).on('thumbnailLoaded', function(event) {
      $('img[data-src="'+event.src+'"]').attr('src', event.image).fadeIn(1500);
    });

    // Return the set of images.
    return listing;
   }
});

App.SlideRoute = Em.Route.extend({
  model: function() {
    return App.slide.find();
  }
});
