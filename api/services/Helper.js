const co = require('co')
const dateFormat = require('dateformat')
const iosocket = require('socket.io-client')
const AmiClient = require('asterisk-ami-client')

const anexos = require('../controllers/anexosController')
const queues = require('../controllers/queuesController')
const agentOnline = require('../controllers/agent_onlineController')
const usersQueues = require('../controllers/users_queuesController')
const detalleEventos = require('../controllers/detalle_eventosController')

module.exports = {

  formatDate: function (date) {
    return dateFormat(date, 'yyyy-mm-dd H:MM:ss')
  },

  responseMessage: function (response, status, message, dataqueue = null) {
    return response.json({ Response: status.toLowerCase(), Message: message, DataQueue: dataqueue })
  },

  socketDashboard: function (dataAgentsOnline) {
    const socketAsterisk = iosocket.connect(process.env.dashboardHost + ':' + process.env.dashboardPort, { 'forceNew': true })
    dataAgentsOnline.nameProyect = process.env.nameProyect
    socketAsterisk.emit('updateDataDashboard', dataAgentsOnline)
  },

  socketEmmit: function (socket, routeSocket, idSocket, eventName, eventId) {
    sails.sockets.join(socket, 'agentFront : ' + idSocket)
    sails.sockets.broadcast('agentFront : ' + idSocket, routeSocket, {
      eventName: eventName,
      eventId: eventId
    })
  },

  actionsAmi: function (parameters) {
    return new Promise((resolve, reject) => {
      let client = new AmiClient({reconnect: false})
      co(function * () {
        yield client.connect(process.env.asteriskUsername, process.env.asteriskSecret, {host: process.env.asteriskHost, port: process.env.asteriskPort})
        let response = yield client.action(parameters, true)
        let arr = [parameters.Queue]
        for (let prop in response) {
          arr.push(response[prop])
        }
        let notice = arr[2]
        let queue = arr[0]
        let message = ''
        let alert = arr[1]

        switch (notice) {
          case 'Unable to remove interface: Not there':
            message = 'No exists annexed in queue : ' + queue
            alert = 'NoNotification'
            break
          case 'Added interface to queue':
            message = 'Add in queue : ' + queue
            alert = 'Success'
            break
          case 'Unable to add interface: Already there':
            message = 'Exist in queue : ' + queue
            alert = 'NoNotification'
            break
          case 'Removed interface from queue':
            message = 'Remove of queue : ' + queue
            alert = 'Success'
            break
          case 'Unable to add interface to queue: No such queue':
            message = 'No exists queue : ' + queue
            alert = 'Error'
            break
          case 'Unable to remove interface from queue: No such queue':
            message = 'No exists queue : ' + queue
            alert = 'Error'
            break
          case 'Interface paused successfully':
            message = 'Paussed agent in queue: ' + queue
            alert = 'NoNotification'
            break
          case 'Interface unpaused successfully':
            message = 'Unpaussed agent in queue: ' + queue
            alert = 'NoNotification'
            break
          default:
            message = arr[2]
            alert = 'Warning'
        }

        var json = { Response: alert, Message: message, Queue: queue }
        client.disconnect()
        return resolve(json)
      }).catch(err => {
        return reject('Problema de conexion al Asterisk - AMI' + err)
      })
    })
  },

  addremoveQueue: function (userID, username, anexo, typeActionACD, action) {
    return new Promise((resolve, reject) => {
      let array = []
      usersQueues.searchUsersQueues(userID)
        .then(dataUsersQueues => {
          let err = ''
          if (dataUsersQueues.length === 0) {
            return reject(err)
          } else {
            dataUsersQueues.forEach((item) => {
              this.actionAsterisk(typeActionACD, item.queue_id, action, anexo, username, item.priority)
              .then(datos => this.addToArray(datos, array).then(function (data) { }))
              .catch(err => reject(err))
            })
            setTimeout(function () {
              return resolve(array)
            }, 2000)
          }
        })
        .catch(err => reject(err))
    })
  },

  actionAsterisk: function (typeActionACD, queueID, action, anexo, username, priority = 1) {
    return new Promise((resolve, reject) => {
      let parametros = ''
      console.log('Parametros para actionAsterisk : ' + queueID + '-' + action + '-' + anexo + '-' + username)
      queues.search(queueID)
      .then(data => {
        if (typeActionACD) {
          if (action === 'QueueAdd') parametros = this.getEstructura('QueueAdd', data[0].name, anexo, username, priority)
          if (action === 'QueueRemove') parametros = this.getEstructura('QueueRemove', data[0].name, anexo, null, null)
        }

        return this.actionsAmi(parametros)
        .then(data => resolve(data))
        .catch(err => reject(err))
      })
      .catch(err => reject(err))
    })
  },

  addToArray: function (data, array) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        array.push(data)
        resolve(array)
      }, 1000)

      if (!array) reject(new Error('No existe un array'))
    })
  },

  getEstructura: function (actionsQueue, nameQueue, anexo, username, priority = 1) {
    let parametros = ''
    if (actionsQueue === 'QueueAdd') {
      parametros = {
        Action: 'QueueAdd',
        Queue: nameQueue,
        Interface: 'SIP/' + anexo,
        Paused: '0',
        Penalty: priority,
        MemberName: 'Agent/' + username
      }
    }

    if (actionsQueue === 'QueueRemove') {
      parametros = {
        Action: 'QueueRemove',
        Interface: 'SIP/' + anexo,
        Queue: nameQueue
      }
    }

    return parametros
  },

  getError: function (res, err, msj) {
    console.log('mensaje de error')
    console.log(err)
    let error = err.details
    let array = error.split(':')
    let isConectionBD = true
    let isPrivilegiesBD = true
    let message = msj
    if (array[2] === ' Could not connect to MySQL') isPrivilegiesBD = false
    if (array[2] === ' ER_TABLEACCESS_DENIED_ERROR') isConectionBD = false
    if (isPrivilegiesBD === false) { message = 'Acceso Denegado a la BD' }
    if (isConectionBD === false) Helper.responseMessage(res, 'error', 'Error al conectar al MySQL')
    else Helper.responseMessage(res, 'error', message)
  },

  getPrueba: function (req, res, mensaje, mensajeError, action, dataAsterisk, isDetalleEventos, isUpdateAnexo, isUpdateDashboard, isDeleteDashboard, actionUpdateDashboard = 'updateEvent') {
    let userID = req.param('userID')
    let userRol = req.param('userRol')
    let eventNextID = req.param('eventNextID')
    let eventNextName = req.param('eventNextName')
    let eventIPCliente = req.param('eventIPCliente')
    let eventAnnexed = req.param('eventAnnexed')
    let eventFechaHora = req.param('eventFechaHora')
    let eventDateReally = req.param('eventDateReally')
    let statusQueueRemove = req.param('statusQueueRemove')
    let flatAction = false
    let mensajeSucces = mensaje

    let asyncGetPrueba = async () => {
      if (statusQueueRemove === true) {
        dataAsterisk.forEach((array) => { if (array.Response === 'Success' || array.Response === 'NoNotification') flatAction = true })
        if (flatAction === false) this.responseMessage(res, action, mensajeError, dataAsterisk)
      }
      if (isDetalleEventos) await detalleEventos.create(eventNextID, userID, userRol, eventFechaHora, eventDateReally, eventIPCliente, eventAnnexed)
      if (isUpdateAnexo) await anexos.update(req)
      if (isUpdateDashboard) await agentOnline.updateFrontEnd(req, actionUpdateDashboard)
      if (isDeleteDashboard) await agentOnline.deleteUserID(userID)
      this.socketEmmit(req.socket, 'statusSails', sails.sockets.getId(req), eventNextName, eventNextID)
      this.responseMessage(res, 'success', mensajeSucces, dataAsterisk)
    }
    asyncGetPrueba()
  },

  getParameters: function (req, action, parametersExtras = {}) {
    let parameters = ''
    if (action === 'getstatus') {
      parameters = {
        select: ['evento_id'],
        where: {user_id: req.param('userID')},
        sort: 'fecha_evento DESC'
      }
    }

    if (action === 'countRegisterLogin') {
      parameters = {
        user_id: req.param('userID'),
        evento_id: 11
      }
    }

    if (action === 'getIdFirstRegisterLogin') {
      parameters = {
        select: ['id', 'fecha_evento'],
        where: {
          user_id: req.param('userID'),
          evento_id: 11
        },
        sort: 'fecha_evento ASC'
      }
    }

    if (action === 'updateHourLogin') {
      parameters = {
        date_really: parametersExtras.fecha_evento,
        fecha_evento: req.param('eventFechaHora')
      }
    }

    return parameters
  },

  actionPause: function (eventStatusPause, anexo) {
    return new Promise((resolve, reject) => {
      let array = []
      let statusPause = 1
      if (eventStatusPause == 1) statusPause = 0
      let parametros = { Action: 'QueuePause', Interface: 'SIP/' + anexo, Paused: statusPause }
      this.actionsAmi(parametros).then(data => this.addToArray(data, array).then(function (data) { })).catch(err => reject(err))
      setTimeout(() => { return resolve(array) }, 2000)
    })
  }
}
