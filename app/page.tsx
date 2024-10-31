'use client'

import { SectionBuilderProvider } from './context/SectionBuilderContext'
import SectionBuilder from './components/SectionBuilder'

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <SectionBuilderProvider>
        <SectionBuilder />
      </SectionBuilderProvider>
    </div>
  )
}