$(document).ready(function () {
  const placesSearch = 'http://localhost:5001/api/v1/places_search/';

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

  function createPlace (place) {
    const article = document.createElement('article');
    const placeTitle = createPlaceTitle(place.name, place.price_by_night);
    const placeInfo = createPlaceInfo(place);
    const placeDescription = createPlaceDescription(place.description);
    article.innerHTML = placeTitle + placeInfo + placeDescription;
    return article;
  }

  const url = 'http://localhost:5001/api/v1/status/';
  $.get(url, function (response) {
    if (response.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  const amenities = {};
  $('input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete amenities[$(this).attr('data-id')];
    }

    $('h4#selectedAmenities').text(Object.values(amenities).join(', '));
  });

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
});
