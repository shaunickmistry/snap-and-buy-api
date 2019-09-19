const express = require('express');
const bodyParser = require("body-parser");
const visearch = require('visearch-javascript-sdk');
const rp = require('request-promise');
const router = express.Router();

/* Here we are configuring express to use body-parser as middle-ware. */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Set up keys
visearch.set('app_key', '890640f4b381cbcb3b5cafb0b179c097');

/* Test for individual image with Visense API. */
router.get('/image-search', function(req, response, next) {
  visearch.uploadsearch({
    im_url: "https://cdn-images.article.com/products/SKU2128/2890x1500/image46788.jpg?fit=max&w=2600&q=60&fm=webp",
  }, function(res) {
      /* Collect related SKUs from Visenze API call. */
      let SKUs = extractSKUs(res.result);

      /* Get product information from ElastiGraph. */
      getElastiInformation(SKUs)
          .then(function (parsedBody){
            response.send(extractProductData(parsedBody));
          });

  }, function(err){
      response.send("GET error")
  });
});

function extractSKUs(list) {
  let SKUs = [];
  list.forEach(function(item){
    SKUs.push(item.im_name);
  });
  return SKUs;
}

function getElastiInformation(SKUs) {
  let skuList = "";

  SKUs.forEach(function(sku){
    skuList += "\""+ sku + "\",";
  });

  const elastigraph_query = {
    query: "{  products(skus: [" + skuList + "], store: GB) { sku name price { current } details images { listingImage } } }"
  };

  console.log(elastigraph_query);

  let options = {
    method: "POST",
    uri: "https://es-elastigraph.made.com/graphql",
    body: elastigraph_query,
    json: true
  };

  return rp(options);
}

function extractProductData(productData) {
  console.log(productData);
  let matches = [];
  productData.data.products.forEach(function(product){
    matches.push({
      SKU: product.sku,
      description: product.name,
      image_url: product.images.listingImage,
      price: product.price.current,
      style: product.details.style,
      type: product.details.productType.value
    });
  });
  return {
    matches: matches
  };
}

/* Search for related products given an image. */
router.post('/image-search', function(request, response, next) {
  let image = req.body.image;
  visearch.uploadsearch({
      image: image,
      fl: ["im_url","price"]
  }, function(res) {
      /* Collect related SKUs from Visenze API call. */
      let SKUs = extractSKUs(res.result);

      /* Get product information from ElastiGraph. */
      getElastiInformation(SKUs)
          .then(function (parsedBody){
            response.send(extractProductData(parsedBody));
          });
  }, function(err){
      response.send("POST error")
  });
});

module.exports = router;
