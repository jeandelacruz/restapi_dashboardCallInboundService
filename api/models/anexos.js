/**
 * anexos.js
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

    user_id: {
      type: 'integer',
      required: true
    },

    estado_id: {
      type: 'string',
      required: true
    }

  },

  users: {
    model: 'users'
  },

  autoCreatedAt: false,
  autoUpdatedAt: false
}
