import puppeteer from 'puppeteer';
import fs from 'fs';

// card_Product:
// //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[3483]
// name: 
// //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[3483]/product-card/div/div/div/div[6]/div/div[1]/a/p
// img_url:
// //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[3483]/product-card/div/div/div/div[6]/div/div[1]/a/div[1]/img
// old_price: 
// //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[3483]/product-card/div/div/div/div[6]/div/div[1]/a/div[2]/div/div[1]/div[1]/p/s
// price: 
// //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[3483]/product-card/div/div/div/div[6]/div/div[1]/a/div[2]/div/div[1]/div[2]/p
// price_by_unit:
// //*[@id="product-list"]/div/div[3]/div[2]/div/div/div[2]/infinite-scroll/div[3483]/product-card/div/div/div/div[6]/div/div[1]/a/div[2]/div/div[2]/div/div/div/strong


let data = {};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function saveJSON() {
  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('Data_Products.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
    if (err) console.log('error', err);
  });
}

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

  const [productsName] = await page.$x(`
  //p[@class="filter ng-binding ng-scope"]
  `);
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

async function printTesteName(page) {

  let count = 1;
  const productsName = await page.$x(`
  //p[@class="product-description ng-binding placeholder-item"]
  `);
  console.log('Length Name', productsName.length);

  let name = [];
  for (let i = 0; i < productsName.length; i++) {
    console.log('Take name -> ', count);
    name.push(await takeName(productsName[i]));
    count++;
  }

  return name;

  async function takeName(productName) {
    const name = await productName.getProperty('textContent');
    const nameRawText = await name.jsonValue();
    const nameText = String(nameRawText).trim();
    return {
      name: nameText
    }
  }
}

async function printTesteImg(page) {

  const productsImg = await page.$x(`
  //img[@class="fade ng-scope fade-in"]
  `);


  console.log('Length Img', productsImg.length);

  let img_url = [];
  let count = 1;
  for (let i = 0; i < productsImg.length; i++) {
    console.log('Take img url -> ', count);
    img_url.push(await takeImg(productsImg[i]));
    count++;
  }

  return img_url;

  async function takeImg(productImg) {
    const img = await productImg.getProperty('src');
    const imgRawText = await img.jsonValue();
    const imgURL = String(imgRawText).trim();

    return {
      img: imgURL
    }
  }
}

async function printTestePrice(page) {

  const productsPrice = await page.$x(`
  //p[@class="normal-price ng-binding ng-scope"]
  `);
  console.log('Length Price', productsPrice.length);

  let price = [];
  let count = 1;
  for (let i = 0; i < productsPrice.length; i++) {
    console.log('Take price -> ', count);
    price.push(await takePrice(productsPrice[i]));
    count++;
  }

  return price;

  async function takePrice(productPrice) {
    const price = await productPrice.getProperty('textContent');
    const priceRawText = await price.jsonValue();
    const priceText = String(priceRawText).trim();
    return {
      price: priceText
    }
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

  // for (let i = 0; i < 1; i++) {
  //   await page.evaluate((_) => {
  //     window.scrollBy(window.innerHeight, window.innerHeight * 5);
  //   });
  //   console.log('Scroll ', i);
  //   // const { numberOfProducts, totalOfProducts } = await printTeste(page);
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
  await delay(1000);

  console.log('Start ');
  // await delay(60000);

  const [name, img_url, price] = await Promise.all([
    printTesteName(page),
    printTesteImg(page),
    printTestePrice(page),
  ])

  console.log('Bulinding array of Products');
  // const { numberOfProducts, totalOfProducts } = await printTeste(page);
  // let productsList = [numberOfProducts, totalOfProducts];

  let arrProduct = [];
  for (let i = 0; i < productsList[0]; i++) {
    // for (let i = 0; i < name.length; i++) {
    // console.log(`Teste ${i} -> name: ${name[i]}, img_url: ${img_url[i]}, price: ${price[i]}`);

    let nameProduct = name[i] ? name[i] : 'erro';
    let imgProduct = img_url[i] ? img_url[i] : 'erro';
    let priceProduct = price[i] ? price[i] : 'erro';

    arrProduct.push([i + 1, nameProduct.name, imgProduct.img, priceProduct.price]);

  }
  // console.log('TEste arrProduct -> ', arrProduct);
  console.log('TEste length arrProduct -> ', arrProduct.length);

  const products = arrProduct.map(product => {

    return {
      index: product[0],
      name: product[1] || 'falta',
      img_url: product[2] || 'falta',
      price: product[3] || 'falta'
    }
  });

  await delay(1000);

  data.info.number_products = arrProduct.length;
  data.data_products = products;

  await saveJSON();
  console.log('END');
  await browser.close();
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

