'use client'

import { useReadContract } from 'wagmi'
import Identicon from '@polkadot/react-identicon'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
    address: string
    size?: number
    className?: string
    showFallbackIcon?: boolean
}

/**
 * UserAvatar component that displays:
 * 1. User's NFT avatar if set
 * 2. Polkadot.js identicon as fallback
 */
export function UserAvatar({
    address,
    size = 32,
    className,
    showFallbackIcon = true
}: UserAvatarProps) {
    // Fetch profile from contract - cache longer to reduce CUs
    const { data: profile } = useReadContract({
        address: CONTRACTS.userProfile as `0x${string}`,
        abi: userProfileABI,
        functionName: 'getProfile',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
            gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        },
    })

    // avatarType: 0 = identicon, 1 = NFT, 2 = custom IPFS
    const avatarType = profile?.avatarType ?? 0
    const avatarURI = profile?.avatarURI || ''

    // Convert IPFS URLs
    const imageUrl = avatarURI.startsWith('ipfs://')
        ? avatarURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : avatarURI

    // If using identicon or no avatar set
    if (avatarType === 0 || !avatarURI) {
        if (!showFallbackIcon) {
            return null
        }
        return (
            <div className={cn("rounded-full overflow-hidden flex items-center justify-center bg-muted", className)} style={{ width: size, height: size }}>
                <Identicon
                    value={address}
                    size={size}
                    theme="ethereum"
                />
            </div>
        )
    }

    // Using NFT or custom image
    return (
        <Avatar className={cn("", className)} style={{ width: size, height: size }}>
            <AvatarImage src={imageUrl} alt="Avatar" />
            <AvatarFallback className="bg-muted">
                <Identicon
                    value={address}
                    size={size}
                    theme="ethereum"
                />
            </AvatarFallback>
        </Avatar>
    )
}
