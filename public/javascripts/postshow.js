mapboxgl.accessToken = 'pk.eyJ1Ijoia2FuZWtpIiwiYSI6ImNqeHN5aGQyNTBveTAzbm1tdTc4ZHV4M2kifQ.o2ypyxlNN-TiQ7H3L8m3Eg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: post.coordinates,
    zoom: 5
});

var el = document.createElement('div');
el.className = 'marker';
new mapboxgl.Marker(el)
    .setLngLat(post.coordinates)
    .setPopup(new mapboxgl.Popup({
            offset: 25
        }) // add popups
        .setHTML('<h3>' + post.title + '</h3><p>' + post.location + '</p>')
    )
    .addTo(map);
$('.toggle-edit-form').on('click', function(){
  $(this).text() === 'Edit' ? $(this).text('Cancel') :
                $(this).text('Edit');
    $(this).siblings('.edit-review-form').toggle();
});

$('.clear-rating').click(function() {
    $(this).siblings('.input-no-rate').click();
})