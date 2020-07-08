fs = require('fs');
var parser = require('xml2json');

fs.readFile( './files/col-us-catalog.xml', function(err, data) {
  var json = JSON.parse(parser.toJson(data, {reversible: true}));
  print(json);

  var urls = json["urlset"]["url"];
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

});