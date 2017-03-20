/**
 * Agent_online.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    number_annexed: {
      type: 'string',
      required: true
    },

    name_agent: {
      type: 'string',
      required: true
    },

    name_event: {
      type: 'string',
      required: true,
      defaultsTo: 'Login'
    },

    name_queue_inbound: {
      type: 'string'
    },

    phone_number_inbound: {
      type: 'string'
    },

    star_call_inbound: {
      type: 'string'
    },

    total_calls: {
      type: 'string'
    },

    name_queue: {
      type: 'string'
    },

    status_pause: {
      type: 'string'
    },

    penalty_agent: {
      type: 'string'
    },

    ringinuse_agent: {
      type: 'string'
    }

  },

  eventos: {
    model: 'eventos'
  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
