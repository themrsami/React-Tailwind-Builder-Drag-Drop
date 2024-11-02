'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Copy, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { NodeTree } from './NodeTree'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MonacoEditor from '@monaco-editor/react'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { v4 as uuidv4 } from 'uuid'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
  text?: string
  attributes?: Record<string, string>
}

interface DragItem {
  id: string
  type: string
}

const DraggableElement: React.FC<{
  node: TreeNode
  onNodeMove: (nodeId: string, newParentId: string, index: number) => void
}> = ({ node, onNodeMove }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: 'NODE',
    item: { id: node.id, type: 'NODE' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop<DragItem, void, unknown>({
    accept: 'NODE',
    hover: (item, monitor) => {
      if (!ref.current) {
        return
      }
      const draggedId = item.id
      const overId = node.id

      if (draggedId === overId) {
        return
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top

      if (hoverClientY < hoverMiddleY) {
        onNodeMove(draggedId, node.id, 0)
      } else {
        onNodeMove(draggedId, node.id, node.children.length)
      }
    },
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={`border-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="">
        {React.createElement(
          node.tagName,
          { ...node.attributes },
          node.text || node.children.map(child => <DraggableElement key={child.id} node={child} onNodeMove={onNodeMove} />)
        )}
        {node.tagName === 'React.Fragment'}
      </div>
    </div>
  )
}

export default function PreviewAndCode({ onTabChange }: { onTabChange: (tab: 'preview' | 'react-code' | 'html-code' | 'tree') => void }) {
  const { componentName, nodeTree, updateNodeTree, setCurrentReactCode, setCurrentHtmlCode } = useSectionBuilder()
  const [zoom, setZoom] = useState(100)
  const [reactCode, setReactCode] = useState(`import React from 'react'

export const ${componentName} = () => {
  return ()
}
`)
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
</body>
</html>`)

  const generateNodeJSX = (node: TreeNode, indent: string = ''): string => {
    if (!node.tagName) {
      console.error('Tag name must be provided')
      return ''
    }
    const attributes = node.attributes ? Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : ''
    const openTag = node.tagName === 'React.Fragment' ? '<>' : `<${node.tagName} ${attributes}>`
    const closeTag = node.tagName === 'React.Fragment' ? '</>' : `</${node.tagName}>`
    const childrenJSX = node.children.map(child => generateNodeJSX(child, indent + '  ')).join('\n')
    return `${indent}${openTag}
${childrenJSX || (node.text ? `${indent}  ${node.text}` : '')}
${indent}${closeTag}`
  }

  const generateReactCode = useMemo(() => {
    if (nodeTree.length === 0) {
      return `import React from 'react'

export const ${componentName} = () => {
  return null
}
`
    }

    const jsxContent = nodeTree.map(node => generateNodeJSX(node, '    ')).join('\n')
    return `import React from 'react'

export const ${componentName} = () => {
  return (
${jsxContent}
  )
}
`
  }, [componentName, nodeTree])

  const generateHtmlCode = (nodeTree: TreeNode[]): string => {
    const jsxContent = nodeTree.map(node => {
      const nodeJsx = generateNodeJSX(node);
      // Replace React fragments with a single div
      return nodeJsx.replace(/<>\s*|\s*<\/>/g, '').replace(/<\/>\s*|\s*<\/>/g, '');
    }).join('\n');

    // Replace className with class
    const htmlContent = jsxContent.replace(/className=/g, 'class=');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }

  useEffect(() => {
    setReactCode(generateReactCode)
    setHtmlCode(generateHtmlCode(nodeTree))
    setCurrentReactCode(generateReactCode)
    setCurrentHtmlCode(generateHtmlCode(nodeTree))
  }, [generateReactCode, nodeTree, setCurrentReactCode, setCurrentHtmlCode])

  const parseJSXToNodeTree = (jsxElement: any): TreeNode => {
    const node: TreeNode = {
      id: uuidv4(),
      name: jsxElement.openingElement.name.name,
      tagName: jsxElement.openingElement.name.name,
      children: [],
      attributes: {}
    }

    jsxElement.openingElement.attributes.forEach((attr: any) => {
      if (attr.type === 'JSXAttribute') {
        if (attr.value.type === 'StringLiteral') {
          node.attributes![attr.name.name] = attr.value.value
        } else if (attr.value.type === 'JSXExpressionContainer') {
          node.attributes![attr.name.name] = generate(attr.value.expression).code
        }
      }
    })

    jsxElement.children.forEach((child: any) => {
      if (child.type === 'JSXElement') {
        node.children.push(parseJSXToNodeTree(child))
      } else if (child.type === 'JSXText' && child.value.trim()) {
        node.text = child.value.trim()
      }
    })

    return node
  }

  const handleReactCodeChange = (newCode: string | undefined, event: monaco.editor.IModelContentChangedEvent) => {
    if (newCode === undefined) return

    try {
      const ast = parse(newCode, {
        sourceType: 'module',
        plugins: ['jsx'],
      })

      let newNodeTree: TreeNode[] = []

      traverse(ast, {
        JSXElement(path) {
          if (path.parent.type !== 'ReturnStatement') {
            return
          }

          newNodeTree = [parseJSXToNodeTree(path.node)]
        },
      })

      updateNodeTree(() => newNodeTree)
      setReactCode(newCode)
      setCurrentReactCode(newCode)

      // Update HTML code
      const updatedHtmlCode = generateHtmlCode(newNodeTree)
      setHtmlCode(updatedHtmlCode)
      setCurrentHtmlCode(updatedHtmlCode)

      toast.success('Code updated successfully')
    } catch (error) {
      console.error('Error parsing code:', error)
      toast.error('Invalid code. Please check your syntax.')
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  const handleNodeMove = useCallback((nodeId: string, newParentId: string, index: number) => {
    updateNodeTree(prevTree => {
      const moveNodes = (nodes: TreeNode[]): [TreeNode[], TreeNode[]] => {
        const movedNodes: TreeNode[] = []
        const remainingNodes = nodes.filter(node => {
          if (node.id === nodeId) {
            movedNodes.push(node)
            return false
          }
          if (node.children.length > 0) {
            const [moved, remaining] = moveNodes(node.children)
            movedNodes.push(...moved)
            node.children = remaining
          }
          return true
        })
        return [movedNodes, remainingNodes]
      }

      const [movedNodes, updatedTree] = moveNodes(prevTree)

      const insertNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === newParentId) {
            return { ...node, children: [...node.children.slice(0, index), ...movedNodes, ...node.children.slice(index)] }
          } else if (node.children.length > 0) {
            return { ...node, children: insertNodes(node.children) }
          }
          return node
        })
      }

      return insertNodes(updatedTree)
    })
  }, [updateNodeTree])

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
    <DndProvider backend={HTML5Backend}>
      <Tabs 
        defaultValue="preview" 
        className="w-full h-full flex flex-col"
        onValueChange={(value) => onTabChange(value as 'preview' | 'react-code' | 'html-code' | 'tree')}
      >
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="react-code">React Code</TabsTrigger>
          <TabsTrigger value="html-code">HTML Code</TabsTrigger>
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
            {nodeTree.map(node => (
              <DraggableElement key={node.id} node={node} onNodeMove={handleNodeMove} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="react-code" className="flex-grow overflow-hidden">
          <div className="h-full relative">
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              defaultValue={reactCode}
              onChange={handleReactCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(reactCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="html-code" className="flex-grow overflow-hidden">
          <div className="h-full relative">
            <MonacoEditor
              height="100%"
              defaultLanguage="html"
              defaultValue={htmlCode}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly: true,
                automaticLayout: true,
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(htmlCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="tree" className="flex-grow overflow-auto">
          <NodeTree />
        </TabsContent>
      </Tabs>
    </DndProvider>
  )
}