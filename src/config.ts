import type { CollectionEntry } from 'astro:content'

export interface TagType {
  tag: string
  count: number
  pages: CollectionEntry<'blog'>[]
}

export const SiteMetadata = {
  title: 'Prismatic Path',
  description:
    'Prismatic Path is a collaboration between Chris Tham and Greg Allardice. This site contains a series of musings, ruminations, thoughts and considerations that invite you to explore a path or a journey that you may not have otherwise considered.',
  author: {
    name: 'Chris Tham',
    twitter: '@chris1tham',
    url: 'https://christham.net',
    email: 'chris@christham.net',
    summary: 'Outrageous actualiser.'
  },
  org: {
    name: 'Hello Tham',
    twitter: '@hellothamcom',
    url: 'https://hellotham.com',
    email: 'info@hellotham.com',
    summary:
      'Hello Tham is a boutique management consulting firm. We specialise in Business and IT strategies, operating models, strategic roadmaps, enterprise architecture, analytics and business process design.'
  },
  location: 'Rivendell, Middle Earth',
  latlng: [-42.5925, 147.0334] as [number, number],
  repository: 'https://github.com/hellotham/hello-astro',
  buildTime: new Date()
}

export { default as Logo } from './assets/images/2020/08/spectrum.svg'
export { default as LogoImage } from './assets/images/2020/08/spectrum.png'
export { default as FeaturedImage } from './assets/images/2020/08/DSC05210_o.jpeg'
export { default as DefaultImage } from './assets/images/2020/08/DSC_5380-Edit_o.jpeg'

export const NavigationLinks = [
  { name: 'Home', href: '' },
  { name: 'About', href: 'about' },
  { name: 'Contact', href: 'contact' },
  { name: 'Authors', href: 'authors' }
]

export const PAGE_SIZE = 128
