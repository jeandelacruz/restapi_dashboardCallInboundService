/**
 * agent_onlineController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  search: function (req, res) {
    let queryAgent = { where: { agent_annexed: req.param('agent_annexed') } }
    agent_online.findOne(queryAgent).then(record => res.json(record))
    .catch(err => res.json(err))
  },

  searchAndUpdate: function (req, res) {
    let queryAgent = { select: ['event_id'], where: { agent_annexed: req.param('agent_annexed') } }
    agent_online.findOne(queryAgent)
    .then(record => {
      let queryCompare = {agent_annexed: req.param('agent_annexed')}
      let dataUpdate = req.allParams()
      if (record.event_id !== dataUpdate.event_id_old) dataUpdate.event_id_old = record.event_id
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
      // let eventNextID = (req.param('eventID') === 11) ? 11 : req.param('eventNextID')
      let eventNextID = req.param('eventNextID')
      // let eventNextName = (req.param('eventID') === 11) ? 'Login' : req.param('eventNextName')
      let eventNextName = req.param('eventNextName')
      let eventID = req.param('eventID')
      let eventAnnexed = (req.param('eventAnnexed') === 0) ? '-' : req.param('eventAnnexed')

      if (action === 'updateEvent') {
        agent_online.update({ agent_user_id: userID }, { event_name: eventNextName, event_id: eventNextID, event_id_old: eventID, agent_annexed: eventAnnexed, event_time: (new Date()).getTime() })
        .then(record => {
          Helper.socketDashboard(record[0])
          resolve(record[0])
        }).catch(err => reject(err))
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
