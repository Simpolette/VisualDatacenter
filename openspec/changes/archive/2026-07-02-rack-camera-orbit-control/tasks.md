## 1. 3D Camera Controls Update

- [x] 1.1 Update `mouseConfig` in `RoomScene3D.tsx` to enable left-click orbit rotation (`left: 1`) when `selectedRack` is active, while keeping panning disabled (`middle: 0, right: 0`) and scroll zoom enabled (`wheel: 16`).
- [x] 1.2 Verify that clicking a rack smoothly animates to focus on the rack center and allows 360-degree mouse drag rotation without panning away.
- [x] 1.3 Verify production build with `npm run build`.
