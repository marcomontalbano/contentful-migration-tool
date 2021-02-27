import { getStringDate, padLeft } from './migration'

describe('Migration', () => {
    describe('utils', () => {
        it('padLeft', () => {
            expect(padLeft(4)).toEqual('4')
            expect(padLeft(4, 2)).toEqual('04')
            expect(padLeft(111)).toEqual('111')
            expect(padLeft(321, 5)).toEqual('00321')
        })
    
        it('getStringDate', () => {
            Date.now = jest.fn(() => 1614451488353);
            expect(getStringDate()).toEqual('2021.02-27-18.44.48')
        })
    })
})