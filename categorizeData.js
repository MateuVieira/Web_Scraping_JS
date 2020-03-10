import fs from 'fs';
import path from 'path';    
    
  const data = {
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
  }

 function readFile() {
  const pathFile = path.join(__dirname, 'Data', 'Data_Products_bebidas.json');

  let rawdata = fs.readFileSync(pathFile);
  let data = JSON.parse(rawdata);
  // console.log(data);
  return data;
}

async function saveJSON() {
  const dataJSON = JSON.stringify(data, null, 4);

  fs.writeFile('./Data/Data_Products_Categorized.json', dataJSON, { encoding: 'utf8' }, function (err, result) {
    if (err) console.log('error', err);
  });
}


function categorizeProduct(item) {
  const nameSplited = item.name.toLowerCase().split(" ");
  // console.log('Teste split name -> ', nameSplit);

  if( nameSplited.includes('vinho')){
    categorizeProductWine(nameSplited, item);
    return;
  }

  if( nameSplited.includes('kit')){
    categorizeProductKit(nameSplited, item);
    return;
  }

  if( nameSplited.includes('cerveja')){
    categorizeProductBeer(nameSplited, item);
    return;
  }
  
  if( nameSplited.includes('vodka')){
    categorizeProductVodka(nameSplited, item);
    return;
  }

  if( nameSplited.includes('licor')){
    categorizeProductLicor(nameSplited, item);
    return;
  }

  if( nameSplited.includes('gin')){
    categorizeProductGin(nameSplited, item);
    return;
  }

  if( nameSplited.includes('coquetel')){
    categorizeProductCoquetel(nameSplited, item);
    return;
  }

  if( nameSplited.includes('aperitivo')){
    categorizeProductAperitivo(nameSplited, item);
    return;
  }

  if( nameSplited.includes('catuaba')){
    categorizeProductCatuaba(nameSplited, item);
    return;
  }

  if( nameSplited.includes('tequila')){
    categorizeProductTequila(nameSplited, item);
    return;
  }

  if( nameSplited.includes('vermouth')){
    categorizeProductVermouth(nameSplited, item);
    return;
  }

  if( nameSplited.includes('rum')){
    categorizeProductRum(nameSplited, item);
    return;
  }

  if( nameSplited.includes('saquê') || nameSplited.includes('sakê') || 
      nameSplited.includes('saque')){
    categorizeProductSaque(nameSplited, item);
    return;
  }

  if( nameSplited.includes('cachaça') || nameSplited.includes('aguardente')){
    categorizeProductCachaca(nameSplited, item);
    return;
  }

  if( nameSplited.includes('xarope')){
    categorizeProductSyrup(nameSplited, item);
    return;
  }

  if( nameSplited.includes('espumante')){
    categorizeProductSparklingWine(nameSplited, item);
    return;
  }
  
  if( nameSplited.includes('champagne')){
    categorizeProductChampagne(nameSplited, item);
    return;
  }

  if( nameSplited.includes('suco')){
    categorizeProductJuice(nameSplited, item);
    return;
  }

  if( nameSplited.includes('néctar') || nameSplited.includes('nectar')){
    categorizeProductNectar(nameSplited, item);
    return;
  }
  
  if( nameSplited.includes('isotônico')){
    categorizeProductIsotonic(nameSplited, item);
    return;
  }

  if( nameSplited.includes('hidrotônico')){
    categorizeProductHydrotonic(nameSplited, item);
    return;
  }

  if( nameSplited.includes('água')){
    categorizeProductWater(nameSplited, item);
    return;
  }
  
  if( nameSplited.includes('refresco')){
    categorizeProductRefreshment(nameSplited, item);
    return;
  }

  if( nameSplited.includes('refrigerante') || 
      nameSplited.includes('coca-cola') ||
      nameSplited.includes('fanta') || 
      nameSplited.includes('sprite')){
    categorizeProductrefrigerant(nameSplited, item);
    return;
  }
  
  if( nameSplited.includes('whisky') || nameSplited.includes('whiskey')){
    categorizeProductWhisky(nameSplited, item);
    return;
  }
  
  if(nameSplited.includes('energético') || nameSplited.includes('energética')){
    categorizeProductEnergetic(nameSplited, item);
    return;
  }

  if(nameSplited.includes('orgânica') ){
    categorizeProductOrganic(nameSplited, item);
    return;
  }

  if(nameSplited.includes('chá') || nameSplited.includes('matte') || 
     nameSplited.includes('tea')){
    categorizeProductTea(nameSplited, item);
    return;
  }

  if( nameSplited.includes('café')){
    categorizeProductCoffe(nameSplited, item);
    return;
  }


  console.log('Teste name split -> ', nameSplited);
  data.undefined.push(item);
}

function categorizeProductCoffe(nameSplited, item) {
  data.cafe.push(item);
}

function categorizeProductTea(nameSplited, item) {
  data.cha.push(item);
}

function categorizeProductCoquetel(nameSplited, item) {
  data.coquetel.push(item);
}

function categorizeProductAperitivo(nameSplited, item) {
  data.aperitivo.push(item);
}

function categorizeProductVermouth(nameSplited, item) {
  data.vermouth.push(item);
}

function categorizeProductCatuaba(nameSplited, item) {
  data.catuaba.push(item);
}

function categorizeProductTequila(nameSplited, item) {
  data.tequila.push(item);
}

function categorizeProductRum(nameSplited, item) {
  data.rum.push(item);
}

function categorizeProductLicor(nameSplited, item) {
  data.licor.push(item);
}

function categorizeProductCachaca(nameSplited, item) {
  data.cachaca.push(item);
}

function categorizeProductSaque(nameSplited, item) {
  data.saque.push(item);
}

function categorizeProductGin(nameSplited, item) {
  data.gin.push(item);
}

function categorizeProductSyrup(nameSplited, item) {
  data.xarope.push(item);
}

function categorizeProductVodka(nameSplited, item) {
  data.vodka.push(item);
}

function categorizeProductrefrigerant(nameSplited, item) {
  data.refrigerante.push(item);
}

function categorizeProductOrganic(nameSplited, item) {
  data.organica.push(item);
}

function categorizeProductNectar(nameSplited, item) {
  data.nectar.push(item);
}

function categorizeProductBeer(nameSplited, item) {
  data.cerveja.push(item);
}

function categorizeProductWhisky(nameSplited, item) {
  data.whisky.push(item);
}

function categorizeProductRefreshment(nameSplited, item) {
  data.refresco.push(item);
}

function categorizeProductKit(nameSplited, item) {

  data.kit.push(item);
}

function categorizeProductChampagne(nameSplited, item) {
  data.champagne.push(item);
}

function categorizeProductSparklingWine(nameSplited, item) {
  data.espumante.push(item);
}

function categorizeProductIsotonic(nameSplited, item) {
  data.isotonico.push(item);
}

function categorizeProductHydrotonic(nameSplited, item) {
  data.hidrotonico.push(item);
}

function categorizeProductWater(nameSplited, item) {
  data.agua.push(item);
}

function categorizeProductEnergetic(nameSplited, item) {
  data.energetico.push(item);
}

function categorizeProductJuice(nameSplited, item) {
  if( nameSplited.includes('uva')){
    data.suco.uva.push(item);
    return;
  }

  if( nameSplited.includes('tangerina')){
    data.suco.tangerina.push(item);
    return;
  }

  if( nameSplited.includes('maçã') || nameSplited.includes('maça') 
  || nameSplited.includes('maca')){
    data.suco.maca.push(item);
    return;
  }

  if( nameSplited.includes('laranja')){
    data.suco.laranja.push(item);
    return;
  }

  if( nameSplited.includes('maracujá')){
    data.suco.maracuja.push(item);
    return;
  }

  if( nameSplited.includes('pêssego') || nameSplited.includes('pessêgo')){
    data.suco.pessego.push(item);
    return;
  }

  if( nameSplited.includes('goiaba')){
    data.suco.goiaba.push(item);
    return;
  }

  if( nameSplited.includes('manga')){
    data.suco.manga.push(item);
    return;
  }

  if( nameSplited.includes('morango')){
    data.suco.morango.push(item);
    return;
  }

  if( nameSplited.includes('caju')){
    data.suco.caju.push(item);
    return;
  }

  if( nameSplited.includes('banana')){
    data.suco.banana.push(item);
    return;
  }

  if( nameSplited.includes('abacaxi')){
    data.suco.abacaxi.push(item);
    return;
  }

  if( nameSplited.includes('limão') || nameSplited.includes('limao') || 
  nameSplited.includes('limonada')){
    data.suco.limao.push(item);
    return;
  }


  if( nameSplited.includes('vermelho')){
    data.suco.vermelho.push(item);
    return;
  }

  if( nameSplited.includes('verde')){
    data.suco.verde.push(item);
    return;
  }

  data.suco.undefined.push(item);
}

function categorizeProductWine(nameSplited, item) {
  if( nameSplited.includes('tinto')){
    data.vinho.tinto.push(item);
    return;
  }

  if( nameSplited.includes('branco')){
    data.vinho.branco.push(item);
    return;
  }

  if( nameSplited.includes('rose') || nameSplited.includes('rosé') ){
    data.vinho.rose.push(item);
    return;
  }

  if( nameSplited.includes('espumante')){
    data.espumante.push(item);
    return;
  }

  data.vinho.undefined.push(item);
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

const { data_products } = readFile();


data_products.map(item => categorizeProduct(item));

saveJSON();

printData();
