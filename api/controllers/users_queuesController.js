/**
 * Users_queuesController
 *
 * @description :: Server-side logic for managing users_queues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  searchUsersQueues: function (userID) {
    return new Promise((resolve, reject) => {
      users_queues.find({user_id: userID})
      .then(record => resolve(record))
      .catch(err => reject(err))
    })
  }
}
