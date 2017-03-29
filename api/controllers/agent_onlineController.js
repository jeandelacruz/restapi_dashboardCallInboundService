/**
 * agent_onlineController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  updateOrCreate: function (req, res) {
    let queryCompare = {number_annexed: req.param('number_annexed')}
    let dataUpdate = req.allParams()

    agent_online.update(queryCompare, dataUpdate)
    .then(data => {
      if (data.length === 0) {
        return agent_online.create(req.allParams())
        .then(data => {
          sails.log('The agent ' + data.number_annexed + ' has been adding from the dashboard.')
          return res.json(data)
        })
        .catch(err => {
          sails.log('The agent has ' + data[0].number_annexed + ' been update from the dashboard.')
          return res.json(err)
        })
      } else {
        sails.log('Error in Create the AnexosController : ')
        return res.json(data[0])
      }
    })
    .catch(err => {
      sails.log('Error in update the AngetOnlineController : ' + err)
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
      agent_online.update(queryCompare, { name_event: nameEvent })
      .then(record => {
        return resolve(record[0])
      })
      .catch(err => {
        sails.log('Error in updateFrontEnd the AngetOnlineController : ' + err)
        return reject(err)
      })
    })
  }
}
