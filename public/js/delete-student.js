// public/js/Read-student.js
function deleteStudent(studentId) {
    if (confirm("Are you sure you want to delete this student?")) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `/delete-student/${studentId}`, true);

        xhr.onload = function () {
            if (xhr.status === 200) {
                alert('Student deleted successfully.');
                fetchAndDisplayStudents(); // Refresh the list of students
            } else {
                console.error('Failed to delete student:', xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error('Request error');
        };

        xhr.send();
    }
}
