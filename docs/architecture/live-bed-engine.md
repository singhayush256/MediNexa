# MediNexa Live Bed Management Engine Architecture

## 1. Controlled Bed Lifecycle State Machine

```
AVAILABLE
  ├──> RESERVED (via POST /beds/:id/reserve)
  ├──> OCCUPIED (via POST /beds/:id/assign - direct assignment)
  └──> MAINTENANCE (via POST /beds/:id/maintenance)

RESERVED
  ├──> OCCUPIED (via POST /beds/:id/assign - converts reservation)
  └──> AVAILABLE (via POST /beds/:id/cancel-reservation or expiration)

OCCUPIED
  └──> CLEANING (via POST /beds/:id/release)

CLEANING
  └──> AVAILABLE (via POST /beds/:id/clean)

MAINTENANCE
  ├──> AVAILABLE (via POST /beds/:id/maintenance/complete)
  └──> OUT_OF_SERVICE (via POST /beds/:id/maintenance)

OUT_OF_SERVICE
  └──> MAINTENANCE (via POST /beds/:id/maintenance)
```

---

## 2. Concurrency Control & Atomic Transactions

To prevent double-booking when two users simultaneously reserve or assign the same bed:

1. **Interactive Transactions**: All multi-step updates are wrapped in `prisma.$transaction`.
2. **Atomic Conditional Updates**:
```typescript
const updated = await tx.bed.updateMany({
  where: { id: bedId, status: expectedPreviousStatus },
  data: { status: targetNewStatus },
});
if (updated.count === 0) {
  throw new ConflictException("Bed status modified concurrently"); // 409 Conflict
}
```
3. **Guaranteed Outcome**: In concurrent race conditions, exactly 1 request receives `200/201 Success` and the competing request receives `409 Conflict`.

---

## 3. Realtime Updates

- WebSocket Gateway (`BedGateway`) emitting `bed.status.changed` events on namespace `/events`.
- Events are scoped by `facilityId` to prevent cross-hospital data leakage.
