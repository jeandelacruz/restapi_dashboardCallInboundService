/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const dateFormat = require('dateformat')
const anexos = require('./AnexosController')
const agentOnline = require('./agent_onlineController')
const forEach = require('async-foreach').forEach
const aio = require('asterisk.io')
const ami = null

module.exports = {

  change_status: function (req, res) {
    if (!req.param('user_id') || !req.param('event_id') || !req.param('anexo') || !req.param('ip')) return res.json({Response: 'error', Message: 'Parameters incompleted'})

    let fechaEvento = date_format(new Date())
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
      date_really: date_format(new Date())
    }

    // Empieza la transaccion
    Detalle_eventos.query('BEGIN', function (err) {
      if (err) return res.json({ Response: 'error', Message: 'Failed Start Transaction - change_status' })

      Detalle_eventos.create(valuesEvent)
      .then(record_create => {
        // Parametros para consultar el evento
        let query = { select: ['id', 'name', 'estado_call_id'], where: { id: req.param('event_id') } }

        // Parametros par consultar el usuario
        let query_user = { select: ['id', 'username'], where: { id: req.param('user_id') } }

        // Si el evento es 15 me desconecta los anexos
        if (req.param('event_id') === 15) {
          // Se agrega el anexo
          anexos.set_anexo(req, res)
        } else {
          // Se busca el nombre del evento mediante el evento_id
          return Eventos.findOne(query).populate('detalle_evento')
          .then(record_findone => {
            sails.sockets.join(req.socket, 'panel_agente:' + req.param('anexo'))
	         sails.sockets.broadcast('panel_agente:' + req.param('anexo'), 'status_agent', {
	           Response: 'success',
	           Socket: sails.sockets.getId(req),
	           Name_Event: record_findone.name,
	           Event_id: record_findone.id
	         })
            // Parametro del estado del evento
            var event_id = record_findone.estado_call_id

            // Se busca el username del usuario
            return Users.findOne(query_user).populate('detalle_evento')
            .then(record_findoneu => {
            	return Users_queues.find({ user_id: req.param('user_id')}).populate('detalle_evento')
            	.then(record_findq => {
            		// console.log(record_findq.length)
            		forEach(record_findq, function (item) {
					  Queues.find({ id: item.queue_id }).populate('detalle_evento').exec(function (err, record_finque) {
	            		if (err) {
	            			Detalle_eventos.query('ROLLBACK')
	              			// return res.json({Response: 'error', Message: 'Fail Search Event'})
	            		}
	            		console.log(record_finque)
					  })
            		})
            		  // Conexion al asterisk
		              connection_ami()
		              // Verifico si el estado del evento es uno
		              if (event_id == 1) {
		                queue_add_despaused(req.param('anexo'), record_findoneu.username)
		                Detalle_eventos.query('COMMIT')
		                var namEvent = record_findone.name
		                return agentOnline.updateFrontEnd(req, namEvent, res)
		              } else {
		                queue_paused(req.param('anexo'))
		                Detalle_eventos.query('COMMIT')
		                var namEvent = record_findone.name
		                return agentOnline.updateFrontEnd(req, namEvent, res)
		              }
            	})
            	.catch(err => {
            		Detalle_eventos.query('ROLLBACK')
              		return res.json({Response: 'error', Message: 'Fail Search Event'})
            	})
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
     .then(record_findone => {
       let query = {
         select: ['id', 'name'],
         where: {
           id: record_findone.evento_id
         }
       }
       return Eventos.findOne(query).populate('detalle_evento')
       .then(record_findonee => {
         sails.sockets.join(req.socket, 'panel_agente' + sails.sockets.getId(req))
         sails.sockets.broadcast('panel_agente' + sails.sockets.getId(req), 'status_agent', {
           Response: 'success',
           Socket: sails.sockets.getId(req),
           Name_Event: record_findonee.name,
           Event_id: record_findonee.id
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
        .then(record_count => {
          if (record_count > 1) return res.json({Response: 'error', Message: 'More Records'})
          // Extrae el 'id','fecha_evento' del primer evento de 'Login', realizado por el agente
          let query_findone = {
            select: ['id', 'fecha_evento'],
            where: {
              user_id: req.param('user_id'),
              evento_id: 11
            },
            sort: 'fecha_evento ASC'
          }

          return Detalle_eventos.findOne(query_findone)
          .then(record_findone => {
            // Actualiza el registro para actualización del registro de fecha_evento
            let parameterSearch = { id: record_findone.id }
            let query = {
              date_really: record_findone.fecha_evento,
              fecha_evento: req.param('new_date_event')
            }
            return Detalle_eventos.update(parameterSearch, query)
            .then(record_update => {
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

// Funciones independientes

function date_format (date) {
  let date_format = dateFormat(date, 'yyyy-mm-dd H:MM:ss')
  return date_format
}

function connection_ami () {
  ami = aio.ami('192.167.99.224', 5038, 'admin', 'admin')
  ami.on('error', err => { console.log(err) })
}

function queue_add_despaused (anexo, username) {
  ami.on('ready', data => {
    // Agrego al agente a la cola
    ami.action(
      'QueueAdd', {
        Queue: 'HD_CE_Telefonia',
        Interface: 'SIP/' + anexo,
        Paused: '0',
        MemberName: 'Agent/' + username
      },
      function (data) {
        // Verifico si ya ha estado agregado
        if (data.Message == 'Unable to add interface: Already there') {
          // Despausa al agente
          ami.action(
            'QueuePause', {
              Interface: 'SIP/' + anexo,
              Paused: '0'
            },
            function (data) {
              console.log('Interface Despaused successfully')
            }
          )
        } else {
          // Muestra el mensaje del success
          console.log(data)
        }
      }
    )
  })
}

function queue_paused (anexo) {
  // Pausa al agente
  ami.on('ready', data => {
    ami.action(
        'QueuePause', {
          Interface: 'SIP/' + anexo,
          Paused: '1'
        },
        function (data) {
          console.log(data)
        }
    )
  })
}

function socket_request (anexo, route_socket, name_event, evento_id) {
  sails.sockets.join(req.socket, 'panel_agente' + anexo)
  sails.sockets.broadcast('panel_agente' + anexo, route_socket, {
    Response: 'success',
    Socket: sails.sockets.getId(req),
    Name_Event: name_event,
    Event_id: evento_id
  })
}
