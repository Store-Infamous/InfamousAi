import React from 'react';
import { useStore, PLANS, isAdmin } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Star, Gem, X, Link, Save } from 'lucide-react';

export default function PlansPage() {
  const { currentUser, qrModalPlanId, setQrModalPlanId, qrLink, setQRLink } = useStore();
  if (!currentUser) return null;

  const canAdmin = isAdmin(currentUser);
  const selectedPlan = PLANS.find(p => p.id === qrModalPlanId);

  return (
    <div className="p-6 md:p-8 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Choose Your Plan</h1>
        <p className="text-sm text-gray-500 mb-8">Unlock more power with higher tiers</p>

        {/* QR Link Admin Setting */}
        {canAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-emerald-500/5 border border-purple-500/20"
          >
            <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Link size={14} /> QR Payment Link Settings (Admin Only)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Set a payment link — this QR code will be shown to ALL users when they click upgrade on any plan.</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={qrLink}
                onChange={e => setQRLink(e.target.value)}
                placeholder="https://your-payment-link.com/pay"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setQRLink(qrLink)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
              >
                <Save size={14} /> Save
              </motion.button>
            </div>
            {qrLink && (
              <div className="mt-4 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl">
                  <QRCodeSVG value={qrLink} size={80} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">QR Preview — shown to users on upgrade</p>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{qrLink}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => {
            const isCurrent = currentUser.plan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`relative rounded-2xl p-6 bg-white/[0.03] border transition-all duration-300 overflow-hidden group ${
                  isCurrent
                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10'
                }`}
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-purple-500/20 transition-all" />

                {isCurrent && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Current
                  </span>
                )}
                {plan.popular && !isCurrent && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                    Popular
                  </span>
                )}

                <div className="text-3xl mb-3">{plan.icon}</div>
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.msgs} messages/day</p>
                <div className="mb-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    ₹{plan.inr}
                  </span>
                  <span className="text-sm text-gray-500">/mo</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">~${plan.usd}/mo</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <Check size={12} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={isCurrent ? {} : { scale: 1.02 }}
                  whileTap={isCurrent ? {} : { scale: 0.98 }}
                  disabled={isCurrent}
                  onClick={() => setQrModalPlanId(plan.id)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-white/5 text-emerald-400 cursor-default border border-emerald-500/20'
                      : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30'
                  }`}
                >
                  {isCurrent ? '✓ Current Plan' : 'Select Plan'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* QR Modal */}
      <AnimatePresence>
        {qrModalPlanId && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            onClick={() => setQrModalPlanId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#12121a] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center relative"
            >
              <button
                onClick={() => setQrModalPlanId(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={16} />
              </button>

              <div className="text-3xl mb-3">{selectedPlan.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">Upgrade to {selectedPlan.name}</h3>
              <p className="text-sm text-gray-400 mb-6">
                Pay <span className="text-white font-semibold">₹{selectedPlan.inr}</span> (~${selectedPlan.usd}/mo) to upgrade
              </p>

              {qrLink ? (
                <div className="flex flex-col items-center">
                  <div className="p-5 bg-white rounded-2xl mb-4 shadow-xl">
                    <QRCodeSVG value={qrLink} size={200} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Scan this QR code to pay</p>
                  <p className="text-[11px] text-gray-500 truncate max-w-xs">{qrLink}</p>
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto mb-4 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Gem size={24} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">QR Code<br />Coming Soon</p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-500 mb-5">
                After payment, your plan will be activated manually by admin.
              </p>

              <button
                onClick={() => setQrModalPlanId(null)}
                className="px-6 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
