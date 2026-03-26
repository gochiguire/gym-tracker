import '../styles/globals.css'

export const metadata = {
  title: 'Gym Tracker',
  description: 'Track your weightlifting progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
