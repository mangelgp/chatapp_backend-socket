const {io} = require('../index');
const { comprobarJWT } = require('../helpers/jwt');
const { usuarioConectado, usuarioDesconectado, grabarMensaje } = require('../controllers/socket');

// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');

    const [valido, uid] = comprobarJWT( client.handshake.headers['x-token'] );
    console.log(valido, uid);

    // Autenticar usuario
    if(!valido) { return client.disconnect(); }

    // Cliente autenticado
    usuarioConectado( uid );

    // Ingresar al usuario a una sala especifica
    client.join( uid );

    // Escuchar el mensaje personal
    client.on('mensaje-personal', async (payload) => {
        await grabarMensaje(payload)
        io.to( payload.para ).emit('mensaje-personal', payload);
    });

    console.log('cliente autenticado');

    client.on('disconnect', () => {
        console.log('Cliente desconectado');
        usuarioDesconectado( uid );
    });

    client.on('mensaje', (payload) => {
        console.log('Mensaje recibido', payload);

        io.emit('mensaje', {admin: 'Nuevo mensaje'})
    })
});