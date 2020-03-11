// Mateus V.

// This script scrapes/extracts data from the product list 
// of the Tenda Atacado market website 

// Using puppeteer
// script usando sucrase e nodemon

import puppeteer from 'puppeteer';
import fs from 'fs';

import { urlArrayTA } from './url/data_url';
// import * as UtilsTakeInfo from './util/TakeInfo';

let data = {};
let index = 1;

// Número de Url sendo carregadas em paralelo
const numberOfURL = 5;
let arrayOfProcess = [];

const delay = ms => new Promise(res => setTimeout(res, ms));

// Salver JSON
async function saveJSON() {

  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('./Data/Data_Products.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
    if (err) console.log('error', err);
  });
}

// Função de mineração de dados
async function scrapeProductTest(url, urlIndex) {
  try {
    // console.log('Teste URL -> ', url);
    var hrstart_Main = process.hrtime();

    // Usando a lib puppeteer para configurar o browser
    const browser = await puppeteer.launch({
      headless: true,
      // slowMo: 250 // slow down by 250ms
    });

    // Criando uma nova página
    const page = await browser.newPage();
    await closeDialog(page);
    await page.goto(url, { waitUntil: 'networkidle0' });

    let flagError = false;
    let ulIndex = 1;
    let liIndex = 1;

    while (!flagError) {
      try {
        console.log(`Index - ${index} / liIndex - ${liIndex} / ulIndex - ${ulIndex} / urlIndex - ${urlIndex}`);
        const [
          nameProduct,
          imgProduct,
          priceProduct
        ] = await Promise.all([
          takeName(page, ulIndex, liIndex),
          takeImgUrl(page, ulIndex, liIndex),
          takePrice(page, ulIndex, liIndex),
        ]);

        data.data_products.push({
          index: index,
          name: nameProduct || '-',
          img_url: imgProduct || '-',
          price: priceProduct || '-',
        });

        index++;
        liIndex++;
      } catch (err) {
        // console.log('Teste error -> ', err);

        await loadMoreProducts(page);

        liIndex = 1;
        ulIndex++;

        await delay(3000);

        flagError = await verifyListOfProducts(page, ulIndex);
      }
    }

    let hrend_Main = process.hrtime(hrstart_Main);

    console.info('Execution time Main (hr): %ds %dms', hrend_Main[0], hrend_Main[1] / 1000000);

    console.log('END -> ', urlIndex);

    // Fechando a página;
    await browser.close();
    arrayOfProcess.pop();
    return true;
  } catch (err) {
    console.log('Error  -> ', err);
  }
}

async function verifyListOfProducts(page, ulIndex) {
  const [testNewUl] = await page.$x(`
      //html//body//div[3]//div[6]//div//div[2]//div[2]//section[2]//div[2]//div//div//div[2]//div[3]//div[${ulIndex}]//ul
      `);

  if (testNewUl === undefined) {
    return true;
  }

  return false;
}

async function loadMoreProducts(page) {
  const [button] = await page.$x(`
      //html//body//div[3]//div[6]//div//div[2]//div[2]//section[2]//div[2]//div//div//div[2]//div[5]//a
      `);

  await button.click();
}

async function closeDialog(page) {
  try {
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
  } catch (err) {
    console.log('Erro');
  }
}

async function takeName(page, ulIndex, liIndex) {
  const [productName] = await page.$x(`
  //html//body//div[3]//div[6]//div//div[2]//div[2]//section[2]//div[2]//div//div//div[2]//div[3]//div[${ulIndex}]//ul//li[${liIndex}]//div//div[3]//a//p
  `);
  const name = await productName.getProperty('textContent');
  const nameRawText = await name.jsonValue();
  const nameText = String(nameRawText).trim();
  let nameProduct = nameText ? nameText : 'erro';
  return nameProduct;
}

async function takeImgUrl(page, ulIndex, liIndex) {
  const [productImgURL] = await page.$x(`
  //html//body//div[3]//div[6]//div//div[2]//div[2]//section[2]//div[2]//div//div//div[2]//div[3]//div[${ulIndex}]//ul//li[${liIndex}]//div//div[2]//a//img
  `);
  const img = await productImgURL.getProperty('src');
  const imgRawText = await img.jsonValue();
  const img_url = String(imgRawText).trim();
  let imgProduct = img_url ? img_url : 'erro';
  return imgProduct;
}

async function takePrice(page, ulIndex, liIndex) {
  const [productPrice] = await page.$x(`
  //html//body//div[3]//div[6]//div//div[2]//div[2]//section[2]//div[2]//div//div//div[2]//div[3]//div[${ulIndex}]//ul//li[${liIndex}]//div//div[3]//a//div[2]//strong
  `);
  let priceProduct = undefined;
  if (productPrice) {
    const price = await productPrice.getProperty('textContent');
    const priceRawText = await price.jsonValue();
    const priceText = String(priceRawText).trim();
    priceProduct = priceText ? priceText : 'erro';
  }
  return priceProduct;
}

async function runURLArray(arrayUrlAuxiliar) {
  let indexArrayUrl = 0;
  let flagStart = true;
  const lengthArrayUrl = arrayUrlAuxiliar.length;

  while (flagStart || (arrayOfProcess.length > 0)) {
    flagStart = false;
    if ((arrayOfProcess.length < numberOfURL) && (indexArrayUrl !== lengthArrayUrl)) {

      const aux = arrayUrlAuxiliar.pop();
      arrayOfProcess.push(aux);
      indexArrayUrl++;
      scrapeProductTest(aux, (indexArrayUrl));
      console.log(`Atual arrayOfUrl ${indexArrayUrl} - Total -> ${lengthArrayUrl} - progresso -> ${(indexArrayUrl * 100) / lengthArrayUrl}`);
    }
    await delay(100);
  }
}

// Funcção que ira dar inicio ao processo de mineração de dados
// e savar os dados no JSON
async function runScriptSaveJSON(url) {
  var hrstart_script = process.hrtime();

  await delay(1000);

  await runURLArray(url);

  await saveJSON();
  console.log('END SCRIPT');

  let hrend_script = process.hrtime(hrstart_script);

  console.info('Execution time Script (hr): %ds %dms', hrend_script[0], hrend_script[1] / 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////

// Criando variavel para salvar dados
data = {
  info: {
    url: urlArrayTA,
    number_products: 0,
    from: `Tenda Atacado`
  },
  data_products: [],
  time_expand: [],
  error: []
}

runScriptSaveJSON(urlArrayTA);

// scrapeProductTest(urlArrayTA[0]);


