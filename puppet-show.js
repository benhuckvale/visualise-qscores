/*
 * Launch server, run puppeteer to capture screenshots, then quit.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path, { dirname } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import waitOn from 'wait-on';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverCommand = 'astro dev';
const args = process.argv.slice(2);
const url = args[0] || 'http://localhost:4321/qscore/';
const queryParams = args[1] || 'qscore=10&sequenceLength=1000&fontSize=20';
const fullUrl = `${url}?${queryParams}`;
const publicDir = path.resolve(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const outputPath = path.resolve(publicDir, 'thumbnail.png');

const startServer = () => {
  console.log('Starting server...');
  return exec(serverCommand);
};

const stopServer = (serverProcess) => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
};

const generateThumbnail = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  console.log(`Browsing to ${fullUrl}`);
  await page.goto(fullUrl, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: outputPath });
  await browser.close();
  console.log(`Thumbnail generated at ${outputPath}`);
};

const main = async () => {
  const serverProcess = startServer();

  waitOn({ resources: [url], delay: 1000, timeout: 30000 }, async (err) => {
    if (err) {
      console.error('Error waiting for server:', err);
      stopServer(serverProcess);
      process.exit(1);
    }

    try {
      await generateThumbnail();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    } finally {
      stopServer(serverProcess);
    }
  });
};

main();
