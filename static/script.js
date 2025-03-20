document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculatorForm');
    const inputs = form.querySelectorAll('input');
    const puissanceInput = document.getElementById('puissance');
    const nbPanneauxInput = document.getElementById('nb_panneaux');
    
    // Mobile navigation setup
    setupMobileNav();
    
    // Cloud and sun animation setup
    setupCloudAnimation();
    handleScrollEffects();
    
    // Lazy load images for better performance
    lazyLoadImages();
    
    // Puissance moyenne par panneau (400Wc standard)
    const PUISSANCE_PAR_PANNEAU = 0.4;
    
    // Mise à jour automatique puissance/panneaux
    nbPanneauxInput.addEventListener('input', () => {
        const nbPanneaux = parseFloat(nbPanneauxInput.value) || 0;
        puissanceInput.value = (nbPanneaux * PUISSANCE_PAR_PANNEAU).toFixed(1);
        calculateResults();
    });

    puissanceInput.addEventListener('input', () => {
        const puissance = parseFloat(puissanceInput.value) || 0;
        nbPanneauxInput.value = Math.round(puissance / PUISSANCE_PAR_PANNEAU);
        calculateResults();
    });

    // Calcul en temps réel
    inputs.forEach(input => {
        input.addEventListener('input', calculateResults);
    });

    function calculateResults() {
        const formData = {
            nb_panneaux: parseFloat(nbPanneauxInput.value),
            puissance: parseFloat(puissanceInput.value),
            temperature: parseFloat(document.getElementById('temperature').value),
            jours: parseInt(document.getElementById('jours').value)
        };

        // Vérification des données
        if (!Object.values(formData).every(val => !isNaN(val))) return;

        fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateUI(data.resultats);
                updateAnalysisSection(data.resultats);
            }
        });
    }

    const PRIX_PAR_KWH = 0.15; // Prix en euros par kWh

    // Live counter
    let startTime = Date.now();
    function updateCounters(results) {
        const elapsedHours = (Date.now() - startTime) / (1000 * 60 * 60);
        
        const energySaved = results.gain_performance.kwh * (elapsedHours / 8760);
        const waterSaved = results.consommation_eau.total * (elapsedHours / 8760);
        const co2Saved = results.impact_environmental.tonnes_co2 * (elapsedHours / 8760);
        
        document.getElementById('energySaved').textContent = 
            `Énergie économisée: ${formatNumber(energySaved)} kWh`;
        document.getElementById('waterSaved').textContent = 
            `Eau économisée: ${formatNumber(waterSaved)} L`;
        document.getElementById('co2Saved').textContent = 
            `CO₂ évité: ${formatNumber(co2Saved)} tonnes`;
    }

    // Performance chart
    let performanceChart;
    function updatePerformanceChart(results) {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        // Force la résolution du canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = ctx.canvas.getBoundingClientRect();
        ctx.canvas.width = rect.width * dpr;
        ctx.canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        if (performanceChart) performanceChart.destroy();
        
        // Générer des données qui évoluent sur 12 mois
        const monthlyData = Array.from({length: 12}, (_, i) => {
            return results.gain_performance.percentage * (1 + Math.sin(i / 11 * Math.PI) * 0.1);
        });
        
        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
                datasets: [{
                    label: 'Gain en performance (%)',
                    data: monthlyData,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: dpr,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des performances sur l\'année'
                    }
                }
            }
        });
    }

    // Environmental impact gauge
    let gaugeChart;
    function updateGauge(results) {
        const ctx = document.getElementById('gaugeChart').getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = ctx.canvas.getBoundingClientRect();
        ctx.canvas.width = rect.width * dpr;
        ctx.canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        if (gaugeChart) gaugeChart.destroy();
        
        const maxCO2 = 20;
        const value = Math.min(Math.abs(results.impact_environmental.tonnes_co2), maxCO2);
        
        gaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, maxCO2 - value],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.9)',
                        'rgba(229, 231, 235, 0.2)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                circumference: 180,
                rotation: -90,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    title: {
                        display: true,
                        text: 'Impact CO₂ (tonnes/an)',
                        position: 'bottom',
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        });

        // Ajouter le texte au centre
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height * 0.6;
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        
        // Valeur principale
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${value.toFixed(1)}t`, centerX, centerY);
        
        // Label CO₂
        ctx.font = '14px Arial';
        ctx.fillText('CO₂', centerX, centerY + 25);
        
        // Pourcentage de réduction
        const percentage = (value / maxCO2 * 100).toFixed(0);
        ctx.font = '12px Arial';
        ctx.fillText(`${percentage}% de réduction`, centerX, centerY + 45);
    }

    // Tree animation
    function updateTreeAnimation(results) {
        const container = document.getElementById('treeAnimation');
        container.innerHTML = '';
        
        const treeCount = Math.min(results.impact_environmental.arbres_equivalents, 20);
        const treeTypes = [
            { emoji: '🌳', size: '2.5rem' },
            { emoji: '🌲', size: '2.2rem' },
            { emoji: '🌴', size: '2.3rem' }
        ];
        
        for (let i = 0; i < treeCount; i++) {
            const tree = document.createElement('div');
            const treeType = treeTypes[i % treeTypes.length];
            tree.className = 'tree';
            tree.innerHTML = treeType.emoji;
            tree.style.fontSize = treeType.size;
            tree.style.left = `${(i * 100 / treeCount)}%`;
            tree.style.animationDelay = `${i * 0.15}s`;
            tree.style.bottom = `${Math.random() * 20}%`;
            container.appendChild(tree);
        }
    }

    // Amélioration export PDF
    document.getElementById('exportPDF').addEventListener('click', async () => {
        try {
            // Afficher un indicateur de chargement
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '0';
            loadingIndicator.style.left = '0';
            loadingIndicator.style.width = '100%';
            loadingIndicator.style.height = '100%';
            loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.justifyContent = 'center';
            loadingIndicator.style.alignItems = 'center';
            loadingIndicator.style.zIndex = '9999';
            loadingIndicator.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                    <p style="margin-top: 15px;">Génération du rapport en cours...</p>
                </div>
            `;
            document.body.appendChild(loadingIndicator);

            // CSS pour l'animation de rotation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);

            const formData = {
                nb_panneaux: parseFloat(document.getElementById('nb_panneaux').value) || 250,
                puissance: parseFloat(document.getElementById('puissance').value) || 100,
                temperature: parseFloat(document.getElementById('temperature').value) || 45,
                jours: parseInt(document.getElementById('jours').value) || 7
            };

            const response = await fetch('/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Supprimer l'indicateur de chargement
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
            }

            if (!response.ok) {
                // Vérifier si la réponse est du JSON ou un texte d'erreur
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de l\'export du PDF');
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Erreur lors de l\'export du PDF');
                }
            }

            // Créer un blob et forcer le téléchargement
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'rapport-sunwave.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error('Export error:', error);
            
            // Vérifier si l'erreur est liée à wkhtmltopdf
            if (error.message.includes('wkhtmltopdf') || 
                error.message.includes('not found') || 
                error.message.includes('not installed')) {
                showPdfInstallHelp();
            } else {
                // Afficher un message d'erreur plus convivial
                const errorModal = document.createElement('div');
                errorModal.style.position = 'fixed';
                errorModal.style.top = '0';
                errorModal.style.left = '0';
                errorModal.style.width = '100%';
                errorModal.style.height = '100%';
                errorModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                errorModal.style.display = 'flex';
                errorModal.style.justifyContent = 'center';
                errorModal.style.alignItems = 'center';
                errorModal.style.zIndex = '9999';
                
                errorModal.innerHTML = `
                    <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; max-width: 400px;">
                        <h3 style="color: #E74C3C; margin-top: 0;">Erreur lors de l'export du PDF</h3>
                        <p>${error.message}</p>
                        <button id="closeErrorBtn" style="background: #3498DB; color: white; border: none; padding: 10px 20px; 
                            border-radius: 5px; cursor: pointer; margin-top: 15px;">Fermer</button>
                    </div>
                `;
                
                document.body.appendChild(errorModal);
                
                document.getElementById('closeErrorBtn').addEventListener('click', () => {
                    document.body.removeChild(errorModal);
                });
            }
        }
    });

    document.getElementById('sendEmail').addEventListener('click', () => {
        const results = getCurrentResults();
        const mailBody = `
            Gains en performance: ${results.gain_performance.percentage}%
            Économie d'eau: ${results.consommation_eau.total}L
            Impact CO2: ${results.impact_environmental.tonnes_co2} tonnes
        `;
        
        window.location.href = `mailto:?subject=Rapport%20SunWave&body=${encodeURIComponent(mailBody)}`;
    });

    // Update UI function modification
    function updateUI(resultats) {
        // Performance - Rouge
        const performanceCard = document.querySelector('.performance');
        if (performanceCard) {
            performanceCard.style.borderTop = "4px solid #E74C3C"; // Rouge
            document.querySelector('.performance .result-value').textContent = 
                `+${resultats.gain_performance.percentage.toFixed(1)}%`;
            document.querySelector('.performance .result-value').style.color = "#E74C3C"; // Rouge
            document.querySelector('.performance .result-detail').textContent = 
                `${Math.round(resultats.gain_performance.kwh).toLocaleString()} kWh/an supplémentaires`;
        
            // Calcul de l'économie totale
            const economieTotale = (resultats.gain_performance.kwh * PRIX_PAR_KWH).toFixed(2);
            document.querySelector('.performance .result-economy').textContent = 
                `Économie totale: ${economieTotale} € par an`;
            document.querySelector('.performance .result-economy').style.color = "#E74C3C"; // Rouge - même couleur que result-value
        }

        // Eau - Bleu
        const waterCard = document.querySelector('.water');
        if (waterCard) {
            waterCard.style.borderTop = "4px solid #3498DB"; // Bleu
            document.querySelector('.water .result-value').textContent = 
                `${Math.round(resultats.consommation_eau.total).toLocaleString()} L/an`;
            document.querySelector('.water .result-value').style.color = "#3498DB"; // Bleu
            document.querySelector('.water ul li:first-child').textContent = 
                `${resultats.consommation_eau.pourcentage_recycle}% d'eau recyclée`;
        }

        // Impact environnemental - Vert
        const environmentalCard = document.querySelector('.environmental');
        if (environmentalCard) {
            environmentalCard.style.borderTop = "4px solid #2ECC71"; // Vert
            document.querySelector('.environmental .result-value').textContent = 
                `-${resultats.impact_environmental.tonnes_co2.toFixed(1)} tonnes CO₂/an`;
            document.querySelector('.environmental .result-value').style.color = "#2ECC71"; // Vert
            document.querySelector('.environmental ul li:first-child').textContent = 
                `Équivalent à ${Math.round(resultats.impact_environmental.arbres_equivalents)} arbres plantés`;
        }

        updateCounters(resultats);
        updatePerformanceChart(resultats);
        updateGauge(resultats);
        updateTreeAnimation(resultats);
    }

    // Calcul initial
    calculateResults();

    createClouds(); // Créer les nuages en arrière-plan
    
    initScrollAnimation();
    observeElements();
    animateSun();
    
    // Initialiser les graphiques si la fonction existe
    if(typeof initCharts === 'function') {
        initCharts();
    }
});

function formatNumber(number, decimals = 1) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

function initTreeAnimation() {
    const container = document.getElementById('treeAnimation');
    const treeCount = 12; // Nombre d'arbres à afficher
    
    for (let i = 0; i < treeCount; i++) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        tree.style.left = `${(i * 8) + 2}%`;
        tree.style.animationDelay = `${i * 0.2}s`;
        container.appendChild(tree);
    }
}

document.addEventListener('DOMContentLoaded', initTreeAnimation);

function updateAnalysisSection(results) {
    const initialInvestment = parseFloat(results.gain_performance.kwh * 0.15); // Exemple de calcul
    const yearlyEconomies = parseFloat(results.gain_performance.kwh * 0.2); // Exemple de calcul
    const maintenanceCost = 200; // Valeur fixe

    // Calcul du ROI
    const roi = (yearlyEconomies > 0) ? (initialInvestment / yearlyEconomies).toFixed(2) : 0; // ROI

    // Mise à jour des éléments de l'analyse
    document.getElementById('totalSavings').textContent = (yearlyEconomies * 25).toFixed(2) + ' €';
    document.getElementById('roiValue').textContent = roi + ' ans';
    document.getElementById('initialInvestment').textContent = initialInvestment.toFixed(2) + ' €';
    document.getElementById('yearlyEconomies').textContent = yearlyEconomies.toFixed(2) + ' €';
    document.getElementById('yearlyGain').textContent = (yearlyEconomies - maintenanceCost).toFixed(2) + ' €'; // Gain annuel
    document.getElementById('optimizedProduction').textContent = results.gain_performance.kwh.toFixed(2); // Production optimisée
}

// Ajouter un écouteur sur les changements de configuration
document.querySelectorAll('.config-input').forEach(input => {
    input.addEventListener('change', () => {
        const results = collectConfigData();
        updateAnalysisSection(results);
    });
});

// Cloud and sun animation
function setupCloudAnimation() {
    const scrollContainer = document.querySelector('.scroll-container');
    
    // Create cloud layers
    const cloudLayer1 = document.createElement('div');
    cloudLayer1.className = 'cloud-layer';
    cloudLayer1.style.zIndex = '-2'; // Mettre les nuages en arrière-plan
    
    const cloudLayer2 = document.createElement('div');
    cloudLayer2.className = 'cloud-layer';
    cloudLayer2.style.zIndex = '-2'; // Mettre les nuages en arrière-plan
    
    // Create sun
    const sunContainer = document.createElement('div');
    sunContainer.className = 'sun-container';
    sunContainer.style.zIndex = '-1';
    
    const sunOrb = document.createElement('div');
    sunOrb.className = 'sun-orb';
    
    const sunRays = document.createElement('div');
    sunRays.className = 'sun-rays';
    
    sunContainer.appendChild(sunOrb);
    sunContainer.appendChild(sunRays);
    
    // Créer les reflets de panneaux solaires
    const panelReflections = document.createElement('div');
    panelReflections.className = 'panel-reflections';
    
    for (let i = 0; i < 4; i++) {
        const reflection = document.createElement('div');
        reflection.className = 'panel-reflection';
        panelReflections.appendChild(reflection);
    }
    
    // Add to DOM
    scrollContainer.prepend(cloudLayer1);
    scrollContainer.prepend(cloudLayer2);
    scrollContainer.prepend(sunContainer);
    scrollContainer.prepend(panelReflections);
    
    // Generate clouds for first layer (slower moving, back clouds)
    generateClouds(cloudLayer1, 10, 0.2);
    
    // Generate clouds for second layer (faster moving, front clouds)
    generateClouds(cloudLayer2, 8, 0.5);
    
    // Add water droplet animation if we scroll near middle
    setupWaterAnimation(scrollContainer);
}

function setupWaterAnimation(container) {
    // Créer un conteneur pour les gouttes d'eau
    const waterContainer = document.createElement('div');
    waterContainer.className = 'water-droplets-container';
    waterContainer.style.position = 'fixed';
    waterContainer.style.top = '0';
    waterContainer.style.left = '0';
    waterContainer.style.width = '100%';
    waterContainer.style.height = '100%';
    waterContainer.style.pointerEvents = 'none';
    waterContainer.style.zIndex = '0';
    waterContainer.style.opacity = '0';
    waterContainer.style.transition = 'opacity 1s ease-out';
    
    container.prepend(waterContainer);
    
    // On montrera cette animation uniquement à un certain point du scroll
    container.addEventListener('scroll', () => {
        const scrollProgress = container.scrollTop / (container.scrollHeight - container.clientHeight);
        
        // Montrer l'animation de gouttes d'eau autour de 40-60% du scroll
        if (scrollProgress > 0.3 && scrollProgress < 0.6) {
            waterContainer.style.opacity = Math.min((scrollProgress - 0.3) * 5, 1);
            
            // Créer des gouttes d'eau de façon aléatoire
            if (Math.random() < 0.05 && waterContainer.children.length < 20) {
                createWaterDrop(waterContainer);
            }
        } else {
            waterContainer.style.opacity = '0';
        }
    });
}

function createWaterDrop(container) {
    const drop = document.createElement('div');
    drop.className = 'water-droplet';
    
    // Style de base pour une goutte d'eau
    drop.style.position = 'absolute';
    drop.style.width = '8px';
    drop.style.height = '12px';
    drop.style.background = 'radial-gradient(ellipse at top, rgba(255,255,255,0.8) 0%, rgba(173,216,230,0.8) 100%)';
    drop.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
    drop.style.boxShadow = '0 0 5px rgba(255,255,255,0.8)';
    
    // Position aléatoire (limité au tiers supérieur de l'écran)
    const randomLeft = Math.random() * 100;
    drop.style.left = `${randomLeft}%`;
    drop.style.top = '-20px';
    
    // Animation
    drop.style.animation = `dropFall ${2 + Math.random() * 3}s linear forwards`;
    
    // Ajouter au conteneur
    container.appendChild(drop);
    
    // Nettoyer après l'animation
    setTimeout(() => {
        if (container.contains(drop)) {
            container.removeChild(drop);
        }
    }, 5000);
}

function generateClouds(layer, count, speedFactor) {
    const sizes = ['small', 'medium', 'large'];
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        cloud.className = `cloud ${size}`;
        
        // Random position ensuring good distribution
        const left = (containerWidth / count) * i + Math.random() * (containerWidth / count / 2);
        const top = Math.random() * containerHeight * 0.6; // Keep in top 60%
        
        cloud.style.left = `${left}px`;
        cloud.style.top = `${top}px`;
        
        // Add some random rotation for more natural look
        const rotation = Math.random() * 10 - 5; // -5 to 5 degrees
        cloud.style.transform = `rotate(${rotation}deg)`;
        
        // Store original position and speed factor for animation
        cloud.dataset.originalLeft = left;
        cloud.dataset.speedFactor = speedFactor * (0.7 + Math.random() * 0.6); // Add some randomness
        cloud.dataset.verticalOffset = Math.random() * 10 - 5; // Small vertical movement
        
        layer.appendChild(cloud);
    }
}

function handleScrollEffects() {
    const scrollContainer = document.querySelector('.scroll-container');
    const sections = document.querySelectorAll('section');
    const efficiency = document.querySelector('.efficiency-indicator');
    
    // Créer un conteneur pour le soleil
    const sunContainer = document.createElement('div');
    sunContainer.className = 'sun-container';
    sunContainer.innerHTML = `
        <div class="sun-rays"></div>
        <div class="sun-orb"></div>
    `;
    document.body.appendChild(sunContainer);
    
    // Créer les conteneurs pour les reflets des panneaux
    const reflections = document.createElement('div');
    reflections.className = 'panel-reflections';
    reflections.innerHTML = `
        <div class="panel-reflection"></div>
        <div class="panel-reflection"></div>
        <div class="panel-reflection"></div>
        <div class="panel-reflection"></div>
    `;
    document.body.appendChild(reflections);
    
    // Créer les nuages pour le fond
    const cloudLayer = document.createElement('div');
    cloudLayer.className = 'cloud-layer';
    cloudLayer.style.zIndex = '-2'; // Mettre les nuages en arrière-plan
    document.body.appendChild(cloudLayer);
    
    // Génération de plusieurs couches de nuages avec différentes vitesses
    generateClouds(cloudLayer, 5, 1); // Grands nuages lents
    generateClouds(cloudLayer, 10, 2); // Nuages moyens
    generateClouds(cloudLayer, 15, 3); // Petits nuages rapides
    
    // Observer le défilement et mettre à jour les animations
    let lastScrollTop = 0;
    let scrollDirection = 'down';
    let ticking = false;
    
    // Créer un dégradé principal cohérent pour l'ensemble de la page - plus pastel
    document.body.style.background = 'linear-gradient(to bottom, #b3d9ff 0%, #e6f2ff 30%, #f9fcff 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    
    // Ajouter une overlay dynamique sur chaque section pour une transition plus fluide
    sections.forEach(section => {
        const overlay = document.createElement('div');
        overlay.className = 'section-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.8s ease-out';
        overlay.style.zIndex = '-1';
        overlay.style.pointerEvents = 'none';
        section.style.position = 'relative';
        section.appendChild(overlay);
    });
    
    // Écouter l'événement de défilement avec optimisation de performance
    let lastFrameTime = 0;
    const FRAME_THROTTLE = 1000 / 60; // Cap à 60fps
    
    scrollContainer.addEventListener('scroll', () => {
        const st = scrollContainer.scrollTop;
        const now = performance.now();
        
        // Déterminer la direction du défilement
        scrollDirection = (st > lastScrollTop) ? 'down' : 'up';
        lastScrollTop = st;
        
        // Optimisation des performances avec requestAnimationFrame et throttling
        if (!ticking && now - lastFrameTime > FRAME_THROTTLE) {
            lastFrameTime = now;
            window.requestAnimationFrame(() => {
                updateOnScroll(st, scrollContainer);
                ticking = false;
            });
            ticking = true;
        }
    });
    
    function updateOnScroll(scrollTop, container) {
        // Calculer la progression du défilement (0 à 1)
        const documentHeight = container.scrollHeight;
        const viewportHeight = container.clientHeight;
        const maxScroll = documentHeight - viewportHeight;
        const normalizedScroll = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
        
        // Mettre à jour le contenu basé sur le défilement
        updateContentBasedOnScroll(normalizedScroll);
        
        // Animer le soleil en fonction du défilement
        const sunTranslateY = Math.max(0, 350 - 700 * normalizedScroll);
        const sunOpacity = Math.min(1, normalizedScroll * 3);
        sunContainer.style.transform = `translateY(${sunTranslateY}px)`;
        sunContainer.style.opacity = sunOpacity;
        
        // Animer les reflets de panneaux solaires
        const reflectionOpacity = Math.min(1, normalizedScroll * 5 - 1);
        reflections.style.opacity = reflectionOpacity;
        
        // Animer le fond en fonction du défilement
        const hue = 210 - normalizedScroll * 30; // Bleu ciel qui devient légèrement plus chaud
        const saturation = 80 - normalizedScroll * 30; // Moins saturé en bas
        const lightness = 70 + normalizedScroll * 20; // Plus lumineux en bas
        
        // Appliquer l'indicateur d'efficacité
        if (normalizedScroll > 0.1) {
            efficiency.classList.add('visible');
            const efficiencyValue = Math.min(15, normalizedScroll * 20);
            document.querySelector('.efficiency-value').textContent = `+${efficiencyValue.toFixed(1)}%`;
        } else {
            efficiency.classList.remove('visible');
        }
        
        // Animation des sections au défilement avec IntersectionObserver pour de meilleures performances
        const windowHeight = window.innerHeight;
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            
            // Calculer si la section est visible
            const isVisible = (sectionTop < windowHeight && sectionBottom > 0);
            
            if (isVisible) {
                // Calculer la progression de la visibilité (0 à 1)
                const progress = Math.min(1, Math.max(0, 
                    1 - (sectionTop / windowHeight) * 1.2
                ));
                
                // Animer les éléments de la section
                section.classList.add('animate');
                
                // Appliquer une légère transformation pour l'effet de profondeur
                section.style.transform = `translateY(${(1-progress) * 20}px)`;
                section.style.opacity = Math.min(1, progress * 1.5);
                
                // Animation personnalisée pour chaque type de section
                animateSectionContent(section, progress, index);
                
                // Overlay personnalisé pour chaque section
                updateSectionOverlay(section, progress, index);
            } else {
                section.classList.remove('animate');
            }
        });
    }
    
    function animateSectionContent(section, progress, index) {
        if (section.className.includes('features-section')) {
            const cards = section.querySelectorAll('.feature-card');
            cards.forEach((card, cardIndex) => {
                card.style.transform = `translateY(${Math.max(0, (1-progress*1.5) * 50)}px)`;
                card.style.opacity = Math.min(1, progress * 1.5 - cardIndex * 0.1);
            });
        }
        else if (section.className.includes('calculator-section')) {
            const results = section.querySelectorAll('.result-card');
            results.forEach((result, resultIndex) => {
                result.style.transform = `translateX(${Math.max(0, (1-progress*1.5) * 50)}px)`;
                result.style.opacity = Math.min(1, progress * 1.5 - resultIndex * 0.15);
            });
        }
        else if (section.className.includes('precisions-section')) {
            const cards = section.querySelectorAll('.precision-card');
            cards.forEach((card, cardIndex) => {
                card.style.transform = `scale(${0.9 + Math.min(0.1, progress * 0.1)})`;
                card.style.opacity = Math.min(1, progress * 1.5 - cardIndex * 0.15);
            });
        }
    }
    
    function updateSectionOverlay(section, progress, index) {
        const overlay = section.querySelector('.section-overlay');
        if (overlay) {
            // Créer des dégradés personnalisés pour chaque section
            let overlayBg;
            
            if (index === 0) { // Hero section
                overlayBg = `linear-gradient(180deg, 
                    rgba(135, 206, 235, ${progress * 0.1}) 0%, 
                    rgba(224, 247, 255, ${progress * 0.2}) 100%)`;
            } else if (index === 1) { // Features section
                overlayBg = `linear-gradient(180deg, 
                    rgba(224, 247, 255, ${progress * 0.1}) 0%, 
                    rgba(224, 247, 255, ${progress * 0.2}) 100%)`;
            } else if (index === 2) { // Calculator section
                overlayBg = `linear-gradient(180deg, 
                    rgba(224, 247, 255, ${progress * 0.1}) 0%, 
                    rgba(255, 255, 255, ${progress * 0.15}) 100%)`;
            } else if (index === 3) { // Precisions section
                overlayBg = `linear-gradient(180deg, 
                    rgba(240, 248, 255, ${progress * 0.05}) 0%, 
                    rgba(255, 255, 255, ${progress * 0.1}) 100%)`;
            } else { // Last section
                overlayBg = `linear-gradient(180deg, 
                    rgba(240, 248, 255, ${progress * 0.05}) 0%, 
                    rgba(255, 255, 255, ${progress * 0.1}) 100%)`;
            }
            
            overlay.style.background = overlayBg;
            overlay.style.opacity = progress;
        }
    }
    
    // Déclencher un faux événement de défilement pour initialiser les animations
    const scrollEvent = new Event('scroll');
    scrollContainer.dispatchEvent(scrollEvent);
}

function updateContentBasedOnScroll(progress) {
    // Optionnellement, on peut modifier du contenu basé sur la position de scroll
    // Par exemple, on pourrait changer des mots-clés ou le message principal
    if (progress > 0.8) {
        // Presque en bas de la page - message d'action
        document.title = "SunWave - Optimisez votre installation dès maintenant !";
    } else if (progress > 0.5) {
        // En milieu de page - efficacité
        document.title = "SunWave - +15% d'efficacité grâce à nos solutions";
    } else if (progress > 0.2) {
        // Début de la page - explication
        document.title = "SunWave - Nettoyage et refroidissement des panneaux solaires";
    } else {
        // Tout en haut
        document.title = "SunWave - Optimisation des Centrales Solaires";
    }
}

// Ajouter une fonction pour télécharger wkhtmltopdf automatiquement
function downloadAndInstallWkhtmltopdf() {
    const modal = document.createElement('div');
    modal.className = 'pdf-install-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '15px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '80%';
    modalContent.style.boxShadow = '0 5px 30px rgba(0,0,0,0.3)';
    
    modalContent.innerHTML = `
        <h2 style="color: var(--primary-color); margin-top: 0;">Installation de wkhtmltopdf</h2>
        <p>Pour générer des PDF, l'application a besoin de <strong>wkhtmltopdf</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Installation automatique</h3>
            <p>Cliquez sur le bouton ci-dessous pour télécharger l'installateur :</p>
            <button id="downloadBtn" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; 
                border-radius: 8px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-download"></i> Télécharger wkhtmltopdf (64-bit)
            </button>
            <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                Une fois téléchargé, exécutez l'installateur et suivez les instructions.<br>
                <strong>Note :</strong> Assurez-vous d'accepter le chemin d'installation par défaut.
            </p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Après l'installation</h3>
            <p>Une fois l'installation terminée :</p>
            <ol style="margin-bottom: 0;">
                <li>Redémarrez votre navigateur</li>
                <li>Actualisez cette page</li>
                <li>Essayez à nouveau de générer un PDF</li>
            </ol>
        </div>
        
        <button id="closeModalBtn" style="background: #E0E7EE; color: #566270; border: none; padding: 10px 20px; 
            border-radius: 8px; cursor: pointer; margin-top: 20px; font-weight: bold;">Fermer</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Téléchargement direct de wkhtmltopdf lorsqu'on clique sur le bouton
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const downloadUrl = "https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.msvc2015-win64.exe";
        window.open(downloadUrl, '_blank');
    });
    
    // Fermer le modal quand on clique sur le bouton
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Fermer aussi quand on clique en dehors du contenu
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Remplacer la fonction showPdfInstallHelp existante par celle-ci
function showPdfInstallHelp() {
    // Détection du système d'exploitation
    const isWindows = navigator.userAgent.indexOf("Windows") !== -1;
    const isMac = navigator.userAgent.indexOf("Mac") !== -1;
    const isLinux = navigator.userAgent.indexOf("Linux") !== -1;
    
    // Si c'est Windows, on propose le téléchargement automatique
    if (isWindows) {
        downloadAndInstallWkhtmltopdf();
        return;
    }
    
    // Sinon, on montre les instructions manuelles
    const modal = document.createElement('div');
    modal.className = 'pdf-install-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '15px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '80%';
    modalContent.style.boxShadow = '0 5px 30px rgba(0,0,0,0.3)';
    
    modalContent.innerHTML = `
        <h2 style="color: var(--primary-color); margin-top: 0;">Installation de wkhtmltopdf</h2>
        <p>Pour générer des PDF, l'application a besoin de <strong>wkhtmltopdf</strong>. Voici comment l'installer :</p>
        
        ${isMac ? `
        <h3>macOS</h3>
        <ol>
            <li>Installez avec Homebrew: <code>brew install wkhtmltopdf</code></li>
            <li>Ou téléchargez depuis <a href="https://wkhtmltopdf.org/downloads.html" target="_blank">le site officiel</a></li>
        </ol>
        ` : ''}
        
        ${isLinux ? `
        <h3>Linux</h3>
        <ol>
            <li>Ubuntu/Debian: <code>sudo apt-get install wkhtmltopdf</code></li>
            <li>Fedora/CentOS: <code>sudo dnf install wkhtmltopdf</code></li>
            <li>Arch Linux: <code>sudo pacman -S wkhtmltopdf</code></li>
        </ol>
        ` : ''}
        
        <p>Après l'installation, redémarrez l'application.</p>
        
        <button id="closeModalBtn" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; 
            border-radius: 8px; cursor: pointer; margin-top: 20px; font-weight: bold;">Fermer</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fermer le modal quand on clique sur le bouton
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Fermer aussi quand on clique en dehors du contenu
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Créer les nuages
function createClouds() {
    const clouds = document.createElement('div');
    clouds.className = 'clouds';
    
    for(let i = 0; i < 3; i++) {
        const cloudLayer = document.createElement('div');
        cloudLayer.className = `cloud-layer layer-${i+1}`;
        cloudLayer.style.zIndex = "-2"; // Mettre les nuages en arrière-plan
        
        for(let j = 0; j < 3 + i; j++) {
            const cloud = document.createElement('div');
            cloud.className = `cloud cloud-${i+1}`;
            cloud.style.left = `${Math.random() * 100}%`;
            cloud.style.top = `${20 + Math.random() * 30}%`;
            cloud.style.animationDuration = `${80 + Math.random() * 40}s`;
            cloud.style.animationDelay = `${Math.random() * 40}s`;
            cloudLayer.appendChild(cloud);
        }
        
        clouds.appendChild(cloudLayer);
    }
    
    document.body.style.background = "linear-gradient(to bottom, #b3d9ff 0%, #e6f2ff 30%, #f9fcff 100%)";
    document.body.appendChild(clouds);
}

function setupMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', 
                mobileNav.classList.contains('active') ? 'true' : 'false');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileNav.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function lazyLoadImages() {
    // Use Intersection Observer API for better performance
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px' });
        
        // Target all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imgObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver support
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}