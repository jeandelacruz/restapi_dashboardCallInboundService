/**
 * call_WaitingController
 *
 * @description :: Server-side logic for managing agent_onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  deleteCallWaiting: function (req, res) {
    let query = {unique_id : req.param('unique_id')}
    call_waiting.destroy(query)
    .then(data => {
      const values = {
        'name_proyect': data[0].name_proyect,
        'start_call' : data[0].start_call,
        'number_phone': data[0].number_phone
      }

      res.json(values)
    })
    .catch(err => res.json(err))
  },

  createCallWaiting: function (req, res) {
    let values = {
      number_phone: req.param('number_phone'),
      name_number: req.param('name_number'),
      name_queue: req.param('name_queue'),
      start_call: req.param('start_call'),
      unique_id: req.param('unique_id'),
      name_proyect: process.env.nameProyect
    }

    console.log(values)
    call_waiting.create(values).then(data => res.json(data)).catch(err => res.json(err))
  }
}
