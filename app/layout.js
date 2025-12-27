import './globals.css'

export const metadata = {
  title: 'PictureGenerate',
  description: 'Next.js app scaffold'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
