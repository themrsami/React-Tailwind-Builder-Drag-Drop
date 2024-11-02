'use client'

import { useEffect, useState } from 'react'
import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
  text?: string
  attributes?: Record<string, string>
}

interface TailwindClasses {
  [key: string]: string[]
}

export const OptionSelector: React.FC = () => {
  const { selectedElement, nodeTree, updateNodeTree, selectedNodes } = useSectionBuilder()
  const [tailwindClasses, setTailwindClasses] = useState<TailwindClasses>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css')
      .then(response => response.text())
      .then(css => {
        const classes: TailwindClasses = {
          layout: [],
          flexbox: [],
          grid: [],
          spacing: [],
          sizing: [],
          typography: [],
          backgrounds: [],
          borders: [],
          effects: [],
          filters: [],
          tables: [],
          transitions: [],
          transforms: [],
          interactivity: [],
          svg: [],
          accessibility: [],
        }

        const classRegex = /\.([a-zA-Z0-9-]+)/g
        let match
        while ((match = classRegex.exec(css)) !== null) {
          const className = match[1]
          if (className.startsWith('container') || className.startsWith('columns-') || className.startsWith('break-') || className.startsWith('box-')) classes.layout.push(className)
          else if (className.startsWith('flex') || className.startsWith('order-') || className.startsWith('justify-') || className.startsWith('items-') || className.startsWith('content-')) classes.flexbox.push(className)
          else if (className.startsWith('grid') || className.startsWith('col-') || className.startsWith('row-')) classes.grid.push(className)
          else if (className.startsWith('p-') || className.startsWith('m-') || className.startsWith('space-')) classes.spacing.push(className)
          else if (className.startsWith('w-') || className.startsWith('h-') || className.startsWith('min-') || className.startsWith('max-')) classes.sizing.push(className)
          else if (className.startsWith('font-') || className.startsWith('text-') || className.startsWith('leading-') || className.startsWith('tracking-') || className.startsWith('align-')) classes.typography.push(className)
          else if (className.startsWith('bg-') || className.startsWith('from-') || className.startsWith('via-') || className.startsWith('to-')) classes.backgrounds.push(className)
          else if (className.startsWith('border') || className.startsWith('rounded')) classes.borders.push(className)
          else if (className.startsWith('shadow') || className.startsWith('opacity') || className.startsWith('mix-blend-')) classes.effects.push(className)
          else if (className.startsWith('blur') || className.startsWith('brightness') || className.startsWith('contrast') || className.startsWith('grayscale') || className.startsWith('hue-rotate') || className.startsWith('invert') || className.startsWith('saturate') || className.startsWith('sepia')) classes.filters.push(className)
          else if (className.startsWith('table-')) classes.tables.push(className)
          else if (className.startsWith('transition') || className.startsWith('duration-') || className.startsWith('ease-') || className.startsWith('delay-')) classes.transitions.push(className)
          else if (className.startsWith('scale-') || className.startsWith('rotate-') || className.startsWith('translate-') || className.startsWith('skew-')) classes.transforms.push(className)
          else if (className.startsWith('cursor-') || className.startsWith('pointer-events-') || className.startsWith('resize-') || className.startsWith('select-') || className.startsWith('scroll-')) classes.interactivity.push(className)
          else if (className.startsWith('fill-') || className.startsWith('stroke-')) classes.svg.push(className)
          else if (className.startsWith('sr-') || className.startsWith('not-sr-')) classes.accessibility.push(className)
        }

        // Remove duplicates
        for (const key in classes) {
          classes[key] = Array.from(new Set(classes[key]))
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
    updateNodeTree(prevTree => {
      const updateNodeClasses = (node: TreeNode): TreeNode => {
        if (selectedNodes.includes(node.id)) {
          const currentClasses = node.attributes?.className?.split(' ') || []
          let newClasses: string[]

          if (isChecked) {
            newClasses = [...currentClasses, value]
          } else {
            newClasses = currentClasses.filter(cls => cls !== value)
          }

          return {
            ...node,
            attributes: {
              ...node.attributes,
              className: newClasses.join(' ')
            }
          }
        }

        return {
          ...node,
          children: node.children.map(updateNodeClasses)
        }
      }

      return prevTree.map(updateNodeClasses)
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
                          checked={selectedNodes.every(nodeId => {
                            const node = findNodeById(nodeTree, nodeId)
                            return node?.attributes?.className?.includes(cls) || false
                          })}
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
      <div className="space-y-2">
        <Label htmlFor="customClasses">Custom Classes</Label>
        <Input
          id="customClasses"
          value={selectedNodes.length === 1 ? findNodeById(nodeTree, selectedNodes[0])?.attributes?.className || '' : ''}
          onChange={(e) => {
            updateNodeTree(prevTree => {
              const updateNodeClasses = (node: TreeNode): TreeNode => {
                if (selectedNodes.includes(node.id)) {
                  return {
                    ...node,
                    attributes: {
                      ...node.attributes,
                      className: e.target.value
                    }
                  }
                }
                return {
                  ...node,
                  children: node.children.map(updateNodeClasses)
                }
              }
              return prevTree.map(updateNodeClasses)
            })
          }}
          placeholder="Enter custom Tailwind classes"
        />
      </div>
      <div className="overflow-y-auto h-[80vh] hide-scrollbar"> {/* Adjust the height as needed */}
        <h2 className="text-lg font-semibold">Options for selected nodes</h2>
        {renderOptions()}
      </div>
    </div>
  )
}

// Helper function to find a node by ID
function findNodeById(tree: TreeNode[], id: string): TreeNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node
    const found = findNodeById(node.children, id)
    if (found) return found
  }
  return undefined
}