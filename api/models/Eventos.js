/**
 * Eventos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    estado_call_id: {
      type: 'integer',
      required: true
    },

    estado_visible_id: {
      type: 'integer',
      required: true
    },

    eventos_auxiliares: {
      type: 'integer',
      required: true
    },

    cosapi_eventos: {
      type: 'integer',
      required: true
    },

    claro_eventos: {
      type: 'integer',
      required: true
    },

    estado_id: {
      type: 'integer',
      required: true
    },

    icon: {
      type: 'string',
      required: true
    },

    color: {
      type: 'string',
      required: true
    },

    detalle_evento: {
      collection: 'detalle_eventos',
      via: 'evento_id'
    },

    agent_onlines: {
      collection: 'agent_online',
      via: 'name_event'
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
