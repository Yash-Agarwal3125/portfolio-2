document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Add scroll event listener with passive true for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check on load
    handleScroll();

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    const toggleTheme = () => {
        // Add class for animating the transition
        document.documentElement.classList.add('theme-transition');
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Remove the transition class after animation completes
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 250);
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});
