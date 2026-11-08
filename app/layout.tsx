export const metadata = {
  title: 'FarmaCerca 24h',
  description: 'Preguntamos por ti a 3 farmacias a la vez',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body>{children}</body>
    </html>
  )
}
