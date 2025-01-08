
let cityName = '';
let limit = 1;
let lat ;
let lon ;

let apikey = process.env.WEATHER_API_KEY
let api2 = process.env.SECOND_API_KEY  
let TomorrowapiKey = process.env.TOMORROW_API_KEY
let timezone
 //Calculating Time
function calculateTime(timezone) {
    let timeAndDate = []
    let date = new Date();
    let options = {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    }
    let time = Intl.DateTimeFormat( 'en-US',options).format(date);
    //console.log(time);
    timeAndDate.push(time);
    let currentDate=Intl.DateTimeFormat('en-US', {timeZone:timezone,weekday:"long",day:"numeric", month:"short"}).format(date)
   // console.log(currentDate);
    timeAndDate.push(currentDate);
    return timeAndDate;
}

//----------------------------------------------------------------------------------------------------------------------------------------

  //Fetching weather information
 function getweather(lat,lon,timezone){
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`)
  .then(response => response.json())
  .catch((error) => {
      console.error('Error:', error);
  })
  .then((data) => {
        //Tempreature 
       let temf=data["main"]['temp']-273.15;
         let temp=Math.ceil(temf);
        // console.log(temp);
        document.getElementById('currentTemp').innerText = temp + '°C';
        //Fells_Like
        let feels_like=data["main"]['feels_like']-273.15;
        let feels=Math.ceil(feels_like);
        document.getElementById('feelsLike').inneText=`Feels Like :${feels}°C`
        //Humidity
        let humidity=data['main']['humidity']
        //console.log(humidity)
        document.getElementById('humidity').innerText=humidity+'%'

        //Pressure
        let pressure=data['main']['pressure']
        document.getElementById('pressure').innerText=pressure+'hpa'
        //Wind
        let wind=data['wind']['speed']
        document.getElementById('windSpeed').innerText=wind+"m/sec"
        //Clouds
        let clouds=data['clouds']['all']
        document.getElementById('clouds').innerText=clouds
        //Sunset 
        let sunset=data['sys']['sunset']
       // console.log(sunset)
        let date=new Date(sunset*1000)
        let sunSetTime=Intl.DateTimeFormat("en-US",{
             timeZone:timezone,
             hour12:false,
             minute:"numeric",
             hour:"numeric",


        }).format(date)

        document.getElementById('sunset').innerHTML= `<span> <i class="bi bi-sunset-fill"></i> <span> Sunset : ${sunSetTime}</span></span>`

        //Sunrise
        let sunrise=data["sys"]["sunrise"]
        console.log(sunrise)
        let date1=new Date(sunrise*1000)

        let sunRiseTime=Intl.DateTimeFormat("en-US",{
            timeZone:timezone,
            hour12:false,
            minute:"numeric",
            hour:"numeric",
        }).format(date1)
        document.getElementById('sunrise').innerHTML=`<span> <i class="bi bi-sunrise-fill"></i> <span> Sunrise : ${sunRiseTime}</span></span>`

  })
  .catch((error) => {
      console.error('Error:', error);
  });

 }
  //----------------------------------------------------------------------------------------------------------------------------------------

// Graphs
// Enhanced chart theme function
function getgraph(hourlyValueHolder) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Clear any existing chart
    if (window.myChartInstance) {
        window.myChartInstance.destroy();
    }

    let timelabel = [];
    let templabel = [];
    let windspeedlabel = [];

    hourlyValueHolder.forEach((data) => {
        timelabel.push(data.time);
        templabel.push(data.temp);
        windspeedlabel.push(data.windspeed);
    });

    // Get current theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Theme-specific colors
    const colors = {
        backgroundColor: isDark ? '#333333' : '#ffffff',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        textColor: isDark ? '#ffffff' : '#333333',
        temperatureBarColor: isDark ? 'rgb(255, 99, 132)' : 'rgb(60,60,60)',
        windspeedLineColor: isDark ? 'rgb(255,255,255)' : 'rgb(255, 99, 132)'
    };

    let dataGraph = {
        labels: timelabel,
        datasets: [
            {
                label: "Windspeed",
                data: windspeedlabel,
                type: 'line',
                borderColor: colors.windspeedLineColor,
                borderWidth: 2,
                tension: 0.1,
                yAxisID: 'y'
            },
            {
                label: "Temperature",
                data: templabel,
                type: 'bar',
                backgroundColor: colors.temperatureBarColor,
                yAxisID: 'y1'
            }
        ]
    };

    // Store chart instance globally
    window.myChartInstance = new Chart(ctx, {
        type: "line",
        data: dataGraph,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: colors.textColor
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor
                    },
                    title: {
                        display: true,
                        text: 'Windspeed (km/h)',
                        color: colors.textColor
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor
                    },
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: colors.textColor
                    }
                },
                x: {
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor
                    }
                }
            }
        }
    });
}



//-------------------------------------------------------------------------------------------------------------------------------------------
 //Calculating hourly forecast
 function getHourlyForecast(lat, lon, timezone) {
    // Clear previous data first
    document.getElementById('hourlyForecast').innerHTML = '';
    
    // Initialize array outside fetch
    let hourlyValueHolder = [];

    fetch(`https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature,humidity,windSpeed,precipitationProbability&timesteps=1h&units=metric&apikey=${TomorrowapiKey}`)
        .then(response => response.json())
        .then((data) => {
            console.log("hourly data");
            
            // Make sure we have data before proceeding
            if (!data.data || !data.data.timelines || !data.data.timelines[0]) {
                console.log("No data received");
                return;
            }

            let hourlyData = data.data.timelines[0].intervals;
            console.log(hourlyData);

            // First, collect all the data in the array
            if (hourlyData) {
                for (let i = 0; i <= 11; i = i + 2) {
                    let value = {
                        time: hourlyData[i].startTime.slice(11, 16),
                        temp: hourlyData[i].values.temperature,
                        humidity: hourlyData[i].values.humidity,
                        windspeed: hourlyData[i].values.windSpeed
                    };
                    
                    console.log(value);
                    hourlyValueHolder.push(value);
                }
            }
            
            console.log(hourlyValueHolder);
            

            hourlyValueHolder.forEach((hour) => {
                const hourItem = document.createElement('div');
                hourItem.classList.add('hour-item');
                
                const timeDiv = document.createElement('div');
                timeDiv.textContent = hour.time;
                
                const tempDiv = document.createElement('div');
                tempDiv.textContent = `${Math.round(hour.temp)}°C`;
                
                const windDiv = document.createElement('div');
                windDiv.textContent = `${Math.round(hour.windspeed)}km/h`;
                
                hourItem.appendChild(timeDiv);
                hourItem.appendChild(tempDiv);
                hourItem.appendChild(windDiv);
                
                document.getElementById('hourlyForecast').appendChild(hourItem);
            });
         
            getgraph(hourlyValueHolder);

       
        })
        .catch((error) => {
            console.log("Error:", error);
            document.getElementById('hourlyForecast').textContent = 'Failed to load forecast';
        });
}
//----------------------------------------------------------------------------------------------------------------------------------------
/*  two api city name to latitude and longitude then using that to time zone */ 


  function searchCity(cityName) {
fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${apikey}`)
    .then(response => response.json())
    .then((data) => {
        lat = data[0].lat;  
        lon = data[0].lon;  
        //console.log(lat,lon);
        //caling function to get weather information
       
        
        fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${api2}`)
            .then(resp => resp.json())
            .then((result) => {
               // console.log(result);
                if (result.results.length) {
                 //   console.log(result.results[0]["timezone"]["name"]);
                    timezone = result.results[0]["timezone"]["name"];
                    const currentTime = calculateTime(timezone)[0];
                    const currentDate = calculateTime(timezone)[1];
                  //  console.log(currentTime);
                    document.getElementById('cityName').innerText = cityName;
                    document.getElementById('currentTime').innerText = currentTime;
                    document.getElementById('currentDate').innerText = currentDate;
                      //Calling function to get weather information
                      getweather(lat,lon,timezone);

                      //Caling function for hourly forecast
                      getHourlyForecast(lat,lon,timezone);

                } else {
                    console.log("No location found");
                }
            }).catch((error) => {
                console.error('Error:', error);
            });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    ;

}
    //------------------------------------------------------------------------------------------------------------------------------------


    //Current location 


    function getCurrentLocation() {
        // Check if geolocation is supported
        if (navigator.geolocation) {
            document.getElementById('cityName').innerText = 'Detecting location...';
            
            navigator.geolocation.getCurrentPosition(
                // Success callback
                (position) => {
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    
                    // Use the reverse geocoding API
                    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${api2}`)
                        .then(resp => resp.json())
                        .then((result) => {
                            if (result.results && result.results.length > 0) {
                                const locationData = result.results[0];
                                
                                // Get timezone from the response
                                timezone = locationData.timezone.name;
                                
                                // Get city name, with fallbacks
                                cityName = locationData.city || locationData.county || locationData.state;
                                
                                // Calculate current time and date
                                const currentTime = calculateTime(timezone)[0];
                                const currentDate = calculateTime(timezone)[1];
                                
                                // Update UI
                                document.getElementById('cityName').innerText = cityName;
                                document.getElementById('currentTime').innerText = currentTime;
                                document.getElementById('currentDate').innerText = currentDate;
                                
                                // Get weather data using the coordinates
                                getweather(lat, lon, timezone);
                                getHourlyForecast(lat, lon, timezone);
                            } else {
                                document.getElementById('cityName').innerText = 'Location not found';
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            document.getElementById('cityName').innerText = 'Error getting location details';
                        });
                },
                // Error callback
                (error) => {
                    console.error("Error getting location:", error);
                    let errorMessage = 'Unable to get location: ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Position unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Request timed out';
                            break;
                        default:
                            errorMessage += 'Unknown error';
                    }
                    document.getElementById('cityName').innerText = errorMessage;
                },
                // Options
                {
                    maximumAge: 0,
                    timeout: 5000,
                    enableHighAccuracy: true
                }
            );
        } else {
            document.getElementById('cityName').innerText = 'Geolocation not supported';
        }
    }

    //--------------------------------------------------------------------------------------------------------------------------------------
  // Search input event listener
  document.getElementById('citySearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchCity(this.value);
    }
});
//-------------------------------------------------------------------------------------------------------------------------------------------
//Current Location event listener
document.getElementById('currentLocation').addEventListener('click', getCurrentLocation);
// ----------------------------------------------------------------------------------------------------------------------------------------
//Dark Theme 
// Get the theme toggle checkbox
const themeToggle = document.getElementById('checkbox');

// Function to set theme
function setTheme(isDark) {
    // Set the theme attribute on root element
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Update checkbox state
    themeToggle.checked = isDark;
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update chart if it exists
    if (window.myChartInstance) {
        // Update chart colors
        Chart.defaults.color = isDark ? '#ffffff' : '#333333';
        window.myChartInstance.data.datasets[1].backgroundColor = isDark ? '#666666' : 'rgb(60,60,60)';
        window.myChartInstance.update();
    }


    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.checked = isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Add CSS for hourly forecast items in dark mode
    const style = document.createElement('style');
    if (isDark) {
        style.textContent = `
            .hour-item {
                background-color: #444444 !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
    } else {
        style.textContent = `
            .hour-item {
                background-color: var(--hover-color);
                color: var(--text-color);
                border: none;
            }
        `;
    }

    // Remove any previously added style
    const oldStyle = document.getElementById('theme-specific-styles');
    if (oldStyle) {
        oldStyle.remove();
    }
    style.id = 'theme-specific-styles';
    document.head.appendChild(style);

    // Update chart if it exists
    if (window.myChartInstance) {
        // Redraw the chart with current data but new theme
        const currentData = window.myChartInstance.data.datasets[1].data;
        const hourlyData = currentData.map((temp, index) => ({
            time: window.myChartInstance.data.labels[index],
            temp: temp,
            windspeed: window.myChartInstance.data.datasets[0].data[index]
        }));
        getgraph(hourlyData);
    }
}

// Initialize theme
function initTheme() {
    // Check saved preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    setTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));
}

// Listen for toggle changes
themeToggle.addEventListener('change', (e) => setTheme(e.target.checked));

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initTheme);

// On stating of Script Current Location is called
document.addEventListener('DOMContentLoaded', () => {
   
    getCurrentLocation();  // Get current location automatically
});