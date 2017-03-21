/**
 * Queues.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string'
    },

    vdn: {
      type: 'string'
    },

    queues_strategy_id: {
    	type: 'integer'
    },

    queues_priority_id: {
    	type: 'integer'
    },

    estado_id: {
    	type: 'integer'
    },

    detalle_evento: {
      collection: 'detalle_eventos',
      via: 'id'
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
