const fetchHolidays = async (year, country) => {
    const apiUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch");
        const holidays = await response.json();
        return holidays;
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return [];
    }
};

const generateCalendar = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById("month-year").textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const country = "US"; // Change this to a dynamic country code
    const holidays = await fetchHolidays(year, country);

    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += "<div></div>";
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement("div");
        div.classList.add("day");
        div.textContent = day;

        if (day === now.getDate()) {
            div.classList.add("today");
        }

        const holiday = holidays.find(h => new Date(h.date).getMonth() === month && new Date(h.date).getDate() === day);
        if (holiday) {
            div.classList.add("holiday");
            div.setAttribute("title", holiday.localName);
        }

        calendar.appendChild(div);
    }
};

generateCalendar();
