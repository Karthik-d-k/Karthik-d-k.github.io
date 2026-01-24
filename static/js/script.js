const toggleButton = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeSound = document.getElementById('theme-sound');

// Function to update the theme icon based on the current theme
const updateThemeIcon = (isDarkMode) => {
    const themeMode = isDarkMode ? 'darkMode' : 'lightMode';
    const iconPath = themeIcon.querySelector('use').getAttribute('href').replace(/#.*$/, `#${themeMode}`);
    themeIcon.querySelector('use').setAttribute('href', iconPath);
};

// Function to update the theme based on the current mode
const updateTheme = (isDarkMode) => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(isDarkMode);
};

// Function to toggle the theme
const toggleTheme = () => {
    const isDarkMode = toggleButton.checked;
    updateTheme(isDarkMode);
    themeSound.play();
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Add transition class to body for smooth transition
    document.body.classList.add('theme-transition');
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 300);
};

// Event listener for theme toggle
toggleButton.addEventListener('change', toggleTheme);

// Function to initialize the theme based on the stored preference
const initializeTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    const defaultTheme = window.DEFAULT_THEME || 'light';
    const isDarkMode = storedTheme
        ? storedTheme === 'dark'
        : defaultTheme === 'dark';
    toggleButton.checked = isDarkMode;
    updateTheme(isDarkMode);
};

// Initialize the theme
initializeTheme();

// Listen for changes in system preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initializeTheme);

// Search Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('search-modal');
    const modalInput = document.getElementById('search-modal-input');
    const modalResults = document.getElementById('search-modal-results');
    const modalEmpty = document.getElementById('search-modal-empty');
    const backdrop = modal?.querySelector('.search-modal-backdrop');
    const searchTrigger = document.getElementById('search-trigger');

    let index;
    let selectedIndex = -1;

    // Resolve a usable link from available fields
    const resolveDocLink = (doc) => {
        return doc.permalink
            || doc.url
            || (doc.path ? new URL(doc.path, window.location.origin).href : null);
    };

    const renderResults = (items, listElement, emptyElement) => {
        listElement.innerHTML = '';
        selectedIndex = -1;

        if (items.length === 0) {
            if (emptyElement) emptyElement.style.display = 'block';
            return;
        }

        if (emptyElement) emptyElement.style.display = 'none';

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const doc = index.documentStore.getDoc(item.ref);
            const href = resolveDocLink(doc);
            const li = document.createElement('li');
            li.setAttribute('data-index', i);
            li.innerHTML = href
                ? `<a href="${href}">${doc.title}</a>`
                : `<span>${doc.title}</span>`;
            listElement.appendChild(li);
        }
    };

    const clearResults = (listElement, emptyElement) => {
        listElement.innerHTML = '';
        if (emptyElement) emptyElement.style.display = 'none';
        selectedIndex = -1;
    };

    const updateSelection = () => {
        const items = modalResults.querySelectorAll('li');
        items.forEach((item, i) => {
            if (i === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    };

    const openModal = () => {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Focus immediately for mobile keyboard to appear
        modalInput.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        modalInput.value = '';
        clearResults(modalResults, modalEmpty);
    };

    // Fetch search index
    if (window.SEARCH_INDEX_URL) {
        fetch(window.SEARCH_INDEX_URL)
            .then(r => r.json())
            .then(json => { index = elasticlunr.Index.load(json); });
    }

    // Modal input event
    if (modalInput) {
        modalInput.addEventListener('input', (e) => {
            const q = e.target.value.trim();
            if (!index || q.length < 1) {
                clearResults(modalResults, modalEmpty);
                return;
            }
            const results = index.search(q, { expand: true });
            renderResults(results, modalResults, q.length > 0 ? modalEmpty : null);
        });

        // Keyboard navigation in modal
        modalInput.addEventListener('keydown', (e) => {
            const items = modalResults.querySelectorAll('li');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length > 0) {
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    updateSelection();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length > 0) {
                    selectedIndex = Math.max(selectedIndex - 1, 0);
                    updateSelection();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    const link = items[selectedIndex].querySelector('a');
                    if (link) window.location.href = link.href;
                } else if (items.length > 0) {
                    const link = items[0].querySelector('a');
                    if (link) window.location.href = link.href;
                }
            }
        });
    }

    // Search trigger click
    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    // Close on backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', closeModal);
    }

    // Close on ESC key, open on Cmd/Ctrl+K
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('open')) {
            closeModal();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (modal?.classList.contains('open')) {
                closeModal();
            } else {
                openModal();
            }
        }
    });

});
