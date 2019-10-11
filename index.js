require('@babel/register')({
    presets: [
        [
            '@babel/preset-env',
            {
                'targets': {
                    'node': 'current'
                },
            }
        ]
    ],
    plugins: [
        ['@babel/transform-runtime']
    ]
});

module.exports = require('./bot.js');  