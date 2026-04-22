import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Beauty Book',
  description: 'Discover local beauty professionals near you',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
