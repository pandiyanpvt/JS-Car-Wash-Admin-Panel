import { forwardRef, type PropsWithChildren } from 'react'
import { Box, type BoxProps } from '@mui/material'
import { motion } from 'framer-motion'

// Create motion component - framer-motion v12 supports motion() but recommends component prop
// Using motion(Box) is still valid, but if create exists, use it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = typeof (motion as any).create === 'function' ? (motion as any).create(Box) : motion(Box)

export type PageContainerProps = BoxProps &
  PropsWithChildren<{
    delay?: number
  }>

const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(function PageContainer(
  { children, delay = 0, ...boxProps },
  ref,
) {
  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.96 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      {...boxProps}
    >
      {children}
    </MotionBox>
  )
})

export default PageContainer

