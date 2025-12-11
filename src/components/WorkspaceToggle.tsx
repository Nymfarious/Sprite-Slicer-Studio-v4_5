interface WorkspaceToggleProps {
  splicingMatContent: React.ReactNode;
  mendingLoomContent: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function WorkspaceToggle({ splicingMatContent, mendingLoomContent, activeTab = 'splicing' }: WorkspaceToggleProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {activeTab === 'splicing' && splicingMatContent}
      {activeTab === 'mending' && mendingLoomContent}
    </div>
  );
}
