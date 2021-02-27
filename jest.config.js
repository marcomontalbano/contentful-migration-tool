module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ['text', 'text-summary', 'lcov', 'json', 'html'],
    // coverageThreshold: {
    //     global: {
    //         branches: 80,
    //         functions: 80,
    //         lines: 80,
    //         statements: -10
    //     }
    // }
}