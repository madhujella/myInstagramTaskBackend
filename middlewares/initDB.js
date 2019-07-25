const pgtools = require('pgtools')

module.exports = async (req, res, next) => {
    const config = {
        user: 'postgres',
        password: '1',
        port: 5432,
        host: 'localhost'
    }

    try {
        await pgtools.dropdb(config, 'myinsta')
        console.log('drop db "myinsta"');

    } catch (e) {
        console.log('Cannot Drop DB "myinsta"');
    }

    try {
        await pgtools.createdb(config, 'myinsta')
        console.log('created db "myinsta"');

    } catch (e) {
        const error = new Error('Cannot Create DB "myinsta"');
        error.statusCode = 500;
        process.exit(-1);
        throw error;
    }

    next();

}