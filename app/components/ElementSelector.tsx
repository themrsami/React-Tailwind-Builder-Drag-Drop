'use client'

import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Button } from '@/components/ui/button'

export const ElementSelector: React.FC = () => {
  const { selectedElement, setSelectedElement } = useSectionBuilder()

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Elements</h2>
      <Button
        variant={selectedElement === 'layout' ? 'default' : 'outline'}
        onClick={() => setSelectedElement('layout')}
        className="w-full"
      >
        Layout & Color
      </Button>
    </div>
  )
}