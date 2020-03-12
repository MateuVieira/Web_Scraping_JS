import fs from 'fs';
import path from 'path';

import { fileNameProducts } from './url/data_url';

let data = {};

function readFile() {

  const filesData = fileNameProducts.map(file => {
    const pathFile = path.join(__dirname, 'Data', file);

    // const [name] = file.split('.');

    let rawdata = fs.readFileSync(pathFile);
    let { info, data_products } = JSON.parse(rawdata);
    // console.log(data);

    const name = info.from;
    let objData = {};
    objData[name] = {
      vinho: {
        tinto: [],
        branco: [],
        rose: [],
        undefined: [],
      },
      champagne: [],
      espumante: [],
      suco: {
        uva: [],
        tangerina: [],
        maca: [],
        laranja: [],
        maracuja: [],
        vermelho: [],
        verde: [],
        pessego: [],
        goiaba: [],
        manga: [],
        morango: [],
        caju: [],
        abacaxi: [],
        banana: [],
        limao: [],
        undefined: [],
      },
      refresco: [],
      nectar: [],
      isotonico: [],
      hidrotonico: [],
      agua: [],
      energetico: [],
      whisky: [],
      vodka: [],
      gin: [],
      conhaque: [],
      cachaca: [],
      licor: [],
      coquetel: [],
      tequila: [],
      catuaba: [],
      rum: [],
      vermouth: [],
      aperitivo: [],
      saque: [],
      cerveja: [],
      xarope: [],
      organica: [],
      refrigerante: [],
      cha: [],
      cafe: [],
      kit: [],
      undefined: [],
    };

    data = Object.assign(data, objData);

    return [name, data_products];
  });

  return filesData;
}

async function saveJSON() {
  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('./Data/Data_Products_Categorized.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
    if (err) console.log('error', err);
  });
}


function categorizeProduct(item, market) {
  const nameSplited = item.name.toLowerCase().split(" ");
  // console.log('Teste split name -> ', nameSplit);

  if (nameSplited.includes('vinho')) {
    categorizeProductWine(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('kit')) {
    categorizeProductKit(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('cerveja')) {
    categorizeProductBeer(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('vodka')) {
    categorizeProductVodka(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('licor')) {
    categorizeProductLicor(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('gin')) {
    categorizeProductGin(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('coquetel')) {
    categorizeProductCoquetel(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('conhaque')) {
    categorizeProductConhaque(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('aperitivo')) {
    categorizeProductAperitivo(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('catuaba')) {
    categorizeProductCatuaba(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('tequila')) {
    categorizeProductTequila(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('vermouth')) {
    categorizeProductVermouth(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('rum')) {
    categorizeProductRum(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('saquê') || nameSplited.includes('sakê') ||
    nameSplited.includes('saque')) {
    categorizeProductSaque(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('cachaça') || nameSplited.includes('aguardente')) {
    categorizeProductCachaca(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('xarope')) {
    categorizeProductSyrup(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('espumante') || nameSplited.includes('sidra')) {
    categorizeProductSparklingWine(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('champagne')) {
    categorizeProductChampagne(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('suco')) {
    categorizeProductJuice(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('néctar') || nameSplited.includes('nectar')) {
    categorizeProductNectar(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('isotônico')) {
    categorizeProductIsotonic(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('hidrotônico')) {
    categorizeProductHydrotonic(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('água')) {
    categorizeProductWater(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('refresco')) {
    categorizeProductRefreshment(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('refrigerante') ||
    nameSplited.includes('coca-cola') ||
    nameSplited.includes('fanta') ||
    nameSplited.includes('sprite')) {
    categorizeProductrefrigerant(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('whisky') || nameSplited.includes('whiskey')) {
    categorizeProductWhisky(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('energético') || nameSplited.includes('energética')) {
    categorizeProductEnergetic(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('orgânica')) {
    categorizeProductOrganic(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('chá') || nameSplited.includes('matte') ||
    nameSplited.includes('tea')) {
    categorizeProductTea(nameSplited, item, market);
    return;
  }

  if (nameSplited.includes('café')) {
    categorizeProductCoffe(nameSplited, item, market);
    return;
  }

  // console.log('Teste name split -> ', nameSplited);
  data[`${market}`].undefined.push(item);
}

function categorizeProductCoffe(nameSplited, item, market) {
  data[`${market}`].cafe.push(item);
}

function categorizeProductTea(nameSplited, item, market) {
  data[`${market}`].cha.push(item);
}

function categorizeProductCoquetel(nameSplited, item, market) {
  data[`${market}`].coquetel.push(item);
}

function categorizeProductAperitivo(nameSplited, item, market) {
  data[`${market}`].aperitivo.push(item);
}

function categorizeProductVermouth(nameSplited, item, market) {
  data[`${market}`].vermouth.push(item);
}

function categorizeProductCatuaba(nameSplited, item, market) {
  data[`${market}`].catuaba.push(item);
}

function categorizeProductTequila(nameSplited, item, market) {
  data[`${market}`].tequila.push(item);
}

function categorizeProductRum(nameSplited, item, market) {
  data[`${market}`].rum.push(item);
}

function categorizeProductLicor(nameSplited, item, market) {
  data[`${market}`].licor.push(item);
}

function categorizeProductCachaca(nameSplited, item, market) {
  data[`${market}`].cachaca.push(item);
}

function categorizeProductSaque(nameSplited, item, market) {
  data[`${market}`].saque.push(item);
}

function categorizeProductGin(nameSplited, item, market) {
  data[`${market}`].gin.push(item);
}

function categorizeProductSyrup(nameSplited, item, market) {
  data[`${market}`].xarope.push(item);
}

function categorizeProductVodka(nameSplited, item, market) {
  data[`${market}`].vodka.push(item);
}

function categorizeProductrefrigerant(nameSplited, item, market) {
  data[`${market}`].refrigerante.push(item);
}

function categorizeProductOrganic(nameSplited, item, market) {
  data[`${market}`].organica.push(item);
}

function categorizeProductNectar(nameSplited, item, market) {
  data[`${market}`].nectar.push(item);
}

function categorizeProductBeer(nameSplited, item, market) {
  data[`${market}`].cerveja.push(item);
}

function categorizeProductWhisky(nameSplited, item, market) {
  data[`${market}`].whisky.push(item);
}

function categorizeProductRefreshment(nameSplited, item, market) {
  data[`${market}`].refresco.push(item);
}

function categorizeProductKit(nameSplited, item, market) {

  data[`${market}`].kit.push(item);
}

function categorizeProductChampagne(nameSplited, item, market) {
  data[`${market}`].champagne.push(item);
}

function categorizeProductSparklingWine(nameSplited, item, market) {
  data[`${market}`].espumante.push(item);
}

function categorizeProductIsotonic(nameSplited, item, market) {
  data[`${market}`].isotonico.push(item);
}

function categorizeProductHydrotonic(nameSplited, item, market) {
  data[`${market}`].hidrotonico.push(item);
}

function categorizeProductWater(nameSplited, item, market) {
  data[`${market}`].agua.push(item);
}

function categorizeProductEnergetic(nameSplited, item, market) {
  data[`${market}`].energetico.push(item);
}

function categorizeProductConhaque(nameSplited, item, market) {
  data[`${market}`].conhaque.push(item);
}

function categorizeProductJuice(nameSplited, item, market) {
  if (nameSplited.includes('uva')) {
    data[`${market}`].suco.uva.push(item);
    return;
  }

  if (nameSplited.includes('tangerina')) {
    data[`${market}`].suco.tangerina.push(item);
    return;
  }

  if (nameSplited.includes('maçã') || nameSplited.includes('maça')
    || nameSplited.includes('maca')) {
    data[`${market}`].suco.maca.push(item);
    return;
  }

  if (nameSplited.includes('laranja')) {
    data[`${market}`].suco.laranja.push(item);
    return;
  }

  if (nameSplited.includes('maracujá')) {
    data[`${market}`].suco.maracuja.push(item);
    return;
  }

  if (nameSplited.includes('pêssego') || nameSplited.includes('pessêgo')) {
    data[`${market}`].suco.pessego.push(item);
    return;
  }

  if (nameSplited.includes('goiaba')) {
    data[`${market}`].suco.goiaba.push(item);
    return;
  }

  if (nameSplited.includes('manga')) {
    data[`${market}`].suco.manga.push(item);
    return;
  }

  if (nameSplited.includes('morango')) {
    data[`${market}`].suco.morango.push(item);
    return;
  }

  if (nameSplited.includes('caju')) {
    data[`${market}`].suco.caju.push(item);
    return;
  }

  if (nameSplited.includes('banana')) {
    data[`${market}`].suco.banana.push(item);
    return;
  }

  if (nameSplited.includes('abacaxi')) {
    data[`${market}`].suco.abacaxi.push(item);
    return;
  }

  if (nameSplited.includes('limão') || nameSplited.includes('limao') ||
    nameSplited.includes('limonada')) {
    data[`${market}`].suco.limao.push(item);
    return;
  }


  if (nameSplited.includes('vermelho')) {
    data[`${market}`].suco.vermelho.push(item);
    return;
  }

  if (nameSplited.includes('verde')) {
    data[`${market}`].suco.verde.push(item);
    return;
  }

  data[`${market}`].suco.undefined.push(item);
}

function categorizeProductWine(nameSplited, item, market) {
  if (nameSplited.includes('tinto')) {
    data[`${market}`].vinho.tinto.push(item);
    return;
  }

  if (nameSplited.includes('branco')) {
    data[`${market}`].vinho.branco.push(item);
    return;
  }

  if (nameSplited.includes('rose') || nameSplited.includes('rosé')) {
    data[`${market}`].vinho.rose.push(item);
    return;
  }

  if (nameSplited.includes('espumante')) {
    data[`${market}`].espumante.push(item);
    return;
  }

  data[`${market}`].vinho.undefined.push(item);
}


function printData() {
  const dataKeys = Object.keys(data);
  dataKeys.map(key => {
    if (data[`${key}`].length) {
      console.log(`Categoria - ${key} -> tamanho: ${data[`${key}`].length}`);
      return;
    }
    const dataKeysItem = Object.keys(data[`${key}`]);
    console.log(`Categoria - ${key}:`);
    dataKeysItem.map(itemkey => console.log(`|-> ${itemkey} -> tamanho: ${data[`${key}`][`${itemkey}`].length}`));
  });
}

///////////////////////////////////////////

const dataProducts = readFile();

dataProducts.map(market => market[1].map(
    item => categorizeProduct(item, market[0])
  ));

saveJSON();

// printData();
