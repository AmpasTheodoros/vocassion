import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { SidebarItem } from './sidebar-item'
import { ClerkLoaded, ClerkLoading, UserButton, SignOutButton } from '@clerk/nextjs'
import { Loader } from 'lucide-react'

type Props = {
  className?: string
}

export const Sidebar = ({ className }: Props) => {
  return (
    <div
      className={cn(
        'h-full lg:w-[256px] lg:fixed flex left-0 top-0 px-4 border-r-2 flex-col',
        className
      )}
    >
      <Link href='/learn'>
        <div className='pt-8 pl-4 pb-7 flex items-center gap-x-3'>
          <Image src='/mascot.svg' alt='Mascot' height={40} width={40} />
          <h1 className='text-2xl font-extrabold text-green-600 tracking-wide'>
            Vocassion
          </h1>
        </div>
      </Link>
      <div className='flex flex-col gap-y-2 flex-1'>
        <SidebarItem label='Learn' href='/learn' iconSrc='/learn.svg' />
        <SidebarItem
          label='Leaderboard'
          href='/leaderboard'
          iconSrc='/leaderboard.svg'
        />
        <SidebarItem label='Quests' href='/quests' iconSrc='/quests.svg' />
        <SidebarItem label='Shop' href='/shop' iconSrc='/shop.svg' />
        <SidebarItem label='Profile' href='/profile' iconSrc='/boy.svg' />
        <SidebarItem label='Settings' href='/settings' iconSrc='/settings.svg' />
        <SidebarItem label='Help' href='/help' iconSrc='/help.svg' />
        <ClerkLoading>
          <Loader className='h-5 w-5 text-muted-foreground animate-spin' />
        </ClerkLoading>
        <ClerkLoaded>
          <SignOutButton>
            <SidebarItem label='Logout' href='#' iconSrc='/logout.svg' />
          </SignOutButton>
        </ClerkLoaded>
      </div>
    </div>
  )
}
