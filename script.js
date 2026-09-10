let currentDate = new Date();

let selectedDate = new Date();

let habits = JSON.parse(localStorage.getItem("habits")) || [
    "Study",
    "Exercise",
    "Read",
    "Drink Water"
];

let completed = JSON.parse(localStorage.getItem("completed")) || {};



/* -------------------------
   SAVE DATA
------------------------- */

function saveData() {

    localStorage.setItem(
        "habits",
        JSON.stringify(habits)
    );

    localStorage.setItem(
        "completed",
        JSON.stringify(completed)
    );
}



/* -------------------------
   DATE KEY
------------------------- */

function dateKey(date) {

    return date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");

}



/* -------------------------
   FORMAT DATE
------------------------- */

function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}



/* -------------------------
   CALENDAR
------------------------- */

function renderCalendar() {

    const calendar =
        document.getElementById("calendar");

    calendar.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    document.getElementById("monthYear")
        .textContent =
        currentDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    const firstDay =
        new Date(year, month, 1).getDay();


    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    for (let i = 0; i < firstDay; i++) {

        const empty =
            document.createElement("div");

        calendar.appendChild(empty);

    }


    for (let day = 1; day <= daysInMonth; day++) {

        const date =
            new Date(year, month, day);

        const key =
            dateKey(date);


        const div =
            document.createElement("div");

        div.className = "day";


        const number =
            document.createElement("div");

        number.className = "day-number";

        number.textContent = day;


        div.appendChild(number);


        const today =
            new Date();


        if (
            dateKey(date) === dateKey(today)
        ) {

            div.classList.add("today");

        }


        if (
            dateKey(date) === dateKey(selectedDate)
        ) {

            div.classList.add("selected");

        }


        const status =
            getDayStatus(key);


        if (status) {

            div.dataset.status = status;

        }


        div.addEventListener(
            "click",
            function () {

                selectedDate = date;

                renderCalendar();

                renderHabits();

            }
        );


        calendar.appendChild(div);

    }

}



/* -------------------------
   DAY STATUS
------------------------- */

function getDayStatus(key) {

    if (habits.length === 0) return null;

    const dayData =
        completed[key] || {};


    const done =
        habits.filter(
            habit => dayData[habit]
        ).length;


    if (done === 0) return "none";

    if (done === habits.length)
        return "perfect";

    if (done >= habits.length * 0.5)
        return "good";

    return "partial";

}



/* -------------------------
   HABITS
------------------------- */

function renderHabits() {

    const list =
        document.getElementById("habitList");

    list.innerHTML = "";


    const key =
        dateKey(selectedDate);


    if (!completed[key])
        completed[key] = {};


    habits.forEach(
        function (habit) {

            const row =
                document.createElement("div");

            row.className = "habit";


            if (completed[key][habit]) {

                row.classList.add("completed");

            }


            const left =
                document.createElement("div");

            left.className = "habit-left";


            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.className =
                "habit-checkbox";

            checkbox.checked =
                completed[key][habit] || false;


            checkbox.addEventListener(
                "change",
                function () {

                    completed[key][habit] =
                        checkbox.checked;

                    saveData();

                    renderHabits();

                    renderCalendar();

                    updateStats();

                }
            );


            const name =
                document.createElement("span");

            name.className = "habit-name";

            name.textContent = habit;


            left.appendChild(checkbox);

            left.appendChild(name);


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-habit";

            deleteButton.textContent = "×";


            deleteButton.addEventListener(
                "click",
                function () {

                    habits =
                        habits.filter(
                            h => h !== habit
                        );

                    saveData();

                    renderHabits();

                    renderCalendar();

                    updateStats();

                }
            );


            row.appendChild(left);

            row.appendChild(deleteButton);

            list.appendChild(row);

        }
    );


    updateProgress();

}



/* -------------------------
   PROGRESS
------------------------- */

function updateProgress() {

    const key =
        dateKey(selectedDate);

    const dayData =
        completed[key] || {};


    const done =
        habits.filter(
            habit => dayData[habit]
        ).length;


    const percentage =
        habits.length === 0
            ? 0
            : Math.round(
                (done / habits.length) * 100
            );


    document.getElementById(
        "progressText"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "selectedDate"
    ).textContent =
        formatDate(selectedDate);

}



/* -------------------------
   STATS
------------------------- */

function updateStats() {

    let totalPossible = 0;

    let totalDone = 0;


    Object.keys(completed).forEach(
        key => {

            habits.forEach(
                habit => {

                    totalPossible++;

                    if (
                        completed[key][habit]
                    ) {

                        totalDone++;

                    }

                }
            );

        }
    );


    const overall =
        totalPossible === 0
            ? 0
            : Math.round(
                (totalDone / totalPossible) * 100
            );


    document.getElementById(
        "totalCompleted"
    ).textContent =
        totalDone;


    document.getElementById(
        "overallProgress"
    ).textContent =
        overall + "%";


    calculateStreak();

}



/* -------------------------
   STREAK
------------------------- */

function calculateStreak() {

    let streak = 0;

    let date = new Date();


    while (true) {

        const key =
            dateKey(date);

        const status =
            getDayStatus(key);


        if (status === "perfect") {

            streak++;

            date.setDate(
                date.getDate() - 1
            );

        } else {

            break;

        }

    }


    document.getElementById(
        "streak"
    ).textContent =
        streak;

}



/* -------------------------
   ADD HABIT
------------------------- */

document.getElementById(
    "addHabitBtn"
).addEventListener(
    "click",
    function () {

        const name =
            prompt("Enter your new habit:");


        if (
            name &&
            name.trim() !== ""
        ) {

            const cleanName =
                name.trim();


            if (
                !habits.includes(cleanName)
            ) {

                habits.push(cleanName);

                saveData();

                renderHabits();

                renderCalendar();

                updateStats();

            }

        }

    }
);



/* -------------------------
   MONTH NAVIGATION
------------------------- */

document.getElementById(
    "prevMonth"
).addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();

    }
);


document.getElementById(
    "nextMonth"
).addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();

    }
);



/* -------------------------
   TODAY BUTTON
------------------------- */

document.getElementById(
    "todayBtn"
).addEventListener(
    "click",
    function () {

        currentDate = new Date();

        selectedDate = new Date();

        renderCalendar();

        renderHabits();

    }
);



/* -------------------------
   START
------------------------- */

renderCalendar();

renderHabits();

updateStats();
