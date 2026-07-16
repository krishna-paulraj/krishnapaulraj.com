export type ApiProp = {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
};

export type ApiEntry = {
  name: string;
  description?: string;
  props: ApiProp[];
};

export function ApiReference({ entries }: { entries: ApiEntry[] }) {
  return (
    <div className="space-y-8">
      {entries.map((entry) => (
        <div key={entry.name}>
          <h3 className="text-foreground font-mono text-base font-semibold tracking-tight">
            {entry.name}
          </h3>
          {entry.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {entry.description}
            </p>
          )}
          <div className="border-border mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Prop</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map((p) => (
                  <tr key={p.name} className="border-border border-t align-top">
                    <td className="text-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {p.name}
                      {p.required && (
                        <span className="text-destructive ml-0.5">*</span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {p.type}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {p.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
