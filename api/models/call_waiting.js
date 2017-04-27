/**
 * call_waiting.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    number_phone: {
      type: 'string'
    },

    name_number: {
      type: 'string'
    },

    name_queue: {
      type: 'string'
    },

    start_call: {
      type: 'string'
    },

    number_annexed: {
      type: 'string'
    },

    name_agent: {
      type: 'string'
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
