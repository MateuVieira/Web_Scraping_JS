import puppeteer from 'puppeteer';

async function scrapeProductTest(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  const [elName] = await page.$x(`
  //*[@id="content"]//div//div//div[1]//div[3]//div[1]//div[1]//h1
  `);
  const name = await elName.getProperty('textContent');
  const nameRawText = await name.jsonValue();
  const nameText = String(nameRawText).trim();

  const [elImg] = await page.$x(`
  //*[@id="content"]//div//div//div[1]//div[2]//div//zoom//div[1]//img
  `);
  const img = await elImg.getProperty('src');
  const imgRawURL = await img.jsonValue();
  const imgURL = String(imgRawURL).trim();

  const [elCode] = await page.$x(`
  //*[@id="content"]//div//div//div[1]//div[3]//div[1]//div[1]//small
  `);
  const code = await elCode.getProperty('textContent');
  const codeRawText = await code.jsonValue();
  const codeText = String(codeRawText).trim();

  const [elPrice] = await page.$x(`
  //*[@id="content"]//div//div//div[1]//div[3]//div[3]//div//div[1]//div[1]//div//p
  `);
  const price = await elPrice.getProperty('textContent');
  const priceRawText = await price.jsonValue();
  const priceText = String(priceRawText).trim();

  console.log(
    `\n_______ Produto ______\nname: ${nameText} \nimage_URL: ${imgURL} \nproduct_code: ${codeText} \nprice: ${priceText}`
  );

  await browser.close();
}

async function scrapeProduct(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  const aHandleName = await page.evaluateHandle(() => document.body.querySelector('.title-product'));
  const resultHandleName = await page.evaluateHandle(body => body.innerHTML, aHandleName);
  const name = await resultHandleName.jsonValue();
  await resultHandleName.dispose();

  const aHandleCod = await page.evaluateHandle(() => document.body.querySelector('.sku'));
  const resultHandleCod = await page.evaluateHandle(body => body.innerHTML, aHandleCod);
  const code = await resultHandleCod.jsonValue();
  await resultHandleCod.dispose();

  const aHandlePrice = await page.evaluateHandle(() => document.body.querySelector('.priceBig'));
  const resultHandlePrice = await page.evaluateHandle(body => body.innerHTML, aHandlePrice);
  const price = await resultHandlePrice.jsonValue();
  await resultHandlePrice.dispose();

  // const aHandleImg = await page.evaluateHandle(() => document.body.querySelector('div.col-sm-4.foto'));
  // const resultHandleImg = await page.evaluateHandle(body => body.innerHTML, aHandleImg);
  // const Img = await resultHandleImg.jsonValue();
  // console.log('Img_URL:', String(Img).split('"')[1]);
  // await resultHandleImg.dispose();

  await browser.close();

  return {
    name: String(name).trim(),
    code: String(code).trim().split('.')[1],
    price: String(price).trim(),
  };
}

const url = [
  `https://www.paodeacucar.com/produto/431613/vinho-italiano-tinto-elio-grasso-barolo-ginestra-vigna-casa-mate-garrafa-750ml`,
  `https://www.paodeacucar.com/produto/431345/vinho-alemao-branco-schloss-johannisberg-er-riersling-trocken-garrafa-750ml`,
]

url.forEach(item => scrapeProductTest(item));

// scrapeProductTest(url[0]);

