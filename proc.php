<?php
header('Content-Type: application/json');

$dsn = 'mysql:host=localhost;dbname=todo_list';
$username = 'root';
$password = '';

try {
    $conn = new PDO($dsn, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

function executeQuery($conn, $sql, $params) {
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return ['success' => true];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $response = ['success' => false, 'message' => 'Invalid action'];

    if ($action === 'submit' || $action === 'edit') {
        $id = $action === 'edit' ? intval($_POST['id']) : null;
        $task = $_POST['task'];
        $category = $_POST['category'];
        $priority = $_POST['priority'];
        $planned_end_date = $_POST['planned_end_date'];

        $sql = $action === 'submit' 
            ? "INSERT INTO tasks (task, category, priority, planned_end_date) VALUES (?, ?, ?, ?)" 
            : "UPDATE tasks SET task=?, category=?, priority=?, planned_end_date=? WHERE id=?";
        $params = $action === 'submit' 
            ? [$task, $category, $priority, $planned_end_date] 
            : [$task, $category, $priority, $planned_end_date, $id];

        $response = executeQuery($conn, $sql, $params);
    } elseif ($action === 'delete') {
        $id = intval($_POST['id']);
        $response = executeQuery($conn, "DELETE FROM tasks WHERE id=?", [$id]);
    } elseif ($action === 'add_comment') {
        $task_id = intval($_POST['task_id']);
        $comment = $_POST['comment'];
        $response = executeQuery($conn, "INSERT INTO comments (task_id, comment) VALUES (?, ?)", [$task_id, $comment]);
    }

    echo json_encode($response);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['task_id'])) {
        $task_id = intval($_GET['task_id']);
        $stmt = $conn->prepare("SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC");
        $stmt->execute([$task_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($comments);
        exit;
    }

    $stmt = $conn->query("SELECT * FROM tasks");
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($tasks);
}

$conn = null;
?>
