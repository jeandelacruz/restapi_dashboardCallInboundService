/**
 * agent_onlineController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  search: function (req, res) {
    let queryAgent = { where: { agent_annexed: req.param('agent_annexed') } }
    agent_online.findOne(queryAgent)
    .then(record => res.json(record))
    .catch(err => {
      sails.log('Error in Search the UsersController : ' + err)
      return res.json(err)
    })
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
        sails.log('The agent has ' + data[0].agent_annexed + ' been update from the dashboard.')
        data[0].timeElapsed = '0'
        data[0].total_call = '0'
        return res.json(data[0])
      })
      .catch(err => {
        sails.log('Error in searchAndUpdate the AgentOnlineController : ' + err)
        return res.json(err)
      })
    })
    .catch(err => {
      sails.log('Error in Search the UsersController : ' + err)
      return res.json(err)
    })
  },

  updatePause: function (req, res) {
    let queryCompare = {agent_annexed: req.param('agent_annexed')}
    let dataUpdate = req.allParams()
    agent_online.update(queryCompare, dataUpdate)
    .then(data => {
      sails.log('The agent has ' + data[0].agent_annexed + ' been update from the dashboard.')
      data[0].timeElapsed = '0'
      data[0].total_call = '0'
      return res.json(data[0])
    })
    .catch(err => {
      sails.log('Error in searchAndUpdate the AgentOnlineController : ' + err)
      return res.json(err)
    })
  },

  delete: function (req, res) {
    let query = {agent_annexed: req.param('agent_annexed')}
    agent_online.destroy(query)
    .then(data => {
      sails.log('The agent ' + data[0].agent_annexed + ' has been remove from the dashboard.')
      return res.json(data[0])
    })
    .catch(err => {
      sails.log('Error in delete the AngetOnlineController : ' + err)
      return res.json(err)
    })
  },

  updateFrontEnd: function (anexo, eventName, eventID) {
    return new Promise((resolve, reject) => {
      sails.log('Updating the event_name in the table agent_online para the dashboard')
      let queryCompare = { agent_annexed: anexo }
      agent_online.update(queryCompare, { event_name: eventName, event_id: eventID })
      .then(record => {
        return resolve(record[0])
      })
      .catch(err => {
        sails.log('Error in updateFrontEnd the AngetOnlineController : ' + err)
        return reject(err)
      })
    })
  },

  updateFrontEnd_02: function (req, res) {
    sails.log('Updating the event_name in the table agent_online para the dashboard')
    let queryCompare = { agent_name: req.param('name_agent') }
    agent_online.update(queryCompare, req.allParams())
      .then(record => {
        return res.json(record[0])
      })
      .catch(err => {
        sails.log('Error in updateFrontEnd the AngetOnlineController : ' + err)
        return res.json(err)
      })
  }
}
