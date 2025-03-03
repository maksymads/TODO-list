<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "todo_list";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Błąd połączenia: " . $conn->connect_error);
}

if (isset($_POST['submit'])) {
    $task = $conn->real_escape_string($_POST['task']);
    $category = $conn->real_escape_string($_POST['category']);

    $sql = "INSERT INTO tasks (task, category) VALUES ('$task', '$category')";
    
    if ($conn->query($sql) === TRUE) {
        header("Location: index.html");
    } else {
        echo "Błąd: " . $conn->error;
    }
}

$conn->close();
?>
