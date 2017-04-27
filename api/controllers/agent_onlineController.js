/**
 * agent_onlineController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  searchAndUpdate: function (req, res) {
    let queryCompare = {number_annexed: req.param('number_annexed')}
    let dataUpdate = req.allParams()
    agent_online.update(queryCompare, dataUpdate)
    .then(data => {
      sails.log('The agent has ' + data[0].number_annexed + ' been update from the dashboard.')
      data[0].timeElapsed = ''
      return res.json(data[0])
    })
    .catch(err => {
      sails.log('Error in searchAndUpdate the AgentOnlineController : ' + err)
      return res.json(err)
    })
  },

  delete: function (req, res) {
    let query = {number_annexed: req.param('number_annexed')}
    agent_online.destroy(query)
    .then(data => {
      sails.log('The agent ' + data[0].number_annexed + ' has been remove from the dashboard.')
      return res.json(data[0].number_annexed)
    })
    .catch(err => {
      sails.log('Error in delete the AngetOnlineController : ' + err)
      return res.json(err)
    })
  },

  updateFrontEnd: function (anexo, nameEvent) {
    return new Promise((resolve, reject) => {
      sails.log('Updating the event_name in the table agent_online para the dashboard')
      let queryCompare = { number_annexed: anexo }
      console.log(queryCompare)
      agent_online.update(queryCompare, { name_event: nameEvent })
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
    let queryCompare = { name_agent: req.param('name_agent') }
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
