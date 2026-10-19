import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/ui',fullyParallel:false,workers:1,use:{baseURL:'http://127.0.0.1:3001',headless:true,trace:'retain-on-failure'},webServer:{command:'npm start',url:'http://127.0.0.1:3001/health',reuseExistingServer:true},reporter:[['list'],['html',{open:'never'}]]});
