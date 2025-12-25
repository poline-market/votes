// Storacha integration using correct client package
import * as Client from '@storacha/client'
import { StoreMemory } from '@storacha/client/stores/memory'
import * as Proof from '@storacha/client/proof'
import { Signer } from '@storacha/client/principal/ed25519'
import * as DID from '@ipld/dag-ucan/did'

// User's Storacha DID key
const STORACHA_DID = 'did:key:z6MkvrGZ1dgCEqYtu8YeMgAnDNmBXDNCdyQomWnG6eref7WV'

let client: Client.Client | null = null

/**
 * Initialize Storacha client with proper authentication
 */
async function getClient(): Promise<Client.Client> {
    if (client) return client

    try {
        // Create client with memory store
        const principal = Signer.parse(STORACHA_DID)
        const store = new StoreMemory()

        client = await Client.create({ principal, store })

        console.log('✅ Storacha client initialized')
        return client
    } catch (error) {
        console.error('❌ Failed to initialize Storacha client:', error)
        throw error
    }
}

/**
 * Upload file to IPFS/Filecoin via Storacha
 */
export async function uploadToStoracha(file: File): Promise<string> {
    try {
        const client = await getClient()
        const cid = await client.uploadFile(file)

        console.log(`✅ File uploaded to Storacha: ${cid}`)
        return cid.toString()
    } catch (error) {
        console.error('❌ Storacha upload failed:', error)
        throw new Error(`Upload failed: ${error}`)
    }
}

/**
 * Upload multiple files as directory
 */
export async function uploadDirectoryToStoracha(files: File[]): Promise<string> {
    try {
        const client = await getClient()
        const cid = await client.uploadDirectory(files)

        console.log(`✅ Directory uploaded to Storacha: ${cid}`)
        return cid.toString()
    } catch (error) {
        console.error('❌ Storacha directory upload failed:', error)
        throw new Error(`Directory upload failed: ${error}`)
    }
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getStorachaGatewayUrl(cid: string): string {
    return `https://${cid}.ipfs.storacha.link`
}

/**
 * Get file from IPFS via gateway
 */
export async function fetchFromStoracha(cid: string): Promise<Response> {
    const url = getStorachaGatewayUrl(cid)
    return fetch(url)
}
