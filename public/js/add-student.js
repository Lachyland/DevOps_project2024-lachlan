function addStudent() {
    var response = "";
    var jsonData = {
        adminNumber: document.getElementById("adminnumber").value,
        name: document.getElementById("name").value,
        diploma: document.getElementById("diploma").value,
        cGPA: document.getElementById("cgpa").value,
    };
    const imageFile = document.getElementById("studentImage").files[0];

    if (jsonData.adminNumber === "" || jsonData.name === "" || jsonData.diploma === "" || jsonData.cGPA === "") {
        document.getElementById("message").innerHTML = 'All fields are required!';
        document.getElementById("message").setAttribute("class", "text-danger");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function () {
        jsonData.image = reader.result; // Image in Base64

        var request = new XMLHttpRequest();
        request.open("POST", "/add-student", true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            response = JSON.parse(request.responseText);
            console.log(response);
            if (response.message == undefined) {
                document.getElementById("message").innerHTML = 'Added Student: ' + jsonData.adminNumber + '!';
                document.getElementById("message").setAttribute("class", "text-success");
                document.getElementById("adminnumber").value = "";
                document.getElementById("name").value = "";
                document.getElementById("diploma").value = "";
                document.getElementById("cgpa").value = "";
                document.getElementById("studentImage").value = "";
                window.location.href = 'index.html';
            } else {
                document.getElementById("message").innerHTML = 'Unable to add student!';
                document.getElementById("message").setAttribute("class", "text-danger");
            }
        };
        request.send(JSON.stringify(jsonData));
    };
    reader.readAsDataURL(imageFile);
}

function previewImage(event) {
    const imagePreview = document.getElementById("imagePreview");
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result; // Set the image preview source to the Base64 string
            imagePreview.style.display = "block"; // Make the image visible
        };
        reader.readAsDataURL(file); // Convert the file to Base64
    } else {
        imagePreview.style.display = "none"; // Hide the image if no file is selected
    }
}
