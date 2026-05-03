# Bug Investigation: Synchronous setState in useEffect

## Bug Summary
The application is reporting an error: `Calling setState synchronously within an effect can trigger cascading renders` at `app/page.tsx:46:5`. This is occurring because `fetchReminders()` is called directly inside a `useEffect` hook.

## Root Cause Analysis
The issue is likely caused by a strict lint rule or a React 19 compiler check (`react-hooks/set-state-in-effect`) that flags direct calls to functions containing `setState` within a `useEffect` body. 

Even though `fetchReminders` is an `async` function and its `setState` calls happen after an `await`, the initial call to `fetchReminders()` in the effect body is synchronous. If the environment (or the compiler's static analysis) perceives this as a synchronous path to `setState`, it triggers the warning.

Specifically, in React 19, there is a stronger push to avoid `useEffect` for data fetching or to ensure that state updates are properly managed to avoid "cascading renders" (renders triggered during the commit phase of another render).

## Affected Components
- `app/page.tsx`: The `Home` component's `useEffect` hook that initiates the data fetching.

## Proposed Solution
To resolve this and follow best practices for React 19 / Next.js 16:
1. **Option A: Use a mounted flag and define the fetcher inside the effect.** This ensures the `setState` calls are clearly separated and only happen if the component is still mounted.
2. **Option B: Wrap the call in `setTimeout(..., 0)` or `requestAnimationFrame`.** This explicitly pushes the state updates to the next tick, avoiding any synchronous cascading render issues.
3. **Option C: Use a "load" function that handles the promise properly.**

The most robust approach for React 19 is to use a pattern that ensures the state update is not part of the initial effect execution task.

I will implement a solution that uses a local `mounted` flag to prevent state updates on unmounted components and ensures the fetch is handled in a way that satisfies the new stricter requirements.

## Proposed Code Change
```tsx
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await fetch('/api/reminders');
        const data = await response.json();
        if (isMounted) {
          setReminders(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []); // Only run on mount
```
Wait, I should still keep `fetchReminders` for other uses (like after delete/add), but I can use this pattern in `useEffect`. Or better, just make `fetchReminders` check for a mounted ref.
