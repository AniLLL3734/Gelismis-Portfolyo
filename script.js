document.addEventListener('DOMContentLoaded', () => {
    // Advanced Galaxy Particles
    particlesJS('particles-js', {
        particles: {
            number: { value: 100, density: { enable: true, value_area: 1200 } },
            color: { value: ['#9d4edd', '#00f5ff', '#ff3366', '#ffffff'] },
            shape: { type: 'circle' },
            opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: '#9d4edd', opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'bubble' }, onclick: { enable: true, mode: 'repulse' }, resize: true },
            modes: { bubble: { distance: 250, size: 6, duration: 2, opacity: 0.8, speed: 3 }, repulse: { distance: 200, duration: 0.4 } }
        },
        retina_detect: true
    });

    const pinnedProjectsGrid = document.getElementById('pinned-projects-grid');
    const projectsGrid = document.getElementById('projects-grid');
    const loader = document.getElementById('loader');
    const totalReposEl = document.getElementById('total-repos');
    const totalStarsEl = document.getElementById('total-stars');
    const topLanguageEl = document.getElementById('top-language');
    const filtersContainer = document.getElementById('filters');
    const showMoreBtn = document.getElementById('show-more-btn');
    
    let allProjects = [];
    let languages = new Set();
    
    // Exactly pinned repos
    const pinnedNames = [
        "ImageForge",
        "lazer-rotalayici",
        "SwfToExe",
        "HTML5-to-EXE-PRO",
        "GithubAnalisti",
        "TTMTAL-Mobil"
    ];

    // Exclude garbage / DB repos
    const excludeNames = [
        "AnilVeSarkilari", "GAMEARCHIVE", "gfiles", "Repottmtal", 
        "Repottmtalchat", "RepoHack", "REPOMORGRAM", "REPOCS", 
        "Repo", "Repo2", "Repo3", "SpectreClient-Assets"
    ];

    // Fetch PUBLIC repos only from GitHub API
    fetch('https://api.github.com/users/AniLLL3734/repos?per_page=100')
        .then(response => response.json())
        .then(data => {
            // Filter out forks and excluded names
            allProjects = data.filter(repo => !repo.fork && !excludeNames.includes(repo.name));
            
            // Sort by updated date or stars
            allProjects.sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at));

            let totalStars = 0;
            let langCount = {};

            allProjects.forEach(repo => {
                totalStars += repo.stargazers_count;
                if (repo.language) {
                    let lang = repo.language;
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

            // Update Stats UI with animation
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

            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    filterProjects(e.target.dataset.filter);
                });
            });

            // Split into Pinned and Others
            const pinnedProjects = [];
            const otherProjects = [];

            allProjects.forEach(repo => {
                if (pinnedNames.includes(repo.name)) {
                    pinnedProjects.push(repo);
                } else {
                    otherProjects.push(repo);
                }
            });

            // Render Projects
            loader.style.display = 'none';
            renderProjectCards(pinnedProjects, pinnedProjectsGrid);
            renderProjectCards(otherProjects, projectsGrid);
            
            // Initialize Advanced 3D Tilt
            initTilt();

            // Handle Show More Button
            showMoreBtn.addEventListener('click', () => {
                const isHidden = projectsGrid.style.display === 'none';
                if (isHidden) {
                    projectsGrid.style.display = 'grid';
                    showMoreBtn.innerHTML = '<span>Daha Az Göster</span> <i class="fas fa-chevron-up"></i>';
                    
                    projectsGrid.style.opacity = 0;
                    setTimeout(() => {
                        projectsGrid.style.transition = 'opacity 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
                        projectsGrid.style.opacity = 1;
                        initTilt();
                    }, 50);

                } else {
                    projectsGrid.style.display = 'none';
                    showMoreBtn.innerHTML = '<span>Daha Fazla Göster</span> <i class="fas fa-chevron-down"></i>';
                    
                    // Reset filter
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
                    filterProjects('all');
                }
            });
        })
        .catch(err => {
            console.error('Error loading repos:', err);
            loader.innerHTML = '<p style="color: var(--secondary);">Projeler yüklenirken bir hata oluştu.</p>';
        });

    function renderProjectCards(projects, container) {
        container.innerHTML = '';
        projects.forEach(repo => {
            const langName = repo.language || 'Çeşitli';
            const langColor = getLanguageColor(langName);
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.lang = langName;
            card.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${repo.name}</h3>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" title="GitHub'da Görüntüle"><i class="fab fa-github"></i></a>
                        ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" title="Canlı Demo"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    </div>
                </div>
                <p class="project-desc">${repo.description || 'Açıklama bulunmuyor.'}</p>
                <div class="project-footer">
                    <span class="tech-tag" style="color: ${langColor}; border-color: ${langColor}40">
                        <span class="tech-dot" style="background-color: ${langColor}; box-shadow: 0 0 10px ${langColor}"></span>
                        ${langName}
                    </span>
                    <span class="project-stars">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function filterProjects(filter) {
        const cards = projectsGrid.querySelectorAll('.project-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.lang === filter) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount > 0 && projectsGrid.style.display === 'none') {
            projectsGrid.style.display = 'grid';
            showMoreBtn.innerHTML = '<span>Daha Az Göster</span> <i class="fas fa-chevron-up"></i>';
        }
    }

    function initTilt() {
        VanillaTilt.init(document.querySelectorAll(".project-card"), {
            max: 8,
            speed: 400,
            glare: true,
            "max-glare": 0.15,
            scale: 1.03
        });
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.25,
            scale: 1.05
        });
        VanillaTilt.init(document.querySelectorAll(".contact-box"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.1
        });
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
            'PHP': '#4F5D95',
            'Batchfile': '#C1F12E'
        };
        return colors[lang] || '#00f5ff';
    }
});
