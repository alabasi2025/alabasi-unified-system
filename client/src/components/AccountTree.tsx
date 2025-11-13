import { useState } from "react";
import { ChevronDown, ChevronRight, FolderTree, FileText, Edit, Plus } from "lucide-react";
import { Button } from "./ui/button";
import type { ChartOfAccount } from "../../../drizzle/schema";

interface AccountTreeProps {
  accounts: ChartOfAccount[];
  onEdit?: (account: ChartOfAccount) => void;
  onAddChild?: (parentAccount: ChartOfAccount) => void;
}

interface TreeNode {
  account: ChartOfAccount;
  children: TreeNode[];
}

export function AccountTree({ accounts, onEdit, onAddChild }: AccountTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Build tree structure
  const buildTree = (accounts: ChartOfAccount[]): TreeNode[] => {
    const accountMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create nodes
    accounts.forEach((account) => {
      accountMap.set(account.id, { account, children: [] });
    });

    // Build hierarchy
    accounts.forEach((account) => {
      const node = accountMap.get(account.id)!;
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const tree = buildTree(accounts);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getCategoryColor = (categoryId: number | null) => {
    const colors: Record<number, string> = {
      1: "text-blue-600 bg-blue-50", // أصول
      2: "text-red-600 bg-red-50", // خصوم
      3: "text-purple-600 bg-purple-50", // حقوق ملكية
      4: "text-green-600 bg-green-50", // إيرادات
      5: "text-orange-600 bg-orange-50", // مصروفات
    };
    return categoryId ? colors[categoryId] || "text-gray-600 bg-gray-50" : "text-gray-600 bg-gray-50";
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const { account, children } = node;
    const isExpanded = expandedIds.has(account.id);
    const hasChildren = children.length > 0 || account.isParent;
    const colorClass = getCategoryColor(account.categoryId);

    return (
      <div key={account.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent transition-colors group`}
          style={{ paddingRight: `${level * 1.5 + 0.75}rem` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => hasChildren && toggleExpand(account.id)}
            className={`flex-shrink-0 ${hasChildren ? "cursor-pointer" : "invisible"}`}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            )}
          </button>

          {/* Icon */}
          <div className={`p-1.5 rounded ${colorClass}`}>
            {account.isParent ? (
              <FolderTree className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{account.code}</span>
              <span className="font-medium truncate">{account.nameAr}</span>
              {!account.isActive && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  معطل
                </span>
              )}
            </div>
            {account.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {account.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {account.isParent && onAddChild && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAddChild(account)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(account)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && children.length > 0 && (
          <div className="mt-1">
            {children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>لا توجد حسابات في الدليل</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map((node) => renderNode(node))}
    </div>
  );
}
