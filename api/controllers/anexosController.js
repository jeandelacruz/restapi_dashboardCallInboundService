/**
 * anexosController
 *
 * @description :: Server-side logic for managing anexos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const users = require('./usersController')
const detalle_eventos = require('./detalle_eventosController')
const dateFormat = require('dateformat')

module.exports = {

  updateAnexo: function (req, res) {
    let anexo = req.param('number_annexed')
    let userId = req.param('user_id')
    anexos.find({ name: anexo })
      .then(data => {
        if (data.length === 0) {
          sails.log('updateAnexo: No se encuentra el anexo ' + anexo)
          Helper.responseMessage(res, 'error', 'No existe el anexo ' + anexo)
        } else if (data[0].user_id === 0) {
          anexos.update({ name: anexo }, { user_id: userId })
          .then(record => {
            sails.log('updateAnexo: Anexo ' + anexo + ' actualizado con exito con el usuario ' + userId)
            Helper.responseMessage(res, 'success', 'Anexo actualizado')
          })
          .catch(err => {
            sails.log('updateAnexo: Error al actualizar el anexo ' + anexo + ' con el usuario ' + userId)
            Helper.responseMessage(res, 'error', 'Error al actualizar anexo')
          })
        } else {
          users.search(userId)
          .then(data => {
            sails.log('updateAnexo: Anexo en uso por ' + data.primer_nombre + ' ' + data.segundo_nombre + ' ' + data.apellido_paterno + ' ' + data.apellido_materno)
            Helper.responseMessage(res, 'error', 'El Anexo ya se encuentra en uso por ' + data.primer_nombre + ' ' + data.segundo_nombre + ' ' + data.apellido_paterno + ' ' + data.apellido_materno)
          })
          .catch(err => {
            sails.log('updateAnexo: Error al buscar el usuario ' + userId)
            Helper.responseMessage(res, 'error', 'Error al buscar el usuario')
          })
        }
      })
      .catch(err => {
        sails.log('updateAnexo: Error al buscar el anexo ' + anexo)
        Helper.getError(err)
        .then(data => {
          let message = ''
          if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al buscar el anexo' }
          Helper.responseMessage(res, 'error', message)
        })
        .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
      })
  },

  liberarAnexo: function (req, res) {
    let anexo = req.param('number_annexed')
    let eventId = req.param('event_id')
    let userId = req.param('user_id')
    let eventName = req.param('event_name')
    let ipCliente = req.param('ip')
    let username = req.param('username')
    anexos.update({ user_id: userId }, { user_id: 0 })
      .then(data => {
        if (data.length === 0) {
          sails.log('liberarAnexo: No se encuentra el user_id : ' + userId)
          Helper.responseMessage(res, 'error', 'No cuentas con un anexo asignado')
        } else {
          if (anexo != undefined) {
            Helper.addremoveQueue(userId, username, anexo, true, 'QueueRemove')
            .then(data => {
              let flatAction = false
              data.forEach((array) => {
                if (array.Response === 'Success') flatAction = true
              })
              if (flatAction === false) {
                Helper.responseMessage(res, 'error', 'Al remover anexo de las colas del Asterisk', data)
              } else {
                Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), eventName, eventId)
                Helper.responseMessage(res, 'success', 'Se libero el anexo correctamente', data)
                detalle_eventos.create(eventId, userId, Helper.formatDate(new Date()), ipCliente, anexo)
                .then(data => { })
                .catch(err => { })
              }
            })
            .catch(err => {
              Helper.responseMessage(res, 'error', 'Al remover anexo de las colas del Asterisk')
            })
          } else {
            Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), eventName, eventId)
            sails.log('liberarAnexo: Se libero anexo con exito con el user_id : ' + userId)
            Helper.responseMessage(res, 'success', 'Se libero el anexo correctamente')
            detalle_eventos.create(eventId, userId, Helper.formatDate(new Date()), ipCliente, anexo)
            .then(data => { })
            .catch(err => { })
          }
        }
      })
      .catch(err => {
        sails.log('liberarAnexo: Error al liberar anexo con el user_id : ' + userId)
        Helper.getError(err)
        .then(data => {
          let message = ''
          if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al liberar anexo' }
          Helper.responseMessage(res, 'error', message)
        })
        .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
      })
  },

  Logout: function (req, res) {
    let eventID = req.param('event_id')
    let userID = req.param('user_id')
    let ipCliente = req.param('ip')
    let anexo = req.param('number_annexed')
    let fechaEvento = Helper.formatDate(new Date())
    anexos.update({ user_id: userID }, { user_id: 0 })
    .then(data => {
      detalle_eventos.create(eventID, userID, fechaEvento, ipCliente, anexo)
      .then(data => {
        sails.log('Logout: Se realizo la desconexion con exito - ' + userID)
        Helper.responseMessage(res, 'success', 'Desconectado con exito')
      })
      .catch(err => {
        sails.log('Logout: Error al registrar el evento')
        Helper.responseMessage(res, 'error', 'Error al registrar el evento')
      })
    })
    .catch(err => {
      sails.log('Logout: Error al liberar anexo con el user_id : ' + userID)
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al liberar anexo' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  update: function (userId) {
    return new Promise((resolve, reject) => {
      anexos.update({ user_id: userId }, { user_id: 0 })
      .then(data => {
        return resolve(data)
      })
      .catch(err => {
        return reject(err)
      })
    })
  },

  actionStatus: function (req, res) {
    let parametros = {
      Action: 'QueueStatus',
      Member: req.param('user_id')
    }
    Helper.actionsAmi(parametros)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.send(err)
    })
  }
}
