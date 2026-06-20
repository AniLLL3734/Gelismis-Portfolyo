document.addEventListener('DOMContentLoaded', () => {
    // Initialize Particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: ['#7928ca', '#ff0080', '#00f0ff'] },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.1, width: 1 },
            move: { enable: true, speed: 1.5, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });

    // Load Projects
    const projectsGrid = document.getElementById('projects-grid');
    const loader = document.getElementById('loader');
    const totalReposEl = document.getElementById('total-repos');
    const totalStarsEl = document.getElementById('total-stars');
    const topLanguageEl = document.getElementById('top-language');
    const filtersContainer = document.getElementById('filters');
    
    let allProjects = [];
    let languages = new Set();

    fetch('repos.json')
        .then(response => response.json())
        .then(data => {
            allProjects = data;
            
            // Sort by updated date or stars
            allProjects.sort((a, b) => b.stargazerCount - a.stargazerCount || new Date(b.updatedAt) - new Date(a.updatedAt));

            // Calculate stats
            let totalStars = 0;
            let langCount = {};

            allProjects.forEach(repo => {
                totalStars += repo.stargazerCount;
                if (repo.primaryLanguage && repo.primaryLanguage.name) {
                    let lang = repo.primaryLanguage.name;
                    languages.add(lang);
                    langCount[lang] = (langCount[lang] || 0) + 1;
                }
            });

            // Find top language
            let topLang = '-';
            let maxCount = 0;
            for (let lang in langCount) {
                if (langCount[lang] > maxCount) {
                    maxCount = langCount[lang];
                    topLang = lang;
                }
            }

            // Update Stats UI
            animateValue(totalReposEl, 0, allProjects.length, 1500);
            animateValue(totalStarsEl, 0, totalStars, 1500);
            topLanguageEl.textContent = topLang;

            // Generate Filters
            languages.forEach(lang => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.filter = lang;
                btn.textContent = lang;
                filtersContainer.appendChild(btn);
            });

            // Add filter event listeners
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    filterProjects(e.target.dataset.filter);
                });
            });

            // Hide loader and render all projects
            loader.style.display = 'none';
            renderProjects(allProjects);
        })
        .catch(err => {
            console.error('Error loading repos:', err);
            loader.innerHTML = '<p style="color: #ff0080;">Projeler yüklenirken bir hata oluştu.</p>';
        });

    function renderProjects(projects) {
        projectsGrid.innerHTML = '';
        projects.forEach(repo => {
            const langName = repo.primaryLanguage ? repo.primaryLanguage.name : 'Çeşitli';
            const langColor = getLanguageColor(langName);
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${repo.name}</h3>
                    <div class="project-links">
                        <a href="${repo.url}" target="_blank" title="GitHub'da Görüntüle"><i class="fab fa-github"></i></a>
                    </div>
                </div>
                <p class="project-desc">${repo.description || 'Açıklama bulunmuyor.'}</p>
                <div class="project-footer">
                    <span class="tech-tag">
                        <span class="tech-dot" style="background-color: ${langColor}"></span>
                        ${langName}
                    </span>
                    <span class="project-stars">
                        <i class="fas fa-star"></i> ${repo.stargazerCount}
                    </span>
                </div>
            `;
            projectsGrid.appendChild(card);
        });
    }

    function filterProjects(filter) {
        if (filter === 'all') {
            renderProjects(allProjects);
        } else {
            const filtered = allProjects.filter(repo => 
                repo.primaryLanguage && repo.primaryLanguage.name === filter
            );
            renderProjects(filtered);
        }
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function getLanguageColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'C++': '#f34b7d',
            'C#': '#178600',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Java': '#b07219',
            'Vue': '#41b883',
            'PHP': '#4F5D95'
        };
        return colors[lang] || '#a0a0b0';
    }
});
