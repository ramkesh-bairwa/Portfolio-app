import { query } from '@/lib/db';
import { formatPrice } from '@/lib/price';

export const dynamic = 'force-dynamic';

const STATUS = {
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  created: 'bg-line text-mute',
};

export default async function PaymentsPage() {
  const rows = await query(
    `SELECT p.*, u.name, u.email, u.phone FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.id DESC LIMIT 300`
  );
  const paid = rows.filter((r) => r.status === 'paid');
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Payments</h1>
      <p className="mt-1 text-mute">Razorpay payments for plans. “Started” means the user opened checkout but did not finish.</p>
      <p className="mt-4 text-sm"><span className="font-semibold">{paid.length}</span> paid of {rows.length} shown</p>
      {!rows.length ? (
        <p className="card mt-4 p-6 text-sm text-mute">No payments yet. Add Razorpay keys in Settings, then buy a plan from the Plans page.</p>
      ) : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-mute">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Razorpay IDs</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.name || 'No name'}<div className="text-xs text-mute">{r.email || r.phone}</div></td>
                  <td className="px-4 py-3">{r.plan_name}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(r.amount / 100, r.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${STATUS[r.status]}`}>{r.status === 'created' ? 'started' : r.status}</span>
                    {!!r.is_test && <span className="chip ml-1 bg-sun/25 text-ink">test</span>}
                    {r.error && <div className="mt-1 max-w-[220px] text-xs text-red-600">{r.error}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-mute">{r.order_id}<div>{r.payment_id || '—'}</div></td>
                  <td className="px-4 py-3 text-xs text-mute">{r.paid_at || r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
