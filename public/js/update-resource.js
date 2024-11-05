function updateStudent() {
    var response = "";

    var jsonData = new Object();
    jsonData.adminNumber = document.getElementById("adminNumber").value;
    jsonData.name = document.getElementById("name").value;
    jsonData.diploma = document.getElementById("diploma").value;
    jsonData.cGPA = document.getElementById("cGPA").value;

    if (jsonData.adminNumber == "" || jsonData.name == "" || jsonData.diploma == "" || jsonData.cGPA == "") {
    document.getElementById("message").innerHTML = 'All fields are required!';
    document.getElementById("message").setAttribute("class", "text-danger");
    return;
    }

    var request = new XMLHttpRequest();

    request.open("PUT", "/update-student", true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);
        console.log(response)
        if (response.message == undefined) {
            document.getElementById("message").innerHTML = 'Updated Resource: ' +
    jsonData.name + '!';
            document.getElementById("message").setAttribute("class", "text-success");
            document.getElementById("adminNumber").value = "";
            document.getElementById("name").value = "";
            document.getElementById("diploma").value = "";
            document.getElementById("cGPA").value = "";
            window.location.href = 'index.html';
        }
        else {
            document.getElementById("message").innerHTML = 'Unable to add resource!'; 
            document.getElementById("message").setAttribute("class", "text-danger");
            document.getElementById("message").setAttribute("class", "text-danger");
        }
    };
    
    request.send(JSON.stringify(jsonData));
}