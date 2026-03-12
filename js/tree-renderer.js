/* ============================================
   Tree Renderer - Handles tree layout and rendering
   ============================================ */

const TreeRenderer = {
    container: null,
    viewport: null,
    nodesContainer: null,
    connectionsContainer: null,

    // Pan & Zoom state
    scale: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0,

    // Layout constants
    NODE_WIDTH: 100,
    NODE_HEIGHT: 120,
    HORIZONTAL_GAP: 40,
    VERTICAL_GAP: 80,
    SPOUSE_GAP: 30,
    ADD_NODE_SIZE: 70,

    // Callbacks
    onNodeClick: null,
    onAddPerson: null,

    // Calculated positions
    positions: {},

    init(containerId, viewportId, nodesId, connectionsId) {
        this.container = document.getElementById(containerId);
        this.viewport = document.getElementById(viewportId);
        this.nodesContainer = document.getElementById(nodesId);
        this.connectionsContainer = document.getElementById(connectionsId);

        this.setupPanZoom();
    },

    setupPanZoom() {
        const container = this.container;

        // Mouse wheel zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(0.2, Math.min(3, this.scale + delta));

            // Zoom toward mouse position
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const scaleChange = newScale / this.scale;
            this.panX = mouseX - (mouseX - this.panX) * scaleChange;
            this.panY = mouseY - (mouseY - this.panY) * scaleChange;

            this.scale = newScale;
            this.applyTransform();
        }, { passive: false });

        // Pan with mouse drag
        container.addEventListener('mousedown', (e) => {
            if (e.target === container || e.target === this.viewport ||
                e.target === this.connectionsContainer || e.target === this.nodesContainer) {
                this.isPanning = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                container.classList.add('grabbing');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.panX += dx;
                this.panY += dy;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.applyTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isPanning = false;
            container.classList.remove('grabbing');
        });

        // Touch support
        let touchStartX = 0;
        let touchStartY = 0;
        let initialDistance = 0;
        let initialScale = 1;

        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                this.isPanning = true;
                this.lastMouseX = touchStartX;
                this.lastMouseY = touchStartY;
            } else if (e.touches.length === 2) {
                this.isPanning = false;
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScale = this.scale;
            }
        }, { passive: false });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isPanning) {
                const dx = e.touches[0].clientX - this.lastMouseX;
                const dy = e.touches[0].clientY - this.lastMouseY;
                this.panX += dx;
                this.panY += dy;
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
                this.applyTransform();
            } else if (e.touches.length === 2) {
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                this.scale = Math.max(0.2, Math.min(3, initialScale * (currentDistance / initialDistance)));
                this.applyTransform();
            }
        }, { passive: false });

        container.addEventListener('touchend', () => {
            this.isPanning = false;
        });
    },

    applyTransform() {
        this.viewport.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    },

    zoomIn() {
        this.scale = Math.min(3, this.scale + 0.2);
        this.applyTransform();
    },

    zoomOut() {
        this.scale = Math.max(0.2, this.scale - 0.2);
        this.applyTransform();
    },

    fitToScreen() {
        const positions = Object.values(this.positions);
        if (positions.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        positions.forEach(pos => {
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + this.NODE_WIDTH);
            maxY = Math.max(maxY, pos.y + this.NODE_HEIGHT);
        });

        const treeWidth = maxX - minX + 100;
        const treeHeight = maxY - minY + 100;
        const containerRect = this.container.getBoundingClientRect();

        const scaleX = containerRect.width / treeWidth;
        const scaleY = containerRect.height / treeHeight;
        this.scale = Math.min(scaleX, scaleY, 1.5);

        this.panX = (containerRect.width - treeWidth * this.scale) / 2 - minX * this.scale + 50 * this.scale;
        this.panY = (containerRect.height - treeHeight * this.scale) / 2 - minY * this.scale + 50 * this.scale;

        this.applyTransform();
    },

    // Calculate tree layout positions
    calculateLayout(rootId) {
        this.positions = {};
        if (!rootId || !DataManager.getPerson(rootId)) return;

        // Build a tree structure starting from root
        const visited = new Set();
        const levels = {};

        // Find the topmost ancestor
        let topAncestor = rootId;
        const findTopAncestor = (personId, visited) => {
            visited.add(personId);
            const parents = DataManager.getParents(personId);
            for (const parentId of parents) {
                if (!visited.has(parentId)) {
                    topAncestor = parentId;
                    findTopAncestor(parentId, visited);
                    return;
                }
            }
        };
        findTopAncestor(rootId, new Set());

        // BFS to assign levels
        const queue = [{ id: topAncestor, level: 0 }];
        visited.add(topAncestor);
        const personLevels = {};
        personLevels[topAncestor] = 0;

        // Also include spouses at the same level
        const processSpouses = (personId, level) => {
            const spouses = DataManager.getSpouses(personId);
            spouses.forEach(spouseId => {
                if (!visited.has(spouseId)) {
                    visited.add(spouseId);
                    personLevels[spouseId] = level;
                    queue.push({ id: spouseId, level: level });
                }
            });
        };

        while (queue.length > 0) {
            const { id, level } = queue.shift();

            // Process spouses
            processSpouses(id, level);

            // Process parents (go up)
            const parents = DataManager.getParents(id);
            parents.forEach(parentId => {
                if (!visited.has(parentId)) {
                    visited.add(parentId);
                    personLevels[parentId] = level - 1;
                    queue.push({ id: parentId, level: level - 1 });
                }
            });

            // Process children (go down)
            const children = DataManager.getChildren(id);
            children.forEach(childId => {
                if (!visited.has(childId)) {
                    visited.add(childId);
                    personLevels[childId] = level + 1;
                    queue.push({ id: childId, level: level + 1 });
                }
            });
        }

        // Normalize levels to start from 0
        const minLevel = Math.min(...Object.values(personLevels));
        Object.keys(personLevels).forEach(id => {
            personLevels[id] -= minLevel;
        });

        // Group by level
        Object.keys(personLevels).forEach(id => {
            const level = personLevels[id];
            if (!levels[level]) levels[level] = [];
            levels[level].push(id);
        });

        // Sort persons within each level to keep couples together
        Object.keys(levels).forEach(level => {
            const levelPersons = levels[level];
            const sorted = [];
            const placed = new Set();

            levelPersons.forEach(id => {
                if (placed.has(id)) return;
                sorted.push(id);
                placed.add(id);

                // Place spouses next to each other
                const spouses = DataManager.getSpouses(id);
                spouses.forEach(spouseId => {
                    if (levelPersons.includes(spouseId) && !placed.has(spouseId)) {
                        sorted.push(spouseId);
                        placed.add(spouseId);
                    }
                });
            });

            levels[level] = sorted;
        });

        // Calculate X positions
        const startX = 500;
        const startY = 100;
        const levelKeys = Object.keys(levels).sort((a, b) => Number(a) - Number(b));

        levelKeys.forEach(level => {
            const persons = levels[level];
            const totalWidth = persons.length * this.NODE_WIDTH +
                (persons.length - 1) * this.HORIZONTAL_GAP;

            // Check for spouse pairs and reduce gap
            let currentX = startX - totalWidth / 2;

            persons.forEach((id, index) => {
                const y = startY + Number(level) * (this.NODE_HEIGHT + this.VERTICAL_GAP);

                this.positions[id] = {
                    x: currentX,
                    y: y,
                    level: Number(level)
                };

                // Check if next person is spouse
                const nextId = persons[index + 1];
                if (nextId && this.areSpouses(id, nextId)) {
                    currentX += this.NODE_WIDTH + this.SPOUSE_GAP;
                } else {
                    currentX += this.NODE_WIDTH + this.HORIZONTAL_GAP;
                }
            });
        });

        // Center children under their parents
        this.centerChildren(levels, levelKeys);
    },

    areSpouses(id1, id2) {
        const spouses = DataManager.getSpouses(id1);
        return spouses.includes(id2);
    },

    centerChildren(levels, levelKeys) {
        // For each level (except the first), try to center children under their parents
        for (let i = 1; i < levelKeys.length; i++) {
            const level = levelKeys[i];
            const persons = levels[level];

            // Group children by their parent pair
            const parentGroups = {};
            persons.forEach(childId => {
                const parents = DataManager.getParents(childId);
                const key = parents.sort().join('-') || 'orphan';
                if (!parentGroups[key]) parentGroups[key] = { parents: parents, children: [] };
                parentGroups[key].children.push(childId);
            });

            Object.values(parentGroups).forEach(group => {
                if (group.parents.length === 0) return;

                // Find center X of parents
                let parentCenterX = 0;
                let parentCount = 0;
                group.parents.forEach(pid => {
                    if (this.positions[pid]) {
                        parentCenterX += this.positions[pid].x + this.NODE_WIDTH / 2;
                        parentCount++;
                    }
                });
                if (parentCount === 0) return;
                parentCenterX /= parentCount;

                // Calculate total width of children
                const totalChildWidth = group.children.length * this.NODE_WIDTH +
                    (group.children.length - 1) * this.HORIZONTAL_GAP;

                // Center children under parent center
                let childStartX = parentCenterX - totalChildWidth / 2;
                group.children.forEach((childId, index) => {
                    if (this.positions[childId]) {
                        this.positions[childId].x = childStartX;

                        // Check if next child is a spouse pair
                        const nextChild = group.children[index + 1];
                        if (nextChild && this.areSpouses(childId, nextChild)) {
                            childStartX += this.NODE_WIDTH + this.SPOUSE_GAP;
                        } else {
                            childStartX += this.NODE_WIDTH + this.HORIZONTAL_GAP;
                        }
                    }
                });
            });
        }
    },

    // Render the tree
    render(rootId, selectedPersonId) {
        this.calculateLayout(rootId);
        this.renderNodes(rootId, selectedPersonId);
        this.renderConnections();
    },

    renderNodes(rootId, selectedPersonId) {
        this.nodesContainer.innerHTML = '';

        Object.keys(this.positions).forEach(personId => {
            const person = DataManager.getPerson(personId);
            if (!person) return;

            const pos = this.positions[personId];
            const node = this.createPersonNode(person, pos, personId === rootId, personId === selectedPersonId);
            this.nodesContainer.appendChild(node);
        });

        // Add "+" nodes for adding parents
        if (selectedPersonId && this.positions[selectedPersonId]) {
            const selectedPerson = DataManager.getPerson(selectedPersonId);
            if (selectedPerson) {
                this.renderAddNodes(selectedPersonId);
            }
        }
    },

    createPersonNode(person, pos, isRoot, isSelected) {
        const node = document.createElement('div');
        node.className = 'tree-node' + (isSelected ? ' selected' : '');
        node.style.left = pos.x + 'px';
        node.style.top = pos.y + 'px';
        node.style.width = this.NODE_WIDTH + 'px';
        node.dataset.personId = person.id;

        const genderClass = person.gender === 'female' ? 'female' : 'male';

        let avatarContent;
        if (person.photo) {
            avatarContent = `<img src="${person.photo}" alt="${person.firstName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <svg class="node-avatar-placeholder" style="display:none;" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>`;
        } else {
            avatarContent = `<svg class="node-avatar-placeholder" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>`;
        }

        // Build badges
        let badges = '';
        if (isRoot) {
            badges += `<span class="node-badge badge-self">${I18n.t('node.self')}</span>`;
        }

        const displayName = DataManager.getDisplayName(person.id);

        node.innerHTML = `
            <div class="node-circle ${genderClass}">
                ${avatarContent}
                <div class="node-badges">${badges}</div>
            </div>
            <div class="node-name">${displayName}</div>
        `;

        node.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onNodeClick) {
                this.onNodeClick(person.id);
            }
        });

        return node;
    },

    renderAddNodes(personId) {
        const person = DataManager.getPerson(personId);
        if (!person) return;
        const pos = this.positions[personId];
        if (!pos) return;

        // Add Father button (if no father)
        if (!DataManager.hasFather(personId)) {
            const fatherX = pos.x - this.NODE_WIDTH / 2 - this.SPOUSE_GAP / 2;
            const fatherY = pos.y - this.NODE_HEIGHT - this.VERTICAL_GAP + 20;
            this.createAddNode(fatherX, fatherY, I18n.t('relation.father'), () => {
                if (this.onAddPerson) this.onAddPerson(personId, 'father');
            });
        }

        // Add Mother button (if no mother)
        if (!DataManager.hasMother(personId)) {
            const motherX = pos.x + this.NODE_WIDTH / 2 + this.SPOUSE_GAP / 2;
            const motherY = pos.y - this.NODE_HEIGHT - this.VERTICAL_GAP + 20;
            this.createAddNode(motherX, motherY, I18n.t('relation.mother'), () => {
                if (this.onAddPerson) this.onAddPerson(personId, 'mother');
            });
        }
    },

    createAddNode(x, y, label, onClick) {
        const node = document.createElement('div');
        node.className = 'add-node';
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.style.width = this.ADD_NODE_SIZE + 'px';

        node.innerHTML = `
            <div class="node-circle">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </div>
            <div class="node-label">${label}</div>
        `;

        node.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });

        this.nodesContainer.appendChild(node);
    },

    renderConnections() {
        // Clear existing connections
        while (this.connectionsContainer.firstChild) {
            this.connectionsContainer.removeChild(this.connectionsContainer.firstChild);
        }

        const relationships = DataManager.data.relationships;
        const rendered = new Set();

        relationships.forEach(rel => {
            const key = `${rel.person1}-${rel.person2}-${rel.type}`;
            if (rendered.has(key)) return;
            rendered.add(key);

            const pos1 = this.positions[rel.person1];
            const pos2 = this.positions[rel.person2];
            if (!pos1 || !pos2) return;

            if (rel.type === 'spouse') {
                this.drawSpouseLine(pos1, pos2);
            } else if (rel.type === 'parent-child') {
                this.drawParentChildLine(pos1, pos2, rel.person1, rel.person2);
            }
        });
    },

    drawSpouseLine(pos1, pos2) {
        const x1 = pos1.x + this.NODE_WIDTH / 2;
        const y1 = pos1.y + this.NODE_WIDTH / 2;
        const x2 = pos2.x + this.NODE_WIDTH / 2;
        const y2 = pos2.y + this.NODE_WIDTH / 2;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        this.connectionsContainer.appendChild(line);
    },

    drawParentChildLine(parentPos, childPos, parentId, childId) {
        const parentX = parentPos.x + this.NODE_WIDTH / 2;
        const parentY = parentPos.y + this.NODE_WIDTH; // Bottom of parent circle
        const childX = childPos.x + this.NODE_WIDTH / 2;
        const childY = childPos.y; // Top of child node

        // Check if parent has a spouse - if so, draw line from between the couple
        const spouses = DataManager.getSpouses(parentId);
        let startX = parentX;
        let startY = parentY;

        if (spouses.length > 0) {
            const spousePos = this.positions[spouses[0]];
            if (spousePos) {
                startX = (parentX + spousePos.x + this.NODE_WIDTH / 2) / 2;
                startY = parentY;
            }
        }

        // Draw an L-shaped or stepped line
        const midY = startY + (childY - startY) / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${startX} ${startY} L ${startX} ${midY} L ${childX} ${midY} L ${childX} ${childY}`;
        path.setAttribute('d', d);
        this.connectionsContainer.appendChild(path);
    },

    // Highlight a node
    selectNode(personId) {
        document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('selected'));
        const node = document.querySelector(`.tree-node[data-person-id="${personId}"]`);
        if (node) {
            node.classList.add('selected');
        }
    }
};
