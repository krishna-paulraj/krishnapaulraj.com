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
          <h3 className="font-mono text-base font-semibold tracking-tight text-foreground">
            {entry.name}
          </h3>
          {entry.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {entry.description}
            </p>
          )}
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Prop</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map((p) => (
                  <tr key={p.name} className="border-t border-border align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">
                      {p.name}
                      {p.required && (
                        <span className="ml-0.5 text-destructive">*</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
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
