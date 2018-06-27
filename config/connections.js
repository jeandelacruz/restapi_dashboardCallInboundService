module.exports.connections = {
  mysql: {
    adapter: process.env.bdAdapter || 'sails-sqllite',
    host: process.env.bdHost || 'localhost',
    port: process.env.bdPort || '3306',
    user: process.env.bdUser || 'user',
    password: process.env.bdPassword || 'password',
    charset: process.env.bdCharset || 'utf8',
    database: process.env.bdDatabase || 'test'
  },

  sqlserver: {
    adapter: process.env.bdAdapter || 'sails-xxx',
    user: process.env.bdUser || 'cnect',
    password: process.env.bdPassword || 'pass',
    host: process.env.bdHost || 'abc123.database.windows.net',
    port: process.env.bdPort || '1366',
    database: process.env.bdDatabase || 'mydb',
    options: {
      encrypt: false
    }
  }

}
