import "react";

/**
 * `<ViewTransition>` ships in the React canary that Next's App Router bundles
 * (verified: `exports.ViewTransition` exists in next/dist/compiled/react),
 * but the stable @types/react this repo pins doesn't declare it yet. Typed
 * here after the React reference; drop this file once @types/react catches up.
 */
declare module "react" {
  type ViewTransitionClass = "none" | "auto" | (string & {});

  type ViewTransitionClassPerType = Record<
    string,
    ViewTransitionClass | undefined
  > & {
    default?: ViewTransitionClass;
  };

  interface ViewTransitionProps {
    children?: ReactNode;
    /** Shared identity across pages; "auto" lets React assign one. */
    name?: "auto" | (string & {});
    default?: ViewTransitionClass | ViewTransitionClassPerType;
    enter?: ViewTransitionClass | ViewTransitionClassPerType;
    exit?: ViewTransitionClass | ViewTransitionClassPerType;
    share?: ViewTransitionClass | ViewTransitionClassPerType;
    update?: ViewTransitionClass | ViewTransitionClassPerType;
    onEnter?: (instance: unknown, types: string[]) => void;
    onExit?: (instance: unknown, types: string[]) => void;
    onShare?: (instance: unknown, types: string[]) => void;
    onUpdate?: (instance: unknown, types: string[]) => void;
  }

  export function ViewTransition(props: ViewTransitionProps): ReactNode;
}
