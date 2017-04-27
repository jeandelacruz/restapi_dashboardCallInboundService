/**
 * call_WaitingController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  delete: function (req, res) {
    let query = {number_phone: req.param('number_phone')}
    call_waiting.destroy(query)
    .then(data => {
      sails.log('The number phone ' + data[0].number_phone + ' has been remove from the calls waiting.')
      return res.json(data[0].number_phone)
    })
    .catch(err => {
      sails.log('Error in delete the CallWaitingController : ' + err)
      return res.json(err)
    })
  }
}
