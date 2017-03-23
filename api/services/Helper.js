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
    return response.json({ Response: status, Message: message })
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
    // console.log(parameters)
    let client = new AmiClient({reconnect: false})
    co(function * () {
      yield client.connect('admin', 'admin', {host: '192.167.99.224', port: 5038})

      let response = yield client.action(parameters, true)
      sails.log(response)
      client.disconnect()
      return response
    }).catch(error => {
      return error
    })
  },

  addremoveQueue: function (userID, typeActionACD, Action) {
    var anexo = ''
    var username = ''
    users.search(userID)
    .then(data_user => {
      username = data_user.username
      anexos.searchUserID(userID)
      .then(data_anexo => {
        anexo = data_anexo.name
        usersQueues.searchUsersQueues(userID)
        .then(dataUsersQueues => {
          let parametros = ''
          forEach(dataUsersQueues, item => {
            queues.search(item.queue_id)
            .then(dataQueues => {
              if (typeActionACD) {
                if (Action === 'QueueAdd') parametros = this.getEstructura('QueueAdd', dataQueues[0].name, anexo, username)
                if (Action === 'QueueRemove') parametros = this.getEstructura('QueueRemove', dataQueues[0].name, anexo, null)
              } else {
                parametros = this.getEstructura('QueuePause', null, anexo, null)
              }
              return this.actionsAmi(parametros)
            })
            .catch(err => {
              return err
            })
          })
        })
        .catch(err => {
          return err
        })
      })
      .catch(err => {
        return err
      })
    })
    .catch(err => {
      return err
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
