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

    if (!imageFile) {
        document.getElementById("message").innerHTML = 'Image is required!';
        document.getElementById("message").setAttribute("class", "text-danger");
        return;
    }

    if (jsonData.adminNumber.length !== 8) {
        document.getElementById("message").innerHTML = 'Admin number must be exactly 8 characters!';
        document.getElementById("message").setAttribute("class", "text-danger");
        return;
    }

    if (parseFloat(jsonData.cGPA) >= 4.1) {
        document.getElementById("message").innerHTML = 'cGPA must be below 4.0!';
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
                document.getElementById("message").innerHTML = 'Unable to add student! Admin Number already exists.';
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
        // Check if the file size is more than 50KB (50 * 1024 bytes)
        if (file.size > 50 * 1024) {
            alert("The image size exceeds 50KB. Please upload a smaller image.");
            imagePreview.style.display = "none";
            document.getElementById("studentImage").value = ""; // Reset the file input
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    if (img.width !== img.height) {
                        alert("The image must be square!");
                        imagePreview.style.display = "none";
                        document.getElementById("studentImage").value = "";
                    } else {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = "block";
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    } else {
        imagePreview.style.display = "none"; 
    }
}
