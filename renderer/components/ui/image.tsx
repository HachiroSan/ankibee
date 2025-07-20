import React from 'react'
import NextImage, { ImageProps as NextImageProps } from 'next/image'

interface ImageProps extends Omit<NextImageProps, 'fetchPriority'> {
  fetchPriority?: 'high' | 'low' | 'auto'
}

export const Image: React.FC<ImageProps> = ({ fetchPriority, ...props }) => {
  // Convert fetchPriority to lowercase to avoid React warning
  const imageProps = {
    ...props,
    ...(fetchPriority && { fetchpriority: fetchPriority })
  }

  return <NextImage {...imageProps} />
} 