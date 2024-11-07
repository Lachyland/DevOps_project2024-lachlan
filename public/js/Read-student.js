let allStudents = []; // Store the full list of students for filtering

function fetchAndDisplayStudents() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/read-student', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                allStudents = JSON.parse(xhr.responseText); // Store all students
                filterStudents(); // Initial display with no filters
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

function displayStudents(students) {
    let html = "";

    students.forEach((student, index) => {
        const imageUrl = student.image || 'data:image/png;base64,defaultBase64String';

        html += `<tr>
                    <td>${index + 1}</td>
                    <td>${student.adminNumber}</td>
                    <td>
                        <img src="${imageUrl}" alt="Student Photo" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; margin-right: 10px;">
                        ${student.name}
                    </td>
                    <td>${student.diploma}</td>
                    <td>${student.cGPA}</td>
                    <td>
                        <button class="btn btn-primary" onclick="updateStudent('${student._id}')">Update</button>
                    </td>
                 </tr>`;
    });

    document.getElementById('tableContent').innerHTML = html;
}
