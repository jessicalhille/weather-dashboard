apiKey = "6e420bce715508b6be7bea964633132d";
var searchHistory = [];
var today = moment().format("L");

var cityInfoEl = document.querySelector("#city-info");
var fiveDayEl = document.querySelector("#five-day");
var searchHistoryEl = document.querySelector("#searchHistory");
var searchBtn = document.querySelector("#searchBtn");

// current weather for the user input city
function currentCondition(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: apiUrl,
        method: "GET"
    }).then(function(response) {

        cityInfoEl.textContent = "";

        // get the icon code and url for the weather images
        var iconCode = response.weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/wn/" + iconCode + ".png";

        // pull information from the current weather array
        var currentImg = document.createElement("img");
        currentImg.setAttribute("src", iconUrl);

        var currentCity = document.createElement("h2");
        currentCity.textContent = response.name + " " + today;

        var currentTemp = document.createElement("p");
        currentTemp.textContent = "Temperature: " + response.main.temp + "°F";

        var windSpeed = document.createElement("p");
        windSpeed.textContent = "Wind Speed: " + response.wind.speed + " MPH"

        var currentHum = document.createElement("p");
        currentHum.textContent = "Humidity: " + response.main.humidity + "%";

        // display the current weather information in the html page
        cityInfoEl.appendChild(currentCity);
        cityInfoEl.appendChild(currentImg);
        cityInfoEl.appendChild(currentTemp);
        cityInfoEl.appendChild(windSpeed);
        cityInfoEl.appendChild(currentHum);

        // get the latitude and longitude for the uv index
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var uviUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;

        $.ajax({
            url: uviUrl,
            method: "GET"
        }).then(function(uviResponse) {
            var uvIndex = uviResponse.value;

            var uvIndexEl = document.createElement("p");
            uvIndexEl.textContent = "UV Index: " + uvIndex;
            uvIndexEl.id = "uvIndexColor";

            // adds uv index to the current weather element
            cityInfoEl.appendChild(uvIndexEl);

            // pushes latitute and longitude for the 5 day forecast
            fiveDays(latitude, longitude);

            // creates color background for uv index depending on the current number
            if (uvIndex >= 0 && uvIndex <= 3.5) {
                $("#uvIndexColor").css("background-color", "#3CB371");
            } else if (uvIndex > 3.5 && uvIndex <=7) {
                $("#uvIndexColor").css("background-color", "#FFFF00");
            } else if (uvIndex > 7) {
                $("uvIndexColor").css("background-color", "FF6347");
            };
        });

    });
}

function fiveDays(latitude, longitude) {
    var fiveDaysUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=current,minutely,hourly,alerts&appid=" + apiKey;

    $.ajax({
        url: fiveDaysUrl,
        method: "GET"
    }).then(function(fiveDayResponse) {

        fiveDayEl.textContent = "";

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
            var iconUrl = "https://openweathermap.org/img/w/" + cityInfo.icon + ".png";

            // create and insert the 5 day forecast information from the array
            var fiveDayDate = document.createElement("h5");
            fiveDayDate.textContent = currentDate;

            var fiveDayIcon = document.createElement("img");
            fiveDayIcon.setAttribute("src", iconUrl);

            var fiveDayTemp = document.createElement("p");
            fiveDayTemp.textContent = "Temp: " + cityInfo.temp + "°F";

            var fiveDayWind = document.createElement("p");
            fiveDayWind.textContent = " Wind: " + cityInfo.wind + "MPH";

            var fiveDayHum = document.createElement("p");
            fiveDayHum.textContent = "Humidity: " + cityInfo.humidity + "%";

            // display the five day forecast inside the html element
            fiveDayEl.appendChild(fiveDayDate);
            fiveDayEl.appendChild(fiveDayIcon);
            fiveDayEl.appendChild(fiveDayTemp);
            fiveDayEl.appendChild(fiveDayWind);
            fiveDayEl.appendChild(fiveDayHum);
        };
    });
}

// on click event listener to submit the city name input from user
searchBtn.addEventListener("click", function(event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentCondition(city);
    cityInfoEl.textContent = "";

    // places user input city into the search history
    if(!searchHistory.includes(city)) {
        searchHistory.push(city);

        var searchedCity = document.createElement("button");
        searchedCity.textContent = city;

        searchHistoryEl.append(searchedCity);
    };

    // saves to local storage
    localStorage.setItem("city", JSON.stringify(searchHistory));

    // on click event listener for the search history buttons
    searchedCity.addEventListener("click", function() {
        var cityList = $(this).text();
        currentCondition(cityList);
        cityInfoEl.textContent = "";
    });
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
