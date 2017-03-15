/**
 * agent_onlineController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  delete: function (req, res) {
    let numberAnnexed = req.param('number_annexed')
    console.log('Removing agent on the dashboard: ' + numberAnnexed)
    agent_online.destroy({number_annexed: numberAnnexed})
    .then(function () {
      sails.log('The agent has been remove from the dashboard.')
      return res.json(numberAnnexed)
    })
    .catch(function (err) {
      return res.json(err)
      sails.log(err)
    })
  },

  update: function (req, res) {
    let numberAnnexed = req.param('number_annexed')
    let dataUpdate = {
      status_pause: req.param('status_pause')
    }
    console.log('Updating agent on the dashboard : ' + req.param('status_pause'))
    agent_online.update({number_annexed: numberAnnexed}, dataUpdate)
    .then(function () {
      sails.log('The agent has been update from the dashboard.')
      return res.json(updated[0])
    })
    .catch(function (err) {
      return res.json(err)
      sails.log(err)
    })
  }
}
