/* ============================================
   Person Editor - Handles sidebar and editing
   ============================================ */

const PersonEditor = {
    sidebar: null,
    sidebarView: null,
    sidebarEdit: null,
    currentPersonId: null,
    isEditing: false,

    // Callbacks
    onPersonUpdated: null,
    onPersonDeleted: null,
    onRelativeClicked: null,
    onAddRelative: null,

    init() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarView = document.getElementById('sidebarView');
        this.sidebarEdit = document.getElementById('sidebarEdit');

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Close sidebar
        document.getElementById('btnCloseSidebar').addEventListener('click', () => {
            this.closeSidebar();
        });

        // Edit person
        document.getElementById('btnEditPerson').addEventListener('click', () => {
            this.switchToEditMode();
        });

        // Cancel edit
        document.getElementById('btnCancelEdit').addEventListener('click', () => {
            this.switchToViewMode();
        });

        // Save person form
        document.getElementById('personForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePerson();
        });

        // Gender buttons in edit form
        document.getElementById('genderMale').addEventListener('click', () => {
            this.setGender('male', 'genderMale', 'genderFemale');
        });
        document.getElementById('genderFemale').addEventListener('click', () => {
            this.setGender('female', 'genderFemale', 'genderMale');
        });

        // Delete person
        document.getElementById('btnDeletePerson').addEventListener('click', () => {
            this.requestDeletePerson();
        });

        // Add relative button
        document.getElementById('btnAddRelative').addEventListener('click', () => {
            if (this.onAddRelative && this.currentPersonId) {
                this.onAddRelative(this.currentPersonId);
            }
        });
    },

    setGender(gender, activeId, inactiveId) {
        document.getElementById(activeId).classList.add('active');
        document.getElementById(inactiveId).classList.remove('active');
    },

    openSidebar(personId) {
        this.currentPersonId = personId;
        this.isEditing = false;
        this.sidebarView.style.display = 'block';
        this.sidebarEdit.style.display = 'none';
        this.populateView(personId);
        this.sidebar.classList.add('open');
    },

    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.currentPersonId = null;
        this.isEditing = false;
    },

    switchToEditMode() {
        if (!this.currentPersonId) return;
        this.isEditing = true;
        this.sidebarView.style.display = 'none';
        this.sidebarEdit.style.display = 'block';
        this.populateEditForm(this.currentPersonId);
    },

    switchToViewMode() {
        this.isEditing = false;
        this.sidebarView.style.display = 'block';
        this.sidebarEdit.style.display = 'none';
        if (this.currentPersonId) {
            this.populateView(this.currentPersonId);
        }
    },

    populateView(personId) {
        const person = DataManager.getPerson(personId);
        if (!person) return;

        // Avatar
        const avatarEl = document.getElementById('personAvatar');
        avatarEl.className = 'person-avatar-large ' + (person.gender || 'male');
        if (person.photo) {
            avatarEl.innerHTML = `<img src="${person.photo}" alt="${person.firstName}" onerror="this.style.display='none';">`;
        } else {
            avatarEl.innerHTML = `<svg class="avatar-placeholder" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>`;
        }

        // Name
        document.getElementById('personName').textContent = DataManager.getFullName(personId);

        // Dates
        const dates = this.formatDates(person);
        document.getElementById('personDates').textContent = dates;

        // Relatives
        this.populateRelatives(personId);

        // Events
        this.populateEvents(person);

        // Biography
        document.getElementById('biographyText').textContent = person.biography || I18n.t('sidebar.noBio');
    },

    formatDates(person) {
        const parts = [];
        if (person.birthDate) {
            parts.push(this.formatDate(person.birthDate));
        }
        if (person.deathDate) {
            parts.push(this.formatDate(person.deathDate));
        }
        if (parts.length === 2) {
            return parts.join(' — ');
        } else if (parts.length === 1) {
            return person.birthDate ? I18n.t('date.born', parts[0]) : I18n.t('date.died', parts[0]);
        }
        return '';
    },

    formatDate(dateStr) {
        if (!dateStr) return I18n.t('event.unknown');
        try {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString(I18n.getDateLocale(), {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    },

    populateRelatives(personId) {
        const container = document.getElementById('relativesList');
        const relatives = DataManager.getRelatives(personId);

        if (relatives.length === 0) {
            container.innerHTML = `<p style="font-size: 13px; color: var(--text-muted);">${I18n.t('sidebar.noRelatives')}</p>`;
            return;
        }

        container.innerHTML = '';
        relatives.forEach(rel => {
            const person = DataManager.getPerson(rel.id);
            if (!person) return;

            const item = document.createElement('div');
            item.className = 'relative-item';
            item.dataset.personId = rel.id;

            const genderClass = person.gender === 'female' ? 'female' : 'male';
            const avatarContent = person.photo
                ? `<img src="${person.photo}" alt="${person.firstName}" onerror="this.style.display='none';">`
                : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                   </svg>`;

            item.innerHTML = `
                <div class="relative-avatar ${genderClass}">${avatarContent}</div>
                <div class="relative-info">
                    <div class="relative-relation">${rel.relation}</div>
                    <div class="relative-name">${DataManager.getDisplayName(rel.id)}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                if (this.onRelativeClicked) {
                    this.onRelativeClicked(rel.id);
                }
            });

            container.appendChild(item);
        });
    },

    populateEvents(person) {
        const container = document.getElementById('eventsList');
        container.innerHTML = '';

        const events = [
            { label: I18n.t('event.birth'), value: person.birthDate ? this.formatDate(person.birthDate) + (person.birthPlace ? ', ' + person.birthPlace : '') : I18n.t('event.unknown') },
            { label: I18n.t('event.death'), value: person.deathDate ? this.formatDate(person.deathDate) + (person.deathPlace ? ', ' + person.deathPlace : '') : I18n.t('event.unknown') }
        ];

        // Add marriage events
        const spouses = DataManager.getSpouses(person.id);
        spouses.forEach(spouseId => {
            events.push({
                label: I18n.t('event.marriage'),
                value: DataManager.getDisplayName(spouseId)
            });
        });

        // Add child birth events
        const children = DataManager.getChildren(person.id);
        children.forEach(childId => {
            const child = DataManager.getPerson(childId);
            if (child) {
                events.push({
                    label: I18n.t('event.childBirth'),
                    value: DataManager.getDisplayName(childId) + (child.birthDate ? ', ' + this.formatDate(child.birthDate) : '')
                });
            }
        });

        events.forEach(event => {
            const item = document.createElement('div');
            item.className = 'event-item';
            item.innerHTML = `
                <span class="event-label">${event.label}</span>
                <span class="event-value">${event.value}</span>
            `;
            container.appendChild(item);
        });
    },

    populateEditForm(personId) {
        const person = DataManager.getPerson(personId);
        if (!person) return;

        document.getElementById('editTitle').textContent = I18n.t('edit.title');
        document.getElementById('editFirstName').value = person.firstName || '';
        document.getElementById('editLastName').value = person.lastName || '';
        document.getElementById('editMiddleName').value = person.middleName || '';
        document.getElementById('editBirthDate').value = person.birthDate || '';
        document.getElementById('editBirthPlace').value = person.birthPlace || '';
        document.getElementById('editDeathDate').value = person.deathDate || '';
        document.getElementById('editDeathPlace').value = person.deathPlace || '';
        document.getElementById('editBiography').value = person.biography || '';
        document.getElementById('editPhoto').value = person.photo || '';

        // Set gender
        document.getElementById('genderMale').classList.toggle('active', person.gender === 'male');
        document.getElementById('genderFemale').classList.toggle('active', person.gender === 'female');
    },

    savePerson() {
        if (!this.currentPersonId) return;

        const gender = document.getElementById('genderFemale').classList.contains('active') ? 'female' : 'male';

        const personData = {
            firstName: document.getElementById('editFirstName').value.trim(),
            lastName: document.getElementById('editLastName').value.trim(),
            middleName: document.getElementById('editMiddleName').value.trim(),
            gender: gender,
            birthDate: document.getElementById('editBirthDate').value || null,
            birthPlace: document.getElementById('editBirthPlace').value.trim(),
            deathDate: document.getElementById('editDeathDate').value || null,
            deathPlace: document.getElementById('editDeathPlace').value.trim(),
            biography: document.getElementById('editBiography').value.trim(),
            photo: document.getElementById('editPhoto').value.trim() || null
        };

        if (!personData.firstName) {
            App.showToast(I18n.t('toast.nameRequired'), 'error');
            return;
        }

        DataManager.updatePerson(this.currentPersonId, personData);
        this.switchToViewMode();

        if (this.onPersonUpdated) {
            this.onPersonUpdated(this.currentPersonId);
        }

        App.showToast(I18n.t('toast.dataSaved'));
    },

    requestDeletePerson() {
        if (!this.currentPersonId) return;
        const name = DataManager.getDisplayName(this.currentPersonId);
        App.showConfirm(
            I18n.t('confirm.deletePerson.title'),
            I18n.t('confirm.deletePerson.message', name),
            () => {
                const deletedId = this.currentPersonId;
                this.closeSidebar();
                DataManager.deletePerson(deletedId);
                if (this.onPersonDeleted) {
                    this.onPersonDeleted(deletedId);
                }
                App.showToast(I18n.t('toast.personDeleted'));
            }
        );
    }
};
