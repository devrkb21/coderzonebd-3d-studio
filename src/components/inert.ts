/** React 18 has no typed `inert` prop; this keeps closed panels out of the tab order. */
export const inertUnless = (open: boolean) => (open ? {} : ({ inert: '' } as Record<string, string>))
