'use client'

import { useReadContract } from 'wagmi'
import { CONTRACTS, userProfileABI } from '@/lib/contracts'
import { UserAvatar } from './UserAvatar'
import { MarkdownBio } from './MarkdownBio'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from './ui/hover-card'

interface ProfileCardProps {
    address: string
    showBio?: boolean
    showBadge?: boolean
    badgeText?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

/**
 * ProfileCard component - Shows user profile info with hover card
 * Displays avatar, name (or shortened address), and optionally bio
 */
export function ProfileCard({
    address,
    showBio = false,
    showBadge = false,
    badgeText = 'Proposer',
    size = 'md',
    className,
}: ProfileCardProps) {
    const { data: profile } = useReadContract({
        address: CONTRACTS.userProfile as `0x${string}`,
        abi: userProfileABI,
        functionName: 'getProfile',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        },
    })

    const displayName = profile?.displayName || `${address.slice(0, 6)}...${address.slice(-4)}`
    const bio = profile?.bio || ''
    const hasProfile = profile?.displayName || profile?.bio

    const sizes = {
        sm: { avatar: 24, text: 'text-xs' },
        md: { avatar: 32, text: 'text-sm' },
        lg: { avatar: 40, text: 'text-base' },
    }

    const { avatar: avatarSize, text: textSize } = sizes[size]

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className={cn("flex items-center gap-2 cursor-pointer", className)}>
                    <UserAvatar address={address} size={avatarSize} />
                    <div className="flex items-center gap-2">
                        <span className={cn("font-medium", textSize)}>
                            {displayName}
                        </span>
                        {showBadge && (
                            <Badge variant="secondary" className="text-[10px]">
                                {badgeText}
                            </Badge>
                        )}
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" align="start">
                <div className="flex gap-4">
                    <UserAvatar address={address} size={48} />
                    <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-semibold">{displayName}</h4>
                        <p className="text-xs text-muted-foreground font-mono">
                            {address.slice(0, 10)}...{address.slice(-8)}
                        </p>
                        {profile?.isDelegate && (
                            <Badge variant="outline" className="text-[10px] mt-1">
                                Delegate
                            </Badge>
                        )}
                    </div>
                </div>
                {bio && showBio && (
                    <div className="mt-3 pt-3 border-t">
                        <MarkdownBio content={bio} className="text-sm" />
                    </div>
                )}
                {!hasProfile && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                        Este usuário ainda não configurou seu perfil
                    </p>
                )}
            </HoverCardContent>
        </HoverCard>
    )
}
