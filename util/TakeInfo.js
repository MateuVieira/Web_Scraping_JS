module.exports = {
  takeInfoProduct: async function takeInfoProduct(page, i, data, index) {
    const [nameProduct, imgProduct, oldPriceProduct, newPriceProduct, priceProduct, priceByProduct, priceProductWithDiscont, priceDiscont, priceDisabled] = await Promise.all([
      this.takeName(page, i),
      this.takeImgUrl(page, i),
      this.takeOldPrice(page, i),
      this.takeNewPrice(page, i),
      this.takePrice(page, i),
      this.takePriceByProduct(page, i),
      this.takePriceProductWithDiscont(page, i),
      this.takeDiscontProduct(page, i),
      this.takeDisabledProduct(page, i),
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
  },

  // Função para a extração do nome do Produto
  takeName: async function takeName(page, i) {
    const [productName] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//p
    `);
    const name = await productName.getProperty('textContent');
    const nameRawText = await name.jsonValue();
    const nameText = String(nameRawText).trim();
    let nameProduct = nameText ? nameText : 'erro';
    return nameProduct;
  },

  // Função para a extração do da url do Produto
  takeImgUrl: async function takeImgUrl(page, i) {
    const [productImgURL] = await page.$x(`
    //*[@id="product-list"]//div//div[3]//div[2]//div//div//div[2]//infinite-scroll//div[${i}]//product-card//div//div//div//div[6]//div//div[1]//a//div[1]//img
    `);
    const img = await productImgURL.getProperty('src');
    const imgRawText = await img.jsonValue();
    const img_url = String(imgRawText).trim();
    let imgProduct = img_url ? img_url : 'erro';
    return imgProduct;
  },

  // Função para a extração do preço antigo do Produto
  takeOldPrice: async function takeOldPrice(page, i) {
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
  },

  // Função para a extração do novo preço do Produto
  takeNewPrice: async function takeNewPrice(page, i) {
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
  },

  // Função para a extração do preço do Produto
  takePrice: async function takePrice(page, i) {
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
  },

  // Função para a extração do preço por Produto
  takePriceByProduct: async function takePriceByProduct(page, i) {
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
  },

  // Função para a extração do preço do Produto com desconto
  takePriceProductWithDiscont: async function takePriceProductWithDiscont(page, i) {
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
  },

  // Função para a extração do valor do desconto
  takeDiscontProduct: async function takeDiscontProduct(page, i) {
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
  },

  // Função para a extração se o produto está disponivel
  takeDisabledProduct: async function takeDisabledProduct(page, i) {
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
  },

  takeIndex: async function takeIndex(page) {

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
  },

  printTakeIndexPage: async function printTakeIndexPage(page) {

    const productsName = await this.takeIndex(page);
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
  },
}