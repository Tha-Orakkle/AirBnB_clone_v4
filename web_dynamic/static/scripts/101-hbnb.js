$(document).ready(function () {
    let reviewsVisible = false;

    function toggleReviews() {
        if (reviewsVisible) {
            $('#reviewsContainer').empty();
            $('#toggleReviews').text('show');
        } else {
            // Fetch and display reviews here, use AJAX
            const reviews = ['Review 1', 'Review 2', 'Review 3'];
            reviews.forEach(review => {
                $('#reviewsContainer').append(`<p>${review}</p>`);
            });
            $('#toggleReviews').text('hide');
        }
        reviewsVisible = !reviewsVisible;
    }

    $('#toggleReviews').click(function () {
        toggleReviews();
    });
    
    const placesSearch = 'http://localhost:5001/api/v1/places_search/';
    const selectedLocations = { states: [], cities: [] };
    const selectedAmenities = {};

    function updateSelectedLocations() {
        const selectedStates = selectedLocations.states.join(', ');
        const selectedCities = selectedLocations.cities.join(', ');
        $('h4#selectedLocations').text(`States: ${selectedStates}, Cities: ${selectedCities}`);
    }

    function updateSelectedAmenities() {
        $('h4#selectedAmenities').text(Object.values(selectedAmenities).join(', '));
    }

    $('input[type="checkbox"]').click(function () {
        const id = $(this).attr('data-id');
        const name = $(this).attr('data-name');

        if ($(this).hasClass('state-checkbox')) {
            if ($(this).is(':checked')) {
                selectedLocations.states.push(name);
            } else {
                selectedLocations.states = selectedLocations.states.filter(state => state !== name);
            }
        } else if ($(this).hasClass('city-checkbox')) {
            if ($(this).is(':checked')) {
                selectedLocations.cities.push(name);
            } else {
                selectedLocations.cities = selectedLocations.cities.filter(city => city !== name);
            }
        } else {
            if ($(this).is(':checked')) {
                selectedAmenities[id] = name;
            } else {
                delete selectedAmenities[id];
            }
        }

        updateSelectedLocations();
        updateSelectedAmenities();
    });

    $('button').click(function () {
        const requestData = {
            amenities: Object.values(selectedAmenities),
            cities: selectedLocations.cities,
            states: selectedLocations.states
        };

        $.ajax({
            type: 'POST',
            url: placesSearch,
            dataType: 'json',
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (data) {
                $('section.places').empty();
                for (let i = 0; i < data.length; i++) {
                    $('section.places').append(createPlace(data[i]));
                }
            }
        });
    });
  
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
  
    const amenities = {};
    $('input[type="checkbox"]').click(function () {
      if ($(this).is(':checked')) {
        amenities[$(this).attr('data-id')] = $(this).attr('data-name');
      } else {
        delete amenities[$(this).attr('data-id')];
      }
  
      $('h4#selectedAmenities').text(Object.values(amenities).join(', '));
    });
  
    $('button').click(function () {
      const amenityList = [];
      for (const key in amenities) {
        amenityList.push(amenities[key]);
      }
      const amenityObj = { amenities: amenityList };
      $.ajax({
        type: 'POST',
        url: placesSearch,
        dataType: 'json',
        data: JSON.stringify(amenityObj),
        contentType: 'application/json',
        success: function (data) {
          for (let i = 0; i < data.length; i++) {
            $('section.places').append(createPlace(data[i]));
          }
        }
      });
    });
  });
  