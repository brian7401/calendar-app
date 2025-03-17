const fetchHolidays = async (year, country) => {
    const apiUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch");
        return await response.json();
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return [];
    }
};

const fetchUserCountry = async () => {
    try {
        const response = await fetch("https://ip-api.com/json/");
        const data = await response.json();
        return data.countryCode || "US";
    } catch (error) {
        console.error("Error fetching user location:", error);
        return "US";
    }
};

const populateCountrySelector = async () => {
    const selector = document.getElementById("country-selector");
    const searchInput = document.getElementById("country-search");
    try {
        const response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
        let countries = await response.json();
        countries.sort((a, b) => a.name.localeCompare(b.name));
        
        const updateDropdown = (filter = "") => {
            selector.innerHTML = "";
            countries.forEach(country => {
                if (country.name.toLowerCase().includes(filter.toLowerCase())) {
                    const option = document.createElement("option");
                    option.value = country.countryCode;
                    option.textContent = country.name;
                    selector.appendChild(option);
                }
            });
        };
        
        searchInput.addEventListener("input", () => updateDropdown(searchInput.value));
        updateDropdown();
    } catch (error) {
        console.error("Error fetching country list:", error);
    }
};

const generateCalendars = async (country) => {
    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = now.getMonth();
    const calendarsContainer = document.getElementById("calendars");
    calendarsContainer.innerHTML = "";
    const holidays = await fetchHolidays(year, country);
    
    for (let month = 0; month < 12; month++) {
        const calendarContainer = document.createElement("div");
        calendarContainer.classList.add("calendar-container");
        if (month === currentMonth) calendarContainer.classList.add("current-month");
        
        const monthTitle = document.createElement("h2");
        monthTitle.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        calendarContainer.appendChild(monthTitle);
        
        const calendar = document.createElement("div");
        calendar.classList.add("calendar");
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < firstDay; i++) calendar.innerHTML += "<div></div>";
        
        for (let day = 1; day <= daysInMonth; day++) {
            const div = document.createElement("div");
            div.classList.add("day");
            div.textContent = day;
            
            if (month === currentMonth && day === now.getDate()) div.classList.add("today");
            
            const holiday = holidays.find(h => new Date(h.date).getMonth() === month && new Date(h.date).getDate() === day);
            if (holiday) {
                div.classList.add("holiday");
                div.onclick = () => showPopup(holiday.localName, holiday.date);
            }
            
            calendar.appendChild(div);
        }
        calendarContainer.appendChild(calendar);
        calendarsContainer.appendChild(calendarContainer);
    }
};

const showPopup = (holidayName, holidayDate) => {
    const popup = document.getElementById("holiday-popup");
    const popupTitle = document.getElementById("popup-title");
    const popupDate = document.getElementById("popup-date");
    
    popupTitle.textContent = holidayName;
    popupDate.textContent = `Date: ${holidayDate}`;
    
    popup.classList.add("show");
};

const closePopup = () => {
    document.getElementById("holiday-popup").classList.remove("show");
};

document.getElementById("popup-close").addEventListener("click", closePopup);

document.addEventListener("DOMContentLoaded", async () => {
    await populateCountrySelector();
    const userCountry = await fetchUserCountry();
    document.getElementById("country-selector").value = userCountry;
    generateCalendars(userCountry);
});

const updateCountry = () => {
    const selectedCountry = document.getElementById("country-selector").value;
    generateCalendars(selectedCountry);
};
