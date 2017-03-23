/**
 * QueuesController
 *
 * @description :: Server-side logic for managing queues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (queueID) {
    return new Promise((resolve, reject) => {
      sails.log('Searching queue according to the queueID')
      queues.find({ id: queueID })
      .then(record => {
        sails.log(record)
        return resolve(record)
      })
      .catch(err => {
        sails.log('Error in Search the QueuesController : ' + err)
        return reject(err)
      })
    })
  }
}
