import { getAncestorIdList } from "../../utils/tree"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useEditorStore } from "../../store/store"

export function FileBreadcrumb() {
  const nodes = useEditorStore((state) => state.nodes);
  const activeFileId = useEditorStore((state) => state.activeFileId);

  const ancestorIdList = 
    activeFileId ? 
      getAncestorIdList(nodes, activeFileId) :
      [];

  ancestorIdList.shift();

  const ancestorList = ancestorIdList.map((id) => ({
    name: nodes[id].name,
    id,
  }));

  const getAncestorElement = (ancestor: { name: string, id: string }, index: number) => (
    <>
      <BreadcrumbItem>
        {ancestor.name}
      </BreadcrumbItem>
      {index !== ancestorList.length - 1 && <BreadcrumbSeparator />}
    </>
  )

  return (
    <Breadcrumb className="h-8 flex items-center px-3 bg-[#1e1e1e] border-b border-white/[0.06] text-[11px]">
      <BreadcrumbList className="text-muted-foreground/50">
        {ancestorList.map(getAncestorElement)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}