window.onload = function() {

    document.getElementById('user').onclick = function () {
        var user = document.getElementById('inlog').value;

        $.ajax({
            type: 'GET',
            url: '/user/' + user,
            data: JSON.stringify({user: user}),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
            },
            error: function () {
                // console.log(data);
                alert('Wrong user or password...')
            }
        });
    };

    document.getElementById('week').onclick = function () {
        var user = document.getElementById('inlog').value;
        var dweek = document.getElementById('dateweek').value;

        $.ajax({
            type: 'GET',
            url: '/userWeek/' + user + '/' + dweek,
            data: JSON.stringify({user: user, dweek: dweek}),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
            }
        });
    };

    document.getElementById('visitor').onclick = function () {
        var vname = document.getElementById('inname').value;
        var vemail = document.getElementById('inemail').value;

        $.ajax({
            type: 'POST',
            url: '/visitor',
            data: JSON.stringify({vname: vname, vemail: vemail}),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
            }
        });
    };
}