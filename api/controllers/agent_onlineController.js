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
    agent_online.destroy({number_annexed: numberAnnexed}).exec(function (err) {
      if (err) {
        return res.send(err)
        sails.log(err)
      }
      sails.log('The agent has been remove from the dashboard.')
      return res.send(numberAnnexed)
    })
  },

  update: function (req, res) {
    let numberAnnexed = req.param('number_annexed')
    let dataUpdate = {
      status_pause: req.param('status_pause')
    }
    console.log('Updating agent on the dashboard : ' + req.param('status_pause'))
    agent_online.update({number_annexed: numberAnnexed}, dataUpdate).exec(function (err, updated) {
      if (err) {
        return res.send(err)
        sails.log(err)
      }
      sails.log('The agent has been update from the dashboard.')
      return res.send(updated[0])
    })
  }
}

