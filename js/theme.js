/* ============================================
   Theme Manager - Light/Dark theme toggle
   ============================================ */

const ThemeManager = {
    STORAGE_KEY: 'familyTreeTheme',
    currentTheme: 'light',

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
            this.currentTheme = saved;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            }
        }
        this.apply();
        return this.currentTheme;
    },

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
        this.apply();
    },

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        this.currentTheme = theme;
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.apply();
    },

    apply() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        // Update toggle button icon
        const toggleBtn = document.getElementById('btnThemeToggle');
        if (toggleBtn) {
            const sunIcon = toggleBtn.querySelector('.icon-sun');
            const moonIcon = toggleBtn.querySelector('.icon-moon');
            if (sunIcon && moonIcon) {
                if (this.currentTheme === 'dark') {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                } else {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                }
            }
        }
    },

    isDark() {
        return this.currentTheme === 'dark';
    }
};
