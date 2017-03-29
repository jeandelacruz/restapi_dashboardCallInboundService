/**
 * PruebasController
 *
 * @description :: Server-side logic for managing pruebas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  array: function (req, res) {
    var prueba = []
    var parametro = req.allParams()
    prueba.push(parametro)
    console.log(prueba)
  }
}
