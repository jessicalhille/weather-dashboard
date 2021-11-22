var apiKey = "6e420bce715508b6be7bea964633132d";

var queryUrl = "api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

$("submit").on("click", function(event) {
    event.preventDefault();

    console.log(city);
})