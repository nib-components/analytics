var assert      = require('assert');
var analytics   = require('analytics');

describe('analytics', function() {

  describe('queue', function() {

    beforeEach(function() {
      if (window.hasOwnProperty('ga')) delete window.ga;
    });

    it ('should not queue up methods when ga() IS defined and should not be checking', function() {

      assert.equal(0, analytics.queuedMethods.length);

      window.ga = function() {
        assert.equal('send', arguments[0]);
        assert.equal('event', arguments[1]);
        assert.equal('Test', arguments[2]);
        assert.equal('click', arguments[3]);
        assert.equal('Button #1', arguments[4]);
      };

      analytics.trackEvent({
        category: 'Test',
        action:   'click',
        label:    'Button #1'
      });

      assert.equal(0, analytics.queuedMethods.length);

      window.ga = function() {
        assert.equal('send', arguments[0]);
        assert.equal('event', arguments[1]);
        assert.equal('Test', arguments[2]);
        assert.equal('click', arguments[3]);
        assert.equal('Button #2', arguments[4]);
      };

      analytics.trackEvent({
        category: 'Test',
        action:   'click',
        label:    'Button #2'
      });

      assert.equal(0, analytics.queuedMethods.length);
      assert.equal(undefined, analytics.queuedMethodsTimeout);
      assert.equal(undefined, analytics.queuedMethodsTimeoutTime);

    });

    it ('should queue up methods when ga() IS NOT defined, should be checking if it is defined and send them when it is and stop checking', function(done) {
      assert.equal(0, analytics.queuedMethods.length);

      analytics.trackEvent({
        category: 'Test',
        action:   'click',
        label:    'Button #1'
      });

      analytics.trackEvent({
        category: 'Test',
        action:   'click',
        label:    'Button #2'
      });

      assert.equal(2, analytics.queuedMethods.length);
      assert.notEqual(undefined, analytics.queuedMethodsTimeout);
      assert.notEqual(undefined, analytics.queuedMethodsTimeoutTime);

      var count = 0;
      window.ga = function() {

        assert.equal('send', arguments[0]);
        assert.equal('event', arguments[1]);
        assert.equal('Test', arguments[2]);
        assert.equal('click', arguments[3]);
        assert.equal('Button #'+(++count), arguments[4]);

      };

      //give the interval time to finish
      setTimeout(function() {
        assert.equal(undefined, analytics.queuedMethodsTimeout);
        assert.equal(undefined, analytics.queuedMethodsTimeoutTime);
        done();
      }, analytics.queuedMethodsTimeoutTime);

    });

  });

});