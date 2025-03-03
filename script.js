document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskInput = taskForm.querySelector('input[name="task"]');
        const categorySelect = taskForm.querySelector('select[name="category"]');
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;

        if (taskText === '') return;

        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            <span>${taskText} (${category})</span>
            <button class="delete-btn">Usuń</button>
        `;

        taskList.appendChild(taskItem);
        taskInput.value = '';
        categorySelect.selectedIndex = 0;
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.target.parentElement.remove();
        }
    });
});
