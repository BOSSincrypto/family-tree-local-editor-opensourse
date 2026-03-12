/* ============================================
   App - Main application controller
   ============================================ */

const App = {
    selectedPersonId: null,
    pendingRelation: null, // { targetPersonId, relationType }

    init() {
        // Initialize data manager
        const hasData = DataManager.init();

        // Initialize tree renderer
        TreeRenderer.init('treeContainer', 'treeViewport', 'treeNodes', 'treeConnections');
        TreeRenderer.onNodeClick = (personId) => this.onNodeClick(personId);
        TreeRenderer.onAddPerson = (targetId, type) => this.onAddFromTree(targetId, type);

        // Initialize person editor
        PersonEditor.init();
        PersonEditor.onPersonUpdated = (personId) => this.refreshTree();
        PersonEditor.onPersonDeleted = (personId) => this.onPersonDeleted(personId);
        PersonEditor.onRelativeClicked = (personId) => this.onNodeClick(personId);
        PersonEditor.onAddRelative = (personId) => this.showAddRelativeModal(personId);

        // Setup UI event listeners
        this.setupEventListeners();

        // Check if we have data
        if (hasData && DataManager.getPersonCount() > 0) {
            this.hideWelcomeScreen();
            this.refreshTree();
            this.fitToScreenInitial();
        } else {
            this.showWelcomeScreen();
        }

        this.updateStats();
    },

    setupEventListeners() {
        // Welcome screen buttons
        document.getElementById('btnStartNew').addEventListener('click', () => this.startNewTree());
        document.getElementById('btnLoadBackup').addEventListener('click', () => this.triggerImport());

        // Navbar buttons
        document.getElementById('btnImport').addEventListener('click', () => this.triggerImport());
        document.getElementById('btnExport').addEventListener('click', () => this.exportBackup());
        document.getElementById('btnNewTree').addEventListener('click', () => this.confirmNewTree());

        // Tree controls
        document.getElementById('btnZoomIn').addEventListener('click', () => TreeRenderer.zoomIn());
        document.getElementById('btnZoomOut').addEventListener('click', () => TreeRenderer.zoomOut());
        document.getElementById('btnFitScreen').addEventListener('click', () => TreeRenderer.fitToScreen());

        // Save as image
        document.getElementById('btnSaveImage').addEventListener('click', () => this.saveAsImage());

        // File input for import
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileImport(e));

        // Click on tree container to deselect
        document.getElementById('treeContainer').addEventListener('click', (e) => {
            if (e.target.id === 'treeContainer' || e.target.id === 'treeViewport' ||
                e.target.id === 'treeConnections' || e.target.id === 'treeNodes') {
                this.deselectPerson();
            }
        });

        // Add relative modal
        document.getElementById('btnCloseModal').addEventListener('click', () => this.hideAddRelativeModal());
        document.getElementById('addRelativeModal').addEventListener('click', (e) => {
            if (e.target.id === 'addRelativeModal') this.hideAddRelativeModal();
        });

        // Relation option buttons
        document.querySelectorAll('.relation-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const relation = btn.dataset.relation;
                this.hideAddRelativeModal();
                this.addRelativeByType(relation);
            });
        });

        // New person modal
        document.getElementById('btnCloseNewPerson').addEventListener('click', () => this.hideNewPersonModal());
        document.getElementById('btnCancelNewPerson').addEventListener('click', () => this.hideNewPersonModal());
        document.getElementById('newPersonModal').addEventListener('click', (e) => {
            if (e.target.id === 'newPersonModal') this.hideNewPersonModal();
        });

        // New person form
        document.getElementById('newPersonForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitNewPerson();
        });

        // Gender buttons in new person form
        document.getElementById('newGenderMale').addEventListener('click', () => {
            document.getElementById('newGenderMale').classList.add('active');
            document.getElementById('newGenderFemale').classList.remove('active');
        });
        document.getElementById('newGenderFemale').addEventListener('click', () => {
            document.getElementById('newGenderFemale').classList.add('active');
            document.getElementById('newGenderMale').classList.remove('active');
        });

        // Confirm modal
        document.getElementById('btnConfirmNo').addEventListener('click', () => this.hideConfirmModal());
    },

    // ========================================
    // Tree Operations
    // ========================================

    refreshTree() {
        const rootId = DataManager.getRootPersonId();
        if (rootId) {
            TreeRenderer.render(rootId, this.selectedPersonId);
        }
        this.updateStats();
    },

    fitToScreenInitial() {
        setTimeout(() => TreeRenderer.fitToScreen(), 100);
    },

    updateStats() {
        const count = DataManager.getPersonCount();
        document.getElementById('treeStats').textContent = `Людей в древе: ${count}`;
    },

    // ========================================
    // Person Selection
    // ========================================

    onNodeClick(personId) {
        this.selectedPersonId = personId;
        TreeRenderer.selectNode(personId);
        PersonEditor.openSidebar(personId);
        this.refreshTree();
    },

    deselectPerson() {
        this.selectedPersonId = null;
        PersonEditor.closeSidebar();
        this.refreshTree();
    },

    onPersonDeleted(personId) {
        this.selectedPersonId = null;
        if (DataManager.getPersonCount() === 0) {
            this.showWelcomeScreen();
        } else {
            this.refreshTree();
            TreeRenderer.fitToScreen();
        }
    },

    // ========================================
    // New Tree
    // ========================================

    startNewTree() {
        this.hideWelcomeScreen();
        this.showNewPersonModalForRoot();
    },

    confirmNewTree() {
        if (DataManager.getPersonCount() > 0) {
            this.showConfirm(
                'Новое древо',
                'Все текущие данные будут удалены. Вы уверены?',
                () => {
                    DataManager.clearData();
                    this.selectedPersonId = null;
                    PersonEditor.closeSidebar();
                    this.showWelcomeScreen();
                    this.refreshTree();
                }
            );
        } else {
            this.startNewTree();
        }
    },

    showNewPersonModalForRoot() {
        this.pendingRelation = { type: 'root' };
        document.getElementById('newPersonTitle').textContent = 'Создать главную персону';
        document.getElementById('newFirstName').value = '';
        document.getElementById('newLastName').value = '';
        document.getElementById('newBirthDate').value = '';
        document.getElementById('newGenderMale').classList.add('active');
        document.getElementById('newGenderFemale').classList.remove('active');
        document.getElementById('newPersonModal').style.display = 'flex';
        document.getElementById('newFirstName').focus();
    },

    // ========================================
    // Add Relative
    // ========================================

    showAddRelativeModal(personId) {
        this.selectedPersonId = personId;
        const person = DataManager.getPerson(personId);
        if (!person) return;

        // Show/hide options based on existing relations
        const options = document.querySelectorAll('.relation-option');
        options.forEach(opt => {
            const relation = opt.dataset.relation;
            let disabled = false;

            if (relation === 'father' && DataManager.hasFather(personId)) {
                disabled = true;
            }
            if (relation === 'mother' && DataManager.hasMother(personId)) {
                disabled = true;
            }

            opt.style.opacity = disabled ? '0.4' : '1';
            opt.style.pointerEvents = disabled ? 'none' : 'auto';
        });

        document.getElementById('addRelativeModal').style.display = 'flex';
    },

    hideAddRelativeModal() {
        document.getElementById('addRelativeModal').style.display = 'none';
    },

    addRelativeByType(relationType) {
        if (!this.selectedPersonId) return;

        let title = 'Новая персона';
        let defaultGender = 'male';

        switch (relationType) {
            case 'father':
                title = 'Добавить отца';
                defaultGender = 'male';
                break;
            case 'mother':
                title = 'Добавить мать';
                defaultGender = 'female';
                break;
            case 'spouse':
                const person = DataManager.getPerson(this.selectedPersonId);
                title = 'Добавить супруга(у)';
                defaultGender = person && person.gender === 'male' ? 'female' : 'male';
                break;
            case 'son':
                title = 'Добавить сына';
                defaultGender = 'male';
                break;
            case 'daughter':
                title = 'Добавить дочь';
                defaultGender = 'female';
                break;
            case 'brother':
                title = 'Добавить брата';
                defaultGender = 'male';
                break;
            case 'sister':
                title = 'Добавить сестру';
                defaultGender = 'female';
                break;
        }

        this.pendingRelation = {
            targetPersonId: this.selectedPersonId,
            relationType: relationType
        };

        document.getElementById('newPersonTitle').textContent = title;
        document.getElementById('newFirstName').value = '';
        document.getElementById('newLastName').value = '';
        document.getElementById('newBirthDate').value = '';

        if (defaultGender === 'male') {
            document.getElementById('newGenderMale').classList.add('active');
            document.getElementById('newGenderFemale').classList.remove('active');
        } else {
            document.getElementById('newGenderFemale').classList.add('active');
            document.getElementById('newGenderMale').classList.remove('active');
        }

        document.getElementById('newPersonModal').style.display = 'flex';
        document.getElementById('newFirstName').focus();
    },

    onAddFromTree(targetPersonId, type) {
        this.selectedPersonId = targetPersonId;
        this.addRelativeByType(type);
    },

    submitNewPerson() {
        const firstName = document.getElementById('newFirstName').value.trim();
        if (!firstName) {
            this.showToast('Введите имя', 'error');
            return;
        }

        const gender = document.getElementById('newGenderFemale').classList.contains('active') ? 'female' : 'male';

        const personData = {
            firstName: firstName,
            lastName: document.getElementById('newLastName').value.trim(),
            gender: gender,
            birthDate: document.getElementById('newBirthDate').value || null
        };

        if (this.pendingRelation && this.pendingRelation.type === 'root') {
            // Creating root person
            const rootId = DataManager.createNewTree(personData);
            this.hideNewPersonModal();
            this.hideWelcomeScreen();
            this.selectedPersonId = rootId;
            this.refreshTree();
            this.fitToScreenInitial();
            this.showToast('Древо создано');
            return;
        }

        if (!this.pendingRelation || !this.pendingRelation.targetPersonId) return;

        const newPersonId = DataManager.addPerson(personData);
        const targetId = this.pendingRelation.targetPersonId;
        const relType = this.pendingRelation.relationType;

        // Create relationship based on type
        switch (relType) {
            case 'father':
            case 'mother':
                // New person is parent of target
                DataManager.addRelationship(newPersonId, targetId, 'parent-child');
                break;
            case 'spouse':
                DataManager.addRelationship(targetId, newPersonId, 'spouse');
                break;
            case 'son':
            case 'daughter':
                // Target is parent of new person
                DataManager.addRelationship(targetId, newPersonId, 'parent-child');
                // Also add other parent if target has a spouse
                const spouses = DataManager.getSpouses(targetId);
                if (spouses.length > 0) {
                    DataManager.addRelationship(spouses[0], newPersonId, 'parent-child');
                }
                break;
            case 'brother':
            case 'sister':
                // Share parents with target
                const parents = DataManager.getParents(targetId);
                parents.forEach(parentId => {
                    DataManager.addRelationship(parentId, newPersonId, 'parent-child');
                });
                break;
        }

        this.hideNewPersonModal();
        this.pendingRelation = null;
        this.refreshTree();
        TreeRenderer.fitToScreen();

        // Open the new person in sidebar
        this.onNodeClick(newPersonId);
        this.showToast('Родственник добавлен');
    },

    hideNewPersonModal() {
        document.getElementById('newPersonModal').style.display = 'none';
    },

    // ========================================
    // Import / Export
    // ========================================

    triggerImport() {
        document.getElementById('fileInput').click();
    },

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = DataManager.importData(e.target.result);
            if (success) {
                this.hideWelcomeScreen();
                this.selectedPersonId = null;
                PersonEditor.closeSidebar();
                this.refreshTree();
                this.fitToScreenInitial();
                this.showToast('Бекап загружен успешно', 'success');
            } else {
                this.showToast('Ошибка: неверный формат файла', 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    },

    exportBackup() {
        if (DataManager.getPersonCount() === 0) {
            this.showToast('Нет данных для сохранения', 'error');
            return;
        }

        const data = DataManager.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const date = new Date().toISOString().split('T')[0];
        link.download = `family-tree-backup-${date}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Бекап сохранён', 'success');
    },

    // ========================================
    // Save as Image
    // ========================================

    saveAsImage() {
        if (DataManager.getPersonCount() === 0) {
            this.showToast('Нет данных для сохранения', 'error');
            return;
        }

        // Use a simple approach - capture the viewport area
        const viewport = document.getElementById('treeViewport');
        const nodes = viewport.querySelectorAll('.tree-node, .add-node');
        const connections = document.getElementById('treeConnections');

        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            const x = parseInt(node.style.left);
            const y = parseInt(node.style.top);
            const w = node.offsetWidth;
            const h = node.offsetHeight;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h + 20);
        });

        const padding = 40;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width * 2;
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        // White background
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, width, height);

        // Draw connections
        const svgData = new XMLSerializer().serializeToString(connections);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, -minX + padding, -minY + padding);
            URL.revokeObjectURL(svgUrl);

            // Draw nodes as simple circles with names
            nodes.forEach(node => {
                if (node.classList.contains('add-node')) return;
                const x = parseInt(node.style.left) - minX + padding;
                const y = parseInt(node.style.top) - minY + padding;
                const personId = node.dataset.personId;
                const person = DataManager.getPerson(personId);
                if (!person) return;

                const circleR = 40;
                const centerX = x + 50;
                const centerY = y + 40;

                // Draw circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, circleR, 0, Math.PI * 2);
                ctx.fillStyle = person.gender === 'female' ? '#FDF2F8' : '#EBF0FF';
                ctx.fill();
                ctx.strokeStyle = person.gender === 'female' ? '#EC4899' : '#4A7DFF';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw name
                ctx.fillStyle = '#1E293B';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                const displayName = DataManager.getDisplayName(personId);
                ctx.fillText(displayName, centerX, centerY + circleR + 18);
            });

            // Download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `family-tree-${new Date().toISOString().split('T')[0]}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                this.showToast('Изображение сохранено', 'success');
            });
        };
        img.onerror = () => {
            // Fallback: just draw nodes without SVG connections
            nodes.forEach(node => {
                if (node.classList.contains('add-node')) return;
                const x = parseInt(node.style.left) - minX + padding;
                const y = parseInt(node.style.top) - minY + padding;
                const personId = node.dataset.personId;
                const person = DataManager.getPerson(personId);
                if (!person) return;

                const circleR = 40;
                const centerX = x + 50;
                const centerY = y + 40;

                ctx.beginPath();
                ctx.arc(centerX, centerY, circleR, 0, Math.PI * 2);
                ctx.fillStyle = person.gender === 'female' ? '#FDF2F8' : '#EBF0FF';
                ctx.fill();
                ctx.strokeStyle = person.gender === 'female' ? '#EC4899' : '#4A7DFF';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#1E293B';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(DataManager.getDisplayName(personId), centerX, centerY + circleR + 18);
            });

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `family-tree-${new Date().toISOString().split('T')[0]}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                this.showToast('Изображение сохранено', 'success');
            });
        };
        img.src = svgUrl;
    },

    // ========================================
    // UI Helpers
    // ========================================

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('treeControls').style.display = 'none';
        document.getElementById('btnSaveImage').style.display = 'none';
    },

    hideWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('treeControls').style.display = 'flex';
        document.getElementById('btnSaveImage').style.display = 'inline-flex';
    },

    showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show' + (type ? ' ' + type : '');
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    },

    showConfirm(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'flex';

        const yesBtn = document.getElementById('btnConfirmYes');
        const noBtn = document.getElementById('btnConfirmNo');

        // Remove old listeners
        const newYes = yesBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYes, yesBtn);
        const newNo = noBtn.cloneNode(true);
        noBtn.parentNode.replaceChild(newNo, noBtn);

        newYes.addEventListener('click', () => {
            this.hideConfirmModal();
            onConfirm();
        });
        newNo.addEventListener('click', () => {
            this.hideConfirmModal();
        });
    },

    hideConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
