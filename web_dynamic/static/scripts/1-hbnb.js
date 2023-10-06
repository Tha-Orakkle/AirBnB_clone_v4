$(document).ready(function () {
  const amenities = {};
  $('input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
        delete amenities[$(this).attr('data-id')];
    }

    $('h4#selectedAmenities').text(Object.values(amenities).join(', '));
  });
});