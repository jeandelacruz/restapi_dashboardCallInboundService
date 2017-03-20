/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const dateFormat = require('dateformat')
const anexos = require('./AnexosController')
const agentOnline = require('./agent_onlineController')
const aio = require('asterisk.io')
var ami = null

module.exports = {

  change_status: function (req, res) {
    // Conexion al asterisk
    ami = aio.ami('192.167.99.224', 5038, 'admin', 'admin')

    // Verifica error al conectar al asterisk
    ami.on('error', err => { console.log(err) })

    if (!req.param('user_id') || !req.param('event_id') || !req.param('anexo') || !req.param('ip')) return res.json({Response: 'error', Message: 'Parameters incompleted'})

    let fechaEvento = dateFormat(new Date(), 'yyyy-mm-dd H:MM:ss')
    if (req.param('type_action') === 'disconnect') {
      fechaEvento = req.param('hour_exit')
    }

    var valuesEvent = {
      evento_id: req.param('event_id'),
      user_id: req.param('user_id'),
      fecha_evento: fechaEvento,
      ip_cliente: req.param('ip'),
      observaciones: '',
      anexo: req.param('anexo'),
      date_really: dateFormat(new Date(), 'yyyy-mm-dd H:MM:ss')
    }

    // Empieza la transaccion
    Detalle_eventos.query('BEGIN', function (err) {
      if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - change_status' })

      Detalle_eventos.create(valuesEvent)
      .then(record => {
        // Parametros para consultar el evento
        let query = { select: ['id', 'name', 'estado_call_id'], where: { id: req.param('event_id') } }

        // Parametros par consultar el usuario
        let query_user = { select: ['id', 'username'], where: {	id: req.param('user_id') } }

        // Si el evento es 15 me desconecta los anexos
        if (req.param('event_id') === 15) {
          console.log('Aqui entre')
          // Se agrega el anexo
          anexos.set_anexo(req, res)
        } else {
          // Se busca el nombre del evento mediante el evento_id
          return Eventos.findOne(query).populate('detalle_evento')
          .then(record => {
            sails.sockets.join(req.socket, 'panel_agente' + sails.sockets.getId(req))
            sails.sockets.broadcast('panel_agente' + sails.sockets.getId(req), 'status_agent', {
              Response: 'success', Socket: sails.sockets.getId(req), Name_Event: record.name, Event_id: record.id })
            // Parametro del estado del evento
            var event_id = record.estado_call_id

            // Se busca el username del usuario
            return Users.findOne(query_user).populate('detalle_evento')
            .then(record => {
            	// Verifico si el estado del evento es uno
            	if (event_id == 1) {
			        ami.on('ready', data => {
			        	// Agrego al agente a la cola
			         	ami.action(
					        'QueueAdd', {
					        	Queue: 'HD_CE_Telefonia',
					        	Interface: 'SIP/' + req.param('anexo'),
					        	Paused: '0',
					        	MemberName: 'Agent/' + record.username
					        },
					        function (data) {
					        	// Verifico si ya ha estado agregado
					            if (data.Message == 'Unable to add interface: Already there') {
					            	// Despausa al agente
					            	ami.action(
								        'QueuePause', {
								        	Interface: 'SIP/' + req.param('anexo'),
								        	Paused: '0'
								        },
								        function (data) {
								            console.log('Despausado')
								        }
								    )
					            } else {
					            	// Muestra el mensaje del success
				            		console.log(data)
					            }
					        }
					    )
			        })
			        Detalle_eventos.query('COMMIT')
	            	return agentOnline.updateFrontEnd(req, res)
            	} else {
            		// Pausa al agente
            		ami.on('ready', data => {
			         	ami.action(
					        'QueuePause', {
					        	Interface: 'SIP/' + req.param('anexo'),
					        	Paused: '1'
					        },
					        function (data) {
					            console.log(data)
					        }
					    )
			        })
			        Detalle_eventos.query('COMMIT')
	            	return agentOnline.updateFrontEnd(req, res)
            	}
            })
            .catch(err => {
            	Detalle_eventos.query('ROLLBACK')
            	return res.json({Response: 'error', Message: 'Fail User Search'})
            })
          })
          .catch(err => {
            Detalle_eventos.query('ROLLBACK')
            return res.json({Response: 'error', Message: 'Fail Search Event'})
          })
        }
      })
      .catch(err => {
        Detalle_eventos.query('ROLLBACK')
        return res.json({Response: 'error', Message: 'Fail Inserted Event'})
      })
    })
  },

  getstatus: function (req, res) {
    console.log(sails.sockets.getId(req))

    if (!req.param('user_id')) return res.json({Response: 'error', Message: 'Parameters incompleted'})

    // Declaracion de variables
    let query = {
      select: ['evento_id'],
      where: {user_id: req.param('user_id')},
      sort: 'fecha_evento DESC'
    }

    Detalle_eventos.query('BEGIN', function (err) {
      if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - getstatus' })

      Detalle_eventos.findOne(query)
     .then(record => {
       let query = {
         select: ['id', 'name'],
         where: {
           id: record.evento_id
         }
       }
       return Eventos.findOne(query).populate('detalle_evento')
       .then(record => {
         sails.sockets.join(req.socket, 'panel_agente' + sails.sockets.getId(req))
         sails.sockets.broadcast('panel_agente' + sails.sockets.getId(req), 'status_agent', {
           Response: 'success',
           Socket: sails.sockets.getId(req),
           Name_Event: record.name,
           Event_id: record.id
         })
         Detalle_eventos.query('COMMIT')
       })
       .catch(err => {
         Detalle_eventos.query('ROLLBACK')
         return res.json({Response: 'error', Message: 'Fail Search Event'})
       })
     })

     .catch(err => {
       Detalle_eventos.query('ROLLBACK')
       return res.json({Response: 'error', Message: 'Fail Search Event'})
     })
    })
  },

  register_assistence: function (req, res) {
    if (!req.param('new_date_event') || !req.param('user_id')) {
      return res.json({Response: 'error', Message: 'Parameters incompleted'})
    } else {
    // Verifica si exista mas de un registro (logeo) en la BD
      let query = {
        user_id: req.param('user_id'),
        evento_id: 11
      }

      Detalle_eventos.query('BEGIN', function (err) {
        if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - register_assistence' })

        Detalle_eventos.count(query)
        .then(record => {
          if (record > 1) return res.json({Response: 'error', Message: 'More Records'})
          // Extrae el 'id','fecha_evento' del primer evento de 'Login', realizado por el agente
          let query = {
            select: ['id', 'fecha_evento'],
            where: {
              user_id: req.param('user_id'),
              evento_id: 11
            },
            sort: 'fecha_evento ASC'
          }

          return Detalle_eventos.findOne(query)
          .then(record => {
            // Actualiza el registro para actualización del registro de fecha_evento
            let parameterSearch = { id: record.id }
            let query = {
              date_really: record.fecha_evento,
              fecha_evento: req.param('new_date_event')
            }
            return Detalle_eventos.update(parameterSearch, query)
            .then(record => {
              Detalle_eventos.query('COMMIT')
              return res.json({Response: 'success', Message: 'Updated Event'})
            })
            .catch(err => {
              Detalle_eventos.query('ROLLBACK')
              return res.json({Response: 'error', Message: 'Fail Updated Event'})
            })
          })
          .catch(err => {
            Detalle_eventos.query('ROLLBACK')
            return res.json({Response: 'error', Message: 'Fail Search Event'})
          })
        })
        .catch(err => {
          Detalle_eventos.query('ROLLBACK')
          return res.json({Response: 'error', Message: 'Fail Count Records'})
        })
      })
    }
  }
}
