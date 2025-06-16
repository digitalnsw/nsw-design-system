const Handlebars = require('handlebars');

// once, at start-up:
Handlebars.registerHelper('currentYear', () => new Date().getFullYear());