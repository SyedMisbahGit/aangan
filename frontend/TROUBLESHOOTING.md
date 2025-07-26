# TROUBLESHOOTING

## React 'Invalid hook call' Error

If you see an error like:

```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

### Common Causes & Fixes

1. **Multiple React Versions**
   - Run `npm ls react` and `npm ls react-dom` in the `frontend` directory.
   - You should see only one version of each, and they should match.
   - If you see more than one, delete `node_modules` and `package-lock.json`, then run `npm install`.

2. **Running Dev Server from Wrong Directory**
   - Always run `npm run dev` from the `frontend` directory, not the project root.
   - Example:
     ```sh
     cd frontend
     npm run dev
     ```

3. **Symlinked or Linked Packages**
   - If you use `npm link` or have local packages, ensure they do not bring in their own copy of React.

4. **Breaking the Rules of Hooks**
   - Hooks must only be called inside function components or custom hooks.
   - Check the code around the error for any hooks used outside of components.

5. **Mismatched React and React DOM Versions**
   - Both should be the same version (e.g., `19.1.0`).
   - Update your `package.json` if needed and reinstall.

### Best Practices
- Only one version of React and React DOM should be installed.
- Do not install React as a dependency in multiple packages in a monorepo.
- If you see persistent errors, try a clean install:
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  ```

--- 