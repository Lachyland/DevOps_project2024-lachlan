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

    // Check image file validation if new image is selected
    if (imageFile) {
        // Check file size (not more than 50KB)
        if (imageFile.size > 50 * 1024) {
            document.getElementById("editMessage").innerHTML = 'The image size exceeds 50KB. Please upload a smaller image.';
            document.getElementById("editMessage").setAttribute("class", "text-danger");
            return;
        }

        // Check if the image is square
        const reader = new FileReader();
        reader.onload = function () {
            const img = new Image();
            img.onload = function () {
                if (img.width !== img.height) {
                    document.getElementById("editMessage").innerHTML = 'The image must be square!';
                    document.getElementById("editMessage").setAttribute("class", "text-danger");
                    return;
                }

                // Proceed with sending the data if validation passes
                jsonData.image = reader.result; // Base64 image data
                sendUpdateRequest(jsonData); // Call function to send data to server
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(imageFile); // Read the image as base64 string
    } else {
        // If no new image, send the existing image URL or a placeholder
        jsonData.image = document.getElementById('editImagePreview').src || "";
        sendUpdateRequest(jsonData); // Call function to send data to server
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
