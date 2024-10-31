'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { NodeTree } from './NodeTree'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
}

export default function PreviewAndCode() {
  const { options, componentName, nodeTree } = useSectionBuilder()
  const [zoom, setZoom] = useState(100)

  const generateNodeJSX = (node: TreeNode, indent: string = ''): string => {
    const nodeClasses = options[node.id] ? Object.values(options[node.id]).filter(Boolean).join(' ') : ''
    const childrenJSX = node.children.map(child => generateNodeJSX(child, indent + '  ')).join('\n')
    return `${indent}<${node.tagName} id="${node.id}" className="${nodeClasses}">
${childrenJSX || `${indent}  {/* ${node.name} content */}`}
${indent}</${node.tagName}>`
  }

  const generateCode = useMemo(() => {
    return `import React from 'react'

export const ${componentName} = () => {
  return (
${generateNodeJSX(nodeTree[0], '    ')}
  )
}
`
  }, [componentName, nodeTree, options])

  const generateNodeHTML = (node: TreeNode): string => {
    const nodeClasses = options[node.id] ? Object.values(options[node.id]).filter(Boolean).join(' ') : ''
    const childrenHTML = node.children.map(child => generateNodeHTML(child)).join('\n')
    return `<${node.tagName} id="${node.id}" class="${nodeClasses}">
  ${childrenHTML || `<!-- ${node.name} content -->`}
</${node.tagName}>`
  }

  const previewContent = useMemo(() => {
    return generateNodeHTML(nodeTree[0])
  }, [nodeTree, options])

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode)
    toast.success('Code copied to clipboard!')
  }

  useEffect(() => {
    // Dynamically load Tailwind CSS
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="tree">Node Tree</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="flex-grow overflow-auto p-4">
        <div className="mb-4">
          <Slider
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            min={50}
            max={200}
            step={10}
          />
          <span className="text-sm text-gray-500">Zoom: {zoom}%</span>
        </div>
        <div style={{ zoom: `${zoom}%` }}>
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>
      </TabsContent>
      <TabsContent value="code" className="flex-grow overflow-auto p-4">
        <div className="relative">
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code>{generateCode}</code>
          </pre>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="tree" className="flex-grow overflow-auto">
        <NodeTree />
      </TabsContent>
    </Tabs>
  )
}