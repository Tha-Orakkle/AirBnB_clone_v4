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
    article.append(createReviews(place.id));
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
  function getDayOrdinal (day) {
    if (day >= 11 && day <= 13) {
      return day + 'th';
    }
    switch (day % 10) {
      case 1:
        return day + 'st';
      case 2:
        return day + 'nd';
      case 3:
        return day + 'rd';
      default:
        return day + 'th';
    }
  }

  function formatdate (date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date(date);

    const day = getDayOrdinal(currentDate.getDate());
    const month = months[(currentDate.getMonth()) - 1];
    const year = currentDate.getFullYear();

    const result = `${day} ${month} ${year}`;

    return result;
  }

  function createReviews (placeId) {
    const reviews = document.createElement('div');
    $(reviews).addClass('reviews');

    const reviewHead = document.createElement('div');
    $(reviewHead).addClass('review-head');

    const reviewH2 = document.createElement('h2');
    $(reviewH2).text('Reviews');

    const reviewBtn = document.createElement('button');
    $(reviewBtn).text('show');

    $(reviewHead).append(reviewH2, reviewBtn);

    const reviewBody = document.createElement('div');
    $(reviewBody).addClass('review-body');

    $(reviews).append(reviewHead, reviewBody);

    $(reviewBtn).click(function () {
      const status = $(this).text();
      const reviewURL = 'http://localhost:5001/api/v1/places/';
      if (status === 'hide') {
        $(this).text('show');
        $(reviewBody).empty();
      } else if (status === 'show') {
        $(this).text('hide');
        const reviewList = document.createElement('ul');
        $(reviewBody).append(reviewList);
        $.ajax({
          type: 'GET',
          url: reviewURL + placeId + '/reviews',
          dataType: 'json',
          success: function (reviews) {
            const len = reviews.length;
            if (len === 0) {
              $(reviewList).html('<li>No Reviews Yet</li>');
            } else {
              for (let i = 0; i < len; i++) {
                const eachReview = document.createElement('li');
                $.ajax({
                  type: 'GET',
                  url: 'http://localhost:5001/api/v1/users/' + reviews[i].user_id,
                  dataType: 'json',
                  success: function (user) {
                    const reviewer = `From ${user.first_name} ${user.last_name} on the ${formatdate(reviews[i].updated_at)}`;
                    $(eachReview).html(`<h5>${reviewer}</h5><p>${reviews[i].text}</p>`);
                    $(reviewList).append(eachReview);
                  }
                });
              }
            }
          }
        });
      }
    });

    return reviews;
  }
});
