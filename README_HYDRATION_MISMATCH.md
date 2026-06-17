# Hydration mismatch warning: `data-gr-ext-installed`

## What’s happening
React/Next logs a hydration mismatch when the **server-rendered HTML** differs from what the **client** expects during hydration.

In the warning you provided, the only differing attribute is:

- `data-gr-ext-installed=""` on the `<body>` element

This attribute is commonly injected by browser extensions (e.g., Grammarly or other “assist” extensions) before React hydrates.

## Best mitigation (recommended)
- Disable the responsible extension and reload.
- Use an incognito/private window with only essential extensions.

This avoids DOM mutation before hydration, eliminating the warning.

## Code mitigation (fallback)
If you still want to reduce the warning even with extensions enabled, you can add React’s:
- `suppressHydrationWarning` on the `<body>` element

Note: this suppresses the warning but does not “fix” the underlying DOM mutation.

