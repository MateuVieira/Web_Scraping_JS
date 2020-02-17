import puppeteer from 'puppeteer';
import fs from 'fs';

let data = {};



const delay = ms => new Promise(res => setTimeout(res, ms));

async function saveJSON() {
  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('Data_Products.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
    if (err) console.log('error', err);
  });
}

async function printInfoProduct(product) {

  // console.log(
  //   `\n_______ Produto ${product[3]} ______\n`
  // );

  // let infoName = '';
  // let infoImg = '';
  // let infoPrice = '';

  const [infoName, infoImg, infoPrice] = await Promise.all([
    printName(product),
    printImgURl(product),
    printPrice(product),
  ]);

  const infoProduto = `produto_${product[3]}`;

  // console.log({
  //   infoProduto,
  //   infoName,
  //   infoImg,
  //   infoPrice
  // });
  data.data_products.push([infoProduto, infoName, infoImg, infoPrice]);
};

async function printPrice(product) {
  let infoPrice = '';

  if (product[2]) {
    const price = await product[2].getProperty('textContent');
    const priceRawText = await price.jsonValue();
    const priceText = String(priceRawText).trim();
    infoPrice = (`price: ${priceText}`);
  }
  else {
    infoPrice = (`price: FALHA`);
  }
  return infoPrice;
}

async function printImgURl(product) {
  let infoImg = '';

  if (product[1]) {
    const img = await product[1].getProperty('src');
    const imgRawText = await img.jsonValue();
    const imgURL = String(imgRawText).trim();
    infoImg = (`imt_URL: ${imgURL}`);
  }
  else {
    infoImg = (`imt_URL: FALHA`);
  }
  return infoImg;
}

async function printName(product) {
  let infoName = '';

  if (product[0]) {
    const name = await product[0].getProperty('textContent');
    const nameRawText = await name.jsonValue();
    const nameText = String(nameRawText).trim();
    if (nameText === '') {
      infoName = (`name: FALHA`);
    } else {
      infoName = (`name: ${nameText}`);
    }
  }
  else {
    infoName = (`name: FALHA`);
  }

  return infoName;
}

async function printTeste(page) {

  const [productsNumber] = await page.$x(`
  //p[@class="filter ng-binding ng-scope"]
  `);
  // console.log(productsNumber);
  const number = await productsNumber.getProperty('textContent');
  const numberRawText = await number.jsonValue();
  const numberText = String(numberRawText).trim();
  const numberInfo = numberText.split(' ');
  // console.log(numberInfo[1], numberInfo[3]);
  return {
    numberOfProducts: numberInfo[1],
    totalOfProducts: numberInfo[3],
  }
}

async function scrapeProductTest(url) {
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 250 // slow down by 250ms
  });
  const page = await browser.newPage();
  await page.goto(url);
  await delay(1000);

  await page.evaluate((_) => {
    window.scrollBy(0, window.innerHeight);
  });
  await delay(500);

  // for (let i = 0; i < 3; i++) {
  //   await page.evaluate((_) => {
  //     window.scrollBy(window.innerHeight, window.innerHeight * 5);
  //   });
  //   console.log('Scroll ', i);
  //   const { numberOfProducts, totalOfProducts } = await printTeste(page);
  //   // console.log('Teste -> ', [numberOfProducts, totalOfProducts]);
  //   await delay(1000);
  // }

  const { numberOfProducts, totalOfProducts } = await printTeste(page);
  let productsList = [numberOfProducts, totalOfProducts];
  let count = 1;

  while (productsList[0] !== productsList[1]) {
    await page.evaluate((_) => {
      window.scrollBy(window.innerHeight, window.innerHeight * 5);
    });
    console.log('Scroll ', count);

    const { numberOfProducts, totalOfProducts } = await printTeste(page);
    productsList = [numberOfProducts, totalOfProducts];

    console.log('Teste -> ', [numberOfProducts, totalOfProducts]);

    await delay(500);
    count++;
  }

  await page.evaluate((_) => {
    window.scrollBy(window.innerHeight, window.innerHeight * 5);
  });
  await delay(500);

  console.log('Start Name');
  await delay(10000);
  console.log('End Name');

  const productsName = await page.$x(`
  //p[@class="product-description ng-binding placeholder-item"]
  `);

  // console.log('Start Img');
  // await delay(300000);
  // console.log('End Img');

  const productsImg = await page.$x(`
  //img[@class="fade ng-scope fade-in"]
  `);

  // console.log('Start Price');
  // await delay(300000);
  // console.log('End Price');

  const productsPrice = await page.$x(`
  //p[@class="normal-price ng-binding ng-scope"]
  `);

  // console.log('Start Delay');
  // await delay(300000);
  // console.log('End Delay');

  let arrProduct = [];
  for (let i = 0; i < productsName.length; i++) {
    arrProduct.push([productsName[i], productsImg[i], productsPrice[i], i + 1]);
  }
  console.log('Bulinding array of Products');

  await delay(1000);
  arrProduct.map(product => printInfoProduct(product));

  await delay(1000);
  // console.log(arrProduct[29]);
  console.log(arrProduct.length);
  data.info.number_products = arrProduct.length;

  await saveJSON();
  console.log('END');
  // await browser.close();
}

const url = [
  `https://www.paodeacucar.com/secoes/C4215/bebidas?qt=12&p=7&gt=list`,
]

data = {
  info: {
    url: url,
    number_products: 0,
    from: `Pão de Açúcar - bebidas`
  },
  data_products: []
}

scrapeProductTest(url[0]);

