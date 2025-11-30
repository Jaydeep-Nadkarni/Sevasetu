import { motion } from 'framer-motion'

export const Skeleton = ({
  width,
  height,
  variant = 'text', // text, circular, rectangular
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-gray-200 dark:bg-gray-700'
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  }

  return (
    <motion.div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    />
  )
}
