class PriceConfigurator {
    constructor() {
        this.prices = {
            sprinkler: 50,  // Prix par buse
            pipe: 15,       // Prix par mètre de tuyau
            sensor: 75,     // Prix par capteur
            pump: 1200,     // Prix par pompe
            tank: 2500,     // Prix cuve 10m³
            installation: 0.40  // 40% du coût matériel
        };
        
        this.currentTool = 'sprinkler';
        this.isDrawingPipe = false;
        this.startPoint = null;
        
        this.layout = {
            sprinklers: [],
            sensors: [],
            pumps: [],
            tanks: [],
            pipes: []
        };
        
        this.scale = 1;
        this.dragArea = document.getElementById('dragArea');
        this.panelOrientation = 'landscape';
        this.initDragArea();
        this.initToolbar();
        this.initZoom();
        this.selectedElement = null;
        
        this.dragArea.addEventListener('click', (e) => {
            if (e.ctrlKey && (e.target.classList.contains('sprinkler') || 
                            e.target.classList.contains('sensor') ||
                            e.target.classList.contains('pump') ||
                            e.target.classList.contains('tank'))) {
                this.removeElement(e.target);
                return;
            }
            this.handleClick(e);
        });
        this.initDragAndDrop();
    }

    initToolbar() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentTool = btn.dataset.tool;
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    initDragArea() {
        const surface = parseInt(document.getElementById('surface').value);
        const panelType = document.getElementById('panelType').value;
        
        // Dimensions des panneaux en mètres (en paysage)
        const panelDims = {
            'standard': { width: 1.6, height: 1 },  // Inversé pour le mode paysage
            'large': { width: 2, height: 1.2 }
        };
        
        // Calcul du nombre de panneaux
        const panel = panelDims[panelType];
        const panelArea = panel.width * panel.height;
        const numberOfPanels = Math.ceil(surface / panelArea);
        
        // Calcul optimal des rangées et colonnes
        const ratio = Math.sqrt(numberOfPanels * (panel.height / panel.width));
        const rows = Math.ceil(ratio);
        const cols = Math.ceil(numberOfPanels / rows);
        
        // Dimensions de la zone de dessin (échelle 1:10)
        const scale = 50; // 1 mètre = 50 pixels
        const width = cols * panel.width * scale;
        const height = rows * panel.height * scale;
        
        this.dragArea.style.width = `${width}px`;
        this.dragArea.style.height = `${height}px`;
        
        // Nettoyage et création des panneaux
        this.dragArea.innerHTML = '';
        this.panelPositions = [];
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if ((i * cols + j) < numberOfPanels) {
                    const panelElement = document.createElement('div');
                    panelElement.className = 'panel';
                    panelElement.style.width = `${panel.width * scale}px`;
                    panelElement.style.height = `${panel.height * scale}px`;
                    const left = j * panel.width * scale;
                    const top = i * panel.height * scale;
                    panelElement.style.left = `${left}px`;
                    panelElement.style.top = `${top}px`;
                    this.dragArea.appendChild(panelElement);
                    
                    // Stockage des positions pour les buses
                    this.panelPositions.push({
                        center: {
                            x: left + (panel.width * scale / 2),
                            y: top + 10 // 10px depuis le haut du panneau
                        },
                        panel: panelElement
                    });
                }
            }
        }
        
        // Ajout des événements
        this.dragArea.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleClick(e) {
        const rect = this.dragArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        switch(this.currentTool) {
            case 'sprinkler':
                // Trouve le panneau le plus proche
                const nearestPanel = this.findNearestPanel(x, y);
                if (nearestPanel) {
                    this.addSprinkler(nearestPanel.center.x, nearestPanel.center.y);
                }
                break;
            case 'sensor':
                this.addSensor(x, y);
                break;
            case 'pump':
                this.addPump(x, y);
                break;
            case 'tank':
                this.addTank(x, y);
                break;
        }
    }

    findNearestPanel(x, y) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const pos of this.panelPositions) {
            const dist = Math.hypot(x - pos.center.x, y - pos.center.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = pos;
            }
        }
        
        return minDist < 50 ? nearest : null; // 50px de tolérance
    }

    addSprinkler(x, y) {
        const sprinkler = document.createElement('div');
        sprinkler.className = 'sprinkler';
        sprinkler.style.left = `${x}px`;
        sprinkler.style.top = `${y}px`;
        
        // Ajouter un identifiant unique à la buse
        sprinkler.dataset.id = `sprinkler-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        this.dragArea.appendChild(sprinkler);
        this.makeDraggable(sprinkler);
        
        // Ajouter la buse à la liste des buses
        this.layout.sprinklers.push({
            element: sprinkler,
            x: x,
            y: y
        });
        
        // Connecter automatiquement les buses entre elles
        this.updateAutomaticConnections();
        
        // Mettre à jour le prix
        this.updatePrice();
        
        this.checkAndCreateConnections();
        return sprinkler;
    }

    addSensor(x, y) {
        const sensor = document.createElement('div');
        sensor.className = 'sensor';
        sensor.style.left = `${x - 15}px`;
        sensor.style.top = `${y - 15}px`;
        
        this.dragArea.appendChild(sensor);
        this.layout.sensors.push({ x, y, element: sensor });
        this.updatePrices();
    }

    handlePipeDrawing(x, y) {
        if (!this.isDrawingPipe) {
            this.startPoint = { x, y };
            this.isDrawingPipe = true;
        } else {
            this.addPipe(this.startPoint, { x, y });
            this.isDrawingPipe = false;
            this.startPoint = null;
        }
    }

    addPipe(start, end) {
        const pipe = document.createElement('div');
        pipe.className = 'pipe';
        
        const length = Math.sqrt(
            Math.pow(end.x - start.x, 2) + 
            Math.pow(end.y - start.y, 2)
        );
        
        const angle = Math.atan2(
            end.y - start.y,
            end.x - start.x
        ) * 180 / Math.PI;
        
        pipe.style.width = `${length}px`;
        pipe.style.transform = `rotate(${angle}deg)`;
        pipe.style.left = `${start.x}px`;
        pipe.style.top = `${start.y}px`;
        
        // Stocker les coordonnées pour les vérifications futures
        pipe.dataset.startX = start.x;
        pipe.dataset.startY = start.y;
        pipe.dataset.endX = end.x;
        pipe.dataset.endY = end.y;
        
        this.dragArea.appendChild(pipe);
        
        const newPipe = {
            start,
            end,
            element: pipe,
            length: length
        };
        
        this.layout.pipes.push(newPipe);
        this.updatePrices();
        this.checkConnections();
        return pipe;
    }

    removeElement(element) {
        // Supprimer les tuyaux connectés à cet élément
        this.layout.pipes = this.layout.pipes.filter(pipe => {
            if (pipe.startElement === element || pipe.endElement === element) {
                pipe.element.remove();
                return false;
            }
            return true;
        });
        
        // Supprimer l'élément de la liste correspondante
        if (element.classList.contains('sprinkler')) {
            this.layout.sprinklers = this.layout.sprinklers.filter(item => item.element !== element);
        } else if (element.classList.contains('pump')) {
            this.layout.pumps = this.layout.pumps.filter(item => item.element !== element);
        } else if (element.classList.contains('tank')) {
            this.layout.tanks = this.layout.tanks.filter(item => item.element !== element);
        } else if (element.classList.contains('sensor')) {
            this.layout.sensors = this.layout.sensors.filter(item => item.element !== element);
        }
        
        // Supprimer l'élément du DOM
        element.remove();
        
        // Reconnecter automatiquement les buses
        this.updateAutomaticConnections();
        
        // Mettre à jour le prix
        this.updatePrice();
    }

    calculatePumpRequirements() {
        const sprinklerCount = this.layout.sprinklers.length;
        const flowPerSprinkler = 2; // L/min
        const totalFlow = sprinklerCount * flowPerSprinkler;
        const pumpCount = Math.ceil(totalFlow / 30); // Une pompe pour 30L/min
        return {
            count: pumpCount,
            totalFlow: totalFlow,
            pressure: 3 // bars
        };
    }

    updatePrices() {
        const sprinklerCount = this.layout.sprinklers.length;
        const sensorCount = this.layout.sensors.length;
        const pumpCount = this.layout.pumps.length || 1; // Au moins une pompe
        const tankCount = this.layout.tanks.length || 1; // Au moins une cuve
        
        const pipeLength = this.layout.pipes.reduce((total, pipe) => 
            total + pipe.length, 0) / 50; // Conversion en mètres
        
        const sprinklerCost = sprinklerCount * 50;
        const pipeCost = pipeLength * 15;
        const sensorCost = sensorCount * 75;
        const pumpCost = pumpCount * 1200;
        const tankCost = tankCount * 2500;
        
        const materialCost = sprinklerCost + pipeCost + sensorCost + pumpCost + tankCost;
        const installationCost = materialCost * 0.40;
        const totalCost = materialCost + installationCost;
        
        document.getElementById('sprinklerCount').textContent = sprinklerCount;
        document.getElementById('pipeLength').textContent = pipeLength.toFixed(1);
        document.getElementById('sensorCount').textContent = sensorCount;
        document.getElementById('pumpCount').textContent = pumpCount;
        document.getElementById('tankCount').textContent = tankCount;
        document.getElementById('installationCost').textContent = installationCost.toFixed(2);
        document.getElementById('totalCost').textContent = totalCost.toFixed(2);
    }

    calculateTotalPipeLength() {
        return this.layout.pipes.reduce((total, pipe) => {
            return total + pipe.length;
        }, 0) / 50;
    }

    generateQuote() {
        // Calculer la longueur totale des tuyaux
        const pipeLength = this.calculateTotalPipeLength();
        
        // Compter les éléments
        const sprinklers = this.layout.sprinklers.length;
        const sensors = this.layout.sensors.length;
        const pumps = this.layout.pumps.length;
        const tanks = this.layout.tanks.length;
        
        // Récupérer la valeur de la surface
        const surface = parseFloat(document.getElementById('surface').value) || 100;
        const panelType = document.getElementById('panelType').value || 'standard';
        
        // Calcul de la zone climatique
        const climateZone = this.updateClimateZone();
        
        // Calcul des coûts
        const sprinklerCost = sprinklers * 50;
        const pipeCost = Math.round(pipeLength * 15);
        const sensorCost = sensors * 75;
        const pumpCost = pumps * 1200;
        const tankCost = tanks * 2500;
        
        // Coût total du matériel
        const totalMaterialCost = sprinklerCost + pipeCost + sensorCost + pumpCost + tankCost;
        
        // Coût d'installation (40% du coût matériel)
        const installationCost = Math.round(totalMaterialCost * 0.4);
        
        // Coût total
        const totalCost = totalMaterialCost + installationCost;
        
        // Calcul des économies annuelles (20% du coût total)
        const yearlyGain = Math.round(totalCost * 0.2);
        
        // Production optimisée (15%)
        const optimizedProduction = 15;
        
        // Préparation des données pour le template
        return {
            surface,
            panelType,
            climateZone,
            sprinklers,
            sensors,
            pipeLength,
            pump_requirements: {
                totalFlow: sprinklers * 2,
                count: pumps > 0 ? pumps : 1,
                pressure: 3
            },
            tank_autonomy: 7,
            totalCost,
            installationCost,
            yearlyGain,
            optimizedProduction,
            detailedCostBreakdown: {
                sprinklerCost,
                pipeCost,
                sensorCost,
                pumpCost,
                tankCost,
                totalMaterialCost
            }
        };
    }

    updateClimateZone() {
        // Récupérer la valeur sélectionnée
        const climateZone = document.getElementById('climateZone').value;
        
        // Ajuster l'interface en fonction de la zone climatique
        switch(climateZone) {
            case 'desert':
                // Désert: conditions extrêmes, ajuster les recommandations
                return 'Désertique';
            case 'arid':
                // Aride: conditions sèches mais moins extrêmes
                return 'Aride';
            case 'temperate':
                // Tempéré: conditions plus douces
                return 'Tempéré';
            default:
                return 'Désertique';
        }
    }

    updateLayout() {
        const surface = parseInt(document.getElementById('surface').value);
        const panelType = document.getElementById('panelType').value;
        
        this.clearLayout();
        this.initDragArea();
        this.updateClimateZone();
    }

    clearLayout() {
        this.layout.sprinklers = [];
        this.layout.sensors = [];
        this.layout.pipes = [];
        this.dragArea.innerHTML = '';
        this.updatePrices();
    }

    zoom(factor) {
        this.scale *= factor;
        this.scale = Math.min(Math.max(0.2, this.scale), 3); // Limites de zoom
        this.dragArea.style.transform = `scale(${this.scale})`;
    }

    initZoom() {
        this.dragArea.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const factor = e.deltaY > 0 ? 0.9 : 1.1;
                this.zoom(factor);
            }
        });
    }

    addPump(x, y) {
        const pump = document.createElement('div');
        pump.className = 'pump';
        pump.style.left = `${x}px`;
        pump.style.top = `${y}px`;
        
        // Ajouter un identifiant unique à la pompe
        pump.dataset.id = `pump-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        this.dragArea.appendChild(pump);
        this.makeDraggable(pump);
        
        // Ajouter la pompe à la liste des pompes
        this.layout.pumps.push({
            element: pump,
            x: x,
            y: y
        });
        
        // Connecter automatiquement les buses à la pompe
        this.updateAutomaticConnections();
        
        // Mettre à jour le prix
        this.updatePrice();
        
        this.checkAndCreateConnections();
        return pump;
    }

    addTank(x, y) {
        const tank = document.createElement('div');
        tank.className = 'tank';
        tank.style.left = `${x}px`;
        tank.style.top = `${y}px`;
        
        // Ajouter un identifiant unique au réservoir
        tank.dataset.id = `tank-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        this.dragArea.appendChild(tank);
        this.makeDraggable(tank);
        
        // Ajouter le réservoir à la liste des réservoirs
        this.layout.tanks.push({
            element: tank,
            x: x,
            y: y
        });
        
        // Connecter automatiquement les buses au réservoir
        this.updateAutomaticConnections();
        
        // Mettre à jour le prix
        this.updatePrice();
        
        this.checkAndCreateConnections();
        return tank;
    }

    initDragAndDrop() {
        this.dragArea.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'pipe') {
                const rect = this.dragArea.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.handlePipeDrawing(x, y);
            } else if (e.target.classList.contains('sprinkler') || 
                      e.target.classList.contains('sensor') ||
                e.target.classList.contains('pump') || 
                e.target.classList.contains('tank')) {
                
                // Vérifier si la touche Ctrl est enfoncée pour supprimer l'élément
                if (e.ctrlKey) {
                    this.removeElement(e.target);
                    return;
                }
                
                this.selectedElement = e.target;
                const startX = e.clientX;
                const startY = e.clientY;
                
                const onMouseMove = (moveEvent) => {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;
                    
                    const rect = this.dragArea.getBoundingClientRect();
                    const newX = Math.min(Math.max(0, e.clientX - rect.left + dx), this.dragArea.offsetWidth);
                    const newY = Math.min(Math.max(0, e.clientY - rect.top + dy), this.dragArea.offsetHeight);
                    
                    this.selectedElement.style.left = `${newX - (this.selectedElement.offsetWidth / 2)}px`;
                    this.selectedElement.style.top = `${newY - (this.selectedElement.offsetHeight / 2)}px`;
                    
                    // Mettre à jour les coordonnées dans le layout
                    this.updateElementPosition(this.selectedElement, newX, newY);
                };
                
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    this.selectedElement = null;
                    
                    // Mettre à jour les connexions automatiques après le déplacement
                    this.updateAutomaticConnections();
                    this.checkConnections();
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
    }

    updatePipes() {
        // Mise à jour des tuyaux connectés aux buses
        this.layout.pipes.forEach(pipe => {
            // Vérifier si ce tuyau est connecté à une pompe ou une cuve
            this.checkPipeConnections(pipe);
        });
    }

    checkPipeConnections(pipe) {
        // Vérifier si le tuyau est connecté à une pompe
        const connectedToPump = this.layout.pumps.some(pump => {
            const pumpRect = pump.element.getBoundingClientRect();
            const pumpCenter = {
                x: pump.x,
                y: pump.y
            };
            
            return this.isPointNearLine(pumpCenter, pipe.start, pipe.end, 20);
        });
        
        // Vérifier si le tuyau est connecté à une cuve
        const connectedToTank = this.layout.tanks.some(tank => {
            const tankRect = tank.element.getBoundingClientRect();
            const tankCenter = {
                x: tank.x,
                y: tank.y
            };
            
            return this.isPointNearLine(tankCenter, pipe.start, pipe.end, 20);
        });
        
        // Vérifier si le tuyau est connecté à un sprinkler
        const connectedToSprinkler = this.layout.sprinklers.some(sprinkler => {
            return this.isPointNearLine(sprinkler, pipe.start, pipe.end, 20);
        });
        
        // Appliquer la classe CSS appropriée
        if ((connectedToPump || connectedToTank) && connectedToSprinkler) {
            pipe.element.classList.add('connected');
        } else {
            pipe.element.classList.remove('connected');
        }
    }

    isPointNearLine(point, lineStart, lineEnd, tolerance) {
        // Calcul de la distance d'un point à une ligne
        const lineLength = Math.sqrt(
            Math.pow(lineEnd.x - lineStart.x, 2) + 
            Math.pow(lineEnd.y - lineStart.y, 2)
        );
        
        if (lineLength === 0) return false;
        
        const t = ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + 
                   (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / 
                  (lineLength * lineLength);
        
        if (t < 0) {
            // Le point est plus proche du point de départ
            const distance = Math.sqrt(
                Math.pow(point.x - lineStart.x, 2) + 
                Math.pow(point.y - lineStart.y, 2)
            );
            return distance <= tolerance;
        } else if (t > 1) {
            // Le point est plus proche du point d'arrivée
            const distance = Math.sqrt(
                Math.pow(point.x - lineEnd.x, 2) + 
                Math.pow(point.y - lineEnd.y, 2)
            );
            return distance <= tolerance;
        } else {
            // Le point est proche de la ligne
            const projX = lineStart.x + t * (lineEnd.x - lineStart.x);
            const projY = lineStart.y + t * (lineEnd.y - lineStart.y);
            const distance = Math.sqrt(
                Math.pow(point.x - projX, 2) + 
                Math.pow(point.y - projY, 2)
            );
            return distance <= tolerance;
        }
    }

    checkConnections() {
        // Vérifier toutes les connexions
        this.layout.pipes.forEach(pipe => {
            this.checkPipeConnections(pipe);
        });
        
        // Créer des indicateurs de connexion entre les éléments
        this.updateConnectionIndicators();
    }

    updateConnectionIndicators() {
        // Supprimer les indicateurs existants
        document.querySelectorAll('.connection-indicator').forEach(el => el.remove());
        
        // Connexion pompe-cuve
        if (this.layout.pumps.length > 0 && this.layout.tanks.length > 0) {
            const pump = this.layout.pumps[0];
            const tank = this.layout.tanks[0];
            
            // Créer un indicateur de connexion
            const indicator = document.createElement('div');
            indicator.className = 'connection-indicator';
            
            const length = Math.sqrt(
                Math.pow(tank.x - pump.x, 2) + 
                Math.pow(tank.y - pump.y, 2)
            );
            
            const angle = Math.atan2(
                tank.y - pump.y,
                tank.x - pump.x
            ) * 180 / Math.PI;
            
            indicator.style.width = `${length}px`;
            indicator.style.transform = `rotate(${angle}deg)`;
            indicator.style.left = `${pump.x}px`;
            indicator.style.top = `${pump.y}px`;
            
            this.dragArea.appendChild(indicator);
        }
    }

    updateElementPosition(element, x, y) {
        // Mettre à jour la position dans le DOM
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        // Mettre à jour la position dans notre structure de données
        let updated = false;
        
        if (element.classList.contains('sprinkler')) {
            for (const sprinkler of this.layout.sprinklers) {
                if (sprinkler.element === element) {
                    sprinkler.x = x;
                    sprinkler.y = y;
                    updated = true;
                    break;
                }
            }
        } else if (element.classList.contains('pump')) {
            for (const pump of this.layout.pumps) {
                if (pump.element === element) {
                    pump.x = x;
                    pump.y = y;
                    updated = true;
                    break;
                }
            }
        } else if (element.classList.contains('tank')) {
            for (const tank of this.layout.tanks) {
                if (tank.element === element) {
                    tank.x = x;
                    tank.y = y;
                    updated = true;
                    break;
                }
            }
        } else if (element.classList.contains('sensor')) {
            for (const sensor of this.layout.sensors) {
                if (sensor.element === element) {
                    sensor.x = x;
                    sensor.y = y;
                    updated = true;
                    break;
                }
            }
        }
        
        if (updated) {
            // Mettre à jour les tuyaux connectés à cet élément
            this.updateConnectedPipes(element, x, y);
            
            // Recréer les connexions automatiques
            this.checkAndCreateConnections();
        }
    }
    
    updateConnectedPipes(element, x, y) {
        // Obtenir le centre de l'élément
        const elementCenter = {
            x: x + element.offsetWidth / 2,
            y: y + element.offsetHeight / 2
        };
        
        // Supprimer les tuyaux connectés à cet élément
        this.layout.pipes = this.layout.pipes.filter(pipe => {
            // Vérifier si ce tuyau est connecté à l'élément déplacé
            const distanceToStart = Math.hypot(pipe.start.x - elementCenter.x, pipe.start.y - elementCenter.y);
            const distanceToEnd = Math.hypot(pipe.end.x - elementCenter.x, pipe.end.y - elementCenter.y);
            
            if (distanceToStart < 30 || distanceToEnd < 30) {
                // Ce tuyau est connecté à l'élément déplacé, le supprimer
                pipe.element.remove();
                return false;
            }
            
            return true;
        });
    }

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY;
        
        element.addEventListener('mousedown', (e) => {
            // Vérifier si la touche CTRL est enfoncée pour supprimer l'élément
            if (e.ctrlKey) {
                this.removeElement(element);
                return;
            }
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // Ajouter la classe 'dragging' pour le style
            element.classList.add('dragging');
            
            // Empêcher la sélection de texte pendant le glissement
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const currentLeft = parseInt(element.style.left) || 0;
            const currentTop = parseInt(element.style.top) || 0;
            
            element.style.left = `${currentLeft + deltaX}px`;
            element.style.top = `${currentTop + deltaY}px`;
            
            startX = e.clientX;
            startY = e.clientY;
            
            // Mettre à jour les coordonnées dans la liste des éléments
            this.updateElementPosition(element);
            
            // Mettre à jour les tuyaux connectés à cet élément
            this.updateConnectedPipes(element);
            
            // Reconnecter automatiquement les buses
            this.updateAutomaticConnections();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('dragging');
            }
        });
    }

    generatePDF() {
        // Montrer la fenêtre d'informations client pour saisir les informations
        this.showClientInfoModal();
    }

    showClientInfoModal() {
        // Créer la modale si elle n'existe pas déjà
        let modal = document.querySelector('.client-info-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'client-info-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'client-info-content';
            
            modalContent.innerHTML = `
                <h2>Informations client</h2>
                <form id="clientInfoForm" class="client-info-form">
                    <div class="form-group">
                        <label for="clientName">Nom complet <span class="required">*</span></label>
                        <input type="text" id="clientName" name="clientName" required>
                    </div>
                    <div class="form-group">
                        <label for="clientEmail">Email <span class="required">*</span></label>
                        <input type="email" id="clientEmail" name="clientEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="clientPhone">Téléphone</label>
                        <input type="tel" id="clientPhone" name="clientPhone">
                    </div>
                    <div class="form-group">
                        <label for="clientAddress">Adresse</label>
                        <textarea id="clientAddress" name="clientAddress" rows="3"></textarea>
                    </div>
                    <div class="client-info-buttons">
                        <button type="button" class="client-info-cancel">Annuler</button>
                        <button type="submit" class="client-info-submit">Générer le devis</button>
                    </div>
                </form>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Fermer la modale quand on clique sur Annuler
            modal.querySelector('.client-info-cancel').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            // Intercepter la soumission du formulaire
            modal.querySelector('#clientInfoForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Récupérer les données du formulaire
                const clientInfo = {
                    name: document.getElementById('clientName').value,
                    email: document.getElementById('clientEmail').value,
                    phone: document.getElementById('clientPhone').value,
                    address: document.getElementById('clientAddress').value
                };
                
                // Appeler la méthode pour envoyer les données et générer le PDF
                this.sendQuoteData(clientInfo);
            });
        }
        
        // Afficher la modale
        modal.classList.add('active');
    }

    sendQuoteData(clientInfo) {
        
        // Afficher l'indicateur de chargement
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator active';
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <div>Génération du devis en cours...</div>
        `;
        document.body.appendChild(loadingIndicator);
        
        // Récupérer toutes les données nécessaires
        const quoteData = this.generateQuote();
        
        // Ajout des informations client
        const data = {
            quote: quoteData,
            client: clientInfo
        };
        
        // Envoi des données au serveur pour générer le PDF
        fetch('/generate-quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Erreur lors de la génération du devis');
                });
            }
            return response.blob();
        })
        .then(blob => {
            // Créer un URL à partir du blob
            const url = window.URL.createObjectURL(blob);
            
            // Créer un lien pour télécharger le fichier
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'devis-sunwave.pdf';
            
            // Ajouter le lien au DOM et cliquer dessus
            document.body.appendChild(a);
            a.click();
            
            // Nettoyer
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            document.body.removeChild(loadingIndicator);
            
            // Fermer la fenêtre client
            const modal = document.querySelector('.client-info-modal.active');
            if (modal) {
                modal.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.body.removeChild(loadingIndicator);
            
            // Vérifier si l'erreur est liée à wkhtmltopdf
            if (error.message && error.message.includes('wkhtmltopdf')) {
                // Afficher la boîte de dialogue pour installer wkhtmltopdf
                showPdfInstallHelp();
            } else {
                // Afficher un message d'erreur général
                alert(`Erreur lors de la génération du devis: ${error.message}`);
            }
        });
    }

    // Méthode pour vérifier et créer automatiquement les connexions
    checkAndCreateConnections() {
        // D'abord, supprimons tous les tuyaux existants
        this.layout.pipes.forEach(pipe => {
            pipe.element.remove();
        });
        this.layout.pipes = [];
        
        // On récupère tous les éléments
        const sprinklers = this.layout.sprinklers.map(s => s.element);
        const pumps = this.layout.pumps.map(p => p.element);
        const tanks = this.layout.tanks.map(t => t.element);
        
        // Créer un registre de connexions pour éviter les doublons
        const connections = new Set();
        
        // Fonction pour ajouter une connexion au registre
        const registerConnection = (elem1, elem2) => {
            // Créer un identifiant unique pour la connexion (indépendant de l'ordre)
            const ids = [elem1.dataset.id, elem2.dataset.id].sort();
            const connectionId = ids.join('-');
            
            // Vérifier si cette connexion existe déjà
            if (connections.has(connectionId)) {
                return false; // La connexion existe déjà
            }
            
            // Sinon, l'ajouter et retourner true
            connections.add(connectionId);
            return true;
        };
        
        // Fonction pour connecter deux éléments en évitant les doublons
        const connectElements = (element1, element2) => {
            // Vérifier qu'on a bien des IDs sur les deux éléments
            if (!element1.dataset.id) {
                element1.dataset.id = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            }
            if (!element2.dataset.id) {
                element2.dataset.id = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            }
            
            // Si la connexion n'existe pas déjà, créer le tuyau
            if (registerConnection(element1, element2)) {
                const center1 = this.getElementCenter(element1);
                const center2 = this.getElementCenter(element2);
                this.addPipe(center1, center2);
            }
        };
        
        // Rien à faire s'il n'y a pas d'éléments
        if (sprinklers.length === 0 && pumps.length === 0 && tanks.length === 0) return;
        
        // Gérer le cas où il n'y a que des buses (les connecter en ligne)
        if (sprinklers.length > 0 && pumps.length === 0 && tanks.length === 0) {
            // Trier les buses par position horizontale (de gauche à droite)
            const sortedSprinklers = [...sprinklers].sort((a, b) => {
                return parseFloat(a.style.left) - parseFloat(b.style.left);
            });
            
            // Connecter les buses entre elles
            for (let i = 0; i < sortedSprinklers.length - 1; i++) {
                connectElements(sortedSprinklers[i], sortedSprinklers[i + 1]);
            }
            return;
        }
        
        // Si nous avons des pompes et/ou des cuves
        if (sprinklers.length > 1) {
            // Connecter les buses entre elles (de gauche à droite)
            const sortedSprinklers = [...sprinklers].sort((a, b) => {
                return parseFloat(a.style.left) - parseFloat(b.style.left);
            });
            
            for (let i = 0; i < sortedSprinklers.length - 1; i++) {
                connectElements(sortedSprinklers[i], sortedSprinklers[i + 1]);
            }
            
            // Connecter la dernière buse à la pompe ou à la cuve
            if (pumps.length > 0) {
                connectElements(sortedSprinklers[sortedSprinklers.length - 1], pumps[0]);
                
                // Connecter la pompe à la cuve si elle existe
                if (tanks.length > 0) {
                    connectElements(pumps[0], tanks[0]);
                }
            } else if (tanks.length > 0) {
                connectElements(sortedSprinklers[sortedSprinklers.length - 1], tanks[0]);
            }
        } else if (sprinklers.length === 1) {
            // S'il n'y a qu'une seule buse
            if (pumps.length > 0) {
                connectElements(sprinklers[0], pumps[0]);
                
                // Connecter la pompe à la cuve si elle existe
                if (tanks.length > 0) {
                    connectElements(pumps[0], tanks[0]);
                }
            } else if (tanks.length > 0) {
                connectElements(sprinklers[0], tanks[0]);
            }
        } else if (pumps.length > 0 && tanks.length > 0) {
            // S'il n'y a pas de buses mais une pompe et une cuve
            connectElements(pumps[0], tanks[0]);
        }
        
        // Mettre à jour les statuts des tuyaux
        this.updateConnectionIndicators();
    }

    getElementCenter(element) {
        // Pour différents types d'éléments, calculer le centre différemment
        if (element.classList.contains('sprinkler')) {
            // Pour les buses, les pipes doivent être exactement positionnés au centre
            const left = parseFloat(element.style.left);
            const top = parseFloat(element.style.top);
            return { x: left, y: top };
        } else if (element.classList.contains('pump')) {
            // Centre de la pompe (30px = demi-largeur de 60px)
            const left = parseFloat(element.style.left) + 30;
            const top = parseFloat(element.style.top) + 30;
            return { x: left, y: top };
        } else if (element.classList.contains('tank')) {
            // Centre du réservoir (40px = demi-largeur de 80px)
            const left = parseFloat(element.style.left) + 40;
            const top = parseFloat(element.style.top) + 50;
            return { x: left, y: top };
        } else if (element.classList.contains('sensor')) {
            // Centre du capteur (15px = demi-largeur de 30px)
            const left = parseFloat(element.style.left) + 15;
            const top = parseFloat(element.style.top) + 15;
            return { x: left, y: top };
        }
        
        // Fallback si le type n'est pas reconnu
        const rect = element.getBoundingClientRect();
        const dragAreaRect = this.dragArea.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - dragAreaRect.left,
            y: rect.top + rect.height / 2 - dragAreaRect.top
        };
    }

    updateAutomaticConnections() {
        this.checkAndCreateConnections();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.configurator = new PriceConfigurator();
});

function updateAnalysisValues() {
    console.log("Mise à jour des valeurs d'analyse"); // Pour déboguer
    // Récupération des valeurs d'entrée
    const surfaceInput = parseFloat(document.getElementById('surfaceInput').value) || 0; // Valeur par défaut à 0
    const sprinklersInput = parseFloat(document.getElementById('sprinklersInput').value) || 0; // Valeur par défaut à 0
    const sensorsInput = parseFloat(document.getElementById('sensorsInput').value) || 0; // Valeur par défaut à 0
    const pumpInput = parseFloat(document.getElementById('pumpInput').value) || 0; // Valeur par défaut à 0

    // Calculs basés sur les valeurs d'entrée
    const initialInvestment = surfaceInput * 44.83; // Exemple de calcul
    const yearlyEconomies = sprinklersInput * 1793; // Exemple de calcul
    const maintenanceCost = 200; // Valeur fixe

    // Calculs
    const totalSavings = (yearlyEconomies * 25).toFixed(2); // Économies sur 25 ans
    const roi = (yearlyEconomies > 0) ? (initialInvestment / yearlyEconomies).toFixed(2) : 0; // ROI en années
    const gainAnnuel = (yearlyEconomies - maintenanceCost).toFixed(2); // Gain annuel après maintenance

    // Mise à jour des éléments de l'analyse
    document.getElementById('totalSavings').textContent = totalSavings + ' €';
    document.getElementById('roiValue').textContent = roi + ' ans';
    document.getElementById('yearlyGain').textContent = gainAnnuel + ' €';
    document.getElementById('initialInvestment').textContent = initialInvestment.toFixed(2) + ' €';
    document.getElementById('yearlyEconomies').textContent = yearlyEconomies.toFixed(2) + ' €';
    document.getElementById('maintenanceCost').textContent = maintenanceCost + ' €/an';
}

// Écouteurs d'événements pour les champs de configuration
document.getElementById('surfaceInput').addEventListener('input', updateAnalysisValues);
document.getElementById('sprinklersInput').addEventListener('input', updateAnalysisValues);
document.getElementById('sensorsInput').addEventListener('input', updateAnalysisValues);
document.getElementById('pumpInput').addEventListener('input', updateAnalysisValues); 