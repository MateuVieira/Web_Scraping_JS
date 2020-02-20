// Mateus V.

// This script scrapes/extracts data from the product list 
// of the Pão de Açúcar market website 

// Using puppeteer
// script usando sucrase e nodemon

import puppeteer from 'puppeteer';
import fs from 'fs';

import { urlArray } from './url/data_url';
import * as UtilsTakeInfo from './util/TakeInfo';

let data = {};
let index = 1;

// Número de Url sendo carregadas em paralelo
const numberOfURL = 5;
let infoArrayURL = 0;

const delay = ms => new Promise(res => setTimeout(res, ms));

// Salver JSON
async function saveJSON() {
  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('./Data/Data_Products.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
    if (err) console.log('error', err);
  });
}

// Função de mineração de dados
async function scrapeProductTest(url) {
  // console.log('Teste URL -> ', url);
  var hrstart_Main = process.hrtime();

  // Usando a lib puppeteer para configurar o browser
  const browser = await puppeteer.launch({
    headless: true,
    // slowMo: 250 // slow down by 250ms
  });

  // Criando uma nova página
  const page = await browser.newPage();

  let flagPageOk = false;
  let productsList = [];
  let count = 1;
  let i = 1;

  while (!flagPageOk) {
    // Fazendo a requisiao da páigna
    // waitUntil -> espear até que todas as requisições da página tenham sido feitas
    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
    } catch (err) {
      console.log(err);
    }
    // await delay(1000);

    // Scroll a página
    await page.evaluate((_) => {
      window.scrollBy(0, window.innerHeight);
    });
    await delay(500);

    // Pegando a quantidades de itens na página e quantos items estão sendo mostrados
    try {
      const { numberOfProducts, totalOfProducts } = await UtilsTakeInfo.printTakeIndexPage(page);
      productsList = [numberOfProducts, totalOfProducts];
      flagPageOk = true;
    } catch (err) {
      console.log(err);
      flagPageOk = false;
    }
  }

  // Extrarindo todos os produtos da página

  // Test - while para testes até 20 produtos
  // while (productsList[0] !== productsList[1] && i <= 20) {

  // Prod - while para todos os produtos da página
  while (productsList[0] !== productsList[1]) {
    var hrstart_Loop = process.hrtime();

    // Função para fazer o scroll da página
    // é feito um novo scroll a cada loop 
    // Feito para site do Pão de Açúcar 
    // que utiliza ifinite scroll
    await page.evaluate((_) => {
      window.scrollBy(window.innerHeight, window.innerHeight * 5);
    });
    console.log('Scroll ', count);

    // Error
    if (count > 200) {
      data.error.push({
        url: url,
      });

      return false;
    }

    // Atualizando o número de produtos
    const { numberOfProducts, totalOfProducts } = await UtilsTakeInfo.printTakeIndexPage(page);
    productsList = [numberOfProducts, totalOfProducts];

    console.log('Teste -> ', [numberOfProducts, totalOfProducts]);

    await delay(500);

    // console.log('Bulinding array of Products');

    // Váriavel usanda para identificar o loop no parâmete de tempo gasto
    let inicial_product = i;

    let itemArray = [];
    // Loop para interar sobre cada produto não extraido
    for (i; i <= productsList[0]; i++) {
      // console.log(`Total of Products = ${productsList[0]} - Take Product ${i}  `);
      itemArray.push(new Promise((resolve) => resolve(UtilsTakeInfo.takeInfoProduct(page, i, data, index))));
    }

    const resulte = await Promise.all(itemArray);

    let hrend_Loop = process.hrtime(hrstart_Loop);
    // console.info('Execution time Array (hr): %ds %dms', hrend_Loop[0], hrend_Loop[1] / 1000000);

    // Atualizando os dados de tempo gasto no loop
    data.time_expand.push({
      url: url,
      loop: count,
      inicial_product: inicial_product,
      final_product: i,
      secunds: hrend_Loop[0],
      micro_seconds: (hrend_Loop[1] / 1000000)
    });

    // Atualizando index de produtos cadastrados
    i = parseInt(productsList[0]) + 1;
    // console.log("Teste i -> ", i);

    // Atualizando o index geral de produtos cadastrados
    count++;
  }

  await delay(500);

  // Atualizando informação de produtos cadastrados
  data.info.number_products = index;

  let hrend_Main = process.hrtime(hrstart_Main);

  console.info('Execution time Main (hr): %ds %dms', hrend_Main[0], hrend_Main[1] / 1000000);

  console.log('END');

  // Fechando a página;
  await browser.close();

  return true;
}

async function runAllURL(url) {
  // console.log('Teste -> ', url);
  let promisesArray = url.map(item => new Promise((resolve) => resolve(scrapeProductTest(item))));

  const resulte = await Promise.all(promisesArray);
}

// Para cada URL minerar os dados da página
async function runURLArray(arrayUrlAuxiliar) {
  for (let i = 0; i < arrayUrlAuxiliar.length; i++) {
    // console.log('Teste -> ', arrayUrlAuxiliar[i]);
    console.log(`Atual arrayOfUrl ${i} - Total -> ${infoArrayURL} - Atual -> ${((i + 1) * 5)}`);
    await runAllURL(arrayUrlAuxiliar[i]);
  }
}

// Funcção que ira dar inicio ao processo de mineração de dados
// e savar os dados no JSON
async function runScriptSaveJSON(url) {
  var hrstart_script = process.hrtime();
  // await runAllURL(url);
  const [arrayUrlAuxiliar] = await Promise.all([buildArrayUrl(url)]);

  await delay(1000);

  await runURLArray(arrayUrlAuxiliar);

  await saveJSON();
  console.log('END SCRIPT');

  let hrend_script = process.hrtime(hrstart_script);

  console.info('Execution time Script (hr): %ds %dms', hrend_script[0], hrend_script[1] / 1000000);

  async function buildArrayUrl(url) {
    let arrayUrlAuxiliar = [];
    while (url.length > 0) {
      let aux = url.splice(0, numberOfURL);
      arrayUrlAuxiliar.push(aux);
    }

    return arrayUrlAuxiliar;
  }
}

//////////////////////////////////////////////////////////////////////////////////////

infoArrayURL = urlArray.length;

// Criando variavel para salvar dados
data = {
  info: {
    url: urlArray,
    number_products: 0,
    from: `Pão de Açúcar - bebidas`
  },
  data_products: [],
  time_expand: [],
  error: []
}

runScriptSaveJSON(urlArray);


