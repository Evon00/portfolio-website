import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { SlashMenu, type SlashMenuHandle } from "./slash-menu";
import { filterSlashItems, type SlashItem } from "./slash-items";

// "/"로 여는 블록 추가 메뉴. 줄 맨 앞에서만 열리고, 고르면 입력한 "/검색어"를 지우고 블록을 넣는다.
export function createSlashCommand(items: SlashItem[]) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem, SlashItem>({
          editor: this.editor,
          char: "/",
          startOfLine: true,
          items: ({ query }) => filterSlashItems(items, query),
          command: ({ editor, range, props }) => {
            editor.chain().focus().deleteRange(range).run();
            props.run(editor);
          },
          render: () => {
            let renderer: ReactRenderer<SlashMenuHandle> | null = null;
            const place = (rect: DOMRect | null | undefined) => {
              if (!renderer || !rect) return;
              Object.assign(renderer.element.style, {
                position: "fixed",
                left: `${rect.left}px`,
                top: `${rect.bottom + 6}px`,
                zIndex: "60",
              });
            };
            return {
              onStart: (props) => {
                renderer = new ReactRenderer(SlashMenu, { editor: props.editor, props });
                document.body.appendChild(renderer.element);
                place(props.clientRect?.());
              },
              onUpdate: (props) => {
                renderer?.updateProps(props);
                place(props.clientRect?.());
              },
              onKeyDown: ({ event }) => {
                if (event.key === "Escape") {
                  renderer?.destroy();
                  renderer?.element.remove();
                  renderer = null;
                  return true;
                }
                return renderer?.ref?.onKeyDown(event) ?? false;
              },
              onExit: () => {
                renderer?.destroy();
                renderer?.element.remove();
                renderer = null;
              },
            };
          },
        }),
      ];
    },
  });
}
