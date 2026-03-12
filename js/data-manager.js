/* ============================================
   Data Manager - Handles all data operations
   ============================================ */

const DataManager = {
    STORAGE_KEY: 'familyTreeData',
    VERSION: '1.0',

    // Data structure
    data: {
        version: '1.0',
        meta: {
            createdAt: null,
            updatedAt: null,
            treeName: 'Family Tree'
        },
        persons: {},
        relationships: [],
        rootPersonId: null
    },

    // Generate unique ID
    generateId() {
        return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Initialize data
    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                return true;
            } catch (e) {
                console.error('Failed to parse saved data:', e);
                return false;
            }
        }
        return false;
    },

    // Save to localStorage
    save() {
        this.data.meta.updatedAt = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    },

    // Create new tree with root person
    createNewTree(personData) {
        this.data = {
            version: this.VERSION,
            meta: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                treeName: 'Family Tree'
            },
            persons: {},
            relationships: [],
            rootPersonId: null
        };

        const id = this.addPerson(personData);
        this.data.rootPersonId = id;
        this.save();
        return id;
    },

    // Add a person
    addPerson(personData) {
        const id = this.generateId();
        this.data.persons[id] = {
            id: id,
            firstName: personData.firstName || '',
            lastName: personData.lastName || '',
            middleName: personData.middleName || '',
            gender: personData.gender || 'male',
            birthDate: personData.birthDate || null,
            birthPlace: personData.birthPlace || '',
            deathDate: personData.deathDate || null,
            deathPlace: personData.deathPlace || '',
            biography: personData.biography || '',
            photo: personData.photo || null,
            createdAt: new Date().toISOString()
        };
        this.save();
        return id;
    },

    // Update a person
    updatePerson(id, personData) {
        if (!this.data.persons[id]) return false;
        Object.assign(this.data.persons[id], personData);
        this.save();
        return true;
    },

    // Delete a person and their relationships
    deletePerson(id) {
        if (!this.data.persons[id]) return false;

        // Remove all relationships involving this person
        this.data.relationships = this.data.relationships.filter(
            r => r.person1 !== id && r.person2 !== id
        );

        // Delete the person
        delete this.data.persons[id];

        // If root person was deleted, pick a new one
        if (this.data.rootPersonId === id) {
            const remainingIds = Object.keys(this.data.persons);
            this.data.rootPersonId = remainingIds.length > 0 ? remainingIds[0] : null;
        }

        this.save();
        return true;
    },

    // Get a person by ID
    getPerson(id) {
        return this.data.persons[id] || null;
    },

    // Get all persons
    getAllPersons() {
        return this.data.persons;
    },

    // Get person count
    getPersonCount() {
        return Object.keys(this.data.persons).length;
    },

    // Get display name for a person
    getDisplayName(id) {
        const person = this.data.persons[id];
        if (!person) return (typeof I18n !== 'undefined') ? I18n.t('data.unknown') : 'Unknown';
        const parts = [person.firstName, person.lastName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : ((typeof I18n !== 'undefined') ? I18n.t('data.noName') : 'No name');
    },

    // Get full name for a person
    getFullName(id) {
        const person = this.data.persons[id];
        if (!person) return (typeof I18n !== 'undefined') ? I18n.t('data.unknown') : 'Unknown';
        const parts = [person.lastName, person.firstName, person.middleName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : ((typeof I18n !== 'undefined') ? I18n.t('data.noName') : 'No name');
    },

    // Add relationship
    // Types: 'parent-child', 'spouse'
    addRelationship(person1Id, person2Id, type) {
        // Check for duplicates
        const exists = this.data.relationships.some(
            r => ((r.person1 === person1Id && r.person2 === person2Id) ||
                  (r.person1 === person2Id && r.person2 === person1Id)) &&
                 r.type === type
        );
        if (exists) return false;

        this.data.relationships.push({
            person1: person1Id,
            person2: person2Id,
            type: type
        });
        this.save();
        return true;
    },

    // Remove relationship
    removeRelationship(person1Id, person2Id, type) {
        this.data.relationships = this.data.relationships.filter(
            r => !(((r.person1 === person1Id && r.person2 === person2Id) ||
                    (r.person1 === person2Id && r.person2 === person1Id)) &&
                   r.type === type)
        );
        this.save();
    },

    // Get parents of a person
    getParents(personId) {
        const parentRels = this.data.relationships.filter(
            r => r.type === 'parent-child' && r.person2 === personId
        );
        return parentRels.map(r => r.person1);
    },

    // Get children of a person
    getChildren(personId) {
        const childRels = this.data.relationships.filter(
            r => r.type === 'parent-child' && r.person1 === personId
        );
        return childRels.map(r => r.person2);
    },

    // Get spouse(s) of a person
    getSpouses(personId) {
        const spouseRels = this.data.relationships.filter(
            r => r.type === 'spouse' && (r.person1 === personId || r.person2 === personId)
        );
        return spouseRels.map(r => r.person1 === personId ? r.person2 : r.person1);
    },

    // Get siblings of a person
    getSiblings(personId) {
        const parents = this.getParents(personId);
        const siblings = new Set();
        parents.forEach(parentId => {
            this.getChildren(parentId).forEach(childId => {
                if (childId !== personId) {
                    siblings.add(childId);
                }
            });
        });
        return Array.from(siblings);
    },

    // Get all relatives of a person with their relationship type
    getRelatives(personId) {
        const relatives = [];

        // Parents
        this.getParents(personId).forEach(id => {
            const person = this.getPerson(id);
            if (person) {
                relatives.push({
                    id: id,
                    relation: (typeof I18n !== 'undefined') ? I18n.t(person.gender === 'female' ? 'relation.mother' : 'relation.father') : (person.gender === 'female' ? 'Mother' : 'Father'),
                    type: 'parent'
                });
            }
        });

        // Spouses
        this.getSpouses(personId).forEach(id => {
            const person = this.getPerson(id);
            if (person) {
                relatives.push({
                    id: id,
                    relation: (typeof I18n !== 'undefined') ? I18n.t(person.gender === 'female' ? 'relation.wife' : 'relation.husband') : (person.gender === 'female' ? 'Wife' : 'Husband'),
                    type: 'spouse'
                });
            }
        });

        // Children
        this.getChildren(personId).forEach(id => {
            const person = this.getPerson(id);
            if (person) {
                relatives.push({
                    id: id,
                    relation: (typeof I18n !== 'undefined') ? I18n.t(person.gender === 'female' ? 'relation.daughter' : 'relation.son') : (person.gender === 'female' ? 'Daughter' : 'Son'),
                    type: 'child'
                });
            }
        });

        // Siblings
        this.getSiblings(personId).forEach(id => {
            const person = this.getPerson(id);
            if (person) {
                relatives.push({
                    id: id,
                    relation: (typeof I18n !== 'undefined') ? I18n.t(person.gender === 'female' ? 'relation.sister' : 'relation.brother') : (person.gender === 'female' ? 'Sister' : 'Brother'),
                    type: 'sibling'
                });
            }
        });

        return relatives;
    },

    // Check if a person has a father
    hasFather(personId) {
        const parents = this.getParents(personId);
        return parents.some(id => {
            const p = this.getPerson(id);
            return p && p.gender === 'male';
        });
    },

    // Check if a person has a mother
    hasMother(personId) {
        const parents = this.getParents(personId);
        return parents.some(id => {
            const p = this.getPerson(id);
            return p && p.gender === 'female';
        });
    },

    // Export data as JSON
    exportData() {
        const exportData = JSON.parse(JSON.stringify(this.data));
        exportData.exportedAt = new Date().toISOString();
        return JSON.stringify(exportData, null, 2);
    },

    // Import data from JSON
    importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!imported.persons || !imported.relationships) {
                throw new Error('Invalid data format');
            }
            this.data = imported;
            this.save();
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    },

    // Clear all data
    clearData() {
        this.data = {
            version: this.VERSION,
            meta: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                treeName: 'Family Tree'
            },
            persons: {},
            relationships: [],
            rootPersonId: null
        };
        localStorage.removeItem(this.STORAGE_KEY);
    },

    // Get root person ID
    getRootPersonId() {
        return this.data.rootPersonId;
    },

    // Set root person
    setRootPerson(id) {
        this.data.rootPersonId = id;
        this.save();
    }
};
