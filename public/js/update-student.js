let imageFile = null; // Global variable to hold the selected image

function updateStudent() {
    let response = "";

    // Collect data from form fields
    const jsonData = {
        adminNumber: document.getElementById("editAdminNumber").value,
        name: document.getElementById("editName").value,
        diploma: document.getElementById("editDiploma").value,
        cGPA: document.getElementById("editCGPA").value,
    };

    // Log adminNumber and other data for debugging
    console.log('Sending data to update student:', jsonData);

    // Validation for required fields
    if (!jsonData.adminNumber || !jsonData.name || !jsonData.diploma || !jsonData.cGPA) {
        document.getElementById("editMessage").innerHTML = 'All fields are required!';
        document.getElementById("editMessage").setAttribute("class", "text-danger");
        return;
    }

    // Validate admin number length
    if (jsonData.adminNumber.length !== 8) {
        document.getElementById("editMessage").innerHTML = 'Admin number must be exactly 8 characters!';
        document.getElementById("editMessage").setAttribute("class", "text-danger");
        return;
    }

    // Validate cGPA range
    if (parseFloat(jsonData.cGPA) >= 4.1) {
        document.getElementById("editMessage").innerHTML = 'cGPA must be below 4.0!';
        document.getElementById("editMessage").setAttribute("class", "text-danger");
        return;
    }

    // Prepare image as a base64 string using FileReader
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = function () {
            // When file is read, use the base64 string
            jsonData.image = reader.result;

            // Now send the data to the server
            sendUpdateRequest(jsonData);
        };
        reader.readAsDataURL(imageFile); // Read the image as a base64 string
    } else {
        // If no image, send the existing image URL or a placeholder
        jsonData.image = document.getElementById('editImagePreview').src || "";

        // Now send the data to the server
        sendUpdateRequest(jsonData);
    }
}

function sendUpdateRequest(jsonData) {
    const request = new XMLHttpRequest();
    request.open("PUT", "/update-student", true);

    request.onload = function () {
        let response = JSON.parse(request.responseText); // Parse the response

        // Log the response for debugging
        console.log(response);

        if (response.message === 'Student updated successfully') {
            // Display success message if student is updated successfully
            document.getElementById("editMessage").innerHTML = `Updated student: ${jsonData.name}!`;
            document.getElementById("editMessage").setAttribute("class", "text-success");

            // Clear form fields after a successful update
            document.getElementById("editAdminNumber").value = "";
            document.getElementById("editName").value = "";
            document.getElementById("editDiploma").value = "";
            document.getElementById("editCGPA").value = "";

            // Close the modal
            var studentModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
            studentModal.hide();
            location.reload();
        } else {
            // If the response message is not as expected, show an error
            document.getElementById("editMessage").innerHTML = 'Unable to update student!';
            document.getElementById("editMessage").setAttribute("class", "text-danger");
        }
    };

    // Send the request with JSON data
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(jsonData));
}

function openEditModal(adminNumber, name, diploma, cGPA, imageUrl) {
    // Populate the modal fields with the student’s data
    document.getElementById('editAdminNumber').value = adminNumber;
    document.getElementById('editName').value = name;
    document.getElementById('editDiploma').value = diploma;
    document.getElementById('editCGPA').value = cGPA;

    // Display the student's image if available
    const imagePreview = document.getElementById('editImagePreview');
    imagePreview.src = imageUrl;
    imagePreview.style.display = 'block';

    // Change modal title and button for updating
    document.getElementById('editStudentModalLabel').innerText = "Update Student";
    const updateButton = document.querySelector('#editStudentModal .btn-primary');
    updateButton.innerText = "Update Student";
    updateButton.onclick = updateStudent; // Attach updateStudent function to the button

    // Show the modal
    var studentModal = new bootstrap.Modal(document.getElementById('editStudentModal'));
    studentModal.show();
}

function previewEditImage(event) {
    // Set the global `imageFile` to the selected file
    imageFile = event.target.files[0];

    // Display the image preview
    const imagePreview = document.getElementById('editImagePreview');
    if (imageFile) {
        imagePreview.src = URL.createObjectURL(imageFile);
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
    }
}
