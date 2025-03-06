document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const submitBtn = document.getElementById('submit-btn');
    const editBtn = document.getElementById('edit-btn');
    const taskIdInput = document.getElementById('task-id');
    const actionInput = document.getElementById('action');

    const addTaskToDOM = (task, category, priority, plannedEndDate, id = null) => {
        const taskItem = document.createElement('li');
        if (id) taskItem.dataset.id = id;
        taskItem.innerHTML = `
            <span class="task-text">${task} (${category}, ${priority}${plannedEndDate ? `, ${new Date(plannedEndDate).toLocaleString()}` : ''})</span>
            <div class="actions">
                <button class="edit-btn">Edytuj</button>
                <button class="delete-btn">Usuń</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    };

    const loadTasks = async () => {
        const response = await fetch('proc.php');
        const tasks = await response.json();
        taskList.innerHTML = '';
        tasks.forEach(task => addTaskToDOM(task.task, task.category, task.priority, task.planned_end_date, task.id));
    };

    const enableEditMode = (taskItem) => {
        const taskText = taskItem.querySelector('.task-text').textContent.split(' (')[0];
        const [category, priority, plannedEndDateText] = taskItem.querySelector('.task-text').textContent.split(' (')[1].split(', ');
        const plannedEndDateValue = plannedEndDateText && !isNaN(new Date(plannedEndDateText)) ? new Date(plannedEndDateText).toISOString().slice(0, 16) : '';

        taskItem.innerHTML = `
            <div class="edit-form">
                <input type="text" class="edit-task" value="${taskText}" required>
                <select class="edit-category">
                    <option value="Praca" ${category === 'Praca' ? 'selected' : ''}>Praca</option>
                    <option value="Osobiste" ${category === 'Osobiste' ? 'selected' : ''}>Osobiste</option>
                </select>
                <select class="edit-priority">
                    <option value="Niski" ${priority === 'Niski' ? 'selected' : ''}>Niski</option>
                    <option value="Średni" ${priority === 'Średni' ? 'selected' : ''}>Średni</option>
                    <option value="Wysoki" ${priority === 'Wysoki' ? 'selected' : ''}>Wysoki</option>
                </select>
                <input type="datetime-local" class="edit-planned-end-date" value="${plannedEndDateValue}">
                <div class="comments-section">
                    <h3>Komentarze</h3>
                    <ul class="comments-list"></ul>
                    <form class="comment-form">
                        <input type="hidden" name="task_id" class="comment-task-id">
                        <textarea name="comment" placeholder="Dodaj komentarz" required></textarea>
                        <button type="submit">Dodaj komentarz</button>
                    </form>
                </div>
                <div class="edit-buttons">
                    <button class="save-btn">Zapisz</button>
                    <button class="cancel-btn">Anuluj</button>
                </div>
            </div>
        `;

        const commentForm = taskItem.querySelector('.comment-form');
        commentForm.querySelector('.comment-task-id').value = taskItem.dataset.id;
        loadComments(taskItem.dataset.id, taskItem);

        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            formData.append('action', 'add_comment');

            const response = await fetch('proc.php', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) {
                loadComments(taskItem.dataset.id, taskItem);
                this.reset();
            }
        });
    };

    const loadComments = async (taskId, taskItem) => {
        const response = await fetch(`proc.php?task_id=${taskId}`);
        const comments = await response.json();
        const commentsList = taskItem.querySelector('.comments-list');
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.textContent = comment.comment;
            commentsList.appendChild(commentItem);
        });
    };

    const saveTask = async (taskItem, id) => {
        const taskText = taskItem.querySelector('.edit-task').value.trim();
        const category = taskItem.querySelector('.edit-category').value;
        const priority = taskItem.querySelector('.edit-priority').value;
        const plannedEndDate = taskItem.querySelector('.edit-planned-end-date').value;

        if (!taskText) return;

        const formData = new FormData();
        formData.append('id', id);
        formData.append('task', taskText);
        formData.append('category', category);
        formData.append('priority', priority);
        formData.append('planned_end_date', plannedEndDate);
        formData.append('action', 'edit');

        const response = await fetch('proc.php', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) loadTasks();
    };

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(taskForm);
        const response = await fetch('proc.php', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
            loadTasks();
            taskForm.reset();
            editBtn.style.display = 'none';
            submitBtn.style.display = 'inline';
            actionInput.value = 'submit';
        } else {
            console.error('Error:', data.message);
        }
    });

    taskList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const taskItem = e.target.closest('li');
            if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
                const response = await fetch('proc.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `id=${taskItem.dataset.id}&action=delete`
                });
                const data = await response.json();
                if (data.success) loadTasks();
            }
        } else if (e.target.classList.contains('edit-btn')) {
            enableEditMode(e.target.closest('li'));
        } else if (e.target.classList.contains('save-btn')) {
            saveTask(e.target.closest('li'), e.target.closest('li').dataset.id);
        } else if (e.target.classList.contains('cancel-btn')) {
            loadTasks();
        }
    });

    loadTasks();
});
