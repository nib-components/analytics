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

    //get the parameters (excluding anything which evaluates to undefined]
    var p = [this.getMethod(method)];
    for (var i=0; i<params.length; ++i) {
      if (typeof params[i] !== 'undefined') {
        p.push(params[i]);
      }
    }
    
    //execute the method
    window.ga.apply(ga, p);
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
   * @param   {string}  data.category
   * @param   {string}  data.action
   * @param   {string}  [data.label]
   * @param   {string}  [data.value]
   * @return  {object}  self
   */
  trackEvent: function(data) {
    return this.exec('send', ['event', data.category, data.action, data.label, data.value]);
  }

};