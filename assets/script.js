apiKey = "6e420bce715508b6be7bea964633132d";
var searchHistory = [];
var today = moment().format("L");

var fiveDayEl = document.querySelector("#five-day");

function currentCondition(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;

    $.ajax({
        url: apiUrl,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        $("current-weather").css("display", "block");
        $("city-info").empty();

        var currentCity = $(`
            <h2 id="currentCity">
                ${response.name} (${today})
            </h2>
            <p>Temperature: ${response.main.temp} °F</p>
            <p>Wind: ${response.wind.speed} MPH</p>
            <p>Humidity: ${response.main.humidity}\%</p>
        `);

        $("#city-info").append(currentCity);

        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var uviUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;

        $.ajax({
            url: uviUrl,
            method: "GET"
        }).then(function(uviResponse) {
            var uvIndex = uviResponse.value;
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor">${uvIndex}</span>
                </p>
            `);

            $("#city-info").append(uvIndexP);

            fiveDays(latitude, longitude);

            if (uvIndex >= 0 && uvIndex <= 3.5) {
                $("#uvIndexColor").css("background-color", "#008000");
            } else if (uvIndex > 3.5 && uvIndex <=7) {
                $("#uvIndexColor").css("background-color", "#FFFF00");
            } else if (uvIndex > 7) {
                $("uvIndexColor").css("background-color", "FF6347");
            }
        })

    })
}

function fiveDays(latitude, longitude) {
    var fiveDaysUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=current,minutely,hourly,alerts&appid=" + apiKey;

    $.ajax({
        url: fiveDaysUrl,
        method: "GET"
    }).then(function(fiveDayResponse) {
        console.log(fiveDayResponse);

        $("#five-day").empty();

        for (i = 1; i < 6; i++) {
            var cityInfo = {
                date: fiveDayResponse.daily[i].dt,
                icon: fiveDayResponse.daily[i].weather[0].icon,
                temp: fiveDayResponse.daily[i].temp.day,
                wind: fiveDayResponse.daily[i].wind_speed,
                humidity: fiveDayResponse.daily[i].humidity
            };

            var currentDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");

            var fiveDayCards = $(`
                <div class="pl-3">
                    <div class="card">
                        <div class="card-body">
                            <h5>${currentDate}</h5>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Wind: ${cityInfo.wind} MPH</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                </div>
            `);

            $("#five-day").append(fiveDayCards);
        };

    });
}

$("#searchBtn").on("click", function(event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentCondition(city);
})