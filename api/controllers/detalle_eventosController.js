/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const anexos = require('./anexosController')
const eventos = require('./eventosController')
const agentOnline = require('./agent_onlineController')
const forEach = require('async-foreach').forEach

module.exports = {

  change_status: function (req, res) {
    if (!req.param('user_id') || !req.param('event_id') || !req.param('anexo') || !req.param('ip')) return res.json({Response: 'error', Message: 'Parameters incompleted'})

    let typeActionACD = ''
    let fechaEvento = ''
    if (req.param('type_action') === 'disconnect') fechaEvento = req.param('hour_exit')
    if (req.param('old_event_id') === '11') typeActionACD = true

    fechaEvento = Helper.formatDate(new Date())

    let valuesEvent = {
      evento_id: req.param('event_id'),
      user_id: req.param('user_id'),
      fecha_evento: fechaEvento,
      ip_cliente: req.param('ip'),
      observaciones: '',
      anexo: req.param('anexo'),
      date_really: Helper.formatDate(new Date())
    }
    detalle_eventos.query('BEGIN', function (err) {
      if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - change_status' })
      detalle_eventos.create(valuesEvent)
        .then(data => {
          /**
          * [Verificamos cuando el evento es 15 (Desconexión) para remover los anexos]
          */
          if (req.param('event_id') === 15) {
            return anexos.set_anexo(req, res)
          } else {
            /**
            * [Se busca el nombre del evento mediante el event_id]
            */
            return eventos.search(req.param('event_id'))
            .then(recordEvento => {
              /**
              * [Parametro del estado del evento]
              */
              var eventID = recordEvento.estado_call_id
              /**
              * [Agregamos al asterisk con todas las colas asignadas al usuario. solo si es ACD]
              */
              if (eventID === 1) {
                agentOnline.updateFrontEnd(req.param('anexo'), recordEvento.name)
                .then(data => {
                  Helper.addremoveQueue(req.param('user_id'), typeActionACD, 'QueueAdd')
                  .then(data => {
                    if (data === true) {
                      Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), recordEvento.name, recordEvento.id)
                      Helper.responseMessage(res, 'success', 'Tu usuario no permite recibir llamadas')
                      detalle_eventos.query('COMMIT')
                    } else if (data === false) {
                      Helper.responseMessage(res, 'error', data.Message)
                      detalle_eventos.query('ROLLBACK')
                    } else {
                      Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), recordEvento.name, recordEvento.id)
                      Helper.responseMessage(res, data.Response.toLowerCase(), data.Message)
                      detalle_eventos.query('COMMIT')
                    }
                  })
                  .catch(err => {
                    Helper.responseMessage(res, 'error', 'Usuario no cuenta con colas')
                    detalle_eventos.query('ROLLBACK')
                  })
                })
                .catch(err => {
                  Helper.responseMessage(res, 'error', 'Error al agregar a las colas')
                  detalle_eventos.query('ROLLBACK')
                })
              } else {
                /**
                * [Pausamos al usuario mediante el anexo]
                */
                let parametros = {
                  Action: 'QueuePause',
                  Interface: 'SIP/' + req.param('anexo'),
                  Paused: '1'
                }
                agentOnline.updateFrontEnd(req.param('anexo'), recordEvento.name)
                .then(data => {
                  Helper.actionsAmi(parametros)
                  .then(data => {
                    if (data.Response === 'Error') {
                      Helper.responseMessage(res, 'error', 'AST : ' + data.Message)
                      detalle_eventos.query('ROLLBACK')
                    } else {
                      Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), recordEvento.name, recordEvento.id)
                      Helper.responseMessage(res, 'success', 'Pausado correctamente')
                      detalle_eventos.query('COMMIT')
                    }
                  })
                })
                .catch(err => {
                  Helper.responseMessage(res, 'error', 'Error al pausar al usuario')
                  detalle_eventos.query('ROLLBACK')
                })
              }
            })
            .catch(err => {
              Helper.responseMessage(res, 'error', 'Fail Search Event')
              detalle_eventos.query('ROLLBACK')
            })
          }
        })
        .catch(err => {
          Helper.responseMessage(res, 'error', 'Fail Inserted Event')
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
