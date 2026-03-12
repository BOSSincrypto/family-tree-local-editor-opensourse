/* ============================================
   I18n - Internationalization system
   ============================================ */

const I18n = {
    STORAGE_KEY: 'familyTreeLang',
    currentLang: 'ru',

    translations: {
        ru: {
            // Navbar
            'app.title': 'Family Tree Editor',
            'nav.import': 'Загрузить',
            'nav.import.title': 'Загрузить бекап',
            'nav.export': 'Сохранить',
            'nav.export.title': 'Сохранить бекап',
            'nav.newTree': 'Новое древо',
            'nav.newTree.title': 'Новое древо',
            'nav.stats': 'Людей в древе: {0}',

            // Welcome screen
            'welcome.title': 'Добро пожаловать в Family Tree Editor',
            'welcome.subtitle': 'Создайте новое семейное древо или загрузите существующий бекап',
            'welcome.newTree': 'Создать новое древо',
            'welcome.loadBackup': 'Загрузить бекап',

            // Tree controls
            'controls.zoomIn': 'Приблизить',
            'controls.zoomOut': 'Отдалить',
            'controls.fitScreen': 'Вписать в экран',
            'controls.saveImage': 'Сохранить как изображение',

            // Sidebar view
            'sidebar.edit': 'Редактировать',
            'sidebar.close': 'Закрыть',
            'sidebar.relatives': 'Родственники',
            'sidebar.addRelative': 'Добавить',
            'sidebar.events': 'События',
            'sidebar.biography': 'Биография',
            'sidebar.noBio': 'Нет информации',
            'sidebar.deletePerson': 'Удалить персону',
            'sidebar.noRelatives': 'Нет добавленных родственников',

            // Sidebar edit
            'edit.title': 'Редактирование',
            'edit.firstName': 'Имя',
            'edit.lastName': 'Фамилия',
            'edit.middleName': 'Отчество',
            'edit.gender': 'Пол',
            'edit.genderMale': 'М',
            'edit.genderFemale': 'Ж',
            'edit.birthDate': 'Дата рождения',
            'edit.birthPlace': 'Место рождения',
            'edit.deathDate': 'Дата смерти',
            'edit.deathPlace': 'Место смерти',
            'edit.biography': 'Биография',
            'edit.photo': 'Фото (URL)',
            'edit.save': 'Сохранить',
            'edit.cancel': 'Отмена',

            // Placeholders
            'placeholder.firstName': 'Введите имя',
            'placeholder.lastName': 'Введите фамилию',
            'placeholder.middleName': 'Введите отчество',
            'placeholder.birthPlace': 'Город, страна',
            'placeholder.deathPlace': 'Город, страна',
            'placeholder.biography': 'Краткая биография...',
            'placeholder.photo': 'https://...',

            // Add relative modal
            'modal.addRelative': 'Добавить родственника',
            'relation.father': 'Отец',
            'relation.mother': 'Мать',
            'relation.spouse': 'Супруг(а)',
            'relation.son': 'Сын',
            'relation.daughter': 'Дочь',
            'relation.brother': 'Брат',
            'relation.sister': 'Сестра',
            'relation.wife': 'Жена',
            'relation.husband': 'Муж',

            // New person modal
            'modal.newPerson': 'Новая персона',
            'modal.createRoot': 'Создать главную персону',
            'modal.addFather': 'Добавить отца',
            'modal.addMother': 'Добавить мать',
            'modal.addSpouse': 'Добавить супруга(у)',
            'modal.addSon': 'Добавить сына',
            'modal.addDaughter': 'Добавить дочь',
            'modal.addBrother': 'Добавить брата',
            'modal.addSister': 'Добавить сестру',
            'modal.firstNameRequired': 'Имя *',
            'modal.add': 'Добавить',
            'modal.cancel': 'Отмена',

            // Confirm modal
            'confirm.title': 'Подтверждение',
            'confirm.yes': 'Да',
            'confirm.no': 'Отмена',
            'confirm.newTree.title': 'Новое древо',
            'confirm.newTree.message': 'Все текущие данные будут удалены. Вы уверены?',
            'confirm.deletePerson.title': 'Удалить персону?',
            'confirm.deletePerson.message': 'Вы уверены, что хотите удалить "{0}" и все связи с этой персоной?',

            // Events
            'event.birth': 'Рождение',
            'event.death': 'Смерть',
            'event.marriage': 'Бракосочетание',
            'event.childBirth': 'Рождение ребёнка',
            'event.unknown': 'Неизвестно',

            // Dates
            'date.born': 'р. {0}',
            'date.died': 'ум. {0}',

            // Data
            'data.unknown': 'Неизвестно',
            'data.noName': 'Без имени',

            // Toasts
            'toast.treeCreated': 'Древо создано',
            'toast.relativeAdded': 'Родственник добавлен',
            'toast.backupLoaded': 'Бекап загружен успешно',
            'toast.backupError': 'Ошибка: неверный формат файла',
            'toast.noData': 'Нет данных для сохранения',
            'toast.backupSaved': 'Бекап сохранён',
            'toast.imageSaved': 'Изображение сохранено',
            'toast.enterName': 'Введите имя',
            'toast.nameRequired': 'Имя обязательно для заполнения',
            'toast.dataSaved': 'Данные сохранены',
            'toast.personDeleted': 'Персона удалена',

            // Tree node
            'node.self': 'Я',

            // Theme
            'theme.light': 'Светлая тема',
            'theme.dark': 'Тёмная тема'
        },

        en: {
            // Navbar
            'app.title': 'Family Tree Editor',
            'nav.import': 'Import',
            'nav.import.title': 'Load backup',
            'nav.export': 'Export',
            'nav.export.title': 'Save backup',
            'nav.newTree': 'New tree',
            'nav.newTree.title': 'New tree',
            'nav.stats': 'People in tree: {0}',

            // Welcome screen
            'welcome.title': 'Welcome to Family Tree Editor',
            'welcome.subtitle': 'Create a new family tree or load an existing backup',
            'welcome.newTree': 'Create new tree',
            'welcome.loadBackup': 'Load backup',

            // Tree controls
            'controls.zoomIn': 'Zoom in',
            'controls.zoomOut': 'Zoom out',
            'controls.fitScreen': 'Fit to screen',
            'controls.saveImage': 'Save as image',

            // Sidebar view
            'sidebar.edit': 'Edit',
            'sidebar.close': 'Close',
            'sidebar.relatives': 'Relatives',
            'sidebar.addRelative': 'Add',
            'sidebar.events': 'Events',
            'sidebar.biography': 'Biography',
            'sidebar.noBio': 'No information',
            'sidebar.deletePerson': 'Delete person',
            'sidebar.noRelatives': 'No relatives added',

            // Sidebar edit
            'edit.title': 'Editing',
            'edit.firstName': 'First name',
            'edit.lastName': 'Last name',
            'edit.middleName': 'Middle name',
            'edit.gender': 'Gender',
            'edit.genderMale': 'M',
            'edit.genderFemale': 'F',
            'edit.birthDate': 'Date of birth',
            'edit.birthPlace': 'Place of birth',
            'edit.deathDate': 'Date of death',
            'edit.deathPlace': 'Place of death',
            'edit.biography': 'Biography',
            'edit.photo': 'Photo (URL)',
            'edit.save': 'Save',
            'edit.cancel': 'Cancel',

            // Placeholders
            'placeholder.firstName': 'Enter first name',
            'placeholder.lastName': 'Enter last name',
            'placeholder.middleName': 'Enter middle name',
            'placeholder.birthPlace': 'City, country',
            'placeholder.deathPlace': 'City, country',
            'placeholder.biography': 'Short biography...',
            'placeholder.photo': 'https://...',

            // Add relative modal
            'modal.addRelative': 'Add relative',
            'relation.father': 'Father',
            'relation.mother': 'Mother',
            'relation.spouse': 'Spouse',
            'relation.son': 'Son',
            'relation.daughter': 'Daughter',
            'relation.brother': 'Brother',
            'relation.sister': 'Sister',
            'relation.wife': 'Wife',
            'relation.husband': 'Husband',

            // New person modal
            'modal.newPerson': 'New person',
            'modal.createRoot': 'Create main person',
            'modal.addFather': 'Add father',
            'modal.addMother': 'Add mother',
            'modal.addSpouse': 'Add spouse',
            'modal.addSon': 'Add son',
            'modal.addDaughter': 'Add daughter',
            'modal.addBrother': 'Add brother',
            'modal.addSister': 'Add sister',
            'modal.firstNameRequired': 'First name *',
            'modal.add': 'Add',
            'modal.cancel': 'Cancel',

            // Confirm modal
            'confirm.title': 'Confirmation',
            'confirm.yes': 'Yes',
            'confirm.no': 'Cancel',
            'confirm.newTree.title': 'New tree',
            'confirm.newTree.message': 'All current data will be deleted. Are you sure?',
            'confirm.deletePerson.title': 'Delete person?',
            'confirm.deletePerson.message': 'Are you sure you want to delete "{0}" and all connections to this person?',

            // Events
            'event.birth': 'Birth',
            'event.death': 'Death',
            'event.marriage': 'Marriage',
            'event.childBirth': 'Child birth',
            'event.unknown': 'Unknown',

            // Dates
            'date.born': 'b. {0}',
            'date.died': 'd. {0}',

            // Data
            'data.unknown': 'Unknown',
            'data.noName': 'No name',

            // Toasts
            'toast.treeCreated': 'Tree created',
            'toast.relativeAdded': 'Relative added',
            'toast.backupLoaded': 'Backup loaded successfully',
            'toast.backupError': 'Error: invalid file format',
            'toast.noData': 'No data to save',
            'toast.backupSaved': 'Backup saved',
            'toast.imageSaved': 'Image saved',
            'toast.enterName': 'Enter name',
            'toast.nameRequired': 'Name is required',
            'toast.dataSaved': 'Data saved',
            'toast.personDeleted': 'Person deleted',

            // Tree node
            'node.self': 'Me',

            // Theme
            'theme.light': 'Light theme',
            'theme.dark': 'Dark theme'
        }
    },

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved && this.translations[saved]) {
            this.currentLang = saved;
        }
        this.updateDOM();
        return this.currentLang;
    },

    setLang(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem(this.STORAGE_KEY, lang);
        this.updateDOM();
    },

    t(key, ...args) {
        const dict = this.translations[this.currentLang] || this.translations['ru'];
        let text = dict[key] || key;
        // Replace {0}, {1}, etc. with arguments
        args.forEach((arg, i) => {
            text = text.replace(`{${i}}`, arg);
        });
        return text;
    },

    updateDOM() {
        // Update elements with data-i18n attribute (textContent)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Update elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', this.t(key));
        });

        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', this.t(key));
        });

        // Update html lang attribute
        document.documentElement.lang = this.currentLang;
    },

    getDateLocale() {
        return this.currentLang === 'ru' ? 'ru-RU' : 'en-US';
    }
};
