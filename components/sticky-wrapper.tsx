import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
}

export const StickyWrapper = ({ children, className }: Props) => {
  return (
    <div className={cn(
      'hidden lg:block sticky self-end bottom-6 min-w-[400px]',
      className
    )}>
      <div className='min-h-[calc(100vh-48px)] sticky top-6 flex flex-col gap-y-6'>
        {children}
      </div>
    </div>
  )
}
