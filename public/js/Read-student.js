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
                    const imageUrl = student.image || 'data:image/png;base64,defaultBase64String'; // Provide a fallback base64 image if none exists

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
