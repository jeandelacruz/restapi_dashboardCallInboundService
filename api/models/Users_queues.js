/**
 * Users_queues.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    user_id: {
      type: 'integer',
      required: true
    },

    queue_id: {
      type: 'integer',
      required: true
    },

    priority: {
      type: 'string',
      required: true
    },

    detalle_evento: {
      collection: 'detalle_eventos',
      via: 'user_id'
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
