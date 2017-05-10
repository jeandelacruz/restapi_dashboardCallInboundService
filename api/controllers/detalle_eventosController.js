/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const anexos = require('./anexosController')
const eventos = require('./eventosController')
const agentOnline = require('./agent_onlineController')

module.exports = {

  cambiarEstado: function (req, res) {
    let eventID = req.param('event_id')
    let userID = req.param('user_id')
    let ipCliente = req.param('ip')
    let anexo = req.param('number_annexed')
    let username = req.param('username')

    this.actionChangeStatusDashboard(eventID, anexo)
    .then(eventos => {
      Helper.addremoveQueue(userID, username, anexo, true, 'QueueAdd')
      .then(data => {
        let flatAction = false
        data.forEach((array) => {
          if (array.Response === 'Success') flatAction = true
          if (array.Response === 'NoNotification') flatAction = true
        })
        if (flatAction === false) {
          Helper.responseMessage(res, 'Error', 'Error al agregar al Asterisk', data)
        } else {
          Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), eventos.name, eventos.id)
          this.create(eventos.id, userID, Helper.formatDate(new Date()), ipCliente, anexo).then(data => { })
          Helper.responseMessage(res, 'success', 'Se agrego correctamente al Asterisk', data)
        }
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', err)
      })
    })
    .catch(err => {
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al buscar el evento' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  QueuePause: function (req, res) {
    let eventID = req.param('event_id')
    let userID = req.param('user_id')
    let ipCliente = req.param('ip')
    let anexo = req.param('number_annexed')

    this.actionChangeStatusDashboard(eventID, anexo)
    .then(eventos => {
      this.actionPause(eventos, anexo)
      .then(data => {
        let flatAction = false
        data.forEach((array) => {
          if (array.Response === 'Success') flatAction = true
          if (array.Response === 'NoNotification') flatAction = true
        })
        if (flatAction === false) {
          Helper.responseMessage(res, 'Error', 'Error al pausar al agente', data)
        } else {
          let msjPause = 'Pausado'
          if (eventos.estado_call_id === 1) {
            msjPause = 'Despausado'
          }
          Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), eventos.name, eventos.id)
          this.create(eventos.id, userID, Helper.formatDate(new Date()), ipCliente, anexo).then(data => { })
          Helper.responseMessage(res, 'success', msjPause + ' correctamente')
        }
      })
      .catch(err => {
        sails.log(err)
        Helper.responseMessage(res, 'error', err)
      })
    })
    .catch(err => {
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al buscar el evento' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  registrarDetalle: function (req, res) {
    let eventID = req.param('event_id')
    let userID = req.param('user_id')
    let ipCliente = req.param('ip')
    let anexo = req.param('number_annexed')
    this.actionChangeStatusDashboard(eventID, anexo)
    .then(eventos => {
      this.create(eventos.id, userID, Helper.formatDate(new Date()), ipCliente, anexo)
      .then(data => {
        Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), eventos.name, eventos.id)
        Helper.responseMessage(res, 'success', 'Evento Registrado Exitosamente')
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', 'Error al registrar el evento')
      })
    })
    .catch(err => {
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al buscar el evento' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  queueLogout: function (req, res) {
    let dateExit = req.param('hour_exit')
    let eventID = req.param('event_id')
    let userID = req.param('user_id')
    let ipCliente = req.param('ip')
    let anexo = req.param('number_annexed')
    let username = req.param('username')

    this.actionChangeStatusDashboard(eventID, anexo)
    .then(eventos => {
      Helper.addremoveQueue(userID, username, anexo, true, 'QueueRemove')
      .then(data => {
        let flatAction = false
        data.forEach((array) => {
          if (array.Response === 'Success') flatAction = true
        })
        if (flatAction === false) {
          Helper.responseMessage(res, 'Error', 'Error al desconectar del Asterisk', data)
        } else {
          Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), eventos.name, eventos.id)
          this.create(eventos.id, userID, dateExit, ipCliente, anexo)
          .then(data => { })
          .catch(err => { })
          Helper.responseMessage(res, 'Success', 'Se desconecto correctamente del Asterisk', data)
          anexos.update(userID)
          .then(data => { })
          .catch(err => { })
        }
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', 'Usuario no cuenta con colas')
      })
    })
    .catch(err => {
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Error al desconectarte' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  actionPause: function (data, anexo) {
    return new Promise((resolve, reject) => {
      let array = []
      let statusPause = 1
      if (data.estado_call_id === 1) {
        statusPause = 0
      }
      let parametros = {
        Action: 'QueuePause',
        Interface: 'SIP/' + anexo,
        Paused: statusPause
      }

      Helper.actionsAmi(parametros)
      .then(data => Helper.addToArray(data, array).then(function (data) { }))
      .catch(err => reject(err))

      setTimeout(function () {
        return resolve(array)
      }, 2000)
    })
  },

  actionChangeStatusDashboard: function (eventID, anexo) {
    return new Promise((resolve, reject) => {
      eventos.search(eventID)
      .then(eventos => {
        agentOnline.updateFrontEnd(anexo, eventos.name, eventos.id)
        .then(data => resolve(eventos))
        .catch(err => reject(err))
      })
      .catch(err => reject(err))
    })
  },

  getstatus: function (req, res) {
    console.log(sails.sockets.getId(req))

    if (!req.param('user_id')) Helper.responseMessage(res, 'error', 'Parameters incompleted')

    // Declaracion de variables
    let query = {
      select: ['evento_id'],
      where: {user_id: req.param('user_id')},
      sort: 'fecha_evento DESC'
    }

    /**
    * [Buscamos el nombre del evento mediante el event_id y lo emitimos en el socket io]
    */
    detalle_eventos.findOne(query)
    .then(record_findone => {
      return eventos.search(record_findone.evento_id)
      .then(recordEvento => {
        Helper.socketEmmit(req.socket, 'status_agent', sails.sockets.getId(req), recordEvento.name, recordEvento.id)
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', 'Fail Search Event')
      })
    })
    .catch(err => {
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Fail Search Event' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  register_assistence: function (req, res) {
    if (!req.param('new_date_event') || !req.param('user_id')) Helper.responseMessage(res, 'error', 'Parameters incompleted')

    /**
    * [Se verifica si existe mas de un registro (Logeo) en la BD]
    */
    let query = {
      user_id: req.param('user_id'),
      evento_id: 11
    }

    detalle_eventos.count(query)
    .then(recordCount => {
      if (recordCount > 1) Helper.responseMessage(res, 'error', 'More Records')
      /**
      * [Extrae el 'id','fecha_evento' del primer evento de 'Login', realizado por el agente]
      */
      let queryFindOne = {
        select: ['id', 'fecha_evento'],
        where: {
          user_id: req.param('user_id'),
          evento_id: 11
        },
        sort: 'fecha_evento ASC'
      }

      detalle_eventos.findOne(queryFindOne)
      .then(record_findone => {
        /**
        * [Actualiza el registro para actualización del registro de fecha_evento]
        */
        let parameterSearch = { id: record_findone.id }
        let query = {
          date_really: record_findone.fecha_evento,
          fecha_evento: req.param('new_date_event')
        }
        detalle_eventos.update(parameterSearch, query)
        .then(record_update => {
          Helper.responseMessage(res, 'success', 'Updated Event')
        })
        .catch(err => {
          Helper.responseMessage(res, 'error', 'Fail Updated Event')
        })
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', 'Fail Search Event')
      })
    })
    .catch(err => {
      Helper.getError(err)
      .then(data => {
        let message = ''
        if (data === false) { message = 'Acceso Denegado a la BD' } else { message = 'Fail Count Records' }
        Helper.responseMessage(res, 'error', message)
      })
      .catch(err => { Helper.responseMessage(res, 'error', 'Error al conectar al MySQL') })
    })
  },

  create: function (evento_id, user_id, fecha_evento, ip_cliente, anexo = 0) {
    return new Promise((resolve, reject) => {
      let valuesEvent = {
        evento_id: evento_id,
        user_id: user_id,
        fecha_evento: fecha_evento,
        ip_cliente: ip_cliente,
        observaciones: '',
        anexo: anexo,
        date_really: Helper.formatDate(new Date())
      }
      detalle_eventos.create(valuesEvent)
      .then(data => {
        return resolve(data)
      })
      .catch(err => {
        return reject(err)
      })
    })
  },

  createEvent: function (req, res) {
    let valuesEvent = {
      evento_id: req.param('event_id'),
      user_id: req.param('agent_user_id'),
      fecha_evento: req.param('event_time'),
      ip_cliente: req.param('ip'),
      observaciones: req.param('event_observaciones'),
      anexo: req.param('agent_annexed'),
      date_really: Helper.formatDate(new Date())
    }

    detalle_eventos.create(valuesEvent)
      .then(data => Helper.responseMessage(res, 'success', 'Evento Creado correctamente'))
      .catch(err => Helper.responseMessage(res, 'error', err))
  }
}
