// Moralis NFT Service
// Uses Moralis API to fetch user NFTs for avatar selection

export interface NFTMetadata {
    tokenId: string
    tokenAddress: string
    name: string
    symbol: string
    tokenUri?: string
    metadata?: {
        name?: string
        image?: string
        description?: string
    }
}

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY

/**
 * Fetch NFTs owned by a wallet address
 * @param address Wallet address to fetch NFTs for
 * @param chain Network to query (polygon or polygon_amoy)
 * @returns Array of NFT metadata
 */
export async function fetchUserNFTs(
    address: string,
    chain: 'polygon' | 'polygon_amoy' = 'polygon_amoy'
): Promise<NFTMetadata[]> {
    if (!MORALIS_API_KEY) {
        console.warn('NEXT_PUBLIC_MORALIS_API_KEY not set')
        return []
    }

    const chainId = chain === 'polygon' ? '0x89' : '0x13882' // Polygon mainnet or Amoy

    try {
        const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chainId}&format=decimal&media_items=true`,
            {
                headers: {
                    'X-API-Key': MORALIS_API_KEY,
                    'Accept': 'application/json',
                },
            }
        )

        if (!response.ok) {
            console.error('Moralis API error:', response.status)
            return []
        }

        const data = await response.json()

        return (data.result || []).map((nft: any) => ({
            tokenId: nft.token_id,
            tokenAddress: nft.token_address,
            name: nft.name || 'Unknown NFT',
            symbol: nft.symbol || 'NFT',
            tokenUri: nft.token_uri,
            metadata: nft.metadata ? (
                typeof nft.metadata === 'string'
                    ? JSON.parse(nft.metadata)
                    : nft.metadata
            ) : undefined,
        }))
    } catch (error) {
        console.error('Error fetching NFTs:', error)
        return []
    }
}

/**
 * Get the image URL from NFT metadata
 * Handles IPFS URLs and various metadata formats
 */
export function getNFTImageUrl(nft: NFTMetadata): string | null {
    const image = nft.metadata?.image
    if (!image) return null

    // Convert IPFS URLs to HTTP gateway
    if (image.startsWith('ipfs://')) {
        return image.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    return image
}
