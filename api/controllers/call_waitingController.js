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
    .then(data => res.json(data[0].number_phone))
    .catch(err => res.json(err))
  }
}
