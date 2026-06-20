document.addEventListener('DOMContentLoaded', () => {
    // Initialize Particles.js with a deeper, slower galaxy feel
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 1000 } },
            color: { value: ['#9d4edd', '#00f5ff', '#ffffff'] },
            shape: { type: 'circle' },
            opacity: { value: 0.3, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false } },
            size: { value: 2.5, random: true, anim: { enable: true, speed: 1, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 180, color: '#9d4edd', opacity: 0.15, width: 1 },
            move: { enable: true, speed: 0.8, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 200, line_linked: { opacity: 0.4 } }, push: { particles_nb: 3 } }
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
    
    // Exact names of the pinned repos
    const pinnedNames = [
        "ImageForge",
        "lazer-rotalayici",
        "SwfToExe",
        "HTML5-to-EXE-PRO",
        "GithubAnalisti",
        "TTMTAL-Mobil"
    ];

    fetch('repos.json')
        .then(response => response.json())
        .then(data => {
            allProjects = data;
            
            // Sort by updated date or stars
            allProjects.sort((a, b) => b.stargazerCount - a.stargazerCount || new Date(b.updatedAt) - new Date(a.updatedAt));

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

            // Render Pinned Projects
            loader.style.display = 'none';
            renderProjectCards(pinnedProjects, pinnedProjectsGrid);

            // Render Others hidden initially
            renderProjectCards(otherProjects, projectsGrid);
            
            // Initialize VanillaTilt for the new elements
            initTilt();

            // Handle Show More Button
            showMoreBtn.addEventListener('click', () => {
                const isHidden = projectsGrid.style.display === 'none';
                if (isHidden) {
                    projectsGrid.style.display = 'grid';
                    showMoreBtn.innerHTML = '<span>Daha Az Göster</span> <i class="fas fa-chevron-up"></i>';
                    
                    // Simple animation
                    projectsGrid.style.opacity = 0;
                    setTimeout(() => {
                        projectsGrid.style.transition = 'opacity 0.5s ease';
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
            const langName = repo.primaryLanguage ? repo.primaryLanguage.name : 'Çeşitli';
            const langColor = getLanguageColor(langName);
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.lang = langName;
            card.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${repo.name}</h3>
                    <div class="project-links">
                        <a href="${repo.url}" target="_blank" title="GitHub'da Görüntüle"><i class="fab fa-github"></i></a>
                    </div>
                </div>
                <p class="project-desc">${repo.description || 'Açıklama bulunmuyor.'}</p>
                <div class="project-footer">
                    <span class="tech-tag" style="color: ${langColor}; border-color: ${langColor}40">
                        <span class="tech-dot" style="background-color: ${langColor}; box-shadow: 0 0 10px ${langColor}"></span>
                        ${langName}
                    </span>
                    <span class="project-stars">
                        <i class="fas fa-star"></i> ${repo.stargazerCount}
                    </span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function filterProjects(filter) {
        // Only filtering the "All Projects" grid (projectsGrid)
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

        // Ensure projects grid is visible if filtering
        if (visibleCount > 0 && projectsGrid.style.display === 'none') {
            projectsGrid.style.display = 'grid';
            showMoreBtn.innerHTML = '<span>Daha Az Göster</span> <i class="fas fa-chevron-up"></i>';
        }
    }

    function initTilt() {
        VanillaTilt.init(document.querySelectorAll(".project-card"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
            scale: 1.02
        });
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2
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
        return colors[lang] || '#a0a0b0';
    }
});
