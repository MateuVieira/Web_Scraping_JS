// Mateus V.
// yarn add puppeteer
// script usando sucrase e nodemon

import puppeteer from 'puppeteer';
import fs from 'fs';

let data = {};
let index = 1;

// Número de Url sendo carregadas em paralelo
const numberOfURL = 5;
let infoArrayURL = 0;

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


const url = [
  // Bebidas
  `https://www.paodeacucar.com/secoes/C4215/sucos-e-refrescos?qt=12&ftr=facetSubShelf_ss:4215_Sucos%20e%20Refrescos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/whiskies-e-destilados?qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais__facetSubShelf_ss:4215_Whiskies%20e%20Destilados&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/vodka-cachacas-e-saques?qt=12&ftr=facetSubShelf_ss:4215_Vodka,%20Cacha%C3%A7as%20e%20Saqu%C3%AAs&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas-especiais?qt=12&ftr=facetSubShelf_ss:4215_Cervejas%20Especiais&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cervejas?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes__facetSubShelf_ss:4215_Cervejas&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/refrigerantes?qt=12&ftr=facetSubShelf_ss:4215_Refrigerantes&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/chas-e-mates?qt=12&ftr=facetSubShelf_ss:4215_Ch%C3%A1s%20e%20Mates&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/cafes?qt=12&ftr=facetSubShelf_ss:4215_Caf%C3%A9s&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/capsulas-de-cafes-e-chas?qt=12&ftr=facetSubShelf_ss:4215_C%C3%A1psulas%20de%20Caf%C3%A9s%20e%20Ch%C3%A1s&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/achocolatados-bebidas-lacteas-e-de-soja?qt=12&ftr=facetSubShelf_ss:4215_Achocolatados,%20Bebidas%20L%C3%A1cteas%20e%20de%20Soja&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/aguas?qt=12&ftr=facetSubShelf_ss:4215_%C3%81guas&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/leite?qt=12&ftr=facetSubShelf_ss:4215_Leite&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/energeticos?qt=12&ftr=facetSubShelf_ss:4215_Energ%C3%A9ticos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/agua-de-coco?qt=12&ftr=facetSubShelf_ss:4215_%C3%81gua%20de%20Coco&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/isotonicos?qt=12&ftr=facetSubShelf_ss:4215_Isot%C3%B4nicos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4215/bebidas-gaseficadas?qt=12&ftr=facetSubShelf_ss:4215_Bebidas%20gaseficadas&p=0&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:01&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:02&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:03&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:vinhoseespumantes%20pb:04&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  `https://www.paodeacucar.com/busca?w=vinhos%20e%20espumantes&c=%20categoria:clubdessommeliers%20categoria:espumantesesidras&qt=12&ftr=currentPrice_normal_d:%5B100%20TO%20200%5D__facetSubShelf_ss:4215_Vinhos%20e%20Espumantes__currentPrice_normal_d:%5B200%20TO%20*%5D&p=1&gt=list`,
  // Alimentos
  `https://www.paodeacucar.com/secoes/C4223/conservas-e-enlatados?qt=12&ftr=facetSubShelf_ss:4223_Conservas%20e%20Enlatados__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/conservas-e-enlatados?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4223_Conservas%20e%20Enlatados__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/conservas-e-enlatados?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4223_Conservas%20e%20Enlatados__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/cafes?qt=12&ftr=facetSubShelf_ss:4223_Caf%25C3%25A9s__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/cafes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4223_Caf%25C3%25A9s__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/cafes?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4223_Caf%25C3%25A9s__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/farinhas-e-farofas?qt=12&ftr=facetSubShelf_ss:4223_Farinhas%20e%20Farofas__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/farinhas-e-farofas?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4223_Farinhas%20e%20Farofas__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/arroz?qt=12&ftr=facetSubShelf_ss:4223_Arroz__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/arroz?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4223_Arroz__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/arroz?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4223_Arroz__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/sopas-e-cremes?qt=12&ftr=facetSubShelf_ss:4223_Sopas%20e%20Cremes__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/sopas-e-cremes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4223_Sopas%20e%20Cremes__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/acucar-e-adocantes?qt=12&ftr=facetSubShelf_ss:4223_A%C3%A7%C3%BAcar%20e%20Ado%C3%A7antes&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/azeites?qt=12&ftr=facetSubShelf_ss:4223_Azeites&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/molhos-de-tomate?qt=12&ftr=facetSubShelf_ss:4223_Molhos%20de%20Tomate&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/ovos?qt=12&ftr=facetSubShelf_ss:4223_Ovos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/sal-e-pimenta?qt=12&ftr=facetSubShelf_ss:4223_Sal%20e%20Pimenta&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/oleos?qt=12&ftr=facetSubShelf_ss:4223_%C3%93leos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/feijao?qt=12&ftr=facetSubShelf_ss:4223_Feij%C3%A3o&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/outros-graos?qt=12&ftr=facetSubShelf_ss:4223_Outros%20Gr%C3%A3os&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4223/creme-de-leite?qt=12&ftr=facetSubShelf_ss:4223_Creme%20de%20Leite&p=0&gt=list`,
  // Carnes
  `https://www.paodeacucar.com/secoes/C4226/bovinos?qt=12&ftr=facetSubShelf_ss:4226_Bovinos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4226/aves?qt=12&ftr=facetSubShelf_ss:4226_Bovinos__facetSubShelf_ss:4226_Aves&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4226/suinos?qt=12&ftr=facetSubShelf_ss:4226_Aves__facetSubShelf_ss:4226_Su%C3%ADnos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4226/secas-salgadas-ou-defumadas?qt=12&ftr=facetSubShelf_ss:4226_Secas,%20Salgadas%20ou%20Defumadas&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4226/carpaccio?qt=12&ftr=facetSubShelf_ss:4226_Secas,%20Salgadas%20ou%20Defumadas__facetSubShelf_ss:4226_Carpaccio&p=0&gt=list`,
  // Bêbes
  `https://www.paodeacucar.com/secoes/C4229/fraldas?qt=12&ftr=facetSubShelf_ss:4229_Fraldas__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/fraldas?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4229_Fraldas__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/fraldas?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4229_Fraldas__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/fraldas?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4229_Fraldas__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/fraldas?qt=12&ftr=currentPrice_normal_d:%255B100%20TO%20200%255D__facetSubShelf_ss:4229_Fraldas__currentPrice_normal_d:%5B200%20TO%20*%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/hora-do-banho?qt=12&ftr=facetSubShelf_ss:4229_Hora%20do%20Banho&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/outros-alimentos?qt=12&ftr=facetSubShelf_ss:4229_Hora%20do%20Banho__facetSubShelf_ss:4229_Outros%20Alimentos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/leite-e-formula-infantil?qt=12&ftr=facetSubShelf_ss:4229_Outros%20Alimentos__facetSubShelf_ss:4229_Leite%20e%20F%C3%B3rmula%20Infantil&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/papinha?qt=12&ftr=facetSubShelf_ss:4229_Leite%20e%20F%C3%B3rmula%20Infantil__facetSubShelf_ss:4229_Papinha&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/lencos-umedecidos?qt=12&ftr=facetSubShelf_ss:4229_Len%C3%A7os%20Umedecidos&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/higiene-bucal?qt=12&ftr=facetSubShelf_ss:4229_Higiene%20Bucal&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/passeio?qt=12&ftr=facetSubShelf_ss:4229_Passeio&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4229/acessorios-para-a-troca?qt=12&ftr=facetSubShelf_ss:4229_Acess%C3%B3rios%20para%20a%20troca&p=0&gt=list`,
  // Limpeza
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/casa-em-geral?qt=12&ftr=facetSubShelf_ss:4233_Casa%20em%20geral__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/casa-em-geral?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4233_Casa%20em%20geral__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/casa-em-geral?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4233_Casa%20em%20geral__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/casa-em-geral?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4233_Casa%20em%20geral__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/cozinha?qt=12&ftr=facetSubShelf_ss:4233_Cozinha__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/cozinha?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4233_Cozinha__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/cozinha?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4233_Cozinha__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/cozinha?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4233_Cozinha__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/desodorizador-e-aromatizantes?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4233_Desodorizador%20e%20Aromatizantes__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/utensilios-para-limpeza?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4233_Utens%25C3%25ADlios%20para%20limpeza__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/inseticidas?qt=12&ftr=facetSubShelf_ss:4233_Inseticidas&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/descartaveis?qt=12&ftr=facetSubShelf_ss:4233_Descart%C3%A1veis&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/alcool-e-removedor?qt=12&ftr=facetSubShelf_ss:4233_%C3%81lcool%20e%20removedor&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/cera-e-cia?qt=12&ftr=facetSubShelf_ss:4233_Cera%20e%20cia&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4233/lustra-moveis-e-cia?qt=12&ftr=facetSubShelf_ss:4233_Lustra%20m%C3%B3veis%20e%20cia&p=0&gt=list`,
  // Perfumaria
  `https://www.paodeacucar.com/secoes/C4231/cabelo?qt=12&ftr=facetSubShelf_ss:4231_Cabelo__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/cabelo?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4231_Cabelo__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/cabelo?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4231_Cabelo__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/cabelo?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4231_Cabelo__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/cabelo?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4231_Cabelo__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/sabonete?qt=12&ftr=facetSubShelf_ss:4231_Sabonete__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/sabonete?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4231_Sabonete__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/sabonete?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4231_Sabonete__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/higiene-bucal?qt=12&ftr=facetSubShelf_ss:4231_Higiene%20bucal__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/higiene-bucal?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4231_Higiene%20bucal__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/higiene-bucal?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4231_Higiene%20bucal__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/desodorantes?qt=12&ftr=facetSubShelf_ss:4231_Desodorantes__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/desodorantes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4231_Desodorantes__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/desodorantes?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4231_Desodorantes__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/desodorantes?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4231_Desodorantes__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/desodorantes?qt=12&ftr=currentPrice_normal_d:%255B50%20TO%20100%255D__facetSubShelf_ss:4231_Desodorantes__currentPrice_normal_d:%5B100%20TO%20200%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/absorventes-e-higiene-intima?qt=12&ftr=facetSubShelf_ss:4231_Absorventes%20e%20higiene%20%25C3%25ADntima__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/absorventes-e-higiene-intima?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4231_Absorventes%20e%20higiene%20%25C3%25ADntima__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/corpo?qt=12&ftr=facetSubShelf_ss:4231_Corpo&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/barba?qt=12&ftr=facetSubShelf_ss:4231_Barba&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/rosto?qt=12&ftr=facetSubShelf_ss:4231_Rosto&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/papel-higienico?qt=12&ftr=facetSubShelf_ss:4231_Papel%20higi%C3%AAnico&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/algodao-hastes-flexiveis-e-lencos?qt=12&ftr=facetSubShelf_ss:4231_Algod%C3%A3o,%20hastes%20flex%C3%ADveis%20e%20len%C3%A7os&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/fraldas-geriatricas?qt=12&ftr=facetSubShelf_ss:4231_Fraldas%20Geri%C3%A1tricas&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/maos-e-pes?qt=12&ftr=facetSubShelf_ss:4231_M%C3%A3os%20e%20p%C3%A9s&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4231/depilacao?qt=12&ftr=facetSubShelf_ss:4231_Depila%C3%A7%C3%A3o&p=0&gt=list`,
  // Matinais
  `https://www.paodeacucar.com/secoes/C4222/iogurtes?qt=12&ftr=facetSubShelf_ss:4222_Iogurtes__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/iogurtes?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Iogurtes__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/queijos-e-laticinios?qt=12&ftr=facetSubShelf_ss:4222_Queijos%20e%20Latic%25C3%25ADnios__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/queijos-e-laticinios?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Queijos%20e%20Latic%25C3%25ADnios__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/queijos-e-laticinios?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4222_Queijos%20e%20Latic%25C3%25ADnios__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/leite-e-achocolatado?qt=12&ftr=facetSubShelf_ss:4222_Leite%20e%20Achocolatado__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/leite-e-achocolatado?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Leite%20e%20Achocolatado__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/leite-e-achocolatado?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4222_Leite%20e%20Achocolatado__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/leite-e-achocolatado?qt=12&ftr=currentPrice_normal_d:%255B25%20TO%2050%255D__facetSubShelf_ss:4222_Leite%20e%20Achocolatado__currentPrice_normal_d:%5B50%20TO%20100%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/chas?qt=12&ftr=facetSubShelf_ss:4222_Ch%25C3%25A1s__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/chas?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Ch%25C3%25A1s__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/capsulas-de-cafes-e-chas?qt=12&ftr=facetSubShelf_ss:4222_C%25C3%25A1psulas%20de%20Caf%25C3%25A9s%20e%20Ch%25C3%25A1s__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/capsulas-de-cafes-e-chas?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4222_C%25C3%25A1psulas%20de%20Caf%25C3%25A9s%20e%20Ch%25C3%25A1s__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/sucos-e-refrescos?qt=12&ftr=facetSubShelf_ss:4222_Sucos%20e%20Refrescos__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/sucos-e-refrescos?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Sucos%20e%20Refrescos__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/manteigas-e-margarinas?qt=12&ftr=facetSubShelf_ss:4222_Manteigas%20e%20Margarinas__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/manteigas-e-margarinas?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Manteigas%20e%20Margarinas__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/manteigas-e-margarinas?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4222_Manteigas%20e%20Margarinas__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/cereais-e-granolas?qt=12&ftr=facetSubShelf_ss:4222_Cereais%20e%20Granolas__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/cereais-e-granolas?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Cereais%20e%20Granolas__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/cereais-e-granolas?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4222_Cereais%20e%20Granolas__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/frios?qt=12&ftr=facetSubShelf_ss:4222_Frios__currentPrice_normal_d:%5B0%20TO%2010%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/frios?qt=12&ftr=currentPrice_normal_d:%255B0%20TO%2010%255D__facetSubShelf_ss:4222_Frios__currentPrice_normal_d:%5B10%20TO%2025%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/frios?qt=12&ftr=currentPrice_normal_d:%255B10%20TO%2025%255D__facetSubShelf_ss:4222_Frios__currentPrice_normal_d:%5B25%20TO%2050%5D&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/geleias?qt=12&ftr=facetSubShelf_ss:4222_Geleias&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/sobremesas-lacteas-e-de-soja?qt=12&ftr=facetSubShelf_ss:4222_Sobremesas%20L%C3%A1cteas%20e%20de%20Soja&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/bebidas-lacteas-e-de-soja?qt=12&ftr=facetSubShelf_ss:4222_Bebidas%20L%C3%A1cteas%20e%20de%20Soja&p=0&gt=list`,
  `https://www.paodeacucar.com/secoes/C4222/pastas-e-cremes?qt=12&ftr=facetSubShelf_ss:4222_Pastas%20e%20Cremes&p=0&gt=list`,
];

infoArrayURL = url.length;

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


