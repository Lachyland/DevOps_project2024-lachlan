function fetchAndDisplayStudents() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/read-student', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const students = JSON.parse(xhr.responseText);
                let html = "";

                // Build the table rows with student data
                students.forEach((student, index) => {
                    html += `<tr>
                                <td>${index + 1}</td>
                                <td>${student.adminNumber}</td>
                                <td>${student.name}</td>
                                <td>${student.diploma}</td>
                                <td>${student.cGPA}</td> <!-- Directly use cGPA here -->
                             </tr>`;
                });

                // Insert the generated HTML into the table body
                document.getElementById('tableContent').innerHTML = html;
            } catch (error) {
                console.error("Error parsing student data:", error);
            }
        } else {
            console.error('Failed to fetch student data:', xhr.statusText);
        }
    };

    xhr.onerror = function () {
        console.error('Request error');
    };

    xhr.send();
}

// Ensure function runs on DOM load
document.addEventListener("DOMContentLoaded", fetchAndDisplayStudents);
