const co = require('co')
const dateFormat = require('dateformat')
const forEach = require('async-foreach').forEach
const AmiClient = require('asterisk-ami-client')
const users = require('../controllers/usersController')
const anexos = require('../controllers/anexosController')
const queues = require('../controllers/queuesController')
const usersQueues = require('../controllers/users_queuesController')

module.exports = {

  formatDate: function (date) {
    return dateFormat(date, 'yyyy-mm-dd H:MM:ss')
  },

  responseMessage: function (response, status, message, dataqueue = null) {
    return response.json({ Response: status.toLowerCase(), Message: message, DataQueue: dataqueue })
  },

  socketEmmit: function (socket, routeSocket, idSocket, nameEvent, eventoId) {
    sails.sockets.join(socket, 'panel_agente : ' + idSocket)
    sails.sockets.broadcast('panel_agente : ' + idSocket, routeSocket, {
      Response: 'success',
      Socket: idSocket,
      Name_Event: nameEvent,
      Event_id: eventoId
    })
  },

  actionsAmi: function (parameters) {
    return new Promise((resolve, reject) => {
      let client = new AmiClient({reconnect: false})
      co(function * () {
        yield client.connect('admin', 'admin', {host: '192.167.99.224', port: 5038})
        let response = yield client.action(parameters, true)
        let arr = [parameters.Queue]
        for (let prop in response) {
          arr.push(response[prop])
        }
        let notice = arr[2]
        let queue = arr[0]
        let message = ''
        let alert = ''
        if (notice === 'Unable to remove interface: Not there') {
          message = 'No se puede remover de ' + queue + ' : No existe'
          alert = 'error'
        } else if (notice === 'Added interface to queue') {
          message = 'Agregado a la cola : ' + queue
          alert = 'success'
        } else if (notice === 'Unable to add interface: Already there') {
          message = 'No se puede agregar a ' + queue + ' : Ya existe'
          alert = 'warning'
        } else if (notice === 'Removed interface from queue') {
          message = 'Removido de la cola : ' + queue
          alert = 'success'
        } else {
          message = 'Error al buscar mensaje'
          alert = 'warning'
        }
        var json = { Response: arr[1], Message: message, Queue: queue }
        client.disconnect()
        return resolve(json)
      }).catch(error => {
        return reject('Problema de conexion al Asterisk - AMI')
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
              this.actionAsterisk(typeActionACD, item.queue_id, action, anexo, username)
              .then(datos => {
                this.addToArray(datos, array).then(function (data) { })
              })
              .catch(err => {
                return reject(err)
              })
            })
            setTimeout(function () {
              return resolve(array)
            }, 2000)
          }
        })
        .catch(err => {
          return reject(err)
        })
    })
  },

  actionAsterisk: function (typeActionACD, queueID, action, anexo, username) {
    return new Promise((resolve, reject) => {
      let parametros = ''
      console.log('Parametros para actionAsterisk : ' + queueID + '-' + action + '-' + anexo + '-' + username)
      queues.search(queueID)
      .then(data => {
        if (typeActionACD) {
          if (action === 'QueueAdd') parametros = this.getEstructura('QueueAdd', data[0].name, anexo, username)
          if (action === 'QueueRemove') parametros = this.getEstructura('QueueRemove', data[0].name, anexo, null)
        }

        return this.actionsAmi(parametros)
        .then(data => {
          return resolve(data)
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

  addToArray: function (data, array) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        array.push(data)
        resolve(array)
      }, 1000)

      if (!array) {
        reject(new Error('No existe un array'))
      }
    })
  },

  getEstructura: function (actionsQueue, nameQueue, anexo, username) {
    let parametros = ''
    if (actionsQueue === 'QueueAdd') {
      parametros = {
        Action: 'QueueAdd',
        Queue: nameQueue,
        Interface: 'SIP/' + anexo,
        Paused: '0',
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

  getError: function (err) {
    return new Promise((resolve, reject) => {
      let error = err.details
      let array = error.split(':')
      sails.log(error)
      if (array[2] === ' Could not connect to MySQL') {
        reject(false)
      } else if (array[2] === ' ER_TABLEACCESS_DENIED_ERROR') {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  },

  whileCase: function (arr, queue) {
    return new Promise((resolve, reject) => {
      if (notice === 'Unable to remove interface: Not there') {
        message = 'No se puede remover de ' + queue + ' : No existe'
      } else if (notice === 'Added interface to queue') {
        message = 'Agregado a la cola : ' + queue
      } else if (notice === 'Unable to add interface: Already there') {
        message = 'No se puede agregar a ' + queue + ' : Ya existe'
      } else if (notice === 'Removed interface from queue') {
        message = 'Removido de la cola : ' + queue
      } else {
        message = 'Error al buscar mensaje'
      }
    })
  }
}
