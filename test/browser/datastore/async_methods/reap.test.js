describe('DS#reap', function () {
  it('should query the server for a collection', function (done) {
    var _this = this;
    var Thing = store.defineResource({
      name: 'thing',
      maxAge: 30,
      reapInterval: 10,
      reapAction: 'eject'
    });

    var things = [{
      id: 1,
      foo: 'bar'
    }, {
      id: 2,
      foo: 'bar'
    }];

    Thing.findAll({ foo: 'bar' }).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify(things));

      assert.deepEqual(JSON.stringify(Thing.filter({ foo: 'bar' })), JSON.stringify(things), 'The things are now in the store');

      setTimeout(function () {
        // the items should have been ejected by now, and the query deleted
        assert.deepEqual(JSON.stringify(Thing.filter({ foo: 'bar' })), JSON.stringify([]), 'The things are gone');
        assert.isUndefined(store.store.thing.completedQueries[DSUtils.toJson({ foo: 'bar' })]);
        assert.isUndefined(store.store.thing.queryData[DSUtils.toJson({ foo: 'bar' })]);

        done();
      }, 90);
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/thing?foo=bar');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(things));
    }, 30);
  });
});
