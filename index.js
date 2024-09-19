// Existing button and form logic for Target Performance Bonus and Consumed WFH
let btn = document.getElementById("btn");
let quater = document.getElementById("inputName");
let percentage = document.getElementById("inputEmail");

let btn1 = document.getElementById("btn1");
let quater1 = document.getElementById("inputName1");
let percentage1 = document.getElementById("inputEmail1");
let daysConsumed = document.getElementById("daysConsumed");

let totalDaysFinal = 0;
let result;

// Tab navigation logic
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-link");
  const mainSections = document.querySelectorAll(".content-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      mainSections.forEach((section) => (section.style.display = "none"));
      const contentId = tab.getAttribute("data-content");
      document.getElementById(contentId).style.display = "block";
    });
  });

  // Initialize calendar when DOM is loaded
  initCalendar();
  main3.style.display = "none"; // this is added because when the dom was loaded it was appearin in the main1 tab
});

// Button event handlers for the form
btn.addEventListener("click", (e) => {
  e.preventDefault();
  result = document.getElementById("result");
  if (quater.value != "" && percentage.value != "") {
    let firstValue = getFirstValue(quater.value);
    totalDaysFinal = quaterCall(firstValue);
    let totalWFO = targeDays(totalDaysFinal, percentage.value);
    addResultText(totalWFO, totalDaysFinal);
  } else {
    addResultText();
  }
});

btn1.addEventListener("click", (e) => {
  e.preventDefault();
  result = document.getElementById("result1");
  if (
    quater1.value != "" &&
    percentage1.value != "" &&
    daysConsumed.value != ""
  ) {
    let firstValue = getFirstValue(quater1.value);
    totalDaysFinal = quaterCall(firstValue);
    let totalWFO = targeDays(totalDaysFinal, percentage1.value);
    let checkAvail = checkAvaiWFH(totalWFO, totalDaysFinal);
    addResultText1(checkAvail, daysConsumed.value);
  } else {
    addResultText();
  }
});

function checkAvaiWFH(totalWFO, totalDaysFinal) {
  return totalDaysFinal - totalWFO;
}

function addResultText(totalWFO, totalDaysFinal) {
  if (totalWFO > 0) {
    result.innerText = `Result: You can do ${
      totalDaysFinal - totalWFO
    } WFH in this Quarter`;
  } else {
    result.classList.add("text-center");
    result.innerText = `Please Enter Quarter and Target Percentage`;
  }
}

function addResultText1(available, daysConsumed) {
  result.innerText = `Result: Remaining ${
    available - daysConsumed
  } WFH in this Quarter`;
}

function targeDays(totalDays, targetPercentage) {
  targetPercentage = targetPercentage / 100;
  return Math.ceil(totalDays * targetPercentage);
}

function quaterCall(firstValue) {
  let totalDays = 0;
  for (let i = 0; i < 3; i++) {
    totalDays += getWorkingDaysInMonth(2024, firstValue);
    firstValue++;
  }
  return totalDays;
}

function getFirstValue(inputString) {
  let parts = inputString.split("-");
  return Number(parts[0]);
}

function getWorkingDaysInMonth(year, month) {
  let startDate = new Date(year, month - 1, 1);
  let endDate = new Date(year, month, 0);
  let workingDays = 0;

  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    let dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays++;
    }
  }

  return workingDays;
}

// Calendar attendance logic
function initCalendar() {
  const calendar = document.getElementById("calendar");
  const attendanceCount = document.getElementById("attendanceCount");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");

  // Retrieve attendance data from local storage
  let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

  // Event listeners for month and year selection changes
  monthSelect.addEventListener("change", renderCalendar);
  yearSelect.addEventListener("change", renderCalendar);

  // Function to render the calendar
  function renderCalendar() {
    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);

    // Clear existing calendar
    calendar.innerHTML = "";

    // Get number of days in the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday, 6 = Saturday

    // Create empty divs for leading empty days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyElement = document.createElement("div");
      calendar.appendChild(emptyElement);
    }

    // Render the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.textContent = day;

      // Determine if it's a Saturday or Sunday
      const date = new Date(selectedYear, selectedMonth, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dayElement.classList.add("weekend"); // Add a class for weekends
        dayElement.style.backgroundColor = "red"; // Set background color
        dayElement.style.color = "white"; // Set text color
        dayElement.style.cursor = "not-allowed"; // Change cursor
        dayElement.title = "Attendance cannot be marked"; // Add tooltip
      } else {
        const attendanceKey = `${selectedYear}-${selectedMonth}-${day}`;
        if (attendance[attendanceKey]) {
          debugger
          dayElement.classList.add("attended");
        }
        // debugger;
        // Toggle attendance on click for weekdays only
        dayElement.addEventListener("click", () => {
          // debugger
          const attended = attendance[attendanceKey];

          // If the user is trying to remove attendance, show confirmation modal
          if (attended) {
            // Show the modal
            const modal = new bootstrap.Modal(
              document.getElementById("confirmationModal")
            );
            modal.show();

            // Handle confirmation button click
            const confirmRemoveButton =
              document.getElementById("confirmRemove");
            confirmRemoveButton.onclick = () => {
              // Remove attendance
              delete attendance[attendanceKey];
              localStorage.setItem("attendance", JSON.stringify(attendance));
              dayElement.classList.remove("attended"); // Update the class
              updateAttendanceCount(selectedMonth, selectedYear);
              modal.hide(); // Hide the modal
            };
          } else {
            // Mark attendance
            attendance[attendanceKey] = true;
            localStorage.setItem("attendance", JSON.stringify(attendance));
            dayElement.classList.add("attended"); // Update the class
            updateAttendanceCount(selectedMonth, selectedYear);
          }
        });
      }

      calendar.appendChild(dayElement);
    }

    updateAttendanceCount(selectedMonth, selectedYear);
  }

  // Update the total attendance count based on the selected month and year
  function updateAttendanceCount(selectedMonth, selectedYear) {
    const totalAttendance = Object.keys(attendance).filter((key) => {
      const [year, month, day] = key.split("-");
      return (
        parseInt(month) === selectedMonth &&
        parseInt(year) === selectedYear &&
        attendance[key]
      );
    }).length;

    attendanceCount.textContent = totalAttendance;
  }

  // Initial render of the calendar when the page loads
  renderCalendar();
}
