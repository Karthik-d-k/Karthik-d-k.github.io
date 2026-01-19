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
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    toggleButton.checked = isDarkMode;
    updateTheme(isDarkMode);
};

// Initialize the theme
initializeTheme();

// Listen for changes in system preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initializeTheme);

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    const list = document.getElementById('search-results');
    let index;

    // Resolve a usable link from available fields
    const resolveDocLink = (doc) => {
        // Prefer absolute permalink/url; fall back to site-relative path
        return doc.permalink
            || doc.url
            || (doc.path ? new URL(doc.path, window.location.origin).href : null);
    };

    const render = (items) => {
        list.innerHTML = '';
        for (const item of items) {
            const doc = index.documentStore.getDoc(item.ref);
            const href = resolveDocLink(doc);
            const li = document.createElement('li');
            li.innerHTML = href
                ? `<a href="${href}">${doc.title}</a>`
                : `<span>${doc.title}</span>`;
            list.appendChild(li);
        }
    };

    const clear = () => { list.innerHTML = ''; };

    fetch(window.SEARCH_INDEX_URL)
        .then(r => r.json())
        .then(json => { index = elasticlunr.Index.load(json); });

    input.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        if (!index || q.length < 2) { clear(); return; }
        const results = index.search(q, { expand: true });
        render(results);
    });
});
