// SunWave Easter Egg - Fireworks Animation
// Activated by typing "sunwave" anywhere on the site

// New Techno Easter Egg - Activated by typing "techno"
class TechnoEasterEgg {
    constructor() {
        this.active = false;
        this.keySequence = "";
        this.targetSequence = "techno";
        this.container = null;
        this.audioContext = null;
        this.audioElement = null;
        this.audioUrl = "/static/sound/mixkit-trance-party-166.mp3";
        this.gifPath = "/techno GIF.gif"; // Cherche dans la racine
        
        // Bind the event handler to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Start listening for keypresses
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    handleKeyDown(event) {
        // Only track alphabetic key presses
        if (/^[a-zA-Z]$/.test(event.key)) {
            this.keySequence += event.key.toLowerCase();
            
            // Keep only the last N characters where N is the length of target sequence
            if (this.keySequence.length > this.targetSequence.length) {
                this.keySequence = this.keySequence.substring(
                    this.keySequence.length - this.targetSequence.length
                );
            }
            
            // Check if the sequence matches
            if (this.keySequence === this.targetSequence) {
                this.toggleTechno();
            }
        }
    }
    
    toggleTechno() {
        if (this.active) {
            this.stopTechno();
        } else {
            this.startTechno();
        }
    }
    
    startTechno() {
        if (this.active) return;
        this.active = true;
        
        // Create container for the animation
        this.container = document.createElement('div');
        this.container.className = 'techno-easter-egg';
        this.container.style.position = 'fixed';
        this.container.style.bottom = '20px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.zIndex = '9999';
        this.container.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8)';
        this.container.style.borderRadius = '10px';
        this.container.style.animation = 'pulse 0.5s infinite alternate, spotlight 2s infinite';
        this.container.style.padding = '20px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.width = '300px';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        
        // Create style for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                from { transform: translateX(-50%) scale(1); }
                to { transform: translateX(-50%) scale(1.05); }
            }
            
            @keyframes colorChange {
                0% { color: #ff0000; }
                20% { color: #ffff00; }
                40% { color: #00ff00; }
                60% { color: #00ffff; }
                80% { color: #ff00ff; }
                100% { color: #ff0000; }
            }
            
            @keyframes spotlight {
                0%, 100% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.8); }
                25% { box-shadow: 0 0 50px rgba(255, 255, 0, 0.8); }
                50% { box-shadow: 0 0 50px rgba(0, 255, 0, 0.8); }
                75% { box-shadow: 0 0 50px rgba(0, 0, 255, 0.8); }
            }
            
            .visualizer-bar {
                display: inline-block;
                margin: 0 1px;
                background-color: #fff;
                border-radius: 2px;
                transition: height 0.05s;
            }
        `;
        document.head.appendChild(style);
        
        // Create title
        const title = document.createElement('div');
        title.textContent = 'TECHNO PARTY!';
        title.style.fontFamily = 'Arial, sans-serif';
        title.style.fontSize = '24px';
        title.style.fontWeight = 'bold';
        title.style.animation = 'colorChange 1s infinite';
        title.style.marginBottom = '20px';
        title.style.color = '#fff';
        
        // Create GIF image element
        const gifImage = document.createElement('img');
        gifImage.src = this.gifPath;
        gifImage.style.width = '200px';
        gifImage.style.height = 'auto';
        gifImage.style.borderRadius = '8px';
        gifImage.style.marginBottom = '15px';
        
        // Fallback en cas d'erreur de chargement du GIF
        gifImage.onerror = () => {
            console.error("Erreur de chargement du GIF:", this.gifPath);
            // Essayons un autre chemin
            gifImage.src = "/static/images/techno GIF.gif";
            
            // Si ça échoue encore, utilisons un placeholder
            gifImage.onerror = () => {
                console.error("Impossible de charger le GIF techno, utilisation d'un placeholder");
                
                // Créons une animation en CSS comme fallback
                gifImage.style.display = 'none';
                
                const danceContainer = document.createElement('div');
                danceContainer.style.width = '200px';
                danceContainer.style.height = '150px';
                danceContainer.style.backgroundColor = '#12121a';
                danceContainer.style.borderRadius = '8px';
                danceContainer.style.overflow = 'hidden';
                danceContainer.style.marginBottom = '15px';
                danceContainer.style.position = 'relative';
                danceContainer.style.animation = 'dance 1.5s infinite';
                
                // Ajoutons l'animation dance au style
                const danceStyle = document.createElement('style');
                danceStyle.textContent = `
                    @keyframes dance {
                        0% { transform: translateY(0) rotate(-5deg); }
                        25% { transform: translateY(-10px) rotate(5deg); }
                        50% { transform: translateY(0) rotate(-3deg); }
                        75% { transform: translateY(-8px) rotate(3deg); }
                        100% { transform: translateY(0) rotate(-5deg); }
                    }
                `;
                document.head.appendChild(danceStyle);
                
                // Silhouette dansante
                const dancer = document.createElement('div');
                dancer.style.position = 'absolute';
                dancer.style.width = '50px';
                dancer.style.height = '100px';
                dancer.style.backgroundColor = '#5d85b1';
                dancer.style.borderRadius = '15px 15px 0 0';
                dancer.style.top = '30px';
                dancer.style.left = '75px';
                
                // Tête
                const head = document.createElement('div');
                head.style.position = 'absolute';
                head.style.width = '40px';
                head.style.height = '40px';
                head.style.backgroundColor = '#d1c1b4';
                head.style.borderRadius = '50%';
                head.style.top = '-30px';
                head.style.left = '5px';
                
                // Lunettes avec verres verts
                const glasses = document.createElement('div');
                glasses.style.position = 'absolute';
                glasses.style.width = '50px';
                glasses.style.height = '15px';
                glasses.style.backgroundColor = '#000';
                glasses.style.top = '5px';
                glasses.style.left = '-5px';
                glasses.style.borderRadius = '5px';
                
                const leftLens = document.createElement('div');
                leftLens.style.position = 'absolute';
                leftLens.style.width = '18px';
                leftLens.style.height = '10px';
                leftLens.style.backgroundColor = '#24cf6b';
                leftLens.style.top = '2px';
                leftLens.style.left = '3px';
                leftLens.style.borderRadius = '3px';
                
                const rightLens = document.createElement('div');
                rightLens.style.position = 'absolute';
                rightLens.style.width = '18px';
                rightLens.style.height = '10px';
                rightLens.style.backgroundColor = '#24cf6b';
                rightLens.style.top = '2px';
                rightLens.style.right = '3px';
                rightLens.style.borderRadius = '3px';
                
                // Assembler
                glasses.appendChild(leftLens);
                glasses.appendChild(rightLens);
                head.appendChild(glasses);
                dancer.appendChild(head);
                
                // Lumières disco
                for (let i = 0; i < 10; i++) {
                    const light = document.createElement('div');
                    light.style.position = 'absolute';
                    light.style.width = '10px';
                    light.style.height = '10px';
                    light.style.borderRadius = '50%';
                    light.style.backgroundColor = `hsl(${i * 36}, 100%, 50%)`;
                    light.style.top = `${Math.random() * 100}%`;
                    light.style.left = `${Math.random() * 100}%`;
                    light.style.boxShadow = `0 0 10px 2px hsl(${i * 36}, 100%, 50%)`;
                    light.style.animation = `flicker ${0.5 + Math.random()}s infinite alternate`;
                    danceContainer.appendChild(light);
                }
                
                // Ajouter l'animation de scintillement
                danceStyle.textContent += `
                    @keyframes flicker {
                        0% { opacity: 0.3; }
                        100% { opacity: 0.9; }
                    }
                `;
                
                danceContainer.appendChild(dancer);
                this.container.insertBefore(danceContainer, visualizer);
            };
        };
        
        // Create visualizer container
        const visualizer = document.createElement('div');
        visualizer.className = 'techno-visualizer';
        visualizer.style.display = 'flex';
        visualizer.style.justifyContent = 'center';
        visualizer.style.gap = '2px';
        visualizer.style.height = '30px';
        visualizer.style.marginTop = '10px';
        visualizer.style.width = '100%';
        
        // Add elements to container
        this.container.appendChild(title);
        this.container.appendChild(gifImage);
        this.container.appendChild(visualizer);
        
        document.body.appendChild(this.container);
        
        // Add escape key handler
        document.addEventListener('keydown', this.handleEscapeKey);
        
        // Create visualizer bars
        this.createVisualizer(visualizer);
        
        // Play techno music
        this.playTechnoMusic();
    }
    
    createVisualizer(visualizer) {
        // Create bars
        const barCount = 20;
        this.visualizerBars = [];
        
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.width = '10px';
            bar.style.height = '5px';
            bar.style.backgroundColor = `hsl(${(i / barCount) * 360}, 100%, 50%)`;
            visualizer.appendChild(bar);
            this.visualizerBars.push(bar);
        }
    }
    
    playTechnoMusic() {
        try {
            // Create audio element for the Trance Party song
            this.audioElement = new Audio(this.audioUrl);
            this.audioElement.loop = true;
            this.audioElement.volume = 0.7;
            
            // Create AudioContext for visualizer
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            const source = audioContext.createMediaElementSource(this.audioElement);
            
            // Create gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.7;
            this.masterGain = gainNode;
            
            // Create analyser for visualizer
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            
            // Connect the audio nodes
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Start animation for the visualizer
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const updateVisualizer = () => {
                if (!this.active) return;
                
                analyser.getByteFrequencyData(dataArray);
                
                for (let i = 0; i < this.visualizerBars.length; i++) {
                    const index = Math.floor(i * bufferLength / this.visualizerBars.length);
                    const value = dataArray[index] / 255;
                    const height = value * 30;
                    this.visualizerBars[i].style.height = `${5 + height}px`;
                    
                    // Make the bars more colorful with the beat
                    this.visualizerBars[i].style.backgroundColor = `hsl(${(i / this.visualizerBars.length) * 360 + value * 120}, 100%, ${50 + value * 30}%)`;
                }
                
                requestAnimationFrame(updateVisualizer);
            };
            
            // Play the audio and start visualizer
            this.audioElement.play()
                .then(() => {
                    updateVisualizer();
                    console.log('Techno party started!');
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    
                    // Try alternative method
                    this.audioElement.addEventListener('canplaythrough', () => {
                        this.audioElement.play()
                            .then(() => {
                                updateVisualizer();
                                console.log('Techno party started (delayed)!');
                            })
                            .catch(e => {
                                console.error('Failed to play audio after canplaythrough:', e);
                                this.fallbackVisualizer();
                            });
                    });
                    
                    // Set a timeout in case the canplaythrough event doesn't fire
                    setTimeout(() => {
                        if (!this.audioElement.paused) return; // Already playing
                        
                        console.log('Trying backup method to play audio...');
                        this.audioElement.play()
                            .catch(e => {
                                console.error('All playback attempts failed:', e);
                                this.fallbackVisualizer();
                            });
                    }, 1000);
                });
            
        } catch (e) {
            console.error('Error setting up audio:', e);
            this.fallbackVisualizer();
        }
    }
    
    // Fallback visualizer when audio can't be played
    fallbackVisualizer() {
        const updateVisualizer = () => {
            if (!this.active) return;
            
            // Generate fake audio data
            for (let i = 0; i < this.visualizerBars.length; i++) {
                const value = Math.random();
                const height = value * 30;
                this.visualizerBars[i].style.height = `${5 + height}px`;
                this.visualizerBars[i].style.backgroundColor = `hsl(${(i / this.visualizerBars.length) * 360 + value * 120}, 100%, ${50 + value * 30}%)`;
            }
            
            setTimeout(() => requestAnimationFrame(updateVisualizer), 100);
        };
        
        updateVisualizer();
    }
    
    handleEscapeKey = (event) => {
        if (event.key === 'Escape' && this.active) {
            this.stopTechno();
        }
    }
    
    stopTechno() {
        if (!this.active) return;
        
        if (this.container) {
            document.body.removeChild(this.container);
            this.container = null;
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        
        if (this.audioContext) {
            // Fade out master gain to avoid clicks
            if (this.masterGain) {
                this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            }
            
            // Close audio context after fade
            setTimeout(() => {
                if (this.audioContext && this.audioContext.state !== 'closed') {
                    this.audioContext.close();
                }
                this.audioContext = null;
                this.masterGain = null;
            }, 500);
        }
        
        document.removeEventListener('keydown', this.handleEscapeKey);
        this.active = false;
    }
}

// Initialize Techno Easter Egg
let technoEasterEgg;
document.addEventListener('DOMContentLoaded', () => {
    technoEasterEgg = new TechnoEasterEgg();
});

class Firework {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.targetY = Math.random() * canvasHeight * 0.4; // Plus haut
        // Utiliser des couleurs plus variées et vibrantes
        this.colorType = Math.floor(Math.random() * 5);
        if (this.colorType === 0) {
            // Rouge-Orange (feu)
            this.color = `hsl(${10 + Math.random() * 40}, 100%, 50%)`;
        } else if (this.colorType === 1) {
            // Bleu-Vert (émeraude)
            this.color = `hsl(${160 + Math.random() * 60}, 100%, 50%)`;
        } else if (this.colorType === 2) {
            // Rose-Violet
            this.color = `hsl(${270 + Math.random() * 60}, 100%, 50%)`;
        } else if (this.colorType === 3) {
            // Or-Jaune
            this.color = `hsl(${40 + Math.random() * 20}, 100%, 50%)`;
        } else {
            // Aléatoire
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
        this.speed = 3 + Math.random() * 4; // Plus rapide
        this.particles = [];
        this.particleCount = 80 + Math.floor(Math.random() * 120); // Encore plus de particules
        this.size = 3 + Math.random() * 3; // Plus grosse
        this.dead = false;
        this.explosionSound = null;
        this.trailParticles = []; // Particules de traînée
        this.explosionType = Math.floor(Math.random() * 7); // Plus de types d'explosion
        this.special = Math.random() > 0.85; // 15% de chance d'avoir un feu d'artifice spécial
    }

    update() {
        // Ajouter des particules de traînée pendant la montée
        if (this.y > this.targetY) {
            // Ajout de particules de traînée
            if (Math.random() > 0.3) { // Plus de chance de traînée
                for (let i = 0; i < 3; i++) {
                    this.trailParticles.push({
                        x: this.x + (Math.random() * 4 - 2),
                        y: this.y + (Math.random() * 4 - 2),
                        size: Math.random() * 1.5,
                        alpha: 1,
                        decay: 0.02 + Math.random() * 0.03,
                        color: this.special ? `hsl(${(Math.random() * 60) + (this.y % 360)}, 100%, 50%)` : this.color // Traînée multicolore pour les spéciaux
                    });
                }
            }
            
            // Déplacement
            this.y -= this.speed;
        } else if (this.particles.length === 0) {
            // Explosion
            this.playExplosionSound();
            
            switch (this.explosionType) {
                case 0: // Explosion standard
                    for (let i = 0; i < this.particleCount; i++) {
                        this.particles.push(new Particle(this.x, this.y, this.color));
                    }
                    break;
                case 1: // Explosion en cercle
                    for (let i = 0; i < this.particleCount; i++) {
                        const angle = (i / this.particleCount) * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        this.particles.push(new Particle(this.x, this.y, this.color, angle, speed));
                    }
                    break;
                case 2: // Explosion en spirale
                    for (let i = 0; i < this.particleCount; i++) {
                        const angle = (i / this.particleCount) * Math.PI * 10;
                        const speed = 1 + (i / this.particleCount) * 4;
                        this.particles.push(new Particle(this.x, this.y, this.color, angle, speed));
                    }
                    break;
                case 3: // Double explosion
                    for (let i = 0; i < this.particleCount; i++) {
                        const angle = (i / this.particleCount) * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        this.particles.push(new Particle(this.x, this.y, this.color, angle, speed));
                        
                        if (i % 3 === 0) {
                            const angle2 = angle + Math.PI / 6;
                            const speed2 = speed * 0.6;
                            const color2 = `hsl(${(parseInt(this.color.split('(')[1].split(',')[0]) + 180) % 360}, 100%, 50%)`;
                            this.particles.push(new Particle(this.x, this.y, color2, angle2, speed2));
                        }
                    }
                    break;
                case 4: // Explosion en étoile
                    const points = 5 + Math.floor(Math.random() * 4);
                    for (let i = 0; i < this.particleCount; i++) {
                        const segment = Math.floor(i / (this.particleCount / points));
                        const angle = (segment / points) * Math.PI * 2 + (Math.random() * 0.3 - 0.15);
                        const speed = 2 + Math.random() * 3;
                        this.particles.push(new Particle(this.x, this.y, this.color, angle, speed));
                    }
                    break;
                case 5: // Explosion en coeur
                    for (let i = 0; i < this.particleCount; i++) {
                        const angle = (i / this.particleCount) * Math.PI * 2;
                        // Équation de coeur en coordonnées polaires
                        const heartRadius = 2 + Math.sin(angle) * Math.sqrt(Math.abs(Math.cos(angle))) / (Math.sin(angle) + 1.4);
                        const speed = heartRadius * 2;
                        // Rouge pour les coeurs
                        this.particles.push(new Particle(this.x, this.y, 'hsl(350, 100%, 50%)', angle, speed));
                    }
                    break;
                case 6: // Explosion multicolore
                    for (let i = 0; i < this.particleCount; i++) {
                        const angle = (i / this.particleCount) * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        const particleColor = `hsl(${(i / this.particleCount) * 360}, 100%, 50%)`;
                        this.particles.push(new Particle(this.x, this.y, particleColor, angle, speed));
                    }
                    break;
            }
            
            // Pour les feux d'artifice spéciaux, ajouter une explosion secondaire
            if (this.special) {
                setTimeout(() => {
                    // 40% des particules primaires
                    const secondaryCount = Math.floor(this.particleCount * 0.4);
                    for (let i = 0; i < secondaryCount; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 1 + Math.random() * 2;
                        const particleColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                        this.particles.push(new Particle(
                            this.x + (Math.random() * 40 - 20), 
                            this.y + (Math.random() * 40 - 20), 
                            particleColor, 
                            angle, 
                            speed
                        ));
                    }
                    
                    // Rejouer un son pour l'explosion secondaire
                    this.playExplosionSound(0.3);
                }, 300);
            }
        }

        // Update trail particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            this.trailParticles[i].alpha -= this.trailParticles[i].decay;
            if (this.trailParticles[i].alpha <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }

        // Update explosion particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Check if firework is dead
        if (this.y <= this.targetY && this.particles.length === 0 && this.trailParticles.length === 0) {
            this.dead = true;
        }
    }
    
    // Créer un son synthétique pour les explosions
    createExplosionSound(volume = 1.0) {
        try {
            // Créer un contexte audio si besoin
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const ctx = window.audioContext;
            
            // Créer un noeud pour le bruit blanc
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            // Remplir le buffer avec du bruit blanc
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            // Créer un noeud pour lire le buffer
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            
            // Créer un noeud de gain pour le volume et l'enveloppe
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(volume * 0.8, ctx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            
            // Créer un filtre passe-bas
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
            
            // Connecter les noeuds
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Démarrer et arrêter le son
            noise.start();
            noise.stop(ctx.currentTime + 0.6);
            
            return true;
        } catch (e) {
            console.error('Erreur lors de la création du son synthétique:', e);
            return false;
        }
    }
    
    playExplosionSound(volume = null) {
        // Plus de variété de sons
        const soundTypes = ['explosion', 'whoosh', 'pop'];
        const soundType = soundTypes[Math.floor(Math.random() * soundTypes.length)];
        
        let soundId;
        
        if (soundType === 'explosion') {
            soundId = 'explosion' + (Math.floor(Math.random() * 4) + 1);
        } else if (soundType === 'whoosh') {
            soundId = 'whoosh' + (Math.floor(Math.random() * 3) + 1);
        } else {
            soundId = 'pop1';
        }
        
        const finalVolume = volume || (Math.random() * 0.2 + 0.8); // Volume entre 0.8 et 1.0 (beaucoup plus fort)
        
        try {
            // Une chance sur trois de générer directement un son synthétique de haute qualité
            if (Math.random() < 0.3) {
                if (this.createExplosionSound(finalVolume)) {
                    return; // Si le son synthétique a été créé avec succès, on s'arrête là
                }
            }
            
            if (window.fireworksSounds && window.fireworksSounds[soundId]) {
                // Créer un nouvel élément audio à chaque fois pour permettre plusieurs sons simultanés
                const audio = new Audio(window.fireworksSounds[soundId].src);
                audio.volume = finalVolume;
                
                // Définir un crossorigin pour éviter les problèmes CORS
                audio.crossOrigin = "anonymous";
                
                // S'assurer que le son est chargé avant de jouer
                audio.oncanplaythrough = () => {
                    const promise = audio.play();
                    if (promise !== undefined) {
                        promise.catch(e => {
                            console.log("Erreur de lecture audio, utilisation du fallback:", e);
                            this.createExplosionSound(finalVolume) || this.playFallbackSound(finalVolume);
                        });
                    }
                };
                
                // Fallback si l'événement oncanplaythrough ne se déclenche pas
                setTimeout(() => {
                    if (audio.paused) {
                        audio.play().catch(e => {
                            this.createExplosionSound(finalVolume) || this.playFallbackSound(finalVolume);
                        });
                    }
                }, 100);
            } else {
                // Son de fallback si les sons ne sont pas chargés
                this.createExplosionSound(finalVolume) || this.playFallbackSound(finalVolume);
            }
        } catch (e) {
            console.error('Erreur lors de la lecture audio:', e);
            this.createExplosionSound(finalVolume) || this.playFallbackSound(finalVolume);
        }
    }
    
    // Jouer un son de fallback généré par l'API Web Audio - plus fort et plus clair
    playFallbackSound(volume) {
        try {
            // Créer un contexte audio si besoin
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const ctx = window.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            // Paramètres pour un son plus clair et plus fort
            oscillator.type = 'square'; // Type d'onde qui donne un son plus net
            oscillator.frequency.setValueAtTime(220 + Math.random() * 440, ctx.currentTime); // Fréquence plus audible
            oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
            
            // Ajuster volume et durée
            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            // Connecter et démarrer
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error('Erreur lors de la génération du son fallback:', e);
        }
    }

    draw(ctx) {
        // Draw trail particles
        for (const particle of this.trailParticles) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color || this.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw firework
        if (this.y > this.targetY) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Ajouter un halo
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Pour les feux spéciaux, ajouter un effet de scintillement
            if (this.special) {
                ctx.globalAlpha = 0.7 * Math.random();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw particles
        ctx.globalAlpha = 1;
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
}

class Particle {
    constructor(x, y, color, angle = null, speed = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = 1 + Math.random() * 2.5; // Plus grosse
        this.speed = speed || (1 + Math.random() * 4); // Plus rapide
        this.angle = angle || (Math.random() * Math.PI * 2);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.gravity = 0.05;
        this.alpha = 1;
        this.decay = 0.006 + Math.random() * 0.015; // Plus lent à disparaître
        this.trail = [];
        this.maxTrailLength = Math.floor(Math.random() * 6) + 2; // Plus de traînée
        // 10% de chance d'avoir une particule qui scintille
        this.sparkle = Math.random() > 0.9;
        this.sparkleSpeed = 0.05 + Math.random() * 0.1;
        this.sparkleFactor = 0;
    }

    update() {
        // Ajouter la position actuelle à la traînée
        this.trail.push({x: this.x, y: this.y, alpha: this.alpha});
        
        // Limiter la longueur de la traînée
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Move particle
        this.x += this.vx;
        this.vy += this.gravity;
        this.y += this.vy;
        
        // Decay alpha
        this.alpha -= this.decay;
        
        // Update sparkle effect
        if (this.sparkle) {
            this.sparkleFactor = Math.sin(Date.now() * this.sparkleSpeed) * 0.5 + 0.5;
        }
    }

    draw(ctx) {
        // Dessiner la traînée
        for (let i = 0; i < this.trail.length; i++) {
            const trailPoint = this.trail[i];
            const trailAlpha = (i / this.trail.length) * trailPoint.alpha * 0.6;
            
            ctx.globalAlpha = trailAlpha;
            ctx.fillStyle = this.color;
            const trailSize = this.size * (i / this.trail.length) * 0.8;
            
            ctx.beginPath();
            ctx.arc(trailPoint.x, trailPoint.y, trailSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dessiner la particule
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        // Ajuster la taille si c'est une particule scintillante
        const displaySize = this.sparkle ? this.size * (0.7 + this.sparkleFactor * 0.6) : this.size;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, displaySize, 0, Math.PI * 2);
        ctx.fill();
        
        // Dessiner un halo
        ctx.globalAlpha = this.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, displaySize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

class FireworksManager {
    constructor() {
        this.isActive = false;
        this.canvas = null;
        this.ctx = null;
        this.fireworks = [];
        this.lastFireworkTime = 0;
        this.fireInterval = 300; // Plus rapide
        this.animationId = null;
        this.secretCode = "sunwave";
        this.userInput = "";
        this.soundsLoaded = false;
        
        // Listen for user keystrokes
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        // Add the key to userInput
        this.userInput += event.key.toLowerCase();
        
        // Check if the user input contains the secret code
        if (this.userInput.includes(this.secretCode)) {
            this.userInput = ""; // Reset user input
            this.toggleFireworks(); // Toggle fireworks
        }
        
        // Keep userInput to a reasonable length
        if (this.userInput.length > 20) {
            this.userInput = this.userInput.substring(this.userInput.length - 20);
        }
    }

    toggleFireworks() {
        if (this.isActive) {
            this.stopFireworks();
        } else {
            this.startFireworks();
        }
    }
    
    preloadSounds() {
        if (this.soundsLoaded) return;
        
        // Créer les sons dans la mémoire du navigateur
        if (!window.fireworksSounds) {
            window.fireworksSounds = {};
            
            // Utilisation de sons fiables hébergés sur un CDN
            const SOUND_BASE_URL = "https://cdn.freesound.org/sounds/";
            
            // Sons de sifflement
            const whistleSound = new Audio("https://cdn.freesound.org/previews/514/514675_3921299-lq.mp3");
            whistleSound.preload = 'auto';
            window.fireworksSounds['whistle'] = whistleSound;
            
            // Sons d'explosion variés
            const explosion1Sound = new Audio("https://cdn.freesound.org/previews/513/513677_2554312-lq.mp3");
            explosion1Sound.preload = 'auto';
            window.fireworksSounds['explosion1'] = explosion1Sound;
            
            const explosion2Sound = new Audio("https://cdn.freesound.org/previews/107/107614_945474-lq.mp3");
            explosion2Sound.preload = 'auto';
            window.fireworksSounds['explosion2'] = explosion2Sound;
            
            const explosion3Sound = new Audio("https://cdn.freesound.org/previews/531/531167_9497060-lq.mp3");
            explosion3Sound.preload = 'auto';
            window.fireworksSounds['explosion3'] = explosion3Sound;
            
            const explosion4Sound = new Audio("https://cdn.freesound.org/previews/100/100772_1204008-lq.mp3");
            explosion4Sound.preload = 'auto';
            window.fireworksSounds['explosion4'] = explosion4Sound;
            
            // Sons de whoosh et bangs
            const whoosh1Sound = new Audio("https://cdn.freesound.org/previews/511/511503_9288545-lq.mp3");
            whoosh1Sound.preload = 'auto';
            window.fireworksSounds['whoosh1'] = whoosh1Sound;
            
            const whoosh2Sound = new Audio("https://cdn.freesound.org/previews/514/514873_9866534-lq.mp3");
            whoosh2Sound.preload = 'auto';
            window.fireworksSounds['whoosh2'] = whoosh2Sound;
            
            const whoosh3Sound = new Audio("https://cdn.freesound.org/previews/415/415079_5121236-lq.mp3");
            whoosh3Sound.preload = 'auto';
            window.fireworksSounds['whoosh3'] = whoosh3Sound;
            
            const pop1Sound = new Audio("https://cdn.freesound.org/previews/514/514696_6142149-lq.mp3");
            pop1Sound.preload = 'auto';
            window.fireworksSounds['pop1'] = pop1Sound;
            
            // Forcer le chargement des sons
            Object.values(window.fireworksSounds).forEach(sound => {
                sound.load();
                // Précharger les sons en les jouant silencieusement
                sound.volume = 0;
                sound.muted = true;
                sound.play().then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.muted = false;
                }).catch(() => {
                    // Ignorer les erreurs de préchargement
                });
            });
        }
        
        this.soundsLoaded = true;
    }

    startFireworks() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Précharger les sons
        this.preloadSounds();
        
        // Jouer le son de lancement
        try {
            if (window.fireworksSounds && window.fireworksSounds['whistle']) {
                const audio = new Audio(window.fireworksSounds['whistle'].src);
                audio.volume = 1.0; // Volume maximum
                audio.crossOrigin = "anonymous";
                
                // Essayer de jouer immédiatement
                const promise = audio.play();
                if (promise !== undefined) {
                    promise.catch(e => {
                        console.error("Erreur de lecture audio:", e);
                        // En cas d'échec, utiliser le son de fallback
                        this.playFallbackSound(1.0);
                    });
                }
            } else {
                // Fallback si le son n'est pas disponible
                this.playFallbackSound(1.0);
            }
        } catch (e) {
            console.error('Erreur lors de la lecture audio:', e);
            this.playFallbackSound(1.0);
        }
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'fireworks-canvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Start animation
        this.animate();
        
        // Add event listener to handle clicks for mobile
        document.addEventListener('click', () => {
            if (this.isActive) {
                // Jouer un son de lancement aléatoire
                try {
                    // Choisir aléatoirement entre un son de sifflement ou un whoosh
                    const soundId = Math.random() > 0.5 ? 'whistle' : 'whoosh' + (Math.floor(Math.random() * 3) + 1);
                    if (window.fireworksSounds && window.fireworksSounds[soundId]) {
                        const audio = new Audio(window.fireworksSounds[soundId].src);
                        audio.volume = 1.0; // Volume maximum
                        audio.crossOrigin = "anonymous";
                        
                        const promise = audio.play();
                        if (promise !== undefined) {
                            promise.catch(e => {
                                console.error("Erreur de lecture audio:", e);
                                this.playFallbackSound(1.0);
                            });
                        }
                    } else {
                        this.playFallbackSound(1.0);
                    }
                } catch (e) {
                    console.error('Erreur lors de la lecture audio:', e);
                    this.playFallbackSound(1.0);
                }
                
                // Ajouter plusieurs feux d'artifice
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.addFirework();
                    }, i * 100);
                }
            }
        });
        
        // Add tap hint for mobile
        const hint = document.createElement('div');
        hint.className = 'fireworks-hint';
        hint.textContent = 'Tapez n\'importe où pour plus de feux d\'artifice! Appuyez sur ESC pour quitter.';
        hint.style.position = 'fixed';
        hint.style.bottom = '20px';
        hint.style.left = '50%';
        hint.style.transform = 'translateX(-50%)';
        hint.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        hint.style.color = 'white';
        hint.style.padding = '10px 20px';
        hint.style.borderRadius = '20px';
        hint.style.zIndex = '10000';
        hint.style.fontFamily = 'Arial, sans-serif';
        hint.style.fontSize = '14px';
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.5s';
        document.body.appendChild(hint);
        this.hint = hint;
        
        setTimeout(() => {
            if (this.isActive) {
                this.hint.style.opacity = '1';
            }
        }, 1000);
        
        // Listen for escape key to exit
        document.addEventListener('keydown', this.handleEscapeKey);
        
        // Initial burst of fireworks
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (this.isActive) {
                    this.addFirework();
                }
            }, i * 300);
        }
    }
    
    handleEscapeKey = (event) => {
        if (event.key === 'Escape' && this.isActive) {
            // Arrêter les sons immédiatement avant d'arrêter les feux d'artifice
            this.stopAllSounds();
            this.stopFireworks();
        }
    }

    stopFireworks() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Arrêter tous les sons en cours
        this.stopAllSounds();
        
        // Cancel animation
        cancelAnimationFrame(this.animationId);
        
        // Remove canvas
        if (this.canvas) {
            document.body.removeChild(this.canvas);
        }
        
        // Remove hint
        if (this.hint) {
            document.body.removeChild(this.hint);
        }
        
        // Remove escape key listener
        document.removeEventListener('keydown', this.handleEscapeKey);
    }
    
    // Arrêter tous les sons en cours
    stopAllSounds() {
        // Arrêter les sons des feux d'artifice
        if (window.fireworksSounds) {
            Object.values(window.fireworksSounds).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
        }
        
        // Arrêter aussi toutes les instances audio qui pourraient être en cours
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        // Si on utilise Web Audio API, arrêter le contexte
        if (window.audioContext) {
            try {
                // Suspendre le contexte audio
                window.audioContext.suspend();
                
                // Créer un nouveau contexte pour être sûr que tout est arrêté
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Erreur lors de l'arrêt du contexte audio:", e);
            }
        }
    }

    animate() {
        if (!this.isActive) return;
        
        // Clear canvas with a semi-transparent black to create trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add new firework
        const now = Date.now();
        if (now - this.lastFireworkTime > this.fireInterval) {
            this.addFirework();
            this.lastFireworkTime = now;
        }
        
        // Update and draw fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            this.fireworks[i].update();
            this.fireworks[i].draw(this.ctx);
            
            if (this.fireworks[i].dead) {
                this.fireworks.splice(i, 1);
            }
        }
        
        // Request next frame
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

    addFirework() {
        this.fireworks.push(new Firework(this.canvas.width, this.canvas.height));
    }
}

// Initialize the fireworks manager
document.addEventListener('DOMContentLoaded', () => {
    window.fireworksEasterEgg = new FireworksManager();
    console.log("Easter egg loaded! Try typing 'sunwave' anywhere on the site...");
    
    // Activer l'audio sur le premier clic
    document.addEventListener('click', enableAudio, { once: true });
    
    // Activer le son sur l'interaction utilisateur
    function enableAudio() {
        // Activer silencieusement l'audio sur les navigateurs qui bloquent l'autoplay
        if (window.fireworksSounds) {
            Object.values(window.fireworksSounds).forEach(sound => {
                sound.volume = 0;
                sound.play().then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }).catch(e => {
                    // Silencieux intentionnellement
                });
            });
        } else {
            // Précharger les sons si pas encore fait
            const tempAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
            tempAudio.volume = 0;
            tempAudio.play().then(() => {
                tempAudio.pause();
                tempAudio.currentTime = 0;
            }).catch(e => {
                // Silencieux intentionnellement
            });
        }
    }
    
    // Arrêter les sons quand on quitte la page ou change d'onglet
    window.addEventListener('beforeunload', () => {
        if (window.fireworksEasterEgg && window.fireworksEasterEgg.isActive) {
            window.fireworksEasterEgg.stopAllSounds();
        }
    });
    
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && window.fireworksEasterEgg && window.fireworksEasterEgg.isActive) {
            window.fireworksEasterEgg.stopAllSounds();
        }
    });
}); 