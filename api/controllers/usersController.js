/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (userID) {
    return new Promise((resolve, reject) => {
      sails.log('Searching user according to the userID')
      let queryUser = { select: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 'username'], where: { id: userID } }
      users.findOne(queryUser)
      .then(record => {
        return resolve(record)
      })
      .catch(err => {
        sails.log('Error in Search the UsersController : ' + err)
        return reject(err)
      })
    })
  }
}
