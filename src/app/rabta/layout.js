export const metadata = {
  title: 'Rabta | Feedback • SDC NITC',
  description: 'Share your feedback for Rabta — A Spiritual Gathering for Non-Malayali Students with Muhammed Falil Noorani, organized by SDC NITC.',
  openGraph: {
    title: 'Rabta | Submit Your Feedback',
    description: 'A Spiritual Gathering for Non-Malayali Students • Students Development Cell, NIT Calicut',
    url: 'https://sdcnitc.vercel.app/rabta',
    siteName: 'SDC NIT Calicut',
    images: [{ url: '/rabta-1.jpg', width: 1200, height: 630, alt: 'Rabta Spiritual Gathering' }],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RabtaLayout({ children }) {
  return <>{children}</>;
}