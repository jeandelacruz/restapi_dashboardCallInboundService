/**
 * agent_onlineController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const eventos = require('./eventosController')

module.exports = {

  search: function (req, res) {
    let queryAgent = { where: { agent_annexed: req.param('agent_annexed') } }
    agent_online.findOne(queryAgent).then(record => {
      res.json(record)
    })
    .catch(err => res.json(err))
  },

  searchAndUpdate: function (req, res) {
    let queryAgent = { select: ['event_id', 'event_id_old', 'second_status_call'], where: { agent_annexed: req.param('agent_annexed') } }
    agent_online.findOne(queryAgent)
    .then(record => {
      let queryCompare = {agent_annexed: req.param('agent_annexed')}
      let dataUpdate = req.allParams()
      /**
       * [Se valida la condicional, si existe o no una segunda llamada.
       * - Si existe se valida el estado de la segunda llamada en la BD,
       *   como tambien se valida si se desea cambiar el estado principal y el antiguo.
       * - Si no envia en el campo del evento anterior, el actual de la BD.]
       */
      if(dataUpdate.second_status_call === '0'){
        /**
         * [Se valida la condicional, si existe un corte de una segunda llamada.
         * Este no actualizara ningun dato de la primera llamada (Saliente)]
         */
        if(dataUpdate.second_outbound_phone === '') {
          if (record.event_id !== dataUpdate.event_id_old) {
            dataUpdate.event_id_old = record.event_id
            if(dataUpdate.changeSecondStatusCall === '1') dataUpdate.second_status_call = '0'
          }
        }
      } else {
        if(record.second_status_call === 1 && dataUpdate.changeEventPrimary === '1') {
            dataUpdate.event_id = record.event_id_old
            dataUpdate.event_id_old = record.event_id
            if(dataUpdate.changeSecondStatusCall === '1') dataUpdate.second_status_call = '0'
        } else {
          if(dataUpdate.second_event_id === '20' && dataUpdate.second_status_call === 1) dataUpdate.event_id_old = '23'
            else if(dataUpdate.second_event_id === '19' && dataUpdate.second_status_call === 1) dataUpdate.event_id_old = '22'
              else dataUpdate.event_id_old = record.event_id_old
          if(dataUpdate.changeSecondStatusCall === '1') dataUpdate.second_status_call = '0'
        } 
      }

      agent_online.update(queryCompare, dataUpdate)
      .then(data => {
        data[0].total_call = 0
        return res.json(data[0])
      })
      .catch(err => res.json(err))
    })
    .catch(err => res.json(err))
  },

  updatePause: function (req, res) {
    let queryCompare = {agent_annexed: req.param('agent_annexed')}
    let dataUpdate = req.allParams()
    agent_online.update(queryCompare, dataUpdate)
    .then(data => {
      data[0].total_call = '0'
      return res.json(data[0])
    })
    .catch(err => res.json(err))
  },

  delete: function (req, res) {
    let query = {agent_user_id: req.param('user_id')}
    agent_online.destroy(query).then(data => res.json(data[0]))
    .catch(err => res.json(err))
  },

  deleteUserID: function (userID) {
    return new Promise((resolve, reject) => {
      let query = {agent_user_id: userID}
      agent_online.destroy(query).then(data => resolve(data[0]))
      .catch(err => reject(err))
    })
  },

  updateFrontEnd_02: function (req, res) {
    let queryCompare = { agent_name: req.param('name_agent') }
    agent_online.update(queryCompare, req.allParams())
      .then(record => res.json(record[0]))
      .catch(err => res.json(err))
  },

  updateFrontEnd: function (req, action) {
    return new Promise((resolve, reject) => {
      let userID = req.param('userID')
      let eventNextID = req.param('eventNextID')
      let eventID = req.param('eventID')
      let eventAnnexed = (req.param('eventAnnexed') === 0) ? '-' : req.param('eventAnnexed')
      let eventHangup = 1

      if (action === 'updateEvent') {
      	let eventoSearch = eventos.search(eventNextID)
      	eventoSearch.then((resultEvent) => {
      		eventHangup = (resultEvent.status_hangup === '1') ? eventNextID : 1
  			agent_online.update({ agent_user_id: userID }, { event_id: eventNextID, event_id_old: eventID, agent_annexed: eventAnnexed, event_time: (new Date()).getTime(), event_hangup: eventHangup })
	        .then(record => {
	          Helper.socketDashboard(record[0])
	          resolve(record[0])
	        }).catch(err => reject(err))
      	})
      }

      if (action === 'updateNumberAnnexed') {
        agent_online.update({ agent_user_id: userID }, {agent_annexed: eventAnnexed})
        .then(record => {
          Helper.socketDashboard(record[0])
          resolve(record[0])
        }).catch(err => reject(err))
      }
    })
  },

  transferUnattended: function (req, res) {
    let transferUnattended = async (dataAgente) => {
      let updateAgentOnline = async (dataAgente) => {
        try {
          let queryAgent = { select: ['event_id'], where: { agent_annexed: dataAgente.agent_annexed } }
          let dataFindAgentOnline = await agent_online.findOne(queryAgent)
          if (dataFindAgentOnline) {
            if (dataFindAgentOnline.event_id !== dataAgente.event_id_old) dataAgente.event_id_old = dataFindAgentOnline.event_id
            let queryCompare = { agent_annexed: dataAgente.agent_annexed }
            let dataAgentOnlinePostUpdate = await agent_online.update(queryCompare, dataAgente)
            return dataAgentOnlinePostUpdate[0]
          }
        } catch (err) {
          res.json(err)
        }
      }

      let dataTransferUnattended = {}
      dataTransferUnattended['liberar'] = await updateAgentOnline(req.param('liberar'))
      dataTransferUnattended['asignar'] = await updateAgentOnline(req.param('asignar'))
      return res.json(dataTransferUnattended)
    }
    transferUnattended()
  }

}
