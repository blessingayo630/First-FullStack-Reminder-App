# TODO

## 1. Fix React warning in HomePage.tsx
- [ ] Remove `useEffect(() => { setCurrentPath(window.location.pathname); }, [])` pattern.
- [ ] Replace `currentPath` state with an initialization that does not require an effect.
- [ ] Ensure 404/not-found conditional still works.

## 2. Verify build/lint
- [ ] Run `npm run lint` (or `npm run build` if lint fails).

