export const metadata = {
  title: 'Zahra NITC | Women Spiritual Wing',
  description: 'Empowerment, sisterhood, and weekly spiritual halaqa live streams exclusively organized for female students at NIT Calicut.',
  openGraph: {
    title: 'Zahra NITC | Women Spiritual Wing',
    description: 'Exclusive spiritual halaqa live streams & sisterhood at NIT Calicut.',
    url: 'https://sdcnitc.vercel.app/zahra',
    siteName: 'Zahra SDC NIT Calicut',
    images: [{ url: '/zahra-preview.jpg', width: 1200, height: 630, alt: 'Zahra NITC' }],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ZahraLayout({ children }) {
  return <>{children}</>;
}