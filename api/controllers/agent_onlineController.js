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
        // Agent Online does not exist. Create.
        return agent_online.create(req.allParams())
        .then(data => {
          sails.log('The agent ' + data.number_annexed + ' has been adding from the dashboard.')
          return res.json(data)
        })
        .catch(err => {
          sails.log(err)
          return res.json(err)
        })
      } else {
        // Agent Online exist. Update
        sails.log('The agent has ' + data[0].number_annexed + ' been update from the dashboard.')
        return res.json(data[0])
      }
    })
    .catch(err => {
      sails.log(err)
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
      sails.log(err)
      return res.json(err)
    })
  },

  updateFrontEnd: function (req, res) {
    /* let queryCompare = { number_annexed: req['number_annexed'] }
    let dataUpdate = { name_event: req['name_event'] } */

    console.log(req.param('event_id'))

    agent_online.update({ number_annexed: annexed }, { name_event: 'Break' }).exec((err, updated) => {
      if (err) {
        console.log('No')
        return res.json({Response: 'error', Message: 'Fail Search Event'})
      }
      console.log('Ya')
      // console.log(updated)
      return res.json({Response: 'success', Message: 'Inserted Event'})
    })
  }
}
