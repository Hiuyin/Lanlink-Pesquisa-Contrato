if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'development'
}

const production = {
    server: {
        host: '',
        port: '8080'
    },
    database: {
        user: 'BuscaContrato',
        host: '10.85.1.19',
        pass: '!Q@W#E1q2w3e2018',
        name: 'DataSwitch',
        dialect: 'mssql'
    }
}

const development = {
    server: {
        host: '10.85.50.152',
        port: '3000'
    },
    database: {
        user: 'BuscaContrato',
        host: '10.85.1.19',
        pass: '!Q@W#E1q2w3e2018',
        name: 'DataSwitch',
        dialect: 'mssql'
    }
}

const env = {
    production,
    development
}

if (!env[process.env.NODE_ENV]) {
    throw new Error('Envirollment não foi definido!')
}

module.exports = env[process.env.NODE_ENV]