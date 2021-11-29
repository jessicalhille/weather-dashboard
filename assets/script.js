apiKey = "6e420bce715508b6be7bea964633132d";
var searchHistory = [];
var today = moment().format("L");

// current weather for the user input city
function currentCondition(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: apiUrl,
        method: "GET"
    }).then(function(response) {

        $("current-weather").css("display", "block");
        $("city-info").empty();

        // get the icon code and url for the weather images
        var iconCode = response.weather[0].icon;
        var iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

        // pull information from the current weather array
        var currentCity = $(`
            <h2 id="currentCity">
                ${response.name} (${today}) <img src="${iconUrl}" />
            </h2>
            <p>Temperature: ${response.main.temp} °F</p>
            <p>Wind: ${response.wind.speed} MPH</p>
            <p>Humidity: ${response.main.humidity}\%</p>
        `);

        // display the current weather information in the html page
        $("#city-info").append(currentCity);

        // get the latitude and longitude for the uv index
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

            // adds uv index to the current weather element
            $("#city-info").append(uvIndexP);

            // pushes latitute and longitude for the 5 day forecast
            fiveDays(latitude, longitude);

            // creates color background for uv index depending on the current number
            if (uvIndex >= 0 && uvIndex <= 3.5) {
                $("#uvIndexColor").css("background-color", "#3CB371");
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

        $("#five-day").empty();

        // pulls the next 5 days from the current city's array
        for (i = 1; i < 6; i++) {
            var cityInfo = {
                date: fiveDayResponse.daily[i].dt,
                icon: fiveDayResponse.daily[i].weather[0].icon,
                temp: fiveDayResponse.daily[i].temp.day,
                wind: fiveDayResponse.daily[i].wind_speed,
                humidity: fiveDayResponse.daily[i].humidity
            };

            var currentDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");

            // get the icon image for each day
            var iconUrl = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png"`;

            // create and insert the 5 day forecast information from the array
            var fiveDayCards = $(`
                <div class="pl-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <h5>${currentDate}</h5>
                            <img>${iconUrl}</img>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Wind: ${cityInfo.wind} MPH</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                </div>
            `);

            // display the five day forecast inside the html element
            $("#five-day").append(fiveDayCards);
        };

    });
}

// on click event listener to submit the city name input from user
$("#searchBtn").on("click", function(event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentCondition(city);
    $("#city-info").empty();

    // places user input city into the search history
    if(!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchedCity = $(`
            <button class="list-group">${city}</button>
        `);
        $("#searchHistory").append(searchedCity);
    };

    // saves to local storage
    localStorage.setItem("city", JSON.stringify(searchHistory));
})

// on click event listener for the search history buttons
$(document).on("click", ".list-group", function() {
    var cityList = $(this).text();
    currentCondition(cityList);
    $("#city-info").empty();
})

// saves the most recent searched city and presents it to the user when they refresh or reload web browser
$(document).ready(function() {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentCondition(lastSearchedCity);
    };
})