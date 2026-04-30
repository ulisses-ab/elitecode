import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PiBracketsCurlyLight } from "react-icons/pi";
import { SelectLanguage } from "./../NavbarMenu/SelectLanguage";

export function EmptyTemplate() {
  return (
    <div className="w-full h-full flex">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PiBracketsCurlyLight />
          </EmptyMedia>
          <EmptyTitle>Select a language</EmptyTitle>
          <EmptyDescription>
            Choose a language to configure your workspace environment and start coding.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-3">
            <SelectLanguage />
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}