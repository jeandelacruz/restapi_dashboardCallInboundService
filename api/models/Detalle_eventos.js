/**
 * Detalle_eventos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    evento_id: {
      type: 'string',
      required: true
    },

    user_id: {
      type: 'string',
      required: true
    },

    fecha_evento: {
      type: 'datetime',
      required: true
    },

    ip_cliente: {
      type: 'string',
      required: true,
      defaultsTo: ''
    },

    observaciones: {
      type: 'string',
      defaultsTo: ''
    },

    date_really: {
      type: 'datetime',
      required: true
    },

    anexo: {
      type: 'string',
      required: true,
      defaultsTo: ''
    }

  },

  eventos: {
    model: 'eventos'
  },

  users: {
    model: 'users'
  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
