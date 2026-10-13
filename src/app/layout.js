import './globals.css';

export const metadata = {
  title: "SDC NITC | Students' Development Cell",
  description: "Students' Development Cell (SDC) at National Institute of Technology Calicut under Sunni Students' Federation (SSF). 15+ years of academic mentorship and moral guidance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}