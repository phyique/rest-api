const router = require('express').Router();
const request = require('request-promise');
const Promise = require('bluebird');
const _ = require('lodash');


router.get('/store', function (req, res) {
    return Promise.try(() => mergeRequests()).tap(result => res.json(result))
});

router.get('/store/:item', function (req, res) {
    return Promise.try(() => mergeRequests())
        .then(result => result.find(obj => obj.name === req.params.item))
        .tap(result => res.json(result))
});

function wrappedRequest(url) {
    return request({
        url: url,
        json: true
    }).then(body => body);
}

let mergeRequests = Promise.method(function () {
    let result = [];
    return wrappedRequest("http://autumn-resonance-1298.getsandbox.com/inventory").then(inventory => {
        result = inventory;
        return wrappedRequest("http://autumn-resonance-1298.getsandbox.com/products")
    }).then(products => {
        return result.inventory.map(obj => _.merge(obj, products.find(prod => prod.name === obj.name)));
    })
});


module.exports = router;