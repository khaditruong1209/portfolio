// Simple i18n system for language switching
class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translations = {};
    this.init();
  }

  async init() {
    try {
      const response = await fetch('/js/translations.json');
      this.translations = await response.json();
      document.documentElement.lang = this.currentLanguage;
      document.documentElement.setAttribute('data-language', this.currentLanguage);
      this.applyTranslations();
      this.updateLanguageToggle();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  setLanguage(lang) {
    if (lang === 'en' || lang === 'vi') {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-language', lang);
      this.applyTranslations();
      this.updateLanguageToggle();
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      if (element.tagName === 'INPUT' && element.type === 'placeholder') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.type === 'text') {
        element.value = translation;
      } else {
        element.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      element.placeholder = translation;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = this.t(key);
      element.innerHTML = translation;
    });

    // Update skills lists
    this.updateSkillsList('skills-list-technical', 'skills.technical.list');
    this.updateSkillsList('skills-list-soft', 'skills.soft.list');

    // Update experience skills
    this.updateSkillsList('experience-skills-wigi', 'experience.wigiHair.skills');
    this.updateSkillsList('experience-skills-tiemNhaCo', 'experience.tiemNhaCo.skills');
    this.updateSkillsList('experience-skills-delta', 'experience.delta.skills');
    this.updateSkillsList('experience-skills-realcoin', 'experience.realcoin.skills');

    // Update page title if available
    if (document.title && this.translations[this.currentLanguage]?.meta?.title) {
      document.title = this.t('meta.title');
    }
  }

  updateSkillsList(className, key) {
    const list = document.querySelector('.' + className);
    if (!list) return;

    const skills = this.t(key);
    if (Array.isArray(skills)) {
      const items = list.querySelectorAll('li');
      items.forEach((item, index) => {
        if (index < skills.length) {
          item.textContent = skills[index];
        }
      });
    }
  }

  updateLanguageToggle() {
    const enBtn = document.getElementById('lang-en');
    const viBtn = document.getElementById('lang-vi');

    if (enBtn && viBtn) {
      if (this.currentLanguage === 'en') {
        enBtn.classList.add('active');
        viBtn.classList.remove('active');
      } else {
        viBtn.classList.add('active');
        enBtn.classList.remove('active');
      }
    }
  }
}

// Initialize i18n when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.i18n = new I18n();
});
