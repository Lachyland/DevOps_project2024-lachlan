function addStudent() {
    var response = "";
    var jsonData = new Object();
    jsonData.adminNumber = document.getElementById("adminnumber").value;
    jsonData.name = document.getElementById("name").value;
    jsonData.diploma = document.getElementById("diploma").value;
    jsonData.cGPA = document.getElementById("cgpa").value;
    if (jsonData.adminNumber == "" || jsonData.name == "" || jsonData.diploma == "" || jsonData.cGPA == "") {
        document.getElementById("message").innerHTML = 'All fields are required!';
        document.getElementById("message").setAttribute("class", "text-danger");
        return;
    }
    var request = new XMLHttpRequest();
    request.open("POST", "/add-student", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function () {
        response = JSON.parse(request.responseText);
        console.log(response)
        if (response.message == undefined) {
            document.getElementById("message").innerHTML = 'Added Student: ' +
                jsonData.adminNumber + '!';
            document.getElementById("message").setAttribute("class", "text-success");
            document.getElementById("adminnumber").value = "";
            document.getElementById("name").value = "";
            document.getElementById("diploma").value = "";
            document.getElementById("cgpa").value = "";
            window.location.href = 'index.html';
        }
        else {
            document.getElementById("message").innerHTML = 'Unable to add resource!'; document.getElementById("message").setAttribute("class", "text-danger");
            document.getElementById("message").setAttribute("class", "text-danger");
        }
    };
    request.send(JSON.stringify(jsonData));
}