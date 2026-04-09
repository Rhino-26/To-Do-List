document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let currentUser = localStorage.getItem('ethereal_user');
    let tasks = JSON.parse(localStorage.getItem('ethereal_tasks')) || [
        { id: '1', title: 'Refine Design System Architecture for Ethereal Pro', desc: 'Establish a new glassmorphic component library including atmospheric depth tokens and tonal layers.', completed: true, priority: 'high', dueDate: 'Due tomorrow', isDraft: false },
        { id: '2', title: 'Update Typography', desc: 'Switch main headers to Manrope Display for editorial edge.', completed: false, priority: 'normal', dueDate: '', isDraft: true },
        { id: '3', title: 'Color Palette Audit', desc: 'Check accessibility contrast ratios for obsidian blue surfaces.', completed: true, priority: 'normal', dueDate: '', isDraft: false },
        { id: '4', title: 'AI Content Generator Integration', desc: 'Scheduled for next sprint', completed: false, priority: 'normal', dueDate: '', isDraft: false },
        { id: '5', title: 'Final Iconography Sweep', desc: '4 sub-tasks remaining', completed: false, priority: 'normal', dueDate: '', isDraft: false }
    ];
    let currentFilter = 'all';

    // Views
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Navigation
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebar = document.getElementById('sidebar');

    // Tasks Elements
    const tasksContainer = document.getElementById('tasks-container');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const taskSearch = document.getElementById('task-search');
    const progressText = document.getElementById('task-progress-text');
    const progressFill = document.getElementById('task-progress-fill');

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-tasks');
    const darkModeToggleSettings = document.getElementById('dark-mode-toggle');
    const htmlElement = document.documentElement;

    // Modal
    const editModal = document.getElementById('edit-task-modal');
    const editTaskInput = document.getElementById('edit-task-input-text');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    let editingTaskId = null;

    // --- Initialization ---
    function init() {
        if (currentUser) {
            showDashboard();
        } else {
            showLogin();
        }

        // Load theme preference
        const savedTheme = localStorage.getItem('ethereal_theme') || 'dark';
        setTheme(savedTheme);

        renderTasks();
        startClocks();
    }

    // --- Authentication ---
    function showLogin() {
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }

    function showDashboard() {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    }

    function triggerWelcome() {
        const welcomeOverlay = document.getElementById('welcome-overlay');
        const welcomeMessage = document.getElementById('welcome-message');

        if (!welcomeOverlay || !welcomeMessage) return;

        let initialName = currentUser ? currentUser.split('@')[0] : "Curator";
        initialName = initialName.charAt(0).toUpperCase() + initialName.slice(1);
        welcomeMessage.textContent = `Welcome, ${initialName}`;

        welcomeOverlay.classList.remove('hidden');
        welcomeOverlay.classList.remove('fade-out');


        setTimeout(() => {
            welcomeOverlay.classList.add('fade-out');
            setTimeout(() => {
                welcomeOverlay.classList.add('hidden');
            }, 800); // Wait for css transition
        }, 2500);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        localStorage.setItem('ethereal_user', email);
        currentUser = email;
        showDashboard();
        triggerWelcome();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('ethereal_user');
        currentUser = null;
        showLogin();
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // --- Navigation ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => {
                if (page.id === targetId) {
                    page.classList.remove('hidden');
                    page.classList.add('active');
                } else {
                    page.classList.add('hidden');
                    page.classList.remove('active');
                }
            });

            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // --- Theme System ---
    function setTheme(themeName) {
        htmlElement.setAttribute('data-theme', themeName);
        localStorage.setItem('ethereal_theme', themeName);

        if (themeName === 'light') {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            if (darkModeToggleSettings) darkModeToggleSettings.checked = false;
        } else {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            if (darkModeToggleSettings) darkModeToggleSettings.checked = true;
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    if (darkModeToggleSettings) {
        darkModeToggleSettings.addEventListener('change', (e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
        });
    }

    // --- Task Management ---
    function saveTasks() {
        localStorage.setItem('ethereal_tasks', JSON.stringify(tasks));
        updateProgress();
    }

    function updateProgress() {
        if (tasks.length === 0) {
            progressText.innerText = '0% Complete';
            progressFill.style.width = '0%';
            return;
        }
        const completed = tasks.filter(t => t.completed).length;
        const percentage = Math.round((completed / tasks.length) * 100);
        progressText.innerText = `${percentage}% Complete`;
        progressFill.style.width = `${percentage}%`;
    }

    function renderTasks() {
        const searchTerm = taskSearch.value.toLowerCase();
        let filteredTasks = tasks.filter(t => {
            if (currentFilter === 'pending' && t.completed) return false;
            if (currentFilter === 'completed' && !t.completed) return false;
            if (searchTerm && !t.title.toLowerCase().includes(searchTerm)) return false;
            return true;
        });

        tasksContainer.innerHTML = '';

        filteredTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card ${task.priority === 'high' ? 'priority-high' : ''} ${task.completed ? 'completed' : ''}`;

            let statusBadge = '';
            if (task.completed) statusBadge = 'COMPLETED';
            else if (task.priority === 'high') statusBadge = 'HIGH PRIORITY';
            else if (task.isDraft) statusBadge = 'DRAFT';

            // Safe content injection
            card.innerHTML = `
                <div>
                    <div class="task-header">
                        <div class="status-badge">${statusBadge}</div>
                        ${task.priority === 'high' ? '<i class="fa-solid fa-ellipsis" style="color:var(--text-secondary);cursor:pointer;"></i>' : ''}
                    </div>
                    <div class="task-content">
                        <h3></h3>
                        <p></p>
                    </div>
                </div>
                <div class="task-footer">
                    <button class="mark-btn ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                        <i class="fa-${task.completed ? 'solid' : 'regular'} fa-circle-check"></i> 
                        ${task.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                    <div class="task-actions">
                        <button class="action-btn btn-edit" data-id="${task.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-delete" data-id="${task.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;

            card.querySelector('h3').textContent = task.title;
            card.querySelector('p').textContent = task.desc || '';

            if (task.dueDate && task.priority === 'high') {
                const markBtn = card.querySelector('.mark-btn');
                const dueSpan = document.createElement('span');
                dueSpan.style.marginLeft = '1rem';
                dueSpan.style.color = 'var(--text-muted)';
                dueSpan.style.fontSize = '0.8rem';
                dueSpan.innerHTML = `• &nbsp;&nbsp;<i class="fa-regular fa-calendar"></i> ${task.dueDate}`;
                markBtn.parentNode.insertBefore(dueSpan, markBtn.nextSibling);
            }

            tasksContainer.appendChild(card);
        });

        updateProgress();
    }

    addTaskBtn.addEventListener('click', () => {
        const title = newTaskInput.value.trim();
        if (!title) return;

        const newTask = {
            id: Date.now().toString(),
            title: title,
            desc: '',
            completed: false,
            priority: 'normal',
            dueDate: '',
            isDraft: false
        };

        tasks.unshift(newTask);
        newTaskInput.value = '';
        saveTasks();
        renderTasks();
    });

    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTaskBtn.click();
    });

    tasksContainer.addEventListener('click', (e) => {
        const target = e.target;

        // Mark complete
        const markBtn = target.closest('.mark-btn');
        if (markBtn) {
            const id = markBtn.getAttribute('data-id');
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            }
        }

        // Delete
        const delBtn = target.closest('.btn-delete');
        if (delBtn) {
            const id = delBtn.getAttribute('data-id');
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }

        // Edit
        const editBtn = target.closest('.btn-edit');
        if (editBtn) {
            const id = editBtn.getAttribute('data-id');
            const task = tasks.find(t => t.id === id);
            if (task) {
                editingTaskId = id;
                editTaskInput.value = task.title;
                editModal.classList.remove('hidden');
            }
        }
    });

    // Filtering
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Searching
    taskSearch.addEventListener('input', renderTasks);

    // Edit Modal
    cancelEditBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
        editingTaskId = null;
    });

    saveEditBtn.addEventListener('click', () => {
        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.title = editTaskInput.value.trim();
                saveTasks();
                renderTasks();
            }
        }
        editModal.classList.add('hidden');
        editingTaskId = null;
    });


    // --- Global Pulse (Clock System) ---
    function updateClock() {
        const now = new Date();

        // Update Main Clock (London / Local)
        const mainClockEl = document.getElementById('main-clock');
        const mainDateEl = document.getElementById('main-date');

        if (mainClockEl && mainDateEl) {
            const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Europe/London' };
            const timeString = new Intl.DateTimeFormat('en-GB', optionsTime).format(now);

            const [time, period] = timeString.split(' ');
            mainClockEl.innerHTML = `${time}<span class="am-pm">${period ? period.toUpperCase() : ''}</span>`;

            const optionsDate = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Europe/London' };
            mainDateEl.textContent = new Intl.DateTimeFormat('en-GB', optionsDate).format(now);
        }

        // Update Grid Clocks
        const clockCards = document.querySelectorAll('.clock-card[data-tz]');
        clockCards.forEach(card => {
            const tz = card.getAttribute('data-tz');
            const timeEl = card.querySelector('.region-time');
            const diffEl = card.querySelector('.time-diff');

            try {
                // Get time in that timezone
                const tzOptions = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz };
                const tzTime = new Intl.DateTimeFormat('en-GB', tzOptions).format(now);
                timeEl.textContent = tzTime;

                // Calculate Diff roughly against UTC
                // Simplified relative day indicator based on hour difference
                const localHour = now.getHours();
                const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
                const tzHour = tzDate.getHours();

                let dayStr = "Same Day";
                if (tzDate.getDate() > now.getDate() || (tzDate.getMonth() > now.getMonth())) {
                    dayStr = "Next Day";
                } else if (tzDate.getDate() < now.getDate()) {
                    dayStr = "Prev Day";
                }

                // Get offset in hours
                // This is a rough estimation for UI display matching the design
                diffEl.innerHTML = `${dayStr} • Active`;

            } catch (e) {
                timeEl.textContent = '--:--';
            }
        });
    }

    function startClocks() {
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Initialize the app
    init();
});
