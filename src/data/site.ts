export const SITE = {
  name: 'behindthestack',
  url: 'https://behindthestack.in',
  credit: 'built by Santosh Jha',
  tagline: "What's actually running underneath.",
  lede: 'Experiments from every layer of the stack. What was built, what broke, and the numbers that came out of it.',
  newsletter: 'https://cyberinfosec.substack.com',
  rev: new Date().toISOString().slice(0, 10),
} as const;

export const LINKS = [
  { label: 'github', href: 'https://github.com/santosh3743' },
  { label: 'x', href: 'https://x.com/santoshjha37' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/santosh-kumar-jha/' },
  { label: 'newsletter', href: 'https://cyberinfosec.substack.com' },
  { label: 'rss', href: '/rss.xml' },
] as const;

export const isPreview = import.meta.env.PUBLIC_SHOW_DRAFTS === '1';
