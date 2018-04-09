const router = require('express').Router();
const request = require('request-promise');
const Promise = require('bluebird');
const _ = require('lodash');


router.get('/store', (req, res) => Promise.try(() => mergeRequests()).tap(result => res.json(result)));

router.get('/store/:item', (req, res) => Promise.try(() => mergeRequests())
    .then(result => result.find(obj => obj.name === req.params.item))
    .tap(result => {
        if (!result) throw {message: `${req.params.item} - not found`};
        return res.json(result);
    })
    .catch(err => res.json(err)));

function wrappedRequest(url) {
    return request({
        url: url,
        json: true
    }).then(body => body);
}

let mergeRequests = Promise.method(() => {
    let result = [];
    return wrappedRequest("http://autumn-resonance-1298.getsandbox.com/inventory").then(inventory => {
        result = inventory;
        return wrappedRequest("http://autumn-resonance-1298.getsandbox.com/products")
    }).then(products => {
        return result.inventory.map(obj => _.merge(obj, products.find(prod => prod.name === obj.name)));
    })
});

module.exports = router;