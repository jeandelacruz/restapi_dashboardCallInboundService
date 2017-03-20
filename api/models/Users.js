/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    primer_nombre: {
      type: 'string',
      require: true
    },

    segundo_nombre: {
      type: 'string',
      require: true
    },

    apellido_paterno: {
      type: 'string',
      require: true
    },

    apellido_materno: {
      type: 'string',
      require: true
    },

    username: {
      type: 'string',
      require: true
    },

    agente_id: {
      type: 'integer',
      require: true
    },

    email: {
      type: 'string',
      require: true
    },

    password: {
      type: 'string',
      require: true
    },

    role: {
      type: 'string'
    },

    remember_token: {
      type: 'string',
      require: true
    },

    estado_id: {
      type: 'integer',
      require: true
    },

    anexo: {
      collection: 'anexos',
      via: 'user_id'
    },

    detalle_evento: {
      collection: 'detalle_eventos',
      via: 'user_id'
    }

  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
