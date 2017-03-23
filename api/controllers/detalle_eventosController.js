/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const users = require('./usersController')
const users_queues = require('./users_queuesController')
const anexos = require('./anexosController')
const eventos = require('./eventosController')
const agentOnline = require('./agent_onlineController')

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

    detalle_eventos.create(valuesEvent)
      .then(recordDetalleCreate => {
        // Si el evento es 15 me desconecta los anexos
        if (req.param('event_id') === 15) {
          // Se agrega el anexo
          return anexos.set_anexo(req, res)
        } else {
          // Se busca el nombre del evento mediante el evento_id
          return eventos.search(req.param('event_id'))
          .then(data_evento => {
            Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), data_evento.name, data_evento.id)
            // Parametro del estado del evento
            var eventID = data_evento.estado_call_id
            // Se busca el username del usuario
            if (eventID === 1) {
              Helper.addremoveQueue(req.param('user_id'), typeActionACD, 'QueueAdd')
              var namEvent = data_evento.name
              return agentOnline.updateFrontEnd(req, namEvent, res)
            } else {
              let parametros = {
                Action: 'QueuePause',
                Interface: 'SIP/' + req.param('anexo'),
                Paused: '1'
              }
              Helper.actionsAmi(parametros)
              var namEvent = data_evento.name
              return agentOnline.updateFrontEnd(req, namEvent, res)
            }
              /* users_queues.search(req.param('user_id'))
              .then(data_users_queues => {
                // Verifico si el estado del evento es uno
                if (eventID === 1) {
                  Helper.addremoveQueue(req.param('user_id'), typeActionACD, 'QueueAdd')

                  var namEvent = data_evento.name
                  return agentOnline.updateFrontEnd(req, namEvent, res)
                } else {
                  let parametros = {
                    Action: 'QueuePause',
                    Interface: 'SIP/' + req.param('anexo'),
                    Paused: '1'
                  }
                  Helper.actionsAmi(parametros)
                  var namEvent = data_evento.name
                  return agentOnline.updateFrontEnd(req, namEvent, res)
                }
              })
              .catch(err => {
                Helper.responseMessage(res, 'error', 'Fail Search User Queues')
              }) */
          })
          .catch(err => {
            Helper.responseMessage(res, 'error', 'Fail Search Event')
          })
        }
      })
      .catch(err => {
        sails.log(err)
        Helper.responseMessage(res, 'error', 'Fail Inserted Event')
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

    detalle_eventos.findOne(query)
     .then(record_findone => {
       return eventos.search(record_findone.evento_id)
       .then(data_evento => {
         Helper.socketEmmit(req.socket, req.param('anexo'), 'status_agent', sails.sockets.getId(req), data_evento.name, data_evento.id)
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

    // Verifica si exista mas de un registro (logeo) en la BD
    let query = {
      user_id: req.param('user_id'),
      evento_id: 11
    }

    detalle_eventos.count(query)
        .then(record_count => {
          if (record_count > 1) Helper.responseMessage(res, 'error', 'More Records')
          // Extrae el 'id','fecha_evento' del primer evento de 'Login', realizado por el agente
          let query_findone = {
            select: ['id', 'fecha_evento'],
            where: {
              user_id: req.param('user_id'),
              evento_id: 11
            },
            sort: 'fecha_evento ASC'
          }

          return detalle_eventos.findOne(query_findone)
          .then(record_findone => {
            // Actualiza el registro para actualización del registro de fecha_evento
            let parameterSearch = { id: record_findone.id }
            let query = {
              date_really: record_findone.fecha_evento,
              fecha_evento: req.param('new_date_event')
            }
            return detalle_eventos.update(parameterSearch, query)
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
