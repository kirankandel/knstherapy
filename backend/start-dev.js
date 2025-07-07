#!/usr/bin/env node

// Simple development server starter
process.env.NODE_ENV = 'development';

console.log('Starting KNSTherapy Backend Server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 3001);

// Import the main application
require('./src/index.js');
