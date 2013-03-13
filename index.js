/*
 * Wrapper for the async Google Analytics script
 * https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApi_gaq
 */

var debug = require('debug')('GA');
window._gaq = window._gaq || [];

module.exports = {

  /**
   * The current tracker name
   * @type {String}
   */
  tracker: '',

  /**
   * Track a page hit. Optionally pass a URL.
   * @param {String} url Optional URL to track
   * @return {Object} self
   */
  trackPageView: function(url) {
    this.push('_trackPageview', _.toArray(arguments));
    return this;
  },

  /**
   * Track a custom event. Used for tracking page events like
   * clicking on a tab or interacting with the UI
   * @param  {Object} data Data to pass through to the event
   * @return {Object} self
   */
  trackEvent: function(data) {
    this.push('_trackEvent', [data.category, data.action, data.label, data.value, data.noninteraction]);
    return this;
  },

  /**
   * Push an array of data to the analytics object
   * @param  {String}   method   Analytics method name, eg. _trackPageView
   * @param  {Array}    data     Array of data
   * @return {Object}   self
   */
  push: function(method, data) {
    data = _.compact(data);
    method = this.getMethod(method);
    data.unshift(method);
    window._gaq.push(data);      
    debug(data);
    return this;
  },

  /**
   * Set the current tracker. This will be prepended
   * to method names when pushing data
   * @param {String} name 
   */
  setTracker: function(name) {
    this.tracker = name;
    return this;
  },

  /**
   * Get the full method name with the tracker name attached
   * @param  {String} method
   * @return {String} Method for the current tracker
   */
  getMethod: function(method) {
    return this.tracker + method;
  },

  /**
   * Get the current account number
   * @param  {Function} callback
   * @return {Object} self
   */
  getAccount: function(callback) {
    var self = this;
    this.push(function() {
      var account = window._gat._getTrackerByName()._getAccount();
      callback.call(self, account);
    });
    return this;
  },

  /**
   * Get the current tracker object. Only a callback
   * is passed in the current tracker will be used.
   * @param {String} name tracker name.
   * @param  {Function} callback
   * @return {Object} self
   */
  getTracker: function(name, callback) {
    var self = this;

    if( arguments.length === 1 ) {
      callback = name;
      name = this.tracker;
    }

    this.push(function() {
      var tracker = window._gat._getTrackerByName(name);
      callback.call(self, tracker);
    });

    return this;
  },

  /**
   * Set the account used for the analytics tracking 
   * @param {String} id Google analytics ID
   * @return {Object} self
   */
  setAccount: function(id){
    this.push('_setAccount', [id]);
    return this;
  },

  /**
   * Set a custom variable. There are 5 available slots, the index represents
   * which slot to use. The scope determines for how long to store the data. 
   * Possible values are 1 for visitor-level, 2 for session-level, and 3 for page-level.
   * @param {Object} data
   * @return {Object} self
   */
  set: function(data){
    this.push('_setCustomVar', [data.index, data.name, data.value, data.scope]);
    return this;
  },

  /**
   * Unset a variable in one of the slots
   * @param  {Number|String} index Variable slot
   * @return {Object} self
   */
  unset: function(index) {
    this.push(['_deleteCustomVar', index]);
    return this;
  },

  /**
   * Get a variable in one of the slots
   * @param  {Number}   index    Variable slot number
   * @param  {Function} callback 
   * @return {Object} self
   */
  get: function(index, callback) {
    var self = this;
    this.push(function() {
      var pageTracker = _gat._getTrackerByName();
      var val = pageTracker._getVisitorCustomVar(index);
      callback.call(self, val);
    });
    return this;
  }

};