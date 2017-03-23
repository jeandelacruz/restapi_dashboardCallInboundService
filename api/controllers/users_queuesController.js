/**
 * Users_queuesController
 *
 * @description :: Server-side logic for managing users_queues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  searchUsersQueues: function (userID) {
    return new Promise((resolve, reject) => {
      sails.log('Searching user in queues asigning the according to the queueID')
      users_queues.find({user_id: userID})
      .then(record => {
        return resolve(record)
      })
      .catch(err => {
        sails.log('Error in searchUsersQueues the UserQueuesController : ' + err)
        return reject(err)
      })
    })
  }
}
