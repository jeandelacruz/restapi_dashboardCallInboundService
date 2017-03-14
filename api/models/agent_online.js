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
      type: 'string',
      defaultsTo: ''
    },

    phone_number_inbound: {
      type: 'string',
      defaultsTo: ''
    },

    star_call_inbound: {
      type: 'string',
      defaultsTo: ''
    },

    total_calls: {
      type: 'string',
      defaultsTo: ''
    },

    name_queue: {
      type: 'string',
      defaultsTo: ''
    },

    status_pause: {
      type: 'string',
      defaultsTo: ''
    },

    penalty_agent: {
      type: 'string',
      defaultsTo: ''
    },

    ringinuse_agent: {
      type: 'string',
      defaultsTo: ''
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}

