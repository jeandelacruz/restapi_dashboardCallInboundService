/**
 * QueuesController
 *
 * @description :: Server-side logic for managing queues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (queueID) {
    return new Promise((resolve, reject) => {
      queues.find({ id: queueID })
      .then(record => resolve(record))
      .catch(err => reject(err))
    })
  }
}
