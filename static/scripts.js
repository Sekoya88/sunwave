document.addEventListener('DOMContentLoaded', function() {
    // Animation des sections au défilement
    const sections = document.querySelectorAll('section');
    const featureCards = document.querySelectorAll('.feature-card');
    const resultCards = document.querySelectorAll('.result-card');
    const precisionCards = document.querySelectorAll('.precision-card');
    
    // Fonction pour vérifier si un élément est visible dans la fenêtre
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
            rect.bottom >= 0
        );
    }
    
    // Fonction pour animer les éléments visibles
    function animateOnScroll() {
        sections.forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('animate');
            }
        });
        
        featureCards.forEach((card, index) => {
            if (isElementInViewport(card)) {
                setTimeout(() => {
                    card.classList.add('animate');
                }, index * 100);
            }
        });
        
        resultCards.forEach((card, index) => {
            if (isElementInViewport(card)) {
                setTimeout(() => {
                    card.classList.add('animate');
                }, index * 100);
            }
        });
        
        precisionCards.forEach((card, index) => {
            if (isElementInViewport(card)) {
                setTimeout(() => {
                    card.classList.add('animate');
                }, index * 100);
            }
        });
    }
    
    // Exécuter l'animation au chargement et au défilement
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Animation des gouttes d'eau
    function createWaterDrops() {
        const waterDropsContainer = document.querySelector('.water-drops');
        if (!waterDropsContainer) return;
        
        for (let i = 0; i < 10; i++) {
            const drop = document.createElement('div');
            drop.classList.add('water-drop');
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            waterDropsContainer.appendChild(drop);
        }
    }
    
    createWaterDrops();
    
    // Défilement fluide pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animation du bouton de défilement
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.features-section');
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Animation des panneaux solaires
    function animatePanels() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach((panel, index) => {
            const delay = index * 0.2;
            panel.style.animation = `float 3s infinite ${delay}s`;
        });
    }
    
    // Définir l'animation float dans le CSS dynamiquement
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float {
            0% { transform: perspective(500px) rotateX(30deg) translateY(0); }
            50% { transform: perspective(500px) rotateX(30deg) translateY(-10px); }
            100% { transform: perspective(500px) rotateX(30deg) translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    animatePanels();
    
    // Calculateur interactif
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
        calculatorForm.addEventListener('input', updateResults);
        
        function updateResults() {
            const panelCount = parseInt(document.getElementById('panel-count').value) || 0;
            const roofArea = parseInt(document.getElementById('roof-area').value) || 0;
            const waterConsumption = parseInt(document.getElementById('water-consumption').value) || 0;
            
            // Calculs simplifiés pour la démonstration
            const energyProduction = panelCount * 350; // 350W par panneau
            const waterSavings = waterConsumption * 0.3; // 30% d'économie
            const co2Reduction = energyProduction * 0.5 / 1000; // 0.5kg CO2 par kWh
            
            // Mise à jour des résultats
            updateResultCard('energy-production', energyProduction, 'kWh/an');
            updateResultCard('water-savings', waterSavings, 'L/an');
            updateResultCard('co2-reduction', co2Reduction, 'tonnes/an');
            
            // Animation des cartes de résultats
            document.querySelectorAll('.result-card').forEach(card => {
                card.classList.add('animate');
            });
        }
        
        function updateResultCard(id, value, unit) {
            const resultElement = document.getElementById(id);
            if (resultElement) {
                const valueElement = resultElement.querySelector('.result-value');
                if (valueElement) {
                    valueElement.textContent = value.toLocaleString() + ' ' + unit;
                    valueElement.style.animation = 'none';
                    setTimeout(() => {
                        valueElement.style.animation = 'valueChange 0.5s ease-out';
                    }, 10);
                }
            }
        }
    }
});

// Animation pour les valeurs qui changent
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes valueChange {
            0% { transform: translateY(-10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
    </style>
`); 