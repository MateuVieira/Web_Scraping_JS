// Mateus V.

// This script scrapes/extracts data from the product list 
// of the Pão de Açúcar market website 

// Using puppeteer
// script usando sucrase e nodemon

import puppeteer from 'puppeteer';
import fs from 'fs';

import { urlArray } from './url/data_url';

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

async function takeIndex(page) {

  let [productsName] = await page.$x(`
  //p[@class="filter ng-binding ng-scope"]
  `);
  if (productsName) {
    return productsName;
  }

  const [productsNameVinho] = await page.$x(`
  //*[@id="product-list"]//div[4]//div//div[1]//p
  `);

  return productsNameVinho;
}

async function printTakeIndexPage(page) {

  const productsName = await takeIndex(page);
  // console.log(productsName);
  const name = await productsName.getProperty('textContent');
  const nameRawText = await name.jsonValue();
  const nanemText = String(nameRawText).trim();
  const numberInfo = nanemText.split(' ');
  // console.log(numberInfo[1], numberInfo[3]);
  return {
    numberOfProducts: numberInfo[1],
    totalOfProducts: numberInfo[3],
  }
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
      const { numberOfProducts, totalOfProducts } = await printTakeIndexPage(page);
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
    const { numberOfProducts, totalOfProducts } = await printTakeIndexPage(page);
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
      itemArray.push(new Promise((resolve) => resolve(takeInfoProduct(i))));
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

  async function takeInfoProduct(i) {
    const [nameProduct, imgProduct, oldPriceProduct, newPriceProduct, priceProduct, priceByProduct, priceProductWithDiscont, priceDiscont, priceDisabled] = await Promise.all([
      takeName(page, i),
      takeImgUrl(page, i),
      takeOldPrice(page, i),
      takeNewPrice(page, i),
      takePrice(page, i),
      takePriceByProduct(page, i),
      takePriceProductWithDiscont(page, i),
      takeDiscontProduct(page, i),
      takeDisabledProduct(page, i),
    ]);
    // Add dados extraidos a váriavel de armazenamento
    data.data_products.push({
      index: index,
      name: nameProduct || '-',
      img_url: imgProduct || '-',
      price: priceProduct || '-',
      old_price: oldPriceProduct || '-',
      new_Price: newPriceProduct || '-',
      price_by_product: priceByProduct || '-',
      price_with_discont: priceProductWithDiscont || '-',
      discont: priceDiscont || '-',
      product_disabled: priceDisabled || '-'
    });
    // Atualizando o index;
    index++;
  }
}

// Função para a extração do nome do Produto
async function takeName(page, i) {
  const [productName] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//p
    `);
  const name = await productName.getProperty('textContent');
  const nameRawText = await name.jsonValue();
  const nameText = String(nameRawText).trim();
  let nameProduct = nameText ? nameText : 'erro';
  return nameProduct;
}

// Função para a extração do da url do Produto
async function takeImgUrl(page, i) {
  const [productImgURL] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//div[1]//img
    `);
  const img = await productImgURL.getProperty('src');
  const imgRawText = await img.jsonValue();
  const img_url = String(imgRawText).trim();
  let imgProduct = img_url ? img_url : 'erro';
  return imgProduct;
}

// Função para a extração do preço antigo do Produto
async function takeOldPrice(page, i) {
  const [productOldPrice] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//div[2]//div//div[1]//div[1]//p//s
    `);
  let oldPriceProduct = undefined;
  if (productOldPrice) {
    const oldPrice = await productOldPrice.getProperty('textContent');
    const oldPriceRawText = await oldPrice.jsonValue();
    const oldPriceText = String(oldPriceRawText).trim();
    oldPriceProduct = oldPriceText ? oldPriceText : 'erro';
  }
  return oldPriceProduct;
}

// Função para a extração do novo preço do Produto
async function takeNewPrice(page, i) {
  const [productNewPrice] = await page.$x(`
    //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[${i}]/product-card/div/div/div/div[6]/div/div[1]/a/div[2]/div/div[1]/div[2]/p[@class="discount-price ng-binding ng-scope"]
    `);
  let newPriceProduct = undefined;
  if (productNewPrice) {
    const newPrice = await productNewPrice.getProperty('textContent');
    const newPriceRawText = await newPrice.jsonValue();
    const newPriceText = String(newPriceRawText).trim();
    newPriceProduct = newPriceText ? newPriceText : 'erro';
  }
  return newPriceProduct;
}

// Função para a extração do preço do Produto
async function takePrice(page, i) {
  const [productPrice] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//div[2]//div//span//div//p
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

// Função para a extração do preço por Produto
async function takePriceByProduct(page, i) {
  const [productPriceBy] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//div[2]//div//div[2]//div//div//div//strong
    `);
  let priceByProduct = undefined;
  if (productPriceBy) {
    const priceBy = await productPriceBy.getProperty('textContent');
    const priceByRawText = await priceBy.jsonValue();
    const priceByText = String(priceByRawText).trim();
    priceByProduct = priceByText ? priceByText : 'erro';
  }
  return priceByProduct;
}

// Função para a extração do preço do Produto com desconto
async function takePriceProductWithDiscont(page, i) {
  const [productPriceWithDiscont] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//div[2]//div//div//div//div//promotional-label//div//div//div[2]//span//p[2]//strong
    `);
  let priceProductWithDiscont = undefined;
  if (productPriceWithDiscont) {
    const priceWithDiscont = await productPriceWithDiscont.getProperty('textContent');
    const priceWithDiscontRawText = await priceWithDiscont.jsonValue();
    const priceWithDiscontText = String(priceWithDiscontRawText).trim();
    priceProductWithDiscont = priceWithDiscontText ? priceWithDiscontText : 'erro';
  }
  return priceProductWithDiscont;
}

// Função para a extração do valor do desconto
async function takeDiscontProduct(page, i) {
  const [productDiscont] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div/div//div[6]//div//div[1]//a//div[2]//div//div//div//div//promotional-label//div//div//div[2]//span//p[1]
    `);
  let priceDiscont = undefined;
  if (productDiscont) {
    const discont = await productDiscont.getProperty('textContent');
    const discontRawText = await discont.jsonValue();
    const discontText = String(discontRawText).trim();
    priceDiscont = discontText ? discontText : 'erro';
  }
  return priceDiscont;
}

// Função para a extração se o produto está disponivel
async function takeDisabledProduct(page, i) {
  const [productDisabled] = await page.$x(`
      //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[2]//div//div[2]//button[1]
      `);
  let priceDisabled = undefined;
  if (productDisabled) {
    const disabled = await productDisabled.getProperty('textContent');
    const disabledRawText = await disabled.jsonValue();
    const disabledText = String(disabledRawText).trim();
    priceDisabled = disabledText ? disabledText : 'erro';
  }
  return priceDisabled;
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


