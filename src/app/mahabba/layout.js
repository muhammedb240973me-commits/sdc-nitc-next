export const metadata = {
  title: 'Essence of Mahabba',
  description: 'Join us weekly for spiritual grounding, moral guidance, and a community of brotherhood. Secure your permanent digital pass today.',
  openGraph: {
    title: 'Essence of Mahabba',
    description: 'Join us weekly for spiritual grounding, moral guidance, and a community of brotherhood. Secure your permanent digital pass today.',
    url: 'https://sdcnitc.vercel.app/mahabba',
    siteName: 'SDC NIT Calicut',
    images: [
      {
        url: '/mahabba-preview.jpeg', // Points to the image in your public folder
        width: 1200,
        height: 630,
        alt: 'Essence of Mahabba',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Essence of Mahabba ',
    description: 'Join us weekly for spiritual grounding, moral guidance, and a community of brotherhood. Secure your permanent digital pass today.',
    images: ['/mahabba-preview.jpeg'],
  },
};

export default function MahabbaLayout({ children }) {
  return <>{children}</>;
}