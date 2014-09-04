/*global ga*/
/*
 * A wrapper for the Google Analytics script
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/events
 */
module.exports = {

  /**
   * The tracker name
   * @type  {string}
   */
  tracker: undefined,

  /**
   * The queued methods waiting for the `ga` function to be available for execution
   * @type  {string}
   */
  queuedMethods: [],

  /**
   * Set the current tracker
   *
   * @param   {string}  name                      The tracker name
   * @return  {object}  self
   */
  setTracker: function(name) {
    this.tracker = name;
    return this;
  },

  /**
   * Appends the tracker name to the method
   *
   * @param  {string} method                      The method name
   * @return {string}
   */
  getMethod: function(method) {
    if (this.tracker) {
      method = this.tracker+'.'+method;
    }
    return method;
  },

  /**
   * Executes a method on the analytics object
   *
   * @param   {string}   method                   The method name, eg. create, get, set, send
   * @param   {Array}    params                   The method parameters
   * @return  {object}   self
   */
  exec: function(method, params) {
    var self = this;

    //get the parameters (excluding anything which evaluates to undefined]
    var p = [this.getMethod(method)];
    for (var i=0; i<params.length; ++i) {
      if (typeof params[i] !== 'undefined') {
        p.push(params[i]);
      }
    }

    //check if the GA script has loaded
    if (window.hasOwnProperty('ga')) {

      //execute the GA event
      window.ga.apply(window.ga, p);

    } else {

      //FIXME: added a queue because we load analytics at the bottom of the body via GTM

      //queue the GA event
      this.queuedMethods.unshift(p);

      //start checking whether we can process the queue
      if (!this.queuedMethodsInterval) {
        this.queuedMethodsInterval = setInterval(function() {
          if (window.hasOwnProperty('ga')) {

            //stop trying to process the queue
            clearInterval(self.queuedMethodsInterval);
            delete self.queuedMethodsInterval;

            //execute the queued methods
            while (self.queuedMethods.length > 0) {
              window.ga.apply(window.ga, self.queuedMethods.pop());
            }

          }
        }, 100);
      }

    }

    return this;
  },

  /**
   * Sends data to the analytics object
   *
   * @param   {string}   type                     The data type, eg. pageView, event
   * @param   {Array}    data                     The data
   * @return  {object}   self
   */
  send: function(type, data) {
    return this.exec('send', ['event'].concat(data));
  },

  /**
   * Tracks a custom event. Used for tracking page events like clicking on a tab or interacting with the UI.
   *
   * @param   {object}  data                      The event data
   * @param   {string}  data.category             The event category
   * @param   {string}  data.action               The event action
   * @param   {string}  [data.label]              The event label
   * @param   {string}  [data.value]              The event value
   * @param   {string}  [data.noninteraction]     Whether the event is counted towards the bounce rate
   * @return  {object}  self
   */
  trackEvent: function(data) {

    var noninteraction;
    if (data.noninteraction) {
      noninteraction = {'nonInteraction': 1}
    }

    return this.exec('send', ['event', data.category, data.action, data.label, data.value, noninteraction]);
  }

};