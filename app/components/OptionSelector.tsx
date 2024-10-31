'use client'

import { useEffect, useState } from 'react'
import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'

interface TailwindClasses {
  [key: string]: string[]
}

export const OptionSelector: React.FC = () => {
  const { selectedElement, options, updateOption, selectedNodes } = useSectionBuilder()
  const [tailwindClasses, setTailwindClasses] = useState<TailwindClasses>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css')
      .then(response => response.text())
      .then(css => {
        const classes: TailwindClasses = {
          width: [],
          height: [],
          padding: [],
          margin: [],
          display: [],
          position: [],
          flexbox: [],
          grid: [],
          backgroundColor: [],
          textColor: [],
          borderColor: [],
          borderWidth: [],
          borderRadius: [],
          boxShadow: [],
          opacity: [],
        }

        const classRegex = /\.([a-zA-Z0-9-]+)\{/g
        let match
        while ((match = classRegex.exec(css)) !== null) {
          const className = match[1]
          if (className.startsWith('w-')) classes.width.push(className)
          else if (className.startsWith('h-')) classes.height.push(className)
          else if (className.startsWith('p-') || className.startsWith('px-') || className.startsWith('py-')) classes.padding.push(className)
          else if (className.startsWith('m-') || className.startsWith('mx-') || className.startsWith('my-')) classes.margin.push(className)
          else if (className.startsWith('flex') || className.startsWith('items-') || className.startsWith('justify-')) classes.flexbox.push(className)
          else if (className.startsWith('grid-') || className.startsWith('col-') || className.startsWith('row-')) classes.grid.push(className)
          else if (className.startsWith('bg-')) classes.backgroundColor.push(className)
          
          else if (className.startsWith('text-') && !className.includes('align') && !className.includes('decoration')) classes.textColor.push(className)
          else if (className.startsWith('border-') && className.length > 7) classes.borderColor.push(className)
          else if (className.startsWith('border-') && className.length <= 7) classes.borderWidth.push(className)
          else if (className.startsWith('rounded')) classes.borderRadius.push(className)
          else if (className.startsWith('shadow')) classes.boxShadow.push(className)
          else if (className.startsWith('opacity')) classes.opacity.push(className)
          else if (className === 'block' || className === 'inline' || className === 'inline-block' || className === 'hidden') classes.display.push(className)
          else if (className.startsWith('absolute') || className.startsWith('relative') || className.startsWith('fixed') || className.startsWith('sticky')) classes.position.push(className)
        }

        setTailwindClasses(classes)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching Tailwind classes:', error)
        setIsLoading(false)
      })
  }, [])

  const handleOptionChange = (key: string, value: string, isChecked: boolean) => {
    selectedNodes.forEach(nodeId => {
      const currentOptions = options[nodeId]?.[key] ? options[nodeId][key].split(' ') : []
      let newOptions: string[]

      if (isChecked) {
        newOptions = [...currentOptions, value]
      } else {
        newOptions = currentOptions.filter(option => option !== value)
      }

      updateOption(nodeId, key, newOptions.join(' '))
    })
  }

  if (!selectedElement || selectedNodes.length === 0) {
    return <div className="p-4">Select an element and at least one node to see options</div>
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  const renderOptions = () => {
    switch (selectedElement) {
      case 'layout':
      case 'color':
        return (
          <Accordion type="multiple" className="w-full">
            {Object.entries(tailwindClasses).map(([key, classes]) => (
              <AccordionItem value={key} key={key}>
                <AccordionTrigger>{key.charAt(0).toUpperCase() + key.slice(1)}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {classes.map((cls) => (
                      <div key={cls} className="flex items-center space-x-2">
                        <Checkbox
                          id={cls}
                          checked={selectedNodes.every(nodeId => options[nodeId]?.[key]?.includes(cls))}
                          onCheckedChange={(checked) => handleOptionChange(key, cls, checked as boolean)}
                        />
                        <Label htmlFor={cls}>{cls}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Options for selected nodes</h2>
      {renderOptions()}
      <div className="space-y-2">
        <Label htmlFor="customClasses">Custom Classes</Label>
        <Input
          id="customClasses"
          value={selectedNodes.length === 1 ? options[selectedNodes[0]]?.customClasses || '' : ''}
          onChange={(e) => selectedNodes.forEach(nodeId => updateOption(nodeId, 'customClasses', e.target.value))}
          placeholder="Enter custom Tailwind classes"
        />
      </div>
    </div>
  )
}