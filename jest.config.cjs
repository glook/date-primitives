// Created by: Andrey Polyakov (andrey@polyakov.im)

/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {}],
    },
};
