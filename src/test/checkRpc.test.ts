import peanut from '../index' // import directly from source code
import { ethers } from 'ethersv5' // v5
import { expect, describe, it } from '@jest/globals'
import dotenv from 'dotenv'
dotenv.config()

describe('checkRpc & getDefaultProvider', function () {
	it('getDefaultProvider polygon', async function () {
		const provider = await peanut.getDefaultProvider('137')
		// try getting block number and balance of zero adddress
		const blockNumber = await provider.getBlockNumber()
		expect(blockNumber).toBeGreaterThan(0)
		const balance = await provider.getBalance(ethers.constants.AddressZero)
		console.log('balance: ', balance)
	})
})
