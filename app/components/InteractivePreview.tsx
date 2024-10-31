'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
  text?: string
}

interface DraggableNodeProps {
  node: TreeNode
  options: Record<string, Record<string, string>>
  onNodeMove: (nodeId: string, newParentId: string, index: number) => void
  isSelected: boolean
  onSelect: (nodeId: string, ctrlKey: boolean) => void
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ node, options, onNodeMove, isSelected, onSelect }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'NODE',
    item: { id: node.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'NODE',
    drop: (item: { id: string }, monitor) => {
      const didDrop = monitor.didDrop()
      if (didDrop) {
        return
      }
      onNodeMove(item.id, node.id, node.children.length)
    },
  })

  const nodeClasses = options[node.id] ? Object.values(options[node.id]).filter(Boolean).join(' ') : ''

  const NodeComponent = node.tagName as keyof JSX.IntrinsicElements

  // Combine drag and drop refs
  const ref = useMemo(() => {
    return (element: HTMLDivElement | null) => {
      drag(element)
      drop(element)
    }
  }, [drag, drop])

  return (
    <div
      ref={ref}
      className={`border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'} ${isDragging ? 'opacity-50' : ''}`}
      onClick={(e) => onSelect(node.id, e.ctrlKey)}
    >
      <NodeComponent id={node.id} className={nodeClasses}>
        {node.children.length > 0 ? (
          node.children.map((child) => (
            <DraggableNode
              key={child.id}
              node={child}
              options={options}
              onNodeMove={onNodeMove}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          ))
        ) : (
          node.text || `${node.name} content`
        )}
      </NodeComponent>
    </div>
  )
}

interface InteractivePreviewProps {
  nodeTree: TreeNode[]
  options: Record<string, Record<string, string>>
  onNodeMove: (nodeId: string, newParentId: string, index: number) => void
}

export const InteractivePreview: React.FC<InteractivePreviewProps> = ({ nodeTree, options, onNodeMove }) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const previewRef = useRef<HTMLDivElement>(null)

  const handleSelect = (nodeId: string, ctrlKey: boolean) => {
    if (ctrlKey) {
      setSelectedNodes((prev) => 
        prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
      )
    } else {
      setSelectedNodes([nodeId])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNodes([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={previewRef} className="relative min-h-[500px] border border-gray-300 p-4">
        {nodeTree.map((node) => (
          <DraggableNode
            key={node.id}
            node={node}
            options={options}
            onNodeMove={onNodeMove}
            isSelected={selectedNodes.includes(node.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </DndProvider>
  )
}