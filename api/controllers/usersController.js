/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  search: function (userID) {
    return new Promise((resolve, reject) => {
      let queryUser = { select: ['id', 'primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 'username', 'role'], where: { id: userID } }
      users.findOne(queryUser)
      .then(record => resolve(record))
      .catch(err => reject(err))
    })
  }
}
