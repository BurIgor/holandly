$('ul').on('click', '.active', function () {
    $('.active').css('background-color', '');
    $('.active').css('color', '');
    $(this).css('background-color', "#27AE60");
    $(this).css('color', "white");
    var date = $(this).html();
    getTimeline(date.replace(new RegExp('/', 'g'), '-'));
    $('.time-container').css('display', 'block');
});

$('.forward').on("click", function () {
    var last_date = $('.date-bar li').last().html();
    getWeek(last_date.replace(new RegExp('/', 'g'), '-'));
});

$('.backward').on('click', function () {
    var first_date = $('.date-bar li').first().html();
    getWeek(last_date.replace(new RegExp('/', 'g'), '-'));
});

function getTimeline(date) {
    $.ajax({
        type: 'GET',
        url: "/getTimeLine/"+date+"/1/",
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            console.log(data);
        }
    })
}

function getWeek(date) {
    $.ajax({
        type: 'GET',
        url: "/getWeek/"+date+"/1",
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            console.log(data);
        }
    })
}

