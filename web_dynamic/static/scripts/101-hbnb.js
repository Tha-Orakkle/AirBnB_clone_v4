$(document).ready(function () {
  const placesSearch = 'http://localhost:5001/api/v1/places_search/';

  // ---------- helper functions to create a place section embedded in an article tag ---------//
  function createPlaceTitle (placeName, price) {
    return `<div class="title_box">
              <h2>${placeName}</h2>
              <div class="price_by_night">$${price}</div>
            </div>`;
  }

  function createMaxGuests (guests) {
    if (guests === 1) {
      return `<div class="max_guest">${guests} Guest</div>`;
    } else {
      return `<div class="max_guest">${guests} Guests</div>`;
    }
  }

  function createNumberRooms (rooms) {
    if (rooms === 1) {
      return `<div class="number_rooms">${rooms} Bedroom</div>`;
    } else {
      return `<div class="number_rooms">${rooms} Bedrooms</div>`;
    }
  }

  function createNumberBathrooms (bathrooms) {
    if (bathrooms === 1) {
      return `<div class="number_bathrooms">${bathrooms} Bathroom</div>`;
    } else {
      return `<div class="number_bathrooms">${bathrooms} Bathrooms</div>`;
    }
  }

  function createPlaceInfo (place) {
    const maxGuest = createMaxGuests(place.max_guest);
    const numberRooms = createNumberRooms(place.number_rooms);
    const numberBathrooms = createNumberBathrooms(place.number_bathrooms);
    return `<div class="information">
              ${maxGuest}
              ${numberRooms}
              ${numberBathrooms}
            </div>`;
  }

  function createPlaceDescription (description) {
    return `<div class="description">
            ${description}
            </div>`;
  }

  // ---------- creates the place section ---------------//
  function createPlace (place) {
    const article = document.createElement('article');
    const placeTitle = createPlaceTitle(place.name, place.price_by_night);
    const placeInfo = createPlaceInfo(place);
    const placeDescription = createPlaceDescription(place.description);
    article.innerHTML = placeTitle + placeInfo + placeDescription;
    article.append(createReviews(place));
    return article;
  }


  // ------------------- request to confirm API status --------------------- //
  const url = 'http://localhost:5001/api/v1/status/';
  $.get(url, function (response) {
    if (response.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  // ------------- populates the DOM with list of a places --------------//
  $.ajax({
    type: 'POST',
    url: placesSearch,
    dataType: 'json',
    data: '{}',
    contentType: 'application/json',
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        $('section.places').append(createPlace(data[i]));
      }
    }
  });

  // ----------------- Filters Places Based on Amenities, States and Cities ------------//
  const amenities = {};
  $('.amenities input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete amenities[$(this).attr('data-id')];
    }

    $('h4#selectedAmenities').text(Object.values(amenities).join(', '));
  });

  const states = {};
  $('.locations #stateCheck').click(function () {
    if ($(this).is(':checked')) {
      states[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete states[$(this).attr('data-id')];
    }

    const locations = Object.assign({}, states, cities);
    if (Object.values(locations).length === 0) {
      $('h4#selectedPlaces').text('');
    } else {
      $('h4#selectedPlaces').text(Object.values(locations).join(', '));
    }
  });

  const cities = {};
  $('.locations #cityCheck').click(function () {
    if ($(this).is(':checked')) {
      cities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete cities[$(this).attr('data-id')];
    }

    const locations = Object.assign({}, states, cities);
    if (Object.values(locations).length === 0) {
      $('h4#selectedPlaces').text('');
    } else {
      $('h4#selectedPlaces').text(Object.values(locations).join(', '));
    }
  });

  $('.filters button').click(function () {
    const filterOptions = {
      amenities: Object.keys(amenities),
      states: Object.keys(states),
      cities: Object.keys(cities)
    };


    $.ajax({
      type: 'POST',
      url: placesSearch,
      dataType: 'json',
      data: JSON.stringify(filterOptions),
      contentType: 'application/json',
      success: function (data) {
        $('section.places').empty();
        for (let i = 0; i < data.length; i++) {
          $('section.places').append(createPlace(data[i]));
        }
      }
    });
  });

  // ------------------ Reviews Section --------------------//  
  function createReviews (placeId) {  
    const reviews = document.createElement('div');
    $(reviews).addClass('reviews');

    const reviewHead = document.createElement('div');
    $(reviewHead).addClass('review-head');

    const reviewH2 = document.createElement('h2');
    $(reviewH2).text('Reviews');

    const reviewBtn = document.createElement('button');
    $(reviewBtn).html('<span>show</span>');

    $(reviewHead).append(reviewH2, reviewBtn);

    const reviewBody = document.createElement('div');
    $(reviewBody).addClass('review-body');

    $(reviews).append(reviewHead, reviewBody);

    $(reviewBtn).click(function (placeId) {
      const status = $(this).text()
      const reviewURL = 'http://localhost:5001/api/v1/places';
      if (status === 'hide') {
        $(this).text('show');
      } else if (status === 'show') {
        $(this).text('hide')
        $.ajax({
          type: 'GET',
          url: reviewURL + placeId + '/reviews',
        })
      }
    });
    
    return reviews;
  }

  // $('.review-head button').click(function () {
  //   $(this).text('hide');
  //   $('.review-body').text('Clicked');
  //   console.log('clicked');
  // });
});
