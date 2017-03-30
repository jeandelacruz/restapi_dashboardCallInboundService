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

  change_status: function (req, res) {
    if (!req.param('user_id') || !req.param('event_id') || !req.param('anexo') || !req.param('ip')) return res.json({Response: 'error', Message: 'Parameters incompleted'})

    let typeActionACD = ''
    let fechaEvento = ''
    let eventID = req.param('event_id')
    let userID = req.param('user_id')
    let ipCliente = req.param('ip')
    let anexo = req.param('anexo')

    if (req.param('type_action') === 'disconnect') fechaEvento = req.param('hour_exit')
    if (req.param('old_event_id') === '11') typeActionACD = true

    fechaEvento = Helper.formatDate(new Date())

    let valuesEvent = {
      evento_id: eventID,
      user_id: userID,
      fecha_evento: fechaEvento,
      ip_cliente: ipCliente,
      observaciones: '',
      anexo: anexo,
      date_really: Helper.formatDate(new Date())
    }
    detalle_eventos.query('BEGIN', () => {
      detalle_eventos.create(valuesEvent)
        .then(data => {
          if (req.param('event_id') === 15) {
            return anexos.set_anexo(req, res)
          } else {
            this.actionChangeStatusDashboard(eventID, anexo)
            .then(eventos => {
              if (typeActionACD === true) {
                Helper.addremoveQueue(userID, anexo, typeActionACD, 'QueueAdd')
                .then(data => {
                  let flatAction = false
                  data.forEach((array) => {
                    if (array.Response === 'Success') flatAction = true
                  })
                  /*
                  if (data[0] === true) {
                    Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), recordEvento.name, recordEvento.id)
                    Helper.responseMessage(res, 'success', 'Tu usuario no permite recibir llamadas')
                    detalle_eventos.query('COMMIT')
                  } else
                  */
                  if (flatAction === false) {
                    Helper.responseMessage(res, 'Error', data)
                    detalle_eventos.query('ROLLBACK')
                  } else {
                    Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), eventos.name, eventos.id)
                    Helper.responseMessage(res, 'Success', data)
                    detalle_eventos.query('COMMIT')
                  }
                })
                .catch(err => {
                  Helper.responseMessage(res, 'error', 'Usuario no cuenta con colas')
                  detalle_eventos.query('ROLLBACK')
                })
              } else {
                this.actionPause(eventos, anexo)
                .then(msjPause => {
                  if (data.Response === 'Error') {
                    Helper.responseMessage(res, 'error', 'AST : ' + data.Message)
                  } else {
                    Helper.socketEmmit(req.socket, anexo, 'status_agent', sails.sockets.getId(req), eventos.name, eventos.id)
                    Helper.responseMessage(res, 'success', msjPause + ' correctamente')
                    detalle_eventos.query('COMMIT')
                  }
                })
                .catch(err => {
                  return err
                  detalle_eventos.query('ROLLBACK')
                })
              }
            })
            .catch(err => {
              return err
              detalle_eventos.query('ROLLBACK')
            })
          }
        })
        .catch(err => {
          Helper.responseMessage(res, 'error', 'Fail Inserted Event')
        })
    })
  },

  actionPause: function (data, anexo) {
    return new Promise((resolve, reject) => {
      let statusPause = 1
      let msjPause = 'Pausado'
      if (data.estado_call_id === 1) {
        statusPause = 0
        msjPause = 'Despausado'
      }

      let parametros = {
        Action: 'QueuePause',
        Interface: 'SIP/' + anexo,
        Paused: statusPause
      }

      Helper.actionsAmi(parametros)
      .then(data => {
        return resolve(msjPause)
      })
      .catch(err => {
        return reject(err)
      })
    })
  },

  actionChangeStatusDashboard: function (eventID, anexo) {
    return new Promise((resolve, reject) => {
      eventos.search(eventID)
      .then(eventos => {
        agentOnline.updateFrontEnd(anexo, eventos.name)
        .then(data => {
          return resolve(eventos)
        })
        .catch(err => {
          return reject(err)
        })
      })
      .catch(err => {
        return reject(err)
      })
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
        Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), recordEvento.name, recordEvento.id)
      })
      .catch(err => {
        Helper.responseMessage(res, 'error', 'Fail Search Event')
      })
    })
    .catch(err => {
      Helper.responseMessage(res, 'error', 'Fail Search Event')
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
      Helper.responseMessage(res, 'error', 'Fail Count Records')
    })
  }
}
