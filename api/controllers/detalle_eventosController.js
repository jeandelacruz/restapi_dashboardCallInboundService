/**
 * Detalle_eventosController
 *
 * @description :: Server-side logic for managing detalle_eventos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const eventos = require('./eventosController')
const agentOnline = require('./agent_onlineController')

module.exports = {

  registrarDetalle: function (req, res) {
    let asyncRegistrarDetalle = async () => {
      try {
        await Helper.getPrueba(req, res, 'Evento Registrado Exitosamente', '', '', '', true, false, true, false)
      } catch (err) { Helper.getError(res, err, 'Error al registrar eventos en la BD') }
    }
    asyncRegistrarDetalle()
  },

  queueAdd: function (req, res) {
    let userID = req.param('userID')
    let anexo = req.param('eventAnnexed')
    let username = req.param('username')

    let asyncQueueAdd = async () => {
      try {
        let dataAsterisk = await Helper.addremoveQueue(userID, username, anexo, true, 'QueueAdd')
        Helper.getPrueba(req, res, 'Se agrego correctamente al Asterisk', 'Error al agregar al Asterisk', 'Error', dataAsterisk, true, false, true, false)
      } catch (err) { Helper.getError(res, err, 'Error al liberar anexo') }
    }
    asyncQueueAdd()
  },

  queuePause: function (req, res) {
    let eventStatusPause = req.param('eventStatusPause')
    let anexo = req.param('eventAnnexed')

    let mensaje = (eventStatusPause === 1) ? 'Despausado Correctamente' : 'Pausado Correctamente'
    let asyncQueuePause = async () => {
      try {
        let dataAsterisk = await Helper.actionPause(eventStatusPause, anexo)
        Helper.getPrueba(req, res, mensaje, 'Error al pausar al agente', 'Error', dataAsterisk, true, false, true, false)
      } catch (err) { Helper.getError(res, err, 'Error al Pausar/Despausar el agente') }
    }
    asyncQueuePause()
  },

  queueRemove: function (req, res) {
    let userID = req.param('userID')
    let anexo = req.param('eventAnnexed')
    let username = req.param('username')

    let asyncQueueRemove = async () => {
      try {
        let dataAsterisk = await Helper.addremoveQueue(userID, username, anexo, true, 'QueueRemove')
        Helper.getPrueba(req, res, 'Se desconecto correctamente del Asterisk', 'Error al desconectar del Asterisk', 'Error', dataAsterisk, true, true, true, true)
      } catch (err) { Helper.getError(res, err, 'Error al Desconectar de las Colas al agente') }
    }
    asyncQueueRemove()
  },

  getStatusActual: function (req, res) {
    let asyncGetStatus = async () => {
      try {
        let query = await Helper.getParameters(req, 'getstatus')
        let dataDetailEvent = await detalle_eventos.findOne(query)
        let dataEvent = await eventos.search(dataDetailEvent.evento_id)
        if (eventos) Helper.socketEmmit(req.socket, 'statusSails', sails.sockets.getId(req), dataEvent.name, dataEvent.id)
        else Helper.responseMessage(res, 'error', 'No se pudo obtener el evento actual del usuario.')
      } catch (err) { Helper.getError(res, err, 'Error al Obtener el Estado Actual del Agente') }
    }
    asyncGetStatus()
  },

  registerAssistence: function (req, res) {
    let asyncRegisterAssistence = async () => {
      try {
        let parametersCountRegisterLogin = Helper.getParameters(req, 'countRegisterLogin')
        let recordCount = await detalle_eventos.count(parametersCountRegisterLogin)
        if (recordCount > 1) Helper.responseMessage(res, 'error', 'More Records')
        let parametersFirstRegisterLogin = Helper.getParameters(req, 'getIdFirstRegisterLogin')
        let recordFindone = await detalle_eventos.findOne(parametersFirstRegisterLogin)
        let parameterSearch = { id: recordFindone.id }
        let query = Helper.getParameters(req, 'updateHourLogin', recordFindone)
        await detalle_eventos.update(parameterSearch, query)
        await Helper.getPrueba(req, res, 'Hora de Entrada Registrada Exitosamente', '', '', '', false, false, false, false)
      } catch (err) { Helper.getError(res, err, 'Error al Registrar la Asistencia del Agente') }
    }
    asyncRegisterAssistence()
  },

  create: function (eventNextID, userID, userRol, eventFechaHora, eventDateReally, eventIPCliente, eventAnnexed) {
    return new Promise((resolve, reject) => {
      let valuesEvent = {
        evento_id: eventNextID,
        user_id: userID,
        fecha_evento: eventFechaHora,
        date_really: eventDateReally,
        ip_cliente: eventIPCliente,
        observaciones: '',
        anexo: eventAnnexed,
        user_rol: userRol
      }
      detalle_eventos.create(valuesEvent).then(data => resolve(data)).catch(err => reject(err))
    })
  },

  createEvent: function (req, res) {
    if (typeof (req.param('event_id')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el event_id no puede estar vacío!')
    if (typeof (req.param('agent_user_id')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el agent_user_id no puede estar vacío!')
    if (typeof (req.param('event_time')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el event_time no puede estar vacío!')
    if (typeof (req.param('ip')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el ip no puede estar vacío!')
    if (typeof (req.param('event_observaciones')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el event_observaciones no puede estar vacío!')
    if (typeof (req.param('agent_annexed')) === 'undefined') return Helper.internalServer(res, 'Lo sentimos, el agent_annexed no puede estar vacío!')

    let valuesEvent = {
      evento_id: req.param('event_id'),
      user_id: req.param('agent_user_id'),
      fecha_evento: req.param('event_time'),
      ip_cliente: req.param('ip'),
      observaciones: req.param('event_observaciones'),
      anexo: req.param('agent_annexed'),
      date_really: Helper.formatDate(new Date())
    }

    detalle_eventos.create(valuesEvent).then(data => {
      Helper.responseMessage(res, 'success', 'Evento Creado correctamente')
    })
    .catch(err => Helper.responseMessage(res, 'error', err))
  }
}
