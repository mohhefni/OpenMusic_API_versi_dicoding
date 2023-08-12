const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaboration',
  version: '1.0.0',
  register: async (server, { collaborationsService, usersService, playlistsService, validator }) => {
    const collaboartionsHandler = new AuthenticationsHandler(collaborationsService, usersService, playlistsService, validator);
    server.route(routes(collaboartionsHandler));
  },
};
