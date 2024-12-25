let allStudents = []; // Store the full list of students for filtering

// Display error messages on the page
function displayErrorMessage(message) {
    console.log("Displaying error message:", message); // Debug log
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.innerText = message;
    } else {
        const newErrorElement = document.createElement('div');
        newErrorElement.id = 'errorMessage';
        newErrorElement.innerText = message;
        document.body.appendChild(newErrorElement);
    }
}

function displayNoStudentsMessage() {
    const tableContent = document.getElementById('tableContent');
    const existingNoDataRow = tableContent.querySelector('tr.no-data');
    if (!existingNoDataRow) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.className = 'text-center no-data'; // Add a class for easier identification
        cell.innerText = 'No data available';
        row.appendChild(cell);
        tableContent.appendChild(row);
    }
}

function fetchAndDisplayStudents() {
    const searchName = document.getElementById('searchName').value;
    const sortCGPA = document.getElementById('sortCGPA').value;
    const filterDiploma = document.getElementById('filterDiploma').value;

    // Construct the query parameters
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (sortCGPA) params.append('sortCGPA', sortCGPA);
    if (filterDiploma) params.append('diploma', filterDiploma);

    const url = `/read-student?${params.toString()}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                allStudents = JSON.parse(xhr.responseText); // Store all students
                displayStudents(allStudents); // Display the students
            } catch (error) {
                const errorMsg = `Error parsing student data: ${error}`;
                console.error(errorMsg);
                displayErrorMessage(errorMsg);  // Display error on the page
            }
        } else {
            const errorMsg = `Failed to fetch student data: ${xhr.statusText}`;
            console.error(errorMsg);
            displayErrorMessage(errorMsg);  // Display error on the page
        }
    };

    xhr.onerror = function () {
        const errorMsg = 'Request error';
        console.error(errorMsg);
        displayErrorMessage(errorMsg);  // Display error on the page
    };

    xhr.send();
}

function filterStudents() {
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const sortCGPA = document.getElementById('sortCGPA').value;
    const filterDiploma = document.getElementById('filterDiploma').value;

    // Filter by name and diploma
    let filteredStudents = allStudents.filter(student => {
        const matchesName = student.name.toLowerCase().includes(searchName);
        const matchesDiploma = filterDiploma ? student.diploma === filterDiploma : true;
        return matchesName && matchesDiploma;
    });

    // Sort by cGPA
    if (sortCGPA) {
        filteredStudents.sort((a, b) => sortCGPA === 'desc' ? b.cGPA - a.cGPA : a.cGPA - b.cGPA);
    }

    displayStudents(filteredStudents); // Display the filtered and sorted students
}

// Display students in the table
function displayStudents(students) {
    let html = "";

    if (students.length === 0) {
        html = `<tr><td colspan="6" class="text-center">No data available</td></tr>`;   } else {
            students.forEach((student, index) => {
                const imageUrl = student.image || 'data:image/png;base64,defaultBase64String';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.adminNumber}</td>
                    <td>
                        <img src="${imageUrl}" alt="Student Photo" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; margin-right: 10px;">
                        ${student.name}
                    </td>
                    <td>${student.diploma}</td>
                    <td>${student.cGPA}</td>
                    <td>
                        <button class="btn btn-primary" onclick="openEditModal('${student.adminNumber}', '${student.name}', '${student.diploma}', '${student.cGPA}', '${imageUrl}')">Update</button>
                        <button class="btn btn-danger" onclick="deleteStudent('${student._id}')">Delete</button>
                    </td>
                `;
                tableContent.appendChild(row);
            });
        }

    document.getElementById('tableContent').innerHTML = html;
}
