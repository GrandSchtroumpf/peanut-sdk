import peanut from '../src/index' // import directly from source code
import { ethers } from 'ethersv5' // v5
import dotenv from 'dotenv'
dotenv.config()

// we want to use diff wallet than relayer
const TEST_WALLET_PRIVATE_KEY = process.env.TEST_WALLET_PRIVATE_KEY2 as string
const OPTIMISM_GOERLI_RPC_URL = 'https://rpc.goerli.optimism.gateway.fm'
const optimismGoerliProvider = new ethers.providers.JsonRpcProvider(OPTIMISM_GOERLI_RPC_URL)
const optimism_goerli_wallet = new ethers.Wallet(TEST_WALLET_PRIVATE_KEY, optimismGoerliProvider)

// const API_URL = 'http://api.peanut.to/claim'
// let API_URL = 'http://127.0.0.1:5000/claim'
let API_URL = 'http://127.0.0.1:8000/claim'

console.log(`API_URL is set to: ${API_URL}`)

describe('Peanut API Integration Tests', function () {
	const links: string[] = []

	it('should create a link and claim it', async function () {
		const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''
		// peanut.toggleVerbose(true)

		const chainId = 420 // optimism goerli
		const tokenAmount = 0.00001337
		const tokenType = 0 // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
		setTimeout(() => {}, 9000)
		const resp = await peanut.createLink({
			structSigner: {
				signer: optimism_goerli_wallet,
			},
			linkDetails: {
				chainId: chainId,
				tokenAmount: tokenAmount,
				tokenType: tokenType,
			},
		})

		// check status of link
		setTimeout(() => {}, 2000)
		const status = await peanut.getLinkDetails({ provider: optimismGoerliProvider, link: resp.link })
		console.log('status', status)

		// claim link using api
		const receiverAddress = optimism_goerli_wallet.address
		setTimeout(() => {}, 9000)
		const res = await peanut.claimLinkGasless({
			link: resp.link,
			recipientAddress: receiverAddress,
			APIKey: apiToken,
			baseUrl: API_URL,
		})
		expect(res.status).toBe('success')
		console.log('claim link response', res.data)

		links.push(resp.link)
	}, 60000) // 60 seconds timeout

	it('should create a link on Polygon mainnet and claim it with api', async function () {
		const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''
		peanut.toggleVerbose(true)

		const chainId = 137 // optimism goerli
		const tokenAmount = 0.00001337
		const tokenType = 0 // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
		const provider = await peanut.getDefaultProvider(String(chainId))
		const wallet = new ethers.Wallet(TEST_WALLET_PRIVATE_KEY, provider)
		setTimeout(() => {}, 9000)
		const resp = await peanut.createLink({
			structSigner: {
				signer: wallet,
			},
			linkDetails: {
				chainId: chainId,
				tokenAmount: tokenAmount,
				tokenType: tokenType,
			},
		})

		// check status of link
		setTimeout(() => {}, 4000)
		console.log('getting link details now')
		const status = await peanut.getLinkDetails({ provider: provider, link: resp.link })
		console.log('status', status)

		// claim link using api
		const receiverAddress = optimism_goerli_wallet.address
		setTimeout(() => {}, 9000)
		const res = await peanut.claimLinkGasless({
			link: resp.link,
			recipientAddress: receiverAddress,
			APIKey: apiToken,
			baseUrl: API_URL,
		})
		expect(res.status).toBe('success')
		console.log('claim link response', res.data)

		links.push(resp.link)
	}, 60000) // 60 seconds timeout

	it('should create two links and claim them simultaneously', async function () {
		const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''

		const chainId = 420 // optimism goerli
		const tokenAmount = 0.00001337
		const tokenType = 0 // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155

		// Create two links
		const resp1 = await peanut.createLink({
			structSigner: {
				signer: optimism_goerli_wallet,
			},
			linkDetails: {
				chainId: chainId,
				tokenAmount: tokenAmount,
				tokenType: tokenType,
			},
		})

		const resp2 = await peanut.createLink({
			structSigner: {
				signer: optimism_goerli_wallet,
			},
			linkDetails: {
				chainId: chainId,
				tokenAmount: tokenAmount,
				tokenType: tokenType,
			},
		})

		// Claim both links simultaneously
		const receiverAddress = optimism_goerli_wallet.address

		const res1 = await peanut.claimLinkGasless({
			link: resp1.link,
			recipientAddress: receiverAddress,
			APIKey: apiToken,
			baseUrl: API_URL,
		})

		const res2 = await peanut.claimLinkGasless({
			link: resp2.link,
			recipientAddress: receiverAddress,
			APIKey: apiToken,
			baseUrl: API_URL,
		})

		expect(res1.status).toBe('success')
		expect(res2.status).toBe('success')
		links.push(resp1.link)
		links.push(resp2.link)
	}, 120000) // 120 seconds timeout

	it('should fail to claim an already claimed link', async function () {
		const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''

		const chainId = 420 // optimism goerli
		const tokenAmount = 0.0001337
		const tokenType = 0 // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155

		// Create a link
		const resp = await peanut.createLink({
			structSigner: {
				signer: optimism_goerli_wallet,
			},
			linkDetails: {
				chainId: chainId,
				tokenAmount: tokenAmount,
				tokenType: tokenType,
			},
		})
		links.push(resp.link)

		// Claim the link
		const receiverAddress = optimism_goerli_wallet.address

		const res = await peanut.claimLinkGasless({
			link: resp.link,
			recipientAddress: receiverAddress,
			APIKey: apiToken,
			baseUrl: API_URL,
		})

		expect(res.status).toBe('success')

		// Try to claim the link again (it should fail)
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const res = await peanut.claimLinkGasless({
				link: resp.link,
				recipientAddress: receiverAddress,
				APIKey: apiToken,
				baseUrl: API_URL,
			})
			expect(false).toBe(true)
		} catch {
			expect(true).toBe(true)
		}
	}, 90000) // 90 seconds timeout

	it('should fail to claim a link with invalid recipient address', async function () {
		const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''

		const chainId = 420 // optimism goerli
		const tokenAmount = 0.0001337
		const tokenType = 0 // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155

		// Create a link
		const resp = await peanut.createLink({
			structSigner: {
				signer: optimism_goerli_wallet,
			},
			linkDetails: {
				chainId: chainId,
				tokenAmount: tokenAmount,
				tokenType: tokenType,
			},
		})

		// Try to claim the link with an invalid recipient address
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const res = await peanut.claimLinkGasless({
				link: resp.link,
				recipientAddress: '0xInvalidAddress',
				APIKey: apiToken,
				baseUrl: API_URL,
			})
			expect(false).toBe(true) // this line should not be reached
		} catch {
			expect(true).toBe(true) // expect an error to be thrown
		}
	}, 90000) // 90 seconds timeout

	const numLinks = 5
	it(
		'should create multiple links and claim them simultaneously',
		async function () {
			const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''

			const chainId = 420 // optimism goerli
			const tokenAmount = 0.00001337
			const tokenType = 0 // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155

			// Create multiple links
			const resp = await peanut.createLinks({
				structSigner: {
					signer: optimism_goerli_wallet,
				},
				linkDetails: {
					chainId: chainId,
					tokenAmount: tokenAmount,
					tokenType: tokenType,
				},
				numberOfLinks: numLinks,
			})

			console.log('resp', resp)

			// Claim all links simultaneously
			// Claim all links simultaneously
			const receiverAddress = optimism_goerli_wallet.address
			const claimPromises = resp.flatMap((link) => {
				// Ensure link.link is an array
				const links = Array.isArray(link.link) ? link.link : [link.link]
				console.log('links', links)
				return links.map((singleLink) =>
					peanut.claimLinkGasless({
						link: singleLink,
						recipientAddress: receiverAddress,
						APIKey: apiToken,
						baseUrl: API_URL,
					})
				)
			})
			const claimResponses = await Promise.all(claimPromises)

			// Check that all claims were successful
			claimResponses.forEach((res) => expect(res.status).toBe('success'))

			// Add created links to the links array
			resp.forEach((link) => links.push(link.link as string))
		},
		numLinks * 120000
	) // Adjust timeout based on number of links
})

describe('Testnet Tests', function () {
	const testnets = Object.values(peanut.CHAIN_DETAILS).filter((net) => !net.mainnet)
	// peanut.toggleVerbose()

	testnets.forEach((net) => {
		it(`should run tests on ${net.name}`, async function () {
			// if (!['Linea'].includes(net.name)) {
			// 	//  'Milkomeda C1 Testnet', 'Sepolia'
			// if (!['Base Goerli'].includes(net.name)) {
			// 	return
			// }
			console.log(`Running tests on ${net.name}`)
			// Set up your test parameters based on the current testnet
			const chainId = net.chainId
			const provider = await peanut.getDefaultProvider(String(chainId))
			const TEST_WALLET_PRIVATE_KEY = process.env.TEST_WALLET_PRIVATE_KEY as string
			const wallet = new ethers.Wallet(TEST_WALLET_PRIVATE_KEY, provider)

			// Create a link
			console.log('Creating a link for', net.name)
			let resp
			try {
				resp = await peanut.createLink({
					structSigner: {
						signer: wallet,
					},
					linkDetails: {
						chainId: chainId,
						tokenAmount: 0.00001,
						tokenType: 0, // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
					},
				})
			} catch (error) {
				console.log(error)
			}

			// Claim the link
			const apiToken = process.env.PEANUT_DEV_API_KEY ?? ''
			const receiverAddress = wallet.address
			const res = await peanut.claimLinkGasless({
				link: resp.link,
				recipientAddress: receiverAddress,
				APIKey: apiToken,
				baseUrl: API_URL,
			})

			expect(res.status).toBe('success')
		}, 600000) // 600 seconds timeout (lots of testnets)
	})
})
