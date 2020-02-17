// Execution time Main (hr): 64585s 786.761387ms

import puppeteer from 'puppeteer';
import fs from 'fs';

let data = {};
let index = 1;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function saveJSON() {
  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('Data_Products.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
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

async function scrapeProductTest(url) {
  console.log('Teste URL -> ', url);
  var hrstart_Main = process.hrtime();
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 250 // slow down by 250ms
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await delay(1000);

  await page.evaluate((_) => {
    window.scrollBy(0, window.innerHeight);
  });
  await delay(1000);

  const { numberOfProducts, totalOfProducts } = await printTakeIndexPage(page);
  let productsList = [numberOfProducts, totalOfProducts];
  let count = 1;
  let arrProduct = [];
  let i = 1;

  // Test
  while (productsList[0] !== productsList[1] && i <= 20) {

    // Prod
    // while (productsList[0] !== productsList[1]) {
    var hrstart_Loop = process.hrtime();
    await page.evaluate((_) => {
      window.scrollBy(window.innerHeight, window.innerHeight * 5);
    });
    console.log('Scroll ', count);

    const { numberOfProducts, totalOfProducts } = await printTakeIndexPage(page);
    productsList = [numberOfProducts, totalOfProducts];

    console.log('Teste -> ', [numberOfProducts, totalOfProducts]);

    await delay(1000);

    console.log('Bulinding array of Products');

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

    let inicial_product = i;

    for (i; i <= productsList[0]; i++) {

      // for (let i = 0; i < name.length; i++) {
      // console.log(`Teste ${i} -> name: ${name[i]}, img_url: ${img_url[i]}, price: ${price[i]}`);
      console.log(`Total of Products = ${productsList[0]} - Take Product ${i}  `);
      // Take Name of the Product
      let nameProduct = await takeName(page, i);

      // Take Img URL of the Product
      let imgProduct = await takeImgUrl(page, i);

      // Take Old Price of the Product
      let oldPriceProduct = await takeOldPrice(page, i);

      // Take New Price of the Product
      let newPriceProduct = await takeNewPrice(page, i);

      // Take Price of the Product
      let priceProduct = await takePrice(page, i);

      // Take Price by Product
      let priceByProduct = await takePriceByProduct(page, i);

      // Take Price by Product with discont
      let priceProductWithDiscont = await takePriceProductWithDiscont(page, i);

      // Take Dicont Product
      let priceDiscont = await takeDiscontProduct(page, i);

      // Take Disabled Product
      let priceDisabled = await takeDisabledProduct(page, i);

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

      index++;
    }

    let hrend_Loop = process.hrtime(hrstart_Loop);
    console.info('Execution time Array (hr): %ds %dms', hrend_Loop[0], hrend_Loop[1] / 1000000);

    data.time_expand.push({
      url: url,
      loop: count,
      inicial_product: inicial_product,
      final_product: i,
      secunds: hrend_Loop[0],
      micro_seconds: (hrend_Loop[1] / 1000000)
    })

    i = parseInt(productsList[0]) + 1;
    console.log("Teste i -> ", i);
    count++;
  }

  await delay(1000);

  data.info.number_products = index;

  let hrend_Main = process.hrtime(hrstart_Main);

  console.info('Execution time Main (hr): %ds %dms', hrend_Main[0], hrend_Main[1] / 1000000);

  console.log('END');
  await browser.close();
  return true;
}

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

async function rumAllURL() {
  for (let i = 0; i < url.length; i++) {
    await scrapeProductTest(url[i]);
  }
}

async function runScriptSaveJSON(url) {
  var hrstart_script = process.hrtime();
  await rumAllURL(url);
  console.log('Teste saida');
  await saveJSON();
  console.log('END SCRIPT');

  let hrend_script = process.hrtime(hrstart_script);

  console.info('Execution time Script (hr): %ds %dms', hrend_script[0], hrend_script[1] / 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////


const url = [
  `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=facetSubShelf_ss:4215_Sucos%20e%20Refrescos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Whiskies%20e%20Destilados&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=facetSubShelf_ss:4215_Vodka,%20Cacha%C3%A7as%20e%20Saqu%C3%AAs&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes__facetSubShelf_ss:4215_Cervejas&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=facetSubShelf_ss:4215_Ch%C3%A1s%20e%20Mates&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/cafes?qt=12&ftr=facetSubShelf_ss:4215_Caf%C3%A9s&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/capsulas-de-cafes-e-chas?qt=12&ftr=facetSubShelf_ss:4215_C%C3%A1psulas%20de%20Caf%C3%A9s%20e%20Ch%C3%A1s&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/achocolatados-bebidas-lacteas-e-de-soja?qt=12&ftr=facetSubShelf_ss:4215_Achocolatados,%20Bebidas%20L%C3%A1cteas%20e%20de%20Soja&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/aguas?qt=12&ftr=facetSubShelf_ss:4215_%C3%81guas&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/leite?qt=12&ftr=facetSubShelf_ss:4215_Leite&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/energeticos?qt=12&ftr=facetSubShelf_ss:4215_Energ%C3%A9ticos&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/agua-de-coco?qt=12&ftr=facetSubShelf_ss:4215_%C3%81gua%20de%20Coco&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/isotonicos?qt=12&ftr=facetSubShelf_ss:4215_Isot%C3%B4nicos&p=0&gt=list`,
  // `https://www.paodeacucar.com/secoes/C4215/bebidas-gaseficadas?qt=12&ftr=facetSubShelf_ss:4215_Bebidas%20gaseficadas&p=0&gt=list`,
  // `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:01&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  // `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:02&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  // `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:03&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  // `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:04&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  // `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:clubdessommeliers%20categoria:espumantesesidras&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
]

data = {
  info: {
    url: url,
    number_products: 0,
    from: `Pão de Açúcar - bebidas`
  },
  data_products: [],
  time_expand: []
}

runScriptSaveJSON(url);


