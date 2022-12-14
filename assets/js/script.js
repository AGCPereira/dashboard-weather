//local storage to pull previous searches
var cityNameArray = [];
var searchHistory = JSON.parse(localStorage.getItem("searches"));
if (searchHistory !== null) {
    for (var i = 0; i < searchHistory.length; i++) {
        if (searchHistory[i] === null) {
            searchHistory.splice(i, i+1);
        } else {
            cityNameArray.push(searchHistory[i]);
        }
    }
}
var prevSearches = document.querySelector("#prev-searches");
var prevSearchCard = document.querySelector("#prev-searches .card-body");
var updateSearchHistory = () => {
    //pulls local storage results of previous searches
    searchHistory = JSON.parse(localStorage.getItem("searches"));

    var prevSearchBtns = document.querySelectorAll("#prev-searches button");

    if (searchHistory !== null) {
        prevSearchBtns.forEach(button => {
            for (var i = 0; i < searchHistory.length; i++)
            if (button.dataset.city.includes(searchHistory[i])) {
                searchHistory.splice(i, i + 1);
            }
        })
        for (var i = 0; i < searchHistory.length; i++) {
            var searchBtn = document.createElement("button");
            searchBtn.classList.add("p-2", "btn");
            searchBtn.dataset.city = searchHistory[i];
            searchBtn.textContent = searchHistory[i];
            searchBtn.addEventListener("click", (event) => {
                callOpenWeather(event.target.dataset.city);
            })
            prevSearchCard.appendChild(searchBtn); 
        }
    }
}

//updates local storage
var updateLocalStorage = (city) => {
    if (cityNameArray.includes(city)) {
        return;
    } else {
        cityNameArray.push(city);
        localStorage.setItem("searches", JSON.stringify(cityNameArray));
        updateSearchHistory();
    }
}

//to find lat and lon of each city
var callOpenWeather = (city) => {
    //API key already added to the end 
    var URLapiKey = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=9f6c9af692c14ff566fd4eb0885cc629";

// for cities not found
var fiveForecast = document.querySelector("#five-forecast");
var cityForecastList = document.querySelector("#search-city-forecast #weather-conditions");
var cityConditions = document.querySelector("#search-city-forecast h3");
fetch(URLapiKey)
    .then(function (response) {
        if (!response.ok) {
            cityForecastList.innerHTML = "";
            cityConditions.textContent = "Oops!";
            const errorText = document.createElement("li");
            errorText.textContent = "city not recognized";
            cityForecastList.appendChild(errorText);
            fiveForecast.innerHTML = "";
        } else {
            response.json()
        .then(function (data) {

            // URL for openweather one call. API key already included
            var URLonecall = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=9f6c9af692c14ff566fd4eb0885cc629`;
            
            var cityName = data.name;
            fetch(URLonecall)
            .then(function (response) {
                if (response.ok) {
                    response.json()
            .then(function (data) {
                // Creates icon to display current weather status
                var icon = ("<img src='https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png' alt='current weather icon'>");
                cityConditions.innerHTML = cityName + " (" + moment().format("MM/DD/YYYY") + ") " + icon;

                // cleats previous search
                var currentCard = [];
                cityForecastList.innerHTML = "";
                
                // list for current weather (temp, wind, humidity, UV index)
                var currentCard = [];
                for (var i = 0; i < 4; i++) {
                    var li = document.createElement("li");
                    li.classList.add("mb-2");
                    currentCard.push(li);
                }
                currentCard[0].innerHTML = "Temperature: " + Math.floor(data.current.temp) + "&deg;F" ;
                currentCard[2].textContent = "Wind: " + Math.floor(data.current.wind_speed) + "MPH";
                currentCard[1].textContent = "Humidity: " + data.current.humidity + "%";
                
                // UV index section
                var uvIndex = Math.floor(data.current.uvi);
                // colours used to show UV index green(low 0-2)yellow(mod/high 3-7)red(very high 8-10)
                if (uvIndex <= 2) {
                    currentCard[3].innerHTML = `UV Index: <div class="btn btn-light uv">${uvIndex}</div>`;
                } else if (uvIndex > 3 && uvIndex <= 5) {
                    currentCard[3].innerHTML = `UV Index: <button class="btn btn-success uv">${uvIndex}</button>`;
                } else if (uvIndex > 6 && uvIndex <= 8) {
                    currentCard[3].innerHTML = `UV Index: <button class="btn btn-warning uv">${uvIndex}</button>`;
                } else {
                    currentCard[3].innerHTML = `UV Index: <button class="btn btn-danger uv">${uvIndex}</button>`;
                }

                currentCard.forEach(li => {
                    cityForecastList.append(li);
                })
                //for 5 day forecast
                var fiveDay = document.querySelector("#fiveDay");
                var arrayFiveDay = [];

                fiveForecast.innerHTML = "";

                for (var i = 0; i < 5; i++) {
                    var dailyCard = document.createElement("div");
                    //displays cards with forecast for next 5 days
                    dailyCard.innerHTML = `
                    <div class="m-2 card bg-dark text-white">
                        <h5>${moment().add(i + 1, "days").format("MM/DD/YYYY")}</h5>
                        <ul id="weather-conditions">
                            <img src='https://openweathermap.org/img/w/${data.daily[i].weather[0].icon}.png' alt="Weather icon" class="mx-auto">
                            <li>Temp: ${Math.floor(data.daily[i].temp.day)} &deg;F</li>
                            <li>Wind: ${Math.floor(data.current.wind_speed)}MPH</li>
                            <li>Humidity: ${data.daily[i].humidity}%</li>
                        </ul>
                    </div>`;
                    arrayFiveDay.push(dailyCard);
                }

                fiveDay.classList.remove("hidden");
                arrayFiveDay.forEach(card => {
                    fiveForecast.appendChild(card);
                })
                updateLocalStorage(cityName);
            })
        }
        })
    })
}
})   
}
// event listener for search button
var searchForm = document.querySelector("#search-form");
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

// reminds user to enter city
var cityName = document.querySelector("#city-name");
    var searchbtn = cityName.value.trim("");
    if (searchbtn === "") {
        cityConditions.textContent = "Enter a city";
        cityForecastList.innerHTML = " ";
        fiveForecast.innerHTML = " ";
    } else {
        callOpenWeather(searchbtn);
        cityName.value = "";
    }
});

//updates search history
updateSearchHistory();
//API Key: 9f6c9af692c14ff566fd4eb0885cc629 (already added to code)
