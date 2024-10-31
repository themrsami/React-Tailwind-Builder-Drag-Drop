'use client'

import { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, Plus, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSectionBuilder } from '../context/SectionBuilderContext'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
}

interface NodeProps {
  node: TreeNode
  level: number
  onAddChild: (parentId: string, childName: string, childTagName: string) => void
  onRenameNode: (nodeId: string, newName: string, newTagName: string) => void
}

const Node: React.FC<NodeProps> = ({ node, level, onAddChild, onRenameNode }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeTagName, setNewNodeTagName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(node.name)
  const [renameTagName, setRenameTagName] = useState(node.tagName)
  const { selectedNodeId, setSelectedNodeId } = useSectionBuilder()

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const selectNode = () => {
    setSelectedNodeId(node.id)
  }

  const addChild = () => {
    if (newNodeName.trim() && newNodeTagName.trim()) {
      onAddChild(node.id, newNodeName.trim(), newNodeTagName.trim())
      setNewNodeName('')
      setNewNodeTagName('')
    }
  }

  const startRenaming = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
  }

  const submitRename = () => {
    if (renameName.trim() && renameTagName.trim()) {
      onRenameNode(node.id, renameName.trim(), renameTagName.trim())
      setIsRenaming(false)
    }
  }

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div 
        className={`flex items-center p-2 cursor-pointer ${selectedNodeId === node.id ? 'bg-blue-100' : ''}`}
        onClick={selectNode}
      >
        {node.children.length > 0 && (
          <Button variant="ghost" size="icon" onClick={toggleExpand}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        )}
        {isRenaming ? (
          <>
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              className="mr-2 w-24"
              onBlur={submitRename}
              onKeyPress={(e) => e.key === 'Enter' && submitRename()}
            />
            <Input
              value={renameTagName}
              onChange={(e) => setRenameTagName(e.target.value)}
              className="mr-2 w-24"
              onBlur={submitRename}
              onKeyPress={(e) => e.key === 'Enter' && submitRename()}
            />
          </>
        ) : (
          <>
            <span className="mr-2">{node.name}</span>
            <span className="text-gray-500 mr-2">{`<${node.tagName}>`}</span>
            <Button variant="ghost" size="icon" onClick={startRenaming}>
              <Edit2 size={16} />
            </Button>
          </>
        )}
      </div>
      {isExpanded && node.children.map(child => (
        <Node key={child.id} node={child} level={level + 1} onAddChild={onAddChild} onRenameNode={onRenameNode} />
      ))}
      {selectedNodeId === node.id && (
        <div className="flex items-center mt-2">
          <Input
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="New node name"
            className="mr-2"
          />
          <Input
            value={newNodeTagName}
            onChange={(e) => setNewNodeTagName(e.target.value)}
            placeholder="New tag name"
            className="mr-2"
          />
          <Button onClick={addChild} size="icon">
            <Plus size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}

export const NodeTree: React.FC = () => {
  const { nodeTree, updateNodeTree, renameNode } = useSectionBuilder()

  const handleAddChild = useCallback((parentId: string, childName: string, childTagName: string) => {
    const newNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: childName,
      tagName: childTagName,
      children: []
    }
    updateNodeTree(parentId, newNode)
  }, [updateNodeTree])

  const handleRenameNode = useCallback((nodeId: string, newName: string, newTagName: string) => {
    renameNode(nodeId, newName, newTagName)
  }, [renameNode])

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Node Tree</h2>
      {nodeTree.map(node => (
        <Node key={node.id} node={node} level={0} onAddChild={handleAddChild} onRenameNode={handleRenameNode} />
      ))}
    </div>
  )
}