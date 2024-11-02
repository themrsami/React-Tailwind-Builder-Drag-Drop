'use client'

import React, { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, Plus, Edit2, Move, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useSectionBuilder } from '../context/SectionBuilderContext'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
  text?: string
}

interface NodeProps {
  node: TreeNode
  level: number
  onAddChild: (parentId: string | null, childTagName: string) => void
  onRenameNode: (nodeId: string, newName: string, newTagName: string, newText?: string) => void
  onDeleteNode: (nodeId: string) => void
  selectedNodes: string[]
  onSelectNode: (nodeId: string, isCtrlPressed: boolean) => void
  onMoveNodes: (targetNodeId: string) => void
}

const Node: React.FC<NodeProps> = ({ 
  node, 
  level, 
  onAddChild, 
  onRenameNode, 
  onDeleteNode,
  selectedNodes, 
  onSelectNode, 
  onMoveNodes 
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(node.name)
  const [renameTagName, setRenameTagName] = useState(node.tagName)
  const [renameText, setRenameText] = useState(node.text || '')

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const startRenaming = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
  }

  const submitRename = () => {
    if (renameName.trim() && renameTagName.trim()) {
      onRenameNode(node.id, renameName.trim(), renameTagName.trim(), renameText.trim() || undefined)
      setIsRenaming(false)
    }
  }

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectNode(node.id, e.ctrlKey)
  }

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMoveNodes(node.id)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
      onDeleteNode(node.id)
  }

  return (
    <div style={{ marginLeft: `${level * 20}px`, position: 'relative' }} className="relative">
      <div 
        className={`flex items-center p-2 cursor-pointer ${selectedNodes.includes(node.id) ? 'bg-blue-100' : ''}`}
        onClick={handleNodeClick}
      >
        {node.children.length > 0 && (
          <Button variant="ghost" size="icon" onClick={toggleExpand}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        )}
        {node.tagName !== 'React.Fragment' && (
          <Checkbox
            checked={selectedNodes.includes(node.id)}
            onCheckedChange={() => onSelectNode(node.id, true)}
            className="mr-2"
          />
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
            <Input
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="mr-2 w-24"
              placeholder="Text (optional)"
              onBlur={submitRename}
              onKeyPress={(e) => e.key === 'Enter' && submitRename()}
            />
          </>
        ) : (
          <>
            <span className="mr-2">{node.name}</span>
            <span className="text-gray-500 mr-2">{`<${node.tagName}>`}</span>
            {node.text && <span className="text-gray-400 mr-2">{`"${node.text}"`}</span>}
            <Button variant="ghost" size="icon" onClick={startRenaming}>
              <Edit2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleMoveClick}>
              <Move size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDeleteClick}>
              <Trash2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onAddChild(node.id, 'div')}>
              <Plus size={16} />
            </Button>
          </>
        )}
      </div>
      {isExpanded && node.children.map(child => (
        <Node 
          key={child.id} 
          node={child} 
          level={level + 1} 
          onAddChild={onAddChild} 
          onRenameNode={onRenameNode}
          onDeleteNode={onDeleteNode}
          selectedNodes={selectedNodes}
          onSelectNode={onSelectNode}
          onMoveNodes={onMoveNodes}
        />
      ))}
    </div>
  )
}

export const NodeTree: React.FC = () => {
  const { nodeTree, updateNodeTree, renameNode, selectedNodes, setSelectedNodes } = useSectionBuilder()

  const handleAddChild = useCallback((parentId: string | null, childTagName: string) => {
    const newNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New ${childTagName}`,
      tagName: childTagName,
      children: [],
    }
    updateNodeTree(prevTree => {
      if (prevTree.length === 0) {
        return [
          {
            id: 'fragment',
            name: 'Fragment',
            tagName: 'React.Fragment',
            children: [newNode]
          }
        ]
      }
      const addChildToNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return { ...node, children: [...node.children, newNode] }
          } else if (node.children.length > 0) {
            return { ...node, children: addChildToNode(node.children) }
          }
          return node
        })
      }
      return addChildToNode(prevTree)
    })
  }, [updateNodeTree])

  const handleRenameNode = useCallback((nodeId: string, newName: string, newTagName: string, newText?: string) => {
    renameNode(nodeId, newName, newTagName, newText)
  }, [renameNode])

  const handleDeleteNode = useCallback((nodeId: string) => {
    updateNodeTree(prevTree => {
      const deleteNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.filter(node => {
          if (node.id === nodeId) {
            return false
          }
          if (node.children.length > 0) {
            node.children = deleteNode(node.children)
          }
          return true
        })
      }
      return deleteNode(prevTree)
    })
  }, [updateNodeTree])

  const handleSelectNode = useCallback((nodeId: string, isCtrlPressed: boolean) => {
    setSelectedNodes(prev => {
      if (isCtrlPressed) {
        return prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
      } else {
        return [nodeId]
      }
    })
  }, [setSelectedNodes])

  const handleMoveNodes = useCallback((targetNodeId: string) => {
    updateNodeTree(prevTree => {
      const moveNodes = (nodes: TreeNode[]): [TreeNode[], TreeNode[]] => {
        const movedNodes: TreeNode[] = []
        const remainingNodes = nodes.filter(node => {
          if (selectedNodes.includes(node.id) && node.id !== targetNodeId) {
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
          if (node.id === targetNodeId) {
            return { ...node, children: [...node.children, ...movedNodes] }
          } else if (node.children.length > 0) {
            return { ...node, children: insertNodes(node.children) }
          }
          return node
        })
      }

      const finalTree = insertNodes(updatedTree)
      setSelectedNodes([])
      return finalTree
    })
  }, [updateNodeTree, selectedNodes, setSelectedNodes])

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Node Tree</h2>
      {nodeTree.length === 0 ? (
        <Button
          variant="outline"
          onClick={() => handleAddChild(null, 'div')}
          className="mt-4"
        >
          Add Root Element
        </Button>
      ) : (
        nodeTree.map(node => (
          <Node 
            key={node.id} 
            node={node} 
            level={0} 
            onAddChild={handleAddChild} 
            onRenameNode={handleRenameNode}
            onDeleteNode={handleDeleteNode}
            selectedNodes={selectedNodes}
            onSelectNode={handleSelectNode}
            onMoveNodes={handleMoveNodes}
          />
        ))
      )}
    </div>
  )
}