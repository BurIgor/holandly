var eventType = '';

$('ul').on('click', 'li', function () {
    var event_owner = $(this).children(".event-owner").html();
    eventType = $(this).children(".event-header").html();
    $('.bg-modal').css('display', 'flex');
    $('#modal-owner').text(event_owner);
    $('#modal-desc').text("Are you sure you want to visit " + eventType + "?");
});


$('.confirm').on('click', function () {
    var currHref = $(location).attr('href');
    alert(currHref);
    $(location).attr('href', currHref + "/" + eventType );
});

$('.modal-button').on('click', function () {
    $('.bg-modal').css('display', "none");
});