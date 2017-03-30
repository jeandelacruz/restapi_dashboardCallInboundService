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

  responseMessage: function (response, status, message) {
    return response.json({ Response: status.toLowerCase(), Message: message })
  },

  socketEmmit: function (socket, anexo, routeSocket, idSocket, nameEvent, eventoId) {
    sails.sockets.join(socket, 'panel_agente:' + anexo)
    sails.sockets.broadcast('panel_agente:' + anexo, routeSocket, {
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
        // sails.log(parameters)
        client.disconnect()
        return resolve(response)
      }).catch(error => {
        return reject(error)
      })
    })
  },

  addremoveQueue: function (userID, anexo, typeActionACD, action) {
    return new Promise((resolve, reject) => {
      var username = ''
      let array = []
      users.search(userID)
      .then(dataUser => {
        username = dataUser.username
        // if (data_user.role != 'user') return resolve(true)
        usersQueues.searchUsersQueues(userID)
        .then(dataUsersQueues => {
          let err = ''
          if (dataUsersQueues.length === 0) {
            return reject(err)
          } else {
            forEach(dataUsersQueues, item => {
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
        } else {
          parametros = this.getEstructura('QueuePause', null, anexo, null)
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

    if (actionsQueue === 'QueuePause') {
      parametros = {
        Action: 'QueuePause',
        Interface: 'SIP/' + anexo,
        Paused: '0'
      }
    }

    return parametros
  }
}
