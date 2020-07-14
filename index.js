fs = require('fs');
const csv = require('csv-parse');
csv({ separator: '/t' });
var parser = require('xml2json');
const util = require('util');
const results = [];
const finalResults = [];

fs.createReadStream('./files/canonical_files/sor-us-canonical.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('finish', ()=>{
    fireIt(results);
  });


//////////////////////////////////////
//////////////////////////////////////
function getKeys(results){
  keys = [];
    for(i=0;i<results.length;i++){
      //console.log(results[i][0]);
      var thisKey = results[i][0];
      var keyTrimmed = thisKey.trim();
      keys.push(keyTrimmed);
    }
  return keys;
}
//////////////////////////////////////
function addToResults(results, categoryId, canonical){
  //console.log(canonical);
  for(i = 0; i < results.length; i++){
    results[i][0] = results[i][0].trim(); 
    var n = results[i][0].indexOf(categoryId); //find the category_id we're looking for
    
    if(n > -1 && results[i][0].length == categoryId.length ){
      var cIndex = results[i][1].indexOf(canonical);
      //console.log('testing ' + results[i][1] + ' ' + results[i][1].length + '  and ' + canonical + ' ' + canonical.length + ' for ' + cIndex);
      results[i].push(canonical);
      if(cIndex != 0 || results[i][1].length != canonical.length) {
      //}else{
        results[i].push('----DIFFERENT in X1----');
      }
    }
  }
  return results;
}
//////////////////////////////////////
function fireIt(results){
  var resultsNew = [];
  resKeys = getKeys(results);
  
  fs.readFile( './files/category_files/sor-us-7-9-20.xml', function(err, data) {
    var json = JSON.parse(parser.toJson(data, {reversible: true}));
    var cats = json['catalog']['category'];
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i]['category-id'];
      var n = 0;

      n = keys.indexOf(cat);
      if(n >= 0){ 
        for(b = 0; b < cats[i]['custom-attributes']['custom-attribute'].length; b++){
          var testForOverride = cats[i]['custom-attributes']['custom-attribute'][b]['attribute-id'].indexOf('overrideCanonicalCategoryId');
          if(testForOverride > -1){
            resultsNew = addToResults(results, cats[i]['category-id'], cats[i]['custom-attributes']['custom-attribute'][b]['$t'])
          } //end if
        } //end for
      }
    }
    //console.log(resultsNew);
    //////////////////////////////
    const writeStream = fs.createWriteStream('./files/results_files/RESULTS.csv');
    const pathName = writeStream.path;

    // write each value of the array on the file breaking line
    resultsNew.forEach(value => writeStream.write(`${value}\n`));
    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {
      console.log(`wrote all the array data to file ${pathName}`);
    });
    // handle the errors on the write process
    writeStream.on('error', (err) => {
        console.error(`There is an error writing the file ${pathName} => ${err}`)
    });
    // close the stream
    writeStream.end();
    //////////////////////////////

  });
}
//////////////////////////////////////

//fs.readFile( './files/col-us-catalog.xml', function(err, data) {
  //var json = JSON.parse(parser.toJson(data, {reversible: true}));
  //console.log(json['catalog']['category']);

  /*var urls = json["urlset"]["url"];
  let urlArray = new Array(); 
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    let thisUrl = url.loc.$t;
    urlArray.push(thisUrl);
  }

const writeStream = fs.createWriteStream('URLs-product-sorel-uk.txt');
const pathName = writeStream.path;

// write each value of the array on the file breaking line
urlArray.forEach(value => writeStream.write(`${value}\n`));
// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
   console.log(`wrote all the array data to file ${pathName}`);
});
// handle the errors on the write process
writeStream.on('error', (err) => {
    console.error(`There is an error writing the file ${pathName} => ${err}`)
});
// close the stream
writeStream.end();
*/
//});