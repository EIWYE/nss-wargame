const puppeteer = require('puppeteer-core');
const path = require('path');

async function convertHtmlToPdf() {
  const htmlPath = path.resolve(__dirname, 'operation-manual.html');
  const pdfPath = path.resolve(__dirname, '国家安全战略兵棋推演平台操作手册.pdf');
  
  const chromePath = 'C:/Users/28737/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe';
  
  console.log('启动 Chrome 浏览器...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  console.log('打开 HTML 文件...');
  const page = await browser.newPage();
  
  // 设置A4纸张大小
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  
  console.log('生成 PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      bottom: '0',
      left: '0',
      right: '0'
    },
    displayHeaderFooter: false
  });
  
  console.log('PDF 生成完成: ' + pdfPath);
  await browser.close();
}

convertHtmlToPdf().catch(err => {
  console.error('PDF 生成失败:', err);
  process.exit(1);
});
