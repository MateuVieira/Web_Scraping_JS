// Mateus V.
// yarn add puppeteer
// script usando sucrase e nodemon


import puppeteer from 'puppeteer';
import fs from 'fs';

let data = {};
let index = 1;

const delay = ms => new Promise(res => setTimeout(res, ms));

// Salver JSON
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

// Função de mineração de dados
async function scrapeProductTest(url) {
  console.log('Teste URL -> ', url);
  var hrstart_Main = process.hrtime();

  // Usando a lib puppeteer para configurar o browser
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 250 // slow down by 250ms
  });

  // Criando uma nova página
  const page = await browser.newPage();

  // Fazendo a requisiao da páigna
  // waitUntil -> espear até que todas as requisições da página tenham sido feitas
  await page.goto(url, { waitUntil: 'networkidle0' });
  await delay(500);

  // Scroll a página
  await page.evaluate((_) => {
    window.scrollBy(0, window.innerHeight);
  });
  await delay(500);

  // Pegando a quantidades de itens na página e quantos items estão sendo mostrados
  const { numberOfProducts, totalOfProducts } = await printTakeIndexPage(page);
  let productsList = [numberOfProducts, totalOfProducts];
  let count = 1;
  let i = 1;

  // Extrarindo todos os produtos da página

  // Test - while para testes até 20 produtos
  while (productsList[0] !== productsList[1] && i <= 20) {

    // Prod - while para todos os produtos da página
    // while (productsList[0] !== productsList[1]) {
    var hrstart_Loop = process.hrtime();

    // Função para fazer o scroll da página
    // é feito um novo scroll a cada loop 
    // Feito para site do Pão de Açúcar 
    // que utiliza ifinite scroll
    await page.evaluate((_) => {
      window.scrollBy(window.innerHeight, window.innerHeight * 5);
    });
    console.log('Scroll ', count);

    // Atualizando o número de produtos
    const { numberOfProducts, totalOfProducts } = await printTakeIndexPage(page);
    productsList = [numberOfProducts, totalOfProducts];

    console.log('Teste -> ', [numberOfProducts, totalOfProducts]);

    await delay(500);

    console.log('Bulinding array of Products');

    // Váriavel usanda para identificar o loop no parâmete de tempo gasto
    let inicial_product = i;

    // Loop para interar sobre cada produto não extraido
    for (i; i <= productsList[0]; i++) {

      console.log(`Total of Products = ${productsList[0]} - Take Product ${i}  `);

      // Uma promise para lidar com a extração de dados do produto
      const {
        nameProduct,
        imgProduct,
        oldPriceProduct,
        newPriceProduct,
        priceProduct,
        priceByProduct,
        priceProductWithDiscont,
        priceDiscont,
        priceDisabled
      } = await Promise.all([
        takeName(page, i),
        takeImgUrl(page, i),
        takeOldPrice(page, i),
        takeNewPrice(page, i),
        takePrice(page, i),
        takePriceByProduct(page, i),
        takePriceProductWithDiscont(page, i),
        takeDiscontProduct(page, i),
        takeDisabledProduct(page, i)
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

    let hrend_Loop = process.hrtime(hrstart_Loop);
    console.info('Execution time Array (hr): %ds %dms', hrend_Loop[0], hrend_Loop[1] / 1000000);

    // Atualizando os dados de tempo gasto no loop
    data.time_expand.push({
      url: url,
      loop: count,
      inicial_product: inicial_product,
      final_product: i,
      secunds: hrend_Loop[0],
      micro_seconds: (hrend_Loop[1] / 1000000)
    })

    // Atualizando index de produtos cadastrados
    i = parseInt(productsList[0]) + 1;
    console.log("Teste i -> ", i);

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

// Para cada URL minerar os dados da página
async function rumAllURL() {
  for (let i = 0; i < url.length; i++) {
    await scrapeProductTest(url[i]);
  }
}

// Funcção que ira dar inicio ao processo de mineração de dados
// e savar os dados no JSON
async function runScriptSaveJSON(url) {
  var hrstart_script = process.hrtime();
  await rumAllURL(url);
  await saveJSON();
  console.log('END SCRIPT');

  let hrend_script = process.hrtime(hrstart_script);

  console.info('Execution time Script (hr): %ds %dms', hrend_script[0], hrend_script[1] / 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////


// const url = [
//   `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=facetSubShelf_ss:4215_Sucos%20e%20Refrescos&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Whiskies%20e%20Destilados&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=facetSubShelf_ss:4215_Vodka,%20Cacha%C3%A7as%20e%20Saqu%C3%AAs&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes__facetSubShelf_ss:4215_Cervejas&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=facetSubShelf_ss:4215_Ch%C3%A1s%20e%20Mates&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/cafes?qt=12&ftr=facetSubShelf_ss:4215_Caf%C3%A9s&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/capsulas-de-cafes-e-chas?qt=12&ftr=facetSubShelf_ss:4215_C%C3%A1psulas%20de%20Caf%C3%A9s%20e%20Ch%C3%A1s&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/achocolatados-bebidas-lacteas-e-de-soja?qt=12&ftr=facetSubShelf_ss:4215_Achocolatados,%20Bebidas%20L%C3%A1cteas%20e%20de%20Soja&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/aguas?qt=12&ftr=facetSubShelf_ss:4215_%C3%81guas&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/leite?qt=12&ftr=facetSubShelf_ss:4215_Leite&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/energeticos?qt=12&ftr=facetSubShelf_ss:4215_Energ%C3%A9ticos&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/agua-de-coco?qt=12&ftr=facetSubShelf_ss:4215_%C3%81gua%20de%20Coco&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/isotonicos?qt=12&ftr=facetSubShelf_ss:4215_Isot%C3%B4nicos&p=0&gt=list`,
//   `https://www.paodeacucar.com/secoes/C4215/bebidas-gaseficadas?qt=12&ftr=facetSubShelf_ss:4215_Bebidas%20gaseficadas&p=0&gt=list`,
//   `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:01&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
//   `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:02&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
//   `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:03&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
//   `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:04&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
//   `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:clubdessommeliers%20categoria:espumantesesidras&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
// ];

const url = [
  `https://www.paodeacucar.com/busca?w=vinho&c=%20tipo:rose&qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinho&c=%20tipo:espumante&qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinho&c=%20tipo:branco%20pb:03&qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinho&c=%20tipo:branco%20pb:01%20pb:02%20pb:00&qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinho&c=%20tipo:tinto%20pb:00%20pb:01%20pb:02&qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinho&c=%20tipo:tinto%20pb:03&qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes&p=1&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4215_Sucos%20e%20Refrescos__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Sucos%20e%20Refrescos__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Sucos%20e%20Refrescos__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4215_Sucos%20e%20Refrescos__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4215_Cervejas%20Especiais__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Cervejas%20Especiais__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Cervejas%20Especiais__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Cervejas%20Especiais__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4215_Cervejas%20Especiais__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4215_Whiskies%20e%20Destilados__currentPrice_normal_d:%5B200%20TO%20*%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=facetSubShelf_ss:4215_Vodka%252C%20Cacha%25C3%25A7as%20e%20Saqu%25C3%25AAs__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Vodka%252C%20Cacha%25C3%25A7as%20e%20Saqu%25C3%25AAs__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Vodka%252C%20Cacha%25C3%25A7as%20e%20Saqu%25C3%25AAs__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Vodka%252C%20Cacha%25C3%25A7as%20e%20Saqu%25C3%25AAs__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4215_Vodka%252C%20Cacha%25C3%25A7as%20e%20Saqu%25C3%25AAs__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4215_Vodka%252C%20Cacha%25C3%25A7as%20e%20Saqu%25C3%25AAs__currentPrice_normal_d:%5B200%20TO%20*%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=facetSubShelf_ss:4215_Cervejas__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Cervejas__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Cervejas__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Cervejas__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4215_Cervejas__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4215_Cervejas__currentPrice_normal_d:%5B200%20TO%20*%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Refrigerantes__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Refrigerantes__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Refrigerantes__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=facetSubShelf_ss:4215_Ch%25C3%25A1s%20e%20Mates__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Ch%25C3%25A1s%20e%20Mates__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Ch%25C3%25A1s%20e%20Mates__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4215_Ch%25C3%25A1s%20e%20Mates__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cafes?qt=12&ftr=facetSubShelf_ss:4215_Caf%25C3%25A9s__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cafes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4215_Caf%25C3%25A9s__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cafes?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4215_Caf%25C3%25A9s__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/capsulas-de-cafes-e-chas?qt=12&ftr=facetSubShelf_ss:4215_C%C3%A1psulas%20de%20Caf%C3%A9s%20e%20Ch%C3%A1s&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/achocolatados-bebidas-lacteas-e-de-soja?qt=12&ftr=facetSubShelf_ss:4215_Achocolatados,%20Bebidas%20L%C3%A1cteas%20e%20de%20Soja&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/aguas?qt=12&ftr=facetSubShelf_ss:4215_%C3%81guas&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/leite?qt=12&ftr=facetSubShelf_ss:4215_Leite&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/energeticos?qt=12&ftr=facetSubShelf_ss:4215_Energ%C3%A9ticos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/isotonicos?qt=12&ftr=facetSubShelf_ss:4215_Isot%C3%B4nicos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/agua-de-coco?qt=12&ftr=facetSubShelf_ss:4215_%C3%81gua%20de%20Coco&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/bebidas-gaseficadas?qt=12&ftr=facetSubShelf_ss:4215_Bebidas%20gaseficadas&p=0&gt=list`,
]

// Criando variavel para salvar dados
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


