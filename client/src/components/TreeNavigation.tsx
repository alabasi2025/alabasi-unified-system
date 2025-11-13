import { useState } from "react";
import { ChevronDown, ChevronRight, Building2, Briefcase } from "lucide-react";
import { useLocation } from "wouter";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

interface TreeNavigationProps {
  unitName: string;
  unitId?: number;
  organizations: {
    id: number;
    name: string;
    menuItems: MenuItem[];
  }[];
  onItemSelect?: (item: { type: 'unit' | 'organization' | 'menu'; id: string | number; name: string; data?: any }) => void;
  defaultExpanded?: boolean;
}

export function TreeNavigation({ unitName, unitId, organizations, onItemSelect, defaultExpanded = false }: TreeNavigationProps) {
  const [, setLocation] = useLocation();
  const [isUnitExpanded, setIsUnitExpanded] = useState(defaultExpanded);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string>('');

  const toggleUnit = () => {
    setIsUnitExpanded(!isUnitExpanded);
  };

  const toggleOrg = (orgId: number) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const handleUnitClick = () => {
    toggleUnit();
    setSelectedItem('unit');
    onItemSelect?.({
      type: 'unit',
      id: unitId || 'unit',
      name: unitName,
    });
  };

  const handleOrgClick = (org: { id: number; name: string }) => {
    const itemId = `org-${org.id}`;
    setSelectedItem(itemId);
    toggleOrg(org.id);
    onItemSelect?.({
      type: 'organization',
      id: org.id,
      name: org.name,
      data: org,
    });
  };

  const handleMenuClick = (item: MenuItem, orgId: number, orgName: string) => {
    const itemId = `menu-${orgId}-${item.id}`;
    setSelectedItem(itemId);
    
    onItemSelect?.({
      type: 'menu',
      id: item.id,
      name: item.label,
      data: { ...item, orgId, orgName },
    });
  };

  return (
    <div className="w-full mb-2">
      {/* Unit Header - Collapsible */}
      <button
        onClick={handleUnitClick}
        className={`w-full px-3 py-2.5 rounded-lg transition-colors ${
          selectedItem === 'unit'
            ? 'bg-green-100 text-green-900'
            : 'bg-green-50 hover:bg-green-100 text-green-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {isUnitExpanded ? (
            <ChevronDown className="h-4 w-4 text-green-700 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-green-700 flex-shrink-0" />
          )}
          <Building2 className="h-4 w-4 text-green-700 flex-shrink-0" />
          <span className="font-semibold text-sm flex-1 text-right">{unitName}</span>
        </div>
      </button>

      {/* Organizations Tree (shown when unit is expanded) */}
      {isUnitExpanded && (
        <div className="mt-1 pr-4 space-y-1">
          {organizations.map((org) => {
            const isExpanded = expandedOrgs.has(org.id);
            const orgItemId = `org-${org.id}`;
            const isOrgSelected = selectedItem === orgItemId;
            
            return (
              <div key={org.id}>
                {/* Organization Header */}
                <button
                  onClick={() => handleOrgClick(org)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-right ${
                    isOrgSelected
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                  )}
                  <Briefcase className={`h-3.5 w-3.5 flex-shrink-0 ${isOrgSelected ? 'text-blue-700' : 'text-blue-600'}`} />
                  <span className={`text-sm flex-1 ${isOrgSelected ? 'font-semibold' : ''}`}>
                    {org.name}
                  </span>
                </button>

                {/* Menu Items (shown when organization is expanded) */}
                {isExpanded && (
                  <div className="pr-6 mt-1 space-y-0.5">
                    {org.menuItems.map((item) => {
                      const menuItemId = `menu-${org.id}-${item.id}`;
                      const isMenuSelected = selectedItem === menuItemId;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item, org.id, org.name)}
                          className={`w-full px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all text-right ${
                            isMenuSelected
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'hover:bg-accent text-muted-foreground'
                          }`}
                        >
                          {item.icon && (
                            <span className="flex-shrink-0 text-xs">{item.icon}</span>
                          )}
                          <span className="text-xs flex-1">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
