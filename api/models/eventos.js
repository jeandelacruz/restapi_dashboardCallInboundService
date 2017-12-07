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

    allowed_calls: {
      type: 'integer',
      required: false
    },

    status_hangup: {
      type: 'integer',
      required: false
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
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
